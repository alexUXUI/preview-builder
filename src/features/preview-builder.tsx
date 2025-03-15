import { useCallback, useState } from "react";
import { Panel } from "./panel/panel";
import { TabContent } from "./tabs/tabs.comoponent";
import { PanelButton } from "./panel/button";
import { PanelHeader } from "./panel/header";
import "./index.css";

export const PreviewBuilder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overrides");

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <div className="mfe-overrides-container">
      <PanelButton onClick={togglePanel} />
      <Panel handleClose={handleClose} isOpen={isOpen}>
        <PanelHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <hr />
        <TabContent activeTab={activeTab} />
      </Panel>
    </div>
  );
};
