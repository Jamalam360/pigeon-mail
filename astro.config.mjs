import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), tailwind()],
  output: "server",
  adapter: cloudflare({ mode: "directory" }),
});
