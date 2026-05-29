let editingBillIndex = -1;
let editingEssentialIndex = -1;
// ===== HELPER: Local Date String =====
function getLocalDateString(date) {
  if (!date) date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ============================================
   CHAOTIC MINDS — app.js (Rose Atelier Version)
   ============================================ */

// ===== INITIAL STATE / LOCAL STORAGE =====
let thoughts = JSON.parse(localStorage.getItem('cm-thoughts')) || [
  { text: "The way the morning light hit the kitchen counter felt like a reset...", date: "Today", emoji: "💡" },
  { text: "Too many tabs open in my brain today. Need to breathe through the noise.", date: "Yesterday", emoji: "☁️" },
  { text: "Found peace in the park today. Nature is the best therapist.", date: "Oct 24", emoji: "🌿" },
  { text: "Grateful for the small wins. Finally finished that chapter.", date: "Oct 22", emoji: "✨" }
];

let groceries = JSON.parse(localStorage.getItem('cm-groceries')) || [
  { name: "Eggs", checked: false },
  { name: "Bread", checked: false },
  { name: "Milk", checked: true }
];

// essentials tracking with running out engine duration (in days)
let essentials = JSON.parse(localStorage.getItem('cm-essentials')) || [
  { id: 'milk', name: 'Milk', emoji: '🥛', icon: 'water_drop', lastReplenished: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(), daysDuration: 5 }, // ~90% elapsed -> Almost gone
  { id: 'shampoo', name: 'Shampoo', emoji: 'Shampoo', icon: 'cleaning_services', lastReplenished: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), daysDuration: 30 }, // ~56% elapsed -> Low stock
  { id: 'coffee', name: 'Coffee', emoji: 'Coffee', icon: 'coffee', lastReplenished: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), daysDuration: 10 } // ~20% elapsed -> In stock
];

let bills = JSON.parse(localStorage.getItem('cm-bills')) || [
  { name: 'Internet', amount: 7500, date: 'Due Oct 24', category: 'wifi', paid: false, recurring: true },
  { name: 'Netflix', amount: 1599, date: 'Paid Oct 12', category: 'tv', paid: true, recurring: true },
  { name: 'Spotify', amount: 1099, date: 'Auto-renew', category: 'music_note', paid: true, recurring: true }
];

// Profile & Custom Settings defaults
let username = localStorage.getItem('cm-username') || "Cynthia";
let avatarUrl = localStorage.getItem('cm-avatar') || "https://lh3.googleusercontent.com/aida-public/AB6AXuCfcvPFmPPgi84iU2Nihb_QZq4ThNMEYB-IJ74NoijBUvUuN8ng_w8fhM6y1F4fFAvymkC0mUWlQ7jQ2ziQliOxhCF5LUCXUR3a70JVu925hE1ATxuqUWnKprGLYdNf7aoJL0uOgDHedqdjtuRC0za3HqsGnmaEmrI0dWxJWpH29eRSRWyU64fVJz_4YdMW5-KuYCuCiQ4KoDUmQU2FuKfgPjuWAT5tmpvLc4ELzC8v6t2VcLG9WMDk85X3mGVB0E6bX0vI2bj65aA";
let currency = localStorage.getItem('cm-currency') || "Ksh";

// Last 7 days mood history
let moodHistory = JSON.parse(localStorage.getItem('cm-mood-history')) || ['Calm', 'Lit', 'Calm', 'Chaos', 'Calm', 'Lit', 'Calm'];

// Appointments data
let appointments = JSON.parse(localStorage.getItem('cm-appointments')) || [
  { id: 1, title: 'Dentist Appointment', date: getLocalDateString(new Date()), time: '9:00 AM' },
  { id: 2, title: 'Catch up with Sarah', date: getLocalDateString(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), time: '6:00 PM · Coffee Shop' }
];

// Selected date and calendar state (default: today)
let selectedDate = new Date();
let calendarCurrentMonth = new Date();
let calendarSelectedDate = new Date();

// Mood by date mapping (YYYY-MM-DD -> mood) for calendar visualization
let moodByDate = JSON.parse(localStorage.getItem('cm-mood-by-date')) || {};
if (Object.keys(moodByDate).length === 0) {
  const _today = new Date();
  const _defaultMoods = ['Calm', 'Lit', 'Calm', 'Chaos', 'Calm', 'Lit', 'Calm'];
  for (let i = 0; i < 7; i++) {
    const _d = new Date(_today);
    _d.setDate(_today.getDate() - i);
    moodByDate[getLocalDateString(_d)] = _defaultMoods[i % _defaultMoods.length];
  }
  localStorage.setItem('cm-mood-by-date', JSON.stringify(moodByDate));
}

let debts = JSON.parse(localStorage.getItem('cm-debts')) || [];
let splurges = JSON.parse(localStorage.getItem('cm-splurges')) || [];
let rhythms = JSON.parse(localStorage.getItem('cm-rhythms')) || [];
let expiries = JSON.parse(localStorage.getItem('cm-expiries')) || [];
let shoppingMode = false;

// ===== CURRENCY FORMATTING (OPTION B) =====
function formatCurrency(amount) {
  const symbol = localStorage.getItem('cm-currency') || 'Ksh';
  if (symbol === 'Ksh') {
    return `Ksh ${Number(amount).toLocaleString('en-KE')}`;
  }
  return `${symbol}${Number(amount).toLocaleString()}`;
}

// ===== CLOCK & TIME-AWARE GREETING =====
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  
  const clockEl = document.getElementById('clock');
  if (clockEl) clockEl.textContent = `${h}:${m}`;

  // Time-aware greeting utilizing username state and language
  const hour = now.getHours();
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    const curName = localStorage.getItem('cm-username') || "Cynthia";
    const lang = localStorage.getItem('cm-language') || "en";
    
    const greetings = {
      en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Rest well" },
      sw: { morning: "Habari za asubuhi", afternoon: "Habari za mchana", evening: "Habari za jioni", night: "Lala salama" },
      fr: { morning: "Bon matin", afternoon: "Bon après-midi", evening: "Bonsoir", night: "Bonne nuit" },
      es: { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches", night: "Que descanses" }
    };
    
    const langGreetings = greetings[lang] || greetings['en'];
    let greetText = langGreetings.morning;
    if (hour >= 5 && hour < 12) greetText = langGreetings.morning;
    else if (hour >= 12 && hour < 17) greetText = langGreetings.afternoon;
    else if (hour >= 17 && hour < 22) greetText = langGreetings.evening;
    else greetText = langGreetings.night;
    
    greetingEl.textContent = `${greetText}, ${curName}`;
  }

  // Date String utilizing date format and language
  const dateEl = document.getElementById('hero-date');
  if (dateEl) {
    const dateFormat = localStorage.getItem('cm-date-format') || 'MMM DD, YYYY';
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    const lang = localStorage.getItem('cm-language') || "en";
    const daysNames = {
      en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      sw: ['Jumapili','Jumatatu','Jumanne','Jumatano','Alhamisi','Ijumaa','Jumamosi'],
      fr: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
      es: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
    };
    const monthsNames = {
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      sw: ['Januari','Februari','Machi','Aprili','Mei','Juni','Julai','Agosti','Septemba','Oktoba','Novemba','Desemba'],
      fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    };
    
    const selectedDays = daysNames[lang] || daysNames['en'];
    
    if (dateFormat === 'DD/MM/YYYY') {
      dateEl.textContent = `${day}/${month}/${year}`;
    } else if (dateFormat === 'MM/DD/YYYY') {
      dateEl.textContent = `${month}/${day}/${year}`;
    } else {
      const monthShortStr = monthsShort[now.getMonth()];
      dateEl.textContent = `${selectedDays[now.getDay()]}, ${monthShortStr} ${now.getDate()}, ${year}`;
    }
  }
}

