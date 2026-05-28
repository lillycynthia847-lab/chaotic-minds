const fs = require('fs');

// --- UPDATE INDEX.HTML ---
let indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Add Mood Modal
if (!indexHtml.includes('mood-modal')) {
  const moodModalHtml = `
<!-- MOOD MODAL -->
<div id="mood-modal" class="modal-overlay fixed inset-0 z-[110] bg-surface-bright/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="modal-content w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_15px_40px_rgba(212,149,106,0.12)] p-6">
    <h3 class="font-display-italic text-2xl text-primary mb-4 italic">Log your mood</h3>
    <div class="space-y-4 mb-6">
      <div class="flex flex-wrap gap-2 justify-center">
        <label class="cursor-pointer">
          <input type="radio" name="mood-radio" value="Calm" class="peer sr-only" checked>
          <div class="px-4 py-2 rounded-full border border-outline-variant/40 peer-checked:bg-primary peer-checked:text-white transition-colors text-sm">🌸 Calm</div>
        </label>
        <label class="cursor-pointer">
          <input type="radio" name="mood-radio" value="Energetic" class="peer sr-only">
          <div class="px-4 py-2 rounded-full border border-outline-variant/40 peer-checked:bg-[#D4956A] peer-checked:text-white transition-colors text-sm">🌿 Energetic</div>
        </label>
        <label class="cursor-pointer">
          <input type="radio" name="mood-radio" value="Anxious" class="peer sr-only">
          <div class="px-4 py-2 rounded-full border border-outline-variant/40 peer-checked:bg-[#78727e] peer-checked:text-white transition-colors text-sm">☁️ Anxious</div>
        </label>
        <label class="cursor-pointer">
          <input type="radio" name="mood-radio" value="Low" class="peer sr-only">
          <div class="px-4 py-2 rounded-full border border-outline-variant/40 peer-checked:bg-[#5f5a65] peer-checked:text-white transition-colors text-sm">🌧️ Low</div>
        </label>
      </div>
      <div>
        <label class="block font-sub-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 mt-4">Journal Note (Optional)</label>
        <textarea id="mood-input-note" class="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors text-sm" placeholder="Why do you feel this way?" rows="3"></textarea>
      </div>
    </div>
    <div class="flex gap-3 justify-end">
      <button onclick="closeModal('mood-modal')" class="px-5 py-2.5 rounded-full bg-surface-container-high border border-outline-variant/40 font-sub-label text-on-surface-variant hover:bg-outline-variant/20 transition-colors">Cancel</button>
      <button onclick="submitMoodLog()" class="px-6 py-2.5 rounded-full rose-gold-gradient text-white font-sub-label pearl-gloss shadow-md hover:opacity-95 active:scale-95 transition-transform">Save ✦</button>
    </div>
  </div>
</div>
`;
  indexHtml = indexHtml.replace('<!-- APPOINTMENT FORM MODAL -->', moodModalHtml + '\n<!-- APPOINTMENT FORM MODAL -->');
}

// 2. Add Log Mood button to Calendar Agenda Footer
indexHtml = indexHtml.replace(
  '<div id="calendar-agenda-footer" class="bg-surface-container-low/60 p-4 border-t border-outline-variant/20 flex flex-col gap-2">',
  '<div id="calendar-agenda-footer" class="bg-surface-container-low/60 p-4 border-t border-outline-variant/20 flex flex-col gap-2 relative">'
);

// 3. Update Focus Timer to allow custom input
indexHtml = indexHtml.replace(
  '<p class="font-accent-quote text-2xl text-on-surface mb-6 mt-2">Complete the Studio Portfolio Pitch</p>',
  `<p class="font-accent-quote text-2xl text-on-surface mb-2 mt-2" id="focus-task-display">Complete the Studio Portfolio Pitch</p>
   <div class="flex items-center gap-2 mb-6">
     <input type="number" id="focus-input-minutes" value="25" min="1" max="120" class="w-16 bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-center font-body-md text-primary focus:outline-none focus:border-primary">
     <span class="text-on-surface-variant text-sm font-cormorant italic">minutes</span>
   </div>`
);
indexHtml = indexHtml.replace(
  'Begin 5 min focus <span>✦</span>',
  'Begin focus <span>✦</span>'
);

fs.writeFileSync('index.html', indexHtml);

// --- UPDATE APP.JS ---
let appJs = fs.readFileSync('js/app.js', 'utf8');

// 1. Service Worker Cache Version
// This is actually in sw.js, which I'll do separately.

