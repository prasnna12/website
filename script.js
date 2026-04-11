// --- STATE MANAGEMENT ---
let storage = {
    installed: JSON.parse(localStorage.getItem('appInstalled')) || [],
    locked: JSON.parse(localStorage.getItem('appLocked')) || [],
    hidden: JSON.parse(localStorage.getItem('appHidden')) || [],
    pin: localStorage.getItem('appPin') || "1234",
    settings: JSON.parse(localStorage.getItem('userSettings')) || {
        pinSecurity: true
    }
};

let currentView = 'home';
let navHistory = ['home'];
let selectedApp = null;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// --- INITIALIZATION ---
window.onload = () => {
    renderHome();
    updateProfileAvatar();
    
    // Global Security: Disable Right Click
    document.addEventListener('contextmenu', e => e.preventDefault());
};

function saveStorage() {
    localStorage.setItem('appInstalled', JSON.stringify(storage.installed));
    localStorage.setItem('appLocked', JSON.stringify(storage.locked));
    localStorage.setItem('appHidden', JSON.stringify(storage.hidden));
    localStorage.setItem('appPin', storage.pin);
    localStorage.setItem('userSettings', JSON.stringify(storage.settings));
}

// --- NAVIGATION ---
function showPage(pageId, pushToHistory = true) {
    document.getElementById('main-scroll-container').scrollTop = 0;

    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.style.display = 'block';

    document.querySelectorAll('.side-item').forEach(i => i.classList.remove('active'));
    const sideBtn = document.getElementById(`side-${pageId}`);
    if (sideBtn) sideBtn.classList.add('active');

    if (pushToHistory && currentView !== pageId) {
        navHistory.push(pageId);
    }
    currentView = pageId;

    document.getElementById('btn-universal-back').style.visibility = navHistory.length > 1 ? 'visible' : 'hidden';

    if (pageId === 'home') renderHome();
    if (pageId === 'apps') renderGrid('grid-all-apps', APP_DATA.filter(a => a.type === 'app'));
    if (pageId === 'games') renderGrid('grid-all-games', APP_DATA.filter(a => a.type === 'game'));
    if (pageId === 'my-apps') renderGrid('grid-my-apps', APP_DATA.filter(a => storage.installed.includes(a.id)));
    if (pageId === 'settings') renderSettings();
}

function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop();
        const prevPage = navHistory[navHistory.length - 1];
        showPage(prevPage, false);
    }
}

// --- RENDERERS ---
function renderHome() {
    const trending = APP_DATA.filter(a => a.trending).slice(0, 8);
    const hotGames = APP_DATA.filter(a => a.type === 'game' && a.editorChoice).slice(0, 8);
    
    renderGrid('grid-trending', trending);
    renderGrid('grid-hot-games', hotGames);
}

function renderGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    
    const visibleItems = items.filter(a => !storage.hidden.includes(a.id));

    if (visibleItems.length === 0) {
        container.innerHTML = `<p style="color: var(--text-secondary); padding: 40px; text-align: center; width: 100%; grid-column: 1/-1;">No results found.</p>`;
        return;
    }

    visibleItems.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.style.setProperty('--delay', index);
        card.onclick = () => openAppDetail(app.id);
        
        const iconUrl = getIconUrl(app);
        
        let tags = "";
        if (app.trending) tags += `<span class="premium-tag">TREND</span>`;
        if (app.editorChoice) tags += `<span class="premium-tag" style="background: var(--accent); color: black;">PRO</span>`;

        card.innerHTML = `
            <div class="app-icon-wrapper">
                ${tags}
                <img src="${iconUrl}" alt="${app.name}" loading="lazy" onerror="this.src='https://unavatar.io/${app.domain || 'google.com'}'; this.onerror=function(){this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random&color=fff&size=512';};">
            </div>
            <div class="app-name">${app.name}</div>
            <div class="app-cat">${app.category.charAt(0).toUpperCase() + app.category.slice(1)}</div>
        `;

        container.appendChild(card);
    });
}

