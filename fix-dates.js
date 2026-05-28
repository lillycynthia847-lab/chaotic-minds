const fs = require('fs');

let content = fs.readFileSync('js/app.js', 'utf8');

// Inject helper function at the top
if (!content.includes('getLocalDateString')) {
  const helper = `// ===== HELPER: Local Date String =====
function getLocalDateString(date) {
  if (!date) date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return \`\${y}-\${m}-\${d}\`;
}

`;
  content = helper + content;
}

// Replace regex
content = content.replace(/(_d|d|date|today|calendarSelectedDate|\(selectedDate \|\| new Date\(\)\)|\(calendarSelectedDate \|\| selectedDate \|\| new Date\(\)\)|\(calendarSelectedDate \|\| selectedDate \|\| today\)|new Date\(\)|new Date\(Date\.now\(\) \+ 2 \* 24 \* 60 \* 60 \* 1000\))\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateString($1)');

fs.writeFileSync('js/app.js', content);
console.log('Fixed dates in app.js');
