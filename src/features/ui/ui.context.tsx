import type React from "react";
import { createContext, useContext, useState, type ReactNode } from "react";

interface UIContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  getPanelWidth: () => string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("graph");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
  };

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  // Return different width based on active tab
  const getPanelWidth = () => {
    switch (activeTab) {
      case "graph":
        return "850px"; // Wider for the graph view
      case "overrides":
        return "500px"; // Standard width for forms
      default:
        return "500px";
    }
  };

  return (
    <UIContext.Provider
      value={{
        activeTab,
        setActiveTab: handleTabChange,
        isPanelOpen,
        openPanel,
        closePanel,
        togglePanel,
        getPanelWidth,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
