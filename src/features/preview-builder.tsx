import { useState } from "react";
import { Panel } from "./panel/panel";
import { TabContent } from "./tabs/tabs.comoponent";
import { PanelButton } from "./panel/button";
import { PanelHeader } from "./panel/header";
import { SelectionProvider } from "./selection/selection.context";

import "./preview-builder.css";

export const PreviewBuilder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overrides");

  const handleClose = () => setIsOpen(false);
  const togglePanel = () => setIsOpen(!isOpen);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (!isOpen) {
      setIsOpen(true); // Open panel if closed when selection happens
    }
  };
  return (
    <div className="mfe-overrides-container">
      <SelectionProvider activeTab={activeTab} onTabChange={handleTabChange}>
        <PanelButton onClick={togglePanel} />
        <Panel handleClose={handleClose} isOpen={isOpen}>
          <PanelHeader
            handleClose={handleClose}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <hr />
          <TabContent activeTab={activeTab} />
        </Panel>
      </SelectionProvider>
    </div>
  );
};
