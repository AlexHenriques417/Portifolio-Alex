// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhtcHJka3Jqc2R2cnNyeWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI4ODYsImV4cCI6MjA5MTE2ODg4Nn0.fnZubFVAQbRkaVpxxgIzqFFutalltcxwC4DsgS0TJv4';

const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let skills = [];
let stats = [];
let certificates = [];
let projects = [];

// Verificar sessão
async function checkSession() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  if (session) { currentUser = session.user; showAdminPanel(); }
}

async function login() {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value
  });
  if (error) { alert('Erro: ' + error.message); }
  else { currentUser = data.user; showAdminPanel(); }
}

async function logout() {
  await supabaseAdmin.auth.signOut();
  currentUser = null;
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
}

async function showAdminPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  await loadProfileData();
  await loadContactsData();
  await loadSkillsData();
  await loadStatsData();
  await loadCertificatesData();
  await loadProjectsData();
}

async function loadProfileData() {
  const { data } = await supabaseAdmin.from('profile').select('*').eq('id', 1).single();
  if (data) {
    document.getElementById('edit-name').value = data.name || 'Alex Henriques';
    document.getElementById('edit-title').value = data.title || 'Desenvolvedor';
    document.getElementById('edit-bio').value = data.bio || '';
    if (data.avatar_url) {
      const preview = document.getElementById('profile-preview');
      preview.src = data.avatar_url;
      preview.style.display = 'block';
    }
  }
}

async function loadContactsData() {
  const { data } = await supabaseAdmin.from('contacts').select('*').eq('id', 1).single();
  if (data) {
    document.getElementById('edit-email').value = data.email || '';
    document.getElementById('edit-phone').value = data.phone || '';
    document.getElementById('edit-github').value = data.github || '';
    document.getElementById('edit-linkedin').value = data.linkedin || '';
  }
}

async function loadSkillsData() {
  const { data } = await supabaseAdmin.from('skills').select('*').order('id');
  if (data) { skills = data; renderSkills(); }
}

function renderSkills() {
  const softList = document.getElementById('soft-skills-list');
  const hardList = document.getElementById('hard-skills-list-admin');
  if (softList) {
    softList.innerHTML = skills.filter(s => s.type === 'soft').map(s => `
      <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 8px 16px; display: flex; align-items: center; gap: 10px;">
        <span contenteditable="true" onblur="updateSkill(${s.id}, 'name', this.textContent)">${s.name}</span>
        <button onclick="deleteSkill(${s.id})" style="background: none; border: none; color: var(--accent3); cursor: pointer;"><i class="fas fa-times"></i></button>
      </div>
    `).join('');
  }
  if (hardList) {
    hardList.innerHTML = skills.filter(s => s.type === 'hard').map(s => `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="text" value="${s.name}" onchange="updateSkill(${s.id}, 'name', this.value)" style="flex: 1; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
          <input type="number" value="${s.level}" onchange="updateSkill(${s.id}, 'level', this.value)" min="0" max="100" style="width: 80px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
          <button onclick="deleteSkill(${s.id})" style="background: none; border: none; color: var(--accent3); cursor: pointer;"><i class="fas fa-times"></i></button>
        </div>
      </div>
    `).join('');
  }
}

async function loadStatsData() {
  const { data } = await supabaseAdmin.from('stats').select('*');
  if (data) { stats = data; renderStats(); }
}

function renderStats() {
  const container = document.getElementById('stats-list');
  if (container) {
    container.innerHTML = stats.map(s => `
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input type="text" value="${s.label}" onchange="updateStat(${s.id}, 'label', this.value)" style="flex: 1; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <input type="text" value="${s.value}" onchange="updateStat(${s.id}, 'value', this.value)" style="width: 100px; background: var(--bg); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <button onclick="deleteStat(${s.id})" style="background: none; border: none; color: var(--accent3); cursor: pointer;"><i class="fas fa-times"></i></button>
      </div>
    `).join('');
  }
}

async function loadCertificatesData() {
  const { data } = await supabaseAdmin.from('certificates').select('*');
  if (data) { certificates = data; renderCertificates(); }
}

function renderCertificates() {
  const container = document.getElementById('certs-list-admin');
  if (container) {
    container.innerHTML = certificates.map(c => `
      <div class="cert-item">
        <input type="text" value="${c.name}" onchange="updateCertificate(${c.id}, 'name', this.value)" style="width: 100%; margin-bottom: 10px; background: var(--bg2); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <input type="text" value="${c.issuer}" onchange="updateCertificate(${c.id}, 'issuer', this.value)" style="width: 100%; margin-bottom: 10px; background: var(--bg2); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <input type="text" value="${c.date}" onchange="updateCertificate(${c.id}, 'date', this.value)" style="width: 100%; margin-bottom: 10px; background: var(--bg2); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        ${c.image_url ? `<div style="margin: 10px 0;"><a href="${c.image_url}" target="_blank" style="color: var(--accent);"><i class="fas fa-file-pdf"></i> Ver arquivo</a></div>` : '<p style="color: var(--text-muted); margin: 10px 0;"><i class="fas fa-info-circle"></i> Nenhum arquivo</p>'}
        <button onclick="deleteCertificate(${c.id})" style="background: var(--accent3); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;"><i class="fas fa-trash"></i> Remover</button>
      </div>
    `).join('');
  }
}

