
import { User } from '../models'
const ChatController = require("../controllers/ChatController.cjs");

const subscriptions = new Map();
const socketRoutes = (ws, message) => {
    message.includes('wallet') && (async () => {
        const userId = message.split(':')[1]
        const user = await User.findByPk(userId);
        const wallet = await user.getWallet()
        ws.send(JSON.stringify(wallet))
    })()
    if (message.includes('chat:')) {
        (async () => {

            const ids = message.split(':')[1];
            const from = ids.split('.')[0];
            const to = message.includes('(') ? ids.split('.')[1].split('(')[0] : ids.split('.')[1];
            const content = message.includes('(') ? message.split('(')[1].replace(')', '') : null;

            if (!content) {
                // Subscribe to messages between these two users
                const channelId = `${from}:${to}`;
                if (!subscriptions.has(channelId)) {
                    subscriptions.set(channelId, []);
                }
                subscriptions.get(channelId).push(ws);

                // Fetch existing messages between the two users
                const messages = await ChatController.fetchMessagesBetweenUsers(from, to);
                ws.send(JSON.stringify(messages));
                return;
            }

            // Save the message to the database
            const result = await ChatController.sendMessage({ fromUserId: from, toUserId: to, content });

            // Broadcast the new message to all subscribed clients
            const channelId = `${from}:${to}`;
            if (subscriptions.has(channelId)) {
                subscriptions.get(channelId).forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(result));
                    }
                });
            }

            ws.send(JSON.stringify(result));
        })();
    }
}

export default socketRoutes