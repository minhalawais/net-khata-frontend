const fs = require('fs');
const path = require('path');

const root = 'D:/Projects/NET KHATA';
const srcRoot = path.join(root, 'src');
const toastPath = path.join(srcRoot, 'utils', 'toast.ts');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (fullPath === toastPath) continue;
    rewrite(fullPath);
  }
}

function rewrite(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!/import\s*\{\s*toast\s*\}\s*from/.test(content)) return;

  const relative = path.relative(path.dirname(filePath), toastPath).replace(/\\/g, '/');
  const importPath = relative.startsWith('.') ? relative : `./${relative}`;
  const importLine = `import { toast } from \"${importPath}\"\n`;

  content = content.replace(/^import\s*\{\s*toast\s*\}\s*from\s*['"][^'"]*['"];?\r?\n/mg, '');

  if (/^"use client"\r?\n\r?\n/.test(content)) {
    content = content.replace(/^"use client"\r?\n\r?\n/, `"use client"\n\n${importLine}`);
  } else {
    content = `${importLine}${content}`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

walk(srcRoot);
console.log('toast imports fixed');
