import { useRef } from "react";
import './form.css';
import { useForm } from './form.hook';
import { TooltipWrapper } from "../tooltip/tooltip";

interface HostGroup {
  name: string;
  remotes: Array<{
    name: string;
    version: string;
  }>;
}

export const Form = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { overrides, setOverrides, inputErrors, setInputErrors, validateSemver, clearForm } = useForm();

  const handleVersionChange = (name: string, newVersion: string) => {
    const updatedOverrides = overrides.map((override) =>
      override.name === name ? { ...override, version: newVersion, isDirty: true } : override
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
      const cleanOverrides = overrides.map(override => ({
        ...override,
        isDirty: false
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
      window.__FEDERATION__.__INSTANCES__.forEach(instance => {
        if (instance.options?.remotes?.length) {
          groups.push({
            name: instance.options.id,
            remotes: instance.options.remotes.map((remote: any) => ({
              name: remote.name,
              version: overrides.find(o => o.name === remote.name)?.version || "",
              ...remote,
              instance: {
                ...instance
              }
            }))
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
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 25px 0' }}>
          <h2 style={{ margin: '0 5px 0px 10px', }}>MFE Overrides</h2>
          <TooltipWrapper tooltip="Use this form to override the versions of your MFEs." />
        </div>
        <div className="overrides-list">
          {hostGroups.map((group) => {
            // console.log(group);
            return (
              <div key={group.name} className="host-group">
                <div style={{ width: '100%', display: 'flex', }}>
                  <h4 className="host-name">{group.name}</h4>
                </div>
                <div className="host-remotes">
                  {group.remotes.map((remote) => {
                    // console.log(remote);
                    return (
                      <div key={remote.name} className="override-item">
                        <div style={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          height: '50px',
                        }}>
                          <label
                            htmlFor={`version-${remote.name}`}
                            className="override-name"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              justifyContent: 'space-between'
                            }}
                          >
                            {remote.name}
                            {(() => {
                              const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
                              const isOverridden = storedOverrides
                                .split(",")
                                .filter(Boolean)
                                .some(override => {
                                  const [name, version] = override.split("_");
                                  return name === remote.name && version && version.length > 0;
                                });
                              return isOverridden ? (
                                <span
                                  style={{
                                    background: '#ff4757',
                                    color: 'white',
                                    padding: '2px 6px 2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px',
                                    margin: '0 10px 0 0'
                                  }}
                                >
                                  overridden
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const updatedOverrides = overrides.map(o =>
                                        o.name === remote.name ? { ...o, version: '', isDirty: true } : o
                                      );
                                      setOverrides(updatedOverrides);

                                      // Update localStorage
                                      const storageOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
                                      const filteredOverrides = storageOverrides
                                        .split(",")
                                        .filter(Boolean)
                                        .filter(override => {
                                          const [name] = override.split("_");
                                          return name !== remote.name;
                                        })
                                        .join(",");
                                      localStorage.setItem("hawaii_mfe_overrides", filteredOverrides);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'white',
                                      cursor: 'pointer',
                                      padding: '0',
                                      // marginLeft: '2px',
                                      fontSize: '12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    aria-label={`Clear override for ${remote.name}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null;
                            })()}
                          </label>
                          <input
                            id={`version-${remote.name}`}
                            type="text"
                            value={remote.version}
                            onChange={(e) =>
                              handleVersionChange(remote.name, e.target.value)
                            }
                            onBlur={(e) => handleBlur(remote.name, e.target.value)}
                            placeholder="1.0.0 or 1.2.3-preview"
                            className={`version-input ${inputErrors[remote.name] ? "has-error" : ""}`}
                            aria-invalid={!!inputErrors[remote.name]}
                          />
                        </div>
                        <div
                          className="error-message"
                          style={{
                            display: inputErrors[remote.name] ? "block" : "none",
                          }}
                        >
                          {inputErrors[remote.name]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <hr />
        <div
          style={{
          }}
        >
          <button type="submit" className="apply-button">
            Apply Overrides
          </button>
          <button type="button" className="apply-button clear" onClick={clearForm}>
            Clear Overrides
          </button>
        </div>

      </div>
    </form>
  );
};
