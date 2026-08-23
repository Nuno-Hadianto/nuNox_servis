import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './database/drizzleSchema.ts',
  out: './database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './database/nunox_servis.db',
  },
});
