// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhtcHJka3Jqc2R2cnNyeWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI4ODYsImV4cCI6MjA5MTE2ODg4Nn0.fnZubFVAQbRkaVpxxgIzqFFutalltcxwC4DsgS0TJv4';

// Criar cliente Supabase
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let skills = [];
let stats = [];
let certificates = [];

// Verificar sessão
async function checkSession() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  if (session) {
    currentUser = session.user;
    showAdminPanel();
  }
}

// Login
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
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
  await supabaseAdmin.auth.signOut();
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
  const { data } = await supabaseAdmin.from('profile').select('*').eq('id', 1).single();
  if (data) {
    document.getElementById('edit-name').value = data.name || 'Alex Henriques';
    document.getElementById('edit-title').value = data.title || 'Desenvolvedor';
    document.getElementById('edit-bio').value = data.bio || '';
    
    // Mostrar preview da foto se existir
    if (data.avatar_url) {
      const preview = document.getElementById('profile-preview');
      preview.src = data.avatar_url;
      preview.style.display = 'block';
    }
  }
}

// Carregar contatos
async function loadContactsData() {
  const { data } = await supabaseAdmin.from('contacts').select('*').eq('id', 1).single();
  if (data) {
    document.getElementById('edit-email').value = data.email || '';
    document.getElementById('edit-phone').value = data.phone || '';
    document.getElementById('edit-github').value = data.github || '';
    document.getElementById('edit-linkedin').value = data.linkedin || '';
  }
}

// Carregar habilidades
async function loadSkillsData() {
  const { data } = await supabaseAdmin.from('skills').select('*').order('id');
  if (data) {
    skills = data;
    renderSkills();
  }
}

