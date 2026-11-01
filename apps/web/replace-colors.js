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

const bgMap = {
  '11231e': 'raised',
  '0c1916': 'panel',
  '0c1a17': 'panel',
  '18382e': 'raised/50',
  '142b23': 'raised',
  '0f211c': 'panel',
  '1b3d32': 'raised',
  '05110d': 'background',
  '0f2820': 'panel',
  '10221c': 'panel',
  '173129': 'raised',
  '132721': 'raised',
  '3f6b59': 'primary',
  '0c241c': 'panel',
  '10201c': 'panel',
  '16332a': 'raised',
  '0a1613': 'background',
  '081210': 'background',
  '091a14': 'panel',
  '070e0d': 'background',
  '122b24': 'panel',
  '0d1c18': 'panel',
};

const textMap = {
  '8ab3a0': 'mint',
  '7aa592': 'mint',
  '05110d': 'ink',
  '9fc4b0': 'mint',
  '618c7a': 'mint',
  'a7d7c1': 'mint',
  '071712': 'ink',
  '719987': 'mint',
  '729c89': 'mint',
  '638c7b': 'mint',
  '5e8776': 'mint',
  '8ebfa8': 'mint',
  'c2dfd1': 'foreground',
  'e7f0eb': 'foreground',
  '689481': 'mint'
};

const borderMap = {
  '214036': 'foreground/10',
  '1b332b': 'foreground/10',
  '1b352b': 'foreground/10',
  '528771': 'primary/40',
  '2b594b': 'primary/20',
  '234d40': 'primary/20',
  '1d3d33': 'foreground/10',
  '1d3b31': 'foreground/10',
  '2f5e4e': 'primary/30',
  '1e3b32': 'foreground/10',
  '204e3f': 'primary/20',
  '204439': 'foreground/10',
  '2b5447': 'primary/20',
  '1b3e34': 'foreground/10',
  '316654': 'primary/30',
  '3d7c66': 'primary/40',
  '2b5e4c': 'primary/30',
  '254c3e': 'primary/20',
  '25473d': 'primary/20',
  '336151': 'primary/30',
  '1c3e34': 'foreground/10',
  '1c3830': 'foreground/10',
  '1b382f': 'foreground/10'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace bg
  content = content.replace(/bg-\[#([0-9a-fA-F]{6})\]/g, (match, hex) => {
    const l = hex.toLowerCase();
    return bgMap[l] ? `bg-${bgMap[l]}` : match;
  });

  // Replace text
  content = content.replace(/text-\[#([0-9a-fA-F]{6})\]/g, (match, hex) => {
    const l = hex.toLowerCase();
    return textMap[l] ? `text-${textMap[l]}` : match;
  });

  // Replace border
  content = content.replace(/border-\[#([0-9a-fA-F]{6})\]/g, (match, hex) => {
    const l = hex.toLowerCase();
    return borderMap[l] ? `border-${borderMap[l]}` : match;
  });

  // Common gradients
  content = content.replace(/from-\[#[0-9a-fA-F]{6}\] via-\[#[0-9a-fA-F]{6}\] to-\[#[0-9a-fA-F]{6}\]/g, 'from-panel via-panel to-background');
  content = content.replace(/from-\[#3f6b59\] to-\[#[0-9a-fA-F]{6}\]/gi, 'from-primary to-primary-hover');
  content = content.replace(/from-\[#172e27\] to-\[#0f1e1a\]/gi, 'from-panel to-background');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Done mapping arbitrary hex colors to brand tokens.');