// ===== WEEK STRIP BUILDER =====
function buildWeekStrip() {
  const strip = document.getElementById('week-strip');
  if (!strip) return;
  strip.innerHTML = '';
  
  const today = new Date();
  const dayNames = ['S','M','T','W','T','F','S'];
  
  // Start on Sunday of the week containing selectedDate
  const baseDate = selectedDate || today;
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateKey = getLocalDateString(d);
    const isSelected = d.toDateString() === baseDate.toDateString();
    const isToday = d.toDateString() === today.toDateString();
    const hasEvent = appointments.some(a => a.date === dateKey);
    
    const dayCol = document.createElement('div');
    dayCol.className = 'flex flex-col items-center gap-1 min-w-[40px] cursor-pointer';
    dayCol.onclick = () => {
      selectedDate = new Date(d);
      buildWeekStrip();
      renderAppointments();
      restoreMood();
      updateClock();
      // Scroll schedule into view
      setTimeout(() => {
        const container = document.getElementById('appointments-container');
        if (container) container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    };
    
    // Label
    const label = document.createElement('span');
    label.className = isSelected
      ? 'text-[10px] font-sub-label text-primary font-bold'
      : 'text-[10px] font-sub-label text-on-surface-variant';
    label.textContent = dayNames[d.getDay()];
    
    // Number Bubble — relative wrapper to hold event dot
    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'relative flex flex-col items-center';
    
    const bubble = document.createElement('div');
    if (isSelected) {
      bubble.className = 'w-10 h-10 flex items-center justify-center rounded-full rose-gold-gradient text-white glossy-shine font-bold shadow-md';
    } else if (isToday) {
      bubble.className = 'w-10 h-10 flex items-center justify-center rounded-full border border-primary/40 text-primary font-semibold';
    } else {
      bubble.className = 'w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant font-medium hover:bg-outline-variant/20 transition-all';
    }
    bubble.textContent = d.getDate();
    
    bubbleWrap.appendChild(bubble);
    
    // Tiny event dot below bubble
    if (hasEvent) {
      const dot = document.createElement('span');
      dot.className = 'w-1 h-1 rounded-full bg-[#914540] mt-0.5';
      bubbleWrap.appendChild(dot);
    }
    
    dayCol.appendChild(label);
    dayCol.appendChild(bubbleWrap);
    strip.appendChild(dayCol);
  }
}

// ===== TAB SWITCHING =====
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const targetTab = document.getElementById('tab-' + name);
  if (targetTab) targetTab.classList.add('active');
  if (btn) btn.classList.add('active');
  
  // Auto-close FAB when shifting tabs
  closeFab();
}

// ===== MOODS & HISTORY GARDEN =====
function applyMoodAura(btn, moodName) {
  // Reset all to base frosted glass
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.className = 'mood-btn px-6 py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-on-surface-variant font-sub-label transition-all duration-300 active:scale-95 shadow-sm';
    b.classList.remove('active');
  });
  
  btn.classList.add('active');
  
  // Apply specific glass aura based on mood
  if (moodName === 'Calm') {
    btn.className = 'mood-btn px-6 py-2.5 rounded-full bg-[#E8F4EC]/80 backdrop-blur-md border border-[#B2D8C0] text-[#2E7D32] font-sub-label transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(46,125,50,0.15)] active';
  } else if (moodName === 'Lit') {
    btn.className = 'mood-btn px-6 py-2.5 rounded-full bg-[#FDF0DC]/80 backdrop-blur-md border border-[#EBCB9F] text-[#D4956A] font-sub-label transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(212,149,106,0.15)] active';
  } else if (moodName === 'Chaos') {
    btn.className = 'mood-btn px-6 py-2.5 rounded-full bg-[#F0EAF8]/80 backdrop-blur-md border border-[#D0C0E8] text-[#7E57C2] font-sub-label transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(126,87,194,0.15)] active';
  }
}

function setMood(btn, moodName) {
  applyMoodAura(btn, moodName);
  
  // Save to today's mood (updates the last element of the 7 days array)
  moodHistory[moodHistory.length - 1] = moodName;
  localStorage.setItem('cm-mood-history', JSON.stringify(moodHistory));
  localStorage.setItem('cm-mood', moodName);
  
  // Also persist mood keyed by selected date for the calendar garden
  const dateKey = getLocalDateString((selectedDate || new Date()));
  moodByDate[dateKey] = moodName;
  localStorage.setItem('cm-mood-by-date', JSON.stringify(moodByDate));
  
  renderMoodGarden();
}

function renderMoodGarden() {
  const garden = document.getElementById('mood-garden');
  if (!garden) return;
  garden.innerHTML = '';
  
  moodHistory.forEach((item, index) => {
    const dot = document.createElement('div');
    dot.className = 'w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-xs cursor-help relative group';
    
    let colorClass = '';
    
    if (item === 'Calm') {
      colorClass = 'bg-[#E8F4EC]/80 backdrop-blur-sm border border-[#B2D8C0] shadow-[0_2px_8px_rgba(46,125,50,0.2)]';
    } else if (item === 'Lit') {
      colorClass = 'bg-[#FDF0DC]/80 backdrop-blur-sm border border-[#EBCB9F] shadow-[0_2px_8px_rgba(212,149,106,0.2)]';
    } else {
      colorClass = 'bg-[#F0EAF8]/80 backdrop-blur-sm border border-[#D0C0E8] shadow-[0_2px_8px_rgba(126,87,194,0.2)]';
    }
    
    dot.className += ` ${colorClass}`;
    dot.textContent = '';
    
    // Add custom tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'absolute bottom-8 scale-0 transition-all rounded bg-surface px-2 py-1 text-[8px] text-on-surface border border-outline-variant/30 group-hover:scale-100 font-sub-label';
    tooltip.textContent = `Day ${index + 1}: ${item}`;
    dot.appendChild(tooltip);
    
    garden.appendChild(dot);
  });
}

function restoreMood() {
  const dateKey = getLocalDateString((selectedDate || new Date()));
  const currentMood = moodByDate[dateKey] || '';
  
  // Reset all buttons first
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.className = 'mood-btn px-6 py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-on-surface-variant font-sub-label transition-all duration-300 active:scale-95 shadow-sm';
    b.classList.remove('active');
  });
  
  if (currentMood) {
    document.querySelectorAll('.mood-btn').forEach(b => {
      if (b.textContent.trim() === currentMood) {
        applyMoodAura(b, currentMood);
      }
    });
  }
}

// ===== SETTINGS DRAWER SYSTEM =====
function toggleDrawer() {
  const drawer = document.getElementById('settings-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer || !backdrop) return;
  
  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    backdrop.classList.add('hidden');
  } else {
    // Sync settings fields prior to display
    document.getElementById('settings-name').value = localStorage.getItem('cm-username') || "Cynthia";
    document.getElementById('settings-currency').value = localStorage.getItem('cm-currency') || "Ksh";
    document.getElementById('settings-language').value = localStorage.getItem('cm-language') || "en";
    document.getElementById('settings-date-format').value = localStorage.getItem('cm-date-format') || "MMM DD, YYYY";
    document.getElementById('settings-sound').value = localStorage.getItem('cm-sound-theme') || "chime";
    
    document.getElementById('settings-notif-mood').checked = localStorage.getItem('cm-notifications-mood') !== 'false';
    document.getElementById('settings-notif-bills').checked = localStorage.getItem('cm-notifications-bills') !== 'false';
    document.getElementById('settings-notif-nest').checked = localStorage.getItem('cm-notifications-nest') !== 'false';
    
    renderAccountSection();
    updateStatsSummary();
    
    drawer.classList.add('open');
    backdrop.classList.remove('hidden');
  }
}

