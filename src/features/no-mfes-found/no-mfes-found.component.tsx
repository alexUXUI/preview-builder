import { Gear } from "./gear";

export const NoMFEsFound = () => {
  return (
    <div
      className="no-overrides"
      style={{
        position: "relative",
      }}
    >
      <div
        className="gears-container"
        style={{ marginBottom: "20px", position: "relative" }}
      >
        <Gear />
      </div>
      <p>No MFE overrides configured</p>
      <div className="override-actions">
        <button className="apply-button" onClick={() => {}} type="button">
          Detect MFEs
        </button>
      </div>
    </div>
  );
};
