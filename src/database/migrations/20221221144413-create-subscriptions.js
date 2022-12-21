"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     * id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
     * main_id VARCHAR(255) NOT NULL,
     * arweave_address TEXT NOT NULL,
     * protocol_name VARCHAR(255) NOT NULL,
     * from_block_height INT NOT NULL,
     * is_active BOOLEAN,
     * FOREIGN KEY (main_id) REFERENCES users(main_id),
     * FOREIGN KEY (protocol_name) REFERENCES protocols(protocol_name)
     */
    return queryInterface.createTable("subscriptions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
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
      arweave_address: {
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
      from_block_height: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    return queryInterface.dropTable("subscriptions");
  },
};
