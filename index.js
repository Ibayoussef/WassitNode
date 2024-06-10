import express from 'express';
import { sequelize } from './models/index.cjs';
import { routes } from './routes/routes';
import path from 'path';
import fs from 'fs/promises';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // To parse JSON bodies

// Serve static files from 'public' directory
app.use('/storage', express.static(path.join(process.cwd(), 'public', 'storage')));

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Add routes from the routes array
routes.forEach((route) => {
  const method = route.method.toLowerCase();
  app[method](route.path, async (req, res) => {
    req.params = req.params; // Set the parameters
    const result = await route.handler(req);
    result.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    res.status(result.status).send(result.body);
  });
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT} ...`);
});
