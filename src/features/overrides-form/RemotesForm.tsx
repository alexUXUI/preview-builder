import { useState } from "react";
import { useYoForm } from "./form.context";
import { RemoteVersionInput } from "./RemoteVersionInput";
import { TooltipWrapper } from "../tooltip/tooltip";
import "./RemotesForm.css";
import { camelToKebabCase } from "../graph/graph";

export const RemotesForm = () => {
  const { hostGroups, formState } = useYoForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if there are any invalid fields
  const hasInvalidFields = Object.values(formState.remoteVersions).some(
    (field) => !field.isValid
  );

  // Check if there are any changes
  const hasChanges = Object.values(formState.remoteVersions).some(
    (field) => field.isDirty
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasInvalidFields || !hasChanges) {
      return;
    }

    setIsSubmitting(true);

    // Apply changes by reloading the page
    // The values are already stored in localStorage when field is blurred
    window.location.reload();
  };

  // Handle cancel or reset
  const handleReset = () => {
    if (confirm("Are you sure you want to reset all changes?")) {
      localStorage.removeItem("hawaii_mfe_overrides");
      window.location.reload();
    }
  };

  if (hostGroups.length === 0) {
    return <p>No MFE remotes detected in this application.</p>;
  }

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <form onSubmit={handleSubmit} className="remotes-form">
      <div>
        {hostGroups.map((group) => (
          <div key={group.manifestName} className="host-group">
            <div className="host-group-header">
              <div className="host-title">
                <h4>{capitalizeFirstLetter(group.name)}</h4>
                <TooltipWrapper
                  tooltip={`This is the ${group.manifestName} host application running version ${group.version}. It loads the micro-frontend components listed below.`}
                />
              </div>
              <div className="host-group-info">
                <span className="host-version">v{group.version}</span>
              </div>
            </div>
            <table className="remotes-table">
              <thead>
                <tr>
                  <th>Remote</th>
                  <th>Version</th>
                </tr>
              </thead>
              {group.remotes.length > 0 ? (
                <tbody>
                  {group.remotes.map((remote) => {
                    if (remote.name === "preview-builder") return null;
                    if (remote.name === "shell") return null;

                    // Get field state for this remote
                    const field = formState.remoteVersions[remote.name];
                    const isFocusing = field?.isFocusing || false;
                    const isInvalid = field?.isTouched && !field?.isValid;
                    const isDirty = field?.isDirty || false;

                    return (
                      <tr
                        key={remote.name}
                        className={`
                          ${isFocusing ? "focusing" : ""}
                          ${isInvalid ? "invalid" : ""}
                          ${isDirty ? "modified" : ""}
                        `}
                      >
                        <td>
                          <label
                            htmlFor={remote.name}
                            className={
                              isFocusing
                                ? "focusing-label remote-label"
                                : "remote-label"
                            }
                          >
                            {capitalizeFirstLetter(
                              camelToKebabCase(remote.name)
                            )}
                          </label>
                        </td>
                        <td>
                          <RemoteVersionInput remoteName={remote.name} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : null}
            </table>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className={`
            apply-button 
            ${hasInvalidFields ? "invalid" : ""}
            ${!hasChanges ? "no-changes" : ""}
            ${isSubmitting ? "submitting" : ""}
            ${hasChanges && !hasInvalidFields && !isSubmitting ? "ready" : ""}
          `}
          disabled={hasInvalidFields || !hasChanges || isSubmitting}
        >
          {isSubmitting ? "Applying..." : "Apply Changes"}
        </button>

        <button
          type="button"
          className="reset-button"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset All
        </button>
      </div>
    </form>
  );
};
