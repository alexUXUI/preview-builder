import { createContext, useContext, useEffect, useState } from "react";
import type { MFERemote, FederationHostRuntime } from "../types/form.types";
import type { MFEFormState, RemoteVersionField } from "../types/form.types";
import { camelToKebabCase } from "../../graph/graph";

interface OverridesFormContextType {
  hostGroups: FederationHostRuntime[];
  formState: MFEFormState;
  updateRemoteVersion: (remoteName: string, version: string | null) => void;
  clearRemoteVersion: (remoteName: string) => void;
  handleFieldFocus: (remoteName: string) => void;
  handleFieldBlur: (remoteName: string) => void;
  hasValidChanges: boolean;
  activeOverridesCount: number; // New count for active overrides
}

const OverridesFormContext = createContext<
  OverridesFormContextType | undefined
>(undefined);

// Improved semver validation to allow for preview versions
const validateSemver = (version: string | null): boolean => {
  if (version === null) return true;
  // Basic semver validation with optional prerelease tag
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version);
};

// Helper to count active valid overrides in localStorage
const countActiveOverrides = (remotes: Set<string>): number => {
  const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
  if (!storedOverrides) return 0;

  return storedOverrides
    .split(",")
    .filter(Boolean)
    .filter((override) => {
      const [name, version] = override.split("_");
      return name && version && remotes.has(name);
    }).length;
};

