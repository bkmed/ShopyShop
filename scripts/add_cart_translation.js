#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');

// Translation to add
const newKey = {
  section: 'cart',
  key: 'featureUnderConstruction',
  translations: {
    en: 'Feature under construction',
    fr: 'Fonctionnalité en construction',
    es: 'Función en construcción',
    ar: 'الميزة قيد الإنشاء',
    de: 'Funktion im Aufbau',
    zh: '功能建设中',
    hi: 'सुविधा निर्माणाधीन',
  },
};

// Add key to each locale file
Object.keys(newKey.translations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Skip en.json since we already added it manually
  if (lang === 'en') {
    console.log(`- Skipping ${lang}.json (already added manually)`);
    return;
  }

  // Add key to cart section if it doesn't exist
  if (content[newKey.section] && !content[newKey.section][newKey.key]) {
    content[newKey.section][newKey.key] = newKey.translations[lang];

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✓ Added cart.featureUnderConstruction to ${lang}.json`);
  } else if (content[newKey.section]?.[newKey.key]) {
    console.log(`- Key already exists in ${lang}.json`);
  } else {
    console.log(`!  Cart section not found in ${lang}.json`);
  }
});

console.log('\n✓ Translation update complete!');
