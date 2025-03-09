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
            const mfeToRuntimeMap = new Map<string, string>();

            // Calculate vertical spacing
            const VERTICAL_SPACING = 120;
            const HORIZONTAL_SPACING = 250;
            let currentLevel = 0;

            // Helper function to check if a remote name matches any federation runtime
            const findMatchingRuntime = (remoteName: string) => {
                return window.__FEDERATION__.__INSTANCES__?.find(instance =>
                    instance.name === remoteName
                );
            };

            // Helper function to process runtime and its remotes recursively
            const processRuntime = (instance: any, level: number, parentId?: string) => {
                if (!instance?.options?.remotes?.length) return;

                const runtimeId = `runtime-${instance.name}-${level}`;
                const runtimeName = instance.name || 'Runtime';

                // Create runtime node if not already processed
                if (!processedNodes.has(runtimeId)) {
                    allNodes.push({
                        id: runtimeId,
                        data: {
                            label: `${runtimeName} Runtime`,
                            instanceName: instance.options.name || 'instance'
                        },
                        position: {
                            x: 400,
                            y: level * VERTICAL_SPACING
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

                    // Add edge from parent if exists
                    if (parentId) {
                        allEdges.push({
                            id: `${parentId}-${runtimeId}`,
                            source: parentId,
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

                // Process remotes
                instance.options.remotes.forEach((remote: any, index: number) => {
                    const remoteId = `remote-${remote.name}-${level}-${index}`;
                    if (!processedNodes.has(remoteId)) {
                        // Check if this remote has its own federation runtime
                        const matchingRuntime = findMatchingRuntime(remote.name);
                        const isRuntimeNode = !!matchingRuntime;

                        allNodes.push({
                            id: remoteId,
                            data: {
                                label: remote.name + (isRuntimeNode ? ' Runtime' : ''),
                                entry: remote.entry,
                                type: remote.type
                            },
                            position: {
                                x: 200 + index * HORIZONTAL_SPACING,
                                y: (level + 1) * VERTICAL_SPACING
                            },
                            style: {
                                background: isRuntimeNode ? '#4070ff' : '#f0f0f7',
                                color: isRuntimeNode ? 'white' : 'inherit',
                                border: isRuntimeNode ? '1px solid #2050dd' : '1px solid #e0e0e7',
                                borderRadius: '8px',
                                padding: '10px',
                                minWidth: '150px',
                                textAlign: 'center'
                            },
                        });
                        processedNodes.add(remoteId);

                        // Add edge from runtime to remote
                        allEdges.push({
                            id: `${runtimeId}-${remoteId}`,
                            source: runtimeId,
                            target: remoteId,
                            animated: true,
                            style: { stroke: '#4070ff' },
                            type: 'smoothstep'
                        });

                        // If remote has its own runtime, process it recursively
                        if (matchingRuntime && instance.moduleCache?.has(remote.name)) {
                            processRuntime(matchingRuntime, level + 2, remoteId);
                        }
                    }
                });
            };

            // Start processing from the root instance
            const rootInstance = window.__FEDERATION__.__INSTANCES__[0];
            processRuntime(rootInstance, 0);

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