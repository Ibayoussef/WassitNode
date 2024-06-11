const { Message } = require('../models')
const { v4: uuidv4 } = require('uuid');
const ChatController = {

    sendMessage: async (req) => {
        try {
            const { fromUserId, toUserId, content } = req;

            const message = await Message.create({
                id: uuidv4(),
                fromUserId: fromUserId,
                toUserId,
                content,
            });

            // Emit the message to all connected clients
            return message

        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },
    fetchMessages: async (req) => {
        try {
            const messages = await Message.findAll();
            return new Response(JSON.stringify(messages), { status: 200, headers: { 'Content-Type': 'application/json' } })
        } catch (error) {
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Internal Server Error'
            }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
    },
    fetchMessagesBetweenUsers: async (fromUserId, toUserId) => {
        try {
            const messages = await Message.findAll({
                where: {
                    fromUserId: fromUserId,
                    toUserId: toUserId,
                },
            });
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }
}

module.exports = ChatController