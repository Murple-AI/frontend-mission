import { createApp } from "vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import App from "./App.vue";
import "./style.css";

async function prepareApp() {
  const { worker } = await import("./mocks/browser");
  return worker.start();
}
const queryClient = new QueryClient();
const app = createApp(App);

prepareApp().then(() => {
  app.use(VueQueryPlugin, { queryClient });
  // test
  app.mount("#app");
});
