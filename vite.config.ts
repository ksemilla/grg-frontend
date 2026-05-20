import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import fs from "fs"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "single",
    }),
    react(),
    {
      name: "cloudflare-spa-fallback",
      closeBundle() {
        // This runs automatically right after Vite finishes building your code
        const distDir = path.resolve(__dirname, "dist")
        const indexHtml = path.join(distDir, "index.html")
        const fallbackHtml = path.join(distDir, "404.html")

        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, fallbackHtml)
          console.log(
            "Successfully created 404.html SPA fallback for Cloudflare Pages!"
          )
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
