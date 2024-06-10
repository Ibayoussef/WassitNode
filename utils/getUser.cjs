const jwt = require('jsonwebtoken');

const authMiddleware = async (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded user information to req.user
    } catch (error) {
        return new Response('Unauthorized', { status: 401 });
    }
};
module.exports = authMiddleware