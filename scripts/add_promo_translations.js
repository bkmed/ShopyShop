#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');

// Promo translations for all languages
const promoTranslations = {
  en: {
    title: 'Promotions',
    code: 'Code',
    percentage: 'Percentage (%)',
    expiryDate: 'Expiry Date',
    allCategories: 'All Categories',
    save: 'Save Promo',
    codeAndPercentageRequired: 'Code and Percentage are required',
    failedToSave: 'Failed to save promo',
  },
  fr: {
    title: 'Promotions',
    code: 'Code',
    percentage: 'Pourcentage (%)',
    expiryDate: "Date d'expiration",
    allCategories: 'Toutes les catégories',
    save: 'Enregistrer la promotion',
    codeAndPercentageRequired: 'Le code et le pourcentage sont requis',
    failedToSave: "Impossible d'enregistrer la promotion",
  },
  es: {
    title: 'Promociones',
    code: 'Código',
    percentage: 'Porcentaje (%)',
    expiryDate: 'Fecha de vencimiento',
    allCategories: 'Todas las categorías',
    save: 'Guardar promoción',
    codeAndPercentageRequired: 'Se requieren código y porcentaje',
    failedToSave: 'Error al guardar la promoción',
  },
  ar: {
    title: 'العروض الترويجية',
    code: 'الرمز',
    percentage: 'النسبة المئوية (%)',
    expiryDate: 'تاريخ الانتهاء',
    allCategories: 'جميع الفئات',
    save: 'حفظ العرض',
    codeAndPercentageRequired: 'الرمز والنسبة المئوية مطلوبان',
    failedToSave: 'فشل في حفظ العرض',
  },
  de: {
    title: 'Promotionen',
    code: 'Code',
    percentage: 'Prozentsatz (%)',
    expiryDate: 'Ablaufdatum',
    allCategories: 'Alle Kategorien',
    save: 'Promotion speichern',
    codeAndPercentageRequired: 'Code und Prozentsatz sind erforderlich',
    failedToSave: 'Fehler beim Speichern der Promotion',
  },
  zh: {
    title: '促销活动',
    code: '代码',
    percentage: '百分比 (%)',
    expiryDate: '到期日期',
    allCategories: '所有类别',
    save: '保存促销',
    codeAndPercentageRequired: '代码和百分比是必需的',
    failedToSave: '保存促销失败',
  },
  hi: {
    title: 'प्रचार',
    code: 'कोड',
    percentage: 'प्रतिशत (%)',
    expiryDate: 'समाप्ति तिथि',
    allCategories: 'सभी श्रेणियां',
    save: 'प्रचार सहेजें',
    codeAndPercentageRequired: 'कोड और प्रतिशत आवश्यक हैं',
    failedToSave: 'प्रचार सहेजने में विफल',
  },
};

// Add promos section to each locale file
Object.keys(promoTranslations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Add promos section if it doesn't exist
  if (!content.promos) {
    content.promos = promoTranslations[lang];

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✓ Added promo translations to ${lang}.json`);
  } else {
    console.log(`- Promos section already exists in ${lang}.json`);
  }
});

console.log('\n✓ Translation update complete!');
