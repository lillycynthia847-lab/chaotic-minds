const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// --- FIX TIMER (HTML) ---
// Add hour input and make task editable
indexHtml = indexHtml.replace(
  '<input type="number" id="focus-input-minutes" value="25" min="1" max="120" class="w-16 bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-center font-body-md text-primary focus:outline-none focus:border-primary">',
  `<input type="number" id="focus-input-hours" value="0" min="0" max="12" class="w-12 bg-surface-container-high border border-outline-variant/40 rounded-lg px-1 py-1 text-center font-body-md text-primary focus:outline-none focus:border-primary"><span class="text-on-surface-variant text-xs font-cormorant italic mr-1">hrs</span>
   <input type="number" id="focus-input-minutes" value="25" min="0" max="59" class="w-12 bg-surface-container-high border border-outline-variant/40 rounded-lg px-1 py-1 text-center font-body-md text-primary focus:outline-none focus:border-primary">`
);

// Make focus task editable
indexHtml = indexHtml.replace(
  '<p class="font-accent-quote text-2xl text-on-surface mb-2 mt-2" id="focus-task-display">Complete the Studio Portfolio Pitch</p>',
  '<input type="text" id="focus-task-display" value="Complete the Studio Portfolio Pitch" class="font-accent-quote text-2xl text-on-surface mb-2 mt-2 bg-transparent text-center border-b border-transparent hover:border-primary/30 focus:border-primary/50 focus:outline-none transition-colors w-full" onchange="saveFocusTask()">'
);


// --- FIX TIMER (JS) ---
appJs = appJs.replace(
  `  const minInput = document.getElementById('focus-input-minutes');
  if (minInput && minInput.value) {
    TOTAL = parseInt(minInput.value) * 60;
  } else {
    TOTAL = 25 * 60;
  }`,
  `  const hrsInput = document.getElementById('focus-input-hours');
  const minInput = document.getElementById('focus-input-minutes');
  let h = hrsInput ? parseInt(hrsInput.value) || 0 : 0;
  let m = minInput ? parseInt(minInput.value) || 0 : 0;
  TOTAL = (h * 3600) + (m * 60);
  if (TOTAL <= 0) TOTAL = 25 * 60;`
);

appJs = appJs.replace(
  `  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  
  const display = document.getElementById('timer-display');
  if (display) {
    display.textContent = \`\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}\`;
  }`,
  `  const h = Math.floor(timerSeconds / 3600);
  const m = Math.floor((timerSeconds % 3600) / 60);
  const s = timerSeconds % 60;
  
  const display = document.getElementById('timer-display');
  if (display) {
    if (h > 0) {
      display.textContent = \`\${h}:\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}\`;
    } else {
      display.textContent = \`\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}\`;
    }
  }`
);

// Save Focus Task
if (!appJs.includes('function saveFocusTask')) {
  appJs += `
function saveFocusTask() {
  const el = document.getElementById('focus-task-display');
  if(el) localStorage.setItem('cm-focus-task', el.value);
}
document.addEventListener('DOMContentLoaded', () => {
  const t = localStorage.getItem('cm-focus-task');
  if(t) {
    const el = document.getElementById('focus-task-display');
    if(el) el.value = t;
  }
});
`;
}


// --- FIX MOOD CALENDAR LOGGING ---
appJs = appJs.replace(
  `let moodByDate = JSON.parse(localStorage.getItem('cm-moods')) || {};`,
  `let moodByDate = JSON.parse(localStorage.getItem('cm-mood-by-date')) || {};`
);
appJs = appJs.replace(
  `localStorage.setItem('cm-moods', JSON.stringify(moodByDate));`,
  `localStorage.setItem('cm-mood-by-date', JSON.stringify(moodByDate));`
);


// --- ADD EDIT FUNCTIONALITY ACROSS THE BOARD ---
// We will insert 'Edit' buttons next to all 'Delete' buttons.
// Groceries
appJs = appJs.replace(
  `delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform ml-1';`,
  `const editBtn = document.createElement('button');
    editBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform ml-2 mr-1';
    editBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">edit</span>';
    editBtn.onclick = () => editGrocery(index);
    actionArea.appendChild(editBtn);
    delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform ml-1';`
);

