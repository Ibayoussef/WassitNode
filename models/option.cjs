'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    static associate(models) {
      Option.belongsToMany(models.Service, {
        through: 'option_service',
        as: 'services',
        foreignKey: 'option_id',
        otherKey: 'service_id',
      });
    }
  }

  Option.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fr: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Option',
    timestamps: true,
  });

  return Option;
};
