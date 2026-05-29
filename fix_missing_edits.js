const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');

// 1. Fix renderEssentials
appJs = appJs.replace(
  `    card.innerHTML = \`
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full \${glowBg} flex items-center justify-center">
          <span class="material-symbols-outlined">\${item.icon}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">\${item.emoji === item.name ? item.name : \`\${item.emoji} \${item.name}\`}</p>
          <p class="font-sub-label text-sub-label \${statusColor}">\${statusText}</p>
        </div>
      </div>
      <button onclick="replenishItem(\${index})" class="bg-primary text-on-primary font-sub-label text-sub-label px-4 py-2 rounded-full pearl-gloss hover:opacity-90 transition-opacity active:scale-95 shadow-sm">
        \${usageRatio >= 0.8 ? 'Add to cart 🛒' : 'Replenish ✦'}
      </button>
    \`;`,
  `    card.innerHTML = \`
      <div class="flex items-center gap-4 cursor-pointer" onclick="replenishItem(\${index})" title="Replenish item">
        <div class="w-12 h-12 rounded-full \${glowBg} flex items-center justify-center relative">
          <span class="material-symbols-outlined">\${item.icon || 'local_florist'}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">\${item.emoji === item.name ? item.name : \`\${item.emoji || '🌿'} \${item.name}\`}</p>
          <p class="font-sub-label text-sub-label \${statusColor}">\${statusText} (lasts \${item.daysDuration || 30}d)</p>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <button onclick="replenishItem(\${index})" class="bg-primary text-on-primary font-sub-label text-sub-label px-3 py-1.5 rounded-full pearl-gloss hover:opacity-90 transition-opacity active:scale-95 shadow-sm text-[10px] uppercase tracking-wider">
          \${usageRatio >= 0.8 ? 'Add to cart' : 'Replenish'}
        </button>
        <div class="flex items-center gap-2">
          <button onclick="editEssential(\${index})" class="text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
          <button onclick="deleteEssential(\${index})" class="text-on-surface-variant/50 hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>
      </div>
    \`;`
);

// 2. Fix renderThoughts
appJs = appJs.replace(
  `      card.innerHTML = \`
        <div class="flex items-center justify-between">
          <span class="text-xl">\${t.emoji}</span>
          <span class="font-cormorant italic text-sub-label text-secondary">\${t.date}</span>
        </div>
        <p class="font-body-md text-on-surface leading-snug">\${t.text}</p>
      \`;`,
  `      card.innerHTML = \`
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">\${t.emoji}</span>
            <span class="font-cormorant italic text-sub-label text-secondary">\${t.date}</span>
          </div>
          <div class="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
            <button onclick="editThought(\${index})" class="text-on-surface hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
            <button onclick="deleteThought(\${index})" class="text-on-surface hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
          </div>
        </div>
        <p class="font-body-md text-on-surface leading-snug">\${t.text}</p>
      \`;`
);

// 3. Add editThought function
if (!appJs.includes('function editThought(')) {
  appJs += `
function editThought(index) {
  const newText = prompt("Edit your thought:", thoughts[index].text);
  if (newText !== null && newText.trim() !== "") {
    thoughts[index].text = newText.trim();
    localStorage.setItem('cm-thoughts', JSON.stringify(thoughts));
    renderThoughts();
  }
}
`;
}

fs.writeFileSync('js/app.js', appJs);
console.log("Replaced Missing Edits!");
