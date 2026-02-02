#!/usr/bin/env node
/**
 * Script to find hardcoded strings in React components
 */

const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '../src/screens');

function findHardcodedStrings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];

  // Skip if already using t() for this line
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip lines that already use t()
    if (line.includes('t(') || line.includes("t'(") || line.includes('t"(')) {
      return;
    }

    // Check for hardcoded Alert.alert
    const alertMatch = line.match(/Alert\.alert\s*\(\s*['"]([^'"]+)['"]/);
    if (alertMatch && !line.includes('{t(')) {
      results.push({
        line: index + 1,
        type: 'Alert.alert',
        text: alertMatch[1],
        fullLine: line.trim(),
      });
    }

    // Check for hardcoded placeholder
    const placeholderMatch = line.match(/placeholder\s*=\s*["']([^"']+)["']/);
    if (placeholderMatch && !line.includes('{t(') && !line.includes('...')) {
      results.push({
        line: index + 1,
        type: 'placeholder',
        text: placeholderMatch[1],
        fullLine: line.trim(),
      });
    }
  });

  return results;
}

function scanDirectory(dir) {
  const allResults = {};

  function scan(currentDir) {
    const files = fs.readdirSync(currentDir);

    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scan(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const results = findHardcodedStrings(filePath);
        if (results.length > 0) {
          const relativePath = path.relative(screensDir, filePath);
          allResults[relativePath] = results;
        }
      }
    });
  }

  scan(dir);
  return allResults;
}

console.log('🔍 Scanning for hardcoded strings...\n');
const results = scanDirectory(screensDir);

let totalCount = 0;
Object.keys(results)
  .sort()
  .forEach(file => {
    console.log(`\n📄 ${file}:`);
    results[file].forEach(item => {
      console.log(`  Line ${item.line} [${item.type}]: "${item.text}"`);
      totalCount++;
    });
  });

console.log(
  `\n\n✓ Found ${totalCount} hardcoded strings in ${
    Object.keys(results).length
  } files`,
);
