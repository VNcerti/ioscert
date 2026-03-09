// app.js - VIBE CODING EDITION (Giữ nguyên logic)
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
    "no-results": "Không tìm thấy ứng dụng",
    "get-btn": "NHẬN",
    "download-btn-text": "Truy cập liên kết tải về",
    "download-note": "Sau khi nhấn 'NHẬN', ứng dụng sẽ được thêm vào thư viện của bạn",
    "app-info-title": "Thông tin bổ sung",
    "app-info-description": "Vì đây là ứng dụng được ký bằng chứng chỉ doanh nghiệp nên dùng không được ổn định và lâu dài. Nếu cần sử dụng lâu dài và đảm bảo thì hãy nâng cấp gói <a href='https://chungchip12.com' class='promo-link price-tag'>chứng chỉ cá nhân tại CHUNGCHIP12.COM</a> chỉ <span class='price-tag'>69.000đ</span> cho <span class='highlight'>1 năm sử dụng</span> ESign và Chứng Chỉ riêng biệt <span class='highlight'>không lo bị thu hồi</span>.",
    "version": "Phiên bản",
    "requirements": "Yêu cầu hệ thống",
    "rating": "XẾP HẠNG",
    "developer": "NHÀ PHÁT TRIỂN",
    "size": "KÍCH THƯỚC"
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
    "no-results": "No apps found",
    "get-btn": "GET",
    "download-btn-text": "Access download link",
    "download-note": "After clicking 'GET', the app will be added to your library",
    "app-info-title": "Additional Information",
    "app-info-description": "This app is signed with an enterprise certificate, so it may not be stable and long-lasting. For long-term and guaranteed usage, upgrade to a <a href='https://chungchip12.com' class='promo-link price-tag'>personal certificate package at CHUNGCHIP12.COM</a> for only <span class='price-tag'>69,000 VND</span> for <span class='highlight'>1 year of usage</span>. Enjoy separate ESign and Certificate <span class='highlight'>without revocation worries</span>.",
    "version": "Version",
    "requirements": "System Requirements",
    "rating": "RATING",
    "developer": "DEVELOPER",
    "size": "SIZE"
  }
};

// DOM Elements
const esignList = document.getElementById('esign-list');
const certList = document.getElementById('cert-list');
const modsList = document.getElementById('mods-list');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('mods-search');
const noResults = document.getElementById('no-results');

// Modal Elements
const modal = document.getElementById('app-modal');
const modalClose = modal.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-app-title');
const modalCompany = document.getElementById('modal-app-company');
const modalIcon = document.getElementById('modal-app-icon');
const modalRating = document.getElementById('modal-rating');
const modalDeveloper = document.getElementById('modal-developer');
const modalSize = document.getElementById('modal-size');
const modalGetBtn = document.getElementById('modal-get-btn');
const modalDescription = document.getElementById('modal-description');
const modalVersion = document.getElementById('modal-version-text');
let currentItem = null;
let currentType = '';

// Developer mặc định
const DEFAULT_DEVELOPER = "Tung Lam Vu";

