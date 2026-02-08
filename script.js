// script.js — вся логика приложения

// ================== Firebase Config ==================
const firebaseConfig = {
  apiKey: "AIzaSyB-Bx0qZ7nGN8Nn_DfUyVKuCfzmoNDnwjw",
  authDomain: "ipaworld.firebaseapp.com",
  projectId: "ipaworld",
  storageBucket: "ipaworld.firebasestorage.app",
  messagingSenderId: "456186416178",
  appId: "1:456186416178:web:be65c6a6310d809234002b",
  measurementId: "G-W5C64GL3X6"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================== DOM элементы ==================
const appList = document.getElementById('appList');
const loading = document.getElementById('loading');
const modal = document.getElementById('appModal');
const closeModalBtn = document.getElementById('closeModal');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

// ================== Глобальное состояние ==================
let allApps = [];
let allGames = [];

// ================== Функции ==================
function loadData() {
  loading.style.display = 'block';

  const appsPromise = db.collection('apps').get()
    .then(snapshot => {
      allApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });

  const gamesPromise = db.collection('games').get()
    .then(snapshot => {
      allGames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });

  Promise.all([appsPromise, gamesPromise])
    .then(() => {
      loading.style.display = 'none';

      if (allApps.length === 0 && allGames.length === 0) {
        appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Приложений и игр пока нет</p>';
        return;
      }

      // По умолчанию показываем Apps
      renderList('apps');
    })
    .catch(error => {
      console.error("Ошибка загрузки данных:", error);
      loading.innerHTML = 'Ошибка загрузки. Проверь консоль.';
      loading.style.color = '#ff6b6b';
    });
}

function renderList(category, searchQuery = '') {
  appList.innerHTML = '';

  let items = category === 'apps' ? allApps : allGames;

  // Фильтр по поиску (если есть запрос)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    items = items.filter(item => {
      const name = (item.название || '').toLowerCase();
      return name.includes(query);
    });
  }

  if (items.length === 0) {
    appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Ничего не найдено</p>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'app-card minimal';

    card.innerHTML = `
      <div class="app-header">
        <img src="${item.icon_url || 'https://via.placeholder.com/64?text=Icon'}" alt="${item.название}" class="app-icon">
        <h3 class="app-title">${item.название || 'Без названия'}</h3>
      </div>
      <button class="btn-open" data-id="${item.id}" data-category="${category}">Открыть</button>
    `;

    appList.appendChild(card);
  });
}

function openModal(itemId, category) {
  const items = category === 'apps' ? allApps : allGames;
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('modalIcon').src = item.icon_url || 'https://via.placeholder.com/128?text=Icon';
  document.getElementById('modalTitle').textContent = item.название || 'Без названия';
  document.getElementById('modalFeatures').textContent = item.функции || '';
  document.getElementById('modalDownloadBtn').href = item.download_url || '#';

  modal.style.display = 'flex';
}

// ================== События ==================
appList.addEventListener('click', e => {
  if (e.target.classList.contains('btn-open')) {
    const itemId = e.target.dataset.id;
    const category = e.target.dataset.category;
    openModal(itemId, category);
  }
});

closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// Переключение вкладок
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();

    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabType = tab.dataset.tab;

    if (tabType === 'apps' || tabType === 'games') {
      searchContainer.style.display = 'none';
      searchInput.value = '';
      renderList(tabType);
    } else if (tabType === 'search') {
      searchContainer.style.display = 'block';
      searchInput.value = '';
      searchInput.focus();
      appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Введите название для поиска...</p>';
    } else {
      searchContainer.style.display = 'none';
      appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Раздел в разработке</p>';
    }
  });
});

// Поиск в реальном времени — только если есть текст
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();

  if (query.length === 0) {
    appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Введите название для поиска...</p>';
    return;
  }

  renderSearchResults(query);
});

function renderSearchResults(query) {
  appList.innerHTML = '';

  const allItems = [...allApps, ...allGames];

  const filtered = allItems.filter(item => {
    const name = (item.название || '').toLowerCase();
    return name.includes(query.toLowerCase());
  });

  if (filtered.length === 0) {
    appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Ничего не найдено</p>';
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'app-card minimal';

    card.innerHTML = `
      <div class="app-header">
        <img src="${item.icon_url || 'https://via.placeholder.com/64?text=Icon'}" alt="${item.название}" class="app-icon">
        <h3 class="app-title">${item.название || 'Без названия'}</h3>
      </div>
      <button class="btn-open" data-id="${item.id}" data-category="${allApps.includes(item) ? 'apps' : 'games'}">Открыть</button>
    `;

    appList.appendChild(card);
  });
}

// ================== Запуск ==================
loadData();
