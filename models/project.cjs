'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // define association here
      Project.belongsTo(models.User, { foreignKey: 'client_id', as: 'client' });
      Project.belongsToMany(models.User, { through: 'project_user', foreignKey: 'project_id', otherKey: 'pro_id', as: 'pros' });
    }
  }

  Project.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fr: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ar: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Project',
    hooks: {
      beforeCreate: (project, options) => {
        if (!project.id) {
          project.id = uuidv4();
        }
      },
    }
  });

  return Project;
};
