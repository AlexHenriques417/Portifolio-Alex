// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhtcHJka3Jqc2R2cnNyeWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI4ODYsImV4cCI6MjA5MTE2ODg4Nn0.fnZubFVAQbRkaVpxxgIzqFFutalltcxwC4DsgS0TJv4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const FORMSPREE_ID = 'mojpbnpo';

let certificates = [];

document.addEventListener('DOMContentLoaded', async () => {
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
      document.getElementById('edit-bio').value = data.bio || '';
      
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
  } catch (err) {}
}

async function loadContacts() {
  try {
    const { data } = await supabaseClient.from('contacts').select('*').eq('id', 1).single();
    if (data) {
      document.getElementById('email-text').textContent = data.email;
      document.getElementById('phone-text').textContent = data.phone;
      document.getElementById('github-text').textContent = data.github.replace('https://', '');
      document.getElementById('linkedin-text').textContent = data.linkedin.replace('https://www.', '');
      document.getElementById('contact-email').href = `mailto:${data.email}`;
      document.getElementById('contact-phone').href = `tel:${data.phone.replace(/\D/g, '')}`;
      document.getElementById('contact-github').href = data.github;
      document.getElementById('contact-linkedin').href = data.linkedin;
      document.getElementById('footer-github').href = data.github;
      document.getElementById('footer-linkedin').href = data.linkedin;
    }
  } catch (err) {}
}

async function loadSkills() {
  try {
    const { data } = await supabaseClient.from('skills').select('*').order('id');
    if (data && data.length > 0) {
      const softSkills = data.filter(s => s.type === 'soft');
      const hardSkills = data.filter(s => s.type === 'hard');
      
      const softContainer = document.getElementById('soft-tags');
      if (softContainer) softContainer.innerHTML = softSkills.map(s => `<span class="soft-tag">${s.name}</span>`).join('');
      
      const hardContainer = document.getElementById('hard-skills-list');
      if (hardContainer) {
        hardContainer.innerHTML = hardSkills.map(s => `
          <div class="hard-skill">
            <div class="hard-skill-header"><span>${s.name}</span><span class="hard-skill-pct">${s.level}%</span></div>
            <div class="bar-track"><div class="bar-fill" style="width: ${s.level}%"></div></div>
          </div>
        `).join('');
      }
    }
  } catch (err) {}
}

async function loadStats() {
  try {
    const { data } = await supabaseClient.from('stats').select('*');
    if (data && data.length > 0) {
      const container = document.getElementById('hero-stats');
      if (container) {
        container.innerHTML = data.map(s => `
          <div class="stat"><div class="stat-num">${s.value}</div><div class="stat-label">${s.label}</div></div>
        `).join('');
      }
    }
  } catch (err) {}
}

async function loadProjects() {
  try {
    const { data } = await supabaseClient.from('projects').select('*').order('featured', { ascending: false });
    if (data) {
      const container = document.getElementById('projects-grid');
      if (container) {
        container.innerHTML = data.map(p => `
          <div class="project-card reveal">
            ${p.image_url ? `<img src="${p.image_url}" class="project-image" alt="${p.title}">` : '<div class="project-image" style="display: flex; align-items: center; justify-content: center; background: var(--surface);"><i class="fas fa-code fa-2x"></i></div>'}
            <div class="project-content">
              <h3 class="project-title">${p.title}</h3>
              <p class="project-description">${p.description}</p>
              <div class="project-techs">${(p.technologies || []).map(t => `<span class="project-tech">${t}</span>`).join('')}</div>
              <div class="project-links">
                ${p.project_url ? `<a href="${p.project_url}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="project-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (err) {}
}

async function loadCertificates() {
  try {
    const { data } = await supabaseClient.from('certificates').select('*');
    if (data && data.length > 0) {
      certificates = data;
      const container = document.getElementById('certs-grid');
      if (container) {
        container.innerHTML = data.map((cert, index) => `
          <div class="cert-card reveal" onclick="openModal(${index})">
            <div class="cert-icon"><i class="fas fa-certificate"></i></div>
            <div><div class="cert-name">${cert.name}</div><div class="cert-issuer">${cert.issuer}</div></div>
            <div><span class="cert-badge"><i class="fas fa-check-circle"></i> Concluído</span></div>
            <div class="cert-date"><i class="far fa-calendar-alt"></i> ${cert.date}</div>
          </div>
        `).join('');
      }
    }
  } catch (err) {}
}

function openModal(index) {
  const cert = certificates[index];
  if (!cert) return;
  document.getElementById('modal-title').textContent = cert.name;
  document.getElementById('modal-issuer').textContent = cert.issuer;
  if (cert.image_url) {
    const fileExt = cert.image_url.split('.').pop().toLowerCase();
    document.getElementById('modal-content').innerHTML = fileExt === 'pdf' 
      ? `<embed src="${cert.image_url}" type="application/pdf" width="100%" height="500px" />`
      : `<img class="modal-img" src="${cert.image_url}" alt="${cert.name}"/>`;
  } else {
    document.getElementById('modal-content').innerHTML = `<div class="modal-placeholder"><i class="fas fa-file-alt"></i> Certificado disponível</div>`;
  }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

async function sendMessage(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('.form-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  btn.disabled = true;
  
  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      btn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
      btn.style.background = 'linear-gradient(135deg,#00c853,#00e676)';
      form.reset();
    }
  } catch (error) {
    btn.innerHTML = '<i class="fas fa-times"></i> Erro';
  } finally {
    setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; btn.disabled = false; }, 3000);
  }
}

function initTypedEffect() {
  const roles = ['Desenvolvedor', 'Analista de Dados', 'Full Stack', 'Solucionador de Problemas'];
  let ri = 0, ci = 0, deleting = false;
  const el = document.getElementById('typed-text');
  if (!el) return;
  function type() {
    const cur = roles[ri];
    el.textContent = deleting ? cur.slice(0, ci--) : cur.slice(0, ci++);
    if (!deleting && ci > cur.length) setTimeout(() => deleting = true, 1500);
    if (deleting && ci < 0) { deleting = false; ri = (ri + 1) % roles.length; ci = 0; }
    setTimeout(type, deleting ? 45 : 90);
  }
  type();
}

function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

window.openModal = openModal;
window.closeModal = closeModal;
window.sendMessage = sendMessage;