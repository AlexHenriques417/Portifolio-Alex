// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KEbzoQ_e0AsV_ipD8-o80w_oJ5Al1P1';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais
let certificates = [];

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await loadContacts();
  await loadSkills();
  await loadStats();
  await loadCertificates();
  initReveal();
  initTypedEffect();
});

// Carregar perfil
async function loadProfile() {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (data) {
    document.getElementById('hero-name').textContent = data.name;
    document.getElementById('hero-title').textContent = data.title;
    document.getElementById('hero-bio').textContent = data.bio || 'Profissional apaixonado por tecnologia.';
    document.getElementById('footer-name').textContent = data.name;
    
    if (data.avatar_url) {
      const img = document.getElementById('profile-img');
      img.src = data.avatar_url;
      img.classList.add('loaded');
      document.getElementById('img-placeholder').style.display = 'none';
    }
  }
}

// Carregar contatos
async function loadContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (data) {
    document.getElementById('email-text').textContent = data.email;
    document.getElementById('linkedin-text').textContent = data.linkedin.replace('https://www.', '');
    document.getElementById('github-text').textContent = data.github.replace('https://', '');
    document.getElementById('phone-text').textContent = data.phone;
    
    document.getElementById('contact-email').href = `mailto:${data.email}`;
    document.getElementById('contact-linkedin').href = data.linkedin;
    document.getElementById('contact-github').href = data.github;
    document.getElementById('contact-phone').href = `tel:${data.phone.replace(/\D/g, '')}`;
    
    document.getElementById('footer-linkedin').href = data.linkedin;
    document.getElementById('footer-github').href = data.github;
  }
}

// Carregar habilidades
async function loadSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('id', { ascending: true });
  
  if (data) {
    const softSkills = data.filter(s => s.type === 'soft');
    const hardSkills = data.filter(s => s.type === 'hard');
    
    const softContainer = document.getElementById('soft-tags');
    softContainer.innerHTML = softSkills.map(s => 
      `<span class="soft-tag">${s.name}</span>`
    ).join('');
    
    const hardContainer = document.getElementById('hard-skills-list');
    hardContainer.innerHTML = hardSkills.map(s => `
      <div class="hard-skill">
        <div class="hard-skill-header">
          <span>${s.name}</span>
          <span class="hard-skill-pct">${s.level}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${s.level}%"></div>
        </div>
      </div>
    `).join('');
  }
}

// Carregar estatísticas
async function loadStats() {
  const { data, error } = await supabase
    .from('stats')
    .select('*');
  
  if (data) {
    const container = document.getElementById('hero-stats');
    container.innerHTML = data.map(s => `
      <div class="stat">
        <div class="stat-num">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
  }
}

// Carregar certificados
async function loadCertificates() {
  const { data, error } = await supabase
    .from('certificates')
    .select('*');
  
  if (data) {
    certificates = data;
    const container = document.getElementById('certs-grid');
    container.innerHTML = data.map((cert, index) => `
      <div class="cert-card reveal" onclick="openModal(${index})">
        <div class="cert-icon">🎓</div>
        <div>
          <div class="cert-name">${cert.name}</div>
          <div class="cert-issuer">${cert.issuer}</div>
        </div>
        <div>
          <span class="cert-badge">✓ Concluído</span>
        </div>
        <div class="cert-date">📅 ${cert.date}</div>
      </div>
    `).join('');
  }
}

// Modal de certificado
function openModal(index) {
  const cert = certificates[index];
  if (!cert) return;
  
  document.getElementById('modal-title').textContent = cert.name;
  document.getElementById('modal-issuer').textContent = cert.issuer;
  
  const content = cert.image_url 
    ? `<img class="modal-img" src="${cert.image_url}" alt="${cert.name}"/>`
    : `<div class="modal-placeholder">Certificado disponível mediante solicitação</div>`;
  
  document.getElementById('modal-content').innerHTML = content;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// Enviar mensagem
function sendMessage() {
  const name = document.getElementById('form-name').value;
  const email = document.getElementById('form-email').value;
  const message = document.getElementById('form-message').value;
  
  if (!name || !email || !message) {
    alert('Por favor, preencha todos os campos.');
    return;
  }
  
  const btn = document.querySelector('.form-submit');
  btn.textContent = '✓ Mensagem enviada!';
  btn.style.background = 'linear-gradient(135deg,#00c853,#00e676)';
  
  setTimeout(() => {
    btn.innerHTML = '✉ Enviar mensagem';
    btn.style.background = '';
    document.getElementById('form-name').value = '';
    document.getElementById('form-email').value = '';
    document.getElementById('form-message').value = '';
  }, 3000);
}

// Efeito de digitação
function initTypedEffect() {
  const roles = ['Desenvolvedor 💻', 'Analista de Dados 📊', 'Profissional de TI ⚙️', 'Solucionador de Problemas 🔧'];
  let ri = 0, ci = 0, deleting = false;
  const el = document.getElementById('typed-text');
  
  function type() {
    const cur = roles[ri];
    el.textContent = deleting ? cur.slice(0, ci--) : cur.slice(0, ci++);
    if (!deleting && ci > cur.length) { setTimeout(() => deleting = true, 1500); }
    if (deleting && ci < 0) { deleting = false; ri = (ri + 1) % roles.length; ci = 0; }
    setTimeout(type, deleting ? 45 : 90);
  }
  type();
}

// Reveal on scroll
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// Fechar modal com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});