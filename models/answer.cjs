'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      Answer.belongsTo(models.Question, {
        as: 'questions',
        foreignKey: 'questions_id',
      });
    }
  }

  Answer.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    questions_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Question',
        key: 'id',
      },
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
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Answer',
  });

  return Answer;
};
