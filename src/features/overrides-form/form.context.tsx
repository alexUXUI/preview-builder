import {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { MFERemote, FederationHostRuntime } from "./form.types";
import type { MFEFormState, RemoteVersionField } from "./form.types";

interface YoFormContextType {
  hostGroups: FederationHostRuntime[];
  formState: MFEFormState;
  updateRemoteVersion: (remoteName: string, version: string | null) => void;
  handleFieldFocus: (remoteName: string) => void;
  handleFieldBlur: (remoteName: string) => void;
}

const YoFormContext = createContext<YoFormContextType | undefined>(undefined);

// Validate semver format - more comprehensive than simple regex
const validateSemver = (version: string | null): boolean => {
  if (version === null) return true;
  // Basic semver validation: major.minor.patch[-prerelease][+build]
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(
    version
  );
};

// Helper to load initial values from localStorage
const getInitialVersions = (): Record<string, string | null> => {
  const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
  const initialValues: Record<string, string | null> = {};

  storedOverrides
    .split(",")
    .filter(Boolean)
    .forEach((override) => {
      const [name, version] = override.split("_");
      initialValues[name] = version || null;
    });

  return initialValues;
};

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getHostGroups = useCallback((): FederationHostRuntime[] => {
    const groups: FederationHostRuntime[] = [];
    if (window.__FEDERATION__?.__INSTANCES__?.length) {
      for (const instance of window.__FEDERATION__.__INSTANCES__) {
        const isPreviewBuilder = instance.name === "previewBuilder";
        if (!isPreviewBuilder)
          groups.push({
            options: instance.options,
            name: instance.name,
            version: instance.version,
            moduleCache: instance.moduleCache,
            remotes: instance.options.remotes,
            plugins: instance.options.plugins,
          });
      }
    }

    return groups;
  }, []);

  const [hostGroups, setHostGroups] = useState<FederationHostRuntime[]>(
    getHostGroups()
  );

  const [formState, setFormState] = useState<MFEFormState>(() => {
    const remoteVersions: Record<string, RemoteVersionField> = {};
    const initialVersions = getInitialVersions();

    for (const group of hostGroups) {
      for (const remote of group.remotes) {
        const initialValue = initialVersions[remote.name] || null;
        remoteVersions[remote.name] = {
          value: initialValue,
          initialValue,
          isTouched: false,
          isDirty: false,
          isValid: true,
          isFocusing: false,
        };
      }
    }

    return { remoteVersions };
  });

  // Handle input focus - sets isFocusing to true
  const handleFieldFocus = (remoteName: string) => {
    setFormState((prev) => ({
      ...prev,
      remoteVersions: {
        ...prev.remoteVersions,
        [remoteName]: {
          ...prev.remoteVersions[remoteName],
          isFocusing: true,
        },
      },
    }));
  };

  // Handle input blur - validates and persists if needed
  const handleFieldBlur = (remoteName: string) => {
    setFormState((prev) => {
      const field = prev.remoteVersions[remoteName];
      const value = field.value;
      const isValid = validateSemver(value);

      const newField = {
        ...field,
        isFocusing: false,
        isTouched: true,
        isValid,
        error: isValid
          ? undefined
          : "Invalid semantic version format (e.g. 1.2.3 or 1.2.3-preview)",
      };

      // Only persist to localStorage on blur if valid
      if (newField.isDirty) {
        const storedOverrides =
          localStorage.getItem("hawaii_mfe_overrides") || "";
        const overridesList = storedOverrides.split(",").filter(Boolean);
        const updatedOverrides = overridesList
          .filter((override) => !override.startsWith(`${remoteName}_`))
          .filter(Boolean);

        if (value && isValid) {
          updatedOverrides.push(`${remoteName}_${value}`);
        }

        localStorage.setItem(
          "hawaii_mfe_overrides",
          updatedOverrides.join(",")
        );
      }

      return {
        ...prev,
        remoteVersions: {
          ...prev.remoteVersions,
          [remoteName]: newField,
        },
      };
    });
  };

  const updateRemoteVersion = (remoteName: string, version: string | null) => {
    setFormState((prev) => {
      const currentField = prev.remoteVersions[remoteName];

      // Only validate if not currently focusing (typing)
      // or if clearing the field (version === null)
      const shouldValidate = !currentField.isFocusing || version === null;
      const isValid = shouldValidate ? validateSemver(version) : true;

      return {
        remoteVersions: {
          ...prev.remoteVersions,
          [remoteName]: {
            ...currentField,
            value: version,
            isDirty: version !== currentField.initialValue,
            isTouched: true,
            isValid: shouldValidate ? isValid : currentField.isValid,
            error:
              shouldValidate && !isValid
                ? "Invalid semantic version format (e.g. 1.2.3 or 1.2.3-preview)"
                : currentField.isFocusing
                ? undefined
                : currentField.error,
          },
        },
      };
    });
  };

  const value = {
    hostGroups,
    formState,
    updateRemoteVersion,
    handleFieldFocus,
    handleFieldBlur,
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