function saveSettings() {
  const nameVal = document.getElementById('settings-name').value.trim() || "Cynthia";
  const currencyVal = document.getElementById('settings-currency').value;
  const langVal = document.getElementById('settings-language').value;
  const dateFormatVal = document.getElementById('settings-date-format').value;
  const soundVal = document.getElementById('settings-sound').value;
  
  const moodNotif = document.getElementById('settings-notif-mood').checked;
  const billsNotif = document.getElementById('settings-notif-bills').checked;
  const nestNotif = document.getElementById('settings-notif-nest').checked;
  
  localStorage.setItem('cm-username', nameVal);
  localStorage.setItem('cm-currency', currencyVal);
  localStorage.setItem('cm-language', langVal);
  localStorage.setItem('cm-date-format', dateFormatVal);
  localStorage.setItem('cm-sound-theme', soundVal);
  
  localStorage.setItem('cm-notifications-mood', moodNotif);
  localStorage.setItem('cm-notifications-bills', billsNotif);
  localStorage.setItem('cm-notifications-nest', nestNotif);
  
  updateClock();
  renderBillsAndSubscriptions();
  renderEssentials();
  
  toggleDrawer();
}

// ===== ACCOUNT & SYNC FLOWS =====
function renderAccountSection() {
  const container = document.getElementById('account-status-container');
  if (!container) return;
  
  const signedIn = localStorage.getItem('cm-google-signed-in') === 'true';
  const email = localStorage.getItem('cm-google-email') || '';
  
  if (signedIn) {
    container.innerHTML = `
      <div class="flex items-center justify-between bg-surface-container-high p-3 rounded-xl border border-outline-variant/20">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#EA4335] text-lg font-bold">account_circle</span>
          <div>
            <p class="font-medium text-on-surface text-xs">${email}</p>
            <p class="text-[9px] text-[#2E7D32] flex items-center gap-1 font-semibold"><span class="material-symbols-outlined text-[10px]">cloud_done</span> Data synced</p>
          </div>
        </div>
        <button onclick="handleSignOut()" class="text-[#914540] hover:text-[#b05c57] text-[10px] font-semibold underline">Sign Out</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button onclick="handleGoogleSignIn()" class="w-full py-2.5 rounded-xl border border-outline-variant/40 bg-white hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center gap-2 text-on-surface font-semibold text-xs shadow-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.67 1.57 14.97 1 12 1 7.35 1 3.39 3.67 1.5 7.56l3.86 3C6.27 7.74 8.91 5.04 12 5.04z"/>
          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.87 3.75-8.49z"/>
          <path fill="#FBBC05" d="M5.36 10.56c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.5 3.2C.54 5.12 0 7.27 0 9.5s.54 4.38 1.5 6.3l3.86-3.06z"/>
          <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.09 0-5.73-2.7-6.66-5.52l-3.86 3C3.39 20.33 7.35 23 12 23z"/>
        </svg>
        Sign in with Google
      </button>
    `;
  }
}

function handleGoogleSignIn() {
  const container = document.getElementById('account-status-container');
  if (container) {
    container.innerHTML = `
      <div class="flex items-center justify-center py-2 gap-2 text-[#914540] font-medium text-xs">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Connecting...
      </div>
    `;
  }
  
  setTimeout(() => {
    localStorage.setItem('cm-google-signed-in', 'true');
    localStorage.setItem('cm-google-email', 'cynthia@gmail.com');
    
    // Play a nice success chime!
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch(e){}

    renderAccountSection();
  }, 1200);
}

function handleSignOut() {
  localStorage.removeItem('cm-google-signed-in');
  localStorage.removeItem('cm-google-email');
  renderAccountSection();
}

// ===== PREMIUM SOUND CHIME SYSTEM =====
function playTestSound() {
  const soundType = document.getElementById('settings-sound').value;
  if (soundType === 'none') return;

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (soundType === 'chime') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.value = 523.25; // C5
      osc2.type = 'sine';
      osc2.frequency.value = 783.99; // G5
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.8);
      osc2.stop(audioCtx.currentTime + 0.8);
    } else if (soundType === 'bell') {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = 880; // A5
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn("AudioContext blocked or unsupported:", e);
  }
}

function resetAtelier() {
  if (confirm("Would you like to clear all customization and data logs? This will reset the workspace.")) {
    localStorage.clear();
    location.reload();
  }
}

function updateStatsSummary() {
  const lowStockCount = essentials.filter(item => {
    const elapsed = (Date.now() - new Date(item.lastReplenished).getTime()) / (24 * 60 * 60 * 1000);
    return (elapsed / item.daysDuration) >= 0.5;
  }).length;
  
  const totalBillsAmount = bills.reduce((acc, b) => acc + (b.paid ? 0 : Number(b.amount)), 0);
  
  const statsLowStock = document.getElementById('stats-low-stock');
  const statsTotalBills = document.getElementById('stats-total-bills');
  const statsMindCount = document.getElementById('stats-mind-count');
  
  if (statsLowStock) statsLowStock.textContent = `${lowStockCount} items low`;
  if (statsTotalBills) statsTotalBills.textContent = formatCurrency(totalBillsAmount);
  if (statsMindCount) statsMindCount.textContent = `${thoughts.length} notes logged`;
}

// ===== PREVALENT DIALOG FORM MODALS =====
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    // Clear inputs inside modal
    const textInputs = modal.querySelectorAll('input[type="text"], input[type="number"]');
    textInputs.forEach(i => i.value = '');
    
    // Pre-fill appointment date with the currently selected date
    if (id === 'appointment-modal') {
      const dateInp = document.getElementById('appt-input-date');
      if (dateInp) dateInp.value = getLocalDateString((selectedDate || new Date()));
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
  }
}

function submitGroceryItem() {
  const nameInp = document.getElementById('grocery-input-name');
  if (!nameInp || nameInp.value.trim() === '') return;
  
  groceries.push({ name: nameInp.value.trim(), checked: false });
  localStorage.setItem('cm-groceries', JSON.stringify(groceries));
  
  renderGroceries();
  closeModal('grocery-modal');
}

function submitBillItem() {
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
}

// ===== APPOINTMENTS SYSTEM =====
function renderAppointments() {
  const container = document.getElementById('appointments-container');
  const header = document.getElementById('appointments-header');
  if (!container) return;
  container.innerHTML = '';
  
  const dateStr = getLocalDateString((selectedDate || new Date()));
  const filtered = appointments.filter(a => a.date === dateStr);
  
  if (filtered.length > 0) {
    if (header) header.textContent = 'You have somewhere to be';
    filtered.forEach(appt => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl p-card-padding border border-[#D4956A]/10 shadow-sm flex items-center justify-between transition-all';
      card.innerHTML = `
        <div>
          <p class="font-display-italic text-lg text-on-surface italic">${appt.title}</p>
          <p class="text-secondary font-sub-label text-[10px] uppercase tracking-wider mt-1">${appt.time}</p>
        </div>
        <button onclick="deleteAppointment(${appt.id})" class="text-[#914540] hover:text-[#b05c57] active:scale-90 transition-transform p-1.5 rounded-full hover:bg-[#FDF0D5]/40" title="Remove">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      `;
      container.appendChild(card);
    });
  } else {
    if (header) header.textContent = 'Nowhere to be';
    const empty = document.createElement('div');
    empty.className = 'bg-white/40 backdrop-blur-md rounded-xl p-card-padding border border-dashed border-[#D4956A]/30 flex flex-col items-center justify-center text-center py-8 gap-2';
    empty.innerHTML = `
      <span class="material-symbols-outlined text-[#D4956A]/50 text-3xl">hotel</span>
      <p class="font-display-italic text-lg text-on-surface/70 italic mb-2">Nowhere to be. Let the hours drift... 🌸</p>
      <button onclick="openModal('appointment-modal')" class="mt-2 px-5 py-2 rounded-full border border-primary/30 text-primary hover:bg-[#FDF0D5]/50 active:scale-95 transition-all text-xs font-sub-label flex items-center gap-1.5">
        <span class="material-symbols-outlined text-xs">add</span> Plan an appointment
      </button>
    `;
    container.appendChild(empty);
  }
}

