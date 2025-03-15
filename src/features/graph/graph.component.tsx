import { useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { createGraph } from "./graph";
import { TooltipWrapper } from "../tooltip/tooltip";

const DependencyGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const updateGraph = useCallback(() => {
    const { nodes: graphNodes, edges: graphEdges } = createGraph();
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [setNodes, setEdges]);

  useEffect(() => {
    updateGraph();
  }, [updateGraph]);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div
        style={{ display: "flex", alignItems: "center", margin: "0 0 25px 0" }}
      >
        <h2 style={{ margin: "0 5px 0px 10px" }}>MFE Graph</h2>
        <TooltipWrapper tooltip="MFE dependency graph. Illustrates the heirarchy of MFEs in the runtime." />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
