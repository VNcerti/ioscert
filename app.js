// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { esignItems } from "./data/esign-data.js";
import { certItems } from "./data/cert-data.js";
import { modsItems } from "./data/mods-data.js";
import { initParticles, updateParticlesTheme } from "./components/particles-config.js";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Object translations
const translations = {
  vi: {
    title: "APPLE CERTIFICATE.",
    subtitle: "Chia sẻ chứng chỉ ESign iPhone/iPad và các file iPAs mod",
    support: "Liên Hệ Hỗ Trợ 24/7",
    website: "Website Bán Chứng Chỉ Tự Động",
    dns: "DNS Chặn Thu Hồi và Quảng Cáo",
    "ipa-sign": "Ký IPA Trực Tuyến",
    "ipa-store": "Kho Ứng Dụng iPA MOD",
    contact: "Liên hệ: ",
    copyright: "Bản quyền © 2022 CHUNGCHIP12.COM. Bảo lưu mọi quyền.",
    beijing: "Beijing",
    "china-railway": "China Railway",
    "dtt-technology": "Dtt Technology",
    "tcl-household": "TCL Household",
    "wuling-power": "Wuling Power",
    "vietnamcert-01": "VietNamCert.01",
    "national-science-library": "National Science Library",
    "Nhân bản app": "Nhân bản và nhiều tính năng VIP ",
    youtube: "Mở khoá tính năng Premium",
    "mods-placeholder": "Mods Placeholder",
    "download-suffix": "lượt cài đặt thành công",
    "search-placeholder": "Tìm kiếm ứng dụng...",
    "no-results": "Không tìm thấy ứng dụng"
  },
  en: {
    title: "APPLE CERTIFICATE.",
    subtitle: "Website share ESign/Certificate on iPhone/iPad With Anti-Revoke",
    support: "Contact Support 24/7",
    website: "Automatic Certificate Sales Website",
    dns: "DNS for Anti-Revoke and Ads Block ",
    "ipa-sign": "Online IPA Signing",
    "ipa-store": "iPA MOD Apps Store",
    contact: "Contact me: ",
    copyright: "Copyright © 2022 CHUNGCHIP12.COM. All rights reserved.",
    beijing: "Beijing",
    "china-railway": "China Railway",
    "dtt-technology": "Dtt Technology",
    "tcl-household": "TCL Household",
    "wuling-power": "Wuling Power",
    "vietnamcert-01": "VietNamCert.01",
    "national-science-library": "National Science Library",
    "Nhân bản app": "Clone apps and unlock exclusive VIP features ",
    youtube: "Unlock Premium Mods",
    "mods-placeholder": "Mods Placeholder",
    "download-suffix": "successful installations",
    "search-placeholder": "Search for apps...",
    "no-results": "No apps found"
  }
};

// DOM Elements
const esignList = document.getElementById('esign-list');
const certList = document.getElementById('cert-list');
const modsList = document.getElementById('mods-list');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('mods-search');
const noResults = document.getElementById('no-results');

// Hàm render danh sách
function renderList(items, listElement, type) {
  listElement.innerHTML = '';
  
  items.forEach(item => {
    const appCard = document.createElement('div');
    appCard.className = 'app-card';
    
    const iconHTML = item.iconUrl 
      ? `<img src="${item.iconUrl}" alt="${item.title}" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">`
      : `<i class="${item.icon}"></i>`;
    
    const badgeHTML = item.badge 
      ? '<img src="https://i.imgur.com/75R0Rgw.png" alt="NEW" class="new-badge">'
      : '';
    
    const statusDotHTML = item.statusDot 
      ? '<span class="status-dot"></span>'
      : '';
    
    appCard.innerHTML = `
      <div class="app-header">
        <div class="app-icon">
          ${iconHTML}
          ${badgeHTML}
        </div>
        <div>
          <div class="app-title">
            ${item.title}
            ${statusDotHTML}
          </div>
          <div class="app-meta">
            <i class="fas fa-map-marker-alt"></i> ${item.company}
          </div>
          <div class="download-count">
            <i class="fas fa-user"></i>
            <span id="counter-${item.id}">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
      <a id="download-${item.id}" class="download-btn" href="#">
        ${type === 'mods' && item.title.includes('Key') ? 'Get Key' : 'Download'} <i class="fas fa-download"></i>
      </a>
    `;
    
    listElement.appendChild(appCard);
    
    // Setup download button
    setupDownloadButton(`download-${item.id}`, item.id, item.url);
  });
}

// Hàm hiển thị số lượt tải
async function updateCounter(linkId, elementId) {
  try {
    const docRef = doc(db, "downloads", linkId);
    const docSnap = await getDoc(docRef);
    let count = 0;
    if (docSnap.exists()) {
      count = docSnap.data().count;
    } else {
      await setDoc(docRef, { count: 3007 });
      count = 3007;
    }
    const counterElement = document.getElementById(elementId);
    if (counterElement) {
      const currentLang = localStorage.getItem('language') || 'vi';
      counterElement.innerHTML = `<span style="font-weight: bold; color:#e63946;">${count}</span> ${translations[currentLang]['download-suffix']}`;
    }
  } catch (error) {
    console.error(`Error updating counter for ${linkId}:`, error);
    const counterElement = document.getElementById(elementId);
    if (counterElement) {
      counterElement.textContent = `Lỗi: ${error.message}`;
    }
  }
}