function renderSkills() {
  const softList = document.getElementById('soft-skills-list');
  const hardList = document.getElementById('hard-skills-list-admin');
  
  if (softList) {
    softList.innerHTML = skills
      .filter(s => s.type === 'soft')
      .map(s => `
        <div class="skill-item">
          <span contenteditable="true" onblur="updateSkill(${s.id}, 'name', this.textContent)">${s.name}</span>
          <button onclick="deleteSkill(${s.id})">×</button>
        </div>
      `).join('');
  }
  
  if (hardList) {
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
}

// Carregar estatísticas
async function loadStatsData() {
  const { data } = await supabaseAdmin.from('stats').select('*');
  if (data) {
    stats = data;
    renderStats();
  }
}

function renderStats() {
  const container = document.getElementById('stats-list');
  if (container) {
    container.innerHTML = stats.map(s => `
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input type="text" value="${s.label}" onchange="updateStat(${s.id}, 'label', this.value)" placeholder="Label" style="flex: 1; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <input type="text" value="${s.value}" onchange="updateStat(${s.id}, 'value', this.value)" placeholder="Valor" style="width: 100px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <button onclick="deleteStat(${s.id})" style="background: none; border: none; color: var(--accent3); cursor: pointer;">×</button>
      </div>
    `).join('');
  }
}

// Carregar certificados
async function loadCertificatesData() {
  const { data } = await supabaseAdmin.from('certificates').select('*');
  if (data) {
    certificates = data;
    renderCertificates();
  }
}

function renderCertificates() {
  const container = document.getElementById('certs-list-admin');
  if (container) {
    container.innerHTML = certificates.map(c => `
      <div class="cert-item">
        <input type="text" value="${c.name}" onchange="updateCertificate(${c.id}, 'name', this.value)" placeholder="Nome" style="width: 100%; margin-bottom: 10px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <input type="text" value="${c.issuer}" onchange="updateCertificate(${c.id}, 'issuer', this.value)" placeholder="Emissor" style="width: 100%; margin-bottom: 10px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <input type="text" value="${c.date}" onchange="updateCertificate(${c.id}, 'date', this.value)" placeholder="Data" style="width: 100%; margin-bottom: 10px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        ${c.image_url ? `
          <div style="margin: 10px 0;">
            <a href="${c.image_url}" target="_blank" style="color: var(--accent); text-decoration: none;">📎 Ver arquivo do certificado</a>
          </div>
        ` : '<p style="color: var(--text-muted); margin: 10px 0;">Nenhum arquivo anexado</p>'}
        <button onclick="deleteCertificate(${c.id})" style="background: var(--accent3); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Remover</button>
      </div>
    `).join('');
  }
}

// Salvar funções
async function saveProfile() {
  const { error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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
  await supabaseAdmin.from('skills').update(update).eq('id', id);
}

async function deleteSkill(id) {
  if (confirm('Remover esta habilidade?')) {
    await supabaseAdmin.from('skills').delete().eq('id', id);
    await loadSkillsData();
  }
}

async function addSoftSkill() {
  const name = prompt('Nome da soft skill:');
  if (name) {
    await supabaseAdmin.from('skills').insert({ type: 'soft', name: name, level: 0 });
    await loadSkillsData();
  }
}

async function addHardSkill() {
  const name = prompt('Nome da hard skill:');
  const level = prompt('Nível (0-100):', '75');
  if (name) {
    await supabaseAdmin.from('skills').insert({ type: 'hard', name: name, level: parseInt(level) || 75 });
    await loadSkillsData();
  }
}

async function updateStat(id, field, value) {
  await supabaseAdmin.from('stats').update({ [field]: value }).eq('id', id);
}

async function deleteStat(id) {
  if (confirm('Remover esta estatística?')) {
    await supabaseAdmin.from('stats').delete().eq('id', id);
    await loadStatsData();
  }
}

async function addStat() {
  const label = prompt('Label (ex: Anos de exp.):');
  const value = prompt('Valor (ex: 2+):');
  if (label && value) {
    await supabaseAdmin.from('stats').insert({ label, value });
    await loadStatsData();
  }
}

async function updateCertificate(id, field, value) {
  await supabaseAdmin.from('certificates').update({ [field]: value }).eq('id', id);
}

async function deleteCertificate(id) {
  if (confirm('Remover este certificado?')) {
    await supabaseAdmin.from('certificates').delete().eq('id', id);
    await loadCertificatesData();
  }
}

async function addCertificate() {
  const name = prompt('Nome do certificado:');
  const issuer = prompt('Instituição:');
  const date = prompt('Data (ex: Jan 2024):');
  if (name && issuer && date) {
    await supabaseAdmin.from('certificates').insert({ name, issuer, date });
    await loadCertificatesData();
  }
}

// ==========================================
// NOVAS FUNÇÕES: UPLOAD DE AVATAR E CERTIFICADOS
// ==========================================

// Preview da foto
document.getElementById('avatar-upload')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('profile-preview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Upload de avatar
async function uploadAvatar() {
  const fileInput = document.getElementById('avatar-upload');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Selecione uma imagem primeiro!');
    return;
  }
  
  showMessage('Fazendo upload da foto...');
  
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from('avatars')
    .upload(fileName, file);
  
  if (error) {
    console.error('Erro no upload:', error);
    showMessage('Erro ao fazer upload da foto');
    return;
  }
  
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  // Salvar URL no perfil
  const { error: updateError } = await supabaseAdmin
    .from('profile')
    .update({ avatar_url: publicUrl })
    .eq('id', 1);
  
  if (updateError) {
    console.error('Erro ao salvar URL:', updateError);
    showMessage('Erro ao salvar foto no perfil');
  } else {
    showMessage('✅ Foto de perfil atualizada com sucesso!');
  }
}

// Adicionar certificado com arquivo
async function addCertificateWithFile() {
  const name = document.getElementById('new-cert-name').value;
  const issuer = document.getElementById('new-cert-issuer').value;
  const date = document.getElementById('new-cert-date').value;
  const fileInput = document.getElementById('cert-file-upload');
  const file = fileInput.files[0];
  
  if (!name || !issuer || !date) {
    alert('Preencha todos os campos do certificado!');
    return;
  }
  
  let fileUrl = null;
  
  if (file) {
    showMessage('Fazendo upload do certificado...');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `cert-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('certificates')
      .upload(fileName, file);
    
    if (error) {
      console.error('Erro no upload:', error);
      showMessage('Erro ao fazer upload do arquivo');
      return;
    }
    
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('certificates')
      .getPublicUrl(fileName);
    
    fileUrl = publicUrl;
  }
  
  // Salvar certificado no banco
  const { error } = await supabaseAdmin
    .from('certificates')
    .insert({ 
      name, 
      issuer, 
      date, 
      image_url: fileUrl 
    });
  
  if (error) {
    console.error('Erro ao salvar certificado:', error);
    showMessage('Erro ao salvar certificado');
  } else {
    showMessage('✅ Certificado adicionado com sucesso!');
    
    // Limpar formulário
    document.getElementById('new-cert-name').value = '';
    document.getElementById('new-cert-issuer').value = '';
    document.getElementById('new-cert-date').value = '';
    document.getElementById('cert-file-upload').value = '';
    
    // Recarregar lista
    await loadCertificatesData();
  }
}

function showMessage(msg) {
  const el = document.getElementById('success-message');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
  }
}

// Expor funções globalmente
window.login = login;
window.logout = logout;
window.updateSkill = updateSkill;
window.deleteSkill = deleteSkill;
window.addSoftSkill = addSoftSkill;
window.addHardSkill = addHardSkill;
window.updateStat = updateStat;
window.deleteStat = deleteStat;
window.addStat = addStat;
window.updateCertificate = updateCertificate;
window.deleteCertificate = deleteCertificate;
window.addCertificate = addCertificate;
window.saveProfile = saveProfile;
window.saveContacts = saveContacts;
window.saveSkills = saveSkills;
window.saveStats = saveStats;
window.saveCertificates = saveCertificates;
window.uploadAvatar = uploadAvatar;
window.addCertificateWithFile = addCertificateWithFile;

// Inicializar
checkSession();