const getHostGroups = (): FederationHostRuntime[] => {
  const groups: FederationHostRuntime[] = [];
  if (window.__FEDERATION__?.__INSTANCES__?.length) {
    for (const instance of window.__FEDERATION__.__INSTANCES__) {
      const isHost = instance.options?.remotes?.length;
      if (isHost)
        groups.push({
          options: instance.options,
          name: instance.name,
          manifestName: instance.name,
          version: instance.version,
          moduleCache: instance.moduleCache,
          remotes: instance.options.remotes.map((remote: MFERemote) => ({
            ...remote,
            version: "",
          })),
          plugins: instance.options.plugins,
        });
    }
  }

  return groups;
};

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hostGroups] = useState<FederationHostRuntime[]>(getHostGroups());
  const [activeOverridesCount, setActiveOverridesCount] = useState(0);
  const [formState, setFormState] = useState<MFEFormState>(() => {
    const remoteVersions: Record<string, RemoteVersionField> = {};

    // Load initial values from localStorage
    const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";

    const initialOverrides = storedOverrides
      .split(",")
      .filter(Boolean)
      .reduce((acc, override) => {
        const [name, version] = override.split("_");
        if (name && version) {
          acc[camelToKebabCase(name)] = version;
        }
        return acc;
      }, {} as Record<string, string>);

    for (const group of hostGroups) {
      for (const remote of group.remotes) {
        const initialValue =
          initialOverrides[camelToKebabCase(remote.name)] || null;

        remoteVersions[camelToKebabCase(remote.name)] = {
          value: initialValue,
          initialValue,
          isTouched: false,
          isDirty: false,
          isValid: true,
          isFocusing: false,
          error: undefined,
        };
      }
    }

    return { remoteVersions };
  });

  // Update active overrides count whenever localStorage changes
  useEffect(() => {
    const remoteNames = new Set(Object.keys(formState.remoteVersions));

    setActiveOverridesCount(countActiveOverrides(remoteNames));

    const storageListener = () => {
      setActiveOverridesCount(countActiveOverrides(remoteNames));
    };

    window.addEventListener("storage", storageListener);
    return () => {
      window.removeEventListener("storage", storageListener);
    };
  }, [formState.remoteVersions]);

  // Handle when a field receives focus
  const handleFieldFocus = (remoteName: string) => {
    setFormState((prev) => ({
      ...prev,
      remoteVersions: {
        ...prev.remoteVersions,
        [remoteName]: {
          ...(prev.remoteVersions[remoteName] || {}),
          isFocusing: true,
          // Clear error while typing for better user experience
          error: undefined,
        },
      },
    }));
  };

  // Handle when a field loses focus - validate and persist if needed
  const handleFieldBlur = (remoteName: string) => {
    setFormState((prev) => {
      const field = prev.remoteVersions[remoteName] || {
        value: null,
        initialValue: null,
        isTouched: false,
        isDirty: false,
        isValid: true,
      };

      const value = field.value;
      const isValid = validateSemver(value);

      const updatedField = {
        ...field,
        isFocusing: false,
        isTouched: true,
        isValid,
        error: isValid ? undefined : (
          <div>
            Invalid version ❌
            <br />
            e.g. 1.2.3-preview
          </div>
        ),
      };

      // Persist to localStorage if valid
      if (updatedField.isDirty) {
        const storedOverrides =
          localStorage.getItem("hawaii_mfe_overrides") || "";
        const overridesList = storedOverrides.split(",").filter(Boolean);
        const updatedOverrides = overridesList
          .filter((override) => !override.startsWith(`${remoteName}_`))
          .filter(Boolean);

        if (value && isValid) {
          updatedOverrides.push(`${remoteName}_${value}`);
          localStorage.setItem(
            "hawaii_mfe_overrides",
            updatedOverrides.join(",")
          );
        } else if (!value || !isValid) {
          localStorage.setItem(
            "hawaii_mfe_overrides",
            updatedOverrides.join(",")
          );
        }
      }

      return {
        ...prev,
        remoteVersions: {
          ...prev.remoteVersions,
          [remoteName]: updatedField,
        },
      };
    });
  };

  const updateRemoteVersion = (remoteName: string, version: string | null) => {
    // If explicitly setting to null, use the dedicated clear method instead
    if (version === null) {
      return clearRemoteVersion(remoteName);
    }

    setFormState((prev: any) => {
      const field = prev.remoteVersions[remoteName] || {
        value: null,
        initialValue: null,
        isTouched: false,
        isDirty: false,
        isValid: true,
        isFocusing: false,
      };

      // Only validate if not currently focusing
      const shouldValidate = !field.isFocusing;
      const isValid = shouldValidate ? validateSemver(version) : true;

      return {
        ...prev,
        remoteVersions: {
          ...prev.remoteVersions,
          [remoteName]: {
            ...field,
            value: version,
            isDirty: version !== field.initialValue,
            isTouched: true,
            isValid: shouldValidate ? isValid : field.isValid,
            error:
              shouldValidate && !isValid ? (
                <div>
                  Invalid version
                  <br />
                  e.g. 1.2.3-preview
                </div>
              ) : field.isFocusing ? undefined : (
                field.error
              ),
          },
        },
      };
    });
  };

  const clearRemoteVersion = (remoteName: string) => {
    // updateRemoteVersion(remoteName, null);
    // First update the state
    setFormState((prev) => {
      const field = prev.remoteVersions[remoteName] || {
        value: null,
        initialValue: null,
        isTouched: false,
        isDirty: false,
        isValid: true,
        isFocusing: false,
      };

      return {
        ...prev,
        remoteVersions: {
          ...prev.remoteVersions,
          [remoteName]: {
            ...field,
            value: null,
            isDirty: null !== field.initialValue,
            isTouched: true,
            isValid: true,
            error: undefined,
          },
        },
      };
    });

    // Then immediately update localStorage
    const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
    const overridesList = storedOverrides.split(",").filter(Boolean);
    const updatedOverrides = overridesList
      .filter((override) => !override.startsWith(`${remoteName}_`))
      .filter(Boolean);

    localStorage.setItem("hawaii_mfe_overrides", updatedOverrides.join(","));

    // Update active overrides count
    const remoteNames = new Set(Object.keys(formState.remoteVersions));
    setActiveOverridesCount(countActiveOverrides(remoteNames));
  };

  // Calculate if there are valid changes to apply
  const hasValidChanges = Object.values(formState.remoteVersions).some(
    (field) => field.isDirty && field.isValid
  );

  const value = {
    hostGroups,
    formState,
    updateRemoteVersion,
    clearRemoteVersion,
    handleFieldFocus,
    handleFieldBlur,
    hasValidChanges,
    activeOverridesCount,
  };

  return (
    <OverridesFormContext.Provider value={value}>
      {children}
    </OverridesFormContext.Provider>
  );
};

export const useOverridesForm = () => {
  const context = useContext(OverridesFormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
