'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class CreditCard extends Model {
    static associate(models) {
      // define association here
      CreditCard.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  CreditCard.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    card_provider: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Visa, MasterCard, etc.',
    },
    card_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiry_month: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 2],
      },
    },
    expiry_year: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 4],
      },
    }
  }, {
    sequelize,
    modelName: 'CreditCard',
    hooks: {
      beforeCreate: (creditCard, options) => {
        if (!creditCard.id) {
          creditCard.id = uuidv4();
        }
      },
    }
  });

  return CreditCard;
};
