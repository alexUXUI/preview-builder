import { useYoForm } from "./form.context";

interface RemoteVersionInputProps {
  remoteName: string;
}

export const RemoteVersionInput = ({ remoteName }: RemoteVersionInputProps) => {
  const { formState, updateRemoteVersion, handleFieldFocus, handleFieldBlur } =
    useYoForm();
  const field = formState.remoteVersions[remoteName];

  return (
    <div className="remote-version-input">
      <input
        type="text"
        value={field?.value || ""}
        onChange={(e) =>
          updateRemoteVersion(remoteName, e.target.value || null)
        }
        onFocus={() => handleFieldFocus(remoteName)}
        onBlur={() => handleFieldBlur(remoteName)}
        placeholder="0.0.0-0"
        className={`version-input ${
          !field?.isValid && !field?.isFocusing ? "has-error" : ""
        }`}
      />
      {!field?.isValid && !field?.isFocusing && (
        <div className="error-message">{field?.error}</div>
      )}
    </div>
  );
};
