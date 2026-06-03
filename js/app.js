// Sample product data - replace with your actual stickers
const products = [
    {
        id: 1,
        name: "Cute Bunny",
        category: "cutie-babie",
        price: 2.99,
        image: "images/gem1.avif"
    },
    {
        id: 2,
        name: "Evil Laugh",
        category: "evil",
        price: 2.99,
        image: "images/gem2.avif"
    },
    {
        id: 3,
        name: "Self Care",
        category: "therapy",
        price: 2.99,
        image: "images/gem3.avif"
    },
    {
        id: 4,
        name: "Best Friends",
        category: "besties",
        price: 2.99,
        image: "images/gem4.avif"
    },
    {
        id: 5,
        name: "Family Love",
        category: "family",
        price: 2.99,
        image: "images/gem5.avif"
    },
    {
        id: 6,
        name: "Dog Buddy",
        category: "animals",
        price: 2.99,
        image: "images/gem6.avif"
    },
    {
        id: 7,
        name: "Career Goals",
        category: "career",
        price: 2.99,
        image: "images/gem7.avif"
    },
    {
        id: 8,
        name: "Party Time",
        category: "cutie-babie",
        price: 2.99,
        image: "images/gem8.avif"
    }
];

let cart = [];
let currentFilter = "all";
let draggedSticker = null;
let isMobile = window.innerWidth <= 768;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeNotebook();
    setupEventListeners();
    loadCartFromStorage();
    detectDevice();
});

// Detect if mobile
function detectDevice() {
    isMobile = window.innerWidth <= 768;
}

window.addEventListener('resize', detectDevice);

// Initialize Interactive Notebook
function initializeNotebook() {
    const floatingStickers = document.getElementById('floatingStickers');
    const notebook = document.getElementById('notebook');

    // Create floating sticker elements
    renderFloatingStickers(products);

    // Setup notebook drag and drop
    notebook.addEventListener('dragover', handleDragOver);
    notebook.addEventListener('drop', handleDrop);
    notebook.addEventListener('dragleave', handleDragLeave);

    // Setup reset button
    document.getElementById('resetNotebook').addEventListener('click', function() {
        notebook.innerHTML = '';
    });
}

// Render floating stickers based on filter
function renderFloatingStickers(productsToRender) {
    const floatingStickers = document.getElementById('floatingStickers');
    floatingStickers.innerHTML = '';

    const filtered = currentFilter === 'all'
        ? productsToRender
        : productsToRender.filter(p => p.category === currentFilter);

    filtered.forEach((product, index) => {
        const sticker = document.createElement('div');
        sticker.className = 'floating-sticker';
        sticker.style.backgroundImage = `url('${product.image}')`;
        sticker.draggable = true;
        sticker.dataset.productId = product.id;
        sticker.dataset.image = product.image;
        sticker.title = product.name;

        sticker.addEventListener('dragstart', handleDragStart);
        sticker.addEventListener('touchstart', handleTouchStart, false);

        floatingStickers.appendChild(sticker);
    });
}

// Drag and Drop Handlers
function handleDragStart(e) {
    if (isMobile) return;
    draggedSticker = {
        image: e.target.dataset.image,
        productId: e.target.dataset.productId
    };
    e.dataTransfer.effectAllowed = 'copy';
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    if (isMobile) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.style.borderColor = '#cf7fb8';
    this.style.borderWidth = '3px';
}

function handleDragLeave(e) {
    if (isMobile) return;
    this.style.borderColor = '#d4a574';
    this.style.borderWidth = '8px';
}

function handleDrop(e) {
    if (isMobile) return;
    e.preventDefault();
    this.style.borderColor = '#d4a574';
    this.style.borderWidth = '8px';

    if (draggedSticker) {
        addStickerToNotebook(draggedSticker.image, e.offsetX, e.offsetY);
        draggedSticker = null;
    }
}

// Touch handlers for mobile
let touchStartSticker = null;
function handleTouchStart(e) {
    if (!isMobile) return;
    touchStartSticker = {
        image: e.target.dataset.image,
        productId: e.target.dataset.productId
    };
}

document.addEventListener('touchend', function(e) {
    if (!isMobile || !touchStartSticker) return;

    const notebook = document.getElementById('notebook');
    const touch = e.changedTouches[0];
    const rect = notebook.getBoundingClientRect();

    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        addStickerToNotebook(touchStartSticker.image, x, y);
    }
    touchStartSticker = null;
});

// Add sticker to notebook
function addStickerToNotebook(image, x, y) {
    const notebook = document.getElementById('notebook');
    const stickerEl = document.createElement('div');
    stickerEl.className = 'placed-sticker';
    stickerEl.style.backgroundImage = `url('${image}')`;
    stickerEl.style.backgroundSize = 'contain';
    stickerEl.style.backgroundRepeat = 'no-repeat';
    stickerEl.style.width = '80px';
    stickerEl.style.height = '80px';
    stickerEl.style.left = (x - 40) + 'px';
    stickerEl.style.top = (y - 40) + 'px';

    // Make placed stickers draggable
    stickerEl.draggable = true;
    stickerEl.addEventListener('dragstart', handlePlacedDragStart);
    stickerEl.addEventListener('dragend', handlePlacedDragEnd);
    stickerEl.addEventListener('dblclick', function() {
        stickerEl.remove();
    });

    // Mobile tap to remove
    stickerEl.addEventListener('touchstart', function(e) {
        setTimeout(() => {
            if (e.target === stickerEl) {
                stickerEl.remove();
            }
        }, 500);
    });

    notebook.appendChild(stickerEl);
}

// Handle dragging placed stickers
function handlePlacedDragStart(e) {
    if (isMobile) return;
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.7';
    this.dragOffsetX = e.offsetX;
    this.dragOffsetY = e.offsetY;
}

function handlePlacedDragEnd(e) {
    e.target.style.opacity = '1';
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderFloatingStickers(products);
        });
    });

    // Category dropdown
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            currentFilter = category;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-filter="${category}"]`).classList.add('active');
            renderFloatingStickers(products);
        });
    });

    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCartToStorage();
    showCartNotification();
}

// Show notification when item added
function showCartNotification() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.textContent = `🛒 Cart (${cartCount})`;
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('sticker-cart', JSON.stringify(cart));
    showCartNotification();
}

// Load cart from localStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem('sticker-cart');
    if (saved) {
        cart = JSON.parse(saved);
        showCartNotification();
    }
}

// Format category name
function formatCategory(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