// Bills & Subs
appJs = appJs.replace(
  `const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';`,
  `const editBtn = document.createElement('button');
      editBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-2';
      editBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">edit</span>';
      editBtn.onclick = () => editBill(index);
      actionsDiv.appendChild(editBtn);
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';`
);

appJs = appJs.replace(
  `const delBtn2 = document.createElement('button');
      delBtn2.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';`,
  `const editBtn2 = document.createElement('button');
      editBtn2.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-2';
      editBtn2.innerHTML = '<span class="material-symbols-outlined text-[16px]">edit</span>';
      editBtn2.onclick = () => editBill(index);
      actionsDiv2.appendChild(editBtn2);
      
      const delBtn2 = document.createElement('button');
      delBtn2.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';`
);

// Debts
appJs = appJs.replace(
  `const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteDebt(index);
      debtActions.appendChild(delBtn);`,
  `const editBtn = document.createElement('button');
      editBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-2';
      editBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">edit</span>';
      editBtn.onclick = () => editDebt(index);
      debtActions.appendChild(editBtn);
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteDebt(index);
      debtActions.appendChild(delBtn);`
);

// Splurges
appJs = appJs.replace(
  `const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteSplurge(index);
      splActions.appendChild(delBtn);`,
  `const editBtn = document.createElement('button');
      editBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-2';
      editBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">edit</span>';
      editBtn.onclick = () => editSplurge(index);
      splActions.appendChild(editBtn);
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteSplurge(index);
      splActions.appendChild(delBtn);`
);

// Expiries
appJs = appJs.replace(
  `const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteExpiry(index);
      exActions.appendChild(delBtn);`,
  `const editBtn = document.createElement('button');
      editBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-2';
      editBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">edit</span>';
      editBtn.onclick = () => editExpiry(index);
      exActions.appendChild(editBtn);
      
      const delBtn = document.createElement('button');
      delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform mr-1';
      delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span>';
      delBtn.onclick = () => deleteExpiry(index);
      exActions.appendChild(delBtn);`
);

// EDIT FUNCTIONS TO INJECT
if (!appJs.includes('function editGrocery')) {
  appJs += `
// ===== EDIT FUNCTIONS =====
function editGrocery(index) {
  const item = groceries[index];
  const newName = prompt("Edit Grocery Item:", item.name);
  if (newName !== null && newName.trim() !== '') {
    groceries[index].name = newName.trim();
    localStorage.setItem('cm-groceries', JSON.stringify(groceries));
    renderGroceries();
  }
}

function editBill(index) {
  const item = bills[index];
  const newName = prompt("Edit Bill Name:", item.name);
  if (newName !== null && newName.trim() !== '') {
    const newAmt = prompt("Edit Bill Amount:", item.amount);
    bills[index].name = newName.trim();
    if(newAmt) bills[index].amount = newAmt;
    localStorage.setItem('cm-bills', JSON.stringify(bills));
    renderBillsAndSubscriptions();
  }
}

function editDebt(index) {
  const item = debts[index];
  const newName = prompt("Edit Goal Name:", item.name);
  if (newName !== null && newName.trim() !== '') {
    debts[index].name = newName.trim();
    localStorage.setItem('cm-debts', JSON.stringify(debts));
    renderDebts();
  }
}

function editSplurge(index) {
  const item = splurges[index];
  const newName = prompt("Edit Splurge Name:", item.name);
  if (newName !== null && newName.trim() !== '') {
    splurges[index].name = newName.trim();
    localStorage.setItem('cm-splurges', JSON.stringify(splurges));
    renderSplurges();
  }
}

function editExpiry(index) {
  const item = expiries[index];
  const newName = prompt("Edit Expiry Name:", item.name);
  if (newName !== null && newName.trim() !== '') {
    expiries[index].name = newName.trim();
    localStorage.setItem('cm-expiries', JSON.stringify(expiries));
    renderExpiries();
  }
}
`;
}


fs.writeFileSync('index.html', indexHtml);
fs.writeFileSync('js/app.js', appJs);
console.log('Edit functionalities and timer fixes applied.');
