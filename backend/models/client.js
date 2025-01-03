const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db');

class Client extends Model {};

Client.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  lastTransactionDate: {
    type: DataTypes.STRING,
    defaultValue: 'No Transactions Yet',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Unpaid', 'Paid', 'New'), 
    allowNull: false,
    defaultValue: 'New',
  },
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'client'
});

module.exports = Client;