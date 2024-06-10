'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Analytics extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  Analytics.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true,
    },
    user_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pro_user_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    project_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    income: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    client_projects: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    pro_projects: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    service_statistics: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Analytics',
  });

  return Analytics;
};