function getIconUrl(app) {
    if (app.domain) {
        // Principal: Google's ultra-reliable favicon service (256px)
        return `https://www.google.com/s2/favicons?domain=${app.domain}&sz=256`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=333&color=fff&size=512&rounded=true`;
}


// --- DETAIL VIEW ---
function openAppDetail(id) {
    const app = APP_DATA.find(a => a.id === id);
    if (!app) return;
    selectedApp = app;

    const detailIcon = document.getElementById('detail-icon');
    detailIcon.src = getIconUrl(app);
    detailIcon.onerror = () => { detailIcon.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(app.name) + '&background=random&color=fff&size=512'; };
    
    document.getElementById('detail-name').innerText = app.name;
    document.getElementById('detail-developer').innerText = app.developer;
    document.getElementById('detail-rating').innerText = app.rating;
    document.getElementById('detail-description').innerText = app.desc;

    updateDetailButtons();
    showPage('app-detail');
}


function updateDetailButtons() {
    const isInstalled = storage.installed.includes(selectedApp.id);
    document.getElementById('btn-install-action').style.display = isInstalled ? 'none' : 'block';
    document.getElementById('btn-open-action').style.display = isInstalled ? 'block' : 'none';
}

function handleInstallClick() {
    const btn = document.getElementById('btn-install-action');
    btn.innerText = "Installing...";
    btn.disabled = true;

    setTimeout(() => {
        storage.installed.push(selectedApp.id);
        saveStorage();
        updateDetailButtons();
        btn.innerText = "Install";
        btn.disabled = false;
    }, 1500);
}

// --- APP OPENING SYSTEM (CENTRALIZED) ---
function handleOpenClick() {
    openApp(selectedApp.name); // Call by App Name as requested
}

function openApp(appName) {
    const app = APP_DATA.find(a => a.name === appName);
    if (!app) return;
    selectedApp = app;

    if (!currentUser) {
        openModal('login-modal');
        return;
    }

    if (storage.settings.pinSecurity && storage.locked.includes(app.id)) {
        openModal('security-check');
        return;
    }

    executeLaunch(app);
}

function executeLaunch(app) {
    const loader = document.getElementById('app-loader');
    loader.style.display = 'flex';

    setTimeout(() => {
        loader.style.display = 'none';
        
        if (app.embedReady) {
            const viewer = document.getElementById('immersive-viewer');
            const iframe = document.getElementById('app-iframe');
            const title = document.getElementById('immersive-title');

            title.innerText = app.name;
            iframe.src = app.url;
            viewer.style.display = 'flex';
        } else {
            window.open(app.url, '_blank');
        }
    }, 800);
}

function closeApp() {
    const viewer = document.getElementById('immersive-viewer');
    const iframe = document.getElementById('app-iframe');
    viewer.style.display = 'none';
    iframe.src = "";
}



// --- SETTINGS ---
function renderSettings() {
    document.getElementById('setting-pin-toggle').checked = storage.settings.pinSecurity;
    
    const lockList = document.getElementById('settings-app-list-lock');
    lockList.innerHTML = "";

    APP_DATA.forEach(app => {
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${getIconUrl(app)}" style="width: 32px; height: 32px; border-radius: 6px;">
                <span>${app.name}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="toggleAppLock(${app.id})" style="background: ${storage.locked.includes(app.id) ? 'var(--accent)' : '#333'}; padding: 6px 12px; border: none; border-radius: 6px; color: ${storage.locked.includes(app.id) ? 'black' : 'white'}; font-size: 0.7rem; cursor: pointer;">
                    ${storage.locked.includes(app.id) ? 'LOCKED' : 'LOCK'}
                </button>
                <button onclick="toggleAppHide(${app.id})" style="background: ${storage.hidden.includes(app.id) ? '#ff4757' : '#333'}; padding: 6px 12px; border: none; border-radius: 6px; color: white; font-size: 0.7rem; cursor: pointer;">
                    ${storage.hidden.includes(app.id) ? 'HIDDEN' : 'HIDE'}
                </button>
            </div>
        `;
        lockList.appendChild(row);
    });
}

function toggleSetting(key) {
    storage.settings[key] = !storage.settings[key];
    saveStorage();
}

