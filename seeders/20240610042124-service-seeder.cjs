'use strict';

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const services = [
      { fr: 'Nettoyage profond', ar: 'تنظيف عميق', maxChoice: 2, price: 250, optional: false, category: 'maid', imageUrl: 'storage/services/cleaning.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage rapide', ar: 'تنظيف سريع', maxChoice: 1, price: 180, optional: false, category: 'maid', imageUrl: 'storage/services/quick.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Repassage et lavage de linge', ar: 'كي و غسيل الملابس ', maxChoice: null, price: 180, optional: false, category: 'maid', imageUrl: 'storage/services/ironingcleaning.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de vitres', ar: 'تنظيف النوافذ', price: 150, maxChoice: null, optional: false, category: 'maid', imageUrl: 'storage/services/windows.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Cuisine', ar: 'طبخ', price: 130, optional: false, maxChoice: null, category: 'maid', imageUrl: 'storage/services/cooking.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Aspirateur', ar: 'استخدام المكنسة الكهربائية', price: 100, maxChoice: null, optional: true, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de poussière', ar: 'تنظيف الغبار', price: 100, maxChoice: null, optional: true, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Autres Services', ar: 'خدمات أخرى', price: 0, optional: false, maxChoice: null, category: 'maid', imageUrl: 'storage/services/other.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de cuisine avec vaisselles', ar: 'تنظيف المطبخ مع الأطباق ', price: 100, maxChoice: null, optional: true, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de vaisselles', ar: 'تنظيف الأطباق ', price: 100, optional: true, maxChoice: null, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de sol', ar: 'تنظيف الأرضية', price: 100, optional: true, maxChoice: null, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage murs et plafonds', ar: 'تنظيف الجدران والسقوف', price: 130, maxChoice: null, optional: true, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage Lustres', ar: 'تنظيف الثريات', price: 130, optional: true, maxChoice: null, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage tapis', ar: 'تنظيف الزرابي', price: 130, optional: true, maxChoice: null, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage salon marocain', ar: 'تنظيف الصالون المغربي', price: 120, maxChoice: null, optional: true, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de terrasse', ar: 'تنظيف التراس', price: 100, optional: true, maxChoice: null, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage de salle de bain', ar: 'تنظيف الحمام', price: 100, optional: true, maxChoice: null, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Nettoyage d’escaliers et entrées d’immeuble', ar: 'تنظيف السلالم ومداخل البناية', price: 100, maxChoice: null, optional: true, category: 'maid', imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Réparation de fuites', ar: 'إصلاح التسريبات', price: 200, maxChoice: null, optional: false, category: 'plumbing', imageUrl: 'storage/services/leakRepair.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Installation de tuyauterie', ar: 'تركيب الأنابيب', price: 300, maxChoice: null, optional: false, category: 'plumbing', imageUrl: 'storage/services/pipeInstallation.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Débouchage de drains', ar: 'فتح المصارف المسدودة', price: 150, maxChoice: null, optional: false, category: 'plumbing', imageUrl: 'storage/services/drainUnclogging.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Réparation de chauffe-eau', ar: 'إصلاح سخانات المياه', price: 250, maxChoice: null, optional: false, category: 'plumbing', imageUrl: 'storage/services/waterHeaterRepair.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Installation de chauffe-eau', ar: 'تركيب سخانات المياه', price: 350, maxChoice: null, optional: false, category: 'plumbing', imageUrl: 'storage/services/waterHeaterInstallation.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Réparation électrique', ar: 'إصلاح كهربائي', price: 200, maxChoice: null, optional: false, category: 'electrician', imageUrl: 'storage/services/electricRepair.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Installation de prises et interrupteurs', ar: 'تركيب المقابس والمفاتيح', price: 150, maxChoice: null, optional: false, category: 'electrician', imageUrl: 'storage/services/switchInstallation.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Installation d’éclairage', ar: 'تركيب الإضاءة', price: 180, maxChoice: null, optional: false, category: 'electrician', imageUrl: 'storage/services/lightingInstallation.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Mise à niveau du tableau électrique', ar: 'ترقية اللوحة الكهربائية', price: 300, maxChoice: null, optional: false, category: 'electrician', imageUrl: 'storage/services/electricalPanelUpgrade.png', createdAt: new Date(), updatedAt: new Date() },
      { fr: 'Installation de climatiseurs', ar: 'تركيب مراوح السقف', price: 200, maxChoice: null, optional: false, category: 'electrician', imageUrl: 'storage/services/ceilingFanInstallation.png', createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('Services', services);

    const deepCleaning = await queryInterface.sequelize.query(
      `SELECT id FROM "Services" WHERE fr = 'Nettoyage profond' LIMIT 1;`
    );

    const quickCleaning = await queryInterface.sequelize.query(
      `SELECT id FROM "Services" WHERE fr = 'Nettoyage rapide' LIMIT 1;`
    );

    const includedServiceNamesDeep = [
      'Nettoyage de poussière',
      'Nettoyage de salle de bain',
      'Nettoyage de cuisine avec vaisselles',
      'Nettoyage de sol'
    ];
    const optionalServiceNamesDeep = [
      'Nettoyage salon marocain',
      'Nettoyage tapis',
      'Repassage et lavage de linge',
      'Nettoyage de vitres',
      'Nettoyage murs et plafonds'
    ];

    for (const includedServiceName of includedServiceNamesDeep) {
      const includedService = await queryInterface.sequelize.query(
        `SELECT id FROM "Services" WHERE fr = '${includedServiceName}' LIMIT 1;`
      );
      if (includedService[0].length > 0) {
        await queryInterface.bulkInsert('included_services', [{
          service_id: deepCleaning[0][0].id,
          included_service_id: includedService[0][0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

    for (const optionalServiceName of optionalServiceNamesDeep) {
      const optionalService = await queryInterface.sequelize.query(
        `SELECT id FROM "Services" WHERE fr = '${optionalServiceName}' LIMIT 1;`
      );
      if (optionalService[0].length > 0) {
        await queryInterface.bulkInsert('optional_services', [{
          service_id: deepCleaning[0][0].id,
          optional_service_id: optionalService[0][0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

    const includedServiceNamesQuick = [
      'Nettoyage de poussière',
      'Nettoyage de vaisselles',
      'Nettoyage de sol'
    ];
    const optionalServiceNamesQuick = [
      'Nettoyage de salle de bain',
      'Nettoyage de cuisine avec vaisselles',
      'Repassage et lavage de linge',
    ];

    for (const includedServiceName of includedServiceNamesQuick) {
      const includedService = await queryInterface.sequelize.query(
        `SELECT id FROM "Services" WHERE fr = '${includedServiceName}' LIMIT 1;`
      );
      if (includedService[0].length > 0) {
        await queryInterface.bulkInsert('included_services', [{
          service_id: quickCleaning[0][0].id,
          included_service_id: includedService[0][0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

    for (const optionalServiceName of optionalServiceNamesQuick) {
      const optionalService = await queryInterface.sequelize.query(
        `SELECT id FROM "Services" WHERE fr = '${optionalServiceName}' LIMIT 1;`
      );
      if (optionalService[0].length > 0) {
        await queryInterface.bulkInsert('optional_services', [{
          service_id: quickCleaning[0][0].id,
          optional_service_id: optionalService[0][0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

    const autre = await queryInterface.sequelize.query(
      `SELECT id FROM "Services" WHERE fr = 'Autres Services' LIMIT 1;`
    );

    if (autre[0].length > 0) {
      const optionalServices = await queryInterface.sequelize.query(
        `SELECT id FROM "Services" WHERE optional = true;`
      );
      for (const optionalService of optionalServices[0]) {
        await queryInterface.bulkInsert('optional_services', [{
          service_id: autre[0][0].id,
          optional_service_id: optionalService.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

    const others = await queryInterface.sequelize.query(
      `SELECT id FROM "Services" WHERE fr NOT IN ('Autres Services', 'Nettoyage rapide', 'Nettoyage profond');`
    );

    for (const service of others[0]) {
      await queryInterface.bulkInsert('included_services', [{
        service_id: service.id,
        included_service_id: service.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('optional_services', null, {});
    await queryInterface.bulkDelete('included_services', null, {});
    await queryInterface.bulkDelete('Services', null, {});
  }
};
