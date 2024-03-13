import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Buffer } from "buffer";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig({
  plugins: [
    react(),
    commonjs({
      namedExports: {
        buffer: ["Buffer"]
      }
    })
  ],
  build: {
    outDir: "build",
    rollupOptions: {
      external: ["buffer"],
      output: {
        globals: {
          buffer: "Buffer"
        }
      }
    }
  }, 
  define: {
    "process.env": process.env,
    global: {},
    Buffer: Buffer
  }
});