import type React from "react";
import { useCallback, useEffect, useState } from "react";
import "./MFEOverridesForm.css";
import { Form } from "./form";
import { Panel } from "./panel";
import { TooltipWrapper } from "./tooltip";
import DependencyGraph from "./DependencyGraph";

export interface MFEOverride {
  name: string;
  version: string;
}

// Correctly typed federation interface based on the actual structure
declare global {
  interface Window {
    __FEDERATION__?: {
      __INSTANCES__?: Array<{
        options?: {
          remotes?: Array<{
            name: string;
            entry: string;
            shareScope: string;
            type: string;
          }>;
        };
      }>;
    };
  }
}

// For pattern attribute - simplify for HTML attribute use
const semverPattern =
  "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(-[\\w.-]+)?(\\+[\\w.-]+)?";

// Helper function to extract version from entry URL
const extractVersionFromEntry = (entry: string): string => {
  const matches = entry.match(/\/(\d+\.\d+\.\d+(?:-[^\/]+)?)\//);
  return matches?.[1] || "";
};

const MFEOverridesForm: any = () => {
  const [overrides, setOverrides] = useState<MFEOverride[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Function to initialize overrides from __FEDERATION__
  const initializeFromFederation = () => {
    if (window.__FEDERATION__?.__INSTANCES__?.length) {
      // Collect remotes from all federation instances
      const allRemotes = window.__FEDERATION__.__INSTANCES__
        .reduce((acc, instance) => {
          if (instance?.options?.remotes) {
            acc.push(...instance.options.remotes);
          }
          return acc;
        }, [] as Array<{
          name: string;
          entry: string;
          shareScope: string;
          type: string;
        }>);

      if (allRemotes.length > 0) {
        const newOverrides = allRemotes.map((remote) => ({
          name: remote.name,
          version: extractVersionFromEntry(remote.entry),
        }));

        setOverrides(newOverrides);
        console.log(
          "Initialized MFE overrides from all __FEDERATION__ instances:",
          newOverrides
        );
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const storedOverrides = localStorage.getItem("hawaii_mfe_overrides") || "";

    if (storedOverrides) {
      const parsedOverrides = storedOverrides
        .split(",")
        .filter(Boolean)
        .map((override) => {
          const [name, version] = override.split("_");
          return { name, version };
        });
      setOverrides(parsedOverrides);
    } else {
      // Try to initialize from __FEDERATION__ if no localStorage data
      initializeFromFederation();
    }
  }, []);

  const validateSemver = (version: string): boolean => {
    if (!version) return true; // Empty is valid
    const regex = new RegExp(`^${semverPattern}$`);
    return regex.test(version);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Function to add a new MFE override
  const handleAddMFE = () => {
    const newMFEName = prompt("Enter the name of the MFE:");
    if (newMFEName && !overrides.some((o) => o.name === newMFEName)) {
      setOverrides([...overrides, { name: newMFEName, version: "" }]);
    }
  };

  // Function to initialize from federation when there are no overrides
  const handleDetectMFEs = () => {
    const initialized = initializeFromFederation();
    if (!initialized) {
      alert("No MFEs detected in the current application.");
    }
  };

  return (
    <div className="mfe-overrides-container">
      <button
        className="toggle-button"
        onClick={togglePanel}
        aria-label="Toggle MFE Overrides Panel"
        type="button"
      >
        Preview
      </button>
      <Panel handleClose={handleClose} isOpen={isOpen}>
        <div style={{ display: "flex" }}>
          <h3>Preview Builder</h3>
          <TooltipWrapper tooltip="This tool allows you to compose an environment with specific versions of micro-frontend components. Use it to preview and test different MFE versions before they are deployed to production." />
        </div>

        <hr />
        {overrides.length === 0 ? (
          <div className="no-overrides">
            <p>No MFE overrides configured</p>
            <div className="override-actions">
              <button
                className="detect-mfes-button"
                onClick={handleDetectMFEs}
                type="button"
              >
                Detect MFEs
              </button>
              <button
                className="add-mfe-button"
                onClick={handleAddMFE}
                type="button"
              >
                Add Custom
              </button>
            </div>
          </div>
        ) : (
          <>
            <Form
              overrides={overrides}
              setOverrides={setOverrides}
              inputErrors={inputErrors}
              setInputErrors={setInputErrors}
              validateSemver={validateSemver}
            />
            <button
              className="add-mfe-button"
              onClick={handleAddMFE}
              type="button"
            >
              Add MFE
            </button>
            <hr />
            <h3>Dependency Graph</h3>
            <DependencyGraph />
          </>
        )}
      </Panel>
    </div>
  );
};

export default MFEOverridesForm;
