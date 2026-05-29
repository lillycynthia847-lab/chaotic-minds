const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// ==========================================
// 1. UPDATE INDEX.HTML
// ==========================================

// Add Essential modal button in header
indexHtml = indexHtml.replace(
  '<div class="flex items-center gap-2 mb-4"><span class="text-primary text-xs">◆</span><h3 class="font-section-label text-section-label text-primary">Running Out</h3></div>',
  `<div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2"><span class="text-primary text-xs">◆</span><h3 class="font-section-label text-section-label text-primary">Running Out</h3></div>
    <button onclick="openAddEssentialModal()" class="text-primary hover:text-primary-container active:scale-95 transition-transform"><span class="material-symbols-outlined">add_circle</span></button>
  </div>`
);

// Inject Essential Form Modal HTML right before BILL FORM MODAL
const essentialModalHtml = `
<!-- ESSENTIAL FORM MODAL -->
<div id="essential-modal" class="modal-overlay fixed inset-0 z-[100] bg-surface-bright/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="modal-content w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_15px_40px_rgba(212,149,106,0.12)] p-6">
    <h3 class="font-display-italic text-2xl text-primary mb-4 italic" id="essential-modal-title">Add Essential Item</h3>
    <div class="space-y-4 mb-6">
      <div>
        <label class="block font-sub-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Item Name</label>
        <input type="text" id="essential-input-name" class="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Toilet Paper">
      </div>
      <div>
        <label class="block font-sub-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Duration (Days it lasts)</label>
        <input type="number" id="essential-input-duration" class="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 30" value="30">
      </div>
      <div>
        <label class="block font-sub-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Emoji/Icon (Optional)</label>
        <input type="text" id="essential-input-emoji" class="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 🧻" value="🧻">
      </div>
    </div>
    <div class="flex gap-3 justify-end">
      <button onclick="closeModal('essential-modal')" class="px-5 py-2.5 rounded-full bg-surface-container-high border border-outline-variant/40 font-sub-label text-on-surface-variant hover:bg-outline-variant/20 transition-colors">Cancel</button>
      <button onclick="submitEssentialItem()" class="px-6 py-2.5 rounded-full rose-gold-gradient text-white font-sub-label pearl-gloss shadow-md hover:opacity-95 active:scale-95 transition-transform" id="essential-modal-btn">Add ✦</button>
    </div>
  </div>
</div>
`;

if (!indexHtml.includes('id="essential-modal"')) {
  indexHtml = indexHtml.replace('<!-- BILL FORM MODAL -->', essentialModalHtml + '\n<!-- BILL FORM MODAL -->');
}

// Update bill add buttons to trigger openAddBillModal() instead of direct openModal
indexHtml = indexHtml.replace(
  'onclick="openModal(\'bill-modal\')"',
  'onclick="openAddBillModal()"'
);
indexHtml = indexHtml.replace(
  'onclick="closeFab(); \nopenModal(\'bill-modal\')"',
  'onclick="closeFab(); openAddBillModal()"'
);
indexHtml = indexHtml.replace(
  'onclick="closeFab(); openModal(\'bill-modal\')"',
  'onclick="closeFab(); openAddBillModal()"'
);

fs.writeFileSync('index.html', indexHtml);


// ==========================================
// 2. UPDATE APP.JS
// ==========================================

// Global edit trackers
if (!appJs.includes('let editingBillIndex =')) {
  appJs = `let editingBillIndex = -1;\nlet editingEssentialIndex = -1;\n` + appJs;
}

// Replacements for submitBillItem function
appJs = appJs.replace(
  `function submitBillItem() {
  const nameInp = document.getElementById('bill-input-name');
  const amountInp = document.getElementById('bill-input-amount');
  const iconInp = document.getElementById('bill-input-icon');
  const dateInp = document.getElementById('bill-input-date');
  const recInp = document.getElementById('bill-input-recurring');
  
  if (!nameInp || nameInp.value.trim() === '' || !amountInp || amountInp.value.trim() === '') return;
  
  const newBill = {
    name: nameInp.value.trim(),
    amount: Number(amountInp.value),
    date: dateInp.value.trim() || 'Due Soon',
    category: iconInp.value,
    paid: false,
    recurring: recInp.checked
  };
  
  bills.push(newBill);
  localStorage.setItem('cm-bills', JSON.stringify(bills));
  
  renderBillsAndSubscriptions();
  closeModal('bill-modal');
}`,
  `function submitBillItem() {
  const nameInp = document.getElementById('bill-input-name');
  const amountInp = document.getElementById('bill-input-amount');
  const iconInp = document.getElementById('bill-input-icon');
  const dateInp = document.getElementById('bill-input-date');
  const recInp = document.getElementById('bill-input-recurring');
  
  if (!nameInp || nameInp.value.trim() === '' || !amountInp || amountInp.value.trim() === '') return;
  
  const newBill = {
    name: nameInp.value.trim(),
    amount: Number(amountInp.value),
    date: dateInp.value.trim() || 'Due Soon',
    category: iconInp.value,
    paid: editingBillIndex > -1 ? bills[editingBillIndex].paid : false,
    recurring: recInp.checked
  };
  
  if (editingBillIndex > -1) {
    bills[editingBillIndex] = newBill;
    editingBillIndex = -1;
  } else {
    bills.push(newBill);
  }
  
  localStorage.setItem('cm-bills', JSON.stringify(bills));
  
  renderBillsAndSubscriptions();
  closeModal('bill-modal');
}`
);

