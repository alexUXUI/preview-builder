import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import { camelToKebabCase } from "../graph/graph";
import type { FederationInstance } from "../graph/types";

// Helper function to normalize remote names for consistent comparison
const normalizeRemoteName = (name: string): string => {
  return camelToKebabCase(name).toLowerCase();
};

// Add this function to search for nodes by name at any level in the graph
export const findNodeIdByRemoteName = (remoteName: string): string | null => {
  if (!window.__FEDERATION__?.__INSTANCES__?.length) {
    return null;
  }

  // Recursive function to search the tree
  const findInTree = (
    instance: FederationInstance,
    level = 0,
    visited = new Set<string>()
  ): string | null => {
    // Check if this node matches
    if (instance.name === remoteName) {
      return `node-${instance.name}-${level}`;
    }

    // Mark as visited to prevent circular references
    visited.add(instance.name);

    // Check all remotes
    if (instance.options?.remotes?.length) {
      for (const remote of instance.options.remotes) {
        // Skip already visited nodes
        if (visited.has(remote.name)) continue;

        // Check if this remote matches our target
        if (remote.name === remoteName) {
          return `node-${remote.name}-${level + 1}`;
        }

        // Find matching runtime node for this remote
        const matchingRuntime = window.__FEDERATION__.__INSTANCES__?.find(
          (inst) => inst.name === remote.name
        );

        // If we found a matching runtime, recursively search it
        if (matchingRuntime && !visited.has(matchingRuntime.name)) {
          const found = findInTree(
            matchingRuntime,
            level + 1,
            new Set(visited)
          );
          if (found) return found;
        }
      }
    }

    return null;
  };

  // Start searching from the root instance
  return findInTree(window.__FEDERATION__.__INSTANCES__[0]);
};
interface SelectionContextType {
  selectedNodeId: string | null;
  selectNode: (nodeId: string | null) => void;
  highlightedRemoteName: string | null;
  highlightRemote: (remoteName: string | null) => void;
  setActiveTab: (tab: string) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export const SelectionProvider: React.FC<{
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ children, activeTab, onTabChange }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedRemoteName, setHighlightedRemoteName] = useState<
    string | null
  >(null);

  const selectNode = (nodeId: string | null) => {
    console.log(`Selecting node: ${nodeId}`);
    setSelectedNodeId(nodeId);

    if (nodeId) {
      // Extract remoteName from the node ID format "node-{remoteName}-{level}"
      const match = nodeId.match(/^node-(.+?)-\d+$/);
      if (match && match[1]) {
        setHighlightedRemoteName(match[1]);
      }
    } else {
      setHighlightedRemoteName(null);
    }
  };

  const highlightRemote = (remoteName: string | null) => {
    console.log(`Highlighting remote: ${remoteName}`);
    setHighlightedRemoteName(remoteName);

    if (remoteName) {
      // Use our recursive finder function
      const nodeId = findNodeIdByRemoteName(remoteName);
      console.log(`Found node ID for ${remoteName}: ${nodeId}`);

      if (nodeId) {
        setSelectedNodeId(nodeId);
      } else {
        // Fallback to level 1 if not found - this is just a safety measure
        console.warn(`No node found for remote ${remoteName}, using fallback`);
        setSelectedNodeId(`node-${remoteName}-1`);
      }
    } else {
      setSelectedNodeId(null);
    }
  };

  const setActiveTab = (tab: string) => {
    onTabChange(tab);
  };

  return (
    <SelectionContext.Provider
      value={{
        selectedNodeId,
        selectNode,
        highlightedRemoteName,
        highlightRemote,
        setActiveTab,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
};
