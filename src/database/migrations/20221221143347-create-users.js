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
     * main_id VARCHAR(255) NOT NULL PRIMARY KEY,
     * main_handle TEXT NOT NULL UNIQUE,
     * medium TEXT NOT NULL,
     * photo_url TEXT,
     * oauth_access_token TEXT,
     * oauth_access_token_iv TEXT,
     * oauth_secret_token TEXT,
     * oauth_secret_token_iv TEXT
     */
    return queryInterface.createTable("users", {
      main_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      main_handle: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      medium: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      photo_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      oauth_access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      oauth_access_token_iv: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      oauth_secret_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      oauth_secret_token_iv: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.dropTable("users");
  },
};
