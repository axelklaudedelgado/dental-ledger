module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('clients', 'status', {
      type: Sequelize.ENUM('Unpaid', 'Paid', 'New'), 
      allowNull: false,
      defaultValue: 'New',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('clients', 'status', {
      type: Sequelize.ENUM('Pending', 'Paid', 'New'), 
      allowNull: false,
      defaultValue: 'New',
    });
  },
};
