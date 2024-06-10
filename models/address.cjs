'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      // define association here
      Address.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Address.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('villa', 'flat', 'office'),
      allowNull: false,
    },
    street_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    residence_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    house_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coords: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Address',
    hooks: {
      beforeCreate: (address, options) => {
        if (!address.id) {
          address.id = uuidv4();
        }
      },
    }
  });

  return Address;
};
