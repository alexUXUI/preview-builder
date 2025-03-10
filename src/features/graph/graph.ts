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
            label: `${node.name}${node.isRuntime ? ' (Runtime)' : ' (Remote)'}`
        },
        position: {
            x: node.position * scale,
            y: node.level * 100
        },
        style: {
            background: node.isRuntime ? '#4070ff' : '#f0f0f7',
            color: node.isRuntime ? 'white' : 'inherit',
            border: node.isRuntime ? '1px solid #2050dd' : '1px solid #e0e0e7',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '150px',
            textAlign: 'center'
        },
    });

    node.children.forEach(child => {
        allEdges.push({
            id: `${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            animated: true,
            style: { stroke: '#4070ff' },
            type: 'smoothstep'
        });
        treeToGraph(child, allNodes, allEdges, scale);
    });
};

export const createGraph = (): GraphState => {
    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    if (window.__FEDERATION__?.__INSTANCES__?.length) {
        const rootInstance = window.__FEDERATION__.__INSTANCES__[0];
        const tree = buildTree(rootInstance);
        calculatePositions(tree);
        treeToGraph(tree, allNodes, allEdges);
    }

    return { nodes: allNodes, edges: allEdges };
};