function submitAppointmentItem() {
  const titleInp = document.getElementById('appt-input-title');
  const timeInp = document.getElementById('appt-input-time');
  const dateInp = document.getElementById('appt-input-date');
  
  if (!titleInp || titleInp.value.trim() === '' || !timeInp || timeInp.value.trim() === '') return;
  
  const dateStr = dateInp && dateInp.value
    ? dateInp.value
    : getLocalDateString((calendarSelectedDate || selectedDate || new Date()));
  
  const newAppt = {
    id: Date.now(),
    title: titleInp.value.trim(),
    time: timeInp.value.trim(),
    date: dateStr
  };
  
  appointments.push(newAppt);
  localStorage.setItem('cm-appointments', JSON.stringify(appointments));
  
  renderAppointments();
  buildWeekStrip();
  closeModal('appointment-modal');
  
  const calMod = document.getElementById('calendar-modal');
  if (calMod && calMod.classList.contains('open')) {
    renderCalendar();
    renderCalendarAgenda(calendarSelectedDate);
  }
}

function deleteAppointment(id) {
  appointments = appointments.filter(a => a.id !== id);
  localStorage.setItem('cm-appointments', JSON.stringify(appointments));
  renderAppointments();
  buildWeekStrip();
  
  // Refresh calendar and agenda if modal is still open
  const calMod = document.getElementById('calendar-modal');
  if (calMod && calMod.classList.contains('open')) {
    renderCalendar();
    renderCalendarAgenda(calendarSelectedDate);
  }
}

// ===== GARDEN CALENDAR MODAL =====
function openCalendarModal() {
  calendarSelectedDate = new Date(selectedDate || new Date());
  calendarCurrentMonth = new Date(calendarSelectedDate);
  renderCalendar();
  renderCalendarAgenda(calendarSelectedDate);
  const modal = document.getElementById('calendar-modal');
  if (modal) modal.classList.add('open');
}

function closeCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (modal) modal.classList.remove('open');
}

function changeCalendarMonth(offset) {
  calendarCurrentMonth = new Date(
    calendarCurrentMonth.getFullYear(),
    calendarCurrentMonth.getMonth() + offset,
    1
  );
  renderCalendar();
}

function selectCalendarDate(year, month, day) {
  calendarSelectedDate = new Date(year, month, day);
  renderCalendar();
  renderCalendarAgenda(calendarSelectedDate);
}

function openCalendarAppointmentForm() {
  openModal('appointment-modal');
  const dateInp = document.getElementById('appt-input-date');
  if (dateInp) {
    dateInp.value = getLocalDateString(calendarSelectedDate);
  }
}

function applyCalendarSelectedDate() {
  selectedDate = new Date(calendarSelectedDate);
  closeCalendarModal();
  buildWeekStrip();
  renderAppointments();
  restoreMood();
  updateClock();
  // Scroll schedule into view after modal closes
  setTimeout(() => {
    const container = document.getElementById('appointments-container');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 350);
}

function renderCalendarAgenda(date) {
  const container = document.getElementById('calendar-agenda-footer');
  if (!container) return;
  
  const dateStr = getLocalDateString(date);
  const filtered = appointments.filter(a => a.date === dateStr);
  
  // Format readable date
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  
  let agendaHtml = `
    <div class="flex items-center justify-between mb-1">
      <span class="font-display-italic text-sm text-primary italic font-semibold">${formattedDate}</span>
      <span class="font-sub-label text-[8px] uppercase tracking-wider text-secondary">${filtered.length} event${filtered.length !== 1 ? 's' : ''}</span>
    </div>
  `;
  
  if (filtered.length > 0) {
    agendaHtml += `<div class="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">`;
    filtered.forEach(appt => {
      agendaHtml += `
        <div class="bg-white/80 rounded-xl px-3 py-1.5 border border-[#D4956A]/10 flex items-center justify-between text-xs">
          <div>
            <p class="font-display-italic text-[13px] text-on-surface italic">${appt.title}</p>
            <p class="text-secondary font-sub-label text-[8px] uppercase tracking-wider mt-0.5">${appt.time}</p>
          </div>
          <button onclick="deleteAppointment(${appt.id})" class="text-[#914540] hover:text-[#b05c57] active:scale-90 transition-transform p-1 rounded-full hover:bg-[#FDF0D5]/50">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      `;
    });
    agendaHtml += `</div>`;
  } else {
    agendaHtml += `
      <div class="bg-white/40 rounded-xl py-2.5 border border-dashed border-[#D4956A]/20 flex flex-col items-center justify-center text-center text-[10px] gap-0.5">
        <p class="font-display-italic text-on-surface/60 italic">Nowhere to be. Let the hours drift... 🌸</p>
      </div>
    `;
  }
  
  // Action Buttons
  agendaHtml += `
    <div class="flex gap-2 mt-1.5 pt-1.5 border-t border-outline-variant/10">
      <button onclick="openCalendarAppointmentForm()" class="flex-1 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-[#FDF0D5]/50 active:scale-95 transition-all text-[11px] font-sub-label flex items-center justify-center gap-1">
        <span class="material-symbols-outlined text-[10px]">add</span> Plan Event
      </button>
      <button onclick="applyCalendarSelectedDate()" class="flex-1 py-1.5 rounded-full rose-gold-gradient text-white hover:opacity-95 active:scale-95 transition-all text-[11px] font-sub-label flex items-center justify-center gap-1 shadow-sm">
        <span class="material-symbols-outlined text-[10px]">done</span> Select & View
      </button>
    </div>
  `;
  
  container.innerHTML = agendaHtml;
}

function renderCalendar() {
  const grid = document.getElementById('calendar-days-grid');
  const label = document.getElementById('calendar-month-year');
  if (!grid || !label) return;
  grid.innerHTML = '';
  
  const year = calendarCurrentMonth.getFullYear();
  const month = calendarCurrentMonth.getMonth();
  
  // Localized month name
  const lang = localStorage.getItem('cm-language') || 'en';
  const monthNames = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    sw: ['Januari','Februari','Machi','Aprili','Mei','Juni','Julai','Agosti','Septemba','Oktoba','Novemba','Desemba'],
    fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  };
  label.textContent = `${(monthNames[lang] || monthNames.en)[month]} ${year}`;
  
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const selectedStr = getLocalDateString((calendarSelectedDate || selectedDate || today));
  
  // Leading blank cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    const blank = document.createElement('div');
    grid.appendChild(blank);
  }
  
  // Day cells
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const dateKey = getLocalDateString(d);
    const isSelected = dateKey === selectedStr;
    const isToday = dateKey === todayStr;
    const dayMood = moodByDate[dateKey];
    const hasEvent = appointments.some(a => a.date === dateKey);
    
    const cellWrap = document.createElement('div');
    cellWrap.className = 'flex flex-col items-center justify-start h-10 relative';
    
    let btnClass = 'w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 active:scale-90 font-medium';
    if (isSelected) {
      btnClass += ' rose-gold-gradient text-white font-bold shadow-md';
    } else if (isToday) {
      btnClass += ' border border-primary/50 text-primary font-bold';
    } else {
      btnClass += ' text-on-surface hover:bg-outline-variant/20';
    }
    
    const btn = document.createElement('button');
    btn.className = btnClass;
    btn.textContent = day;
    btn.onclick = () => selectCalendarDate(year, month, day);
    cellWrap.appendChild(btn);
    
    // Indicator dots row
    if (dayMood || hasEvent) {
      const dotsRow = document.createElement('div');
      dotsRow.className = 'flex gap-0.5 justify-center mt-0.5';
      
      if (dayMood) {
        const moodDot = document.createElement('span');
        moodDot.className = 'w-1 h-1 rounded-full';
        if (dayMood === 'Calm') moodDot.classList.add('bg-[#2E7D32]');
        else if (dayMood === 'Lit') moodDot.classList.add('bg-[#D4956A]');
        else moodDot.classList.add('bg-[#7E57C2]');
        dotsRow.appendChild(moodDot);
      }
      
      if (hasEvent) {
        const evDot = document.createElement('span');
        evDot.className = 'w-1 h-1 rounded-full bg-[#914540]';
        dotsRow.appendChild(evDot);
      }
      
      cellWrap.appendChild(dotsRow);
    }
    
    grid.appendChild(cellWrap);
  }
}

