export interface HostGroup {
  name: string;
  remotes: Array<{
    name: string;
    version: string;
  }>;
}
