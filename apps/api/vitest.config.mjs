import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts', 'vitest.setup.ts'],
    exclude: ['src/app.e2e.spec.ts', 'vitest.setup.ts', '**/node_modules/**',
      '**/dist/**'],
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: [/@nestjs\/testing/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.module.ts',
        '**/*.entity.ts',
        '**/*.router.ts',
        '**/*.controller.ts',
        '**/*.guard.ts',
        '**/*.strategy.ts',
        '**/*.filter.ts',
        '**/*.e2e.spec.ts', 
        '**/*.queue.ts', 
        '**/*.config.*',
        '**/*.spec.ts',
        '**/*.test.spec.ts',  
        '**/*.test.ts',
        '**/*.interceptor.ts',
        'src/main.ts',
        'src/database/**',
        'src/trpc/trpc.context.ts',
        'src/trpc/trpc.service.ts',
        'src/trpc/app.router.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
      },
    },
  },
});