// ===== FREQUENCY STOCK REPLENISH ENGINE =====
function renderEssentials() {
  const container = document.getElementById('essentials-container');
  if (!container) return;
  container.innerHTML = '';
  
  essentials.forEach((item, index) => {
    const elapsed = (Date.now() - new Date(item.lastReplenished).getTime()) / (24 * 60 * 60 * 1000);
    const usageRatio = elapsed / item.daysDuration;
    
    let statusText = "In stock";
    let statusColor = "text-on-surface-variant";
    let glowBg = "bg-primary-fixed/30 text-primary";
    
    if (usageRatio >= 0.8) {
      statusText = "Almost gone";
      statusColor = "text-primary font-bold";
      glowBg = "bg-[#FFDADA] text-[#914540]";
    } else if (usageRatio >= 0.5) {
      statusText = "Low stock";
      statusColor = "text-[#D4956A] font-medium";
      glowBg = "bg-[#FDF0DC] text-[#D4956A]";
    }
    
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(212,149,106,0.05)] flex items-center justify-between transition-all duration-300';
    
    card.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full ${glowBg} flex items-center justify-center">
          <span class="material-symbols-outlined">${item.icon}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">${item.emoji === item.name ? item.name : `${item.emoji} ${item.name}`}</p>
          <p class="font-sub-label text-sub-label ${statusColor}">${statusText}</p>
        </div>
      </div>
      <button onclick="replenishItem(${index})" class="bg-primary text-on-primary font-sub-label text-sub-label px-4 py-2 rounded-full pearl-gloss hover:opacity-90 transition-opacity active:scale-95 shadow-sm">
        ${usageRatio >= 0.8 ? 'Add to cart 🛒' : 'Replenish ✦'}
      </button>
    `;
    
    container.appendChild(card);
  });
}

function replenishItem(index) {
  const item = essentials[index];
  const elapsed = (Date.now() - new Date(item.lastReplenished).getTime()) / (24 * 60 * 60 * 1000);
  const usageRatio = elapsed / item.daysDuration;
  
  // If the item is almost gone, clicking automatically moves it to the Grocery List as unchecked!
  if (usageRatio >= 0.8) {
    const alreadyExists = groceries.some(g => g.name.toLowerCase() === item.name.toLowerCase() && !g.checked);
    if (!alreadyExists) {
      groceries.push({ name: item.name, checked: false });
      localStorage.setItem('cm-groceries', JSON.stringify(groceries));
      renderGroceries();
    }
  }
  
  // Reset lastReplenished to current date
  essentials[index].lastReplenished = new Date().toISOString();
  localStorage.setItem('cm-essentials', JSON.stringify(essentials));
  
  renderEssentials();
}

// ===== ADULTING TAB: DYNAMIC BILLS & SUBSCRIPTIONS =====
function renderBillsAndSubscriptions() {
  const billsContainer = document.getElementById('bills-container');
  const subsContainer = document.getElementById('subscriptions-container');
  if (!billsContainer || !subsContainer) return;
  
  billsContainer.innerHTML = '';
  subsContainer.innerHTML = '';
  
  bills.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(212,149,106,0.05)] flex items-center justify-between transition-all';
    
    // Icon styles mapping
    let bgClass = "bg-primary-fixed/30 text-primary";
    if (item.category === 'tv') bgClass = "bg-secondary-container text-secondary";
    if (item.category === 'music_note') bgClass = "bg-tertiary-fixed/40 text-tertiary";
    if (item.category === 'fitness_center') bgClass = "bg-[#FDF0DC] text-[#D4956A]";
    if (item.category === 'home') bgClass = "bg-[#E8F4EC] text-[#2E7D32]";
    
    const paidBadge = item.paid 
      ? `<span onclick="toggleBillPaid(${index})" class="inline-block px-3 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-sub-label text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-80">Paid</span>`
      : `<span onclick="toggleBillPaid(${index})" class="inline-block px-3 py-0.5 rounded-full bg-[#FFDADA] text-[#914540] font-sub-label text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-80">Unpaid</span>`;
      
    card.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full ${bgClass} flex items-center justify-center">
          <span class="material-symbols-outlined">${item.category}</span>
        </div>
        <div>
          <p class="font-body-lg text-body-lg text-on-surface">${item.name}</p>
          <p class="font-sub-label text-sub-label text-on-surface-variant">${item.date}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="font-body-lg text-body-lg text-primary">${formatCurrency(item.amount)}</p>
          ${paidBadge}
        </div>
        <div class="flex flex-col gap-1 items-center justify-center">
          <button onclick="editBill(${index})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
          <button onclick="deleteBill(${index})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>
      </div>
    `;
    
    if (item.recurring) {
      subsContainer.appendChild(card);
    } else {
      billsContainer.appendChild(card);
    }
  });
}

function toggleBillPaid(index) {
  bills[index].paid = !bills[index].paid;
  localStorage.setItem('cm-bills', JSON.stringify(bills));
  renderBillsAndSubscriptions();
}

// ===== APPOINTMENTS Caret Expand =====
function toggleAppt(id) {
  const panel = document.getElementById(id);
  const caret = document.getElementById(id + '-caret');
  if (panel) {
    panel.classList.toggle('open');
  }
  if (caret) {
    caret.classList.toggle('rotate-180');
  }
}

// ===== GROCERY INTERACTION =====
function toggleShoppingMode() {
  shoppingMode = !shoppingMode;
  const dot = document.getElementById('shopping-mode-dot');
  const bg = document.getElementById('shopping-mode-bg');
  if (shoppingMode) {
    if (dot) dot.style.transform = 'translateX(16px)';
    if (bg) { bg.classList.remove('bg-surface-container-high'); bg.classList.add('bg-[#D4956A]'); }
    document.getElementById('grocery-total-label').textContent = 'Live Cart Total';
  } else {
    if (dot) dot.style.transform = 'translateX(0)';
    if (bg) { bg.classList.remove('bg-[#D4956A]'); bg.classList.add('bg-surface-container-high'); }
    document.getElementById('grocery-total-label').textContent = 'Estimated Trip Total';
  }
  renderGroceries();
}

