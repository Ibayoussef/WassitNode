'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Types of locations for maid services
    const categoriesData = [
      { ar: 'منزل خاص', fr: 'maison prive', createdAt: new Date(), updatedAt: new Date() },    // Private Home
      { ar: 'شقة', fr: 'appartement', createdAt: new Date(), updatedAt: new Date() },          // Apartment
      { ar: 'مكتب تجاري', fr: 'local commercial', createdAt: new Date(), updatedAt: new Date() }, // Commercial Office
      { ar: 'فيلا', fr: 'villa', createdAt: new Date(), updatedAt: new Date() },               // Villa
      { ar: 'شقق فندقية', fr: 'duplex', createdAt: new Date(), updatedAt: new Date() } // Serviced Apartment
    ];

    await queryInterface.bulkInsert('Categories', categoriesData);

    // Retrieve categories from the database
    const categories = await queryInterface.sequelize.query(
      `SELECT id FROM "Categories";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Questions and realistic answers
    const questionsAndAnswers = [
      {
        question: {
          ar: 'ما هو حجم المكان المطلوب تنظيفه؟',
          fr: 'Quelle est la taille de l\'espace à nettoyer ?',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        answers: [
          { ar: 'أقل من 85 متر مربع', fr: 'Moins de 85 mètres carrés', price: 0, createdAt: new Date(), updatedAt: new Date() },
          { ar: 'بين 50 و 100 متر مربع', fr: 'Entre 86 et 120 mètres carrés', price: 10, createdAt: new Date(), updatedAt: new Date() },
          { ar: 'بين 121 و 170 متر مربع', fr: 'Entre 121 et 170 mètres carrés', price: 15, createdAt: new Date(), updatedAt: new Date() },
          { ar: 'بين 121 و 170 متر مربع', fr: 'Plus de 171 mètres carrés', price: 20, createdAt: new Date(), updatedAt: new Date() }
        ]
      },
      {
        question: {
          ar: 'هل لديك حديقة؟',
          fr: 'Vous avez un jardin ?',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        answers: [
          { ar: 'خفيف', fr: 'Oui', price: 0, createdAt: new Date(), updatedAt: new Date() },
          { ar: 'متوسط', fr: 'Non', price: 0, createdAt: new Date(), updatedAt: new Date() }
        ]
      },
      {
        question: {
          ar: 'هل هناك حيوانات أليفة؟',
          fr: 'Y a-t-il des animaux domestiques ?',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        answers: [
          { ar: 'نعم', fr: 'Oui', price: 0, createdAt: new Date(), updatedAt: new Date() },
          { ar: 'لا', fr: 'Non', price: 0, createdAt: new Date(), updatedAt: new Date() }
        ]
      },
      {
        question: {
          ar: 'فيها بالكون؟',
          fr: 'Y a-t-il une terasse ?',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        answers: [
          { ar: 'نعم', fr: 'Oui', price: 0, createdAt: new Date(), updatedAt: new Date() },
          { ar: 'لا', fr: 'Non', price: 0, createdAt: new Date(), updatedAt: new Date() }
        ]
      }
    ];

    const questionsData = questionsAndAnswers.map(qa => ({
      ar: qa.question.ar,
      fr: qa.question.fr,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await queryInterface.bulkInsert('Questions', questionsData);

    const questions = await queryInterface.sequelize.query(
      `SELECT id FROM "Questions";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const answersData = questionsAndAnswers.flatMap((qa, index) => qa.answers.map(answer => ({
      ...answer,
      questions_id: questions[index].id,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    await queryInterface.bulkInsert('Answers', answersData);

    const categoryQuestionsData = categories.flatMap(category => questions.map(question => ({
      category_id: category.id,
      question_id: question.id,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
    await queryInterface.bulkInsert('category_question', categoryQuestionsData);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Answers', null, {});
    await queryInterface.bulkDelete('category_question', null, {});
    await queryInterface.bulkDelete('Questions', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
