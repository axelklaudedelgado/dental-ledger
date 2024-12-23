const Client = require('./client');
const Transaction = require('./transaction');
const Particular = require('./particular');
const transactionParticular = require('./transactionParticular');

Client.sync();
Transaction.sync();
Particular.sync();
transactionParticular.sync();

Client.hasMany(Transaction);
Transaction.belongsTo(Client);

Transaction.belongsToMany(Particular, { through: transactionParticular });
Particular.belongsToMany(Transaction, { through: transactionParticular });

module.exports = { Client, Transaction, Particular, transactionParticular };