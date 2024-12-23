const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db');

class Particular extends Model {};

Particular.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, 
  },
  type: {
    type: DataTypes.ENUM('Service', 'Payment'), 
    allowNull: false,
  },
}, {
  sequelize,
  underscored: true,
  modelName: 'particular'
});

module.exports = Particular;