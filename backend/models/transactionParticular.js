const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../utils/db')

class TransactionParticular extends Model {}

TransactionParticular.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		transactionId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Transactions',
				key: 'id',
			},
			onDelete: 'CASCADE',
		},
		particularId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Particulars',
				key: 'id',
			},
			onDelete: 'CASCADE',
		},
		units: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0,
		},
		unitPrice: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: 0.0,
		},
	},
	{
		sequelize,
		underscored: true,
		modelName: 'transactionParticular',
	},
)

module.exports = TransactionParticular
