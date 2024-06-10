'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class UserAvailability extends Model {
    static associate(models) {
      // define association here
      UserAvailability.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  UserAvailability.init({
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'UserAvailability',
    hooks: {
      beforeCreate: (availability, options) => {
        if (!availability.id) {
          availability.id = uuidv4();
        }
      },
    }
  });
  UserAvailability.updateOrCreate = async function (where, newItem) {
    const foundItem = await UserAvailability.findOne({ where });
    if (!foundItem) {
      const item = await UserAvailability.create({ ...where, ...newItem });
      return { item, created: true };
    }
    const item = await foundItem.update(newItem);
    return { item, created: false };
  };

  return UserAvailability;
};
