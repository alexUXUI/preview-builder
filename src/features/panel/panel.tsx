import { useRef } from "react";
import { usePanelInteractions } from "./panel.hook";
import { useUI } from "../ui/ui.context";
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
  const { getPanelWidth } = useUI();

  return (
    <div
      className={`mfe-overrides-panel ${isOpen ? "open" : "closed"}`}
      ref={panelRef}
      style={{ width: getPanelWidth() }}
    >
      <div className="panel-content">{children}</div>
    </div>
  );
};
