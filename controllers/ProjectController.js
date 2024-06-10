import { Op } from 'sequelize';
import { Service, User, Project, UserAvailability, Answer } from '../models/index.cjs';// Ensure this path is correct
const { v4: uuidv4 } = require('uuid');
import { sendMail } from '../utils/mailer';
import { authMiddleware } from '../utils/getUser';
export const ProjectController = {
    store: async (req) => {
        try {
            await authMiddleware(req);
            const user = req.user;

            if (!user) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
            }

            const body = await req.json();
            const { name, ar, fr, price, scheduled_date } = body;

            // Validate input
            const errors = [];
            if (!name) errors.push({ field: 'name', message: 'Name is required' });
            if (!ar) errors.push({ field: 'ar', message: 'Arabic name is required' });
            if (!fr) errors.push({ field: 'fr', message: 'French name is required' });

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: errors
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            const service = await Service.findOne({
                where: {
                    [Op.or]: [{ fr: name }, { ar: name }]
                }
            });

            if (!service) {
                return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
            }

            const dbUser = await User.findByPk(user.id);
            if (dbUser.role !== 'client') {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
            }

            const project = await Project.create({
                id: uuidv4(),
                name,
                ar,
                fr,
                price,
                status: 'pending',
                category: service.category,
                scheduled_date,
                client_id: user.id
            });

            const invoiceDetails = {
                id: project.id,
                created_at: project.createdAt,
                scheduled_date: project.scheduled_date,
                price: project.price,
                tax: 2.5,
                total: project.price + 2.5,
                username: dbUser.name,
                user_address: dbUser.address,
                payment_terms: 'payment terms'
            };

            if (dbUser.email) {
                await sendMail({
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: dbUser.email,
                    subject: `AlWassit - Facture numero de facture ${project.id}`,
                    data: invoiceDetails
                });
            }

            return new Response(JSON.stringify(project), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error creating project:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    },
    index: async (req, res) => {
        try {
            const projects = await Project.findAll({
                include: [
                    {
                        model: User,
                        as: 'pros',
                        through: { attributes: [] } // To exclude the join table attributes
                    }
                ]
            });
            return new Response(JSON.stringify(projects), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching projects:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    show: async (req) => {
        try {
            const { id } = req.params;
            const project = await Project.findByPk(id);
            if (!project) {
                return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
            }
            return new Response(JSON.stringify(project), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching project:', error);
            return new Response(JSON.stringify({ error: 'Failed to fetch project' }), { status: 500 });
        }
    },

    update: async (req) => {
        try {
            // Ensure the user is authenticated and authorized
            await authMiddleware(req);
            const user = req.user;

            const { id } = req.params;
            const project = await Project.findByPk(id);
            const body = await req.json();
            if (!project) {
                return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            const authenticatedUserId = user.id;

            if (authenticatedUserId !== project.client_id) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Filter only the fields that are provided in the request body
            const updateData = {};
            const allowedFields = ['name', 'category', 'status', 'price', 'fr', 'ar', 'scheduled_date'];
            for (const field of allowedFields) {
                if (body[field] !== undefined) {
                    updateData[field] = body[field];
                }
            }
            if (Object.keys(updateData).length === 0) {
                return new Response(JSON.stringify({ error: 'No valid fields provided for update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
            const [affectedRows] = await Project.update(updateData, { where: { id } });
            if (affectedRows === 0) {
                return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
            }

            const updatedProject = await Project.findByPk(id); // Fetch the updated project data

            return new Response(JSON.stringify(updatedProject), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating project:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },
    destroy: async (req) => {
        try {
            const { id } = req.params;
            const project = await Project.findByPk(id);
            if (!project) {
                return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
            }
            await project.destroy();
            return new Response(null, { status: 204 });
        } catch (error) {
            console.error('Error deleting project:', error);
            return new Response(JSON.stringify({ error: 'Failed to delete project' }), { status: 500 });
        }
    },

    assignToPro: async (req) => {
        try {
            await authMiddleware(req);
            const { projectId } = req.params;
            const { pro_id } = await req.json();

            const project = await Project.findByPk(projectId);
            if (!project) {
                return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
            }

            const pro = await User.findByPk(pro_id);
            if (!pro) {
                return new Response(JSON.stringify({ error: 'Pro user not found' }), { status: 404 });
            }

            await project.addPro(pro.id);
            await project.save();

            return new Response(JSON.stringify({ message: 'Project assigned to pro successfully', data: pro }), { status: 200 });
        } catch (error) {
            console.error('Error assigning project to pro:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    },

    autoAssign: async (req) => {
        try {
            const { projectId } = req.params;
            const project = await Project.findByPk(projectId);
            if (!project || !project.client_id) {
                return new Response(JSON.stringify({ error: 'Project or client not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            const service = await Service.findOne({ where: { [Op.or]: [{ fr: project.name }, { ar: project.name }] } });
            const client = await User.findByPk(project.client_id);
            if (!client) {
                return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            if (!project.scheduled_date) {
                return new Response(JSON.stringify({ error: 'Project scheduled date not set' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            const date = new Date(project.scheduled_date).toISOString().split('T')[0];

            const prosRequest = await User.findAll({ where: { role: 'pro', domain: service.category } });
            const pros = JSON.parse(JSON.stringify(prosRequest))

            for (const pro of pros) {

                const availability = await UserAvailability.findOne({ where: { user_id: pro.id, date } });
                if (!availability) {
                    await UserAvailability.create({
                        id: uuidv4(),
                        user_id: pro.id,
                        date,
                        is_available: true
                    });
                }
            }

            const availablePros = await User.findAll({
                where: { role: 'pro', domain: service.category },
                include: {
                    model: UserAvailability,
                    as: 'availabilities',
                    where: { date, is_available: true }
                }
            });
            if (availablePros.length === 0) {
                return new Response(JSON.stringify({ error: 'No available pros found' }), { status: 404 });
            }


            const nearestPro = availablePros.reduce((nearest, pro) => {
                const distance = User.calculateDistance(client.coords, pro.coords);
                if (nearest === null || distance < nearest.distance) {
                    return { pro, distance };
                }
                return nearest;
            }, null);
            const nearest = JSON.parse(JSON.stringify(nearestPro))
            if (!nearest) {
                return new Response(JSON.stringify({ error: 'No available pros found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await project.addPro(nearest.pro.id);
            await project.save();

            await UserAvailability.updateOrCreate(
                { user_id: nearest.pro.id, date },
                { is_available: false }
            );

            const invoiceDetails = {
                id: project.id,
                created_at: project.createdAt,
                scheduled_date: project.scheduled_date,
                price: project.price,
                tax: 2.5,
                total: project.price + 2.5,
                username: client.name,
                user_address: client.address,
                payment_terms: 'payment terms',
            };

            if (nearestPro.email) {
                await sendMail({
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: nearestPro.email,
                    subject: `AlWassit - Facture numero de facture ${project.id}`,
                    data: invoiceDetails
                });
            }

            return new Response(JSON.stringify({ message: 'Project assigned to nearest pro successfully', data: nearestPro }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error during auto assignment:', error);
            return new Response(JSON.stringify({ error: 'Failed to auto assign project' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },
    completeProject: async (req) => {
        try {
            await authMiddleware(req);
            const { projectId } = req.params;
            const project = await Project.findByPk(projectId);

            if (!project) {
                return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
            }

            // Assuming 'pro_id' is set when a project is assigned
            const pro = await User.findByPk(project.pro_id);
            if (pro && project.scheduled_date) {
                // Instead of setting 'available' to true, update the 'user_availabilities' for the pro for this project's date
                const date = new Date(project.scheduled_date).toISOString().split('T')[0];
                await UserAvailability.upsert(
                    { user_id: pro.id, date, is_available: true },
                    { where: { user_id: pro.id, date } }
                );
            }

            project.status = 'completed';
            await project.save();

            return new Response(JSON.stringify({ message: 'Project completed successfully' }), { status: 200 });
        } catch (error) {
            console.error('Error completing project:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    },

    calculatePrice: async (req) => {
        try {
            const body = await req.json();
            const { answers } = body; // Array of selected answer IDs

            let totalPrice = 0;

            for (const answerId of answers) {
                const answer = await Answer.findByPk(answerId);
                if (answer) {
                    totalPrice += parseInt(answer.price);
                }
            }

            return new Response(JSON.stringify({ total_price: totalPrice }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error calculating price:', error);
            return new Response(JSON.stringify({ error: 'Failed to calculate price' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
};

