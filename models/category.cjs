'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsToMany(models.Question, {
        through: 'category_question',
        as: 'questions',
        foreignKey: 'category_id',
      });
    }
  }

  Category.init({
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
  }, {
    sequelize,
    modelName: 'Category',
  });

  return Category;
};
