"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     *
     * ALTER TABLE `users`
     * ADD arweave_address TEXT NOT NULL;
     */
    return queryInterface.describeTable("users").then((tableDefinition) => {
      if (!tableDefinition["arweave_address"]) {
        return queryInterface.addColumnIfNotExists("users", "arweave_address", {
          type: Sequelize.TEXT,
          allowNull: false,
        });
      } else {
        return Promise.resolve(true);
      }
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn("users", "arweave_address");
  },
};
