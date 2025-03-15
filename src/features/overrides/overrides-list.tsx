import type { HostGroup } from "./types";
import "./overrides-list.css";
import { removeOverride } from "./override-storage";
import { OverrideBadge } from "./override-badge";
import { RemoteVersionInput } from "./remote-version-input";
import { useState } from "react";

interface OverridesListProps {
  hostGroups: HostGroup[];
  overrides: Array<{
    name: string;
    version: string;
    isDirty?: boolean | undefined;
  }>;
  setOverrides: (
    overrides: Array<{
      name: string;
      version: string;
      isDirty?: boolean | undefined;
    }>
  ) => void;
  inputErrors: Record<string, string>;
  handleVersionChange: (name: string, newVersion: string) => void;
  handleBlur: (name: string, version: string) => void;
}

export const OverridesList = ({
  hostGroups,
  overrides,
  setOverrides,
  inputErrors,
  handleVersionChange,
  handleBlur,
}: OverridesListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    hostGroups.map((g) => g.name)
  );
  const handleClearOverride = (remoteName: string, e: React.MouseEvent) => {
    e.preventDefault();
    const updatedOverrides = overrides.map((o) =>
      o.name === remoteName
        ? {
            ...o,
            version: "",
            isDirty: true,
          }
        : o
    );
    setOverrides(updatedOverrides);
    removeOverride(remoteName);
  };

  const handleVersionInputChange = (name: string, value: string) => {
    handleVersionChange(name, value);
  };

  const handleVersionInputBlur = (name: string, value: string) => {
    handleBlur(name, value);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((name) => name !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <div className="overrides-list">
      {hostGroups.map((group) => (
        <div key={group.name} className="host-group">
          <div className="host-group__header">
            <button
              type="button"
              className="host-group__toggle"
              onClick={() => toggleGroup(group.name)}
              aria-expanded={expandedGroups.includes(group.name)}
            >
              <span className="host-group__toggle-icon">
                {expandedGroups.includes(group.name) ? "▼" : "▶"}
              </span>
              <h4 className="host-name">{group.name}</h4>
            </button>
          </div>
          <div
            className={`host-remotes ${
              expandedGroups.includes(group.name) ? "expanded" : "collapsed"
            }`}
          >
            {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
            {group.remotes.map((remote: any) => (
              <RemoteVersionInput
                key={remote.name}
                remoteName={remote.name}
                version={remote.version}
                onClear={handleClearOverride}
                onChange={handleVersionInputChange}
                onBlur={handleVersionInputBlur}
                error={inputErrors[remote.name]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
