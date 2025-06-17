
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url'; // Import for ES module __dirname equivalent

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, '.', ''); // loadEnv can still be used for other client-side env vars if needed
    return {
      // The define block for API_KEY/GEMINI_API_KEY has been removed.
      // The Gemini API key must be managed as a secret in Supabase Edge Functions
      // and should not be exposed to the client-side bundle.
      // define: {
      //   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      // },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // __dirname is now defined
        }
      }
    };
});
