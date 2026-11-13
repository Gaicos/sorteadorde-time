/**
 * RIFT DRAFT - Sorteador de Times de League of Legends
 * Cadastro de amigos e balanceamento inteligente por Elo.
 */

// ==========================================
// 1. CONFIGURAÇÕES & ESTADO DA APLICAÇÃO
// ==========================================

const ELO_CONFIG = {
  1:  { name: 'Ferro',       tag: 'Ferro',       icon: '🪙', weight: 1,  color: '#707070' },
  2:  { name: 'Bronze',      tag: 'Bronze',      icon: '🟤', weight: 2,  color: '#965a38' },
  3:  { name: 'Prata',       tag: 'Prata',       icon: '⚪', weight: 3,  color: '#a3b3c2' },
  4:  { name: 'Ouro',        tag: 'Ouro',        icon: '🟡', weight: 4,  color: '#e5b338' },
  5:  { name: 'Platina',     tag: 'Platina',     icon: '🔷', weight: 5,  color: '#2bb6a8' },
  6:  { name: 'Esmeralda',   tag: 'Esmeralda',   icon: '🟢', weight: 6,  color: '#2ecc71' },
  7:  { name: 'Diamante',    tag: 'Diamante',    icon: '💠', weight: 7,  color: '#4aa3df' },
  8:  { name: 'Mestre',      tag: 'Mestre',      icon: '🔮', weight: 9,  color: '#a855f7' },
  9:  { name: 'Grão-Mestre', tag: 'Grão-Mestre', icon: '🔴', weight: 11, color: '#ef4444' },
  10: { name: 'Desafiante',  tag: 'Desafiante',  icon: '👑', weight: 13, color: '#facc15' }
};

const ROLES_5V5 = [
  { id: 'top', name: 'TOP', label: 'Topo', icon: '🗡️' },
  { id: 'jg',  name: 'JG',  label: 'Selva', icon: '🌿' },
  { id: 'mid', name: 'MID', label: 'Meio', icon: '⚡' },
  { id: 'adc', name: 'ADC', label: 'Atirador', icon: '🏹' },
  { id: 'sup', name: 'SUP', label: 'Suporte', icon: '🛡️' }
];

const ROLES_4V4 = [
  { id: 'top', name: 'TOP', label: 'Topo', icon: '🗡️' },
  { id: 'jg',  name: 'JG',  label: 'Selva', icon: '🌿' },
  { id: 'mid', name: 'MID', label: 'Meio', icon: '⚡' },
  { id: 'bot', name: 'BOT', label: 'Inferior', icon: '🏹' }
];

const DEMO_FRIENDS = [
  { name: 'Faker', tier: 10, selected: true },
  { name: 'Chovy', tier: 10, selected: true },
  { name: 'Showmaker', tier: 8, selected: true },
  { name: 'Caps', tier: 8, selected: true },
  { name: 'Gumayusi', tier: 7, selected: true },
  { name: 'Deft', tier: 7, selected: true },
  { name: 'Keria', tier: 8, selected: true },
  { name: 'BeryL', tier: 6, selected: true },
  { name: 'Zeus', tier: 7, selected: true },
  { name: 'Canyon', tier: 9, selected: true },
  { name: 'Oner', tier: 7, selected: false },
  { name: 'Ruler', tier: 8, selected: false }
];

const state = {
  friends: [],
  gameMode: '5x5', // '5x5' | '4x4' | 'custom'
  assignRoles: true,
  balanceElo: true, // Padrão: Equilibrar por Elo ativado!
  soundEnabled: true,
  lastDraft: null
};

// ==========================================
// 2. SISTEMA DE EFEITOS SONOROS (WEB AUDIO API)
// ==========================================

class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playClick() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playShuffleTick() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450 + Math.random() * 200, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playLockIn() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Corda épica triunfal LoL (Dó menor / Maior com sétima)
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + 1.3);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// ==========================================
// 3. PERSISTÊNCIA EM LOCALSTORAGE
// ==========================================

function loadStoredData() {
  try {
    const saved = localStorage.getItem('rift_draft_friends') || localStorage.getItem('rift_draft_players');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        state.friends = parsed.map(p => ({
          id: p.id || (Date.now() + Math.random().toString(36).substr(2, 5)),
          name: p.name,
          tier: p.tier || 4,
          selected: p.selected !== undefined ? p.selected : true
        }));
      }
    }
    const soundPref = localStorage.getItem('rift_draft_sound');
    if (soundPref !== null) {
      state.soundEnabled = JSON.parse(soundPref);
    }
  } catch (e) {
    console.error('Falha ao carregar dados salvos:', e);
  }
}

