/* Professional Media Hub - Dashboard Logic (Static Version) */

let currentApps = typeof APP_DATA !== 'undefined' ? APP_DATA : [];
let navHistory = ['home'];

window.onload = () => {
    console.log("Media Hub Full-Stack Initialized");
    const welcome = document.getElementById('welcome-slide');
    const dashboard = document.getElementById('dashboard-wrapper');
    if (welcome && dashboard) {
        welcome.style.display = 'flex';
        dashboard.style.display = 'none';
    }
    initGrids();
    setupSearch();
    renderApps(currentApps); // Initial apps render
};


function getLocalMedia() {
    // Basic local data for non-app grids
    return {
        home: [
            { title: "Futuristic Urban Design", desc: "Exploring 2030 Architecture", thumb: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&q=80", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { title: "Modern Minimalism 101", desc: "Clean Life, Clean Mind", thumb: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500&q=80", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
        ],
        trending: [
            { title: "AI Revolution", desc: "Rewriting the Future", thumb: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&q=80", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
        ],
        music: [
            { title: "Lo-Fi Beats for Coding", desc: "Deep Focus Session", thumb: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
        ],
        videos: [
            { title: "The Future of AI", desc: "A documentary on tomorrow's tech.", thumb: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&q=80", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "tech" }
        ]
    };
}

function initGrids() {
    const data = getLocalMedia();
    renderGrid('home-grid', data.home);
    renderGrid('trending-grid', data.trending);
    renderGrid('music-grid', data.music);
    renderGrid('videos-grid', data.videos);
}

function renderGrid(containerId, items) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = "";
    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "media-card";
        card.onclick = () => {
            if (item.url) openWatch(item.title, item.desc, item.url);
        };
        card.innerHTML = `
            <img class="thumbnail" src="${item.thumb}" alt="${item.title}">
            <div class="card-info">
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function showPage(pageId, pushToHistory = true) {
    if (pushToHistory && navHistory[navHistory.length - 1] !== pageId) {
        navHistory.push(pageId);
    }

    // Auto-close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebar.classList.contains('active')) {
        toggleSidebar();
    }

    // Hide all pages
    document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
    // Show selected page
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');

    if (pageId === 'apps') {
        const storeWrapper = document.getElementById('store-content-wrapper');
        if (storeWrapper) storeWrapper.classList.add('active');
        fetchApps(); // Ensure apps are loaded when shown
    } else {
        const storeWrapper = document.getElementById('store-content-wrapper');
        if (storeWrapper) storeWrapper.classList.remove('active');
    }

    // Update Sidebar
    document.querySelectorAll('.side-item').forEach(i => i.classList.remove('active'));
    const sideBtn = document.getElementById(`side-${pageId}`);
    if (sideBtn) sideBtn.classList.add('active');

    // Scroll to top
    document.querySelector('.main-content').scrollTop = 0;
}

function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop(); // Remove current page
        const prevPage = navHistory[navHistory.length - 1];
        showPage(prevPage, false);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const activePage = document.querySelector('.content-page.active');
        if (!activePage) return;

        const grid = activePage.querySelector('.media-grid, .apps-grid');
        if (!grid) return;

        const cards = grid.children;
        Array.from(cards).forEach(card => {
            const text = card.innerText.toLowerCase();
            if (text.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function openLogin() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeLogin() {
    document.getElementById('login-modal').style.display = 'none';
}

function enterDashboard() {
    console.log("Entering Dashboard...");
    const welcome = document.getElementById('welcome-slide');
    const dashboard = document.getElementById('dashboard-wrapper');
    
    if (!welcome || !dashboard) {
        console.error("Welcome or Dashboard wrapper not found!");
        return;
    }

    welcome.classList.add('fade-out');
    
    setTimeout(() => {
        welcome.style.display = 'none';
        dashboard.style.display = 'block';
        dashboard.style.opacity = '0';
        dashboard.style.transition = 'opacity 0.8s ease';
        
        // Trigger reflow
        dashboard.offsetHeight; 
        dashboard.style.opacity = '1';
        
        // Ensure grids are initialized properly if they weren't
        initGrids();
        renderApps(currentApps);
    }, 500);
}

// --- APPS SECTION LOGIC ---

let currentType = 'app'; // 'app' or 'game'

function fetchApps(category = 'all') {
    if (category === 'all') {
        currentApps = APP_DATA;
    } else {
        currentApps = APP_DATA.filter(a => a.category === category);
    }
    updateCategoryFilters();
    renderApps(currentApps);
}

function filterByType(type) {
    currentType = type;
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.toggle('active', btn.innerText.toLowerCase().includes(type)));
    
    updateCategoryFilters();
    renderApps(currentApps);
}

function updateCategoryFilters() {
    const filterContainer = document.getElementById('app-category-filters');
    if (!filterContainer) return;

    // Get unique categories for the current type
    const categories = ['all', ...new Set(currentApps.filter(a => a.type === currentType).map(a => a.category))];
    
    filterContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'all' ? 'active' : ''}" onclick="filterAppsByCategory('${cat}')">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
    `).join('');
}

function filterAppsByCategory(category) {
    document.querySelectorAll('#app-category-filters .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase() === category.toLowerCase());
    });
    renderApps(currentApps, category);
}

async function searchApps() {
    const query = document.getElementById('apps-search-input').value;
    if (!query) return renderApps(currentApps);
    
    // Simple local search for now
    const filtered = currentApps.filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) || 
        app.desc.toLowerCase().includes(query.toLowerCase())
    );
    renderApps(filtered);
}

