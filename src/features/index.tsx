import { useCallback, useState } from "react";
import { Panel, PanelButton, PanelHeader } from "./panel/panel";
import { Tabs, TabContent } from "./tabs/tabs.comoponent";
import "./index.css";


export const PreviewBuilder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <div className="mfe-overrides-container">
      <PanelButton onClick={togglePanel} />
      <Panel handleClose={handleClose} isOpen={isOpen}>
        <PanelHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <hr />
        <TabContent activeTab={activeTab} />
      </Panel>
    </div>
  );
};

