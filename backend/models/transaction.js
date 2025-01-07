const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../utils/db')

class Transaction extends Model {
	static async generateJONumber() {
		const lastTransaction = await Transaction.findOne({
			order: [['createdAt', 'DESC']],
		})
		return lastTransaction ? lastTransaction.joNumber + 1 : 1
	}
}

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
			defaultValue: 1,
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
