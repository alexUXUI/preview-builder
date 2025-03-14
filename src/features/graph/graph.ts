import { Node, Edge } from 'reactflow';
import { FederationInstance } from './types';

interface GraphState {
    nodes: Node[];
    edges: Edge[];
}

interface TreeNode {
    id: string;
    name: string;
    children: TreeNode[];
    level: number;
    position: number;
    width: number;
    isRuntime: boolean;
}

// Helper function to check if a name matches any federation runtime
const isRuntimeNode = (name: string): boolean => {
    if (!window.__FEDERATION__?.__INSTANCES__?.length) return false;
    return window.__FEDERATION__.__INSTANCES__?.some(instance =>
        instance.name === name
    );
};

const isNodeOverridden = (name: string): boolean => {
    const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
    return storedOverrides
        .split(",")
        .filter(Boolean)
        .some(override => {
            const [overrideName, version] = override.split("_");
            return overrideName === name && version && version.length > 0;
        });
};

interface RemoteVersionMap {
    [instanceName: string]: {
        [remoteName: string]: string;
    };
}

let remoteVersionMap: RemoteVersionMap = {};
let isVersionMapInitialized = false;

const extractRemoteVersions = () => {
    if (!window.__FEDERATION__?.__INSTANCES__?.length || isVersionMapInitialized) return;

    window.__FEDERATION__.__INSTANCES__.forEach(instance => {
        remoteVersionMap[instance.name] = {};

        // Extract versions from moduleCache
        if (instance.moduleCache) {
            const moduleEntries = instance.moduleCache instanceof Map ?
                Array.from(instance.moduleCache.entries()) :
                Object.entries(instance.moduleCache);

            moduleEntries.forEach(([, value]) => {
                if (typeof value === 'object' && value !== null) {
                    const remoteInfo = value.remoteInfo;
                    if (remoteInfo && typeof remoteInfo === 'object') {
                        const remoteName = remoteInfo.name || '';
                        if (remoteName) {
                            remoteVersionMap[instance.name][remoteName] =
                                remoteInfo.buildVersion ||
                                remoteInfo.version ||
                                '';
                        }
                    }
                }
            });
        }

        // Also check remotes configuration for any missing versions
        if (instance.options?.remotes) {
            instance.options.remotes.forEach(remote => {
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

const getNodeVersion = (name: string): string => {
    const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";
    const override = storedOverrides
        .split(",")
        .filter(Boolean)
        .find(override => {
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
        const directInstance = window.__FEDERATION__.__INSTANCES__.find(instance => instance.name === name);
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

// Helper function to build the tree structure
const buildTree = (instance: FederationInstance, level: number = 0): TreeNode => {
    const node: TreeNode = {
        id: `node-${instance.name}-${level}`,
        name: instance.name,
        children: [],
        level,
        position: 0,
        width: 1,
        isRuntime: true
    };

    if (instance.options?.remotes?.length) {
        node.children = instance.options.remotes.map((remote: any) => {
            const hasRuntimeCapabilities = isRuntimeNode(remote.name);
            if (hasRuntimeCapabilities) {
                const matchingRuntime = window.__FEDERATION__.__INSTANCES__?.find(inst => inst.name === remote.name);
                if (matchingRuntime) {
                    return buildTree(matchingRuntime, level + 1);
                }
            }
            return {
                id: `node-${remote.name}-${level + 1}`,
                name: remote.name,
                children: [],
                level: level + 1,
                position: 0,
                width: 1,
                isRuntime: hasRuntimeCapabilities
            };
        });
    }

    return node;
};

// Helper function to calculate node positions
const calculatePositions = (node: TreeNode, startX: number = 0): number => {
    if (node.children.length === 0) {
        node.position = startX;
        return startX + node.width;
    }

    let totalWidth = 0;
    node.children.forEach(child => {
        totalWidth += calculatePositions(child, startX + totalWidth);
    });

    node.position = startX + (totalWidth - node.width) / 2;
    return totalWidth;
};

// Helper function to convert tree to graph nodes and edges
const treeToGraph = (node: TreeNode, allNodes: Node[], allEdges: Edge[], scale: number = 200): void => {
    allNodes.push({
        id: node.id,
        data: {
            label: `${node.name} ${getNodeVersion(node.name)}`
        },
        position: {
            x: node.position * scale,
            y: node.level * 100
        },
        style: {
            background: isNodeOverridden(node.name) ? '#ff4757' : node.isRuntime ? '#4070ff' : '#f0f0f7',
            color: isNodeOverridden(node.name) || node.isRuntime ? 'white' : 'inherit',
            border: isNodeOverridden(node.name) ? '1px solid #ff3747' : node.isRuntime ? '1px solid #2050dd' : '1px solid #e0e0e7',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '150px',
            textAlign: 'center'
        },
    });

    node.children.forEach(child => {
        treeToGraph(child, allNodes, allEdges, scale);
        allEdges.push({
            id: `${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            type: 'smoothstep',
            style: {
                stroke: '#b1b1b7'
            }
        });
    });
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