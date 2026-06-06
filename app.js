'use strict';

// ── CONSTANTES ──────────────────────────────────────────────────────────────
const TREINO_META   = { '':1800, 'Musculação':1800, 'Futebol':1800, 'Caminhada':1800, 'Musculção+Caminhada':1800, 'Musculação+Futebol':1950 };
const TREINO_BASAL  = { '':2200, 'Musculação':2750, 'Futebol':2800, 'Caminhada':2600, 'Musculção+Caminhada':2800, 'Musculação+Futebol':3100 };
const REFEICOES     = ['Café da Manhã','Almoço','Lanche da Tarde','Jantar','Ceia'];
const DIAS_PT       = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MESES_PT      = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

// ── ESTADO (persiste em localStorage) ───────────────────────────────────────
let state = {
  alimentos: [],
  registrosPorData: {},   // { "2026-06-07": [ {nome, gramas, calBase, cal, refeicao}, ... ] }
  pesagens: [],
  treinoPorData: {},      // { "2026-06-07": "Musculação" }
  apiKey: ''
};

function salvarState() { localStorage.setItem('plano_alimentar_v2', JSON.stringify(state)); }
function carregarState() {
  const raw = localStorage.getItem('plano_alimentar_v2');
  if (raw) { try { state = { ...state, ...JSON.parse(raw) }; } catch(e) {} }
  // Seed de alimentos se vazio
  if (!state.alimentos || state.alimentos.length === 0) state.alimentos = alimentosSeed();
  // Seed de pesagens se vazio
  if (!state.pesagens || state.pesagens.length === 0) state.pesagens = pesagensSeed();
}

function alimentosSeed() {
  return [
    {nome:'Banana fruta',cal:80},{nome:'Iogurte light batavo',cal:26},{nome:'Arroz Branco cozido',cal:130},
    {nome:'Feijão Carioca cozido',cal:76},{nome:'File de Frango',cal:190},{nome:'Ovo Cozido',cal:155},
    {nome:'Ovo Frito',cal:196},{nome:'Ovo Mexido',cal:148},{nome:'Batata Inglesa cozida',cal:87},
    {nome:'Leite Integral',cal:64},{nome:'Pão Frances',cal:270},{nome:'Pão de Forma',cal:200},
    {nome:'Maçã',cal:80},{nome:'Banana Maça',cal:80},{nome:'Maminha',cal:220},
    {nome:'Fraldinha',cal:255},{nome:'Picanha',cal:290},{nome:'Coxa de Frango na Airfryer',cal:210},
    {nome:'Macarronada',cal:140},{nome:'Carne Moida (Patinho)',cal:175},{nome:'Alcatra Assada',cal:250},
    {nome:'Mandioca cozida',cal:130},{nome:'Requeijão Catupiry',cal:153},{nome:'Presunto',cal:145},
    {nome:'Muçarela',cal:350},{nome:'Whey dux com leite (250ml)',cal:223},{nome:'Iogurte frutap',cal:35},
    {nome:'Suco de Laranja',cal:45},{nome:'Batata Palito Airfryer',cal:220},{nome:'Abacaxi',cal:50},
    {nome:'Laranja Pera',cal:62},{nome:'Melancia',cal:30},{nome:'Morango',cal:32},
    {nome:'Açai (merli)',cal:116},{nome:'Coxa sobrecoxa assada',cal:180},{nome:'Frango Assado',cal:180},
    {nome:'Linguiça assada',cal:300},{nome:'Batata cozida',cal:120},{nome:'Pure de batata',cal:150},
    {nome:'Gelatina pura',cal:13},{nome:'Yopro',cal:152},{nome:'Cerveja budweiser zero',cal:69},
    {nome:'Café com açúcar',cal:22},{nome:'Pão de hamburguer',cal:262},{nome:'Hamburguer de patinho',cal:210}
  ];
}