// 2. Timer Logic
appJs = appJs.replace('const TOTAL = 300; // 5 Minutes', 'let TOTAL = 300; // Default 5 Minutes');
appJs = appJs.replace(
  'function openFocus() {',
  `function openFocus() {
  const minInput = document.getElementById('focus-input-minutes');
  if (minInput && minInput.value) {
    TOTAL = parseInt(minInput.value) * 60;
  } else {
    TOTAL = 25 * 60;
  }
  timerSeconds = TOTAL;
  renderTimer();`
);

// 3. Mood Logic
appJs = appJs.replace(
  'let moodByDate = {}; // Maps "YYYY-MM-DD" to mood string',
  `let moodByDate = JSON.parse(localStorage.getItem('cm-moods')) || {}; // Maps "YYYY-MM-DD" to {mood, note}`
);
appJs = appJs.replace(
  'const _defaultMoods = [\'Calm\', \'Lit\', \'Chaos\'];\n  for (let i = 0; i < 7; i++) {\n    const _d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);\n    moodByDate[getLocalDateString(_d)] = _defaultMoods[i % _defaultMoods.length];\n  }',
  '' // Remove mock moods
);

// Add mood logging functions
if (!appJs.includes('function openMoodModal')) {
  const moodFunctions = `
// ===== MOOD LOGGING =====
function openMoodModal() {
  openModal('mood-modal');
}

function submitMoodLog() {
  const radios = document.getElementsByName('mood-radio');
  let selectedMood = 'Calm';
  for (let r of radios) {
    if (r.checked) { selectedMood = r.value; break; }
  }
  const note = document.getElementById('mood-input-note').value;
  
  const dateStr = getLocalDateString(calendarSelectedDate || selectedDate || new Date());
  
  moodByDate[dateStr] = { mood: selectedMood, note: note };
  localStorage.setItem('cm-moods', JSON.stringify(moodByDate));
  
  closeModal('mood-modal');
  renderCalendar();
  if (document.getElementById('calendar-modal').classList.contains('open')) {
    renderCalendarAgenda(calendarSelectedDate);
  }
  renderMoodGarden();
}
`;
  appJs = appJs + '\n' + moodFunctions;
}

// 4. Update Calendar Agenda to show mood and 'Log Mood' button
appJs = appJs.replace(
  `container.innerHTML = '';
  
  const dateStr = getLocalDateString(date);`,
  `container.innerHTML = '';
  
  const dateStr = getLocalDateString(date);
  const dayMood = moodByDate[dateStr];
  
  // Mood Header
  const moodHeader = document.createElement('div');
  moodHeader.className = 'flex items-center justify-between mb-2';
  
  let moodDisplay = '<span class="text-xs italic text-on-surface-variant font-cormorant">No mood logged.</span>';
  if (dayMood) {
    const moodIcons = { 'Calm': '🌸 Calm', 'Energetic': '🌿 Energetic', 'Anxious': '☁️ Anxious', 'Low': '🌧️ Low' };
    const mType = typeof dayMood === 'string' ? dayMood : dayMood.mood;
    const mNote = dayMood.note ? \` - "\${dayMood.note}"\` : '';
    moodDisplay = \`<span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">\${moodIcons[mType] || mType}</span><span class="text-[10px] text-on-surface-variant italic ml-2">\${mNote}</span>\`;
  }
  
  moodHeader.innerHTML = \`
    <div class="flex items-center gap-2">\${moodDisplay}</div>
    <button onclick="openMoodModal()" class="text-[10px] uppercase tracking-wider font-semibold text-primary hover:opacity-80 flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full"><span class="material-symbols-outlined text-[14px]">mood</span> Log Mood</button>
  \`;
  container.appendChild(moodHeader);
`
);

// Fix Calendar dot rendering
appJs = appJs.replace(
  `const moodStr = moodByDate[dateKey];
    if (moodStr) {`,
  `const moodObj = moodByDate[dateKey];
    if (moodObj) {
      const moodStr = typeof moodObj === 'string' ? moodObj : moodObj.mood;`
);

