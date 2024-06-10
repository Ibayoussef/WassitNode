import { sequelize } from "./models/index.cjs";
import { routes } from "./routes/routes";
import path from 'path'
import fs from "fs/promises";

function matchRoute(req) {
  const url = new URL(req.url);
  for (const route of routes) {
    const routeRegex = new RegExp(`^${route.path.replace(/:[^\s/]+/g, "([^/]+)")}$`);
    const match = url.pathname.match(routeRegex);
    if (match && req.method === route.method) {
      req.params = {};
      const keys = [...route.path.matchAll(/:([^\s/]+)/g)].map((key) => key[1]);
      keys.forEach((key, index) => {
        req.params[key] = match[index + 1];
      });
      return route.handler(req);
    }
  }
  return new Response("Not Found", { status: 404 });
}
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from 'public' directory
    if (url.pathname.startsWith("/storage")) {
      const filePath = path.join(process.cwd(), "public", url.pathname);
      try {
        const data = await fs.readFile(filePath);
        const extension = path.extname(filePath).slice(1);
        const mimeType = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          svg: "image/svg+xml",
        }[extension] || "application/octet-stream";
        return new Response(data, { status: 200, headers: { 'Content-Type': mimeType } });
      } catch (error) {
        return new Response("File not found", { status: 404 });
      }
    }


    return matchRoute(req);
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);