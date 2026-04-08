// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhtcHJka3Jqc2R2cnNyeWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI4ODYsImV4cCI6MjA5MTE2ODg4Nn0.fnZubFVAQbRkaVpxxgIzqFFutalltcxwC4DsgS0TJv4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuração do FormSpree - SUBSTITUA PELO SEU ID
const FORMSPREE_ID = 'mojpbnpo'; // Ex: 'xqknqwlw'

let certificates = [];
let projects = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando carregamento...');
  
  await loadProfile();
  await loadContacts();
  await loadSkills();
  await loadStats();
  await loadProjects();
  await loadCertificates();
  
  initReveal();
  initTypedEffect();
});

async function loadProfile() {
  try {
    const { data } = await supabaseClient.from('profile').select('*').eq('id', 1).single();
    if (data) {
      document.getElementById('hero-name').textContent = data.name || 'Alex Henriques';
      document.getElementById('hero-title').textContent = data.title || 'Desenvolvedor';
      document.getElementById('hero-bio').textContent = data.bio || '';
      document.getElementById('footer-name').textContent = data.name || 'Alex Henriques';
      
      if (data.avatar_url) {
        const img = document.getElementById('profile-img');
        const placeholder = document.getElementById('img-placeholder');
        if (img) {
          img.src = data.avatar_url;
          img.classList.add('loaded');
          img.style.display = 'block';
          if (placeholder) placeholder.style.display = 'none';
        }
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

async function loadProjects() {
  try {
    const { data } = await supabaseClient.from('projects').select('*').order('featured', { ascending: false });
    if (data) {
      projects = data;
      const container = document.getElementById('projects-grid');
      if (container) {
        container.innerHTML = data.map(p => `
          <div class="project-card reveal">
            ${p.image_url ? `<img src="${p.image_url}" class="project-image" alt="${p.title}">` : '<div class="project-image" style="display: flex; align-items: center; justify-content: center;">🚀 Projeto</div>'}
            <div class="project-content">
              <h3 class="project-title">${p.title}</h3>
              <p class="project-description">${p.description}</p>
              <div class="project-techs">
                ${(p.technologies || []).map(t => `<span class="project-tech">${t}</span>`).join('')}
              </div>
              <div class="project-links">
                ${p.project_url ? `<a href="${p.project_url}" target="_blank" class="project-link">🔗 Demo</a>` : ''}
                ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="project-link">📦 GitHub</a>` : ''}
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

// Função de envio de email (ATUALIZADA)
async function sendMessage(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const btn = form.querySelector('.form-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Enviando...';
  btn.disabled = true;
  
  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      btn.innerHTML = '✅ Mensagem enviada!';
      btn.style.background = 'linear-gradient(135deg,#00c853,#00e676)';
      form.reset();
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    } else {
      throw new Error('Erro no envio');
    }
  } catch (error) {
    btn.innerHTML = '❌ Erro ao enviar';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  }
}

// Mantenha as outras funções (loadContacts, loadSkills, etc.) iguais...
// [COLE AQUI AS OUTRAS FUNÇÕES QUE JÁ EXISTEM: loadContacts, loadSkills, loadStats, loadCertificates, openModal, closeModal, etc.]

window.openModal = openModal;
window.closeModal = closeModal;
window.sendMessage = sendMessage;