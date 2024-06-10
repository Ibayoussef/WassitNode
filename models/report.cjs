'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      // define association here
      Report.belongsTo(models.User, { foreignKey: 'reporter_id', as: 'reporter' });
      Report.belongsTo(models.User, { foreignKey: 'reported_user_id', as: 'reportedUser' });
    }
  }

  Report.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reported_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Report',
    hooks: {
      beforeCreate: (report, options) => {
        if (!report.id) {
          report.id = uuidv4();
        }
      },
    }
  });

  return Report;
};
