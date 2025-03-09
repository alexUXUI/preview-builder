import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MFENode {
    name: string;
    entry: string;
    type: string;
}

const DependencyGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const createGraph = useCallback(() => {
        if (window.__FEDERATION__?.__INSTANCES__?.length) {
            const allNodes: Node[] = [];
            const allEdges: Edge[] = [];
            const processedNodes = new Set<string>();

            window.__FEDERATION__.__INSTANCES__.forEach((instance, instanceIndex) => {
                if (instance?.options?.remotes) {
                    // Add host node
                    const hostId = `host-${instanceIndex}`;
                    if (!processedNodes.has(hostId)) {
                        allNodes.push({
                            id: hostId,
                            data: { label: 'Host Application' },
                            position: { x: 250, y: instanceIndex * 100 },
                            style: {
                                background: '#4070ff',
                                color: 'white',
                                border: '1px solid #2050dd',
                                borderRadius: '8px',
                                padding: '10px',
                            },
                        });
                        processedNodes.add(hostId);
                    }

                    // Add remote nodes and edges
                    instance.options.remotes.forEach((remote, remoteIndex) => {
                        const remoteId = `remote-${remote.name}`;
                        if (!processedNodes.has(remoteId)) {
                            allNodes.push({
                                id: remoteId,
                                data: { label: remote.name },
                                position: { x: 500, y: remoteIndex * 100 + instanceIndex * 150 },
                                style: {
                                    background: '#f0f0f7',
                                    border: '1px solid #e0e0e7',
                                    borderRadius: '8px',
                                    padding: '10px',
                                },
                            });
                            processedNodes.add(remoteId);
                        }

                        // Add edge from host to remote
                        allEdges.push({
                            id: `${hostId}-${remoteId}`,
                            source: hostId,
                            target: remoteId,
                            animated: true,
                            style: { stroke: '#4070ff' },
                        });
                    });
                }
            });

            setNodes(allNodes);
            setEdges(allEdges);
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        createGraph();
    }, [createGraph]);

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default DependencyGraph;