import { Category, Question, Answer } from '../models/index.cjs';
import { authMiddleware } from '../utils/getUser';

export const QuestionsController = {
    // Display a listing of categories.
    getCategories: async (req) => {
        try {
            await authMiddleware(req);
            const categories = await Category.findAll({
                include: {
                    model: Question,
                    as: 'questions',
                    include: {
                        model: Answer,
                        as: 'answers'
                    }
                }
            });
            return new Response(JSON.stringify(categories), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching categories:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    createCategory: async (req) => {
        try {
            await authMiddleware(req);
            const body = await req.json();
            const category = await Category.create({ ar: body.ar, fr: body.fr });
            return new Response(JSON.stringify(category), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error creating category:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    updateCategory: async (req) => {
        try {
            await authMiddleware(req);
            const { categoryId } = req.params;
            const body = await req.json();
            const category = await Category.findByPk(categoryId);

            if (!category) {
                return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await category.update({ ar: body.ar, fr: body.fr });
            return new Response(JSON.stringify(category), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating category:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    deleteCategory: async (req) => {
        try {
            await authMiddleware(req);
            const { categoryId } = req.params;
            const category = await Category.findByPk(categoryId);

            if (!category) {
                return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await category.destroy();
            return new Response(JSON.stringify({ message: 'Category deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error deleting category:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    // Display questions for a specific category.
    getQuestionsForCategory: async (req) => {
        try {
            await authMiddleware(req);
            const { categoryId } = req.params;
            const category = await Category.findByPk(categoryId, {
                include: {
                    model: Question,
                    as: 'questions'
                }
            });

            if (!category) {
                return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(category.questions), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching questions:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    createQuestion: async (req) => {
        try {
            await authMiddleware(req);
            const { categoryId } = req.params;
            const body = await req.json();
            const category = await Category.findByPk(categoryId);

            if (!category) {
                return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            const question = await Question.create({ ar: body.ar, fr: body.fr });
            await category.addQuestion(question);
            return new Response(JSON.stringify({ question, categoryId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error creating question:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    updateQuestion: async (req) => {
        try {
            await authMiddleware(req);
            const { questionId } = req.params;
            const body = await req.json();
            const question = await Question.findByPk(questionId);

            if (!question) {
                return new Response(JSON.stringify({ message: 'Question not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await question.update({ ar: body.ar, fr: body.fr });
            return new Response(JSON.stringify(question), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating question:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    deleteQuestion: async (req) => {
        try {
            await authMiddleware(req);
            const { categoryId, questionId } = req.params;
            const category = await Category.findByPk(categoryId);
            const question = await Question.findByPk(questionId);

            if (!category || !question) {
                return new Response(JSON.stringify({ message: 'Category or question not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await question.destroy();
            return new Response(JSON.stringify({ message: 'Question deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error deleting question:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    // Display answers for a specific question.
    getAnswersForQuestion: async (req) => {
        try {
            await authMiddleware(req);
            const { questionId } = req.params;
            const question = await Question.findByPk(questionId, {
                include: {
                    model: Answer,
                    as: 'answers'
                }
            });

            if (!question) {
                return new Response(JSON.stringify({ message: 'Question not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(question.answers), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching answers:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    createAnswer: async (req) => {
        try {
            await authMiddleware(req);
            const { questionId } = req.params;
            const body = await req.json();
            const question = await Question.findByPk(questionId);

            if (!question) {
                return new Response(JSON.stringify({ message: 'Question not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            const answer = await Answer.create({
                questions_id: question.id,
                ar: body.ar,
                fr: body.fr,
                price: body.price
            });

            return new Response(JSON.stringify({ answer, questionId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error creating answer:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    updateAnswer: async (req) => {
        try {
            await authMiddleware(req);
            const { answerId } = req.params;
            const body = await req.json();
            const answer = await Answer.findByPk(answerId);

            if (!answer) {
                return new Response(JSON.stringify({ message: 'Answer not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await answer.update({
                ar: body.ar,
                fr: body.fr,
                price: body.price
            });

            return new Response(JSON.stringify(answer), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating answer:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    deleteAnswer: async (req) => {
        try {
            await authMiddleware(req);
            const { answerId } = req.params;
            const answer = await Answer.findByPk(answerId);

            if (!answer) {
                return new Response(JSON.stringify({ message: 'Answer not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            await answer.destroy();
            return new Response(JSON.stringify({ message: 'Answer deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error deleting answer:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
};