function saveStoredData() {
  try {
    localStorage.setItem('rift_draft_friends', JSON.stringify(state.friends));
    localStorage.setItem('rift_draft_sound', JSON.stringify(state.soundEnabled));
  } catch (e) {
    console.error('Falha ao salvar dados:', e);
  }
}

// ==========================================
// 4. ELEMENTOS DO DOM
// ==========================================

const dom = {
  playerNameInput: document.getElementById('playerNameInput'),
  playerTierInput: document.getElementById('playerTierInput'),
  btnAddPlayer: document.getElementById('btnAddPlayer'),
  playerList: document.getElementById('playerList'),
  playerCountBadge: document.getElementById('playerCountBadge'),
  emptyState: document.getElementById('emptyState'),
  statusAlert: document.getElementById('statusAlert'),
  statusAlertText: document.getElementById('statusAlertText'),
  btnRollTeams: document.getElementById('btnRollTeams'),
  ctaRollText: document.getElementById('ctaRollText'),
  btnFillDemo: document.getElementById('btnFillDemo'),
  btnOpenBulkModal: document.getElementById('btnOpenBulkModal'),
  btnClearAll: document.getElementById('btnClearAll'),
  gameModeControl: document.getElementById('gameModeControl'),
  assignRolesCheck: document.getElementById('assignRolesCheck'),
  roleCheckLabel: document.getElementById('roleCheckLabel'),
  balanceEloCheck: document.getElementById('balanceEloCheck'),
  audioToggleBtn: document.getElementById('audioToggleBtn'),
  audioIcon: document.getElementById('audioIcon'),

  // Quick Roster Selection
  btnSelectAll: document.getElementById('btnSelectAll'),
  btnSelectNeeded: document.getElementById('btnSelectNeeded'),
  btnDeselectAll: document.getElementById('btnDeselectAll'),
  
  // Results & Animation
  awaitingDraftState: document.getElementById('awaitingDraftState'),
  draftAnimation: document.getElementById('draftAnimation'),
  shuffleNamesBox: document.getElementById('shuffleNamesBox'),
  animBar: document.getElementById('animBar'),
  teamsContainer: document.getElementById('teamsContainer'),
  balanceSummaryBadge: document.getElementById('balanceSummaryBadge'),
  blueTeamList: document.getElementById('blueTeamList'),
  redTeamList: document.getElementById('redTeamList'),
  bluePowerTag: document.getElementById('bluePowerTag'),
  redPowerTag: document.getElementById('redPowerTag'),
  benchPanel: document.getElementById('benchPanel'),
  benchList: document.getElementById('benchList'),
  btnReroll: document.getElementById('btnReroll'),
  btnCopyDiscord: document.getElementById('btnCopyDiscord'),

  // Bulk Modal
  bulkModal: document.getElementById('bulkModal'),
  btnCloseBulkModal: document.getElementById('btnCloseBulkModal'),
  btnCancelBulkModal: document.getElementById('btnCancelBulkModal'),
  btnApplyBulkModal: document.getElementById('btnApplyBulkModal'),
  bulkInputText: document.getElementById('bulkInputText'),
  bulkDefaultElo: document.getElementById('bulkDefaultElo'),

  // Toast
  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toastMsg')
};

// ==========================================
// 5. CADASTRO E GERENCIAMENTO DE AMIGOS
// ==========================================

function addFriend(name, tier) {
  const cleanName = name.trim();
  if (!cleanName) {
    showToast('⚠️ Digite o nome ou nick do amigo!');
    return false;
  }

  // Evitar duplicatas exatas
  const exists = state.friends.some(f => f.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    showToast(`⚠️ "${cleanName}" já está cadastrado!`);
    return false;
  }

  state.friends.push({
    id: Date.now() + Math.random().toString(36).substr(2, 5),
    name: cleanName,
    tier: parseInt(tier, 10) || 4,
    selected: true
  });

  saveStoredData();
  renderPlayerList();
  updateStatus();
  sfx.playClick();
  showToast(`✅ ${cleanName} cadastrado com sucesso!`);
  return true;
}

function removeFriend(id) {
  state.friends = state.friends.filter(f => f.id !== id);
  saveStoredData();
  renderPlayerList();
  updateStatus();
  sfx.playClick();
}

