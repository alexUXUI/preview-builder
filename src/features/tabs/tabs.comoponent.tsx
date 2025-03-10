import { FormIndex } from "../form";
import DependencyGraph from "../graph/graph.component";
import "./tabs.css";

export const TabContent = ({ activeTab }: { activeTab: string }) => {
    switch (activeTab) {
        case "form":
            return <FormIndex />;
        case "graph":
            return <DependencyGraph />;
        default:
            return <FormIndex />;
    }
};

export const Tabs = ({
    activeTab,
    setActiveTab
}: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) => {
    return (
        <div className="tab-container neomorphic">
            <div className="radio-group">
                <input
                    type="radio"
                    id="form-tab"
                    name="tab"
                    value="form"
                    checked={activeTab === "form"}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="radio-input"
                />
                <label
                    htmlFor="form-tab"
                    className={`radio-label ${activeTab === "form" ? "active" : ""}`}
                >
                    Form
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