import { createRoot } from "react-dom/client";
import { name, version } from "../package.json";
import App from "./App";

export const bootstrap = () => {
  console.log(`[${name}@${version}] bootstrap`);
  const mfeInstance = `${name}@${version}`;
  const anchorEl = document.createElement("div");
  anchorEl.id = "preview-builder";
  document.body.appendChild(anchorEl); // Append to body, not document

  try {
    const root = createRoot(anchorEl);
    return root.render(<App />);
  } catch (error) {
    console.error(`[${mfeInstance}] bootstrap failed`, error);
    // @todo handle redirects, monitoring, and alerting
    const root = createRoot(anchorEl);
    return root.render(<div>Could not load {mfeInstance}</div>);
  }
};
