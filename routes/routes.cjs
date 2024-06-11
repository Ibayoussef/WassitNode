const AuthController = require("../controllers/AuthController.cjs");
const ProjectController = require("../controllers/ProjectController.cjs");
const AnalyticsController = require("../controllers/AnalyticsController.cjs");
const QuestionsController = require("../controllers/QuestionsController.cjs");
const ServiceController = require("../controllers/ServiceController.cjs");
const RequestController = require("../controllers/RequestController.cjs");
const ReportsController = require("../controllers/ReportsController.cjs");
const BillingController = require("../controllers/BillingController.cjs");
const ChatController = require("../controllers/ChatController.cjs");
const ReviewsController = require("../controllers/ReviewController.cjs");

const routes = [
    { method: "POST", path: "/google-login", handler: AuthController.googleLogin },
    { method: "POST", path: "/login", handler: AuthController.login },
    { method: "GET", path: "/users", handler: AuthController.allUsers },
    { method: "GET", path: "/user", handler: AuthController.authUser },
    { method: "POST", path: "/register", handler: AuthController.register },
    { method: "POST", path: "/logout", handler: AuthController.logout },
    { method: "POST", path: "/refresh", handler: AuthController.refresh },
    { method: "POST", path: "/user", handler: AuthController.update },
    { method: "POST", path: "/user/availability", handler: AuthController.updateAvailability },
    { method: "POST", path: "/user/address", handler: AuthController.storeAddr },
    { method: "DELETE", path: "/address/:addressId", handler: AuthController.destroyAddr },
    { method: "POST", path: "/user/credit-card", handler: AuthController.storeCard },
    { method: "PUT", path: "/credit-card/:cardId", handler: AuthController.updateCard },
    { method: "DELETE", path: "/credit-card/:cardId", handler: AuthController.destroyCard },
    { method: "POST", path: "/send-sms", handler: AuthController.sendVerificationSMS },
    { method: "POST", path: "/verify-sms", handler: AuthController.verify },
    { method: "POST", path: "/projects", handler: ProjectController.store },
    { method: "GET", path: "/projects", handler: ProjectController.index },
    { method: "GET", path: "/projects/:id", handler: ProjectController.show },
    { method: "PATCH", path: "/projects/:id", handler: ProjectController.update },
    { method: "DELETE", path: "/projects/:id", handler: ProjectController.destroy },
    { method: "POST", path: "/projects/:projectId/assign", handler: ProjectController.assignToPro },
    { method: "POST", path: "/projects/:projectId/autoAssign", handler: ProjectController.autoAssign },
    { method: "POST", path: "/projects/:projectId/completeProject", handler: ProjectController.completeProject },
    { method: "POST", path: "/projects/calculatePrice", handler: ProjectController.calculatePrice },
    { method: "GET", path: "/categories", handler: QuestionsController.getCategories },
    { method: "POST", path: "/categories", handler: QuestionsController.createCategory },
    { method: "PUT", path: "/categories/:categoryId", handler: QuestionsController.updateCategory },
    { method: "DELETE", path: "/categories/:categoryId", handler: QuestionsController.deleteCategory },
    { method: "GET", path: "/categories/:categoryId/questions", handler: QuestionsController.getQuestionsForCategory },
    { method: "POST", path: "/categories/:categoryId/questions", handler: QuestionsController.createQuestion },
    { method: "PUT", path: "/questions/:questionId", handler: QuestionsController.updateQuestion },
    { method: "DELETE", path: "/categories/:categoryId/questions/:questionId", handler: QuestionsController.deleteQuestion },
    { method: "GET", path: "/questions/:questionId/answers", handler: QuestionsController.getAnswersForQuestion },
    { method: "POST", path: "/categories/:categoryId/questions/:questionId/answers", handler: QuestionsController.createAnswer },
    { method: "PUT", path: "/answers/:answerId", handler: QuestionsController.updateAnswer },
    { method: "DELETE", path: "/answers/:answerId", handler: QuestionsController.deleteAnswer },
    { method: "POST", path: "/reports", handler: ReportsController.store },
    { method: "GET", path: "/reports", handler: ReportsController.index },
    { method: "POST", path: "/requests", handler: RequestController.store },
    { method: "GET", path: "/requests", handler: RequestController.index },
    { method: "GET", path: "/requests/user/getone", handler: RequestController.show },
    { method: "PUT", path: "/requests/:id", handler: RequestController.updateStatus },
    { method: "GET", path: "/analytics", handler: AnalyticsController.index },
    { method: "POST", path: "/analytics/store", handler: AnalyticsController.store },
    { method: "POST", path: "/services", handler: ServiceController.store },
    { method: "GET", path: "/services", handler: ServiceController.index },
    { method: "GET", path: "/services/:id", handler: ServiceController.show },
    { method: "PUT", path: "/services/:id", handler: ServiceController.update },
    { method: "DELETE", path: "/services/:id", handler: ServiceController.destroy },
    { method: "POST", path: "/services/:id/upload", handler: ServiceController.upload },
    { method: "POST", path: "/services/:id/attach-included", handler: ServiceController.attachIncludedServices },
    { method: "POST", path: "/services/:id/attach-optional", handler: ServiceController.attachOptionalServices },
    { method: "POST", path: "/chat/message", handler: ChatController.sendMessage },
    { method: "GET", path: "/chat/messages", handler: ChatController.fetchMessages },
    { method: "POST", path: "/users/:user/receipts", handler: BillingController.generateReceipt },
    { method: "GET", path: "/receipts", handler: BillingController.getAllReceiptsPdfPaths },
    { method: 'GET', path: '/reviews', handler: ReviewsController.index },
    { method: 'POST', path: '/reviews', handler: ReviewsController.store },
    { method: 'GET', path: '/reviews/:id', handler: ReviewsController.show },
    { method: 'GET', path: '/userReviews/:id', handler: ReviewsController.reviewsOfUser },
    { method: 'PATCH', path: '/reviews/:id', handler: ReviewsController.update },
    { method: 'DELETE', path: '/reviews/:id', handler: ReviewsController.destroy },
    { method: 'GET', path: '/messages', handler: ChatController.fetchMessages },
];

module.exports = routes