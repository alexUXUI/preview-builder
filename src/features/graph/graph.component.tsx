import { useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { TooltipWrapper } from "../tooltip/tooltip";
import { createGraph, useSelectableGraph } from "./graph";
import { useSelection } from "../selection/selection.context";
import Legend from "./legend";
// Initialize with base graph data

const DependencyGraph = () => {
  const { selectedNodeId, selectNode } = useSelection();

  const initialGraph = createGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  useEffect(() => {
    console.log(`Applying selection to node: ${selectedNodeId}`);

    setNodes((nds) =>
      nds.map((node) => {
        // Add selected styling to the node if it matches the selectedNodeId
        if (node.id === selectedNodeId) {
          console.log(`Styling selected node: ${node.id}`);
          return {
            ...node,
            style: {
              ...node.style,
              border: "3px solid #4070ff",
              boxShadow: "0 0 12px rgba(64, 112, 255, 0.7)",
              zIndex: 1000, // Make sure selected node appears on top
            },
            // Add a data attribute for easier debugging
            data: {
              ...node.data,
              selected: true,
            },
          };
        }
        // Remove selected styling from other nodes
        return {
          ...node,
          style: {
            ...node.style,
            border: node.style?.border || undefined,
            boxShadow: undefined,
            zIndex: 1,
          },
          data: {
            ...node.data,
            selected: false,
          },
        };
      })
    );
  }, [selectedNodeId, setNodes]);

  // Handle node click
  const onNodeClick = useCallback(
    (_event: any, node: Node) => {
      console.log(`Node clicked: ${node.id}`);
      selectNode(node.id);
    },
    [selectNode]
  );

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div
        style={{ display: "flex", alignItems: "center", margin: "0 0 25px 0" }}
      >
        <h2 style={{ margin: "0 5px 0px 10px" }}>MFE Graph</h2>
        <TooltipWrapper tooltip="MFE dependency graph. Illustrates the heirarchy of MFEs in the runtime." />
      </div>
      <ReactFlow
        fitViewOptions={{ padding: 0.2 }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        nodesConnectable={false}
        nodesDraggable={true}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
        <Legend />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
