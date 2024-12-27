const express = require('express');

const app = express();

const { connectToDatabase } = require('./utils/db');
const config = require('./utils/config.js'); 

const clientRouter = require('./routes/clients.js');
const transactionRouter = require('./routes/transactions.js');
const particularRouter = require('./routes/particulars.js');

app.use(express.json());

app.use('/api/clients', clientRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/particulars', particularRouter);

const start = async () => {
  await connectToDatabase();
  app.listen(config.development.port, () => {
    console.log(`Server running on port ${config.development.port}`);
  })
}

start();