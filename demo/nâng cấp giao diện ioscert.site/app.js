// app.js - Version nâng cấp với nhiều tính năng mới
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

// Object translations (giữ nguyên như cũ)
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
const searchClear = document.querySelector('.search-clear');
const noResults = document.getElementById('no-results');
const resetSearchBtn = document.querySelector('.reset-search-btn');

// Tab elements
const tabContainer = document.querySelector('.tab-container');
const tabBtns = document.querySelectorAll('.tab-btn');

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
const modalStars = document.getElementById('modal-stars');
const modalRatingCount = document.getElementById('modal-rating-count');
let currentItem = null;
let currentType = '';

// Developer mặc định
const DEFAULT_DEVELOPER = "Tung Lam Vu";

// Cache cho counters
const counterCache = new Map();

// Hàm mở modal (chỉ cho ESign và Mods)
function openModal(item, type) {
  currentItem = item;
  currentType = type;
  
  // Cập nhật nội dung modal
  modalTitle.textContent = item.title;
  modalCompany.textContent = item.company;
  
  console.log('Modal opened with item:', item);
  
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
    modalRatingCount.textContent = `(${Math.floor(3000 + Math.random() * 2000).toLocaleString()} đánh giá)`;
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
    modalRatingCount.textContent = `(${Math.floor(1000 + Math.random() * 1000).toLocaleString()} đánh giá)`;
  }
  
  // Cập nhật sao đánh giá
  updateStars(parseFloat(modalRating.textContent));
  
  // Cập nhật ngôn ngữ cho modal
  updateModalLanguage();
  
  // Hiển thị modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Thêm animation cho modal
  modal.querySelector('.modal-content').style.animation = 'none';
  modal.querySelector('.modal-content').offsetHeight;
  modal.querySelector('.modal-content').style.animation = 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
}

// Hàm cập nhật sao đánh giá
function updateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  
  modalStars.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('i');
    if (i < fullStars) {
      star.className = 'fas fa-star';
    } else if (i === fullStars && hasHalfStar) {
      star.className = 'fas fa-star-half-alt';
    } else {
      star.className = 'far fa-star';
    }
    modalStars.appendChild(star);
  }
}

