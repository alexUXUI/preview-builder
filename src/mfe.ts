import { bootstrap } from "./bootstrap";

export default {
  bootstrap() {
    console.log("[preview builder] Bootstrapping...");
    bootstrap();
  },
  destroy() {
    console.log("[preview builder] Destroying...");
  },
};
