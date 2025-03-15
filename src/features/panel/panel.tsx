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
      <div className="mfe-overrides-form">{children}</div>
    </div>
  );
};
