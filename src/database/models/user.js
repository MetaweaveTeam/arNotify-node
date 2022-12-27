module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define("user", {
    main_handle: DataTypes.TEXT,
    medium: DataTypes.TEXT,
    photo_url: DataTypes.TEXT,
    oauth_access_token: DataTypes.TEXT,
    oauth_access_token_iv: DataTypes.TEXT,
    oauth_secret_token: DataTypes.TEXT,
    oauth_secret_token_iv: DataTypes.TEXT,
  });

  return user;
};
