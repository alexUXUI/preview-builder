import type { Node, Edge } from "reactflow";
import type { FederationInstance, GraphState, TreeNode } from "./types";
import { remoteVersionMap, calculatePositions, treeToGraph } from "./layout";
import { useSelection } from "../selection/selection.context";
import { useCallback } from "react";

import { useNodesState, useEdgesState } from "reactflow";

export const useSelectableGraph = () => {
  const { selectedNodeId, selectNode } = useSelection();

  const createGraphWithSelection = useCallback(() => {
    const { nodes: baseNodes, edges } = createGraph();

    // Enhance nodes with selection behavior
    const nodes = baseNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        label: node.data.label,
        onClick: () => selectNode(node.id),
        isSelected: node.id === selectedNodeId,
      },
      // Apply styling for selected nodes
      style: {
        ...node.style,
        border: node.id === selectedNodeId ? "2px solid #4070ff" : undefined,
        boxShadow:
          node.id === selectedNodeId
            ? "0 0 8px rgba(64, 112, 255, 0.5)"
            : undefined,
      },
    }));

    return { nodes, edges };
  }, [selectedNodeId, selectNode]);

  return { createGraphWithSelection };
};

// Helper function to check if a name matches any federation runtime
export const isRuntimeNode = (name: string): boolean => {
  if (!window.__FEDERATION__?.__INSTANCES__?.length) return false;
  return window.__FEDERATION__.__INSTANCES__?.some(
    (instance) => instance.name === name
  );
};

export const camelToKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

let isVersionMapInitialized = false;

const extractRemoteVersions = () => {
  if (!window.__FEDERATION__?.__INSTANCES__?.length || isVersionMapInitialized)
    return;

  // biome-ignore lint/complexity/noForEach: <explanation>
  window.__FEDERATION__.__INSTANCES__.forEach((instance) => {
    remoteVersionMap[instance.name] = {};

    // Extract versions from moduleCache
    if (instance.moduleCache) {
      const moduleEntries =
        instance.moduleCache instanceof Map
          ? Array.from(instance.moduleCache.entries())
          : Object.entries(instance.moduleCache);

      // biome-ignore lint/complexity/noForEach: <explanation>
      moduleEntries.forEach(([, value]) => {
        if (typeof value === "object" && value !== null) {
          const remoteInfo = value.remoteInfo;
          if (remoteInfo && typeof remoteInfo === "object") {
            const remoteName = remoteInfo.name || "";
            if (remoteName) {
              remoteVersionMap[instance.name][remoteName] =
                remoteInfo.buildVersion || remoteInfo.version || "";
            }
          }
        }
      });
    }

    // Also check remotes configuration for any missing versions
    if (instance.options?.remotes) {
      // biome-ignore lint/complexity/noForEach: <explanation>
      instance.options.remotes.forEach((remote) => {
        if (!remoteVersionMap[instance.name][remote.name] && remote.entry) {
          const versionMatch = remote.entry.match(/v(\d+\.\d+\.\d+)/);
          if (versionMatch) {
            remoteVersionMap[instance.name][remote.name] = versionMatch[1];
          }
        }
      });
    }
  });

  isVersionMapInitialized = true;
};

// Helper function to build the tree structure
const buildTree = (
  instance: FederationInstance,
  level = 0,
  visited: Set<string> = new Set()
): TreeNode => {
  const node: TreeNode = {
    id: `node-${instance.name}-${level}`,
    name: instance.name,
    children: [],
    level,
    position: 0,
    width: 0.5,
    isRuntime: true,
  };

  // Add current node to visited set
  visited.add(instance.name);

  if (instance.options?.remotes?.length) {
    node.children = instance.options.remotes.map((remote: any) => {
      const hasRuntimeCapabilities = isRuntimeNode(remote.name);
      // Check if we've already visited this node to prevent circular dependencies
      if (hasRuntimeCapabilities && !visited.has(remote.name)) {
        const matchingRuntime = window.__FEDERATION__.__INSTANCES__?.find(
          (inst) => inst.name === remote.name
        );
        if (matchingRuntime) {
          return buildTree(matchingRuntime, level + 1, visited);
        }
      }
      return {
        id: `node-${remote.name}-${level + 1}`,
        name: remote.name,
        children: [],
        level: level + 1,
        position: 0,
        width: 0.5,
        isRuntime: hasRuntimeCapabilities,
      };
    });
  }

  return node;
};

export const createGraph = (): GraphState => {
  extractRemoteVersions();

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (window.__FEDERATION__?.__INSTANCES__?.length) {
    const rootInstance = window.__FEDERATION__.__INSTANCES__[0];
    const tree = buildTree(rootInstance);
    calculatePositions(tree);
    treeToGraph(tree, nodes, edges);
  }

  return { nodes, edges };
};
