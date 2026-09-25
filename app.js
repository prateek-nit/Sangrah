/* ═══════════════════════════════════════════════════════════
   Sangrah— Application Logic
   Forensic · Court · Police — Evidence · Justice · A Safer Tomorrow
   ═══════════════════════════════════════════════════════════ */

// ─── State ───
let currentPage = 'dashboard';
let isLoggedIn = false;

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
    createLoginParticles();
    animateStatCounters();
});

// ─── Login Particles ───
function createLoginParticles() {
    const container = document.getElementById('login-particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'login-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        container.appendChild(particle);
    }
}

// ─── Auth Tab Switching ───
function switchAuthTab(tab) {
    // Toggle tab buttons
    document.getElementById('tab-otp').classList.toggle('active', tab === 'otp');
    document.getElementById('tab-password').classList.toggle('active', tab === 'password');

    // Toggle forms
    document.getElementById('otp-form').classList.toggle('active', tab === 'otp');
    document.getElementById('password-form').classList.toggle('active', tab === 'password');
}

// ─── Login Handler ───
function handleLogin(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;

    // Loading state
    btn.innerHTML = `
        <div class="loading-spinner" style="width:18px;height:18px;border-width:2px;"></div>
        Authenticating...
    `;
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;

        // Switch to app
        isLoggedIn = true;
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-shell').classList.add('active');

        showToast('Authenticated successfully. Welcome back, Administrator.', 'success');

        // Trigger animations
        setTimeout(() => animateStatCounters(), 300);
    }, 1800);
}

// ─── Logout Handler ───
function handleLogout() {
    isLoggedIn = false;
    document.getElementById('app-shell').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    showToast('Session terminated. Audit event recorded.', 'info');
}

// ─── Navigation ───
function navigateTo(page, event) {
    if (event) event.preventDefault();
    currentPage = page;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Update page visibility
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) {
        target.classList.add('active');
        // Scroll to top of content
        document.querySelector('.main-content').scrollTop = 0;
    }
}

// ─── FIR Modal ───
function openFIRModal() {
    document.getElementById('fir-modal').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeFIRModal() {
    document.getElementById('fir-modal').classList.remove('visible');
    document.body.style.overflow = '';
}

function submitFIR(event) {
    event.preventDefault();
    const title = document.getElementById('fir-title').value;

    if (!title) {
        showToast('Please provide a Case Title / Incident Heading.', 'error');
        return;
    }

    // Generate FIR number
    const firNum = Math.floor(Math.random() * 100) + 1248;
    const caseNum = Math.floor(Math.random() * 50) + 422;

    showToast(`FIR #GUJ/2026/FIR/${firNum} registered. Case workspace GUJ/2026/CR/0${caseNum} provisioned.`, 'success');

    // Update stats
    const caseStat = document.getElementById('stat-cases');
    if (caseStat) {
        const currentVal = parseInt(caseStat.textContent);
        animateNumber(caseStat, currentVal, currentVal + 1, 600);
    }

    // Reset form and close
    document.getElementById('fir-form').reset();
    closeFIRModal();

    // Add activity
    addActivity(
        `FIR #GUJ/2026/FIR/${firNum} registered — "${title}"`,
        'blue'
    );
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'fir-modal') {
        closeFIRModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFIRModal();
    }
});

// ─── Ledger Block Signing ───
function signBlock(button) {
    const item = button.closest('.ledger-item');
    const unsignedDots = item.querySelectorAll('.sig-dot.unsigned');
    const sigCount = item.querySelector('.sig-count');

    if (unsignedDots.length > 0) {
        // Sign the last unsigned dot (as MASTER)
        const lastUnsigned = unsignedDots[unsignedDots.length - 1];
        lastUnsigned.classList.remove('unsigned');
        lastUnsigned.classList.add('signed');

        // Update count
        const signed = item.querySelectorAll('.sig-dot.signed').length;
        sigCount.textContent = `${signed}/3 signed`;

        // Disable button
        button.textContent = '✓ Signed';
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'default';

        const blockId = item.querySelector('.ledger-block').textContent;
        showToast(`Block ${blockId} signed as MASTER. ${signed >= 3 ? 'Block is now FINAL.' : `${3 - signed} more signature(s) needed.`}`, 'success');

        if (signed >= 3) {
            item.style.borderLeft = '3px solid var(--green-500)';
            item.style.background = 'rgba(16,185,129,0.04)';
            addActivity(`Block ${blockId} finalized — ${signed}/4 signatures confirmed`, 'green');
        }
    }
}

// ─── Tree Toggle ───
function toggleTree(element) {
    const node = element.closest('.tree-node');
    const children = node.querySelector('.tree-children');

    if (children) {
        children.classList.toggle('collapsed');
        element.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
    }
}

// ─── Stat Counter Animation ───
function animateStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
        const target = parseInt(el.textContent.replace(/,/g, ''));
        if (isNaN(target)) return;
        animateNumber(el, 0, target, 1200);
    });
}

function animateNumber(element, from, to, duration) {
    const start = performance.now();
    const format = (n) => n.toLocaleString();

    function update(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.round(from + (to - from) * eased);
        element.textContent = format(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

// ─── Activity Feed ───
function addActivity(text, color) {
    const list = document.querySelector('.activity-list');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.animation = 'fadeIn 0.4s ease';
    item.innerHTML = `
        <div class="activity-dot activity-dot-${color}"></div>
        <div class="activity-content">
            <span class="activity-text">${text}</span>
            <span class="activity-time">Just now</span>
        </div>
    `;

    list.insertBefore(item, list.firstChild);
}

// ─── Toast Notifications ───
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '';
    switch (type) {
        case 'success':
            icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
            break;
        case 'error':
            icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
            break;
        default:
            icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ─── Keyboard Shortcuts ───
document.addEventListener('keydown', (e) => {
    // Ctrl+K — focus search (if on cases page)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('case-search-input');
        if (searchInput && currentPage === 'cases') {
            searchInput.focus();
        } else {
            navigateTo('cases');
            setTimeout(() => {
                const input = document.getElementById('case-search-input');
                if (input) input.focus();
            }, 100);
        }
    }

    // Ctrl+N — new FIR
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && isLoggedIn) {
        e.preventDefault();
        openFIRModal();
    }
});
