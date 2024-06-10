'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      // define association here
      Wallet.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Wallet.init({
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
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Wallet',
    hooks: {
      beforeCreate: (wallet, options) => {
        if (!wallet.id) {
          wallet.id = uuidv4();
        }
      },
    }
  });

  return Wallet;
};
