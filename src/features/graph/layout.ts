import type { Edge } from "reactflow";
import type { TreeNode } from "./types";

export const camelToKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

interface RemoteVersionMap {
  [instanceName: string]: {
    [remoteName: string]: string;
  };
}

export const remoteVersionMap: RemoteVersionMap = {};

export const getNodeVersion = (name: string): string => {
  const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
  const override = storedOverrides
    .split(",")
    .filter(Boolean)
    .find((override) => {
      const [overrideName] = override.split("_");
      return overrideName === name;
    });

  if (override) {
    const [, version] = override.split("_");
    return `\nv${version}`;
  }

  // Look for version in remoteVersionMap
  for (const instanceName in remoteVersionMap) {
    const version = remoteVersionMap[instanceName][name];
    if (version) return `\nv${version}`;
  }

  // If no version found in remoteVersionMap, check federation instances
  if (window.__FEDERATION__?.__INSTANCES__?.length) {
    const directInstance = window.__FEDERATION__.__INSTANCES__.find(
      (instance) => instance.name === name
    );
    if (directInstance) {
      if (directInstance.options?.id) {
        const [, version] = directInstance.options.id.split(":");
        if (version) return `\nv${version}`;
      }
      if (directInstance.options?.version) {
        return `\nv${directInstance.options.version}`;
      }
    }
  }

  return "";
};

export const isNodeOverridden = (name: string): boolean => {
  // Convert the node name to kebab-case for localStorage comparison
  const kebabName = camelToKebabCase(name);
  const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
  return storedOverrides
    .split(",")
    .filter(Boolean)
    .some((override) => {
      const [overrideName, version] = override.split("_");
      return overrideName === kebabName && version && version.length > 0;
    });
};

// Helper function to calculate node positions
export const calculatePositions = (node: TreeNode, startX = 0): number => {
  const nodeSpacing = 1.5; // Increased spacing for better readability
  const minNodeWidth = 2; // Minimum width to prevent overcrowding

  if (node.children.length === 0) {
    node.position = startX;
    return startX + Math.max(node.width, minNodeWidth) * nodeSpacing;
  }

  let totalWidth = 0;
  const childWidths: number[] = [];

  // First pass: calculate all child widths
  // biome-ignore lint/complexity/noForEach: <explanation>
  node.children.forEach((child) => {
    const childWidth = calculatePositions(child, 0); // Calculate width without positioning
    childWidths.push(childWidth);
    totalWidth += childWidth;
  });

  // Second pass: position children with calculated widths
  let currentX = startX;
  node.children.forEach((child, index) => {
    child.position =
      currentX + childWidths[index] / 2 - (child.width * nodeSpacing) / 2;
    currentX += childWidths[index];
  });

  // Center the parent node between its leftmost and rightmost children
  const leftmostChild = node.children[0];
  const rightmostChild = node.children[node.children.length - 1];
  node.position =
    leftmostChild.position +
    (rightmostChild.position - leftmostChild.position) / 2;

  return Math.max(totalWidth, node.width * nodeSpacing);
};

// Helper function to convert tree to graph nodes and edges
export const treeToGraph = (
  node: TreeNode,
  allNodes: Node[],
  allEdges: Edge[],
  scale = 52 // Reduced scale factor for more compact layout
): void => {
  allNodes.push({
    id: node.id,
    data: {
      label: `${node.name} ${getNodeVersion(node.name)}`,
      remoteName: node.name, // Add this line
    },
    position: {
      x: node.position * scale,
      y: node.level * 100,
    },
    style: {
      background: isNodeOverridden(node.name)
        ? "#ff4757"
        : node.isRuntime
        ? "#4070ff"
        : "#f0f0f7",
      color:
        isNodeOverridden(node.name) || node.isRuntime ? "white" : "inherit",
      border: isNodeOverridden(node.name)
        ? "1px solid #ff3747"
        : node.isRuntime
        ? "1px solid #2050dd"
        : "1px solid #e0e0e7",
      borderRadius: "8px",
      padding: "10px",
      minWidth: "150px",
      textAlign: "center",
    },
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  node.children.forEach((child) => {
    treeToGraph(child, allNodes, allEdges, scale);
    allEdges.push({
      id: `${node.id}-${child.id}`,
      source: node.id,
      target: child.id,
      type: "smoothstep",
      style: {
        stroke: "#b1b1b7",
      },
    });
  });
};
