import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";

import compress from "astro-compress";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), tailwind(), compress(), sitemap(), robotsTxt()],
  output: "server",
  adapter: cloudflare({
    mode: "directory",
  }),
});