async function loadProjectsData() {
  const { data } = await supabaseAdmin.from('projects').select('*').order('featured', { ascending: false });
  if (data) { projects = data; renderProjects(); }
}

function renderProjects() {
  const container = document.getElementById('projects-list-admin');
  if (container) {
    container.innerHTML = projects.map(p => `
      <div style="background: var(--bg); padding: 15px; margin-bottom: 15px; border-radius: 8px;">
        <input type="text" value="${p.title}" onchange="updateProject(${p.id}, 'title', this.value)" style="width: 100%; margin-bottom: 10px; background: var(--bg2); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">
        <textarea onchange="updateProject(${p.id}, 'description', this.value)" style="width: 100%; margin-bottom: 10px; background: var(--bg2); border: 1px solid var(--border); padding: 8px; border-radius: 6px; color: var(--text);">${p.description}</textarea>
        <div style="margin-bottom: 10px;">
          ${(p.technologies || []).map((t, i) => `<span class="tech-tag">${t} <button onclick="removeTech(${p.id}, ${i})" style="background: none; border: none; color: white; cursor: pointer;">×</button></span>`).join('')}
          <button onclick="addTech(${p.id})" style="background: none; border: 1px dashed var(--accent); color: var(--accent); padding: 2px 8px; border-radius: 4px; margin-left: 5px;">+</button>
        </div>
        <label style="display: block; margin-bottom: 10px;"><input type="checkbox" ${p.featured ? 'checked' : ''} onchange="updateProject(${p.id}, 'featured', this.checked)"> Destacar</label>
        <button onclick="deleteProject(${p.id})" style="background: var(--accent3); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;"><i class="fas fa-trash"></i> Remover</button>
      </div>
    `).join('');
  }
}

// Upload de avatar
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

