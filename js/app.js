// ==========================================
// PRODUCT DATA
// ==========================================
const products = [
    { id: 1, name: "Cute Bunny",    category: "cutie-babie", price: 0.99, image: "images/gem1.avif" },
    { id: 2, name: "Evil Laugh",    category: "evil",        price: 0.99, image: "images/gem2.avif" },
    { id: 3, name: "Self Care",     category: "therapy",     price: 0.99, image: "images/gem3.avif" },
    { id: 4, name: "Best Friends",  category: "besties",     price: 0.99, image: "images/gem4.avif" },
    { id: 5, name: "Family Love",   category: "family",      price: 0.99, image: "images/gem5.avif" },
    { id: 6, name: "Dog Buddy",     category: "animals",     price: 0.99, image: "images/gem6.avif" },
    { id: 7, name: "Career Goals",  category: "career",      price: 0.99, image: "images/gem7.avif" },
    { id: 8, name: "Party Time",    category: "cutie-babie", price: 0.99, image: "images/gem8.avif" }
];

// ==========================================
// CART LOGIC
// ==========================================
let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCartToStorage();
    showCartNotification();
}

function showCartNotification() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) cartIcon.textContent = cartCount > 0 ? `🛒 Cart (${cartCount})` : 'Cart';
}

function saveCartToStorage() {
    localStorage.setItem('sticker-cart', JSON.stringify(cart));
    showCartNotification();
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('sticker-cart');
    if (saved) {
        cart = JSON.parse(saved);
        showCartNotification();
    }
}

// ==========================================
// DRAG SYSTEM
// ==========================================
let globalZ = 10;

function makeDraggable(el) {
    let active = false, startX, startY, startLeft, startTop;
    el.addEventListener('pointerdown', e => {
        active = true;
        el.setPointerCapture(e.pointerId);
        startX = e.clientX; startY = e.clientY;
        startLeft = parseFloat(el.style.left) || 0;
        startTop = parseFloat(el.style.top) || 0;
        el.style.zIndex = ++globalZ;
        const rot = el.dataset.rotation || 0;
        el.style.transform = `rotate(${rot}deg) scale(1.08)`;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });
    el.addEventListener('pointermove', e => {
        if (!active) return;
        el.style.left = (startLeft + e.clientX - startX) + 'px';
        el.style.top = (startTop + e.clientY - startY) + 'px';
    });
    el.addEventListener('pointerup', () => {
        active = false;
        const rot = el.dataset.rotation || 0;
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.cursor = 'grab';
    });
}

function makeDraggableConstrained(el, getContainer) {
    let active = false, startX, startY, startLeft, startTop;
    el.addEventListener('pointerdown', e => {
        active = true;
        el.setPointerCapture(e.pointerId);
        startX = e.clientX; startY = e.clientY;
        startLeft = parseFloat(el.style.left) || 0;
        startTop = parseFloat(el.style.top) || 0;
        el.style.zIndex = ++globalZ;
        const rot = el.dataset.rotation || 0;
        el.style.transform = `rotate(${rot}deg) scale(1.08)`;
        el.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
    });
    el.addEventListener('pointermove', e => {
        if (!active) return;
        let newLeft = startLeft + e.clientX - startX;
        let newTop  = startTop  + e.clientY - startY;
        const container = getContainer();
        if (container) {
            const elW = el.offsetWidth  || 70;
            const elH = el.offsetHeight || 70;
            newLeft = Math.max(0, Math.min(newLeft, container.offsetWidth  - elW));
            newTop  = Math.max(0, Math.min(newTop,  container.offsetHeight - elH));
        }
        el.style.left = newLeft + 'px';
        el.style.top  = newTop  + 'px';
    });
    el.addEventListener('pointerup', () => {
        active = false;
        const rot = el.dataset.rotation || 0;
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.cursor = 'grab';
    });
}

// ==========================================
// CATEGORY FILTER
// ==========================================
let activeCategory = 'all';

const categoryLabels = {
    'all':          'All',
    'cutie-babie':  'Cutie Babies',
    'evil':         'Evil',
    'therapy':      'Therapy',
    'besties':      'Besties',
    'family':       'Family',
    'animals':      'Animals',
    'career':       'Career'
};