// Hàm mở modal (chỉ cho ESign và Mods)
function openModal(item, type) {
  currentItem = item;
  currentType = type;
  
  // Cập nhật nội dung modal
  modalTitle.textContent = item.title;
  modalCompany.textContent = item.company;
  
  console.log('Modal opened with item:', item);
  console.log('Item URL:', item.url);
  
  // Thiết lập icon
  if (type === 'esign') {
    modalIcon.src = 'https://iili.io/fdclR9a.jpg';
    modalIcon.onerror = function() {
      this.src = 'https://cdn-icons-png.flaticon.com/512/3208/3208720.png';
    };
    modalDeveloper.textContent = DEFAULT_DEVELOPER;
    modalSize.textContent = Math.random() > 0.5 ? '11.05 MB' : '8.92 MB';
    modalRating.textContent = (4.5 + Math.random() * 0.5).toFixed(1);
    modalVersion.textContent = '5.0.2';
  } else if (type === 'mods') {
    if (item.iconUrl) {
      modalIcon.src = item.iconUrl;
    } else {
      modalIcon.src = 'https://cdn-icons-png.flaticon.com/512/3095/3095583.png';
    }
    modalDeveloper.textContent = DEFAULT_DEVELOPER;
    modalSize.textContent = Math.random() > 0.5 ? '45.3 MB' : '67.8 MB';
    modalRating.textContent = (4.2 + Math.random() * 0.6).toFixed(1);
    modalVersion.textContent = item.title.includes('V2') ? '2.0' : '1.0';
  }
  
  // Cập nhật ngôn ngữ cho modal
  updateModalLanguage();
  
  // Hiển thị modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Hàm cập nhật ngôn ngữ modal
function updateModalLanguage() {
  const currentLang = localStorage.getItem('language') || 'vi';
  
  modalGetBtn.innerHTML = `<span>${translations[currentLang]['get-btn']}</span> <i class="fas fa-arrow-right"></i>`;
  
  if (modalDescription) {
    modalDescription.innerHTML = translations[currentLang]['app-info-description'];
    
    const promoLinks = modalDescription.querySelectorAll('.promo-link');
    promoLinks.forEach(link => {
      link.href = 'https://chungchip12.com';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }
  
  document.querySelectorAll('.stat-label').forEach((label, index) => {
    if (index === 0) label.textContent = translations[currentLang]['rating'];
    else if (index === 1) label.textContent = translations[currentLang]['developer'];
    else if (index === 2) label.textContent = translations[currentLang]['size'];
  });
  
  const versionTitle = document.getElementById('modal-version-title');
  const requirementsTitle = document.getElementById('modal-requirements-title');
  const infoTitle = document.getElementById('modal-info-title');
  
  if (versionTitle) versionTitle.textContent = translations[currentLang]['version'];
  if (requirementsTitle) requirementsTitle.textContent = translations[currentLang]['requirements'];
  if (infoTitle) infoTitle.textContent = translations[currentLang]['app-info-title'];
  
  const downloadNote = document.getElementById('modal-download-note');
  if (downloadNote) {
    downloadNote.textContent = translations[currentLang]['download-note'];
  }
}

// Hàm đóng modal
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  currentItem = null;
  currentType = '';
}

// Hàm xử lý download TRỰC TIẾP không popup (cho Cert)
async function handleDirectDownload(itemId, itemUrl, type) {
  const updateCounterPromise = (async () => {
    try {
      const docRef = doc(db, "downloads", itemId);
      await updateDoc(docRef, { count: increment(1) });
      
      const counterElement = document.getElementById(`counter-${itemId}`);
      if (counterElement) {
        const currentLang = localStorage.getItem('language') || 'vi';
        const docSnap = await getDoc(docRef);
        const newCount = docSnap.exists() ? docSnap.data().count : 3008;
        counterElement.innerHTML = `<span style="font-weight: bold; color: #ff6b6b;">${newCount}</span> ${translations[currentLang]['download-suffix']}`;
      }
    } catch (error) {
      console.error('Error updating counter:', error);
    }
  })();

  window.open(itemUrl, '_blank');
  await updateCounterPromise;
}

// Hàm render danh sách
function renderList(items, listElement, type) {
  listElement.innerHTML = '';
  
  items.forEach(item => {
    const appCard = document.createElement('div');
    appCard.className = 'app-card';
    appCard.dataset.type = type;
    
    let iconHTML = '';
    if (type === 'esign') {
      iconHTML = '<img src="https://iili.io/fdclR9a.jpg" alt="ESign Icon" style="width: 100%; height: 100%; border-radius: 16px; object-fit: cover;">';
    } else if (type === 'cert') {
      iconHTML = '<img src="https://iili.io/fy77l9a.jpg" alt="Certificate Icon" style="width: 100%; height: 100%; border-radius: 16px; object-fit: cover;">';
    } else if (type === 'mods') {
      if (item.iconUrl) {
        iconHTML = `<img src="${item.iconUrl}" alt="${item.title}" style="width: 100%; height: 100%; border-radius: 16px; object-fit: cover;">`;
      } else {
        iconHTML = '<i class="fas fa-cogs" style="font-size: 30px; color: var(--primary);"></i>';
      }
    }
    
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
        <div class="app-content">
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
      <button id="download-${item.id}" class="download-btn" data-type="${type}" title="Download"></button>
    `;
    
    listElement.appendChild(appCard);
    
    setupDownloadButton(`download-${item.id}`, item.id, item.url, type);
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
      counterElement.innerHTML = `<span style="font-weight: bold; color: #ff6b6b;">${count}</span> ${translations[currentLang]['download-suffix']}`;
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
function setupDownloadButton(btnId, linkId, url, type) {
  const btn = document.getElementById(btnId);
  const counterElementId = `counter-${linkId}`;
  
  let item = null;
  if (type === 'esign') item = esignItems.find(i => i.id === linkId);
  else if (type === 'cert') item = certItems.find(i => i.id === linkId);
  else if (type === 'mods') item = modsItems.find(i => i.id === linkId);
  
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const clickTime = Date.now();
    
    if (type === 'cert') {
      if (Date.now() - clickTime < 1000) {
        await handleDirectDownload(linkId, url, type);
      }
    } else {
      if (item) {
        openModal(item, type);
      }
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
        element.innerHTML = `<i class="fas fa-headset"></i> <span>${translations[lang][key] || element.textContent}</span>`;
      } else if (element.classList.contains('website-link')) {
        element.innerHTML = `<i class="fas fa-globe"></i> <span>${translations[lang][key] || element.textContent}</span>`;
      } else if (element.classList.contains('dns-link')) {
        element.innerHTML = `<i class="fas fa-shield-alt"></i> <span>${translations[lang][key] || element.textContent}</span>`;
      } else if (element.classList.contains('ipa-sign-link')) {
        element.innerHTML = `<i class="fas fa-signature"></i> <span>${translations[lang][key] || element.textContent}</span>`;
      } else if (element.classList.contains('ipa-store-link')) {
        element.innerHTML = `<i class="fas fa-box-open"></i> <span>${translations[lang][key] || element.textContent}</span>`;
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

  document.querySelectorAll('.download-count span[id^="counter-"]').forEach(counter => {
    const linkId = counter.id.replace('counter-', '');
    updateCounter(linkId, counter.id);
  });
  
  if (modal.style.display === 'block') {
    updateModalLanguage();
  }
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
        card.style.display = 'flex';
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

// Xử lý nút NHẬN trong modal
function handleModalGetButton() {
  modalGetBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (!currentItem) {
      console.error('No current item found!');
      return;
    }
    
    const downloadUrl = currentItem.url;
    
    if (downloadUrl) {
      console.log('Opening URL with window.open:', downloadUrl);
      
      (async () => {
        try {
          const docRef = doc(db, "downloads", currentItem.id);
          await updateDoc(docRef, { count: increment(1) });
        } catch (error) {
          console.error('Error updating counter:', error);
        }
      })();
      
      closeModal();
      
      setTimeout(() => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      }, 100);
      
    } else {
      console.error('No download URL found in currentItem!');
      console.log('Current item:', currentItem);
    }
  });
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  applySavedTheme();
  applySavedLanguage();
  
  initParticles();
  
  renderList(esignItems, esignList, 'esign');
  renderList(certItems, certList, 'cert');
  renderList(modsItems, modsList, 'mods');
  
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target.classList.contains('promo-link') || e.target.closest('.promo-link')) {
      e.preventDefault();
      window.open('https://chungchip12.com', '_blank', 'noopener,noreferrer');
    }
  });
  
  handleModalGetButton();
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
  
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
  
  window.addEventListener('scroll', handleScroll);
  
  // Thêm hiệu ứng cho brand logo
  document.querySelector('.brand-logo').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