function toggleFriendSelection(id) {
  const friend = state.friends.find(f => f.id === id);
  if (friend) {
    friend.selected = !friend.selected;
    saveStoredData();
    renderPlayerList();
    updateStatus();
    sfx.playClick();
  }
}

function updateFriendElo(id, newTier) {
  const friend = state.friends.find(f => f.id === id);
  if (friend) {
    friend.tier = parseInt(newTier, 10) || 4;
    saveStoredData();
    renderPlayerList();
    updateStatus();
  }
}

function selectAllFriends(val) {
  state.friends.forEach(f => { f.selected = val; });
  saveStoredData();
  renderPlayerList();
  updateStatus();
  sfx.playClick();
}

function selectNeededFriends() {
  let required = 10;
  if (state.gameMode === '4x4') required = 8;
  if (state.gameMode === 'custom') required = Math.max(2, Math.floor(state.friends.length / 2) * 2);

  state.friends.forEach((f, idx) => {
    f.selected = idx < required;
  });
  saveStoredData();
  renderPlayerList();
  updateStatus();
  sfx.playClick();
  showToast(`Marcados os primeiros ${required} amigos.`);
}

function clearAllFriends() {
  if (state.friends.length === 0) return;
  if (confirm('Tem certeza que deseja remover todos os amigos cadastrados?')) {
    state.friends = [];
    saveStoredData();
    renderPlayerList();
    updateStatus();
    sfx.playClick();
    showToast('Lista de amigos limpa!');
  }
}

function fillDemoFriends() {
  state.friends = DEMO_FRIENDS.map(f => ({
    id: Date.now() + Math.random().toString(36).substr(2, 5),
    name: f.name,
    tier: f.tier,
    selected: f.selected
  }));
  saveStoredData();
  renderPlayerList();
  updateStatus();
  sfx.playClick();
  showToast('Invocadores de demonstração carregados!');
}

function renderPlayerList() {
  dom.playerList.innerHTML = '';
  
  if (state.friends.length === 0) {
    dom.emptyState.classList.remove('hidden');
  } else {
    dom.emptyState.classList.add('hidden');
    
    state.friends.forEach((friend, index) => {
      const eloInfo = ELO_CONFIG[friend.tier] || ELO_CONFIG[4];
      const li = document.createElement('li');
      li.className = `player-item ${friend.selected ? 'is-selected' : 'is-benched'}`;

      // Monta as opções do seletor inline de Elo
      let optionsHtml = '';
      for (const [key, value] of Object.entries(ELO_CONFIG)) {
        const isSel = parseInt(key, 10) === friend.tier ? 'selected' : '';
        optionsHtml += `<option value="${key}" ${isSel}>${value.icon} ${value.tag}</option>`;
      }

      li.innerHTML = `
        <div class="player-info-left">
          <label class="friend-check-label" title="Marcar para jogar">
            <input type="checkbox" class="friend-checkbox" data-id="${friend.id}" ${friend.selected ? 'checked' : ''}>
            <span class="custom-check-mark"></span>
          </label>
          <span class="player-index">#${index + 1}</span>
          <span class="player-name">${escapeHtml(friend.name)}</span>
        </div>
        <div class="player-info-right">
          <select class="inline-elo-select" data-id="${friend.id}" title="Alterar Elo deste amigo">
            ${optionsHtml}
          </select>
          <button class="btn-remove-player" title="Remover amigo" data-id="${friend.id}">
            &times;
          </button>
        </div>
      `;

      // Evento de marcar / desmarcar presença
      li.querySelector('.friend-checkbox').addEventListener('change', () => {
        toggleFriendSelection(friend.id);
      });

      // Evento de alterar Elo inline
      li.querySelector('.inline-elo-select').addEventListener('change', (e) => {
        updateFriendElo(friend.id, e.target.value);
      });

      // Evento de remover
      li.querySelector('.btn-remove-player').addEventListener('click', () => {
        removeFriend(friend.id);
      });

      dom.playerList.appendChild(li);
    });
  }
}

