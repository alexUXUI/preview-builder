import { useState, useEffect } from "react";
import { OverrideBadge } from "../override-badge";

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
  const [localValue, setLocalValue] = useState(version);

  useEffect(() => {
    setLocalValue(version);
  }, [version]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(remoteName, newValue);
  };
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
          value={localValue}
          onChange={handleChange}
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
