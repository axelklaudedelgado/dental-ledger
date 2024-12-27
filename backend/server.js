const express = require('express');

require('express-async-errors');
const app = express();

const { connectToDatabase } = require('./utils/db');
const middleware = require('./utils/middleware.js');
const config = require('./utils/config.js'); 

const clientRouter = require('./routes/clients.js');
const transactionRouter = require('./routes/transactions.js');
const particularRouter = require('./routes/particulars.js');

app.use(express.json());

app.use('/api/clients', clientRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/particulars', particularRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const start = async () => {
  await connectToDatabase();
  app.listen(config.development.port, () => {
    console.log(`Server running on port ${config.development.port}`);
  })
}

start();