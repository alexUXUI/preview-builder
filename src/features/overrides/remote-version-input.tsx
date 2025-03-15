import { OverrideBadge } from "./override-badge";

interface RemoteVersionInputProps {
  remoteName: string;
  version: string;
  onClear: (remoteName: string, e: React.MouseEvent) => void;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string, value: string) => void;
  error?: string;
}

export const RemoteVersionInput = ({
  remoteName,
  version,
  onClear,
  onChange,
  onBlur,
  error,
}: RemoteVersionInputProps) => {
  return (
    <div className="override-item">
      <div className="override-item__container">
        <label
          htmlFor={`version-${remoteName}`}
          className="override-name override-item__label"
        >
          {remoteName}
          <OverrideBadge remoteName={remoteName} onClear={onClear} />
        </label>
        <input
          id={`version-${remoteName}`}
          type="text"
          value={version}
          onChange={(e) => onChange(remoteName, e.target.value)}
          onBlur={(e) => onBlur(remoteName, e.target.value)}
          placeholder="1.0.0 or 1.2.3-preview"
          className={`version-input ${error ? "has-error" : ""}`}
          aria-invalid={!!error}
        />
      </div>
      <div className={`error-message ${error ? "error-message--visible" : ""}`}>
        {error}
      </div>
    </div>
  );
};
