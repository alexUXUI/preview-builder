import { isOverrideExists, removeOverride } from "./override-storage";

interface OverrideBadgeProps {
  remoteName: string;
  onClear: (remoteName: string, e: React.MouseEvent) => void;
}

export const OverrideBadge = ({ remoteName, onClear }: OverrideBadgeProps) => {
  const isOverridden = isOverrideExists(remoteName);

  if (!isOverridden) {
    return null;
  }

  return (
    <span className="override-badge">
      overridden
      <button
        type="button"
        onClick={(e) => onClear(remoteName, e)}
        className="override-badge__clear-button"
        aria-label={`Clear override for ${remoteName}`}
      >
        ×
      </button>
    </span>
  );
};
