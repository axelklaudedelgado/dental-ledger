const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db');

class TransactionParticular extends Model {};

TransactionParticular.init({
  units: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
}, {
  sequelize,
  underscored: true,
  modelName: 'transactionParticular'
});

module.exports = TransactionParticular;