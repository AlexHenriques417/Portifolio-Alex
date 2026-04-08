// Configuração do Supabase
const SUPABASE_URL = 'https://srjhmprdkrjsdvrsrycj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhtcHJka3Jqc2R2cnNyeWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI4ODYsImV4cCI6MjA5MTE2ODg4Nn0.fnZubFVAQbRkaVpxxgIzqFFutalltcxwC4DsgS0TJv4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let certificates = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando carregamento do portfólio...');
  
  await loadProfile();
  await loadContacts();
  await loadSkills();
  await loadStats();
  await loadCertificates();
  
  initReveal();
  initTypedEffect();
  
  console.log('✅ Portfólio carregado com sucesso!');
});

async function loadProfile() {
  try {
    const { data, error } = await supabaseClient
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Erro ao carregar perfil:', error);
      return;
    }
    
    if (data) {
      document.getElementById('hero-name').textContent = data.name || 'Alex Henriques';
      document.getElementById('hero-title').textContent = data.title || 'Desenvolvedor';
      document.getElementById('hero-bio').textContent = data.bio || 'Profissional apaixonado por tecnologia.';
      document.getElementById('footer-name').textContent = data.name || 'Alex Henriques';
      
      // 🖼️ CARREGAR FOTO DE PERFIL
      if (data.avatar_url) {
        const profileImg = document.getElementById('profile-img');
        const placeholder = document.getElementById('img-placeholder');
        
        if (profileImg) {
          profileImg.src = data.avatar_url;
          profileImg.classList.add('loaded');
          profileImg.style.display = 'block';
          
          if (placeholder) {
            placeholder.style.display = 'none';
          }
        }
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

async function loadContacts() {
  try {
    const { data, error } = await supabaseClient
      .from('contacts')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Erro ao carregar contatos:', error);
      return;
    }
    
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
  } catch (err) {
    console.error('Erro:', err);
  }
}

async function loadSkills() {
  try {
    const { data, error } = await supabaseClient
      .from('skills')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Erro ao carregar skills:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const softSkills = data.filter(s => s.type === 'soft');
      const hardSkills = data.filter(s => s.type === 'hard');
      
      const softContainer = document.getElementById('soft-tags');
      if (softContainer) {
        softContainer.innerHTML = softSkills.map(s => 
          `<span class="soft-tag">${s.name}</span>`
        ).join('');
      }
      
      const hardContainer = document.getElementById('hard-skills-list');
      if (hardContainer) {
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
  } catch (err) {
    console.error('Erro:', err);
  }
}

async function loadStats() {
  try {
    const { data, error } = await supabaseClient
      .from('stats')
      .select('*');
    
    if (error) {
      console.error('Erro ao carregar stats:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const container = document.getElementById('hero-stats');
      if (container) {
        container.innerHTML = data.map(s => `
          <div class="stat">
            <div class="stat-num">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

async function loadCertificates() {
  try {
    const { data, error } = await supabaseClient
      .from('certificates')
      .select('*');
    
    if (error) {
      console.error('Erro ao carregar certificados:', error);
      return;
    }
    
    if (data && data.length > 0) {
      certificates = data;
      const container = document.getElementById('certs-grid');
      if (container) {
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
  } catch (err) {
    console.error('Erro:', err);
  }
}

function openModal(index) {
  const cert = certificates[index];
  if (!cert) return;
  
  document.getElementById('modal-title').textContent = cert.name;
  document.getElementById('modal-issuer').textContent = cert.issuer;
  
  // Verificar o tipo de arquivo
  if (cert.image_url) {
    const fileExt = cert.image_url.split('.').pop().toLowerCase();
    
    if (fileExt === 'pdf') {
      document.getElementById('modal-content').innerHTML = `
        <embed src="${cert.image_url}" type="application/pdf" width="100%" height="500px" />
      `;
    } else {
      document.getElementById('modal-content').innerHTML = `
        <img class="modal-img" src="${cert.image_url}" alt="${cert.name}"/>
      `;
    }
  } else {
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-placeholder">Certificado disponível mediante solicitação</div>
    `;
  }
  
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

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

function initTypedEffect() {
  const roles = ['Desenvolvedor 💻', 'Analista de Dados 📊', 'Profissional de TI ⚙️'];
  let ri = 0, ci = 0, deleting = false;
  const el = document.getElementById('typed-text');
  
  if (!el) return;
  
  function type() {
    const cur = roles[ri];
    el.textContent = deleting ? cur.slice(0, ci--) : cur.slice(0, ci++);
    if (!deleting && ci > cur.length) { 
      setTimeout(() => deleting = true, 1500); 
    }
    if (deleting && ci < 0) { 
      deleting = false; 
      ri = (ri + 1) % roles.length; 
      ci = 0; 
    }
    setTimeout(type, deleting ? 45 : 90);
  }
  type();
}

function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { 
      if (e.isIntersecting) e.target.classList.add('visible'); 
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

window.openModal = openModal;
window.closeModal = closeModal;
window.sendMessage = sendMessage;