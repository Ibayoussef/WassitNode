const { Review } = require('../models/index.cjs');
const authMiddleware = require('../utils/getUser.cjs');
const ReviewsController = {
    index: async (req) => {
        const reviews = await Review.findAll();
        return new Response(JSON.stringify(reviews), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },

    store: async (req) => {
        await authMiddleware(req);
        const user = req.user;
        const body = await req.body;

        body.created_by = user.id;
        const review = await Review.create(body);

        return new Response(JSON.stringify({ message: 'Review created successfully', review }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    },

    show: async (req) => {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify(review), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },

    reviewsOfUser: async (req) => {
        const { id } = req.params;
        const reviews = await Review.findAll({ where: { user_id: id } });

        return new Response(JSON.stringify(reviews), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },

    update: async (req) => {
        const { id } = req.params;
        const body = await req.body;


        const review = await Review.findByPk(id);

        if (!review) {
            return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        await review.update(body);

        return new Response(JSON.stringify({ message: 'Review updated successfully', review }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    },

    destroy: async (req) => {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        await Review.destroy({ where: { id } });

        return new Response(JSON.stringify({ message: 'Review deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    },
};
module.exports = ReviewsController