import path from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const INPUT = process.env.INPUT;
if (!INPUT) {
  throw new Error("INPUT environment variable is not set. Example: INPUT=src/views/app-dashboard/mcp-app.html");
}

const isDevelopment = process.env.NODE_ENV === "development";

// Extract view name from input path for output naming
// e.g. "src/views/app-dashboard/mcp-app.html" → "app-dashboard"
const viewName = INPUT.match(/views\/([^/]+)\//)?.[1] ?? "mcp-app";

// Resolve the view directory as Vite root so the HTML entry is at the root level
const viewDir = path.dirname(INPUT);

export default defineConfig({
  root: viewDir,
  plugins: [viteSingleFile()],
  build: {
    sourcemap: isDevelopment ? "inline" : undefined,
    cssMinify: !isDevelopment,
    minify: !isDevelopment,
    rollupOptions: {
      input: path.resolve(viewDir, path.basename(INPUT)),
    },
    // outDir is relative to root (viewDir), so go up to mcp-app/dist/views
    outDir: path.resolve("dist/views"),
    emptyOutDir: false,
  },
});
