// VEKTOR A.I — Environment validation
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  REDIS_URL: z.string().optional(),
  APP_URL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("[vektor-backend] Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