function renderApps(apps, category = 'all') {
    const sections = {
        trending: document.getElementById('trending-apps-grid'),
        topGames: document.getElementById('top-games-grid'),
        recommended: document.getElementById('recommended-apps-grid'),
        all: document.getElementById('apps-grid')
    };

    // Clear all grids
    Object.values(sections).forEach(grid => { if (grid) grid.innerHTML = ""; });

    const isSearching = document.getElementById('apps-search-input')?.value.length > 0;
    const isFiltered = category !== 'all';

    // Filter by type (Apps or Games)
    let filteredApps = apps.filter(a => a.type === currentType);
    
    // Filter by Category if needed
    if (isFiltered) {
        filteredApps = filteredApps.filter(a => a.category === category);
    }

    if (isSearching || isFiltered) {
        // Hide sections, show only search results in "All"
        document.querySelectorAll('.store-section').forEach(s => s.style.display = 'none');
        const allSection = document.getElementById('section-all');
        allSection.style.display = 'block';
        allSection.querySelector('h3').innerText = isSearching ? "🔍 Search Results" : `🛰️ ${category.toUpperCase()} Items`;
        
        filteredApps.forEach(app => sections.all.appendChild(createAppCard(app)));
    } else {
        // Show sections
        document.querySelectorAll('.store-section').forEach(s => s.style.display = 'block');
        
        // Populate Trending (Apps) or Top Games
        if (currentType === 'app') {
            document.getElementById('section-trending').style.display = 'block';
            document.getElementById('section-top-games').style.display = 'none';
            filteredApps.filter(a => a.trending).forEach(app => sections.trending.appendChild(createAppCard(app)));
        } else {
            document.getElementById('section-trending').style.display = 'none';
            document.getElementById('section-top-games').style.display = 'block';
            filteredApps.filter(a => a.trending).forEach(app => sections.topGames.appendChild(createAppCard(app)));
        }

        // Recommended
        filteredApps.filter(a => a.recommended).forEach(app => sections.recommended.appendChild(createAppCard(app)));

        // All
        filteredApps.forEach(app => sections.all.appendChild(createAppCard(app)));
    }
}

function createAppCard(app) {
    const card = document.createElement("div");
    card.className = "app-card";
    card.onclick = () => showAppDetail(app.id);
    card.innerHTML = `
        <div class="app-badge">${app.category}</div>
        <div class="app-icon"><img src="${app.icon}" alt="${app.name}"></div>
        <div class="app-info-overlay">
            <h3>${app.name}</h3>
            <p>${app.desc}</p>
        </div>
    `;
    return card;
}