function updateStatus() {
  const selectedCount = state.friends.filter(f => f.selected).length;
  let required = 10;
  if (state.gameMode === '4x4') required = 8;
  if (state.gameMode === 'custom') required = 2;

  dom.playerCountBadge.textContent = `${selectedCount} / ${required} Selecionados`;

  if (selectedCount >= required) {
    dom.playerCountBadge.classList.add('ready');
    dom.statusAlert.classList.add('ready');
    dom.statusAlert.querySelector('.status-icon').textContent = '✅';
    
    let extra = selectedCount > required ? ` (${selectedCount - required} ficarão no banco de reservas)` : '';
    dom.statusAlertText.textContent = `Pronto! ${selectedCount} amigos selecionados para o sorteio${extra}.`;
    dom.btnRollTeams.disabled = false;
  } else {
    dom.playerCountBadge.classList.remove('ready');
    dom.statusAlert.classList.remove('ready');
    dom.statusAlert.querySelector('.status-icon').textContent = '⚠️';
    const remaining = required - selectedCount;
    dom.statusAlertText.textContent = `Faltam ${remaining} amigo${remaining > 1 ? 's' : ''} marcado${remaining > 1 ? 's' : ''} para o modo ${state.gameMode.toUpperCase()}.`;
    dom.btnRollTeams.disabled = true;
  }

  // Atualiza texto do botão CTA conforme o modo de Elo
  if (state.balanceElo) {
    dom.ctaRollText.textContent = 'SORTEAR POR ELO';
  } else {
    dom.ctaRollText.textContent = 'SORTEAR ALEATÓRIO';
  }
}

// ==========================================
// 6. MOTOR DE SORTEIO & BALANCEAMENTO POR ELO
// ==========================================

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function draftTeams() {
  // Apenas amigos com checkbox marcado
  const activeFriends = state.friends.filter(f => f.selected);
  const total = activeFriends.length;
  let teamSize = 5;

  if (state.gameMode === '4x4') teamSize = 4;
  else if (state.gameMode === 'custom') {
    teamSize = Math.floor(total / 2);
    if (teamSize < 1) teamSize = 1;
  }

  const playersNeeded = teamSize * 2;
  const pool = shuffleArray(activeFriends);

  // Seleciona os jogadores que vão jogar e reservas
  const playingPool = pool.slice(0, playersNeeded);
  const benchPool = pool.slice(playersNeeded);

  let blueTeam = [];
  let redTeam = [];
  let eloDifference = 0;

  if (state.balanceElo) {
    // ALGORITMO OTIMIZADO DE BALANCEAMENTO POR ELO
    // Executa até 120 permutações para minimizar ao máximo a diferença de MMR
    let bestBlue = [];
    let bestRed = [];
    let minDiff = Infinity;

    for (let attempt = 0; attempt < 120; attempt++) {
      const candidate = shuffleArray(playingPool);
      const candBlue = candidate.slice(0, teamSize);
      const candRed = candidate.slice(teamSize);

      const scoreBlue = candBlue.reduce((acc, p) => acc + (ELO_CONFIG[p.tier]?.weight || 4), 0);
      const scoreRed = candRed.reduce((acc, p) => acc + (ELO_CONFIG[p.tier]?.weight || 4), 0);
      const diff = Math.abs(scoreBlue - scoreRed);

      if (diff < minDiff) {
        minDiff = diff;
        bestBlue = candBlue;
        bestRed = candRed;
        if (diff === 0) break; // Equilíbrio perfeito (zero de diferença)
      }
    }

    blueTeam = bestBlue;
    redTeam = bestRed;
    eloDifference = minDiff;
  } else {
    // Sorteio Aleatório Puro
    blueTeam = playingPool.slice(0, teamSize);
    redTeam = playingPool.slice(teamSize);

    const scoreBlue = blueTeam.reduce((acc, p) => acc + (ELO_CONFIG[p.tier]?.weight || 4), 0);
    const scoreRed = redTeam.reduce((acc, p) => acc + (ELO_CONFIG[p.tier]?.weight || 4), 0);
    eloDifference = Math.abs(scoreBlue - scoreRed);
  }

  // Atribuir Rotas (Lanes) se a opção estiver marcada
  let roles = [];
  if (state.gameMode === '5x5') roles = ROLES_5V5;
  else if (state.gameMode === '4x4') roles = ROLES_4V4;

  const blueWithRoles = blueTeam.map((player, idx) => ({
    player,
    role: state.assignRoles && roles[idx] ? roles[idx] : null
  }));

  const redWithRoles = redTeam.map((player, idx) => ({
    player,
    role: state.assignRoles && roles[idx] ? roles[idx] : null
  }));

  return {
    blueTeam: blueWithRoles,
    redTeam: redWithRoles,
    bench: benchPool,
    eloDifference,
    timestamp: new Date()
  };
}

