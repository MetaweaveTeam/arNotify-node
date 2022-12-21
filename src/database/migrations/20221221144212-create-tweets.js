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
     * tweet_id VARCHAR(255) NOT NULL PRIMARY KEY,
     * main_id VARCHAR(255),
     * arweave_tx_id TEXT NOT NULL,
     * protocol_name VARCHAR(255) NOT NULL,
     * FOREIGN KEY (main_id) REFERENCES users(main_id),
     * FOREIGN KEY (protocol_name) REFERENCES protocols(protocol_name)
     */
    return queryInterface.createTable("tweets", {
      tweet_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      main_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: "users",
          key: "main_id",
        },
      },
      arweave_tx_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      protocol_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: "protocols",
          key: "protocol_name",
        },
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
    return queryInterface.dropTable("tweets");
  },
};
