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
  content = content.replace(/placeholder-\[#[0-9a-fA-F]{6}\]/g, 'placeholder-mint/50');
  content = content.replace(/bg-\[#091413\]/gi, 'bg-background');
  content = content.replace(/bg-\[#0a1613\]/gi, 'bg-background');
  content = content.replace(/text-\[#22c55e\]/gi, 'text-lime');
  content = content.replace(/bg-\[#0f221d\]/gi, 'bg-panel');
  content = content.replace(/bg-\[#204a3d\]/gi, 'bg-primary');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
