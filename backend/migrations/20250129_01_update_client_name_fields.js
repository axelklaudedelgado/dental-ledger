module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('clients', 'firstName', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: '',
		})

		await queryInterface.addColumn('clients', 'lastName', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: '',
		})

		await queryInterface.removeColumn('clients', 'name')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('clients', 'name', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: '',
		})

		await queryInterface.removeColumn('clients', 'firstName')
		await queryInterface.removeColumn('clients', 'lastName')
	},
}