function showAppDetail(id) {
    const app = currentApps.find(a => a.id === id);
    if (!app) return;
    selectedApp = app;

    showPage('app-detail');

    // Populate Detail Page
    document.getElementById('detail-app-icon').src = app.icon;
    document.getElementById('detail-app-name').innerText = app.name;
    document.getElementById('detail-app-dev').innerText = app.developer || "MediaHub Studios";
    document.getElementById('detail-app-cat').innerText = app.category;
    document.getElementById('detail-app-rating').innerText = app.rating || '4.0';
    document.getElementById('detail-app-desc').innerText = app.desc;

    // Reset Buttons
    document.getElementById('btn-install').style.display = 'block';
    document.getElementById('install-progress-wrapper').style.display = 'none';
    document.getElementById('btn-open-app').style.display = 'none';
    document.getElementById('install-progress-fill').style.width = '0%';

    // Stars
    const starsContainer = document.getElementById('detail-stars');
    starsContainer.innerHTML = "";
    const fullStars = Math.floor(app.rating || 4);
    for (let i = 0; i < 5; i++) {
        const star = document.createElement("i");
        star.className = i < fullStars ? "fas fa-star" : "far fa-star";
        starsContainer.appendChild(star);
    }

    // Screenshots
    const screenGrid = document.getElementById('detail-screenshots');
    screenGrid.innerHTML = "";
    (app.screenshots || []).forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        screenGrid.appendChild(img);
    });

    // Features
    const featureList = document.getElementById('detail-app-features');
    featureList.innerHTML = "";
    (app.features || ["Easy integration", "Premium UI", "Fast performance"]).forEach(f => {
        const li = document.createElement("li");
        li.innerText = f;
        featureList.appendChild(li);
    });

    // Reviews
    const reviewsGrid = document.getElementById('detail-app-reviews');
    reviewsGrid.innerHTML = "";
    (app.reviews || [{user: "Tech Ninja", rating: 5, comment: "Amazing experience!"}]).forEach(r => {
        const rCard = document.createElement("div");
        rCard.className = "review-card";
        rCard.innerHTML = `
            <div class="review-user">${r.user}</div>
            <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div>
            <div class="review-text">${r.comment}</div>
        `;
        reviewsGrid.appendChild(rCard);
    });

    // Related
    const relatedGrid = document.getElementById('related-apps-grid');
    relatedGrid.innerHTML = "";
    const related = currentApps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
    related.forEach(ra => relatedGrid.appendChild(createAppCard(ra)));
}

function startInstallation() {
    const btnInstall = document.getElementById('btn-install');
    const progressWrapper = document.getElementById('install-progress-wrapper');
    const fill = document.getElementById('install-progress-fill');
    const percent = document.getElementById('install-percent');
    const btnOpen = document.getElementById('btn-open-app');

    btnInstall.style.display = 'none';
    progressWrapper.style.display = 'block';

    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressWrapper.style.display = 'none';
                btnOpen.style.display = 'block';
            }, 500);
        } else {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            fill.style.width = width + '%';
            percent.innerText = Math.floor(width) + '%';
        }
    }, 400);
}

function openSelectedApp() {
    if (selectedApp) {
        openApp(selectedApp.name, selectedApp.url);
    }
}

