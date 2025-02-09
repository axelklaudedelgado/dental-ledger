const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../utils/db')

class Transaction extends Model {}

Transaction.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		joNumber: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		remarks: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		sequelize,
		underscored: true,
		timestamps: true,
		modelName: 'transaction',
	},
)

module.exports = Transaction