function pesagensSeed() {
  return [
    {n:1, data:'20/10/25', peso:118.8, diff:null},
    {n:2, data:'29/10/25', peso:114.7, diff:-4.1},
    {n:3, data:'03/11/25', peso:114.2, diff:-0.5},
    {n:4, data:'10/11/25', peso:111.9, diff:-2.3},
    {n:5, data:'17/11/25', peso:110.9, diff:-1.0},
    {n:6, data:'24/11/25', peso:109.6, diff:-1.3},
    {n:7, data:'01/12/25', peso:107.5, diff:-2.1},
    {n:8, data:'08/12/25', peso:106.0, diff:-1.5},
    {n:9, data:'15/12/25', peso:104.9, diff:-1.1},
    {n:10, data:'22/12/25', peso:102.9, diff:-2.0},
    {n:11, data:'05/01/26', peso:104.5, diff:+1.6},
    {n:12, data:'12/01/26', peso:104.1, diff:-0.4},
    {n:13, data:'19/01/26', peso:102.9, diff:-1.2},
    {n:14, data:'26/01/26', peso:101.85,diff:-1.05},
    {n:15, data:'02/02/26', peso:103.85,diff:+2.0},
    {n:16, data:'09/02/26', peso:101.2, diff:-2.65},
    {n:17, data:'Pausa',    peso:102.0, diff:+0.8},
    {n:18, data:'05/05/26', peso:100.9, diff:-1.1},
    {n:19, data:'12/05/26', peso:99.0,  diff:-1.9},
  ];
}

// ── DATA ATUAL ───────────────────────────────────────────────────────────────
function dataHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatarDataExibicao(dataISO) {
  const [y,m,d] = dataISO.split('-').map(Number);
  const dt = new Date(y, m-1, d);
  return `${DIAS_PT[dt.getDay()]}, ${d} de ${MESES_PT[m-1]} de ${y}`;
}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarState();
  const hoje = dataHoje();
  document.getElementById('topbar-sub').textContent = formatarDataExibicao(hoje);

  // Chips de treino
  document.querySelectorAll('#treino-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => setTreino(chip));
  });

  // Restaurar treino do dia
  const treinoSalvo = state.treinoPorData[hoje] || '';
  document.querySelectorAll('#treino-chips .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.treino === treinoSalvo);
  });

  atualizarSummary();
  renderMeals();
  renderAlimentos();
  renderPesagens();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

// ── NAVEGAÇÃO ─────────────────────────────────────────────────────────────────
function navTo(page) {
  ['home','peso','alimentos'].forEach(p => {
    document.getElementById('page-'+p).classList.remove('active');
    document.getElementById('nav-'+p).classList.remove('active');
  });
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('nav-'+page).classList.add('active');
}