// Replacements for renderBillsAndSubscriptions
appJs = appJs.replace(
  `    card.innerHTML = \`
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full \${bgClass} flex items-center justify-center">
          <span class="material-symbols-outlined">\${item.category}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">\${item.name}</p>
          <p class="font-sub-label text-sub-label text-on-surface-variant">\${item.date}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-body-lg text-body-lg text-primary">\${formatCurrency(item.amount)}</p>
        \${paidBadge}
      </div>
    \`;`,
  `    card.innerHTML = \`
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full \${bgClass} flex items-center justify-center">
          <span class="material-symbols-outlined">\${item.category}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">\${item.name}</p>
          <p class="font-sub-label text-sub-label text-on-surface-variant">\${item.date}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="font-body-lg text-body-lg text-primary">\${formatCurrency(item.amount)}</p>
          \${paidBadge}
        </div>
        <div class="flex flex-col gap-1 items-center justify-center">
          <button onclick="editBill(\${index})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
          <button onclick="deleteBill(\${index})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>
      </div>
    \`;`
);

// Replacements for renderEssentials
appJs = appJs.replace(
  `    card.innerHTML = \`
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full \${glowBg} flex items-center justify-center relative">
          <span class="material-symbols-outlined">\${item.icon}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">\${item.emoji === item.name ? item.name : \`\${item.emoji} \${item.name}\`}</p>
          <p class="font-sub-label text-sub-label \${statusColor}">\${statusText}</p>
        </div>
      </div>
      <button onclick="replenishItem(\${index})" class="text-xs uppercase tracking-wider font-semibold text-primary hover:opacity-85 flex items-center gap-1 bg-surface-container-high px-4 py-2 rounded-full">
        Replenish
      </button>
    \`;`,
  `    card.innerHTML = \`
      <div class="flex items-center gap-4 cursor-pointer" onclick="replenishItem(\${index})" title="Replenish item">
        <div class="w-12 h-12 rounded-full \${glowBg} flex items-center justify-center relative">
          <span class="material-symbols-outlined">\${item.icon || 'local_florist'}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">\${item.emoji === item.name ? item.name : \`\${item.emoji || '🌿'} \${item.name}\`}</p>
          <p class="font-sub-label text-sub-label \${statusColor}">\${statusText} (lasts \${item.daysDuration}d)</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="replenishItem(\${index})" class="text-[10px] uppercase tracking-wider font-semibold text-primary hover:opacity-85 flex items-center gap-1 bg-surface-container-high px-3 py-1.5 rounded-full">
          Replenish
        </button>
        <div class="flex items-center gap-1">
          <button onclick="editEssential(\${index})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
          <button onclick="deleteEssential(\${index})" class="text-on-surface-variant/40 hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>
      </div>
    \`;`
);

// Replacements for renderDebts
appJs = appJs.replace(
  `        <div class="flex justify-between font-sub-label text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">
          <span>\${formatCurrency(debt.paid)} paid</span>
          <span>\${formatCurrency(debt.amount)} total</span>
        </div>`,
  `        <div class="flex justify-between font-sub-label text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">
          <span>\${formatCurrency(debt.paid)} paid (\${formatCurrency(debt.amount - debt.paid)} left)</span>
          <span>\${formatCurrency(debt.amount)} total</span>
        </div>`
);

// Inject Edit/Delete directly to active Debts cards
appJs = appJs.replace(
  `        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">\${debt.name}</span>
          <button onclick="deleteDebt(\${debt.id})" class="text-[#914540] active:scale-95 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>`,
  `        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">\${debt.name}</span>
          <div class="flex items-center gap-2">
            <button onclick="editDebt(\${debt.id})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
            <button onclick="deleteDebt(\${debt.id})" class="text-on-surface-variant/40 hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
          </div>
        </div>`
);

// Replacements for renderSplurges
appJs = appJs.replace(
  `        <div class="flex justify-between font-sub-label text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">
          <span>\${formatCurrency(splurge.paid)} saved</span>
          <span>\${formatCurrency(splurge.amount)} goal</span>
        </div>`,
  `        <div class="flex justify-between font-sub-label text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">
          <span>\${formatCurrency(splurge.paid)} saved (\${formatCurrency(splurge.amount - splurge.paid)} left)</span>
          <span>\${formatCurrency(splurge.amount)} goal</span>
        </div>`
);

