export interface MFEInstance {
  version: string;
  moduleCache: Record<string, unknown>;
  name: string;
  options: MFEOptions;
}

/**
 * Represents the configuration options for a module federation instance
 */
export interface MFEOptions {
  id: string;
  name: string;
  plugins: Array<{ name: string }>;
  remotes: MFERemote[];
  shared: Record<string, unknown>;
  inBrowser: boolean;
  shareStrategy?: string;
}

/**
 * Represents a remote module federation configuration
 */
export interface MFERemote {
  name: string;
  version?: string;
  entry: string;
  shareScope: string;
  type: string;
}

/**
 * Represents a group of host configurations
 */
export interface HostGroup {
  name: string;
  remotes: MFERemote[];
}

/**
 * Represents the validation state for a form field
 */
export interface FieldState {
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  error?: string;
}

/**
 * Represents a remote version override field
 */
export interface RemoteVersionField extends FieldState {
  value: string | null;
  initialValue: string | null;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isFocusing: boolean; // Track if user is actively editing
  error?: string;
}

/**
 * Represents the form state for module federation overrides
 */
export interface MFEFormState {
  remoteVersions: Record<string, RemoteVersionField>;
}

/**
 * Represents a simplified version of a federation instance
 */
export interface FederationHostRuntime {
  options: MFEOptions;
  name: string;
  manifestName: string;
  version: string;
  moduleCache: Record<string, unknown>;
  remotes: MFERemote[];
  plugins: Array<{ name: string }>;
}
