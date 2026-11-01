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
  
  content = content.replace(/rounded-3xl/g, 'rounded-xl');
  content = content.replace(/rounded-2xl/g, 'rounded-lg');
  content = content.replace(/rounded-\[36px\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[32px\]/g, 'rounded-xl');
  content = content.replace(/shadow-2xl/g, 'shadow-md');
  content = content.replace(/shadow-xl/g, 'shadow-md');
  
  // Make borders hairline and solid, remove blur
  content = content.replace(/backdrop-blur-[a-z0-9]+/gi, '');
  content = content.replace(/bg-panel\/90/g, 'bg-panel');
  content = content.replace(/bg-panel\/80/g, 'bg-panel');
  content = content.replace(/bg-raised\/80/g, 'bg-raised');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
