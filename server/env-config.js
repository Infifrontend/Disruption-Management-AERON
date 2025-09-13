
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Export environment variables for easy access
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  BACKEND_PORT: process.env.BACKEND_PORT || 3001,
  DB_URL: process.env.DB_URL,
  NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // CORS settings
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
  CORS_ALLOW_CREDENTIALS: process.env.CORS_ALLOW_CREDENTIALS,
  CORS_ALLOWED_METHODS: process.env.CORS_ALLOWED_METHODS,
  CORS_ALLOWED_HEADERS: process.env.CORS_ALLOWED_HEADERS,
  CORS_OPTIONS_SUCCESS_STATUS: process.env.CORS_OPTIONS_SUCCESS_STATUS,
  
  // LLM Provider settings
  LLM_DEFAULT_PROVIDER: process.env.LLM_DEFAULT_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE,
  OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  ANTHROPIC_TEMPERATURE: process.env.ANTHROPIC_TEMPERATURE,
  ANTHROPIC_MAX_TOKENS: process.env.ANTHROPIC_MAX_TOKENS,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_TEMPERATURE: process.env.GEMINI_TEMPERATURE,
  GEMINI_MAX_TOKENS: process.env.GEMINI_MAX_TOKENS,
  GROK_API_KEY: process.env.GROK_API_KEY,
  GROK_MODEL: process.env.GROK_MODEL,
  GROK_BASE_URL: process.env.GROK_BASE_URL,
  GROK_TEMPERATURE: process.env.GROK_TEMPERATURE,
  
  // Database pool settings
  DB_POOL_MIN: process.env.DB_POOL_MIN,
  DB_POOL_MAX: process.env.DB_POOL_MAX,
  DB_POOL_IDLE_TIMEOUT: process.env.DB_POOL_IDLE_TIMEOUT,
  
  // Replit specific
  REPL_SLUG: process.env.REPL_SLUG,
  REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN
};

export default env;
