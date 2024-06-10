
const { Analytics, Project, Service, User } = require('../models/index.cjs');
const authMiddleware = require('../utils/getUser.cjs');
const { Op } = require('sequelize');
const { parseISO, startOfDay } = require('date-fns');

const AnalyticsController = {
    store: async (req) => {
        try {
            await authMiddleware(req);
            const today = startOfDay(new Date());

            const clientCount = await User.count({ where: { role: 'client' } });
            const proCount = await User.count({ where: { role: 'pro' } });
            const projectCount = await Project.count();
            const income = await Project.sum('price') * 0.1;

            const clientProjects = await User.findAll({
                where: { role: 'client' },
                include: { model: Project, as: 'projectsCreated' },
            }).then(users => users.reduce((acc, user) => {
                const totalSpent = user.projectsCreated.reduce((sum, project) => sum + project.price, 0);
                acc[user.id] = {
                    projects_count: user.projectsCreated.length,
                    total_spent: totalSpent,
                };
                return acc;
            }, {}));

            const proProjects = await User.findAll({
                where: { role: 'pro' },
                include: { model: Project, as: 'projectsCompleted' },
            }).then(users => users.reduce((acc, user) => {
                const totalEarned = user.projectsCompleted.reduce((sum, project) => sum + project.price, 0);
                acc[user.id] = {
                    projects_count: user.projectsCompleted.length,
                    total_earned: totalEarned,
                };
                return acc;
            }, {}));

            const serviceStatistics = await Service.findAll().then(services => services.reduce(async (acc, service) => {
                const projectCount = await Project.count({
                    where: {
                        [Op.or]: [{ name: service.fr }, { name: service.ar }]
                    }
                });
                acc[service.fr] = {
                    service_name: service.fr,
                    project_count: projectCount,
                };
                return acc;
            }, {}));

            const analytics = await Analytics.upsert({
                date: today,
                user_count: clientCount,
                pro_user_count: proCount,
                project_count: projectCount,
                income: income,
                client_projects: clientProjects,
                pro_projects: proProjects,
                service_statistics: serviceStatistics,
            });

            return new Response(JSON.stringify(analytics), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error storing analytics:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    index: async (req) => {
        try {
            const analytics = await Analytics.findAll();
            return new Response(JSON.stringify(analytics), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },
};
module.exports = AnalyticsController