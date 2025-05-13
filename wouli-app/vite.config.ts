
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Use dynamic import for the lovable-tagger
  let taggerPlugin = null;
  if (mode === 'development') {
    try {
      // Using dynamic import to handle ESM module
      const { componentTagger } = await import('lovable-tagger');
      taggerPlugin = componentTagger();
    } catch (err) {
      console.warn('Failed to load lovable-tagger:', err);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: [
        '52458b2e-f3fe-4dc0-8d62-3920a4f53937.lovableproject.com',
        'lovableproject.com',
        '.lovableproject.com',
        'lovable.app',
        '.lovable.app'
      ]
    },
    plugins: [
      react(),
      taggerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    }
  };
});
