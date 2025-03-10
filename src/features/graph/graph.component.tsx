import { useCallback, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createGraph } from './graph';

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
        <div style={{ width: '100%', height: '470px' }}>
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