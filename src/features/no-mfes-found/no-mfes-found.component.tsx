import { Gear } from "./gear";
import "./no-mfes-found.css";

export const NoMFEsFound = () => {
  return (
    <div className="no-overrides">
      <div className="gears-container">
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