// ── TREINO ────────────────────────────────────────────────────────────────────
function setTreino(el) {
  document.querySelectorAll('#treino-chips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const treino = el.dataset.treino;
  state.treinoPorData[dataHoje()] = treino;
  salvarState();
  atualizarSummary();
}

// ── SUMMARY ───────────────────────────────────────────────────────────────────
function atualizarSummary() {
  const hoje = dataHoje();
  const treino = state.treinoPorData[hoje] || '';
  const registros = state.registrosPorData[hoje] || [];
  const total = registros.reduce((a, r) => a + r.cal, 0);
  const meta  = TREINO_META[treino]  ?? 1800;
  const basal = TREINO_BASAL[treino] ?? 2200;
  const status = total - meta;
  const pct = meta > 0 ? Math.min(Math.round(total / meta * 100), 100) : 0;

  document.getElementById('cal-hoje').textContent  = total + ' kcal';
  document.getElementById('meta-dia').textContent  = meta  + ' kcal';
  document.getElementById('gasto-basal').textContent = basal + ' kcal';

  const sm = document.getElementById('status-meta');
  sm.textContent  = (status >= 0 ? '+' : '') + status;
  sm.className    = 'metric-value ' + (status > 100 ? 'over' : status > -100 ? 'neutral' : 'good');

  document.getElementById('pct-label').textContent = pct + '%';
  const fill = document.getElementById('progress-fill');
  fill.style.width = pct + '%';
  fill.className   = 'progress-fill' + (pct >= 100 ? ' over' : pct >= 85 ? ' warn' : '');

  const badge = document.getElementById('treino-badge');
  badge.textContent = treino ? treino : 'Nenhum treino';
}

// ── REFEIÇÕES ─────────────────────────────────────────────────────────────────
function renderMeals() {
  const hoje = dataHoje();
  const registros = state.registrosPorData[hoje] || [];
  const el = document.getElementById('meal-list');

  if (registros.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <i class="ti ti-salad" style="font-size:36px;opacity:0.25;display:block;margin-bottom:10px;"></i>
      Nenhum alimento registrado hoje.<br>Toque em "Adicionar" para começar.
    </div>`;
    return;
  }

  const grupos = {};
  registros.forEach((r, i) => {
    if (!grupos[r.refeicao]) grupos[r.refeicao] = [];
    grupos[r.refeicao].push({ ...r, idx: i });
  });

  el.innerHTML = Object.entries(grupos).map(([ref, items]) =>
    `<div class="meal-group-label">${ref}</div>` +
    items.map(r => `
      <div class="food-row">
        <div>
          <div class="food-name">${r.nome}</div>
          <div class="food-detail">${r.gramas}g &middot; ${r.calBase} kcal/100g</div>
        </div>
        <div class="food-right">
          <span class="food-cal">${r.cal} kcal</span>
          <button class="food-del" onclick="removerAlimento(${r.idx})" aria-label="Remover">
            <i class="ti ti-x"></i>
          </button>
        </div>
      </div>`).join('')
  ).join('');
}

function removerAlimento(idx) {
  const hoje = dataHoje();
  state.registrosPorData[hoje].splice(idx, 1);
  salvarState();
  renderMeals();
  atualizarSummary();
  showToast('Alimento removido');
}

// ── MODAL ADICIONAR ────────────────────────────────────────────────────────────
function openAddModal() {
  openModal(`
    <div class="modal-title">Adicionar alimento</div>
    <div class="form-group">
      <div class="form-label">Refeição</div>
      <select class="form-input" id="m-refeicao">
        ${REFEICOES.map(r => `<option>${r}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <div class="form-label">Alimento <span class="ai-badge">IA</span></div>
      <input class="form-input" type="text" id="m-alimento" placeholder="Digite o nome do alimento..." autocomplete="off">
      <div id="m-suggestions"></div>
      <div id="m-ai-status"></div>
    </div>
    <div class="form-group">
      <div class="form-label">Quantidade (gramas)</div>
      <input class="form-input" type="number" id="m-gramas" placeholder="ex: 150" min="1" inputmode="decimal">
    </div>
    <div class="form-group">
      <div class="form-label">Kcal por 100g</div>
      <input class="form-input" type="number" id="m-calbase" placeholder="Preenchido automaticamente" readonly inputmode="decimal">
    </div>
    <div class="btn-row">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" id="m-save" onclick="salvarNovoRegistro()">Salvar</button>
    </div>
  `);

  setTimeout(() => {
    const inp = document.getElementById('m-alimento');
    if (inp) {
      inp.addEventListener('input', handleFoodInput);
      inp.focus();
    }
  }, 100);
}

let aiTimer = null;
let aiCal   = null;

function handleFoodInput() {
  const q = this.value.trim().toLowerCase();
  const sugEl = document.getElementById('m-suggestions');
  const aiEl  = document.getElementById('m-ai-status');
  document.getElementById('m-calbase').value = '';
  aiCal = null;
  clearTimeout(aiTimer);

  if (q.length < 2) { sugEl.innerHTML = ''; aiEl.innerHTML = ''; return; }

  const matches = state.alimentos.filter(a => a.nome.toLowerCase().includes(q)).slice(0, 6);

  if (matches.length > 0) {
    sugEl.innerHTML = `<div class="suggestions">` +
      matches.map(a => `<div class="suggestion-item" onclick="selecionarAlimento('${a.nome.replace(/'/g,"\\'").replace(/"/g,'&quot;')}', ${a.cal})">
        <span>${a.nome}</span>
        <span class="suggestion-cal">${a.cal} kcal/100g</span>
      </div>`).join('') + `</div>`;
    aiEl.innerHTML = '';
  } else {
    sugEl.innerHTML = '';
    aiEl.innerHTML = `<div class="ai-status loading"><i class="ti ti-loader"></i> Buscando com IA...</div>`;
    aiTimer = setTimeout(() => buscarComIA(this.value.trim()), 900);
  }
}

function selecionarAlimento(nome, cal) {
  document.getElementById('m-alimento').value = nome;
  document.getElementById('m-calbase').value  = cal;
  document.getElementById('m-suggestions').innerHTML = '';
  document.getElementById('m-ai-status').innerHTML   = '';
  aiCal = cal;
}

async function buscarComIA(query) {
  const apiKey = state.apiKey;
  const aiEl   = document.getElementById('m-ai-status');
  const calEl  = document.getElementById('m-calbase');
  if (!aiEl || !calEl) return;

  if (!apiKey) {
    aiEl.innerHTML = `<div class="ai-status error"><i class="ti ti-alert-circle"></i> Configure sua chave da API nas configurações (ícone ⚙️).</div>`;
    if (calEl) calEl.removeAttribute('readonly');
    return;
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [{ role: 'user', content: `Quantas calorias tem "${query}" por 100g? Responda SOMENTE com JSON: {"nome":"nome do alimento","kcal_100g":numero}. Sem texto extra.` }]
      })
    });
    const data = await resp.json();
    const text = (data.content || []).map(c => c.text || '').join('').replace(/```json|```/g,'').trim();
    const parsed = JSON.parse(text);

    if (parsed.kcal_100g && document.getElementById('m-alimento')) {
      document.getElementById('m-calbase').value = parsed.kcal_100g;
      aiCal = parsed.kcal_100g;
      if (aiEl) aiEl.innerHTML = `<div class="ai-status success"><i class="ti ti-sparkles"></i> IA encontrou: ${parsed.nome} — ${parsed.kcal_100g} kcal/100g</div>`;
      // Salva no banco para próximas vezes
      if (!state.alimentos.find(a => a.nome.toLowerCase() === parsed.nome.toLowerCase())) {
        state.alimentos.push({ nome: parsed.nome, cal: parsed.kcal_100g });
        salvarState();
      }
    }
  } catch (e) {
    if (aiEl) aiEl.innerHTML = `<div class="ai-status error"><i class="ti ti-alert-circle"></i> Não encontrado. Preencha as calorias manualmente.</div>`;
    if (calEl) calEl.removeAttribute('readonly');
  }
}

