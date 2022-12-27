module.exports = (sequelize, DataTypes) => {
  const protocol = sequelize.define("protocol", {
    protocol_name: DataTypes.STRING(255),
  });

  return protocol;
};
