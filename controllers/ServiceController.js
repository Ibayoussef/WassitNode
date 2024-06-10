import { Service } from '../models/index.cjs';
import { Op } from 'sequelize';
import { authMiddleware } from '../utils/getUser';

export const ServiceController = {
    index: async (req) => {
        try {
            await authMiddleware(req);
            const services = await Service.findAll({
                include: ['includedServices', 'optionalServices']
            });
            services.map(service => {
                if (service.imageUrl) {
                    service.imageUrl = `${req.url.origin}/${service.imageUrl}`;
                }
                return service;
            });
            return new Response(JSON.stringify(services), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching services:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    store: async (req) => {
        const uploadMiddleware = upload.single('imageUrl');
        await new Promise((resolve, reject) => {
            uploadMiddleware(req, null, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        try {
            const body = await req.json();
            const { name, ar, fr, price, scheduled_date } = body;

            // Validate input
            const errors = [];
            if (!name) errors.push({ field: 'name', message: 'Name is required' });
            if (!ar) errors.push({ field: 'ar', message: 'Arabic name is required' });
            if (!fr) errors.push({ field: 'fr', message: 'French name is required' });
            if (!category) errors.push({ field: 'category', message: 'Category is required' });
            if (price == null) errors.push({ field: 'price', message: 'Price is required' });
            if (optional == null) errors.push({ field: 'optional', message: 'Optional is required' });

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: errors
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            const service = await Service.create({
                id: uuidv4(),
                name,
                ar,
                fr,
                price,
                status: 'pending',
                category,
                scheduled_date,
                client_id: userId
            });

            if (req.file) {
                service.imageUrl = `services/${req.file.filename}`;
            }

            await service.save();

            return new Response(JSON.stringify(service), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error creating service:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }
    },

    show: async (req) => {
        try {
            await authMiddleware(req);
            const { id } = req.params;
            const service = await Service.findByPk(id, {
                include: ['includedServices', 'optionalServices']
            });
            if (!service) {
                return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify(service), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching service:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    update: async (req) => {
        try {
            await authMiddleware(req);
            const { id } = req.params;
            const body = await req.json();

            const service = await Service.findByPk(id);
            if (!service) {
                return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Handle file upload
            if (body.imageUrl) {
                // Delete old image
                if (service.imageUrl) {
                    await Storage.delete(service.imageUrl);
                }
                // Store new image
                body.imageUrl = await req.file('imageUrl').store('services', { disk: 'public' });
            }

            await service.update(body);

            if (body.included_services) {
                await service.setIncludedServices(body.included_services);
            }

            if (body.optional_services) {
                await service.setOptionalServices(body.optional_services);
            }

            return new Response(JSON.stringify(service), { status: 200, headers: { 'Content-Type': 'application/json' } });

        } catch (error) {
            console.error('Error updating service:', error);
            return new Response(JSON.stringify({ error: 'Failed to update service' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    destroy: async (req) => {
        try {
            await authMiddleware(req);
            const { id } = req.params;
            const service = await Service.findByPk(id);
            if (!service) {
                return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Delete the image
            if (service.imageUrl) {
                await Storage.delete(service.imageUrl);
            }

            await service.destroy();
            return new Response(null, { status: 204 });

        } catch (error) {
            console.error('Error deleting service:', error);
            return new Response(JSON.stringify({ error: 'Failed to delete service' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    attachIncludedServices: async (req) => {
        try {
            await authMiddleware(req);
            const { parentId } = req.params;
            const body = await req.json();

            const service = await Service.findByPk(parentId);
            if (!service) {
                return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await service.setIncludedServices(body.included_services);
            return new Response(JSON.stringify(service.includedServices), { status: 200, headers: { 'Content-Type': 'application/json' } });

        } catch (error) {
            console.error('Error attaching included services:', error);
            return new Response(JSON.stringify({ error: 'Failed to attach included services' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    attachOptionalServices: async (req) => {
        try {
            await authMiddleware(req);
            const { parentId } = req.params;
            const body = await req.json();

            const service = await Service.findByPk(parentId);
            if (!service) {
                return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await service.setOptionalServices(body.optional_services);
            return new Response(JSON.stringify(service.optionalServices), { status: 200, headers: { 'Content-Type': 'application/json' } });

        } catch (error) {
            console.error('Error attaching optional services:', error);
            return new Response(JSON.stringify({ error: 'Failed to attach optional services' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
};
