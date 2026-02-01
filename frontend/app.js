/* ============================================
   AUTOPRIME - MAIN APPLICATION JAVASCRIPT
   ============================================ */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : `${window.location.protocol}//${window.location.host}/api`;

// State Management
const state = {
  user: null,
  token: localStorage.getItem('token'),
  cars: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  filters: {
    brand: '',
    transmission: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show toast notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;
  
  container.appendChild(toast);
  
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => toast.remove());
  
  setTimeout(() => toast.remove(), 5000);
}

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get initials from name
function getInitials(firstName, lastName) {
  const f = firstName ? firstName[0] : '';
  const l = lastName ? lastName[0] : '';
  return (f + l).toUpperCase() || 'U';
}

// Get car emoji based on fuel type
function getCarEmoji(fuelType, brand) {
  const brandEmojis = {
    'Tesla': '⚡',
    'BMW': '🚘',
    'Mercedes': '🚙',
    'Porsche': '🏎️',
    'Ferrari': '🏎️',
    'Lamborghini': '🏎️'
  };
  
  const fuelEmojis = {
    'electric': '⚡',
    'hybrid': '🔋',
    'diesel': '🚗',
    'petrol': '🚙'
  };
  
  return brandEmojis[brand] || fuelEmojis[fuelType] || '🚗';
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION
// ============================================

// Check if user is logged in
async function checkAuth() {
  if (!state.token) {
    updateUIForGuest();
    return;
  }
  
  try {
    const data = await apiRequest('/users/profile');
    state.user = data.user;
    updateUIForUser();
  } catch (error) {
    console.error('Auth check failed:', error);
    logout();
  }
}

// Login
async function login(email, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    
    closeModal();
    updateUIForUser();
    showToast('Welcome back! You are now signed in.', 'success');
  } catch (error) {
    showToast(error.message || 'Login failed. Please check your credentials.', 'error');
  }
}

// Register
async function register(userData) {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    
    closeModal();
    updateUIForUser();
    showToast('Account created successfully! Welcome to AutoPrime.', 'success');
  } catch (error) {
    showToast(error.message || 'Registration failed. Please try again.', 'error');
  }
}

// Logout
function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  updateUIForGuest();
  hideProfileSection();
  showToast('You have been signed out.', 'info');
}