async function uploadAvatar() {
  const file = document.getElementById('avatar-upload').files[0];
  if (!file) { alert('Selecione uma imagem!'); return; }
  showMessage('Fazendo upload...');
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar-${Date.now()}.${fileExt}`;
  const { error } = await supabaseAdmin.storage.from('avatars').upload(fileName, file);
  if (error) { showMessage('Erro no upload'); return; }
  const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(fileName);
  await supabaseAdmin.from('profile').update({ avatar_url: publicUrl }).eq('id', 1);
  showMessage('✅ Foto salva!');
}

async function addCertificateWithFile() {
  const name = document.getElementById('new-cert-name').value;
  const issuer = document.getElementById('new-cert-issuer').value;
  const date = document.getElementById('new-cert-date').value;
  const file = document.getElementById('cert-file-upload').files[0];
  if (!name || !issuer || !date) { alert('Preencha todos os campos!'); return; }
  let fileUrl = null;
  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `cert-${Date.now()}.${fileExt}`;
    await supabaseAdmin.storage.from('certificates').upload(fileName, file);
    const { data: { publicUrl } } = supabaseAdmin.storage.from('certificates').getPublicUrl(fileName);
    fileUrl = publicUrl;
  }
  await supabaseAdmin.from('certificates').insert({ name, issuer, date, image_url: fileUrl });
  showMessage('✅ Certificado adicionado!');
  document.getElementById('new-cert-name').value = '';
  document.getElementById('new-cert-issuer').value = '';
  document.getElementById('new-cert-date').value = '';
  document.getElementById('cert-file-upload').value = '';
  await loadCertificatesData();
}

async function addProject() {
  const title = document.getElementById('new-project-title').value;
  const description = document.getElementById('new-project-desc').value;
  const techs = document.getElementById('new-project-techs').value.split(',').map(t => t.trim()).filter(t => t);
  const project_url = document.getElementById('new-project-url').value;
  const github_url = document.getElementById('new-project-github').value;
  const featured = document.getElementById('new-project-featured').checked;
  const imageFile = document.getElementById('new-project-image').files[0];
  if (!title || !description) { alert('Título e descrição obrigatórios!'); return; }
  let image_url = null;
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `project-${Date.now()}.${fileExt}`;
    await supabaseAdmin.storage.from('projects').upload(fileName, imageFile);
    const { data: { publicUrl } } = supabaseAdmin.storage.from('projects').getPublicUrl(fileName);
    image_url = publicUrl;
  }
  await supabaseAdmin.from('projects').insert({ title, description, technologies: techs, project_url, github_url, image_url, featured });
  showMessage('✅ Projeto adicionado!');
  document.getElementById('new-project-title').value = '';
  document.getElementById('new-project-desc').value = '';
  document.getElementById('new-project-techs').value = '';
  document.getElementById('new-project-url').value = '';
  document.getElementById('new-project-github').value = '';
  document.getElementById('new-project-image').value = '';
  document.getElementById('new-project-featured').checked = false;
  await loadProjectsData();
}

// Funções de salvamento
async function saveProfile() {
  await supabaseAdmin.from('profile').update({
    name: document.getElementById('edit-name').value,
    title: document.getElementById('edit-title').value,
    bio: document.getElementById('edit-bio').value
  }).eq('id', 1);
  showMessage('Perfil salvo!');
}

async function saveContacts() {
  await supabaseAdmin.from('contacts').update({
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value,
    github: document.getElementById('edit-github').value,
    linkedin: document.getElementById('edit-linkedin').value
  }).eq('id', 1);
  showMessage('Contatos salvos!');
}

// Funções auxiliares
async function updateSkill(id, field, value) {
  const update = {};
  update[field] = field === 'level' ? parseInt(value) : value;
  await supabaseAdmin.from('skills').update(update).eq('id', id);
}

async function deleteSkill(id) { if (confirm('Remover?')) { await supabaseAdmin.from('skills').delete().eq('id', id); await loadSkillsData(); } }
async function addSoftSkill() { const name = prompt('Nome:'); if (name) { await supabaseAdmin.from('skills').insert({ type: 'soft', name, level: 0 }); await loadSkillsData(); } }
async function addHardSkill() { const name = prompt('Nome:'); const level = prompt('Nível (0-100):', '75'); if (name) { await supabaseAdmin.from('skills').insert({ type: 'hard', name, level: parseInt(level) || 75 }); await loadSkillsData(); } }
async function updateStat(id, field, value) { await supabaseAdmin.from('stats').update({ [field]: value }).eq('id', id); }
async function deleteStat(id) { if (confirm('Remover?')) { await supabaseAdmin.from('stats').delete().eq('id', id); await loadStatsData(); } }
async function addStat() { const label = prompt('Label:'); const value = prompt('Valor:'); if (label && value) { await supabaseAdmin.from('stats').insert({ label, value }); await loadStatsData(); } }
async function updateCertificate(id, field, value) { await supabaseAdmin.from('certificates').update({ [field]: value }).eq('id', id); }
async function deleteCertificate(id) { if (confirm('Remover?')) { await supabaseAdmin.from('certificates').delete().eq('id', id); await loadCertificatesData(); } }
async function updateProject(id, field, value) { await supabaseAdmin.from('projects').update({ [field]: value }).eq('id', id); }
async function deleteProject(id) { if (confirm('Remover?')) { await supabaseAdmin.from('projects').delete().eq('id', id); await loadProjectsData(); } }
async function removeTech(projectId, techIndex) {
  const project = projects.find(p => p.id === projectId);
  if (project) { const techs = [...project.technologies]; techs.splice(techIndex, 1); await supabaseAdmin.from('projects').update({ technologies: techs }).eq('id', projectId); await loadProjectsData(); }
}
async function addTech(projectId) {
  const tech = prompt('Tecnologia:');
  if (tech) { const project = projects.find(p => p.id === projectId); if (project) { const techs = [...(project.technologies || []), tech]; await supabaseAdmin.from('projects').update({ technologies: techs }).eq('id', projectId); await loadProjectsData(); } }
}

function showMessage(msg) {
  const el = document.getElementById('success-message');
  if (el) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); }
}

// Expor funções
window.login = login;
window.logout = logout;
window.uploadAvatar = uploadAvatar;
window.addCertificateWithFile = addCertificateWithFile;
window.addProject = addProject;
window.saveProfile = saveProfile;
window.saveContacts = saveContacts;
window.saveSkills = () => showMessage('Skills salvas!');
window.saveStats = () => showMessage('Stats salvas!');
window.saveCertificates = () => showMessage('Certificados salvos!');
window.saveProjects = () => showMessage('Projetos salvos!');
window.updateSkill = updateSkill;
window.deleteSkill = deleteSkill;
window.addSoftSkill = addSoftSkill;
window.addHardSkill = addHardSkill;
window.updateStat = updateStat;
window.deleteStat = deleteStat;
window.addStat = addStat;
window.updateCertificate = updateCertificate;
window.deleteCertificate = deleteCertificate;
window.updateProject = updateProject;
window.deleteProject = deleteProject;
window.removeTech = removeTech;
window.addTech = addTech;

checkSession();