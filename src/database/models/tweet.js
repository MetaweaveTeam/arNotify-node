module.exports = (sequelize, DataTypes) => {
  const tweet = sequelize.define("tweet", {
    tweet_id: DataTypes.STRING(255),
    main_id: DataTypes.STRING(255),
    arweave_tx_id: DataTypes.TEXT,
    protocol_name: DataTypes.STRING(255),
  });

  return tweet;
};
