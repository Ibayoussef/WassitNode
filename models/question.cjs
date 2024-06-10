'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsToMany(models.Category, {
        through: 'category_question',
        as: 'categories',
        foreignKey: 'question_id',
      });
      Question.hasMany(models.Answer, {
        as: 'answers',
        foreignKey: 'questions_id', // Ensure this is the correct foreign key in the Answer model
      });
    }
  }

  Question.init({
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
    modelName: 'Question',
    timestamps: true,
  });

  return Question;
};