// Hàm xử lý sự kiện click download
function setupDownloadButton(btnId, linkId, url) {
  const btn = document.getElementById(btnId);
  const counterElementId = `counter-${linkId}`;
  btn.href = url;
  btn.setAttribute('target', '_blank');
  btn.setAttribute('rel', 'noopener noreferrer');
  btn.addEventListener("click", async (e) => {
    try {
      const docRef = doc(db, "downloads", linkId);
      await updateDoc(docRef, { count: increment(1) });
      await updateCounter(linkId, counterElementId);
    } catch (error) {
      console.error(`Error on download click for ${linkId}:`, error);
    }
  });
  updateCounter(linkId, counterElementId);
}

// Hàm thiết lập ngôn ngữ
function setLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key !== "esign" && key !== "cert" && key !== "mods" && !element.classList.contains('download-btn')) {
      if (key === 'contact') {
        const link = element.querySelector('a');
        if (link) {
          element.innerHTML = translations[lang][key] + link.outerHTML;
        } else {
          element.textContent = translations[lang][key] || element.textContent;
        }
      } else if (element.classList.contains('app-meta')) {
        element.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('support-link')) {
        element.innerHTML = `<i class="fas fa-headset"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('website-link')) {
        element.innerHTML = `<i class="fas fa-globe"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('dns-link')) {
        element.innerHTML = `<i class="fas fa-shield-alt"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('ipa-sign-link')) {
        element.innerHTML = `<i class="fas fa-signature"></i> ${translations[lang][key] || element.textContent}`;
      } else if (element.classList.contains('ipa-store-link')) {
        element.innerHTML = `<i class="fas fa-box-open"></i> ${translations[lang][key] || element.textContent}`;
      } else {
        element.textContent = translations[lang][key] || element.textContent;
      }
    }
  });

  if (searchInput) {
    searchInput.placeholder = translations[lang]['search-placeholder'];
  }

  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add('active');
  document.documentElement.lang = lang;
  
  saveSettings('language', lang);

  // Update all counters with new language
  document.querySelectorAll('.download-count span[id^="counter-"]').forEach(counter => {
    const linkId = counter.id.replace('counter-', '');
    updateCounter(linkId, counter.id);
  });
}

// Hàm chuyển đổi theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  document.querySelector('.theme-toggle i').className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  
  saveSettings('theme', newTheme);
  updateParticlesTheme();
}

// Hàm chuyển đổi tab
function showList(type) {
  try {
    esignList.classList.toggle('hidden', type !== 'esign');
    certList.classList.toggle('hidden', type !== 'cert');
    modsList.classList.toggle('hidden', type !== 'mods');
    searchContainer.classList.toggle('hidden', type !== 'mods');

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${type}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    if (type === 'mods') {
      searchInput.value = '';
      filterMods();
    }
  } catch (error) {
    console.error('Error in showList:', error.message);
  }
}

// Hàm lọc mods
function filterMods() {
  const input = searchInput.value.toLowerCase().trim();
  const cards = modsList.querySelectorAll('.app-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const title = card.querySelector('.app-title').textContent.toLowerCase();
    if (input === '' || title.includes(input)) {
      if (card.style.display === 'none' || card.style.display === '') {
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 10);
      } else {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
      visibleCount++;
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.display = 'none';
      }, 300);
    }
  });

  if (visibleCount === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
  }
}

// Helper functions
function saveSettings(key, value) {
  localStorage.setItem(key, value);
}

function getSetting(key) {
  return localStorage.getItem(key);
}

function applySavedTheme() {
  const savedTheme = getSetting('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.querySelector('.theme-toggle i').className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function applySavedLanguage() {
  const savedLang = getSetting('language') || 'vi';
  setLanguage(savedLang);
}

// Scroll handler for header
let lastScrollTop = 0;
const header = document.querySelector('.top-header');
function handleScroll() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop && scrollTop > 200) {
    header.classList.add('hidden');
  } else if (scrollTop < lastScrollTop && scrollTop <= 200) {
    header.classList.remove('hidden');
  }
  lastScrollTop = scrollTop;
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  // Apply saved settings
  applySavedTheme();
  applySavedLanguage();
  
  // Initialize particles
  initParticles();
  
  // Render lists
  renderList(esignItems, esignList, 'esign');
  renderList(certItems, certList, 'cert');
  renderList(modsItems, modsList, 'mods');
  
  // Event listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });

  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabType = btn.getAttribute('data-tab');
      if (tabType) {
        showList(tabType);
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterMods);
  }
  
  // Scroll handler
  window.addEventListener('scroll', handleScroll);
});