import React from "react";
import { useEdges } from "reactflow";

const Legend = () => {
  const edges = useEdges();

  // Get unique consumers and their colors
  const consumers = new Map();
  edges.forEach((edge) => {
    if (edge.data?.consumer && !consumers.has(edge.data.consumer)) {
      consumers.set(edge.data.consumer, edge.style.stroke);
    }
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        maxWidth: "250px",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>
        Legend
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            Node Types
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#4070ff",
                  borderRadius: "4px",
                }}
              />
              <span style={{ fontSize: "12px" }}>Active MFE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#ff4757",
                  borderRadius: "4px",
                }}
              />
              <span style={{ fontSize: "12px" }}>Preview Override</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#f0f0f7",
                  border: "1px solid #e0e0e7",
                  borderRadius: "4px",
                }}
              />
              <span style={{ fontSize: "12px" }}>Inactive MFE</span>
            </div>
          </div>
        </div>

        {consumers.size > 0 && (
          <div>
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
    </div>
  );
};

export default Legend;
