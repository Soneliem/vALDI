const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  skins: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  tokens: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
});