function salvarNovoRegistro() {
  const nome    = (document.getElementById('m-alimento')?.value || '').trim();
  const gramas  = parseInt(document.getElementById('m-gramas')?.value || '0');
  const calBase = parseInt(document.getElementById('m-calbase')?.value || '0');
  const refeicao = document.getElementById('m-refeicao')?.value || REFEICOES[0];

  if (!nome || !gramas || !calBase) { showToast('Preencha todos os campos'); return; }

  const cal  = Math.round(gramas * calBase / 100);
  const hoje = dataHoje();
  if (!state.registrosPorData[hoje]) state.registrosPorData[hoje] = [];
  state.registrosPorData[hoje].push({ nome, gramas, calBase, cal, refeicao });
  salvarState();
  closeModal();
  renderMeals();
  atualizarSummary();
  showToast(`${cal} kcal adicionadas`);
}

// ── PESAGEM ───────────────────────────────────────────────────────────────────
function renderPesagens() {
  const pesagens = state.pesagens;
  const el = document.getElementById('pesagem-list');

  if (pesagens.length === 0) {
    el.innerHTML = '<div class="empty-state">Nenhuma pesagem registrada ainda.</div>';
    document.getElementById('peso-atual').textContent  = '— kg';
    document.getElementById('peso-perdido').textContent = '— kg';
    document.getElementById('media-diff').textContent  = '—';
    return;
  }

  const ultima  = pesagens[pesagens.length - 1];
  const primeira = pesagens[0];
  const diffs   = pesagens.filter(p => p.diff !== null).map(p => p.diff);
  const totalPerdido = diffs.reduce((a,b) => a+b, 0);
  const media   = diffs.length ? totalPerdido / diffs.length : 0;

  document.getElementById('peso-atual').textContent   = ultima.peso.toFixed(1).replace('.',',') + ' kg';
  document.getElementById('peso-perdido').textContent = (totalPerdido).toFixed(1).replace('.',',') + ' kg';
  document.getElementById('media-diff').textContent   = (media >= 0 ? '+' : '') + media.toFixed(2).replace('.',',') + ' kg';

  el.innerHTML = [...pesagens].reverse().map(p => {
    const diffHtml = p.diff === null ? '<span></span>' :
      `<span class="pesagem-diff ${p.diff <= 0 ? 'neg' : 'pos'}">${p.diff > 0 ? '+' : ''}${p.diff.toFixed(1)} kg</span>`;
    return `<div class="pesagem-row">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="pesagem-n">#${p.n}</span>
        <span class="pesagem-data">${p.data}</span>
      </div>
      <span class="pesagem-peso">${p.peso.toFixed(1).replace('.',',')} kg</span>
      ${diffHtml}
    </div>`;
  }).join('');
}

