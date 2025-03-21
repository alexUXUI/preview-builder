import { Panel } from "./panel/panel";
import { TabContent } from "./tabs/tabs.comoponent";
import { PanelButton } from "./panel/button";
import { PanelHeader } from "./panel/header";
import { SelectionProvider } from "./selection/selection.context";
import { UIProvider, useUI } from "./ui/ui.context";

import "./preview-builder.css";

// Inner component that consumes the UI context
const PreviewBuilderContent = () => {
  const { activeTab, setActiveTab, isPanelOpen, togglePanel, closePanel } =
    useUI();

  return (
    <SelectionProvider activeTab={activeTab} onTabChange={setActiveTab}>
      <PanelButton onClick={togglePanel} />
      <Panel handleClose={closePanel} isOpen={isPanelOpen}>
        <PanelHeader
          handleClose={closePanel}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabContent activeTab={activeTab} />
      </Panel>
    </SelectionProvider>
  );
};

// Root component that provides the UI context
export const PreviewBuilder = () => {
  return (
    <div className="mfe-overrides-container">
      <UIProvider>
        <PreviewBuilderContent />
      </UIProvider>
    </div>
  );
};
