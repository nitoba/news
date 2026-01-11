// drzl.config.ts
import { defineConfig } from '@drzl/cli/config';

export default defineConfig({
  schema: 'src/db/schemas/index.ts',
  outDir: 'src/lib/orpc/router/routes',
  generators: [
    // 1) Zod validators
    { kind: 'zod', path: 'src/lib/validators', schemaSuffix: 'Schema', 
      format: { enabled: true, engine: 'biome', configPath: './biome.json' },      
    },
    // 2) Routers (oRPC adapter), reusing Zod schemas
    {
      kind: 'orpc',
      template: '@drzl/template-orpc-service',
      includeRelations: true,
      format: { enabled: true, engine: 'biome', configPath: './biome.json' },      
      outputHeader: { enabled: true },
      validation: {
        useShared: true,
        library: 'zod',
        importPath: 'src/lib/validators',
        schemaSuffix: 'Schema',
      },
    },
    // 3) Typed services (Drizzle-aware or stub)
    {
      kind: 'service',
      path: 'src/lib/services',
      dataAccess: 'drizzle', // or 'stub'
      dbImportPath: 'src/db',
      schemaImportPath: 'src/db/schemas',
      format: { enabled: true, engine: 'biome', configPath: './biome.json' }
    },
  ],
});