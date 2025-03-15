import { bootstrap } from "./bootstrap";

export default {
  bootstrap() {
    setTimeout(() => {
      console.log("[preview builder] Bootstrapping...");
      bootstrap();
    }, 1000);
  },
  destroy() {
    console.log("[preview builder] Destroying...");
  },
};
