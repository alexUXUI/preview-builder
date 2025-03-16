import type { Edge } from "reactflow";
import type { TreeNode } from "./types";
import dagre from "@dagrejs/dagre";

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

// Helper function to calculate node positions using Dagre
export const calculatePositions = (node: TreeNode): void => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 50,
    ranksep: 70,
    align: "UL",
    acyclicer: "greedy",
    marginx: 20,
    marginy: 20,
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 120;
  const nodeHeight = 35;

  // Helper function to add nodes and edges to Dagre graph
  const addToDagreGraph = (node: TreeNode) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    node.children.forEach((child) => {
      dagreGraph.setNode(child.id, { width: nodeWidth, height: nodeHeight });
      dagreGraph.setEdge(child.id, node.id);
      addToDagreGraph(child);
    });
  };

  // Build the Dagre graph
  addToDagreGraph(node);

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Helper function to apply Dagre positions to our tree
  const applyDagrePositions = (node: TreeNode) => {
    const dagreNode = dagreGraph.node(node.id);
    node.position = { x: dagreNode.x, y: dagreNode.y };
    node.children.forEach((child) => applyDagrePositions(child));
  };

  // Apply the calculated positions
  applyDagrePositions(node);
};

// Helper function to convert tree to graph nodes and edges
export const treeToGraph = (
  node: TreeNode,
  allNodes: Node[],
  allEdges: Edge[]
): void => {
  allNodes.push({
    id: node.id,
    data: {
      label: `${node.name} ${getNodeVersion(node.name)}`,
      remoteName: node.name, // Add this line
    },
    position: {
      x: node.position.x,
      y: node.position.y,
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
    treeToGraph(child, allNodes, allEdges);
    // Generate a consistent color based on the consumer (target) node
    const edgeColor = `hsl(${
      Math.abs(
        node.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % 360
    }, 70%, 50%)`;
    allEdges.push({
      id: `${child.id}-${node.id}`,
      source: child.id,
      target: node.id,
      type: "smoothstep",
      animated: true,
      data: {
        consumer: node.name, // Store consumer name for legend
      },
      style: {
        stroke: edgeColor,
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: "arrow",
        width: 15,
        height: 15,
        color: edgeColor,
      },
    });
  });
};
