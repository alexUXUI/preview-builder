export interface FederationInstance {
    hooks: {
        registerPlugins: {
            [key: string]: {
                name: string;
            };
        };
        lifecycle: {
            beforeInit?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            init?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            beforeInitContainer?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            initContainer?: {
                type: string;
                listeners: Record<string, unknown>;
            };
        };
        lifecycleKeys: string[];
    };
    version: string;
    moduleCache: Record<string, unknown>;
    loaderHook: {
        registerPlugins: {
            [key: string]: {
                name: string;
            };
        };
        lifecycle: {
            getModuleInfo?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            createScript?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            createLink?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            fetch?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            loadEntryError?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            getModuleFactory?: {
                type: string;
                listeners: Record<string, unknown>;
            };
        };
        lifecycleKeys: string[];
    };
    bridgeHook: {
        registerPlugins: {
            [key: string]: {
                name: string;
            };
        };
        lifecycle: {
            beforeBridgeRender?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            afterBridgeRender?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            beforeBridgeDestroy?: {
                type: string;
                listeners: Record<string, unknown>;
            };
            afterBridgeDestroy?: {
                type: string;
                listeners: Record<string, unknown>;
            };
        };
        lifecycleKeys: string[];
    };
    name: string;
    options: {
        id: string;
        name: string;
        plugins: Array<{
            name: string;
        }>;
        remotes: Array<{
            name: string;
            entry: string;
            shareScope: string;
            type: string;
            alias?: string;
            externalType?: string;
        }>;
        shared: Record<string, unknown>;
        inBrowser: boolean;
        shareStrategy?: string;
        version?: string;
    };
    shareScopeMap: {
        [key: string]: Record<string, unknown>;
    };
}

declare global {
    interface Window {
        __FEDERATION__: {
            __INSTANCES__?: FederationInstance[];
        };
    }
}