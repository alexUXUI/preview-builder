import { useState } from "react";
import { useYoForm } from "./form.context";
import { RemoteVersionInput } from "./RemoteVersionInput";
import { TooltipWrapper } from "../tooltip/tooltip";
import "./RemotesForm.css";

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

  return (
    <form onSubmit={handleSubmit} className="remotes-form">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "0 0 15px 0",
        }}
      >
        <h2 style={{ margin: "0 2.5px 0px 10px" }}>MFE Overrides</h2>
        <TooltipWrapper tooltip="Use this form to override the versions of your MFEs." />
      </div>
      {hostGroups.map((group) => (
        <div key={group.name} className="host-group">
          <div className="host-group-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <h4
                style={{
                  margin: "0 2px 0 0",
                }}
              >
                {group.name}
              </h4>
              <TooltipWrapper
                tooltip={`This is the ${group.name} host application running version ${group.version}. It loads the micro-frontend components listed below.`}
              />
            </div>
            <div className="host-group-info">
              <span className="host-version">v{group.version}</span>
            </div>
          </div>

          {group.remotes.length > 0 ? (
            <div className="remotes-list">
              {group.remotes.map((remote) => {
                if (remote.name === "previewBuilder") return null;
                return (
                  <div key={remote.name} className="remote-item">
                    <div className="remote-info">
                      <label className="remote-label" htmlFor={remote.name}>
                        {remote.name}
                      </label>
                      <RemoteVersionInput remoteName={remote.name} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-remotes">No remote MFEs found for this host.</p>
          )}
        </div>
      ))}

      <div className="form-actions">
        <button
          type="submit"
          className={`apply-button ${
            hasInvalidFields || !hasChanges || isSubmitting ? "disabled" : ""
          }`}
          disabled={hasInvalidFields || !hasChanges || isSubmitting}
        >
          {isSubmitting ? "Applying..." : "Apply Changes"}
        </button>

        <button
          type="button"
          className="apply-button reset-button"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset All
        </button>
      </div>
    </form>
  );
};
