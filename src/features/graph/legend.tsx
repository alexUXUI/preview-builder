import React, { useState } from "react";
import { useEdges, Panel } from "reactflow";

const Legend = () => {
  const edges = useEdges();
  // Get unique consumers and their colors
  const consumers = new Map();

  // biome-ignore lint/complexity/noForEach: <explanation>
  edges.forEach((edge) => {
    if (edge.data?.consumer && !consumers.has(edge.data.consumer)) {
      consumers.set(edge.data.consumer, edge.style.stroke);
    }
  });

  return (
    <Panel
      position="top-right"
      style={{
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "250px",
        cursor: "move",
      }}
    >
      <div className="legend-title">Legend</div>
      <div className="legend-row">
        <div className="legend-section">
          <div className="legend-text-muted">MFE Status</div>
          <div className="legend-section">
            <div className="legend-item">
              <div className="legend-dot legend-dot-active" />
              <span className="legend-text">Active MFE</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot legend-dot-preview" />
              <span className="legend-text">Preview Override</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot legend-dot-inactive" />
              <span className="legend-text">Inactive MFE</span>
            </div>
          </div>
        </div>

        {consumers.size > 0 && (
          <div
            style={{
              margin: "0 0 0 20px",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}
            >
              Consumers
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {Array.from(consumers).map(([consumer, color]) => (
                <div
                  key={consumer}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "2px",
                      backgroundColor: color,
                    }}
                  />
                  <span style={{ fontSize: "12px" }}>{consumer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default Legend;
