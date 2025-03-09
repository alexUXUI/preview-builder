import { useRef } from "react";
import type { MFEOverride } from "./MFEOverridesForm";

export const Form = ({
  overrides,
  setOverrides,
  inputErrors,
  setInputErrors,
  validateSemver,
}: {
  overrides: MFEOverride[];
  setOverrides: React.Dispatch<React.SetStateAction<MFEOverride[]>>;
  inputErrors: Record<string, string>;
  setInputErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validateSemver: (version: string) => boolean;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleVersionChange = (name: string, newVersion: string) => {
    // Always update the UI state for user experience
    const updatedOverrides = overrides.map((override) =>
      override.name === name ? { ...override, version: newVersion } : override
    );
    setOverrides(updatedOverrides);

    // Clear errors when user is typing
    if (inputErrors[name]) {
      setInputErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Remove localStorage updates from here - we'll only save on Apply
  };

  const handleBlur = (name: string, version: string) => {
    // Validate on blur
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

    // Check for validation errors
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    for (const override of overrides) {
      if (!override.version) {
        // Empty value is now considered an error on submit
        newErrors[override.name] = "Please enter a version number";
        hasErrors = true;
      } else if (!validateSemver(override.version)) {
        newErrors[override.name] =
          "Please enter a valid semantic version (e.g. 1.2.3 or 1.2.3-preview)";
        hasErrors = true;
      }
    }

    setInputErrors(newErrors);

    if (!hasErrors) {
      // Save to localStorage only when applying valid changes
      const overridesString = overrides
        .map((override) => `${override.name}_${override.version}`)
        .join(",");
      localStorage.setItem("hawaii_mfe_overrides", overridesString);

      // No errors, proceed with applying changes
      window.location.reload();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleApply}>
      <div className="overrides-list">
        {overrides.map((override) => (
          <div key={override.name} className="override-item">
            <label
              htmlFor={`version-${override.name}`}
              className="override-name"
            >
              {override.name}
            </label>
            <input
              id={`version-${override.name}`}
              type="text"
              value={override.version}
              onChange={(e) =>
                handleVersionChange(override.name, e.target.value)
              }
              onBlur={(e) => handleBlur(override.name, e.target.value)}
              placeholder="1.0.0 or 1.2.3-preview"
              className={`version-input ${
                inputErrors[override.name] ? "has-error" : ""
              }`}
              aria-invalid={!!inputErrors[override.name]}
            />
            <div
              className="error-message"
              style={{
                display: inputErrors[override.name] ? "block" : "none",
              }}
            >
              {inputErrors[override.name]}
            </div>
          </div>
        ))}
        <button type="submit" className="apply-button">
          Apply Changes
        </button>
      </div>
    </form>
  );
};
