import { camelToKebabCase } from "../graph/graph";
import { useOverridesForm } from "./form.context";
import "./RemotesForm.css";

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

  const field = formState.remoteVersions[camelToKebabCase(remoteName)] || {
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
          updateRemoteVersion(
            camelToKebabCase(remoteName),
            e.target.value || null
          )
        }
        onFocus={() => handleFieldFocus(camelToKebabCase(remoteName))}
        onBlur={() => handleFieldBlur(camelToKebabCase(remoteName))}
        placeholder="1.0.0"
        className={`version-input ${field.isFocusing ? "is-focused" : ""} ${
          !field.isValid && field.isTouched && !field.isFocusing
            ? "is-invalid"
            : ""
        } ${
          field.isValid && field.isDirty && !field.isFocusing ? "is-valid" : ""
        }`}
      />
      {!field.isValid && field.isTouched && !field.isFocusing && (
        <div className="error-message">{field.error}</div>
      )}
    </div>
  );
};
