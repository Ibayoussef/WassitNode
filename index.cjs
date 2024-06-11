import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static'
import { join } from 'path';
const routes = require('./routes/routes.cjs')

const app = new Hono();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(async (c, next) => {
  if (c.req.header('Content-Type') === 'application/json') {
    c.req.body = await c.req.json();
  }
  await next();
});

// Serve static files from 'public' directory
app.use('/storage/*', serveStatic({ root: join(process.cwd(), 'public', 'storage') }));

// Root route
app.get('/', (c) => c.text('Hello, world!'));

// Add routes from the routes array
routes.forEach((route) => {
  const method = route.method.toLowerCase();
  app[method](route.path, async (c) => {
    c.req.params = c.req.param(); // Set the parameters
    const result = await route.handler(c.req);
    const json = await result.json();
    result.headers.forEach((value, name) => {
      c.res.headers.append(name, value);
    });
    return c.json(json);
  });
});

export default {
  port: PORT,
  fetch: app.fetch,
} 