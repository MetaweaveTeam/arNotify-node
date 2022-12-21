module.exports = (sequelize, DataTypes) => {
  const subscription = sequelize.define("subscription", {
    main_id: DataTypes.STRING(255),
    arweave_address: DataTypes.TEXT,
    protocol_name: DataTypes.STRING(255),
    from_block_height: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
  });

  return subscription;
};
