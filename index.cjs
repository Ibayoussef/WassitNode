const express = require('express');
const routes = require('./routes/routes.cjs');
const path = require('path')

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
    const json = await result.json()
    result.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    res.status(result.status).send(json);
  });
});



app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT} ...`);
});
