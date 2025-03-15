import DependencyGraph from "../graph/graph.component";
import { RemotesForm } from "../overrides-form/RemotesForm";
import "./tabs.css";

export const TabContent = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "graph":
      return <DependencyGraph />;
    case "overrides":
      return <RemotesForm />;
    default:
      return <RemotesForm />;
  }
};

export const Tabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div className="tab-container neomorphic">
      <div className="radio-group">
        <input
          type="radio"
          id="overrides-tab"
          name="tab"
          value="overrides"
          checked={activeTab === "overrides"}
          onChange={(e) => setActiveTab(e.target.value)}
          className="radio-input"
        />
        <label
          htmlFor="overrides-tab"
          className={`radio-label ${activeTab === "overrides" ? "active" : ""}`}
        >
          Overrides
        </label>
        <input
          type="radio"
          id="graph-tab"
          name="tab"
          value="graph"
          checked={activeTab === "graph"}
          onChange={(e) => setActiveTab(e.target.value)}
          className="radio-input"
        />
        <label
          htmlFor="graph-tab"
          className={`radio-label ${activeTab === "graph" ? "active" : ""}`}
        >
          Graph
        </label>
      </div>
    </div>
  );
};
