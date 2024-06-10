'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    static associate(models) {
      // define association here
      Receipt.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Receipt.init({
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
    solopreneur_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Receipt',
    hooks: {
      beforeCreate: (receipt, options) => {
        if (!receipt.id) {
          receipt.id = uuidv4();
        }
      },
    }
  });

  return Receipt;
};
