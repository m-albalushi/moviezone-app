
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url'; // Import for ES module __dirname equivalent

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    return {
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // __dirname is now defined
        }
      }
    };
});