function toggleAppLock(id) {
    if (storage.locked.includes(id)) {
        storage.locked = storage.locked.filter(lid => lid !== id);
    } else {
        storage.locked.push(id);
    }
    saveStorage();
    renderSettings();
}

function toggleAppHide(id) {
    if (storage.hidden.includes(id)) {
        storage.hidden = storage.hidden.filter(hid => hid !== id);
    } else {
        storage.hidden.push(id);
    }
    saveStorage();
    renderSettings();
}

function changePin() {
    const newPin = prompt("Enter new 4-digit PIN:", storage.pin);
    if (newPin && newPin.length === 4 && !isNaN(newPin)) {
        storage.pin = newPin;
        saveStorage();
        alert("PIN Updated Successfully!");
    } else {
        alert("Invalid PIN. Must be 4 digits.");
    }
}

// --- SECURITY MODALS & BIOMETRIC SIMULATIONS ---
function switchSecurityMode(mode) {
    const main = document.getElementById('security-main-view');
    const pin = document.getElementById('security-pin-view');
    const bio = document.getElementById('security-bio-view');
    const bioIcon = document.getElementById('bio-icon');
    const bioMsg = document.getElementById('bio-msg');
    const bioStatus = document.getElementById('bio-status');
    const scanLine = document.getElementById('bio-scan-line');

    main.style.display = 'none';
    pin.style.display = 'none';
    bio.style.display = 'none';
    scanLine.style.display = 'none';

    if (mode === 'main') {
        main.style.display = 'block';
    } else if (mode === 'pin') {
        pin.style.display = 'block';
        document.getElementById('security-pin-input').focus();
    } else if (mode === 'fingerprint' || mode === 'faceid') {
        bio.style.display = 'block';
        bioIcon.className = mode === 'fingerprint' ? 'fas fa-fingerprint' : 'fas fa-eye';
        bioMsg.innerText = mode === 'fingerprint' ? 'Place finger on sensor' : 'Look into the camera';
        bioStatus.innerText = "Scanning...";
        
        scanLine.style.display = 'block';
        scanLine.style.animation = 'scan 1.5s ease-in-out infinite';
        
        setTimeout(() => {
            bioStatus.innerText = "Identity Verified";
            scanLine.style.display = 'none';
            setTimeout(() => {
                closeModal('security-check');
                switchSecurityMode('main');
                executeLaunch(selectedApp);
            }, 500);
        }, 2000);
    }
}

function verifySecurityPin() {
    const input = document.getElementById('security-pin-input').value;
    if (input === storage.pin) {
        closeModal('security-check');
        document.getElementById('security-pin-input').value = "";
        switchSecurityMode('main');
        executeLaunch(selectedApp);
    } else {
        alert("Incorrect PIN!");
        document.getElementById('security-pin-input').value = "";
    }
}


// --- LOGIN ---
function validateLogin() {
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    
    if (user && pass.length >= 6) {
        currentUser = { username: user };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileAvatar();
        closeModal('login-modal');
        openApp(selectedApp.name);
    } else {
        alert("Please enter a username and a password (min 6 chars).");
    }
}

function updateProfileAvatar() {
    const prof = document.getElementById('user-profile');
    if (currentUser) {
        prof.innerHTML = `<i class="fas fa-user-check" style="color: var(--accent);"></i> <span>Hi, ${currentUser.username}</span>`;
    }
}

// --- MISC ---
function toggleBranding() {
    const brand = document.querySelector('.branding');
    brand.classList.toggle('active');
    setTimeout(() => brand.classList.remove('active'), 3000);
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function setupSearch() {
    const query = document.getElementById('main-search-input').value.toLowerCase();
    if (query.trim() === "") {
        showPage(currentView);
        return;
    }
    
    const allResults = APP_DATA.filter(a => a.name.toLowerCase().includes(query) || a.category.toLowerCase().includes(query));
    
    if (currentView === 'apps') renderGrid('grid-all-apps', allResults);
    else if (currentView === 'games') renderGrid('grid-all-games', allResults);
    else {
        renderGrid('grid-trending', allResults);
    }
}