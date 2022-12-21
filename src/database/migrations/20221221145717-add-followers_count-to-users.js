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
     * ADD followers_count INT NOT NULL;
     */
    return queryInterface.describeTable("users").then((tableDefinition) => {
      if (!tableDefinition["followers_count"]) {
        return queryInterface.addColumn("users", "followers_count", {
          type: Sequelize.INTEGER,
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
    return queryInterface.removeColumn("users", "followers_count");
  },
};
