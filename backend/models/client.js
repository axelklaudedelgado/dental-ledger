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
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'client'
});

module.exports = Client;