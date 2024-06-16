
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
            if (message.includes('ai')) {
                const messages = await ChatController.fetchMessagesBetweenUsers(from, 'f1cb226e-17b7-4480-bfad-5c828d4966ab');
                const fromUser = await User.findByPk(from)
                await ChatController.sendMessage({ fromUserId: from, toUserId: 'f1cb226e-17b7-4480-bfad-5c828d4966ab', content });
                const result = await ChatController.aiGenerate(JSON.stringify(fromUser), content, messages)
                await ChatController.sendMessage({ fromUserId: 'f1cb226e-17b7-4480-bfad-5c828d4966ab', toUserId: from, content: JSON.stringify(result) });
                ws.send(JSON.stringify(result));
                return
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

    if (message.includes('call:')) {
        (async () => {
            const [_, from, to] = message.split(':');
            const callId = `${from}:${to}`;

            if (!subscriptions.has(callId)) {
                subscriptions.set(callId, []);
            }

            subscriptions.get(callId).push(ws);

            ws.on('message', (msg) => {
                const data = JSON.parse(msg);
                if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
                    const targetWs = [...subscriptions.get(callId)].find(client => client !== ws);
                    if (targetWs) {
                        targetWs.send(JSON.stringify(data));
                    }
                }
            });

            // Note: You don't send an initial offer from the server in a real scenario
        })();
    }
}

export default socketRoutes