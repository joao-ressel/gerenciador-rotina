import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  schema: "./src/db/schema.ts", // Caminho para o arquivo de esquema do banco de dados
  out: "./.migrations", // Diretório onde as migrações serão geradas
  dialect: "postgresql", // Dialeto do banco de dados
  dbCredentials: {
    url: env.DATABASE_URL, // URL de conexão do banco de dados
  },
});
