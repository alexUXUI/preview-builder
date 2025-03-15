import { useRef, useEffect } from "react";
import { TooltipWrapper } from "../tooltip/tooltip";
import { Tabs } from "../tabs/tabs.comoponent";
import { useContext } from "react";
import { FormContext } from "../overrides/form.context";
import "./panel.css";

export const Panel = ({
  children,
  handleClose,
  isOpen,
}: {
  children: React.ReactNode;
  handleClose: () => void;
  isOpen: boolean;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <div
      className={`mfe-overrides-panel ${isOpen ? "open" : ""}`}
      ref={panelRef}
    >
      <button
        className="close-button"
        onClick={handleClose}
        aria-label="Close MFE Overrides Panel"
        type="button"
      >
        ×
      </button>
      <div className="mfe-overrides-form">{children}</div>
    </div>
  );
};

export const PanelButton = ({ onClick }: { onClick: () => void }) => {
  const formContext = useContext(FormContext);
  const activeOverrides =
    formContext?.overrides.filter((override) => override.version)?.length || 0;

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

export const PanelHeader = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div className="panel-header">
      <div className="panel-header__title-container">
        <h1 className="panel-header__title">Preview Builder</h1>
        <TooltipWrapper tooltip="Compose an environment with specific versions of micro-frontend components. Use it to preview and test different MFE versions before they are deployed to production." />
      </div>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