function filterAppsByCategory(category) {
    // Update button states
    document.querySelectorAll('#app-category-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    fetchApps(category);
}

// --- IMMERSIVE LAUNCHER LOGIC ---

function openApp(name, url) {
    const app = currentApps.find(a => a.name === name) || selectedApp;
    const isIframeBlocked = ['YouTube', 'Netflix', 'Spotify', 'Twitter (X)', 'Instagram', 'Disney+ Hotstar'].includes(name);

    // Show Immersive Page
    showPage('app-viewer');
    
    // Update Immersive UI
    document.getElementById('immersive-app-title').innerText = name;
    document.getElementById('external-launch-link').href = url;
    document.getElementById('splash-app-name').innerText = `Launching ${name}...`;
    document.getElementById('splash-app-icon').innerHTML = app ? `<img src="${app.icon}" style="width: 80px; height: 80px; object-fit: contain;">` : "🚀";

    const splash = document.getElementById('launcher-splash');
    const blockedMsg = document.getElementById('iframe-blocked-message');
    const frame = document.getElementById('app-frame');
    const forceBtn = document.getElementById('btn-force-open');

    // Reset State
    splash.style.display = 'flex';
    splash.style.opacity = '1';
    blockedMsg.style.display = 'none';
    frame.src = "";
    frame.style.display = 'block';

    // Splash Timeout
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => splash.style.display = 'none', 800);

        if (isIframeBlocked) {
            frame.style.display = 'none';
            blockedMsg.style.display = 'block';
            forceBtn.onclick = () => window.open(url, '_blank');
        } else {
            frame.src = url;
        }
    }, 2500);
}


// --- AUTH LOGIC ---

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    // Simple local check (mock credentials)
    if (email === 'user@example.com' && password === 'password123') {
        closeLogin();
        document.querySelector('.profile-btn').innerText = "Media";
        enterDashboard();
    } else {
        errorEl.innerText = "Invalid credentials";
        errorEl.style.display = 'block';
    }
}

// --- VIDEO PLAYER & FILTER LOGIC ---

// --- MINIMALIST VIDEO PLAYER (YT API) ---

let ytPlayer = null;

function onYouTubeIframeAPIReady() {
    console.log("YouTube API Ready");
}

function openWatch(title, desc, url) {
    const modal = document.getElementById('watch-modal');
    const modalTitle = document.getElementById('video-modal-title');
    const modalDesc = document.getElementById('video-modal-desc');
    const loader = document.getElementById('video-loader');

    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modal.style.display = 'flex';
    
    // Show loader
    if (loader) loader.classList.remove('hidden');

    // Extract Video ID
    const videoId = extractVideoID(url);

    if (ytPlayer) {
        ytPlayer.loadVideoById(videoId);
    } else {
        ytPlayer = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'controls': 1,
                'iv_load_policy': 3
            },
            events: {
                'onReady': (event) => event.target.playVideo(),
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function onPlayerStateChange(event) {
    const loader = document.getElementById('video-loader');
    if (event.data === YT.PlayerState.PLAYING) {
        // Smoothly hide loader once playing
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500);
        }
    } else if (event.data === YT.PlayerState.BUFFERING) {
        // Show loader if buffering heavily
        // if (loader) loader.classList.remove('hidden');
    }
}

function extractVideoID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

function closeWatch() {
    const modal = document.getElementById('watch-modal');
    if (modal) {
        modal.style.display = 'none';
        if (ytPlayer) ytPlayer.stopVideo();
        if (document.body.classList.contains('focus-active')) {
            toggleFocusMode();
        }
    }
}

function toggleFocusMode() {
    document.body.classList.toggle('focus-active');
    const btn = document.getElementById('btn-focus-mode');
    
    if (document.body.classList.contains('focus-active')) {
        btn.innerHTML = `<i class="fas fa-compress-arrows-alt"></i> <span>Exit Focus</span>`;
    } else {
        btn.innerHTML = `<i class="fas fa-expand-arrows-alt"></i> <span>Focus Mode</span>`;
    }
}

function skipIntro() {
    if (ytPlayer && ytPlayer.seekTo) {
        const currentTime = ytPlayer.getCurrentTime();
        ytPlayer.seekTo(currentTime + 85, true); // Standard 85s skip
        
        // Visual feedback
        const btn = document.getElementById('btn-skip-intro');
        if (btn) {
            const originalContent = btn.innerHTML;
            btn.innerHTML = `Skipped! <i class="fas fa-check"></i>`;
            setTimeout(() => {
                btn.innerHTML = originalContent;
            }, 2000);
        }
    }
}

function filterVideos(category) {
    // Update buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (category === 'all') {
        renderGrid('videos-grid', getLocalMedia().videos);
    } else {
        const filtered = getLocalMedia().videos.filter(v => v.category === category);
        renderGrid('videos-grid', filtered);
    }
}