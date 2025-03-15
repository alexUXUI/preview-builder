import { useRef } from "react";
import "./form.css";
import { useForm } from "./form.hook";
import { TooltipWrapper } from "../tooltip/tooltip";
import { OverridesList } from "./overrides-list";

interface HostGroup {
  name: string;
  remotes: Array<{
    name: string;
    version: string;
  }>;
}

export const Form = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    overrides,
    setOverrides,
    inputErrors,
    setInputErrors,
    validateSemver,
    clearForm,
  } = useForm();

  const handleVersionChange = (name: string, newVersion: string) => {
    const updatedOverrides = overrides.map((override) =>
      override.name === name
        ? { ...override, version: newVersion, isDirty: true }
        : override
    );
    setOverrides(updatedOverrides);

    if (inputErrors[name]) {
      setInputErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleBlur = (name: string, version: string) => {
    if (version && !validateSemver(version)) {
      setInputErrors((prev) => ({
        ...prev,
        [name]:
          "Please enter a valid semantic version (e.g. 1.2.3 or 1.2.3-preview)",
      }));
    } else {
      setInputErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    // Only validate fields that have been modified (isDirty) and have a value
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    for (const override of overrides) {
      if (override.isDirty) {
        if (!override.version) {
          newErrors[override.name] = "Please enter a version number";
          hasErrors = true;
        } else if (!validateSemver(override.version)) {
          newErrors[override.name] =
            "Please enter a valid semantic version (e.g. 1.2.3 or 1.2.3-preview)";
          hasErrors = true;
        }
      }
    }

    setInputErrors(newErrors);

    if (!hasErrors) {
      // Save to localStorage only when applying valid changes
      const overridesString = overrides
        .map((override) => `${override.name}_${override.version}`)
        .join(",");
      localStorage.setItem("hawaii_mfe_overrides", overridesString);

      // Reset dirty flags after successful save
      const cleanOverrides = overrides.map((override) => ({
        ...override,
        isDirty: false,
      }));
      setOverrides(cleanOverrides);

      // No errors, proceed with applying changes
      window.location.reload();
    }
  };

  // Group overrides by host based on federation instances
  const getHostGroups = (): HostGroup[] => {
    const groups: HostGroup[] = [];

    if (window.__FEDERATION__?.__INSTANCES__) {
      // biome-ignore lint/complexity/noForEach: <explanation>
      window.__FEDERATION__.__INSTANCES__.forEach((instance) => {
        if (instance.options?.remotes?.length) {
          groups.push({
            name: instance.options.id,
            /* biome-ignore lint/suspicious/noExplicitAny: <explanation> */
            remotes: instance.options.remotes.map((remote: any) => ({
              name: remote.name,
              version:
                overrides.find((o) => o.name === remote.name)?.version || "",
              ...remote,
              instance: {
                ...instance,
              },
            })),
          });
        }
      });
    }

    return groups;
  };

  const hostGroups = getHostGroups();

  return (
    <form ref={formRef} onSubmit={handleApply} className="form">
      <div className="form-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "0 0 25px 0",
          }}
        >
          <h2 style={{ margin: "0 5px 0px 10px" }}>MFE Overrides~~~</h2>
          <TooltipWrapper tooltip="Use this form to override the versions of your MFEs." />
        </div>
        <OverridesList
          hostGroups={hostGroups}
          overrides={overrides}
          setOverrides={setOverrides}
          inputErrors={inputErrors}
          handleVersionChange={handleVersionChange}
          handleBlur={handleBlur}
        />
        <hr />
        <div style={{}}>
          <button type="submit" className="apply-button">
            Apply Overrides
          </button>
          <button
            type="button"
            className="apply-button clear"
            onClick={clearForm}
          >
            Clear Overrides
          </button>
        </div>
      </div>
    </form>
  );
};