appJs = appJs.replace(
  `        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">\${splurge.name}</span>
          <button onclick="deleteSplurge(\${splurge.id})" class="text-[#914540] active:scale-95 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>`,
  `        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">\${splurge.name}</span>
          <div class="flex items-center gap-2">
            <button onclick="editSplurge(\${splurge.id})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
            <button onclick="deleteSplurge(\${splurge.id})" class="text-on-surface-variant/40 hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
          </div>
        </div>`
);


// Injections for new JS functions
const helperFunctions = `
// ===== ADDITIONAL DYNAMIC HELPER FUNCTIONS =====
function openAddBillModal() {
  editingBillIndex = -1;
  document.getElementById('bill-input-name').value = '';
  document.getElementById('bill-input-amount').value = '';
  document.getElementById('bill-input-icon').value = 'home';
  document.getElementById('bill-input-date').value = '';
  document.getElementById('bill-input-recurring').checked = false;
  openModal('bill-modal');
}

function editBill(index) {
  editingBillIndex = index;
  const item = bills[index];
  document.getElementById('bill-input-name').value = item.name;
  document.getElementById('bill-input-amount').value = item.amount;
  document.getElementById('bill-input-icon').value = item.category;
  document.getElementById('bill-input-date').value = item.date === 'Due Soon' ? '' : item.date;
  document.getElementById('bill-input-recurring').checked = item.recurring;
  openModal('bill-modal');
}

function openAddEssentialModal() {
  editingEssentialIndex = -1;
  document.getElementById('essential-modal-title').textContent = "Add Essential Item";
  document.getElementById('essential-modal-btn').textContent = "Add ✦";
  
  document.getElementById('essential-input-name').value = '';
  document.getElementById('essential-input-duration').value = '30';
  document.getElementById('essential-input-emoji').value = '🧻';
  
  openModal('essential-modal');
}

function submitEssentialItem() {
  const nameInp = document.getElementById('essential-input-name');
  const durInp = document.getElementById('essential-input-duration');
  const emojiInp = document.getElementById('essential-input-emoji');
  
  if (!nameInp || nameInp.value.trim() === '') return;
  
  const days = parseInt(durInp.value) || 30;
  
  const newItem = {
    name: nameInp.value.trim(),
    daysDuration: days,
    emoji: emojiInp.value.trim() || '🧻',
    icon: 'local_florist',
    lastReplenished: editingEssentialIndex > -1 ? essentials[editingEssentialIndex].lastReplenished : new Date().toISOString()
  };
  
  if (editingEssentialIndex > -1) {
    essentials[editingEssentialIndex] = newItem;
    editingEssentialIndex = -1;
  } else {
    essentials.push(newItem);
  }
  
  localStorage.setItem('cm-essentials', JSON.stringify(essentials));
  renderEssentials();
  closeModal('essential-modal');
}

function editEssential(index) {
  editingEssentialIndex = index;
  const item = essentials[index];
  
  document.getElementById('essential-modal-title').textContent = "Edit Essential Item";
  document.getElementById('essential-modal-btn').textContent = "Save Changes ✦";
  
  document.getElementById('essential-input-name').value = item.name;
  document.getElementById('essential-input-duration').value = item.daysDuration;
  document.getElementById('essential-input-emoji').value = item.emoji || '🧻';
  
  openModal('essential-modal');
}

function editDebt(id) {
  const index = debts.findIndex(d => d.id === id);
  if (index === -1) return;
  const item = debts[index];
  const newName = prompt("Edit Goal Name:", item.name);
  if (newName !== null && newName.trim() !== '') {
    const newAmt = prompt("Edit Total Goal Amount:", item.amount);
    debts[index].name = newName.trim();
    if (newAmt && !isNaN(newAmt)) debts[index].amount = parseFloat(newAmt);
    localStorage.setItem('cm-debts', JSON.stringify(debts));
    renderDebts();
  }
}

function editSplurge(id) {
  const index = splurges.findIndex(s => s.id === id);
  if (index === -1) return;
  const item = splurges[index];
  const newName = prompt("Edit Splurge Name:", item.name);
  if (newName !== null && newName.trim() !== '') {
    const newAmt = prompt("Edit Target Amount:", item.amount);
    splurges[index].name = newName.trim();
    if (newAmt && !isNaN(newAmt)) splurges[index].amount = parseFloat(newAmt);
    localStorage.setItem('cm-splurges', JSON.stringify(splurges));
    renderSplurges();
  }
}
`;

if (!appJs.includes('function openAddBillModal')) {
  appJs += '\n' + helperFunctions;
}

fs.writeFileSync('js/app.js', appJs);
console.log('Full roadmap updates successfully written!');
