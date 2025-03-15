import type React from "react";
import { useYoForm } from "./form.context";
import type { MFERemote, MFEOptions } from "./form.types";

export const OverridesForm: React.FC = () => {
  const { hostGroups, formState, updateRemoteVersion } = useYoForm();
  return (
    <div>
      SIIICK
      {hostGroups.map((hostGroup) => (
        <div key={hostGroup.name}>
          <h3>{hostGroup.name}</h3>
          <ul>
            {hostGroup.remotes.map((remote) => {
              const fieldState = formState.remoteVersions[remote.name];
              return (
                <li key={remote.name}>
                  <label htmlFor={remote.name}>{remote.name}</label>
                  <input
                    type="text"
                    id={remote.name}
                    name={remote.name}
                    value={fieldState?.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value || null;
                      updateRemoteVersion(remote.name, value);
                    }}
                    className={!fieldState?.isValid ? "invalid" : ""}
                  />
                  {fieldState?.isDirty && (
                    <span className="dirty-indicator">*</span>
                  )}
                  {!fieldState?.isValid && (
                    <div className="error-message">
                      Please enter a valid version (e.g., 1.0.0)
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
