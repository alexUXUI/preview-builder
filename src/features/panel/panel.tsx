import { useRef } from "react";
import { usePanelInteractions } from "./panel.hook";
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
  usePanelInteractions(panelRef, handleClose, isOpen);
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
