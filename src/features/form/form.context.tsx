import { createContext, useCallback, useEffect, useState } from 'react';

export interface MFEOverride {
    name: string;
    version: string;
}

interface FormContextType {
    overrides: MFEOverride[];
    setOverrides: React.Dispatch<React.SetStateAction<MFEOverride[]>>;
    inputErrors: Record<string, string>;
    setInputErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    validateSemver: (version: string) => boolean;
    handleAddMFE: () => void;
    handleDetectMFEs: () => void;
}

const semverPattern = "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(-[\\w.-]+)?(\\+[\\w.-]+)?";

const extractVersionFromEntry = (entry: string): string => {
    const matches = entry.match(/\/(\d+\.\d+\.\d+(?:-[^\/]+)?)\//);
    return matches?.[1] || "";
};

export const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [overrides, setOverrides] = useState<MFEOverride[]>([]);
    const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

    const validateSemver = useCallback((version: string): boolean => {
        if (!version) return true;
        const regex = new RegExp(`^${semverPattern}$`);
        return regex.test(version);
    }, []);

    const initializeFromFederation = useCallback(() => {
        if (window.__FEDERATION__?.__INSTANCES__?.length) {
            const allRemotes = window.__FEDERATION__.__INSTANCES__
                .reduce((acc, instance) => {
                    if (instance?.options?.remotes) {
                        acc.push(...instance.options.remotes);
                    }
                    return acc;
                }, [] as Array<{
                    name: string;
                    entry: string;
                    shareScope: string;
                    type: string;
                }>);

            if (allRemotes.length > 0) {
                const newOverrides = allRemotes.map((remote: any) => ({
                    name: remote.name,
                    version: extractVersionFromEntry(remote.entry),
                }));

                setOverrides(newOverrides);
                console.log(
                    "Initialized MFE overrides from all __FEDERATION__ instances:",
                    newOverrides
                );
                return true;
            }
        }
        return false;
    }, []);

    const handleAddMFE = useCallback(() => {
        const newMFEName = prompt("Enter the name of the MFE:");
        if (newMFEName && !overrides.some((o) => o.name === newMFEName)) {
            setOverrides([...overrides, { name: newMFEName, version: "" }]);
        }
    }, [overrides]);

    const handleDetectMFEs = useCallback(() => {
        const initialized = initializeFromFederation();
        if (!initialized) {
            alert("No MFEs detected in the current application.");
        }
    }, [initializeFromFederation]);

    useEffect(() => {
        const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";

        if (storedOverrides) {
            const parsedOverrides = storedOverrides
                .split(",")
                .filter(Boolean)
                .map((override) => {
                    const [name, version] = override.split("_");
                    return { name, version };
                });
            setOverrides(parsedOverrides);
        } else {
            initializeFromFederation();
        }
    }, [initializeFromFederation]);

    const value = {
        overrides,
        setOverrides,
        inputErrors,
        setInputErrors,
        validateSemver,
        handleAddMFE,
        handleDetectMFEs,
    };

    return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};