function applyFilter(category) {
    activeCategory = category;

    // Sync active state across all pill groups
    document.querySelectorAll('.pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === category);
    });

    // Filter desk stickers
    document.querySelectorAll('#desk .sticker-item').forEach(el => {
        const match = category === 'all' || el.dataset.category === category;
        const rot = el.dataset.rotation || 0;
        if (match) {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.style.transform = `rotate(${rot}deg) scale(1)`;
        } else {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.transform = `rotate(${rot}deg) scale(0.8)`;
        }
    });

    // Filter product cards
    document.querySelectorAll('#productsGrid .product-card').forEach(el => {
        const match = category === 'all' || el.dataset.category === category;
        el.classList.toggle('hidden-card', !match);
    });

    // Re-render mobile tray stickers
    if (window.innerWidth < 768) {
        renderTrayStickers();
    }
}

// ==========================================
// PRODUCT GRID
// ==========================================
function renderProductGrid() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.category = product.category;

        const catLabel = categoryLabels[product.category] || product.category;

        card.innerHTML = `
            <div class="card-image-area">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="card-info">
                <span class="card-category">${catLabel}</span>
                <span class="card-name">${product.name}</span>
                <div class="card-bottom">
                    <span class="card-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to cart</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// ==========================================
// SCATTER STICKERS ON LOAD
// ==========================================
function scatterStickers() {
    const desk = document.getElementById('desk');
    if (!desk) return;

    const stickers = desk.querySelectorAll('.sticker-item');
    const deskW = desk.offsetWidth;
    const deskH = desk.offsetHeight;
    const stickerSize = 90;

    stickers.forEach(el => {
        const rotation = Math.round(Math.random() * 28 - 14);
        el.dataset.rotation = rotation;

        // Place avoiding comp-book area (roughly x:0-280, y:0-320)
        let x, y, attempts = 0;
        do {
            x = Math.random() * (deskW - stickerSize - 20) + 10;
            y = Math.random() * (deskH - stickerSize - 20) + 10;
            attempts++;
        } while (x < 290 && y < 330 && attempts < 50);

        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        el.style.transform = `rotate(${rotation}deg) scale(1)`;
        el.style.opacity = '1';

        makeDraggable(el);
    });
}

// ==========================================
// MOBILE TRAY
// ==========================================
function renderTrayStickers() {
    const trayStickers = document.getElementById('trayStickers');
    if (!trayStickers) return;
    trayStickers.innerHTML = '';

    const filtered = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    filtered.forEach(product => {
        const thumb = document.createElement('img');
        thumb.src = product.image;
        thumb.alt = product.name;
        thumb.className = 'tray-thumb';
        thumb.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                placeStickerInBook(product.image);
            }
        });
        trayStickers.appendChild(thumb);
    });
}

function placeStickerInBook(imageSrc) {
    const bookCover = document.getElementById('bookCover');
    if (!bookCover) return;

    const coverW = bookCover.offsetWidth;
    const coverH = bookCover.offsetHeight;
    const stickerSize = 70;
    const rotation = Math.round(Math.random() * 20 - 10);

    const placed = document.createElement('img');
    placed.src = imageSrc;
    placed.style.cssText = [
        'position:absolute',
        `width:${stickerSize}px`,
        `height:${stickerSize}px`,
        'object-fit:contain',
        `left:${coverW / 2 - stickerSize / 2}px`,
        `top:${coverH / 2 - stickerSize / 2}px`,
        `transform:rotate(${rotation}deg)`,
        'cursor:grab',
        'user-select:none',
        'touch-action:none',
        'filter:drop-shadow(2px 4px 10px rgba(90,60,50,0.25))',
        `z-index:${++globalZ}`
    ].join(';');
    placed.dataset.rotation = rotation;

    bookCover.appendChild(placed);
    makeDraggableConstrained(placed, () => bookCover);
}

function setupMobileTray() {
    document.querySelectorAll('#trayPills .pill').forEach(pill => {
        pill.addEventListener('click', () => applyFilter(pill.dataset.category));
    });
    renderTrayStickers();
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    renderProductGrid();
    scatterStickers();
    setupMobileTray();

    // Nav + shop pill listeners
    document.querySelectorAll('#navPills .pill, #shopPills .pill').forEach(pill => {
        pill.addEventListener('click', () => applyFilter(pill.dataset.category));
    });

    // Add-to-cart delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(parseInt(e.target.dataset.id));
        }
    });
});
