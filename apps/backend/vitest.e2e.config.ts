import {defineConfig} from "vitest/config";
import * as path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/test/e2e/**/*.e2e-spec.ts"],
        setupFiles: "./src/test/setup-e2e.ts",
        testTimeout: 120000,
        hookTimeout: 120000,
        maxConcurrency: 1,
        pool: 'forks',
        poolOptions: {
            forks: {singleFork: true, isolate: true}
        },
        sequence: {concurrent: false, shuffle: false},
        env: {
            NODE_ENV: 'test'
        },
        reporters: ['default', 'junit'],
        outputFile: 'coverage-e2e/junit.xml',
        coverage: {provider: "v8", reporter: ["text"], reportsDirectory: "coverage-e2e"}
    },
    resolve: {
        alias: {"@": path.resolve(__dirname, "./src")},
        conditions: ["node"]
    }
});
