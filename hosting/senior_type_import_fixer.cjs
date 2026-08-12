const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Bruno Gomes/Documents/INSTAPASSO-AI/hosting/src';

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);

// 1. Identify all pure type / interface exports (excluding functions, classes, enums, consts)
const pureTypes = new Set();
const valueExports = new Set();

const exportTypeRegex = /export\s+(?:type|interface)\s+([A-Za-z0-9_]+)/g;
const exportValueRegex = /export\s+(?:function|const|let|var|class|enum)\s+([A-Za-z0-9_]+)/g;

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = exportTypeRegex.exec(content)) !== null) {
    pureTypes.add(match[1]);
  }
  while ((match = exportValueRegex.exec(content)) !== null) {
    valueExports.add(match[1]);
  }
}

// Remove any identifier that is ALSO exported as a value (e.g. enum or const with same name)
for (const val of valueExports) {
  pureTypes.delete(val);
}

console.log(`Found ${pureTypes.size} pure types/interfaces across the codebase.`);
console.log('Pure types sample:', Array.from(pureTypes).slice(0, 15));

// 2. Scan all files and convert imported pureTypes to `type TypeName`
let totalFilesFixed = 0;

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Match import statements: import { ... } from '...'
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g, (fullMatch, importClause, modulePath) => {
    // If it's already `import type { ... }`, skip
    if (fullMatch.trim().startsWith('import type')) return fullMatch;

    const items = importClause.split(',').map(item => item.trim()).filter(Boolean);
    let modified = false;

    const newItems = items.map(item => {
      // If item already starts with `type `, keep it
      if (item.startsWith('type ')) return item;

      // Extract the specifier name (e.g. `Foo as Bar` -> `Foo`)
      const parts = item.split(/\s+as\s+/);
      const importedName = parts[0].trim();

      if (pureTypes.has(importedName)) {
        modified = true;
        return `type ${item}`;
      }
      return item;
    });

    if (modified) {
      return `import { ${newItems.join(', ')} } from '${modulePath}'`;
    }
    return fullMatch;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFilesFixed++;
    console.log(`Fixed type imports in: ${path.relative(srcDir, filePath)}`);
  }
}

console.log(`Senior Audit Complete. Total files updated: ${totalFilesFixed}`);
