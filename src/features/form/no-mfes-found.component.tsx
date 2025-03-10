
export const NoMFEsFound = ({
    handleDetectMFEs,
    handleAddMFE,
}: any) => {
    return (
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
    )
}