function renderGroceries() {
  const container = document.getElementById('grocery-list');
  if (!container) return;
  container.innerHTML = '';
  
  let currentTotal = 0;

  groceries.forEach((item, index) => {
    // Totals logic
    if (shoppingMode) {
      if (item.checked && item.lastPrice) currentTotal += parseFloat(item.lastPrice);
    } else {
      if (!item.checked && item.lastPrice) currentTotal += parseFloat(item.lastPrice);
    }

    const card = document.createElement('div');
    if (item.checked) {
      card.className = 'bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 flex flex-col gap-2 opacity-60 transition-all';
    } else {
      card.className = 'bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 flex flex-col gap-2 transition-all shadow-sm';
    }

    // Top row: Name and (Check or Price Input)
    const topRow = document.createElement('div');
    topRow.className = 'flex items-center justify-between w-full';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-body-md text-body-md text-on-surface flex-grow truncate mr-2' + (item.checked ? ' line-through' : '');
    nameSpan.textContent = item.name;
    
    const actionArea = document.createElement('div');
    actionArea.className = 'flex items-center gap-3 shrink-0';
    
    if (shoppingMode) {
      // In shopping mode, show price input + checkmark side-by-side
      const priceInp = document.createElement('input');
      priceInp.type = 'number';
      priceInp.placeholder = '0';
      priceInp.value = item.lastPrice || '';
      priceInp.className = 'w-16 bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary text-right';
      priceInp.onchange = (e) => {
        item.lastPrice = e.target.value;
        localStorage.setItem('cm-groceries', JSON.stringify(groceries));
        renderGroceries(); // Re-render to update totals
      };
      actionArea.appendChild(priceInp);
    } else {
      // In normal mode, show the tag icon if not checked
      const tagBtn = document.createElement('button');
      tagBtn.className = 'text-on-surface-variant hover:text-primary transition-colors text-xs flex items-center gap-1 active:scale-90';
      tagBtn.innerHTML = `<span class="material-symbols-outlined text-sm">sell</span>`;
      tagBtn.onclick = () => openPriceModal(index);
      actionArea.appendChild(tagBtn);
    }

    // Checkbox
    const checkBox = document.createElement('div');
    if (item.checked) {
      checkBox.className = 'w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary cursor-pointer flex-shrink-0';
      checkBox.innerHTML = '<span class="material-symbols-outlined text-sm">check</span>';
    } else {
      checkBox.className = 'w-6 h-6 rounded-full border border-primary flex items-center justify-center text-primary cursor-pointer hover:bg-primary/5 flex-shrink-0';
      checkBox.innerHTML = '<span class="material-symbols-outlined text-sm opacity-0">check</span>';
    }
    checkBox.onclick = () => toggleCheck(index);
    actionArea.appendChild(checkBox);
    
    const delBtn = document.createElement('button');
    const editBtn = document.createElement('button');
    editBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform ml-2 mr-1';
    editBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">edit</span>';
    editBtn.onclick = () => editGrocery(index);
    actionArea.appendChild(editBtn);
    delBtn.className = 'text-on-surface-variant/50 hover:text-primary active:scale-90 transition-transform ml-1';
    delBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">delete</span>';
    delBtn.onclick = () => deleteGrocery(index);
    actionArea.appendChild(delBtn);

    topRow.appendChild(nameSpan);
    topRow.appendChild(actionArea);
    card.appendChild(topRow);

    // Bottom row: History (only show in normal mode if it has history)
    if (!shoppingMode && (item.lastPrice || item.store)) {
      const historyStr = [];
      if (item.lastPrice) historyStr.push(`Ksh ${item.lastPrice}`);
      if (item.store) historyStr.push(`@ ${item.store}`);
      
      const historyRow = document.createElement('div');
      historyRow.className = 'font-sub-label text-[9px] uppercase tracking-wider text-secondary flex items-center gap-1';
      historyRow.innerHTML = `<span class="material-symbols-outlined text-[10px]">history</span> Last paid: ${historyStr.join(' ')}`;
      card.appendChild(historyRow);
    }

    container.appendChild(card);
  });
  
  // Update footer value
  const totalVal = document.getElementById('grocery-total-value');
  if (totalVal) totalVal.textContent = formatCurrency(currentTotal);
}

function openPriceModal(index) {
  const item = groceries[index];
  const inpIdx = document.getElementById('price-input-index');
  const inpAmt = document.getElementById('price-input-amount');
  const inpStore = document.getElementById('price-input-store');
  
  if (inpIdx) inpIdx.value = index;
  if (inpAmt) inpAmt.value = item.lastPrice || '';
  if (inpStore) inpStore.value = item.store || '';
  
  openModal('price-modal');
}

function submitGroceryPrice() {
  const idxStr = document.getElementById('price-input-index').value;
  const idx = parseInt(idxStr);
  const price = document.getElementById('price-input-amount').value;
  const store = document.getElementById('price-input-store').value;
  
  if (!isNaN(idx) && groceries[idx]) {
    if (price) groceries[idx].lastPrice = price;
    if (store) groceries[idx].store = store;
    localStorage.setItem('cm-groceries', JSON.stringify(groceries));
    renderGroceries();
  }
  closeModal('price-modal');
}

function toggleCheck(index) {
  groceries[index].checked = !groceries[index].checked;
  localStorage.setItem('cm-groceries', JSON.stringify(groceries));
  renderGroceries();
}

