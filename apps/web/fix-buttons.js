const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = [...walk('app'), ...walk('components')];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace button classes
  content = content.replace(/bg-leaf text-ink([^"']*)shadow-md/g, 'bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)]');
  content = content.replace(/bg-gradient-to-r from-leaf to-primary text-ink/g, 'bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)]');
  content = content.replace(/bg-gradient-to-r from-leaf via-primary to-pine([^"']*)text-ink/g, 'bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)]');
  content = content.replace(/hover:bg-mint/g, 'hover:scale-105');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