// ==========================================
// 7. ANIMAÇÃO DE DRAFT & EXIBIÇÃO
// ==========================================

function executeDraft() {
  sfx.playClick();

  // Esconder tela de espera e resultados anteriores
  dom.awaitingDraftState.classList.add('hidden');
  dom.teamsContainer.classList.add('hidden');
  dom.draftAnimation.classList.remove('hidden');

  let progress = 0;
  dom.animBar.style.width = '0%';

  const activeNames = state.friends.filter(f => f.selected).map(f => f.name);
  const interval = setInterval(() => {
    const randomName = activeNames[Math.floor(Math.random() * activeNames.length)] || 'Invocador';
    dom.shuffleNamesBox.innerHTML = `<span class="shuffling-name">${escapeHtml(randomName)}</span>`;
    sfx.playShuffleTick();

    progress += 8;
    dom.animBar.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      finalizeDraft();
    }
  }, 90);
}

function finalizeDraft() {
  const result = draftTeams();
  state.lastDraft = result;

  dom.draftAnimation.classList.add('hidden');
  dom.teamsContainer.classList.remove('hidden');

  renderTeamResults(result);
  sfx.playLockIn();
}

function renderTeamResults(result) {
  // Render Time Azul
  dom.blueTeamList.innerHTML = '';
  result.blueTeam.forEach(slot => {
    dom.blueTeamList.appendChild(createMemberRow(slot));
  });

  // Render Time Vermelho
  dom.redTeamList.innerHTML = '';
  result.redTeam.forEach(slot => {
    dom.redTeamList.appendChild(createMemberRow(slot));
  });

  // MMR e Médias de Elo
  const scoreBlue = result.blueTeam.reduce((acc, s) => acc + (ELO_CONFIG[s.player.tier]?.weight || 4), 0);
  const scoreRed = result.redTeam.reduce((acc, s) => acc + (ELO_CONFIG[s.player.tier]?.weight || 4), 0);
  const avgBlue = calculateAverageElo(result.blueTeam.map(s => s.player.tier));
  const avgRed = calculateAverageElo(result.redTeam.map(s => s.player.tier));

  dom.bluePowerTag.textContent = `MMR: ${scoreBlue} • Média: ${avgBlue}`;
  dom.redPowerTag.textContent = `MMR: ${scoreRed} • Média: ${avgRed}`;

  // Badge de Resumo do Equilíbrio
  if (state.balanceElo) {
    if (result.eloDifference === 0) {
      dom.balanceSummaryBadge.innerHTML = '⚖️ Equilíbrio: <strong style="color: #2ecc71;">Perfeito (Diferença: 0)</strong>';
    } else {
      dom.balanceSummaryBadge.innerHTML = `⚖️ Equilíbrio: <strong>Diferença de ${result.eloDifference} pt(s)</strong>`;
    }
  } else {
    dom.balanceSummaryBadge.innerHTML = '🎲 Sorteio: <strong>Aleatório Puro</strong>';
  }

  // Banco de Reservas
  if (result.bench && result.bench.length > 0) {
    dom.benchPanel.classList.remove('hidden');
    dom.benchList.innerHTML = '';
    result.bench.forEach(p => {
      const chip = document.createElement('div');
      chip.className = 'bench-chip';
      chip.textContent = `${p.name} (${ELO_CONFIG[p.tier]?.tag || 'Elo'})`;
      dom.benchList.appendChild(chip);
    });
  } else {
    dom.benchPanel.classList.add('hidden');
  }
}

function createMemberRow(slot) {
  const eloInfo = ELO_CONFIG[slot.player.tier] || ELO_CONFIG[4];
  const row = document.createElement('div');
  row.className = 'team-member-row';

  let roleHtml = '';
  if (slot.role) {
    roleHtml = `
      <div class="role-icon-box" title="${slot.role.label}">
        <span>${slot.role.icon}</span>
      </div>
      <span class="role-name-tag">${slot.role.name}</span>
    `;
  }

  row.innerHTML = `
    <div class="member-role-group">
      ${roleHtml}
      <span class="member-player-name">${escapeHtml(slot.player.name)}</span>
    </div>
    <span class="member-elo-tag" style="border-color: ${eloInfo.color};">
      ${eloInfo.icon} ${eloInfo.tag}
    </span>
  `;

  return row;
}

