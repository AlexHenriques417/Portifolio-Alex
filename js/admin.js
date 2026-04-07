// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KEbzoQ_e0AsV_ipD8-o80w_oJ5Al1P1';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let skills = [];
let stats = [];
let certificates = [];

// Verificar sessão
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    showAdminPanel();
  }
}

// Login
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  
  if (error) {
    alert('Erro no login: ' + error.message);
  } else {
    currentUser = data.user;
    showAdminPanel();
  }
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
}

// Mostrar painel admin
async function showAdminPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  
  await loadProfileData();
  await loadContactsData();
  await loadSkillsData();
  await loadStatsData();
  await loadCertificatesData();
}

// Carregar dados do perfil
async function loadProfileData() {
  const { data } = await supabase.from('profile').select('*').eq('id', 1).single();
  if (data) {
    document.getElementById('edit-name').value = data.name;
    document.getElementById('edit-title').value = data.title;
    document.getElementById('edit-bio').value = data.bio || '';
  }
}

// Carregar contatos
async function loadContactsData() {
  const { data } = await supabase.from('contacts').select('*').eq('id', 1).single();
  if (data) {
    document.getElementById('edit-email').value = data.email;
    document.getElementById('edit-phone').value = data.phone;
    document.getElementById('edit-github').value = data.github;
    document.getElementById('edit-linkedin').value = data.linkedin;
  }
}

// Carregar habilidades
async function loadSkillsData() {
  const { data } = await supabase.from('skills').select('*').order('id');
  if (data) {
    skills = data;
    renderSkills();
  }
}

function renderSkills() {
  const softList = document.getElementById('soft-skills-list');
  const hardList = document.getElementById('hard-skills-list-admin');
  
  softList.innerHTML = skills
    .filter(s => s.type === 'soft')
    .map(s => `
      <div class="skill-item">
        <span contenteditable="true" onblur="updateSkill(${s.id}, 'name', this.textContent)">${s.name}</span>
        <button onclick="deleteSkill(${s.id})">×</button>
      </div>
    `).join('');
  
  hardList.innerHTML = skills
    .filter(s => s.type === 'hard')
    .map(s => `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="text" value="${s.name}" onchange="updateSkill(${s.id}, 'name', this.value)" style="flex: 1; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
          <input type="number" value="${s.level}" onchange="updateSkill(${s.id}, 'level', this.value)" min="0" max="100" style="width: 80px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
          <button onclick="deleteSkill(${s.id})" style="background: none; border: none; color: var(--accent3); cursor: pointer;">×</button>
        </div>
      </div>
    `).join('');
}

// Carregar estatísticas
async function loadStatsData() {
  const { data } = await supabase.from('stats').select('*');
  if (data) {
    stats = data;
    renderStats();
  }
}

function renderStats() {
  const container = document.getElementById('stats-list');
  container.innerHTML = stats.map(s => `
    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
      <input type="text" value="${s.label}" onchange="updateStat(${s.id}, 'label', this.value)" placeholder="Label" style="flex: 1; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
      <input type="text" value="${s.value}" onchange="updateStat(${s.id}, 'value', this.value)" placeholder="Valor" style="width: 100px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
      <button onclick="deleteStat(${s.id})" style="background: none; border: none; color: var(--accent3); cursor: pointer;">×</button>
    </div>
  `).join('');
}

// Carregar certificados
async function loadCertificatesData() {
  const { data } = await supabase.from('certificates').select('*');
  if (data) {
    certificates = data;
    renderCertificates();
  }
}

function renderCertificates() {
  const container = document.getElementById('certs-list-admin');
  container.innerHTML = certificates.map(c => `
    <div class="cert-item">
      <input type="text" value="${c.name}" onchange="updateCertificate(${c.id}, 'name', this.value)" placeholder="Nome" style="width: 100%; margin-bottom: 10px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
      <input type="text" value="${c.issuer}" onchange="updateCertificate(${c.id}, 'issuer', this.value)" placeholder="Emissor" style="width: 100%; margin-bottom: 10px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
      <input type="text" value="${c.date}" onchange="updateCertificate(${c.id}, 'date', this.value)" placeholder="Data" style="width: 100%; margin-bottom: 10px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
      <button onclick="deleteCertificate(${c.id})" style="background: var(--accent3); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Remover</button>
    </div>
  `).join('');
}

// Salvar funções
async function saveProfile() {
  const { error } = await supabase
    .from('profile')
    .update({
      name: document.getElementById('edit-name').value,
      title: document.getElementById('edit-title').value,
      bio: document.getElementById('edit-bio').value
    })
    .eq('id', 1);
  
  showMessage(error ? 'Erro ao salvar' : 'Perfil salvo com sucesso!');
}

async function saveContacts() {
  const { error } = await supabase
    .from('contacts')
    .update({
      email: document.getElementById('edit-email').value,
      phone: document.getElementById('edit-phone').value,
      github: document.getElementById('edit-github').value,
      linkedin: document.getElementById('edit-linkedin').value
    })
    .eq('id', 1);
  
  showMessage(error ? 'Erro ao salvar' : 'Contatos salvos com sucesso!');
}

async function saveSkills() {
  showMessage('Habilidades salvas com sucesso!');
}

async function saveStats() {
  showMessage('Estatísticas salvas com sucesso!');
}

async function saveCertificates() {
  showMessage('Certificados salvos com sucesso!');
}

// Funções auxiliares
async function updateSkill(id, field, value) {
  const update = {};
  update[field] = field === 'level' ? parseInt(value) : value;
  await supabase.from('skills').update(update).eq('id', id);
}

async function deleteSkill(id) {
  if (confirm('Remover esta habilidade?')) {
    await supabase.from('skills').delete().eq('id', id);
    await loadSkillsData();
  }
}

async function addSoftSkill() {
  const name = prompt('Nome da soft skill:');
  if (name) {
    await supabase.from('skills').insert({ type: 'soft', name: name, level: 0 });
    await loadSkillsData();
  }
}

async function addHardSkill() {
  const name = prompt('Nome da hard skill:');
  const level = prompt('Nível (0-100):', '75');
  if (name) {
    await supabase.from('skills').insert({ type: 'hard', name: name, level: parseInt(level) || 75 });
    await loadSkillsData();
  }
}

async function updateStat(id, field, value) {
  await supabase.from('stats').update({ [field]: value }).eq('id', id);
}

async function deleteStat(id) {
  if (confirm('Remover esta estatística?')) {
    await supabase.from('stats').delete().eq('id', id);
    await loadStatsData();
  }
}

async function addStat() {
  const label = prompt('Label (ex: Anos de exp.):');
  const value = prompt('Valor (ex: 2+):');
  if (label && value) {
    await supabase.from('stats').insert({ label, value });
    await loadStatsData();
  }
}

async function updateCertificate(id, field, value) {
  await supabase.from('certificates').update({ [field]: value }).eq('id', id);
}

async function deleteCertificate(id) {
  if (confirm('Remover este certificado?')) {
    await supabase.from('certificates').delete().eq('id', id);
    await loadCertificatesData();
  }
}

async function addCertificate() {
  const name = prompt('Nome do certificado:');
  const issuer = prompt('Instituição:');
  const date = prompt('Data (ex: Jan 2024):');
  if (name && issuer && date) {
    await supabase.from('certificates').insert({ name, issuer, date });
    await loadCertificatesData();
  }
}

function showMessage(msg) {
  const el = document.getElementById('success-message');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}

// Inicializar
checkSession();