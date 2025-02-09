module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('transactions', 'jo_number', {
			type: Sequelize.INTEGER,
			allowNull: false,
			unique: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('transactions', 'jo_number', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 1,
			unique: true,
		})
	},
}