function calculateAverageElo(tiers) {
  if (!tiers.length) return '-';
  const sum = tiers.reduce((acc, t) => acc + (ELO_CONFIG[t]?.weight || 4), 0);
  const avg = Math.round(sum / tiers.length);

  let closest = ELO_CONFIG[4].tag;
  let minDiff = Infinity;
  for (const key in ELO_CONFIG) {
    const diff = Math.abs(ELO_CONFIG[key].weight - avg);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ELO_CONFIG[key].tag;
    }
  }
  return closest;
}

// ==========================================
// 8. COPIAR PARA O DISCORD & WHATSAPP
// ==========================================

function copyDiscordFormat() {
  if (!state.lastDraft) {
    showToast('⚠️ Nenhum sorteio realizado ainda!');
    return;
  }

  const { blueTeam, redTeam, bench, eloDifference } = state.lastDraft;
  const modeLabel = state.gameMode === 'custom' ? 'Personalizado' : state.gameMode.toUpperCase();

  const scoreBlue = blueTeam.reduce((acc, s) => acc + (ELO_CONFIG[s.player.tier]?.weight || 4), 0);
  const scoreRed = redTeam.reduce((acc, s) => acc + (ELO_CONFIG[s.player.tier]?.weight || 4), 0);
  const avgBlue = calculateAverageElo(blueTeam.map(s => s.player.tier));
  const avgRed = calculateAverageElo(redTeam.map(s => s.player.tier));

  let text = `⚔️ **CONFRONTO EM SUMMONER'S RIFT** ⚔️\n`;
  text += `*Modo:* ${modeLabel} • *Sorteio:* ${state.balanceElo ? 'Equilibrado por Elo ⚖️' : 'Aleatório 🎲'}\n\n`;

  text += `🟦 **LADO AZUL** (MMR: ${scoreBlue} • Média: ${avgBlue})\n`;
  blueTeam.forEach(slot => {
    const eloInfo = ELO_CONFIG[slot.player.tier] || ELO_CONFIG[4];
    const rolePrefix = slot.role ? `${slot.role.icon} **${slot.role.name}**: ` : '• ';
    text += `${rolePrefix}${slot.player.name} [${eloInfo.icon} ${eloInfo.tag}]\n`;
  });

  text += `\n🟥 **LADO VERMELHO** (MMR: ${scoreRed} • Média: ${avgRed})\n`;
  redTeam.forEach(slot => {
    const eloInfo = ELO_CONFIG[slot.player.tier] || ELO_CONFIG[4];
    const rolePrefix = slot.role ? `${slot.role.icon} **${slot.role.name}**: ` : '• ';
    text += `${rolePrefix}${slot.player.name} [${eloInfo.icon} ${eloInfo.tag}]\n`;
  });

  if (state.balanceElo) {
    text += `\n⚖️ *Diferença de MMR: ${eloDifference} ${eloDifference === 0 ? '(Equilíbrio Perfeito!)' : ''}*\n`;
  }

  if (bench && bench.length > 0) {
    text += `\n🛋️ **RESERVAS**: ${bench.map(p => p.name).join(', ')}\n`;
  }

  text += `\n*Boa partida a todos no Rift!* 🏆`;

  navigator.clipboard.writeText(text).then(() => {
    sfx.playClick();
    showToast('📋 Copiado para a área de transferência!');
  }).catch(err => {
    showToast('❌ Erro ao copiar, verifique as permissões.');
  });
}

// ==========================================
// 9. MODAL EM MASSA (BULK INPUT)
// ==========================================

function handleBulkImport() {
  const rawText = dom.bulkInputText.value;
  if (!rawText.trim()) {
    showToast('⚠️ Cole os nomes na caixa de texto primeiro!');
    return;
  }

  const lines = rawText.split(/[\n,;\t]+/);
  const defaultTier = parseInt(dom.bulkDefaultElo.value, 10) || 4;

  let addedCount = 0;
  lines.forEach(item => {
    const clean = item.trim();
    if (clean && clean.length > 0) {
      const exists = state.friends.some(f => f.name.toLowerCase() === clean.toLowerCase());
      if (!exists) {
        state.friends.push({
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          name: clean,
          tier: defaultTier,
          selected: true
        });
        addedCount++;
      }
    }
  });

  saveStoredData();
  renderPlayerList();
  updateStatus();

  dom.bulkInputText.value = '';
  dom.bulkModal.classList.add('hidden');
  sfx.playClick();
  showToast(`✅ ${addedCount} novos amigos cadastrados!`);
}

