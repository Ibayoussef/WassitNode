'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    static associate(models) {
      // define association here
      Request.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Request.belongsTo(models.User, { foreignKey: 'validated_by', as: 'validator' });
    }
  }

  Request.init({
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
    validated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    id_photo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    selfie: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_photo_verso: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Request',
    hooks: {
      beforeCreate: (request, options) => {
        if (!request.id) {
          request.id = uuidv4();
        }
      },
    }
  });

  return Request;
};