// Hàm cập nhật ngôn ngữ modal
function updateModalLanguage() {
  const currentLang = localStorage.getItem('language') || 'vi';
  
  // Cập nhật nút
  modalGetBtn.innerHTML = `<span>${translations[currentLang]['get-btn']}</span><i class="fas fa-arrow-down"></i>`;
  
  // Cập nhật mô tả
  if (modalDescription) {
    modalDescription.innerHTML = translations[currentLang]['app-info-description'];
    
    // Thêm sự kiện click cho link CHUNGCHIP12.COM
    const promoLinks = modalDescription.querySelectorAll('.promo-link');
    promoLinks.forEach(link => {
      link.href = 'https://chungchip12.com';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }
  
  // Cập nhật các label
  document.querySelectorAll('.stat-label').forEach((label, index) => {
    if (index === 0) label.textContent = translations[currentLang]['rating'];
    else if (index === 1) label.textContent = translations[currentLang]['developer'];
    else if (index === 2) label.textContent = translations[currentLang]['size'];
  });
  
  // Cập nhật version và requirements
  const versionTitle = document.getElementById('modal-version-title');
  const requirementsTitle = document.getElementById('modal-requirements-title');
  const infoTitle = document.getElementById('modal-info-title');
  
  if (versionTitle) versionTitle.innerHTML = `<i class="fas fa-code-branch"></i> ${translations[currentLang]['version']}`;
  if (requirementsTitle) requirementsTitle.innerHTML = `<i class="fas fa-mobile-alt"></i> ${translations[currentLang]['requirements']}`;
  if (infoTitle) infoTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${translations[currentLang]['app-info-title']}`;
  
  // Cập nhật download note
  const downloadNote = document.getElementById('modal-download-note');
  if (downloadNote) {
    downloadNote.innerHTML = `<i class="fas fa-info-circle"></i> ${translations[currentLang]['download-note']}`;
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
  // Hiển thị loading state
  const btn = document.getElementById(`download-${itemId}`);
  if (btn) {
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  }
  
  // Tăng counter
  try {
    const docRef = doc(db, "downloads", itemId);
    await updateDoc(docRef, { count: increment(1) });
    
    // Cập nhật counter trên trang chính
    const counterElement = document.getElementById(`counter-${itemId}`);
    if (counterElement) {
      const currentLang = localStorage.getItem('language') || 'vi';
      const docSnap = await getDoc(docRef);
      const newCount = docSnap.exists() ? docSnap.data().count : 3008;
      counterElement.innerHTML = `<span style="font-weight: bold; color: var(--primary);">${newCount.toLocaleString()}</span> ${translations[currentLang]['download-suffix']}`;
    }
  } catch (error) {
    console.error('Error updating counter:', error);
  }
  
  // Mở URL
  window.open(itemUrl, '_blank', 'noopener,noreferrer');
  
  // Reset button sau 1 giây
  setTimeout(() => {
    if (btn) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  }, 1000);
}

// Hàm render danh sách với animation
function renderList(items, listElement, type) {
  listElement.innerHTML = '';
  
  // Thêm skeleton loading
  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'app-card skeleton';
    listElement.appendChild(skeleton);
  }
  
  // Render thực tế sau 300ms
  setTimeout(() => {
    listElement.innerHTML = '';
    
    items.forEach((item, index) => {
      const appCard = document.createElement('div');
      appCard.className = 'app-card';
      appCard.dataset.type = type;
      appCard.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
      
      // Thiết lập icon dựa trên type
      let iconHTML = '';
      if (type === 'esign') {
        iconHTML = '<img src="https://iili.io/fdclR9a.jpg" alt="ESign Icon" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">';
      } else if (type === 'cert') {
        iconHTML = '<img src="https://iili.io/fy77l9a.jpg" alt="Certificate Icon" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">';
      } else if (type === 'mods') {
        if (item.iconUrl) {
          iconHTML = `<img src="${item.iconUrl}" alt="${item.title}" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">`;
        } else {
          iconHTML = '<i class="fas fa-cogs"></i>';
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
              <span id="counter-${item.id}">Đang tải...</span>
            </div>
          </div>
        </div>
        <button id="download-${item.id}" class="download-btn" data-type="${type}" title="Download"></button>
      `;
      
      listElement.appendChild(appCard);
      
      // Setup download button
      setupDownloadButton(`download-${item.id}`, item.id, item.url, type);
    });
  }, 300);
}

// Hàm hiển thị số lượt tải
async function updateCounter(linkId, elementId) {
  try {
    // Kiểm tra cache trước
    if (counterCache.has(linkId)) {
      const cachedData = counterCache.get(linkId);
      const counterElement = document.getElementById(elementId);
      if (counterElement) {
        const currentLang = localStorage.getItem('language') || 'vi';
        counterElement.innerHTML = `<span style="font-weight: bold; color: var(--primary);">${cachedData.count.toLocaleString()}</span> ${translations[currentLang]['download-suffix']}`;
      }
      return;
    }
    
    const docRef = doc(db, "downloads", linkId);
    const docSnap = await getDoc(docRef);
    let count = 0;
    
    if (docSnap.exists()) {
      count = docSnap.data().count;
    } else {
      await setDoc(docRef, { count: 3007 });
      count = 3007;
    }
    
    // Lưu vào cache
    counterCache.set(linkId, { count, timestamp: Date.now() });
    
    const counterElement = document.getElementById(elementId);
    if (counterElement) {
      const currentLang = localStorage.getItem('language') || 'vi';
      counterElement.innerHTML = `<span style="font-weight: bold; color: var(--primary);">${count.toLocaleString()}</span> ${translations[currentLang]['download-suffix']}`;
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
  
  // Tìm item tương ứng
  let item = null;
  if (type === 'esign') item = esignItems.find(i => i.id === linkId);
  else if (type === 'cert') item = certItems.find(i => i.id === linkId);
  else if (type === 'mods') item = modsItems.find(i => i.id === linkId);
  
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Thêm hiệu ứng click
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 200);
    
    // XỬ LÝ KHÁC NHAU:
    if (type === 'cert') {
      // CERT - Download TRỰC TIẾP
      await handleDirectDownload(linkId, url, type);
    } else {
      // ESign & Mods - Mở modal
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
      } else if (element.classList.contains('support-link') || 
                 element.classList.contains('website-link') || 
                 element.classList.contains('dns-link') || 
                 element.classList.contains('ipa-sign-link') || 
                 element.classList.contains('ipa-store-link')) {
        const icon = element.querySelector('i');
        const arrow = element.querySelector('.fa-arrow-right');
        if (icon && arrow) {
          element.innerHTML = '';
          element.appendChild(icon.cloneNode(true));
          element.appendChild(document.createElement('span')).textContent = translations[lang][key] || '';
          element.appendChild(arrow.cloneNode(true));
        } else {
          element.textContent = translations[lang][key] || element.textContent;
        }
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
  
  localStorage.setItem('language', lang);

  // Update all counters with new language
  document.querySelectorAll('.download-count span[id^="counter-"]').forEach(counter => {
    const linkId = counter.id.replace('counter-', '');
    updateCounter(linkId, counter.id);
  });
  
  // Cập nhật ngôn ngữ trong modal nếu đang mở
  if (modal.style.display === 'block') {
    updateModalLanguage();
  }
}

// Hàm chuyển đổi theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  localStorage.setItem('theme', newTheme);
  updateParticlesTheme();
  
  // Cập nhật particles
  if (window.pJSDom && window.pJSDom.length > 0) {
    const pJS = window.pJSDom[0].pJS;
    pJS.particles.color.value = newTheme === 'dark' ? '#ffffff' : '#000000';
    pJS.particles.line_linked.color = newTheme === 'dark' ? '#ffffff' : '#000000';
    pJS.fn.particlesRefresh();
  }
}

// Hàm chuyển đổi tab
function showList(type) {
  try {
    esignList.classList.toggle('hidden', type !== 'esign');
    certList.classList.toggle('hidden', type !== 'cert');
    modsList.classList.toggle('hidden', type !== 'mods');
    searchContainer.classList.toggle('hidden', type !== 'mods');

    tabBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${type}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // Cập nhật indicator
    tabContainer.dataset.active = type;

    if (type === 'mods') {
      searchInput.value = '';
      searchClear.classList.add('hidden');
      filterMods();
    }
  } catch (error) {
    console.error('Error in showList:', error.message);
  }
}

// Hàm lọc mods với debounce
let searchTimeout;
function filterMods() {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    const input = searchInput.value.toLowerCase().trim();
    const cards = modsList.querySelectorAll('.app-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector('.app-title').textContent.toLowerCase();
      if (input === '' || title.includes(input)) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 10);
        visibleCount++;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });

    // Hiển thị/ẩn nút clear
    if (input) {
      searchClear.classList.remove('hidden');
    } else {
      searchClear.classList.add('hidden');
    }

    if (visibleCount === 0) {
      noResults.classList.remove('hidden');
      resetSearchBtn.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
      resetSearchBtn.classList.add('hidden');
    }
  }, 300);
}

// Hàm reset search
function resetSearch() {
  searchInput.value = '';
  searchClear.classList.add('hidden');
  filterMods();
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function applySavedLanguage() {
  const savedLang = localStorage.getItem('language') || 'vi';
  setLanguage(savedLang);
}

// Scroll handler cho header
let lastScrollTop = 0;
const header = document.querySelector('.top-header');
let scrollTimeout;

function handleScroll() {
  clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      header.classList.add('hidden');
    } else if (scrollTop < lastScrollTop && scrollTop <= 200) {
      header.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
  }, 50);
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
      console.log('Opening URL:', downloadUrl);
      
      // Thêm hiệu ứng loading
      modalGetBtn.style.opacity = '0.5';
      modalGetBtn.style.pointerEvents = 'none';
      modalGetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
      
      // Tăng counter
      (async () => {
        try {
          const docRef = doc(db, "downloads", currentItem.id);
          await updateDoc(docRef, { count: increment(1) });
        } catch (error) {
          console.error('Error updating counter:', error);
        }
      })();
      
      // Đóng modal sau 300ms
      setTimeout(() => {
        closeModal();
        
        // Mở URL
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        
        // Reset button
        modalGetBtn.style.opacity = '1';
        modalGetBtn.style.pointerEvents = 'auto';
        const currentLang = localStorage.getItem('language') || 'vi';
        modalGetBtn.innerHTML = `<span>${translations[currentLang]['get-btn']}</span><i class="fas fa-arrow-down"></i>`;
      }, 300);
      
    } else {
      console.error('No download URL found!');
    }
  });
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
  
  // Event listeners for modal
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Xử lý click vào link CHUNGCHIP12.COM
  modal.addEventListener('click', function(e) {
    if (e.target.classList.contains('promo-link') || e.target.closest('.promo-link')) {
      e.preventDefault();
      window.open('https://chungchip12.com', '_blank', 'noopener,noreferrer');
    }
  });
  
  // Thiết lập xử lý cho nút NHẬN
  handleModalGetButton();
  
  // Đóng modal với phím ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
  
  // Event listeners cho các nút chức năng
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });

  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
  
  tabBtns.forEach(btn => {
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
  
  if (searchClear) {
    searchClear.addEventListener('click', resetSearch);
  }
  
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', resetSearch);
  }
  
  // Scroll handler
  window.addEventListener('scroll', handleScroll);
  
  // Thêm hiệu ứng cho các link
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function(e) {
      // Thêm hiệu ứng nhẹ khi click
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);
    });
  });
  
  // Cache counters mỗi 5 phút
  setInterval(() => {
    counterCache.clear();
    document.querySelectorAll('.download-count span[id^="counter-"]').forEach(counter => {
      const linkId = counter.id.replace('counter-', '');
      updateCounter(linkId, counter.id);
    });
  }, 300000);
  
  // Welcome message
  console.log('🚀 Vietnam Cert Hub - Phiên bản nâng cấp với vibe coding!');
  console.log('✨ Chúc bạn có trải nghiệm tuyệt vời!');
});