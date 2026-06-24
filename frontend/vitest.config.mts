import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": new URL("./vitest.server-only.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      all: true,
      include: ["lib/**/*.ts", "store/**/*.ts"],
      exclude: ["lib/types.ts", "store/hooks.ts"],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },
    },
  },
})
