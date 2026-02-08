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

// ================== Глобальное состояние ==================
let allApps = [];

// ================== Функции ==================
function loadApps() {
  db.collection('apps').get()
    .then((querySnapshot) => {
      loading.style.display = 'none';

      if (querySnapshot.empty) {
        appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Приложений пока нет</p>';
        return;
      }

      allApps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // По умолчанию показываем вкладку "Apps"
      renderApps('apps');
    })
    .catch(error => {
      console.error("Ошибка загрузки приложений:", error);
      loading.innerHTML = 'Ошибка загрузки. Проверь консоль.';
      loading.style.color = '#ff6b6b';
    });
}

function renderApps(category) {
  appList.innerHTML = '';

  const filtered = allApps.filter(app => {
    const cat = (app.категория || '').toLowerCase();
    if (category === 'apps') return cat.includes('приложени') || !cat.includes('game');
    if (category === 'games') return cat.includes('game') || cat.includes('игры');
    return true;
  });

  if (filtered.length === 0) {
    appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Ничего не найдено</p>';
    return;
  }

  filtered.forEach(app => {
    const card = document.createElement('div');
    card.className = 'app-card minimal';

    card.innerHTML = `
      <div class="app-header">
        <img src="${app.icon_url || 'https://via.placeholder.com/64?text=Icon'}" alt="${app.название}" class="app-icon">
        <h3 class="app-title">${app.название || 'Без названия'}</h3>
      </div>
      <button class="btn-open" data-app-id="${app.id}">Открыть</button>
    `;

    appList.appendChild(card);
  });
}

function openModal(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('modalIcon').src = app.icon_url || 'https://via.placeholder.com/128?text=Icon';
  document.getElementById('modalTitle').textContent = app.название || 'Без названия';
  document.getElementById('modalFeatures').textContent = app.функции || 'Нет дополнительной информации';
  document.getElementById('modalDownloadBtn').href = app.download_url || '#';

  modal.style.display = 'flex';
}

// ================== События ==================
appList.addEventListener('click', e => {
  if (e.target.classList.contains('btn-open')) {
    const appId = e.target.dataset.appId;
    openModal(appId);
  }
});

closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();

    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabType = tab.dataset.tab;

    if (tabType === 'apps' || tabType === 'games') {
      renderApps(tabType);
    } else {
      appList.innerHTML = '<p style="text-align:center; color:#bfdbfe; padding:40px;">Раздел в разработке</p>';
    }
  });
});

// ================== Запуск ==================
loadApps();
