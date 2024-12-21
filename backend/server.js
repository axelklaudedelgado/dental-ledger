const express = require('express');

const app = express();

const { connectToDatabase } = require('./utils/db');
const config = require('./utils/config.js'); 

const start = async () => {
  await connectToDatabase();
  app.listen(config.development.port, () => {
    console.log(`Server running on port ${config.development.port}`);
  })
}

start();