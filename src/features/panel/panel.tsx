import { useRef, useEffect } from "react";
import { TooltipWrapper } from "../tooltip/tooltip";
import "./panel.css";
import { Tabs } from "../tabs/tabs.comoponent";

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
  return (
    <button
      className="toggle-button"
      onClick={onClick}
      aria-label="Toggle MFE Overrides Panel"
      type="button"
    >
      Preview
    </button>
  )
};

export const PanelHeader = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex' }}>
        <h3>Preview Builder</h3>
        <TooltipWrapper tooltip="This tool allows you to compose an environment with specific versions of micro-frontend components. Use it to preview and test different MFE versions before they are deployed to production." />
      </div>
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  )
};
