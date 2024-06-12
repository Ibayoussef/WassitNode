const { Message } = require('../models')
const { v4: uuidv4 } = require('uuid');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { Op } = require('sequelize');
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
                    [Op.or]: [
                        {
                            fromUserId: fromUserId,
                            toUserId: toUserId,
                        },
                        {
                            fromUserId: toUserId,
                            toUserId: fromUserId,
                        },
                    ],
                },
                order: [['createdAt', 'ASC']],
            });
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    aiGenerate: async (user, content, history) => {
        const model = new ChatOpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
        const messages = history.map(message => {
            if (message.fromUserId === user.id) {
                return new HumanMessage(message.content)
            } else {
                return new SystemMessage(message.content)
            }
        })
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful assistant who answers user this is his {information} about anything related to Alwassit`,
            ],
            ["placeholder", "{chat_history}"],
            ["human", "{input}"],
        ]);

        const chain = prompt.pipe(model);
        const response = await chain.invoke({
            chat_history: messages,
            input: content,
            information: user
        });
        return response.content;
    }
}

module.exports = ChatController