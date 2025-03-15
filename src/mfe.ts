import { bootstrap } from "./bootstrap";

export default {
  bootstrap() {
    console.log("[preview builder] Bootstrapping...");

    setTimeout(() => {
      bootstrap();
    }, 1000);
  },
  destroy() {
    console.log("[preview builder] Destroying...");
  },
};