function openPesagemModal() {
  const hoje = new Date().toISOString().split('T')[0];
  openModal(`
    <div class="modal-title">Registrar pesagem</div>
    <div class="form-group">
      <div class="form-label">Data</div>
      <input class="form-input" type="date" id="p-data" value="${hoje}">
    </div>
    <div class="form-group">
      <div class="form-label">Peso (kg)</div>
      <input class="form-input" type="number" id="p-peso" placeholder="ex: 98.5" step="0.1" inputmode="decimal">
    </div>
    <div class="btn-row">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="salvarPesagem()">Salvar</button>
    </div>
  `);
  setTimeout(() => document.getElementById('p-peso')?.focus(), 100);
}

function salvarPesagem() {
  const peso = parseFloat(document.getElementById('p-peso')?.value || '');
  const dataVal = document.getElementById('p-data')?.value || '';
  if (!peso || !dataVal) { showToast('Preencha todos os campos'); return; }

  const [y,m,d] = dataVal.split('-');
  const dataFmt = `${d}/${m}/${String(y).slice(2)}`;
  const ultimo  = state.pesagens[state.pesagens.length - 1];
  const diff    = ultimo ? +(peso - ultimo.peso).toFixed(1) : null;
  const n       = state.pesagens.length + 1;

  state.pesagens.push({ n, data: dataFmt, peso, diff });
  salvarState();
  closeModal();
  renderPesagens();
  showToast('Pesagem salva!');
}

// ── ALIMENTOS (banco) ─────────────────────────────────────────────────────────
function renderAlimentos() {
  const q = (document.getElementById('alimento-search')?.value || '').toLowerCase();
  const lista = q ? state.alimentos.filter(a => a.nome.toLowerCase().includes(q)) : state.alimentos;
  const el = document.getElementById('alimentos-list');

  if (lista.length === 0) {
    el.innerHTML = '<div class="empty-state">Nenhum alimento encontrado.</div>';
    return;
  }

  el.innerHTML = lista.map((a, i) => `
    <div class="alimento-row">
      <span class="alimento-nome">${a.nome}</span>
      <div class="alimento-actions">
        <span class="alimento-cal">${a.cal} kcal/100g</span>
        <button class="alimento-del" onclick="deletarAlimento('${a.nome.replace(/'/g,"\\'")}')" aria-label="Deletar">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    </div>`).join('');
}

