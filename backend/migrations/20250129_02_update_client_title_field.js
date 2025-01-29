module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('clients', 'title', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('clients', 'title')
	},
}
