const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Bruno Gomes/Documents/INSTAPASSO-AI/hosting/src';
const portalSrc = 'C:/Users/Bruno Gomes/Documents/PORTAL-AI/apps/web/src';

// 1. Copy chat, tickets, auth component folders if they exist in PORTAL-AI
const componentDirsToCopy = ['chat', 'tickets', 'auth', 'common', 'ui'];
componentDirsToCopy.forEach(dir => {
  const portalDirPath = path.join(portalSrc, 'components', dir);
  const destDirPath = path.join(srcDir, 'components', dir);
  if (fs.existsSync(portalDirPath)) {
    if (!fs.existsSync(destDirPath)) fs.mkdirSync(destDirPath, { recursive: true });
    fs.readdirSync(portalDirPath).forEach(f => {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        fs.copyFileSync(path.join(portalDirPath, f), path.join(destDirPath, f));
      }
    });
    console.log(`Copied components/${dir}`);
  }
});

// Also copy operational components into components/iso27001 if needed
const opCompPath = path.join(portalSrc, 'portals', 'operational', 'components');
const destIso = path.join(srcDir, 'components', 'iso27001');
if (!fs.existsSync(destIso)) fs.mkdirSync(destIso, { recursive: true });
if (fs.existsSync(opCompPath)) {
  fs.readdirSync(opCompPath).forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      fs.copyFileSync(path.join(opCompPath, f), path.join(destIso, f));
    }
  });
}

// 2. Now let's fix relative imports in all files in hosting/src/components/iso27001 and hosting/src/lib and hosting/src/hooks
function fixFileImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix ../../../lib/ to ../../lib/
  content = content.replace(/from\s+['"](?:\.\.\/)+lib\/([^'"]+)['"]/g, "from '../../lib/$1'");
  
  // Fix ../../../hooks/ to ../../hooks/
  content = content.replace(/from\s+['"](?:\.\.\/)+hooks\/([^'"]+)['"]/g, "from '../../hooks/$1'");

  // Fix lib/audit-logger importing ./firebase -> in INSTAPASSO-AI firebase is ../firebase or firebase config
  // Let's check where firebase.ts is in INSTAPASSO-AI: hosting/src/firebase.ts or hosting/src/lib/firebase.ts
  if (filePath.endsWith('audit-logger.ts')) {
    // If hosting/src/firebase.ts exists, audit-logger in hosting/src/lib should import from '../firebase'
    if (fs.existsSync(path.join(srcDir, 'firebase.ts'))) {
      content = content.replace(/from\s+['"]\.\/firebase['"]/g, "from '../firebase'");
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixFileImports(fullPath);
    }
  }
}

processDir(srcDir);
console.log('Fixed all relative imports in INSTAPASSO-AI/hosting/src');
