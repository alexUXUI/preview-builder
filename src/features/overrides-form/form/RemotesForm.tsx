import { useEffect, useRef, useState } from 'react';
import { camelToKebabCase } from '../../graph/graph';
import { useSelection } from '../../selection/selection.context';
import { TooltipWrapper } from '../../tooltip/tooltip';
import { useOverridesForm } from '../context/form.context';
import { RemoteVersionInput } from '../input/RemoteVersionInput';
import './RemotesForm.css';
// import "./new-button.css";
// import "./button.css";

export const RemotesForm = () => {
  const { hostGroups, formState, updateRemoteVersion, handleFieldFocus } =
    useOverridesForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    highlightedRemoteName,
    highlightRemote,
    setActiveTab,
    remoteToFocus,
  } = useSelection();

  const inputRefs = useRef<Record<string, HTMLInputElement>>({});

  useEffect(() => {
    if (remoteToFocus) {
      // Try to find the input element for this remote
      const inputElement =
        document.getElementById(remoteToFocus) ||
        document.getElementById(camelToKebabCase(remoteToFocus));

      if (inputElement && inputElement instanceof HTMLInputElement) {
        // Focus the input and trigger the focus handler
        inputElement.focus();
        handleFieldFocus(camelToKebabCase(remoteToFocus));

        // Scroll the input into view with smooth behavior
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [remoteToFocus, handleFieldFocus]);

  // Check if there are any invalid fields
  const hasInvalidFields = Object.values(formState.remoteVersions).some(
    field => !field.isValid,
  );

  // Check if there are any changes
  const hasChanges = Object.values(formState.remoteVersions).some(
    field => field.isDirty,
  );

  const allValid = Object.values(formState.remoteVersions).every(
    field => field.isValid,
  );

  const noFocus = Object.values(formState.remoteVersions).every(
    field => !field.isFocusing,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasInvalidFields || !hasChanges) {
      return;
    }

    setIsSubmitting(true);

    // Apply changes by reloading the page
    // The values are already stored in localStorage when field is blurred
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Handle cancel or reset
  const handleReset = () => {
    if (confirm('This will clear all MFE overrides.')) {
      localStorage.removeItem('hawaii_mfe_overrides');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (hostGroups.length === 0) {
    return <p>No MFE remotes detected in this application.</p>;
  }

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <form onSubmit={handleSubmit} className="remotes-form">
      <div>
        {hostGroups.map(group => (
          <div key={group.manifestName} className="host-group">
            <div className="host-group-header">
              <div className="host-title">
                <h4>{capitalizeFirstLetter(group.name)}</h4>
                <TooltipWrapper
                  tooltip={`This is the ${group.manifestName} host application running version ${group.version}. It loads the micro-frontend components listed below.`}
                />
              </div>
              <div className="host-group-info">
                <span className="host-version">v{group.version}</span>
              </div>
            </div>
            <table className="remotes-table">
              <thead>
                <tr>
                  {group.manifestName === 'shell' ? (
                    <th>Product MFEs</th>
                  ) : (
                    <th>Service MFEs</th>
                  )}
                  <th style={{ textAlign: 'center' }}>Override</th>
                  <th style={{ textAlign: 'right' }}></th>
                </tr>
              </thead>
              {group.remotes.length > 0 ? (
                <tbody>
                  {group.remotes.map(remote => {
                    if (remote.name === 'previewBuilder') return null;
                    if (remote.name === 'shell') return null;
                    const field =
                      formState.remoteVersions[camelToKebabCase(remote.name)];
                    const isFocusing = field?.isFocusing || false;
                    const isInvalid = field?.isTouched && !field?.isValid;
                    const isDirty = field?.isDirty || false;
                    const kebabName = camelToKebabCase(remote.name);

                    const isHighlightTarget =
                      remoteToFocus === remote.name ||
                      remoteToFocus === kebabName;

                    return (
                      <tr
                        key={remote.name}
                        className={`
                          ${isFocusing ? 'focusing' : ''}
                          ${isInvalid ? 'invalid' : ''}
                          ${isDirty ? 'modified' : ''}
                          ${isHighlightTarget ? 'highlight-target' : ''}
                          ${
                            highlightedRemoteName === remote.name
                              ? 'highlighted'
                              : ''
                          }
                        `}
                      >
                        <td>
                          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                          <label
                            data-remote-name={remote.name} // Add this for easier debugging
                            htmlFor={remote.name}
                            className={
                              isFocusing
                                ? 'focusing-label remote-label'
                                : 'remote-label'
                            }
                            onClick={e => {
                              e.preventDefault();
                              highlightRemote(remote.name);
                              console.log(
                                `Clicked on remote label: ${remote.name}`,
                              );
                              // Make sure we're using the original name, not the kebab case version
                              // This will match how nodes are created in the graph
                              setActiveTab('graph');
                            }}
                          >
                            {capitalizeFirstLetter(
                              camelToKebabCase(remote.name)
                                .split('-')
                                .join(' '),
                            )}
                          </label>
                        </td>
                        <td className="version-cell">
                          <RemoteVersionInput
                            remoteName={remote.name}
                            id={remote.name}
                            ref={el => {
                              if (el) inputRefs.current[remote.name] = el;
                            }}
                          />
                        </td>
                        <td className="message-cell">
                          <div className="message-cell-text">
                            {!field.isValid &&
                              field.isTouched &&
                              !field.isFocusing && (
                                <div className="error-message">
                                  {field.error}
                                </div>
                              )}

                            {field.value &&
                              field.isValid &&
                              field.isTouched &&
                              !field.isFocusing && (
                                <div className="ready-message">
                                  <button
                                    type="button"
                                    className={`
                                      apply-override
                                      ${isSubmitting ? 'submitting' : ''}
                                      `}
                                    onClick={() => {
                                      updateRemoteVersion(
                                        camelToKebabCase(remote.name),
                                        field.value,
                                      );
                                      setIsSubmitting(true);
                                      setTimeout(() => {
                                        window.location.reload();
                                      }, 1000);
                                    }}
                                  >
                                    {!isSubmitting
                                      ? 'Apply Override'
                                      : 'Applying...'}
                                  </button>
                                </div>
                              )}

                            {field.value &&
                              field.initialValue &&
                              !field.isFocusing &&
                              !field.isDirty &&
                              !field.isTouched && (
                                <div className="override-message">
                                  <span>Override Applied</span>
                                </div>
                              )}

                            {!field.value &&
                              field.initialValue &&
                              !field.isFocusing &&
                              field.isTouched &&
                              field.isValid && (
                                <div className="ready-message">
                                  <button
                                    type="button"
                                    className={`
                                      clear-override
                                      ${isSubmitting ? 'submitting' : ''}
                                      `}
                                    onClick={() => {
                                      updateRemoteVersion(
                                        camelToKebabCase(remote.name),
                                        null,
                                      );
                                      setIsSubmitting(true);
                                      setTimeout(() => {
                                        window.location.reload();
                                      }, 1000);
                                    }}
                                  >
                                    {!isSubmitting
                                      ? 'Clear Override'
                                      : 'Applying...'}
                                  </button>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : null}
            </table>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className={`
            ${hasInvalidFields ? 'invalid' : ''}
            ${!hasChanges ? 'no-changes' : ''}
            ${isSubmitting ? 'submitting' : ''}
            ${
              hasChanges && !hasInvalidFields && !isSubmitting && noFocus
                ? 'ready'
                : ''
            }
          `}
          disabled={hasInvalidFields || !hasChanges || isSubmitting}
        >
          {!hasChanges ? 'No Overrides to Apply. Please update a field.' : null}
          {hasChanges && !hasInvalidFields && !noFocus ? 'Editing...' : null}
          {hasChanges && allValid && noFocus && !isSubmitting
            ? 'Apply Changes'
            : null}
          {hasChanges && hasInvalidFields ? 'Please fix errors' : null}
          {isSubmitting ? 'Applying...' : null}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className={`
            reset-button
            button
            ${hasInvalidFields ? 'invalid' : ''}
            ${!hasChanges ? 'no-changes' : ''}
            ${isSubmitting ? 'submitting' : ''}
            ${hasChanges && !hasInvalidFields && !isSubmitting ? 'ready' : ''}

          `}
          disabled={isSubmitting}
        >
          Reset All
        </button>
      </div>
    </form>
  );
};