// 5. Add Delete buttons to all render functions
// For Bills
appJs = appJs.replace(
  /const actionsDiv = document\.createElement\('div'\);\s*actionsDiv\.className = 'flex items-center gap-2';\s*if \(!bill\.paid\) \{/,
  `const actionsDiv = document.createElement('div');
      actionsDiv.className = 'flex items-center gap-2';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteBill(index);
      actionsDiv.appendChild(delBtn);

      if (!bill.paid) {`
);

// For Subscriptions (shares bills array)
appJs = appJs.replace(
  /const actionsDiv2 = document\.createElement\('div'\);\s*actionsDiv2\.className = 'flex items-center gap-2';\s*if \(!sub\.paid\) \{/,
  `const actionsDiv2 = document.createElement('div');
      actionsDiv2.className = 'flex items-center gap-2';
      
      const delBtn2 = document.createElement('button');
      delBtn2.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn2.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn2.onclick = () => deleteBill(index);
      actionsDiv2.appendChild(delBtn2);

      if (!sub.paid) {`
);

// For Debts
appJs = appJs.replace(
  /const debtActions = document\.createElement\('div'\);\s*debtActions\.className = 'flex items-center gap-2';/,
  `const debtActions = document.createElement('div');
      debtActions.className = 'flex items-center gap-2';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteDebt(index);
      debtActions.appendChild(delBtn);`
);

// For Splurges
appJs = appJs.replace(
  /const splActions = document\.createElement\('div'\);\s*splActions\.className = 'flex items-center gap-2';/,
  `const splActions = document.createElement('div');
      splActions.className = 'flex items-center gap-2';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteSplurge(index);
      splActions.appendChild(delBtn);`
);

// For Rhythms
appJs = appJs.replace(
  /const rightDiv = document\.createElement\('div'\);\s*rightDiv\.className = 'flex flex-col items-end gap-2';/,
  `const rightDiv = document.createElement('div');
      rightDiv.className = 'flex flex-col items-end gap-2 relative';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'absolute -top-1 -right-1 text-on-surface-variant/30 hover:text-primary active:scale-90 transition-transform';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">close</span>';
      delBtn.onclick = () => deleteRhythm(index);
      rightDiv.appendChild(delBtn);`
);

// For Expiries
appJs = appJs.replace(
  /const exActions = document\.createElement\('div'\);\s*exActions\.className = 'flex items-center gap-2';/,
  `const exActions = document.createElement('div');
      exActions.className = 'flex items-center gap-2';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteExpiry(index);
      exActions.appendChild(delBtn);`
);

// For Essentials
appJs = appJs.replace(
  /const iconDiv = document\.createElement\('div'\);\s*iconDiv\.className = 'w-10 h-10 rounded-full bg-primary\/10 flex items-center justify-center text-primary mb-2';/,
  `const iconDiv = document.createElement('div');
      iconDiv.className = 'w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 relative';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full text-on-surface-variant/50 border border-outline-variant/20 hover:text-primary active:scale-90 flex items-center justify-center';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[12px]">close</span>';
      delBtn.onclick = (e) => { e.stopPropagation(); deleteEssential(index); };
      iconDiv.appendChild(delBtn);`
);

// For Groceries
appJs = appJs.replace(
  /actionArea\.appendChild\(checkBox\);/,
  `actionArea.appendChild(checkBox);
    
    const delBtn = document.createElement('button');
    delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform ml-1';
    delBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">delete</span>';
    delBtn.onclick = () => deleteGrocery(index);
    actionArea.appendChild(delBtn);`
);

// Inject delete functions
if (!appJs.includes('function deleteBill')) {
  const deleteFunctions = `
// ===== DELETE FUNCTIONS =====
function deleteBill(index) { bills.splice(index, 1); localStorage.setItem('cm-bills', JSON.stringify(bills)); renderBillsAndSubscriptions(); }
function deleteDebt(index) { debts.splice(index, 1); localStorage.setItem('cm-debts', JSON.stringify(debts)); renderDebts(); }
function deleteSplurge(index) { splurges.splice(index, 1); localStorage.setItem('cm-splurges', JSON.stringify(splurges)); renderSplurges(); }
function deleteRhythm(index) { rhythms.splice(index, 1); localStorage.setItem('cm-rhythms', JSON.stringify(rhythms)); renderRhythms(); }
function deleteExpiry(index) { expiries.splice(index, 1); localStorage.setItem('cm-expiries', JSON.stringify(expiries)); renderExpiries(); }
function deleteEssential(index) { essentials.splice(index, 1); localStorage.setItem('cm-essentials', JSON.stringify(essentials)); renderEssentials(); }
function deleteGrocery(index) { groceries.splice(index, 1); localStorage.setItem('cm-groceries', JSON.stringify(groceries)); renderGroceries(); }
function deleteThought(index) { thoughts.splice(index, 1); localStorage.setItem('cm-thoughts', JSON.stringify(thoughts)); renderThoughts(); }
`;
  appJs += '\n' + deleteFunctions;
}

fs.writeFileSync('js/app.js', appJs);
console.log('Update applied');
