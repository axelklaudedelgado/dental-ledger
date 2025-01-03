const Client = require('./client');
const Transaction = require('./transaction');
const Particular = require('./particular');
const transactionParticular = require('./transactionParticular');

Client.hasMany(Transaction, {onDelete: 'CASCADE'});

Transaction.belongsTo(Client);

Transaction.belongsToMany(Particular, { through: transactionParticular });
Particular.belongsToMany(Transaction, { through: transactionParticular });

const syncModels = async () => {
    await Client.sync();
    await Transaction.sync();
    await Particular.sync();
    await transactionParticular.sync();
};

syncModels();

module.exports = { Client, Transaction, Particular, transactionParticular };