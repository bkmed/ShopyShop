const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const newName = process.argv[2];

if (!newName) {
  console.error('Please provide a new project name.');
  console.error(
    'Usage: node scripts/rename-project.js <NewName> [NewDisplayName]',
  );
  process.exit(1);
}

// Helper to update file content
const updateFileContent = (filePath, searchValue, replaceValue) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(searchValue, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, replaceValue);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
};

// Recursive file walker
const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (
        f !== 'node_modules' &&
        f !== '.git' &&
        f !== 'build' &&
        f !== 'dist'
      ) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
};

console.log(`Renaming project to "${newName}"...`);

try {
  // 1. Run react-native-rename
  console.log('Running react-native-rename...');
  // usage: npx react-native-rename <newName> -b <bundleIdentifier>
  // We will trust react-native-rename to handle the heavy lifting for Android/iOS
  execSync(`npx react-native-rename "${newName}" --skipGitStatusCheck`, {
    stdio: 'inherit',
  });

  // 2. Custom replacements
  const currentNameLower = 'shopyshop';
  const newNameLower = newName.toLowerCase();

  console.log('Performing custom text replacements...');

  // Update package.json
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  updateFileContent(packageJsonPath, currentNameLower, newNameLower);

  // Update app.json
  const appJsonPath = path.resolve(__dirname, '../app.json');
  updateFileContent(appJsonPath, currentNameLower, newNameLower);

  // Update template.config.js if it exists (it should now)
  const templateConfigPath = path.resolve(__dirname, '../template.config.js');
  updateFileContent(templateConfigPath, 'ShopyShop', newName);

  // Update other files
  // We want to replace "ShopyShop" with NewName and "shopyshop" with newname in specific places
  // Be careful with global replaces.

  // Let's replace in src/ content if needed, though usually code shouldn't hardcode the app name unless necessary.

  // Update webpack configs if they reference the name
  const webpackConfigPath = path.resolve(__dirname, '../webpack.config.js');
  updateFileContent(webpackConfigPath, 'shopyshop', newNameLower);

  // Recursively update all files in src/
  const srcPath = path.resolve(__dirname, '../src');
  if (fs.existsSync(srcPath)) {
    console.log('Updating files in src/ directory...');
    walkDir(srcPath, filePath => {
      // Skip binary files or specific extensions if needed, but for now we try to read all as text
      // We can check extension
      if (/\.(js|jsx|ts|tsx|json|md|html)$/.test(filePath)) {
        // Replace both Capitalized and lowercase
        updateFileContent(filePath, 'ShopyShop', newName); // Case SeNsItIvE match often best for the main name
        updateFileContent(filePath, 'shopyshop', newNameLower);
      }
    });
  }

  console.log(
    'Rename complete! Please reinstall node_modules and headers (pod install) to ensure everything is clean.',
  );
  console.log(`Run: 
    rm -rf node_modules ios/Pods
    npm install
    cd ios && pod install && cd ..
  `);
} catch (error) {
  console.error('Error renaming project:', error);
  process.exit(1);
}
