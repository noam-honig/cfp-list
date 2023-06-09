import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "use vite dev server to also run express in dev",
      configureServer: async (server: any) => {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          process.env["VITE"] = "true";
          try {
            const { app } = await server.ssrLoadModule("src/server");
            app(req, res, next);
          } catch (err) {
            console.error(err);
          }
        });
      },
    },
  ],
});
