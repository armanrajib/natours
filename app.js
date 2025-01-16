import fs from 'fs';
import express from 'express';
import appRoot from 'app-root-path';

const app = express();

const tours = JSON.parse(
  fs.readFileSync(`${appRoot}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
