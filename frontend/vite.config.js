import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import browserslistToEsbuild from "browserslist-to-esbuild";

export default defineConfig({
  base: "",
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
  },
  build: {
    target: browserslistToEsbuild([">0.2%", "not dead", "not op_mini all"]),
    outDir: "./build"
  },
});
