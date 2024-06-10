'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.belongsToMany(models.Service, {
        through: 'included_services',
        as: 'includedServices',
        foreignKey: 'service_id',
        otherKey: 'included_service_id',
      });
      Service.belongsToMany(models.Service, {
        through: 'optional_services',
        as: 'optionalServices',
        foreignKey: 'service_id',
        otherKey: 'optional_service_id',
      });
      Service.belongsToMany(models.Option, {
        through: 'option_service',
        as: 'options',
        foreignKey: 'service_id',
        otherKey: 'option_id',
      });
    }
  }

  Service.init({
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
    maxChoice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    optional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Service',
    timestamps: true,
  });

  return Service;
};