// ===== THOUGHTS/NOTES SYSTEM =====
function renderThoughts() {
  const container = document.getElementById('thoughts-container');
  if (!container) return;
  container.innerHTML = '';

  thoughts.forEach(t => {
    const card = document.createElement('div');
    card.className = 'bg-[#FDE8E8] p-card-padding rounded-xl border border-[#D4956A]/30 shadow-sm flex flex-col gap-3 min-h-[140px]';
    
    // Assign color class based on date or a cycle
    if (t.emoji === '☁️') card.className = 'bg-[#F0EAF8] p-card-padding rounded-xl border border-[#D4956A]/30 shadow-sm flex flex-col gap-3 min-h-[140px]';
    if (t.emoji === '🌿') card.className = 'bg-[#E8F4EC] p-card-padding rounded-xl border border-[#D4956A]/30 shadow-sm flex flex-col gap-3 min-h-[140px]';
    if (t.emoji === '✨') card.className = 'bg-[#FDF0DC] p-card-padding rounded-xl border border-[#D4956A]/30 shadow-sm flex flex-col gap-3 min-h-[140px]';
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xl">${t.emoji}</span>
        <span class="font-cormorant italic text-sub-label text-secondary">${t.date}</span>
      </div>
      <p class="font-body-md text-on-surface leading-snug">${t.text}</p>
    `;
    container.appendChild(card);
  });
}

function saveThought() {
  const area = document.getElementById('mind-textarea');
  if (!area || area.value.trim() === '') return;

  const emojis = ['💡', '☁️', '🌿', '✨', '🌸', '🧘‍♀️', '🌊', '🧸'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  const newThought = {
    text: area.value.trim(),
    date: "Today",
    emoji: randomEmoji
  };

  thoughts.unshift(newThought);
  localStorage.setItem('cm-thoughts', JSON.stringify(thoughts));
  
  area.value = '';
  renderThoughts();
}

// ===== FLOATING ACTION BUTTON (FAB) =====
function toggleFab() {
  const menu = document.getElementById('fab-menu');
  const backdrop = document.getElementById('fab-backdrop');
  const btn = document.getElementById('fab-btn');
  
  const isHidden = menu.classList.contains('hidden');
  
  if (isHidden) {
    menu.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    btn.classList.add('rotate-45');
  } else {
    closeFab();
  }
}

function closeFab() {
  const menu = document.getElementById('fab-menu');
  const backdrop = document.getElementById('fab-backdrop');
  const btn = document.getElementById('fab-btn');
  
  if (menu) menu.classList.add('hidden');
  if (backdrop) backdrop.classList.add('hidden');
  if (btn) btn.classList.remove('rotate-45');
}

// ===== POMODORO FOCUS TIMER =====
let timerSeconds = 300;
let timerRunning = false;
let timerInterval = null;
let TOTAL = 300; // Default 5 Minutes

function openFocus() {
  const hrsInput = document.getElementById('focus-input-hours');
  const minInput = document.getElementById('focus-input-minutes');
  let h = hrsInput ? parseInt(hrsInput.value) || 0 : 0;
  let m = minInput ? parseInt(minInput.value) || 0 : 0;
  TOTAL = (h * 3600) + (m * 60);
  if (TOTAL <= 0) TOTAL = 25 * 60;
  timerSeconds = TOTAL;
  renderTimer();
  const overlay = document.getElementById('focus-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    resetTimer();
  }
}

function closeFocus() {
  const overlay = document.getElementById('focus-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    pauseTimer();
  }
}

function toggleTimer() {
  const textSpan = document.getElementById('focus-btn-text');
  if (timerRunning) {
    pauseTimer();
    if (textSpan) textSpan.innerHTML = 'Resume Focus ✦';
  } else {
    runTimer();
    if (textSpan) textSpan.innerHTML = 'Pause Focus ⏸';
    document.getElementById('focus-msg').textContent = "You started. That counts 🌿";
  }
}

function runTimer() {
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      renderTimer();
    } else {
      pauseTimer();
      const textSpan = document.getElementById('focus-btn-text');
      if (textSpan) textSpan.innerHTML = 'Done! 🌸';
      document.getElementById('focus-msg').textContent = "Time's up! You did it 🌸";
    }
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  timerSeconds = TOTAL;
  renderTimer();
  const textSpan = document.getElementById('focus-btn-text');
  if (textSpan) textSpan.innerHTML = 'Begin Focus ✦';
  document.getElementById('focus-msg').textContent = "You started. That's everything. 🌸";
}

function renderTimer() {
  const h = Math.floor(timerSeconds / 3600);
  const m = Math.floor((timerSeconds % 3600) / 60);
  const s = timerSeconds % 60;
  
  const display = document.getElementById('timer-display');
  if (display) {
    if (h > 0) {
      display.textContent = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    } else {
      display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
  }

  // Ring Animation
  const ring = document.getElementById('ring-fg');
  if (ring) {
    const circumference = 2 * Math.PI * 45; // r=45
    const progress = timerSeconds / TOTAL;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - progress);
  }
}

// ===== CLEARING THE SLATE (DEBTS) =====
function renderDebts() {
  const container = document.getElementById('debts-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (debts.length === 0) {
    container.innerHTML = '<p class="font-body-md text-on-surface-variant text-center py-4 italic text-sm">No balances to clear yet.</p>';
    return;
  }
  
  debts.forEach(debt => {
    const percent = Math.min(100, Math.round((debt.paid / debt.amount) * 100));
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest rounded-xl p-card-padding border border-outline-variant/30 shadow-[0_4px_20px_rgba(212,149,106,0.06)]';
    
    if (percent >= 100) {
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">${debt.name}</span>
          <span class="font-sub-label text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 px-2 py-1 rounded-full">Cleared! ✨</span>
        </div>
        <button onclick="deleteDebt(${debt.id})" class="text-[#914540] text-xs font-sub-label mt-2">Remove</button>
      `;
    } else {
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">${debt.name}</span>
          <div class="flex items-center gap-2">
            <button onclick="editDebt(${debt.id})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
            <button onclick="deleteDebt(${debt.id})" class="text-on-surface-variant/40 hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
          </div>
        </div>
        <div class="flex justify-between font-sub-label text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">
          <span>${formatCurrency(debt.paid)} paid (${formatCurrency(debt.amount - debt.paid)} left)</span>
          <span>${formatCurrency(debt.amount)} total</span>
        </div>
        <div class="w-full bg-surface-container-high rounded-full h-2 mb-3 overflow-hidden">
          <div class="rose-gold-gradient h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
        </div>
        <button onclick="openPaymentModal(${debt.id}, 'debt')" class="w-full border border-[#D4956A]/50 text-primary py-2 rounded-full text-xs font-sub-label active:scale-95 transition-transform">
          + Log Payment
        </button>
      `;
    }
    container.appendChild(card);
  });
}

function submitDebtItem() {
  const name = document.getElementById('debt-input-name').value;
  const amount = parseFloat(document.getElementById('debt-input-amount').value);
  const paid = parseFloat(document.getElementById('debt-input-paid').value) || 0;
  if (!name || isNaN(amount)) return;
  
  debts.push({ id: Date.now(), name, amount, paid });
  localStorage.setItem('cm-debts', JSON.stringify(debts));
  renderDebts();
  closeModal('debt-modal');
}

function deleteDebt(id) {
  debts = debts.filter(d => d.id !== id);
  localStorage.setItem('cm-debts', JSON.stringify(debts));
  renderDebts();
}

// ===== GUILT-FREE SPLURGES =====
function renderSplurges() {
  const container = document.getElementById('splurges-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (splurges.length === 0) {
    container.innerHTML = '<p class="font-body-md text-on-surface-variant text-center py-4 italic text-sm">No fun goals set yet. Treat yourself!</p>';
    return;
  }
  
  splurges.forEach(splurge => {
    const percent = Math.min(100, Math.round((splurge.paid / splurge.amount) * 100));
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest rounded-xl p-card-padding border border-outline-variant/30 shadow-[0_4px_20px_rgba(212,149,106,0.06)]';
    
    if (percent >= 100) {
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">${splurge.name}</span>
          <span class="font-sub-label text-[10px] text-[#C46A4A] font-bold uppercase tracking-wider bg-[#FFF0EA] px-2 py-1 rounded-full">Goal Reached! 🎉</span>
        </div>
        <button onclick="deleteSplurge(${splurge.id})" class="text-[#914540] text-xs font-sub-label mt-2">Remove</button>
      `;
    } else {
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-display-italic text-lg text-primary italic">${splurge.name}</span>
          <div class="flex items-center gap-2">
            <button onclick="editSplurge(${splurge.id})" class="text-on-surface-variant/40 hover:text-primary active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">edit</span></button>
            <button onclick="deleteSplurge(${splurge.id})" class="text-on-surface-variant/40 hover:text-[#914540] active:scale-90 transition-transform"><span class="material-symbols-outlined text-[16px]">delete</span></button>
          </div>
        </div>
        <div class="flex justify-between font-sub-label text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">
          <span>${formatCurrency(splurge.paid)} saved (${formatCurrency(splurge.amount - splurge.paid)} left)</span>
          <span>${formatCurrency(splurge.amount)} goal</span>
        </div>
        <div class="w-full bg-surface-container-high rounded-full h-2 mb-3 overflow-hidden">
          <div class="bg-gradient-to-r from-[#D46090] to-[#E6B9A6] h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
        </div>
        <button onclick="openPaymentModal(${splurge.id}, 'splurge')" class="w-full border border-[#D46090]/50 text-[#D46090] py-2 rounded-full text-xs font-sub-label active:scale-95 transition-transform">
          + Add to Jar
        </button>
      `;
    }
    container.appendChild(card);
  });
}

function submitSplurgeItem() {
  const name = document.getElementById('splurge-input-name').value;
  const amount = parseFloat(document.getElementById('splurge-input-amount').value);
  if (!name || isNaN(amount)) return;
  
  splurges.push({ id: Date.now(), name, amount, paid: 0 });
  localStorage.setItem('cm-splurges', JSON.stringify(splurges));
  renderSplurges();
  closeModal('splurge-modal');
}

function deleteSplurge(id) {
  splurges = splurges.filter(s => s.id !== id);
  localStorage.setItem('cm-splurges', JSON.stringify(splurges));
  renderSplurges();
}

// ===== PAYMENT MODAL LOGIC =====
function openPaymentModal(id, type) {
  const inpId = document.getElementById('payment-input-id');
  const inpType = document.getElementById('payment-input-type');
  const title = document.getElementById('payment-modal-title');
  const desc = document.getElementById('payment-modal-desc');
  
  if (inpId) inpId.value = id;
  if (inpType) inpType.value = type;
  
  if (title) title.textContent = type === 'debt' ? 'Log Payment' : 'Add to Jar';
  if (desc) desc.textContent = type === 'debt' ? 'How much did you chip away today?' : 'How much are you saving today?';
  
  openModal('payment-modal');
}

function submitPayment() {
  const id = parseInt(document.getElementById('payment-input-id').value);
  const type = document.getElementById('payment-input-type').value;
  const amount = parseFloat(document.getElementById('payment-input-amount').value);
  
  if (isNaN(id) || isNaN(amount)) return;
  
  if (type === 'debt') {
    const debt = debts.find(d => d.id === id);
    if (debt) {
      debt.paid += amount;
      localStorage.setItem('cm-debts', JSON.stringify(debts));
      renderDebts();
    }
  } else if (type === 'splurge') {
    const splurge = splurges.find(s => s.id === id);
    if (splurge) {
      splurge.paid += amount;
      localStorage.setItem('cm-splurges', JSON.stringify(splurges));
      renderSplurges();
    }
  }
  closeModal('payment-modal');
}

// ===== NEST RHYTHMS =====
function renderRhythms() {
  const container = document.getElementById('rhythms-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (rhythms.length === 0) {
    container.innerHTML = '<p class="font-body-md text-on-surface-variant text-center py-4 italic text-sm">No rhythms set. Add some gentle habits.</p>';
    return;
  }
  
  const today = new Date().setHours(0,0,0,0);
  
  rhythms.forEach(rhythm => {
    let lastDoneText = 'Never';
    if (rhythm.lastDone) {
      const diffTime = Math.abs(today - new Date(rhythm.lastDone).setHours(0,0,0,0));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) lastDoneText = 'Today';
      else if (diffDays === 1) lastDoneText = 'Yesterday';
      else lastDoneText = diffDays + ' days ago';
    }
    
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/30 shadow-sm flex items-center justify-between';
    card.innerHTML = `
      <div>
        <p class="font-display-italic text-sm text-primary italic mb-0.5">${rhythm.name}</p>
        <p class="font-sub-label text-[9px] uppercase tracking-wider text-secondary">Last: ${lastDoneText}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="logRhythm(${rhythm.id})" class="rose-gold-gradient text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
          <span class="material-symbols-outlined text-[16px]">done</span>
        </button>
        <button onclick="deleteRhythm(${rhythm.id})" class="text-[#914540] active:scale-90 transition-transform hover:bg-[#FDF0D5]/50 p-1.5 rounded-full">
          <span class="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function submitRhythmItem() {
  const name = document.getElementById('rhythm-input-name').value;
  if (!name) return;
  
  rhythms.push({ id: Date.now(), name, lastDone: null });
  localStorage.setItem('cm-rhythms', JSON.stringify(rhythms));
  renderRhythms();
  closeModal('rhythm-modal');
}

function logRhythm(id) {
  const rhythm = rhythms.find(r => r.id === id);
  if (rhythm) {
    rhythm.lastDone = new Date().toISOString();
    localStorage.setItem('cm-rhythms', JSON.stringify(rhythms));
    renderRhythms();
  }
}

function deleteRhythm(id) {
  rhythms = rhythms.filter(r => r.id !== id);
  localStorage.setItem('cm-rhythms', JSON.stringify(rhythms));
  renderRhythms();
}

// ===== LIFE ADMIN EXPIRIES =====
function renderExpiries() {
  const container = document.getElementById('expiries-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (expiries.length === 0) {
    container.innerHTML = '<p class="font-body-md text-on-surface-variant text-center py-4 italic text-sm">No renewals to track.</p>';
    return;
  }
  
  expiries.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/30 shadow-sm flex items-center justify-between';
    card.innerHTML = `
      <div>
        <p class="font-display-italic text-sm text-primary italic mb-0.5">${exp.name}</p>
        <p class="font-sub-label text-[9px] uppercase tracking-wider text-secondary">Expires: ${exp.date}</p>
      </div>
      <button onclick="deleteExpiry(${exp.id})" class="text-[#914540] active:scale-90 transition-transform hover:bg-[#FDF0D5]/50 p-1.5 rounded-full">
        <span class="material-symbols-outlined text-[16px]">delete</span>
      </button>
    `;
    container.appendChild(card);
  });
}

