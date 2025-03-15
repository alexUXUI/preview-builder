import { Tabs } from "../tabs/tabs.comoponent";
import { TooltipWrapper } from "../tooltip/tooltip";

export const PanelHeader = ({
  activeTab,
  setActiveTab,
  handleClose,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleClose: () => void;
}) => {
  return (
    <div className="panel-header">
      <div className="panel-header__title-container">
        <h1 className="panel-header__title">Preview Builder</h1>
        <TooltipWrapper tooltip="Compose an environment with specific versions of micro-frontend components. Use it to preview and test different MFE versions before they are deployed to production." />
      </div>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <button
        className="close-button"
        onClick={handleClose}
        aria-label="Close MFE Overrides Panel"
        type="button"
      >
        ×
      </button>
    </div>
  );
};
