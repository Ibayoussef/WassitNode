'use strict';
const {
    Model
} = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Project, { foreignKey: 'client_id', as: 'projectsCreated' });
            User.belongsToMany(models.Project, { through: 'project_user', foreignKey: 'pro_id', otherKey: 'project_id', as: 'projectsCompleted' });
            User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
            User.hasMany(models.Review, { foreignKey: 'created_by', as: 'writtenReviews' });
            User.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });
            User.hasMany(models.UserAvailability, { foreignKey: 'user_id', as: 'availabilities' });
            User.hasMany(models.CreditCard, { foreignKey: 'user_id', as: 'creditCards' });
            User.hasMany(models.Report, { foreignKey: 'reporter_id', as: 'reportedByMe' });
            User.hasMany(models.Report, { foreignKey: 'reported_user_id', as: 'reportedAgainstMe' });
            User.hasOne(models.Wallet, { foreignKey: 'user_id', as: 'wallet' });
            User.hasMany(models.Request, { foreignKey: 'user_id', as: 'requests' });
            User.hasMany(models.Request, { foreignKey: 'validated_by', as: 'validatedRequests' });
            User.hasMany(models.Receipt, { foreignKey: 'user_id', as: 'receipts' });
        }
        static calculateDistance(coords1, coords2) {
            const [lat1, lon1] = coords1.split(',').map(Number);
            const [lat2, lon2] = coords2.split(',').map(Number);

            // Convert latitude and longitude from degrees to radians
            const radLat1 = this.degToRad(lat1);
            const radLon1 = this.degToRad(lon1);
            const radLat2 = this.degToRad(lat2);
            const radLon2 = this.degToRad(lon2);

            // Earth's radius in kilometers
            const earthRadius = 6371;

            // Calculate the difference in coordinates
            const dLat = radLat2 - radLat1;
            const dLon = radLon2 - radLon1;

            // Apply Haversine formula
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            // Calculate distance
            return earthRadius * c; // distance in kilometers
        }

        static degToRad(deg) {
            return deg * (Math.PI / 180);
        }

    }

    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        coords: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_picture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email_verified_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fcm_token: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        domain: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('admin', 'pro', 'client'),
            allowNull: false,
        },
        available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        solopreneur: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        remember_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'User',
        hooks: {
            beforeCreate: (user, options) => {
                if (!user.id) {
                    user.id = uuidv4();
                }
                if (user.password) {
                    user.password = bcrypt.hashSync(user.password, 10);
                }
            },
        }
    });

    return User;
};