// Update UI for logged in user
function updateUIForUser() {
  const navActions = document.querySelector('.nav-actions');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userDropdown = document.getElementById('userDropdown');
  const loginPrompt = document.getElementById('loginPrompt');
  const createCarForm = document.getElementById('createCarForm');
  
  if (state.user) {
    const initials = getInitials(state.user.firstName, state.user.lastName);
    
    // Update nav actions
    loginBtn.style.display = 'none';
    registerBtn.innerHTML = `<span class="user-avatar-small">${initials}</span> ${state.user.username || state.user.firstName}`;
    registerBtn.onclick = toggleUserDropdown;
    
    // Update user dropdown
    document.getElementById('userAvatar').textContent = initials;
    document.getElementById('userName').textContent = `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || state.user.username;
    document.getElementById('userEmail').textContent = state.user.email;
    
    // Show car form, hide login prompt
    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (createCarForm) createCarForm.classList.remove('hidden');
  }
}

// Update UI for guest
function updateUIForGuest() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userDropdown = document.getElementById('userDropdown');
  const loginPrompt = document.getElementById('loginPrompt');
  const createCarForm = document.getElementById('createCarForm');
  
  loginBtn.style.display = 'inline-flex';
  loginBtn.onclick = () => openModal('login');
  
  registerBtn.innerHTML = 'Get Started';
  registerBtn.onclick = () => openModal('register');
  
  userDropdown.classList.remove('active');
  
  if (loginPrompt) loginPrompt.classList.remove('hidden');
  if (createCarForm) createCarForm.classList.add('hidden');
}

// Toggle user dropdown
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('active');
}

// ============================================
// MODAL HANDLING
// ============================================

function openModal(type) {
  const modal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  modal.classList.add('active');
  
  if (type === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('active');
}

// ============================================
// CAR LISTINGS
// ============================================

// Fetch cars
async function fetchCars() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const carsGrid = document.getElementById('carsGrid');
  
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  try {
    const params = new URLSearchParams();
    params.append('page', state.pagination.page);
    params.append('limit', state.pagination.limit);
    
    if (state.filters.brand) params.append('brand', state.filters.brand);
    if (state.filters.transmission) params.append('transmission', state.filters.transmission);
    if (state.filters.fuelType) params.append('fuelType', state.filters.fuelType);
    if (state.filters.minPrice) params.append('minPrice', state.filters.minPrice);
    if (state.filters.maxPrice) params.append('maxPrice', state.filters.maxPrice);
    if (state.filters.search) params.append('search', state.filters.search);
    
    const data = await apiRequest(`/cars?${params.toString()}`);
    
    state.cars = data.cars || [];
    state.pagination = data.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
    
    renderCars();
    renderPagination();
  } catch (error) {
    showToast('Failed to load cars. Please try again.', 'error');
  } finally {
    loadingState.classList.add('hidden');
  }
}

// Render car cards
function renderCars() {
  const carsGrid = document.getElementById('carsGrid');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  
  // Remove loading state but keep it in DOM
  loadingState.classList.add('hidden');
  
  if (state.cars.length === 0) {
    emptyState.classList.remove('hidden');
    // Clear existing cards except loading and empty state
    Array.from(carsGrid.children).forEach(child => {
      if (!child.classList.contains('loading-state') && !child.classList.contains('empty-state')) {
        child.remove();
      }
    });
    return;
  }
  
  emptyState.classList.add('hidden');
  
  // Clear existing car cards
  Array.from(carsGrid.children).forEach(child => {
    if (!child.classList.contains('loading-state') && !child.classList.contains('empty-state')) {
      child.remove();
    }
  });
  
  state.cars.forEach(car => {
    const card = createCarCard(car);
    carsGrid.insertBefore(card, loadingState);
  });
}

// Create car card element
function createCarCard(car) {
  const card = document.createElement('div');
  card.className = 'car-card';
  card.onclick = () => openCarDetail(car._id);
  
  const emoji = getCarEmoji(car.fuelType, car.brand);
  const statusClass = car.status || 'available';
  
  card.innerHTML = `
    <div class="car-image">
      ${emoji}
      <span class="car-status ${statusClass}">${statusClass}</span>
    </div>
    <div class="car-content">
      <h3 class="car-title">${car.title}</h3>
      <div class="car-price">${formatPrice(car.price)}</div>
      <div class="car-specs">
        <span class="car-spec">📅 ${car.year}</span>
        <span class="car-spec">⚙️ ${car.transmission || 'Auto'}</span>
        <span class="car-spec">⛽ ${car.fuelType || 'Petrol'}</span>
        <span class="car-spec">📏 ${car.mileage?.toLocaleString() || 0} km</span>
      </div>
      <div class="car-meta">
        <span class="car-location">
          📍 ${car.location?.city || 'Unknown'}, ${car.location?.country || ''}
        </span>
        <span class="car-views">👁️ ${car.views || 0}</span>
      </div>
    </div>
  `;
  
  return card;
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById('pagination');
  const { page, pages } = state.pagination;
  
  if (pages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Previous button
  html += `<button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">←</button>`;
  
  // Page numbers
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(pages, page + 2);
  
  if (startPage > 1) {
    html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  
  if (endPage < pages) {
    if (endPage < pages - 1) html += `<span class="page-ellipsis">...</span>`;
    html += `<button class="page-btn" onclick="changePage(${pages})">${pages}</button>`;
  }
  
  // Next button
  html += `<button class="page-btn" ${page === pages ? 'disabled' : ''} onclick="changePage(${page + 1})">→</button>`;
  
  pagination.innerHTML = html;
}

// Change page
function changePage(page) {
  state.pagination.page = page;
  fetchCars();
  
  // Scroll to cars section
  document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
}

// Open car detail modal
async function openCarDetail(carId) {
  const modal = document.getElementById('carDetailModal');
  const content = document.getElementById('carDetailContent');
  
  modal.classList.add('active');
  content.innerHTML = '<div class="loading-state"><div class="loader"></div><p>Loading car details...</p></div>';
  
  try {
    const data = await apiRequest(`/cars/${carId}`);
    const car = data.car;
    
    const emoji = getCarEmoji(car.fuelType, car.brand);
    const ownerInitials = getInitials(car.owner?.firstName, car.owner?.lastName);
    
    content.innerHTML = `
      <div class="car-detail-image">${emoji}</div>
      <div class="car-detail-info">
        <h2>${car.title}</h2>
        <div class="car-detail-price">${formatPrice(car.price)}</div>
        
        <div class="car-detail-specs">
          <div class="detail-spec">
            <span class="detail-spec-label">Brand</span>
            <span class="detail-spec-value">${car.brand}</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Model</span>
            <span class="detail-spec-value">${car.model}</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Year</span>
            <span class="detail-spec-value">${car.year}</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Mileage</span>
            <span class="detail-spec-value">${car.mileage?.toLocaleString()} km</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Transmission</span>
            <span class="detail-spec-value">${car.transmission}</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Fuel Type</span>
            <span class="detail-spec-value">${car.fuelType}</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Color</span>
            <span class="detail-spec-value">${car.color || 'N/A'}</span>
          </div>
          <div class="detail-spec">
            <span class="detail-spec-label">Status</span>
            <span class="detail-spec-value" style="text-transform: capitalize">${car.status}</span>
          </div>
        </div>
        
        <div class="car-detail-description">
          <h4>Description</h4>
          <p>${car.description}</p>
        </div>
        
        ${car.features && car.features.length > 0 ? `
          <div class="car-detail-features">
            <h4>Features</h4>
            <div class="features-list">
              ${car.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="car-detail-owner">
          <div class="owner-avatar">${ownerInitials}</div>
          <div class="owner-info">
            <h5>${car.owner?.username || 'Seller'}</h5>
            <span>Listed on ${formatDate(car.createdAt)}</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    content.innerHTML = '<div class="empty-state"><span class="empty-icon">❌</span><h3>Failed to load car details</h3></div>';
  }
}

// Close car detail modal
function closeCarDetailModal() {
  const modal = document.getElementById('carDetailModal');
  modal.classList.remove('active');
}

// Create car listing
async function createCarListing(carData) {
  try {
    const data = await apiRequest('/cars', {
      method: 'POST',
      body: JSON.stringify(carData)
    });
    
    showToast('Car listing created successfully!', 'success');
    
    // Reset form
    document.getElementById('createCarForm').reset();
    
    // Refresh cars list
    fetchCars();
    
    // Scroll to cars section
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    showToast(error.message || 'Failed to create listing. Please try again.', 'error');
  }
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

function showProfileSection() {
  const profileSection = document.getElementById('profileSection');
  const sellSection = document.getElementById('sell');
  
  profileSection.classList.remove('hidden');
  sellSection.classList.add('hidden');
  
  updateProfileDisplay();
  fetchUserListings();
  
  // Scroll to profile
  profileSection.scrollIntoView({ behavior: 'smooth' });
}

function hideProfileSection() {
  const profileSection = document.getElementById('profileSection');
  const sellSection = document.getElementById('sell');
  
  profileSection.classList.add('hidden');
  sellSection.classList.remove('hidden');
}

function updateProfileDisplay() {
  if (!state.user) return;
  
  const initials = getInitials(state.user.firstName, state.user.lastName);
  const fullName = `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || state.user.username;
  
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent = fullName;
  document.getElementById('profileRole').textContent = state.user.role || 'user';
  document.getElementById('profileEmail').textContent = state.user.email;
  document.getElementById('profilePhone').textContent = state.user.phone || 'Not provided';
  document.getElementById('profileUsername').textContent = state.user.username;
  document.getElementById('profileSince').textContent = formatDate(state.user.createdAt);
  
  // Pre-fill edit form
  document.getElementById('editFirstName').value = state.user.firstName || '';
  document.getElementById('editLastName').value = state.user.lastName || '';
  document.getElementById('editPhone').value = state.user.phone || '';
  document.getElementById('editCity').value = state.user.address?.city || '';
  document.getElementById('editCountry').value = state.user.address?.country || '';
}

async function fetchUserListings() {
  const grid = document.getElementById('myListingsGrid');
  grid.innerHTML = '<div class="loading-state"><div class="loader"></div><p>Loading your listings...</p></div>';
  
  try {
    const data = await apiRequest('/cars/user/listings');
    const cars = data.cars || [];
    
    if (cars.length === 0) {
      grid.innerHTML = '<div class="empty-state"><span class="empty-icon">🚗</span><h3>No listings yet</h3><p>Create your first car listing to get started!</p></div>';
      return;
    }
    
    grid.innerHTML = '';
    cars.forEach(car => {
      const card = createCarCard(car);
      grid.appendChild(card);
    });
  } catch (error) {
    grid.innerHTML = '<div class="empty-state"><span class="empty-icon">❌</span><h3>Failed to load listings</h3></div>';
  }
}

async function updateProfile(profileData) {
  try {
    const data = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    state.user = data.user;
    updateProfileDisplay();
    updateUIForUser();
    
    document.getElementById('editProfileCard').classList.add('hidden');
    showToast('Profile updated successfully!', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to update profile.', 'error');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuth();
  
  // Fetch initial cars
  fetchCars();
  
  // Animate stats on load
  animateStats();
  
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Modal close button
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Auth form switches
  document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
  });
  
  document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
  });
  
  // Login form submit
  document.getElementById('loginFormSubmit').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
  });
  
  // Register form submit
  document.getElementById('registerFormSubmit').addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = {
      username: document.getElementById('regUsername').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
      confirmPassword: document.getElementById('regConfirmPassword').value
    };
    
    // Only add optional fields if they have values
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (phone) userData.phone = phone;
    
    register(userData);
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
  
  // View profile
  document.getElementById('viewProfile').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('userDropdown').classList.remove('active');
    showProfileSection();
  });
  
  // My listings
  document.getElementById('myListings').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('userDropdown').classList.remove('active');
    showProfileSection();
    document.getElementById('myListingsSection').scrollIntoView({ behavior: 'smooth' });
  });
  
  // Edit profile
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('editProfileCard').classList.toggle('hidden');
  });
  
  document.getElementById('cancelEditProfile').addEventListener('click', () => {
    document.getElementById('editProfileCard').classList.add('hidden');
  });
  
  // Edit profile form submit
  document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const profileData = {
      firstName: document.getElementById('editFirstName').value,
      lastName: document.getElementById('editLastName').value,
      phone: document.getElementById('editPhone').value,
      address: {
        city: document.getElementById('editCity').value,
        country: document.getElementById('editCountry').value
      }
    };
    updateProfile(profileData);
  });
  
  // Add new listing button (in profile)
  document.getElementById('addNewListingBtn').addEventListener('click', () => {
    hideProfileSection();
    document.getElementById('sell').scrollIntoView({ behavior: 'smooth' });
  });
  
  // Login to sell link
  document.getElementById('loginToSell').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('login');
  });
  
  // Car detail modal close
  document.getElementById('carDetailClose').addEventListener('click', closeCarDetailModal);
  document.getElementById('carDetailModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCarDetailModal();
  });
  
  // Hero search
  document.getElementById('heroSearchBtn').addEventListener('click', () => {
    const search = document.getElementById('heroSearch').value;
    state.filters.search = search;
    state.pagination.page = 1;
    fetchCars();
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
  });
  
  document.getElementById('heroSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('heroSearchBtn').click();
    }
  });
  
  // Search tags
  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const brand = tag.dataset.brand;
      state.filters.brand = brand;
      document.getElementById('filterBrand').value = brand;
      state.pagination.page = 1;
      fetchCars();
      document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Filters
  document.getElementById('applyFilters').addEventListener('click', () => {
    state.filters.brand = document.getElementById('filterBrand').value;
    state.filters.transmission = document.getElementById('filterTransmission').value;
    state.filters.fuelType = document.getElementById('filterFuel').value;
    state.filters.minPrice = document.getElementById('minPrice').value;
    state.filters.maxPrice = document.getElementById('maxPrice').value;
    state.pagination.page = 1;
    fetchCars();
  });
  
  document.getElementById('clearFilters').addEventListener('click', () => {
    state.filters = { brand: '', transmission: '', fuelType: '', minPrice: '', maxPrice: '', search: '' };
    document.getElementById('filterBrand').value = '';
    document.getElementById('filterTransmission').value = '';
    document.getElementById('filterFuel').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('heroSearch').value = '';
    state.pagination.page = 1;
    fetchCars();
  });
  
  // Create car form
  document.getElementById('createCarForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const features = document.getElementById('carFeatures').value;
    const featuresList = features ? features.split(',').map(f => f.trim()).filter(f => f) : [];
    
    const carData = {
      title: document.getElementById('carTitle').value,
      brand: document.getElementById('carBrand').value,
      model: document.getElementById('carModel').value,
      year: parseInt(document.getElementById('carYear').value),
      price: parseFloat(document.getElementById('carPrice').value),
      mileage: parseInt(document.getElementById('carMileage').value),
      color: document.getElementById('carColor').value,
      transmission: document.getElementById('carTransmission').value,
      fuelType: document.getElementById('carFuel').value,
      description: document.getElementById('carDescription').value,
      features: featuresList,
      location: {
        city: document.getElementById('carCity').value,
        country: document.getElementById('carCountry').value
      }
    };
    
    createCarListing(carData);
  });
  
  // Mobile nav toggle
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
    document.querySelector('.nav-actions').classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const registerBtn = document.getElementById('registerBtn');
    
    if (!dropdown.contains(e.target) && e.target !== registerBtn && !registerBtn.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
  
  // Smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Close mobile menu
        document.getElementById('navLinks').classList.remove('active');
        document.querySelector('.nav-actions').classList.remove('active');
      }
    });
  });
});

// Animate stats
function animateStats() {
  const counters = document.querySelectorAll('.stat-number');
  
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString() + '+';
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString() + '+';
      }
    };
    
    // Start animation when element is in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(counter);
  });
}