// ==========================================
// 10. UTILITÁRIOS & TOAST
// ==========================================

let toastTimeout = null;
function showToast(message) {
  dom.toastMsg.textContent = message;
  dom.toast.classList.add('show');
  
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(string) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}

function initBackgroundParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${10 + Math.random() * 14}s`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    
    if (i % 3 === 0) {
      p.style.background = '#c8aa6e';
      p.style.filter = 'drop-shadow(0 0 5px #c8aa6e)';
    }
    
    container.appendChild(p);
  }
}

// ==========================================
// 11. EVENT LISTENERS
// ==========================================

function attachEvents() {
  // Cadastrar amigo pelo formulário
  dom.btnAddPlayer.addEventListener('click', () => {
    const name = dom.playerNameInput.value;
    const tier = dom.playerTierInput.value;
    if (addFriend(name, tier)) {
      dom.playerNameInput.value = '';
      dom.playerNameInput.focus();
    }
  });

  dom.playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dom.btnAddPlayer.click();
    }
  });

  // Botões de Ação do Roster
  dom.btnSelectAll.addEventListener('click', () => selectAllFriends(true));
  dom.btnDeselectAll.addEventListener('click', () => selectAllFriends(false));
  dom.btnSelectNeeded.addEventListener('click', selectNeededFriends);

  dom.btnFillDemo.addEventListener('click', fillDemoFriends);
  dom.btnClearAll.addEventListener('click', clearAllFriends);

  // Modos de Jogo (Segmented Buttons)
  dom.gameModeControl.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = btn.dataset.mode;
      dom.gameModeControl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.gameMode = mode;
      
      if (mode === '5x5') {
        dom.roleCheckLabel.textContent = 'Sortear Rotas (Top, Jg, Mid, Adc, Sup)';
      } else if (mode === '4x4') {
        dom.roleCheckLabel.textContent = 'Sortear Rotas (Top, Jg, Mid, Bot)';
      } else {
        dom.roleCheckLabel.textContent = 'Sortear Posições';
      }

      updateStatus();
      sfx.playClick();
    });
  });

  // Checkboxes de Configuração
  dom.assignRolesCheck.addEventListener('change', (e) => {
    state.assignRoles = e.target.checked;
    sfx.playClick();
  });

  dom.balanceEloCheck.addEventListener('change', (e) => {
    state.balanceElo = e.target.checked;
    updateStatus();
    sfx.playClick();
  });

  // Botão de Áudio
  dom.audioToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    dom.audioIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    dom.audioToggleBtn.querySelector('.icon-label').textContent = state.soundEnabled ? 'EFEITOS DE SOM' : 'SOM MUDO';
    saveStoredData();
    if (state.soundEnabled) sfx.playClick();
  });

  // Iniciar Sorteio
  dom.btnRollTeams.addEventListener('click', executeDraft);
  dom.btnReroll.addEventListener('click', executeDraft);

  // Copiar para Discord
  dom.btnCopyDiscord.addEventListener('click', copyDiscordFormat);

  // Modal Bulk Input
  dom.btnOpenBulkModal.addEventListener('click', () => {
    dom.bulkModal.classList.remove('hidden');
    dom.bulkInputText.focus();
    sfx.playClick();
  });

  dom.btnCloseBulkModal.addEventListener('click', () => {
    dom.bulkModal.classList.add('hidden');
    sfx.playClick();
  });

  dom.btnCancelBulkModal.addEventListener('click', () => {
    dom.bulkModal.classList.add('hidden');
    sfx.playClick();
  });

  dom.btnApplyBulkModal.addEventListener('click', handleBulkImport);

  dom.bulkModal.addEventListener('click', (e) => {
    if (e.target === dom.bulkModal) {
      dom.bulkModal.classList.add('hidden');
    }
  });
}

// ==========================================
// 12. INÍCIO DA EXECUÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  initBackgroundParticles();
  attachEvents();

  if (!state.soundEnabled) {
    dom.audioIcon.textContent = '🔇';
    dom.audioToggleBtn.querySelector('.icon-label').textContent = 'SOM MUDO';
  }

  if (state.friends.length === 0) {
    fillDemoFriends();
  } else {
    renderPlayerList();
    updateStatus();
  }
});