function submitExpiryItem() {
  const name = document.getElementById('expiry-input-name').value;
  const date = document.getElementById('expiry-input-date').value;
  if (!name || !date) return;
  
  expiries.push({ id: Date.now(), name, date });
  localStorage.setItem('cm-expiries', JSON.stringify(expiries));
  renderExpiries();
  closeModal('expiry-modal');
}

function deleteExpiry(id) {
  expiries = expiries.filter(e => e.id !== id);
  localStorage.setItem('cm-expiries', JSON.stringify(expiries));
  renderExpiries();
}

// ===== APP INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  renderAccountSection();
  updateClock();
  buildWeekStrip();
  restoreMood();
  renderMoodGarden();
  renderAppointments();
  renderGroceries();
  renderThoughts();
  renderEssentials();
  renderBillsAndSubscriptions();
  renderDebts();
  renderSplurges();
  renderRhythms();
  renderExpiries();
  
  // Update Clock every second
  setInterval(updateClock, 1000);
});


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
  localStorage.setItem('cm-mood-by-date', JSON.stringify(moodByDate));
  
  closeModal('mood-modal');
  renderCalendar();
  if (document.getElementById('calendar-modal').classList.contains('open')) {
    renderCalendarAgenda(calendarSelectedDate);
  }
  renderMoodGarden();
}


// ===== DELETE FUNCTIONS =====
function deleteBill(index) { bills.splice(index, 1); localStorage.setItem('cm-bills', JSON.stringify(bills)); renderBillsAndSubscriptions(); }
function deleteDebt(index) { debts.splice(index, 1); localStorage.setItem('cm-debts', JSON.stringify(debts)); renderDebts(); }
function deleteSplurge(index) { splurges.splice(index, 1); localStorage.setItem('cm-splurges', JSON.stringify(splurges)); renderSplurges(); }
function deleteRhythm(index) { rhythms.splice(index, 1); localStorage.setItem('cm-rhythms', JSON.stringify(rhythms)); renderRhythms(); }
function deleteExpiry(index) { expiries.splice(index, 1); localStorage.setItem('cm-expiries', JSON.stringify(expiries)); renderExpiries(); }
function deleteEssential(index) { essentials.splice(index, 1); localStorage.setItem('cm-essentials', JSON.stringify(essentials)); renderEssentials(); }
function deleteGrocery(index) { groceries.splice(index, 1); localStorage.setItem('cm-groceries', JSON.stringify(groceries)); renderGroceries(); }
function deleteThought(index) { thoughts.splice(index, 1); localStorage.setItem('cm-thoughts', JSON.stringify(thoughts)); renderThoughts(); }

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
