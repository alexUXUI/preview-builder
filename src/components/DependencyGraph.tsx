import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
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
            const processedEdges = new Set<string>();
            const instanceNameToRuntimeId = new Map<string, string>();

            // Calculate vertical spacing
            const VERTICAL_SPACING = 120;
            const HORIZONTAL_SPACING = 250;
            let currentLevel = 0;

            // First pass: Create the root runtime node (first instance)
            const rootInstance = window.__FEDERATION__.__INSTANCES__[0];
            if (rootInstance?.options?.remotes) {
                const rootRuntimeId = 'runtime-0';
                allNodes.push({
                    id: rootRuntimeId,
                    data: {
                        label: `${rootInstance.name || 'Root'} Runtime`,
                        instanceName: rootInstance.options.name || 'root-instance'
                    },
                    position: { x: 400, y: 50 },
                    style: {
                        background: '#4070ff',
                        color: 'white',
                        border: '1px solid #2050dd',
                        borderRadius: '8px',
                        padding: '10px',
                        minWidth: '180px',
                        textAlign: 'center'
                    },
                });
                processedNodes.add(rootRuntimeId);
                if (rootInstance.options.name) {
                    instanceNameToRuntimeId.set(rootInstance.options.name, rootRuntimeId);
                }

                // Add root's remote nodes
                currentLevel++;
                rootInstance.options.remotes.forEach((remote, remoteIndex) => {
                    const remoteId = `remote-${remote.name}`;
                    if (!processedNodes.has(remoteId)) {
                        allNodes.push({
                            id: remoteId,
                            data: {
                                label: remote.name,
                                entry: remote.entry,
                                type: remote.type
                            },
                            position: {
                                x: 200 + remoteIndex * HORIZONTAL_SPACING,
                                y: currentLevel * VERTICAL_SPACING
                            },
                            style: {
                                background: '#f0f0f7',
                                border: '1px solid #e0e0e7',
                                borderRadius: '8px',
                                padding: '10px',
                                minWidth: '150px',
                                textAlign: 'center'
                            },
                        });
                        processedNodes.add(remoteId);

                        // Add edge from root to remote
                        allEdges.push({
                            id: `${rootRuntimeId}-${remoteId}`,
                            source: rootRuntimeId,
                            target: remoteId,
                            animated: true,
                            style: { stroke: '#4070ff' },
                            type: 'smoothstep'
                        });
                    }
                });
            }

            // Second pass: Process child runtimes
            window.__FEDERATION__.__INSTANCES__.slice(1).forEach((instance, idx) => {
                if (instance?.options?.remotes) {
                    const runtimeId = `runtime-${idx + 1}`;
                    const runtimeLevel = currentLevel + 1;

                    if (!processedNodes.has(runtimeId)) {
                        allNodes.push({
                            id: runtimeId,
                            data: {
                                label: `${instance.name || `Runtime ${idx + 2}`}`,
                                instanceName: instance.options.name || `instance-${idx + 1}`
                            },
                            position: {
                                x: 200 + idx * HORIZONTAL_SPACING,
                                y: runtimeLevel * VERTICAL_SPACING
                            },
                            style: {
                                background: '#4070ff',
                                color: 'white',
                                border: '1px solid #2050dd',
                                borderRadius: '8px',
                                padding: '10px',
                                minWidth: '180px',
                                textAlign: 'center'
                            },
                        });
                        processedNodes.add(runtimeId);
                        if (instance.options.name) {
                            instanceNameToRuntimeId.set(instance.options.name, runtimeId);
                        }

                        // Add child runtime's remotes
                        instance.options.remotes.forEach((remote, remoteIndex) => {
                            const remoteId = `remote-${remote.name}-${idx + 1}-${remoteIndex}`;
                            if (!processedNodes.has(remoteId)) {
                                allNodes.push({
                                    id: remoteId,
                                    data: {
                                        label: remote.name,
                                        entry: remote.entry,
                                        type: remote.type
                                    },
                                    position: {
                                        x: 200 + (remoteIndex + idx) * HORIZONTAL_SPACING,
                                        y: (runtimeLevel + 1) * VERTICAL_SPACING
                                    },
                                    style: {
                                        background: '#f0f0f7',
                                        border: '1px solid #e0e0e7',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        minWidth: '150px',
                                        textAlign: 'center'
                                    },
                                });
                                processedNodes.add(remoteId);

                                // Add edge from child runtime to its remote
                                allEdges.push({
                                    id: `${runtimeId}-${remoteId}`,
                                    source: runtimeId,
                                    target: remoteId,
                                    animated: true,
                                    style: { stroke: '#4070ff' },
                                    type: 'smoothstep'
                                });
                            }
                        });

                        // Add edge from root to child runtime
                        allEdges.push({
                            id: `runtime-0-${runtimeId}`,
                            source: 'runtime-0',
                            target: runtimeId,
                            animated: true,
                            style: {
                                stroke: '#50c878',
                                strokeWidth: 2,
                                strokeDasharray: '5,5'
                            },
                            type: 'smoothstep'
                        });
                    }
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
        <div style={{ width: '100%', height: '600px' }}>
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