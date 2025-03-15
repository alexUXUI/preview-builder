import { createContext, useContext, useState } from "react";
import type { MFERemote, FederationHostRuntime } from "./form.types";
import type { MFEFormState, RemoteVersionField } from "./form.types";
import { camelToKebabCase } from "../graph/graph";

interface YoFormContextType {
  hostGroups: FederationHostRuntime[];
  formState: MFEFormState;
  updateRemoteVersion: (remoteName: string, version: string | null) => void;
  clearRemoteVersion: (remoteName: string) => void;
  handleFieldFocus: (remoteName: string) => void;
  handleFieldBlur: (remoteName: string) => void;
  hasValidChanges: boolean;
}

const YoFormContext = createContext<YoFormContextType | undefined>(undefined);

// Improved semver validation to allow for preview versions
const validateSemver = (version: string | null): boolean => {
  if (version === null) return true;
  // Basic semver validation with optional prerelease tag
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version);
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

  const [formState, setFormState] = useState<MFEFormState>(() => {
    const remoteVersions: Record<string, RemoteVersionField> = {};

    // Load initial values from localStorage
    const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";

    const initialOverrides = storedOverrides
      .split(",")
      .filter(Boolean)
      .reduce((acc, override) => {
        console.log("override", override);
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
        error: isValid
          ? undefined
          : "Invalid version format (e.g. 1.2.3 or 1.2.3-preview)",
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
    setFormState((prev) => {
      const field = prev.remoteVersions[remoteName] || {
        value: null,
        initialValue: null,
        isTouched: false,
        isDirty: false,
        isValid: true,
        isFocusing: false,
      };

      // Only validate if not currently focusing or if clearing the field
      const shouldValidate = !field.isFocusing || version === null;
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
              shouldValidate && !isValid
                ? "Invalid version format (e.g. 1.2.3 or 1.2.3-preview)"
                : field.isFocusing
                ? undefined
                : field.error,
          },
        },
      };
    });
  };

  const clearRemoteVersion = (remoteName: string) => {
    updateRemoteVersion(remoteName, null);
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
  };

  return (
    <YoFormContext.Provider value={value}>{children}</YoFormContext.Provider>
  );
};

export const useYoForm = () => {
  const context = useContext(YoFormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
