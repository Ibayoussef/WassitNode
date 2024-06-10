import { Request, User } from '../models/index.cjs';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../utils/getUser';
import { upload } from '../utils/multer';
import fs from 'fs/promises'
import path from 'path'


export async function handleUpload(file, folder) {
    const dir = `public/storage/${folder}`;
    await fs.mkdir(dir, { recursive: true });
    const uniqueSuffix = `${uuidv4()}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(dir, uniqueSuffix);
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    return `/storage/${folder}/${uniqueSuffix}`;
}
export const RequestController = {
    // Create a new request
    store: async (req) => {
        try {
            await authMiddleware(req);
            const user = req.user;
            const body = await req.formData();

            // Validate input
            const errors = [];
            if (!body.get('id_photo')) errors.push({ field: 'id_photo', message: 'ID photo is required' });
            if (!body.get('id_photo_verso')) errors.push({ field: 'id_photo_verso', message: 'ID photo verso is required' });
            if (!body.get('selfie')) errors.push({ field: 'selfie', message: 'Selfie is required' });

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: errors
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Handle file uploads
            const idPhotoPath = await handleUpload(body.get('id_photo'), 'requests');
            const idPhotoPathVerso = await handleUpload(body.get('id_photo_verso'), 'requests');
            const selfiePath = await handleUpload(body.get('selfie'), 'requests');

            // Create a new request
            const newRequest = await Request.create({
                id: uuidv4(),
                user_id: user.id,
                id_photo: idPhotoPath,
                id_photo_verso: idPhotoPathVerso,
                selfie: selfiePath,
                status: 'pending'
            });

            return new Response(JSON.stringify({ message: 'Request submitted successfully.', request: newRequest }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error creating request:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    // Get all pending requests (for admin)
    index: async (req) => {
        try {
            await authMiddleware(req);
            const requests = await Request.findAll({ where: { status: 'pending' } });
            return new Response(JSON.stringify(requests), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching requests:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    show: async (req) => {
        try {
            await authMiddleware(req);
            const user = req.user;
            const request = await Request.findOne({
                where: user.role !== 'admin' ? { user_id: user.id } : {}
            });

            if (!request) {
                return new Response(JSON.stringify({ error: 'Request not found or access denied' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(request), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching request:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    // Update request status
    updateStatus: async (req) => {
        try {
            await authMiddleware(req);
            const { id } = req.params;
            const body = await req.json();

            // Validate input
            const errors = [];
            if (!body.status) errors.push({ field: 'status', message: 'Status is required' });
            if (!['validated', 'declined'].includes(body.status)) errors.push({ field: 'status', message: 'Invalid status value' });

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: errors
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            const request = await Request.findByPk(id);
            if (!request) {
                return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await request.update({
                status: body.status,
                validated_by: req.user.id
            });

            return new Response(JSON.stringify({ message: 'Request status updated.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating request status:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
};
