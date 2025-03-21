import { camelToKebabCase } from "../../graph/layout";
import { useOverridesForm } from "../context/form.context";
// import "../form/RemotesForm.css";
// import "./input.css";

interface RemoteVersionInputProps {
  remoteName: string;
  id?: string;
}

export const RemoteVersionInput = ({
  remoteName,
  id,
}: RemoteVersionInputProps) => {
  const { formState, updateRemoteVersion, handleFieldFocus, handleFieldBlur } =
    useOverridesForm();

  const remoteManifestName = camelToKebabCase(remoteName);

  const field = formState.remoteVersions[remoteManifestName] || {
    value: "",
    isValid: true,
    isFocusing: false,
    isDirty: false,
    isTouched: false,
    error: undefined,
  };

  return (
    <div className="remote-version-input">
      <input
        id={id || remoteName}
        type="text"
        value={field.value || ""}
        onChange={(e) =>
          updateRemoteVersion(remoteManifestName, e.target.value || null)
        }
        onFocus={() => handleFieldFocus(remoteManifestName)}
        onBlur={() => handleFieldBlur(remoteManifestName)}
        placeholder="Enter version"
        className={`
          version-input 
          ${field.isFocusing ? "focused" : ""}
          ${field.isDirty ? "isDirty" : ""}
          ${field.isTouched ? "isTouched" : ""}
          ${!field.isValid && field.isTouched ? "invalid" : ""}
          ${field.error ? "error" : ""}
          ${field?.isDirty && field?.isValid ? "valid" : ""}
        `}
      />

      {
        // only show the reset button if there is an initial value
        field.value && field?.initialValue ? (
          <button
            type="button"
            className="clear-button"
            aria-label="Clear input"
            onClick={() => {
              updateRemoteVersion(remoteManifestName, null);
            }}
          >
            X
          </button>
        ) : null
      }
      {
        // only show the reset button if there is an initial value
        !field.isValid && field.isTouched && !field.isFocusing ? (
          <button
            type="button"
            className="clear-button"
            aria-label="Clear input"
            onClick={() => {
              updateRemoteVersion(remoteManifestName, null);
            }}
          >
            X
          </button>
        ) : null
      }
    </div>
  );
};
