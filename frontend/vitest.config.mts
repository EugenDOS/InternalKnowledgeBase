import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      all: true,
      include: [
        "lib/auth.ts",
        "lib/device-storage.ts",
        "lib/dialogs.ts",
        "store/slices/agreement-slice.ts",
        "components/dialogs/dialog-card.tsx",
        "components/dialogs/message-bubble.tsx",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
