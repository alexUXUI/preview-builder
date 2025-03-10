import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGraph } from './graph';

// Mock window object before tests
vi.stubGlobal('window', {
    __FEDERATION__: undefined
});

describe('graph.logic', () => {
    beforeEach(() => {
        // Reset window.__FEDERATION__ before each test
        window.__FEDERATION__ = undefined;
    });

    describe('createGraph', () => {
        it('should return empty nodes and edges when no federation instances exist', () => {
            const { nodes, edges } = createGraph();
            expect(nodes).toEqual([]);
            expect(edges).toEqual([]);
        });

        it('should create correct graph structure for a single runtime with remotes', () => {
            // Mock federation instance with remotes
            (window as any).__FEDERATION__ = {
                __INSTANCES__: [{
                    name: 'main-runtime',
                    options: {
                        remotes: [
                            { name: 'remote1', entry: 'http://remote1', type: 'module' },
                            { name: 'remote2', entry: 'http://remote2', type: 'module' }
                        ]
                    }
                }]
            };

            const { nodes, edges } = createGraph();

            // Verify nodes
            expect(nodes).toHaveLength(3); // 1 runtime + 2 remotes
            expect(nodes[0].data.label).toBe('main-runtime (Runtime)');
            expect(nodes[1].data.label).toBe('remote1 (Remote)');
            expect(nodes[2].data.label).toBe('remote2 (Remote)');

            // Verify edges
            expect(edges).toHaveLength(2); // 2 connections from runtime to remotes
            expect(edges[0].source).toBe(nodes[0].id);
            expect(edges[0].target).toBe(nodes[1].id);
            expect(edges[1].source).toBe(nodes[0].id);
            expect(edges[1].target).toBe(nodes[2].id);
        });

        it('should handle nested runtime capabilities correctly', () => {
            // Mock federation instance with nested runtime capabilities
            (window as any).__FEDERATION__ = {
                __INSTANCES__: [
                    {
                        name: 'main-runtime',
                        options: {
                            remotes: [
                                { name: 'nested-runtime', entry: 'http://nested', type: 'module' }
                            ]
                        },
                        moduleCache: new Map([['nested-runtime', {}]])
                    },
                    {
                        name: 'nested-runtime',
                        options: {
                            remotes: [
                                { name: 'child-remote', entry: 'http://child', type: 'module' }
                            ]
                        }
                    }
                ]
            };

            const { nodes, edges } = createGraph();

            // Verify nodes
            expect(nodes).toHaveLength(3); // main runtime + nested runtime + child remote
            expect(nodes[0].data.label).toBe('main-runtime (Runtime)');
            expect(nodes[1].data.label).toBe('nested-runtime (Runtime)');
            expect(nodes[2].data.label).toBe('child-remote (Remote)');

            // Verify edges and hierarchy
            expect(edges).toHaveLength(2);
            expect(edges[0].source).toBe(nodes[0].id); // main -> nested
            expect(edges[0].target).toBe(nodes[1].id);
            expect(edges[1].source).toBe(nodes[1].id); // nested -> child
            expect(edges[1].target).toBe(nodes[2].id);
        });

        it('should handle duplicate remote references', () => {
            // Mock federation instance with duplicate remote references
            (window as any).__FEDERATION__ = {
                __INSTANCES__: [
                    {
                        name: 'runtime1',
                        options: {
                            remotes: [
                                { name: 'shared-remote', entry: 'http://shared', type: 'module' }
                            ]
                        }
                    },
                    {
                        name: 'runtime2',
                        options: {
                            remotes: [
                                { name: 'shared-remote', entry: 'http://shared', type: 'module' }
                            ]
                        }
                    }
                ]
            };

            const { nodes, edges } = createGraph();

            // Verify that shared remote is only created once
            const sharedRemoteNodes = nodes.filter(node =>
                node.data.label.includes('shared-remote')
            );
            expect(sharedRemoteNodes).toHaveLength(1);

            // Verify correct edge connections
            const sharedRemoteEdges = edges.filter(edge =>
                edge.target === sharedRemoteNodes[0].id
            );
            expect(sharedRemoteEdges).toHaveLength(1);
        });

        it('should apply correct styling to runtime and remote nodes', () => {
            // Mock federation instance
            (window as any).__FEDERATION__ = {
                __INSTANCES__: [{
                    name: 'main-runtime',
                    options: {
                        remotes: [
                            { name: 'remote1', entry: 'http://remote1', type: 'module' }
                        ]
                    }
                }]
            };

            const { nodes } = createGraph();

            // Verify runtime node styling
            const runtimeNode = nodes.find(node => node.data.label.includes('Runtime'));
            expect(runtimeNode?.style).toMatchObject({
                background: '#4070ff',
                color: 'white',
                border: '1px solid #2050dd'
            });

            // Verify remote node styling
            const remoteNode = nodes.find(node => node.data.label.includes('Remote'));
            expect(remoteNode?.style).toMatchObject({
                background: '#f0f0f7',
                border: '1px solid #e0e0e7'
            });
        });
    });
});