function filtrarAlimentos() { renderAlimentos(); }

function deletarAlimento(nome) {
  state.alimentos = state.alimentos.filter(a => a.nome !== nome);
  salvarState();
  renderAlimentos();
  showToast('Alimento removido do banco');
}

function openNovoAlimentoModal() {
  openModal(`
    <div class="modal-title">Novo alimento</div>
    <div class="form-group">
      <div class="form-label">Nome do alimento</div>
      <input class="form-input" type="text" id="na-nome" placeholder="ex: Abacate">
    </div>
    <div class="form-group">
      <div class="form-label">Calorias por 100g</div>
      <input class="form-input" type="number" id="na-cal" placeholder="ex: 160" inputmode="decimal">
    </div>
    <div class="btn-row">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="salvarNovoAlimento()">Salvar</button>
    </div>
  `);
  setTimeout(() => document.getElementById('na-nome')?.focus(), 100);
}

function salvarNovoAlimento() {
  const nome = (document.getElementById('na-nome')?.value || '').trim();
  const cal  = parseInt(document.getElementById('na-cal')?.value || '0');
  if (!nome || !cal) { showToast('Preencha todos os campos'); return; }
  if (state.alimentos.find(a => a.nome.toLowerCase() === nome.toLowerCase())) {
    showToast('Alimento já cadastrado'); return;
  }
  state.alimentos.unshift({ nome, cal });
  salvarState();
  closeModal();
  renderAlimentos();
  showToast('Alimento cadastrado!');
}

// ── CONFIG / API KEY ──────────────────────────────────────────────────────────
function openConfigModal() {
  openModal(`
    <div class="modal-title">Configurações</div>
    <div class="form-group">
      <div class="form-label">Chave da API Anthropic</div>
      <input class="form-input" type="password" id="cfg-apikey" placeholder="sk-ant-..." value="${state.apiKey || ''}">
      <div style="font-size:12px;color:var(--text-3);margin-top:6px;line-height:1.5;">
        Necessária para busca de calorias por IA.<br>
        Obtenha em: <a href="https://console.anthropic.com" target="_blank" style="color:var(--green);">console.anthropic.com</a>
      </div>
    </div>
    <div class="form-group" style="margin-top:8px;">
      <div class="form-label">Meta padrão diária (kcal)</div>
      <input class="form-input" type="number" id="cfg-meta" placeholder="1800" value="1800" inputmode="decimal">
    </div>
    <button class="btn-full" onclick="salvarConfig()">Salvar configurações</button>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
      <div class="form-label" style="margin-bottom:8px;color:var(--red);">Zona de perigo</div>
      <button onclick="limparDadosDia()" style="width:100%;background:none;border:1px solid var(--border);border-radius:var(--radius-sm);padding:11px;font-size:14px;color:var(--red);font-family:var(--font);cursor:pointer;">
        Limpar registros de hoje
      </button>
    </div>
  `);
}

function salvarConfig() {
  state.apiKey = (document.getElementById('cfg-apikey')?.value || '').trim();
  salvarState();
  closeModal();
  showToast('Configurações salvas!');
}

function limparDadosDia() {
  if (!confirm('Limpar todos os registros de hoje?')) return;
  state.registrosPorData[dataHoje()] = [];
  salvarState();
  closeModal();
  renderMeals();
  atualizarSummary();
  showToast('Registros de hoje apagados');
}

// ── MODAL HELPERS ─────────────────────────────────────────────────────────────
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  clearTimeout(aiTimer);
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
