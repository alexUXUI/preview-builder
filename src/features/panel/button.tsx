import { useOverridesForm } from "../overrides-form/form.context";

export const PanelButton = ({ onClick }: { onClick: () => void }) => {
  const formContext = useOverridesForm();
  const activeOverrides = formContext.activeOverridesCount;

  return (
    <button
      className="toggle-button"
      onClick={onClick}
      aria-label="Toggle MFE Overrides Panel"
      type="button"
    >
      Preview
      {activeOverrides > 0 && (
        <span className="badge-counter">{activeOverrides}</span>
      )}
    </button>
  );
};
