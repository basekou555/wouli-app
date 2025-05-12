
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Dynamically import the lovable-tagger module
  let componentTaggerFn = null;
  if (mode === 'development') {
    try {
      const lovableTagger = await import('lovable-tagger');
      componentTaggerFn = lovableTagger.componentTagger;
    } catch (err) {
      console.error('Failed to import lovable-tagger:', err);
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
      mode === 'development' && componentTaggerFn ? componentTaggerFn() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
