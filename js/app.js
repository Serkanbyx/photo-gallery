/**
 * Photo Gallery Application
 * Modern, responsive gallery with Unsplash API integration
 * Features: Infinite Scroll, Favorites, Search, Skeleton Loading, Slideshow, Fullscreen, Download
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    // Unsplash API configuration
    unsplashAccessKey: 'YOUR_UNSPLASH_ACCESS_KEY',
    imagesPerPage: 12,
    
    // Fallback images when API is not available
    useFallbackImages: true,
    
    // Categories mapping for Unsplash
    categories: {
        all: '',
        nature: 'nature,landscape,forest,mountains',
        architecture: 'architecture,building,city',
        people: 'people,portrait,street'
    },
    
    // Slideshow default interval (ms)
    slideshowInterval: 3000,
    
    // Skeleton count for loading
    skeletonCount: 8,
    
    // Supported languages (first entry is the default fallback)
    languages: ['en', 'tr'],
    
    // LocalStorage keys
    storageKeys: {
        favorites: 'lumina_gallery_favorites',
        language: 'lumina_gallery_language'
    }
};

// ============================================
// State Management
// ============================================
const state = {
    images: [],
    filteredImages: [],
    favorites: [],
    currentCategory: 'all',
    currentPage: 1,
    currentImageIndex: 0,
    searchQuery: '',
    isLoading: false,
    isLightboxOpen: false,
    isSlideShowPlaying: false,
    slideshowTimer: null,
    slideshowProgressTimer: null,
    hasMoreImages: true,
    isFullscreen: false,
    currentLanguage: 'en',
    focusTrapHandler: null
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Gallery
    galleryGrid: document.getElementById('galleryGrid'),
    loader: document.getElementById('loader'),
    scrollSentinel: document.getElementById('scrollSentinel'),
    endOfContent: document.getElementById('endOfContent'),
    
    // Search
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchClear: document.getElementById('searchClear'),
    searchResultsInfo: document.getElementById('searchResultsInfo'),
    searchQuery: document.getElementById('searchQuery'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    noResults: document.getElementById('noResults'),
    emptyFavorites: document.getElementById('emptyFavorites'),
    
    // Lightbox
    lightbox: document.getElementById('lightbox'),
    lightboxImage: document.getElementById('lightboxImage'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxAuthor: document.getElementById('lightboxAuthor'),
    lightboxCounter: document.getElementById('lightboxCounter'),
    lightboxClose: document.getElementById('lightboxClose'),
    lightboxPrev: document.getElementById('lightboxPrev'),
    lightboxNext: document.getElementById('lightboxNext'),
    lightboxLoader: document.querySelector('.lightbox-loader'),
    
    // Lightbox Controls
    slideshowToggle: document.getElementById('slideshowToggle'),
    slideshowInterval: document.getElementById('slideshowInterval'),
    slideshowProgress: document.getElementById('slideshowProgress'),
    slideshowProgressBar: document.getElementById('slideshowProgressBar'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    
    // Navigation
    navBtns: document.querySelectorAll('.nav-btn'),
    nav: document.querySelector('.nav'),
    
    // Mobile Menu
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    mobileMenuOverlay: document.getElementById('mobileMenuOverlay'),
    
    // Language
    langToggle: document.getElementById('langToggle'),
    langToggleLabel: document.getElementById('langToggleLabel')
};

// ============================================
// Fallback Images Data (100+ images)
// ============================================
const fallbackImages = [
    // Nature Category (40 images)
    { id: '1', title: 'Mountain Sunrise', author: 'John Doe', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&q=80', full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' }, alt: 'Beautiful mountain landscape at sunrise', aspectRatio: 1.5 },
    { id: '2', title: 'Ocean Waves', author: 'Jane Smith', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&q=80', regular: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&q=80', full: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80' }, alt: 'Crystal clear ocean waves', aspectRatio: 1.33 },
    { id: '3', title: 'Forest Path', author: 'Maria Garcia', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' }, alt: 'Misty forest path in autumn', aspectRatio: 1.5 },
    { id: '4', title: 'Desert Dunes', author: 'Omar Hassan', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80', regular: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1080&q=80', full: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80' }, alt: 'Golden sand dunes in desert', aspectRatio: 1.5 },
    { id: '5', title: 'Northern Lights', author: 'Erik Svensson', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80', regular: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1080&q=80', full: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' }, alt: 'Aurora borealis over snowy landscape', aspectRatio: 1.5 },
    { id: '6', title: 'Waterfall', author: 'Ryan Thompson', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80', regular: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1080&q=80', full: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80' }, alt: 'Majestic waterfall in tropical forest', aspectRatio: 0.67 },
    { id: '7', title: 'Autumn Colors', author: 'Michael Lee', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', regular: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80', full: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80' }, alt: 'Colorful autumn forest landscape', aspectRatio: 1.33 },
    { id: '8', title: 'Tropical Beach', author: 'Sarah Johnson', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', regular: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80', full: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' }, alt: 'Tropical beach with palm trees', aspectRatio: 1.5 },
    { id: '9', title: 'Snowy Peaks', author: 'Hans Mueller', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80' }, alt: 'Snow covered mountain peaks', aspectRatio: 1.5 },
    { id: '10', title: 'Lavender Fields', author: 'Marie Dupont', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&q=80', regular: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1080&q=80', full: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80' }, alt: 'Purple lavender fields at sunset', aspectRatio: 1.5 },
    { id: '11', title: 'Rocky Coastline', author: 'Patrick OBrien', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&q=80', regular: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1080&q=80', full: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80' }, alt: 'Dramatic rocky coastline', aspectRatio: 1.5 },
    { id: '12', title: 'Misty Valley', author: 'Chen Wei', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80', regular: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&q=80', full: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80' }, alt: 'Misty mountain valley', aspectRatio: 1.5 },
    { id: '13', title: 'Sunset Lake', author: 'Anna Kowalski', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=400&q=80', regular: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=1080&q=80', full: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=1920&q=80' }, alt: 'Lake reflection at sunset', aspectRatio: 1.5 },
    { id: '14', title: 'Cherry Blossoms', author: 'Yuki Nakamura', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&q=80', regular: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1080&q=80', full: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80' }, alt: 'Cherry blossoms in spring', aspectRatio: 1.0 },
    { id: '15', title: 'Grand Canyon', author: 'Robert Williams', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400&q=80', regular: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1080&q=80', full: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1920&q=80' }, alt: 'Grand canyon landscape', aspectRatio: 1.5 },
    { id: '16', title: 'Bamboo Forest', author: 'Kenji Tanaka', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', regular: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&q=80', full: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80' }, alt: 'Serene bamboo forest', aspectRatio: 0.67 },
    { id: '17', title: 'Starry Night', author: 'Carlos Mendez', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', regular: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&q=80', full: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80' }, alt: 'Milky way galaxy', aspectRatio: 1.5 },
    { id: '18', title: 'Tulip Garden', author: 'Lisa van Berg', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80', regular: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1080&q=80', full: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80' }, alt: 'Colorful tulip garden', aspectRatio: 1.0 },
    { id: '19', title: 'Iceberg', author: 'Thor Eriksson', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=400&q=80', regular: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=1080&q=80', full: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=1920&q=80' }, alt: 'Massive iceberg in arctic', aspectRatio: 1.5 },
    { id: '20', title: 'Rainforest', author: 'Isabella Costa', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=400&q=80', regular: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1080&q=80', full: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1920&q=80' }, alt: 'Lush green rainforest', aspectRatio: 1.5 },
    { id: '21', title: 'Volcano Eruption', author: 'Marco Rossi', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=400&q=80', regular: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1080&q=80', full: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1920&q=80' }, alt: 'Active volcano at night', aspectRatio: 1.33 },
    { id: '22', title: 'Coral Reef', author: 'Marina Santos', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1920&q=80' }, alt: 'Colorful coral reef underwater', aspectRatio: 1.5 },
    { id: '23', title: 'Autumn Road', author: 'Peter Schmidt', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&q=80', regular: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1080&q=80', full: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80' }, alt: 'Road through autumn forest', aspectRatio: 1.5 },
    { id: '24', title: 'Alpine Lake', author: 'Sophie Blanc', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80', regular: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1080&q=80', full: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80' }, alt: 'Crystal clear alpine lake', aspectRatio: 1.5 },
    { id: '25', title: 'Wildflowers', author: 'Emma Green', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80', regular: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1080&q=80', full: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80' }, alt: 'Field of wildflowers', aspectRatio: 1.33 },
    { id: '26', title: 'Frozen Lake', author: 'Viktor Petrov', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&q=80', regular: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1080&q=80', full: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&q=80' }, alt: 'Frozen lake in winter', aspectRatio: 1.5 },
    { id: '27', title: 'Redwood Forest', author: 'Michael Chen', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80', regular: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1080&q=80', full: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1920&q=80' }, alt: 'Tall redwood trees', aspectRatio: 0.67 },
    { id: '28', title: 'River Valley', author: 'Ana Rivera', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', regular: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80', full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80' }, alt: 'Winding river through valley', aspectRatio: 1.5 },
    { id: '29', title: 'Sunset Clouds', author: 'David Park', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&q=80', regular: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1080&q=80', full: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80' }, alt: 'Dramatic sunset clouds', aspectRatio: 1.5 },
    { id: '30', title: 'Mountain Stream', author: 'Laura Fischer', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=80', regular: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1080&q=80', full: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80' }, alt: 'Clear mountain stream', aspectRatio: 1.0 },
    { id: '31', title: 'Fjord View', author: 'Olaf Norgaard', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=400&q=80', regular: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=1080&q=80', full: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=1920&q=80' }, alt: 'Norwegian fjord landscape', aspectRatio: 1.5 },
    { id: '32', title: 'Rice Terraces', author: 'Budi Santoso', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&q=80', regular: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1080&q=80', full: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&q=80' }, alt: 'Green rice terraces', aspectRatio: 1.33 },
    { id: '33', title: 'Cave Interior', author: 'Alex Storm', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=400&q=80', regular: 'https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=1080&q=80', full: 'https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=1920&q=80' }, alt: 'Beautiful cave formations', aspectRatio: 0.75 },
    { id: '34', title: 'Spring Meadow', author: 'Elena Popova', category: 'nature', urls: { small: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&q=80', regular: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1080&q=80', full: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&q=80' }, alt: 'Sunny spring meadow', aspectRatio: 1.5 },
    
    // Architecture Category (35 images)
    { id: '35', title: 'Modern Architecture', author: 'Alex Chen', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80', regular: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1080&q=80', full: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80' }, alt: 'Modern skyscraper with glass facade', aspectRatio: 0.75 },
    { id: '36', title: 'City Lights', author: 'David Kim', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80', regular: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1080&q=80', full: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80' }, alt: 'City skyline at night with lights', aspectRatio: 1.78 },
    { id: '37', title: 'Glass Building', author: 'Lucas Brown', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80', regular: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1080&q=80', full: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1920&q=80' }, alt: 'Modern glass office building', aspectRatio: 1.33 },
    { id: '38', title: 'Museum Interior', author: 'Anna Petrova', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&q=80', regular: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1080&q=80', full: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1920&q=80' }, alt: 'Stunning museum interior architecture', aspectRatio: 1.5 },
    { id: '39', title: 'City Bridge', author: 'Christina Wang', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80', regular: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1080&q=80', full: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80' }, alt: 'Iconic city bridge at sunset', aspectRatio: 1.78 },
    { id: '40', title: 'Gothic Cathedral', author: 'Pierre Martin', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80', regular: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1080&q=80', full: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&q=80' }, alt: 'Gothic cathedral architecture', aspectRatio: 0.67 },
    { id: '41', title: 'Spiral Staircase', author: 'Emma White', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', regular: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1080&q=80', full: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80' }, alt: 'Elegant spiral staircase', aspectRatio: 0.75 },
    { id: '42', title: 'Tokyo Tower', author: 'Hiroshi Yamamoto', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=80', regular: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1080&q=80', full: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1920&q=80' }, alt: 'Tokyo tower at night', aspectRatio: 0.67 },
    { id: '43', title: 'Ancient Temple', author: 'Raj Patel', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', regular: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1080&q=80', full: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=80' }, alt: 'Ancient temple architecture', aspectRatio: 1.5 },
    { id: '44', title: 'Opera House', author: 'Sarah Mitchell', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=400&q=80', regular: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=1080&q=80', full: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=1920&q=80' }, alt: 'Sydney opera house', aspectRatio: 1.5 },
    { id: '45', title: 'Art Deco Building', author: 'James Cole', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=400&q=80', regular: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=1080&q=80', full: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=1920&q=80' }, alt: 'Art deco style building', aspectRatio: 0.75 },
    { id: '46', title: 'Eiffel Tower', author: 'Marie Leroy', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', regular: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1080&q=80', full: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80' }, alt: 'Eiffel tower Paris', aspectRatio: 0.67 },
    { id: '47', title: 'Futuristic Design', author: 'Max Weber', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80', regular: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1080&q=80', full: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1920&q=80' }, alt: 'Futuristic architecture design', aspectRatio: 1.33 },
    { id: '48', title: 'Venice Canals', author: 'Giuseppe Romano', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400&q=80', regular: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1080&q=80', full: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1920&q=80' }, alt: 'Venice canal buildings', aspectRatio: 1.5 },
    { id: '49', title: 'Colosseum', author: 'Marco Bianchi', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80', regular: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1080&q=80', full: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80' }, alt: 'Roman colosseum', aspectRatio: 1.5 },
    { id: '50', title: 'Minimalist Interior', author: 'Nina Olsen', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80', regular: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1080&q=80', full: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1920&q=80' }, alt: 'Minimalist interior design', aspectRatio: 1.5 },
    { id: '51', title: 'Skyscraper Reflection', author: 'Tom Hardy', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400&q=80', regular: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=1080&q=80', full: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=1920&q=80' }, alt: 'Skyscraper with reflection', aspectRatio: 0.67 },
    { id: '52', title: 'Brooklyn Bridge', author: 'Mike Johnson', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=400&q=80', regular: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1080&q=80', full: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1920&q=80' }, alt: 'Brooklyn bridge at sunset', aspectRatio: 1.5 },
    { id: '53', title: 'Modern Villa', author: 'Lisa Anderson', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80', regular: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&q=80', full: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80' }, alt: 'Modern luxury villa', aspectRatio: 1.5 },
    { id: '54', title: 'Library Interior', author: 'Henry Woods', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80', regular: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1080&q=80', full: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80' }, alt: 'Grand library interior', aspectRatio: 1.33 },
    { id: '55', title: 'Taj Mahal', author: 'Priya Sharma', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80', regular: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1080&q=80', full: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=80' }, alt: 'Taj Mahal at sunrise', aspectRatio: 1.5 },
    { id: '56', title: 'Dubai Skyline', author: 'Ahmed Hassan', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', regular: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1080&q=80', full: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80' }, alt: 'Dubai modern skyline', aspectRatio: 1.78 },
    { id: '57', title: 'Historic Castle', author: 'William Scott', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=400&q=80', regular: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=1080&q=80', full: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=1920&q=80' }, alt: 'Medieval castle', aspectRatio: 1.5 },
    { id: '58', title: 'Glass Dome', author: 'Eva Mueller', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=1920&q=80' }, alt: 'Glass dome structure', aspectRatio: 1.0 },
    { id: '59', title: 'Urban Streets', author: 'Carlos Silva', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80', regular: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1080&q=80', full: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80' }, alt: 'City urban streets', aspectRatio: 1.5 },
    { id: '60', title: 'Wooden Church', author: 'Magnus Berg', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80' }, alt: 'Traditional wooden church', aspectRatio: 0.75 },
    { id: '61', title: 'Night Cityscape', author: 'Jack Thompson', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80', regular: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1080&q=80', full: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80' }, alt: 'City at night', aspectRatio: 1.78 },
    { id: '62', title: 'Palace Gardens', author: 'Sophie Dubois', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?w=400&q=80', regular: 'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?w=1080&q=80', full: 'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?w=1920&q=80' }, alt: 'Royal palace gardens', aspectRatio: 1.5 },
    { id: '63', title: 'Steel Structure', author: 'Robert Clark', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&q=80', regular: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1080&q=80', full: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80' }, alt: 'Modern steel structure', aspectRatio: 1.33 },
    { id: '64', title: 'Rooftop View', author: 'Diana Ross', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80' }, alt: 'City rooftop panorama', aspectRatio: 1.78 },
    { id: '65', title: 'Historic Facade', author: 'Andrea Mori', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&q=80', regular: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1080&q=80', full: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1920&q=80' }, alt: 'Historic building facade', aspectRatio: 0.75 },
    { id: '66', title: 'Train Station', author: 'Paul Newman', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80', regular: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1080&q=80', full: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=80' }, alt: 'Grand train station', aspectRatio: 1.5 },
    { id: '67', title: 'Concrete Beauty', author: 'Maya Lin', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1494522358652-f30e61a60313?w=400&q=80', regular: 'https://images.unsplash.com/photo-1494522358652-f30e61a60313?w=1080&q=80', full: 'https://images.unsplash.com/photo-1494522358652-f30e61a60313?w=1920&q=80' }, alt: 'Brutalist concrete architecture', aspectRatio: 1.0 },
    { id: '68', title: 'Harbor View', author: 'Oscar Berg', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80', regular: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1080&q=80', full: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1920&q=80' }, alt: 'Harbor cityscape', aspectRatio: 1.5 },
    { id: '69', title: 'Asian Pagoda', author: 'Li Wei', category: 'architecture', urls: { small: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80', regular: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1080&q=80', full: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&q=80' }, alt: 'Traditional Asian pagoda', aspectRatio: 0.67 },
    
    // People Category (35 images)
    { id: '70', title: 'Portrait Study', author: 'Emma Wilson', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', regular: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080&q=80', full: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1920&q=80' }, alt: 'Professional portrait photograph', aspectRatio: 0.67 },
    { id: '71', title: 'Street Life', author: 'Yuki Tanaka', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', regular: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&q=80', full: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1920&q=80' }, alt: 'Street photography portrait', aspectRatio: 0.67 },
    { id: '72', title: 'Urban Explorer', author: 'Sophie Martin', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', regular: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80', full: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80' }, alt: 'Person exploring urban environment', aspectRatio: 1.0 },
    { id: '73', title: 'Coffee Moment', author: 'James Anderson', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&q=80', regular: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1080&q=80', full: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1920&q=80' }, alt: 'Person enjoying coffee in cafe', aspectRatio: 1.0 },
    { id: '74', title: 'Fashion Portrait', author: 'Lucia Fernandez', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', regular: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1080&q=80', full: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1920&q=80' }, alt: 'Fashion model portrait', aspectRatio: 0.67 },
    { id: '75', title: 'Business Professional', author: 'Mark Davis', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', regular: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1080&q=80', full: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1920&q=80' }, alt: 'Business professional portrait', aspectRatio: 1.0 },
    { id: '76', title: 'Artist at Work', author: 'Nina Garcia', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80', regular: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080&q=80', full: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80' }, alt: 'Artist painting in studio', aspectRatio: 1.5 },
    { id: '77', title: 'Musician', author: 'David Brown', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', regular: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1080&q=80', full: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80' }, alt: 'Musician performing', aspectRatio: 1.5 },
    { id: '78', title: 'Beach Day', author: 'Sarah Miller', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', regular: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1080&q=80', full: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1920&q=80' }, alt: 'Person at the beach', aspectRatio: 0.67 },
    { id: '79', title: 'Yoga Practice', author: 'Maya Chen', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80' }, alt: 'Person practicing yoga', aspectRatio: 1.5 },
    { id: '80', title: 'Chef Cooking', author: 'Antonio Rossi', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80', regular: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1080&q=80', full: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80' }, alt: 'Chef preparing food', aspectRatio: 1.0 },
    { id: '81', title: 'Reading Corner', author: 'Emily Watson', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400&q=80', regular: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=1080&q=80', full: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=1920&q=80' }, alt: 'Person reading a book', aspectRatio: 0.75 },
    { id: '82', title: 'Fitness Training', author: 'Jake Strong', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', regular: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&q=80', full: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80' }, alt: 'Person working out', aspectRatio: 1.5 },
    { id: '83', title: 'Couple Walking', author: 'Rosa Martinez', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80', regular: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1080&q=80', full: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920&q=80' }, alt: 'Couple walking together', aspectRatio: 1.5 },
    { id: '84', title: 'Street Vendor', author: 'Nguyen Tran', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', regular: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80', full: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80' }, alt: 'Street food vendor', aspectRatio: 1.0 },
    { id: '85', title: 'Graduation Day', author: 'Kevin Lee', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=400&q=80', regular: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1080&q=80', full: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1920&q=80' }, alt: 'Graduate celebrating', aspectRatio: 0.67 },
    { id: '86', title: 'Photographer', author: 'Chris Taylor', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=80', regular: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1080&q=80', full: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80' }, alt: 'Photographer with camera', aspectRatio: 1.0 },
    { id: '87', title: 'Dancing Joy', author: 'Maria Santos', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=400&q=80', regular: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=1080&q=80', full: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=1920&q=80' }, alt: 'Person dancing with joy', aspectRatio: 0.67 },
    { id: '88', title: 'Contemplation', author: 'John Smith', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', regular: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1080&q=80', full: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1920&q=80' }, alt: 'Person in contemplation', aspectRatio: 1.0 },
    { id: '89', title: 'Market Scene', author: 'Fatima Ahmed', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80', regular: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1080&q=80', full: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1920&q=80' }, alt: 'People at local market', aspectRatio: 1.5 },
    { id: '90', title: 'Skateboarder', author: 'Tony Hawk', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=400&q=80', regular: 'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=1080&q=80', full: 'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=1920&q=80' }, alt: 'Skateboarder in action', aspectRatio: 1.0 },
    { id: '91', title: 'Family Picnic', author: 'Linda Park', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80', regular: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1080&q=80', full: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80' }, alt: 'Family enjoying picnic', aspectRatio: 1.5 },
    { id: '92', title: 'Traveler', author: 'Alex Journey', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&q=80', regular: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1080&q=80', full: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1920&q=80' }, alt: 'Traveler with backpack', aspectRatio: 0.67 },
    { id: '93', title: 'Elderly Wisdom', author: 'Peter Chen', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400&q=80', regular: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=1080&q=80', full: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=1920&q=80' }, alt: 'Wise elderly person', aspectRatio: 0.75 },
    { id: '94', title: 'Child Playing', author: 'Emma Green', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80', regular: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1080&q=80', full: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&q=80' }, alt: 'Child playing happily', aspectRatio: 0.67 },
    { id: '95', title: 'Office Worker', author: 'Jane Miller', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', regular: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&q=80', full: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&q=80' }, alt: 'Professional at work', aspectRatio: 0.67 },
    { id: '96', title: 'Runner', author: 'Mike Fast', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80', regular: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1080&q=80', full: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&q=80' }, alt: 'Runner in motion', aspectRatio: 1.5 },
    { id: '97', title: 'Street Artist', author: 'Banksy Clone', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920&q=80' }, alt: 'Street artist creating', aspectRatio: 1.33 },
    { id: '98', title: 'Surfer', author: 'Kelly Slater', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80', regular: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1080&q=80', full: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=80' }, alt: 'Surfer riding wave', aspectRatio: 1.5 },
    { id: '99', title: 'Garden Walk', author: 'Rose Bloom', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', regular: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1080&q=80', full: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1920&q=80' }, alt: 'Person walking in garden', aspectRatio: 0.67 },
    { id: '100', title: 'Night Portrait', author: 'Luna Dark', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', regular: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1080&q=80', full: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80' }, alt: 'Portrait at night', aspectRatio: 0.67 },
    { id: '101', title: 'Hiker Summit', author: 'Mountain Max', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80', regular: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&q=80', full: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80' }, alt: 'Hiker at mountain summit', aspectRatio: 1.5 },
    { id: '102', title: 'Cafe Life', author: 'Barista Bob', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', regular: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1080&q=80', full: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80' }, alt: 'Cafe atmosphere', aspectRatio: 1.5 },
    { id: '103', title: 'Cyclist', author: 'Tour Guide', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80', regular: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080&q=80', full: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&q=80' }, alt: 'Cyclist on road', aspectRatio: 1.5 },
    { id: '104', title: 'Festival Joy', author: 'Happy Hans', category: 'people', urls: { small: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', regular: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1080&q=80', full: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80' }, alt: 'Festival celebration', aspectRatio: 1.5 }
];

// ============================================
// LocalStorage Functions
// ============================================

/**
 * Loads favorites from localStorage
 * @returns {Array} Array of favorite image IDs
 */
function loadFavorites() {
    try {
        const stored = localStorage.getItem(CONFIG.storageKeys.favorites);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Error loading favorites:', error);
        return [];
    }
}

/**
 * Saves favorites to localStorage
 * @param {Array} favorites - Array of favorite image IDs
 */
function saveFavorites(favorites) {
    try {
        localStorage.setItem(CONFIG.storageKeys.favorites, JSON.stringify(favorites));
    } catch (error) {
        console.warn('Error saving favorites:', error);
    }
}

/**
 * Toggles favorite status for an image
 * @param {string} imageId - Image ID to toggle
 * @returns {boolean} New favorite status
 */
function toggleFavorite(imageId) {
    const index = state.favorites.indexOf(imageId);
    
    if (index === -1) {
        state.favorites.push(imageId);
    } else {
        state.favorites.splice(index, 1);
    }
    
    saveFavorites(state.favorites);
    updateFavoritesUI();
    
    return index === -1;
}

/**
 * Checks if an image is favorited
 * @param {string} imageId - Image ID to check
 * @returns {boolean} Whether the image is favorited
 */
function isFavorite(imageId) {
    return state.favorites.includes(imageId);
}

/**
 * Updates UI elements related to favorites
 */
function updateFavoritesUI() {
    // Update favorites button in navigation
    const favoritesBtn = document.querySelector('[data-category="favorites"]');
    if (favoritesBtn) {
        favoritesBtn.classList.toggle('has-favorites', state.favorites.length > 0);
    }
    
    // Update gallery item favorite buttons
    document.querySelectorAll('.gallery-item-favorite').forEach(btn => {
        const imageId = btn.dataset.imageId;
        btn.classList.toggle('is-favorite', isFavorite(imageId));
    });
    
    // Update lightbox favorite button
    if (state.filteredImages[state.currentImageIndex]) {
        const currentImage = state.filteredImages[state.currentImageIndex];
        const isFav = isFavorite(currentImage.id);
        elements.favoriteBtn.classList.toggle('is-favorite', isFav);
        elements.favoriteBtn.querySelector('.heart-outline').classList.toggle('hidden', isFav);
        elements.favoriteBtn.querySelector('.heart-filled').classList.toggle('hidden', !isFav);
    }
}

// ============================================
// Internationalization (i18n) Functions
// ============================================

/**
 * Resolves the initial language. English is always the default;
 * Turkish is only used when the user has explicitly selected it before
 * (persisted in localStorage). The browser locale is intentionally ignored.
 * @returns {string} Language code ('en' or 'tr')
 */
function resolveInitialLanguage() {
    try {
        const stored = localStorage.getItem(CONFIG.storageKeys.language);
        if (stored && CONFIG.languages.includes(stored)) {
            return stored;
        }
    } catch (error) {
        console.warn('Error reading language preference:', error);
    }
    
    // Default to English regardless of the browser's locale
    return CONFIG.languages[0];
}

/**
 * Reads the localized value of an element for the given language,
 * falling back to the default language when a translation is missing
 * @param {HTMLElement} element - Element carrying data_* translations
 * @param {string} lang - Target language code
 * @returns {string|null} Localized text or null when unavailable
 */
function getTranslation(element, lang) {
    return element.getAttribute(`data_${lang}`)
        ?? element.getAttribute(`data_${CONFIG.languages[0]}`);
}

/**
 * Applies translations to every element carrying data_* attributes.
 * Preserves child elements (e.g. inline SVG icons) by only updating
 * the relevant text node, the placeholder or the accessible label.
 * @param {string} lang - Language code to apply
 */
function applyTranslations(lang) {
    const translatableElements = document.querySelectorAll('[data_en], [data_tr]');
    
    translatableElements.forEach(element => {
        const value = getTranslation(element, lang);
        if (value === null) return;
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = value;
            return;
        }
        
        if (element.children.length > 0) {
            // Element mixes icons with text: update only the visible text node
            const textNode = [...element.childNodes]
                .reverse()
                .find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            
            if (textNode) {
                textNode.textContent = ` ${value}`;
            } else {
                // Icon-only control: expose the label to assistive technology
                element.setAttribute('aria-label', value);
            }
            return;
        }
        
        element.textContent = value;
    });
}

/**
 * Sets the active language, updates the UI and persists the choice
 * @param {string} lang - Language code to activate
 */
function setLanguage(lang) {
    const nextLang = CONFIG.languages.includes(lang) ? lang : CONFIG.languages[0];
    state.currentLanguage = nextLang;
    
    document.documentElement.lang = nextLang;
    applyTranslations(nextLang);
    
    if (elements.langToggleLabel) {
        // Show the language the user can switch to next
        elements.langToggleLabel.textContent = nextLang === 'tr' ? 'EN' : 'TR';
    }
    
    try {
        localStorage.setItem(CONFIG.storageKeys.language, nextLang);
    } catch (error) {
        console.warn('Error saving language preference:', error);
    }
}

/**
 * Toggles between the supported languages
 */
function toggleLanguage() {
    setLanguage(state.currentLanguage === 'tr' ? 'en' : 'tr');
}

// ============================================
// API Functions
// ============================================

/**
 * Fetches images from Unsplash API
 * @param {string} category - Category to filter by
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of image objects
 */
async function fetchImages(category = 'all', page = 1) {
    if (CONFIG.useFallbackImages || CONFIG.unsplashAccessKey === 'YOUR_UNSPLASH_ACCESS_KEY') {
        return getFallbackImages(category, page);
    }
    
    try {
        const query = CONFIG.categories[category] || '';
        const endpoint = query 
            ? `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=${CONFIG.imagesPerPage}`
            : `https://api.unsplash.com/photos?page=${page}&per_page=${CONFIG.imagesPerPage}`;
        
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Client-ID ${CONFIG.unsplashAccessKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const photos = query ? data.results : data;
        
        return photos.map(photo => ({
            id: photo.id,
            title: photo.description || photo.alt_description || 'Untitled',
            author: photo.user.name,
            category: category,
            urls: {
                small: photo.urls.small,
                regular: photo.urls.regular,
                full: photo.urls.full
            },
            alt: photo.alt_description || 'Photo from Unsplash',
            aspectRatio: photo.width / photo.height
        }));
    } catch (error) {
        console.warn('API fetch failed, using fallback images:', error);
        return getFallbackImages(category, page);
    }
}

/**
 * Gets fallback images filtered by category
 * @param {string} category - Category to filter by
 * @param {number} page - Page number
 * @returns {Array} Filtered images
 */
function getFallbackImages(category, page) {
    let filtered = category === 'all' 
        ? [...fallbackImages]
        : fallbackImages.filter(img => img.category === category);
    
    const start = (page - 1) * CONFIG.imagesPerPage;
    const end = start + CONFIG.imagesPerPage;
    
    if (start >= filtered.length && page > 1) {
        return [];
    }
    
    return filtered.slice(start, end);
}

// ============================================
// Search Functions
// ============================================

/**
 * Performs search on images
 * @param {string} query - Search query
 */
function performSearch(query) {
    state.searchQuery = query.toLowerCase().trim();
    
    if (!state.searchQuery) {
        clearSearch();
        return;
    }
    
    // Filter images based on search query
    const searchResults = state.images.filter(img => 
        img.title.toLowerCase().includes(state.searchQuery) ||
        img.author.toLowerCase().includes(state.searchQuery) ||
        img.alt.toLowerCase().includes(state.searchQuery)
    );
    
    state.filteredImages = searchResults;
    
    // Update UI
    elements.searchResultsInfo.classList.remove('hidden');
    elements.searchQuery.textContent = `"${state.searchQuery}"`;
    elements.searchClear.classList.remove('hidden');
    
    if (searchResults.length === 0) {
        elements.noResults.classList.remove('hidden');
        elements.galleryGrid.innerHTML = '';
    } else {
        elements.noResults.classList.add('hidden');
        renderGallery(searchResults, false);
    }
    
    // Hide infinite scroll elements
    elements.scrollSentinel.classList.add('hidden');
    elements.endOfContent.classList.add('hidden');
}

/**
 * Clears the current search
 */
function clearSearch() {
    state.searchQuery = '';
    elements.searchInput.value = '';
    elements.searchResultsInfo.classList.add('hidden');
    elements.searchClear.classList.add('hidden');
    elements.noResults.classList.add('hidden');
    
    // Restore category view
    filterByCategory(state.currentCategory, true);
}

// ============================================
// Skeleton Loading Functions
// ============================================

/**
 * Creates skeleton loading HTML
 * @param {number} count - Number of skeleton items
 * @returns {string} HTML string
 */
function createSkeletonHTML(count = CONFIG.skeletonCount) {
    const aspectRatios = [1.5, 0.75, 1.33, 1, 1.78, 0.67];
    let html = '';
    
    for (let i = 0; i < count; i++) {
        const aspectRatio = aspectRatios[i % aspectRatios.length];
        const rowSpan = Math.ceil((1 / aspectRatio) * 25) + 2;
        
        html += `
            <div class="skeleton-item" style="grid-row: span ${rowSpan};">
                <div class="skeleton-image"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-author"></div>
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Shows skeleton loading
 */
function showSkeletonLoading() {
    elements.galleryGrid.innerHTML = createSkeletonHTML();
}

/**
 * Removes skeleton items from gallery
 */
function removeSkeletons() {
    const skeletons = elements.galleryGrid.querySelectorAll('.skeleton-item');
    skeletons.forEach(skeleton => skeleton.remove());
}

// ============================================
// Gallery Rendering Functions
// ============================================

/**
 * Creates HTML for a gallery item
 * @param {Object} image - Image data object
 * @param {number} index - Index in the current view
 * @returns {string} HTML string
 */
function createGalleryItemHTML(image, index) {
    const rowSpan = Math.ceil((1 / image.aspectRatio) * 25) + 2;
    const isFav = isFavorite(image.id);
    
    // Escape every value that is interpolated into markup to prevent XSS
    // and broken attributes when data comes from the Unsplash API
    const safeId = escapeHTML(image.id);
    const safeTitle = escapeHTML(image.title);
    const safeAuthor = escapeHTML(image.author);
    const safeAlt = escapeHTML(image.alt);
    const safeSmall = escapeHTML(image.urls.small);
    const safeRegular = escapeHTML(image.urls.regular);
    
    return `
        <article 
            class="gallery-item" 
            data-index="${index}"
            data-id="${safeId}"
            tabindex="0"
            role="button"
            aria-label="${safeTitle} - ${safeAuthor}"
            style="grid-row: span ${rowSpan};"
        >
            <button 
                class="gallery-item-favorite ${isFav ? 'is-favorite' : ''}" 
                data-image-id="${safeId}"
                aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
            >
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
            <img 
                class="gallery-item-image"
                src="${safeSmall}"
                srcset="${safeSmall} 400w, ${safeRegular} 1080w"
                sizes="(max-width: 480px) 50vw, (max-width: 900px) 33vw, 25vw"
                alt="${safeAlt}"
                loading="lazy"
                decoding="async"
            >
            <div class="gallery-item-info">
                <h3 class="gallery-item-title">${safeTitle}</h3>
                <p class="gallery-item-author">${safeAuthor}</p>
            </div>
        </article>
    `;
}

/**
 * Renders images to the gallery grid
 * @param {Array} images - Array of image objects
 * @param {boolean} append - Whether to append or replace
 */
function renderGallery(images, append = false) {
    const html = images.map((img, idx) => {
        const globalIndex = append ? state.filteredImages.length - images.length + idx : idx;
        return createGalleryItemHTML(img, globalIndex);
    }).join('');
    
    if (append) {
        elements.galleryGrid.insertAdjacentHTML('beforeend', html);
    } else {
        elements.galleryGrid.innerHTML = html;
    }
    
    attachGalleryItemListeners();
}

/**
 * Attaches event listeners to gallery items
 */
function attachGalleryItemListeners() {
    const items = elements.galleryGrid.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        // Click on item (excluding favorite button)
        item.addEventListener('click', handleGalleryItemClick);
        item.addEventListener('keydown', handleGalleryItemKeydown);
    });
    
    // Favorite buttons
    const favoriteButtons = elements.galleryGrid.querySelectorAll('.gallery-item-favorite');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', handleFavoriteClick);
    });
}

/**
 * Handles click on gallery item
 * @param {Event} event - Click event
 */
function handleGalleryItemClick(event) {
    // Don't open lightbox if clicking favorite button
    if (event.target.closest('.gallery-item-favorite')) {
        return;
    }
    
    const index = parseInt(event.currentTarget.dataset.index);
    openLightbox(index);
}

/**
 * Handles keydown on gallery item
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleGalleryItemKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const index = parseInt(event.currentTarget.dataset.index);
        openLightbox(index);
    }
}

/**
 * Handles click on favorite button
 * @param {Event} event - Click event
 */
function handleFavoriteClick(event) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const imageId = btn.dataset.imageId;
    const isFav = toggleFavorite(imageId);
    
    // Update button appearance
    btn.classList.toggle('is-favorite', isFav);
    btn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
    
    // If in favorites view and unfavorited, remove the item
    if (state.currentCategory === 'favorites' && !isFav) {
        const item = btn.closest('.gallery-item');
        item.style.transform = 'scale(0.8)';
        item.style.opacity = '0';
        setTimeout(() => {
            state.filteredImages = state.filteredImages.filter(img => img.id !== imageId);
            renderGallery(state.filteredImages, false);
            
            if (state.filteredImages.length === 0) {
                elements.emptyFavorites.classList.remove('hidden');
            }
        }, 300);
    }
}

// ============================================
// Lightbox Functions
// ============================================

/**
 * Opens the lightbox with specified image
 * @param {number} index - Index of image to display
 */
function openLightbox(index) {
    state.currentImageIndex = index;
    state.isLightboxOpen = true;
    
    elements.lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
    
    updateLightboxImage();
    updateNavigationButtons();
    updateFavoritesUI();
    
    elements.lightboxClose.focus();
    trapFocus(elements.lightbox);
}

/**
 * Closes the lightbox
 */
function closeLightbox() {
    state.isLightboxOpen = false;
    stopSlideshow();
    exitFullscreen();
    releaseFocusTrap();
    
    elements.lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    
    // Restore focus to the originating gallery item, matched by image id
    // so navigation (arrows / Home / End / slideshow) cannot misalign it
    const currentImage = state.filteredImages[state.currentImageIndex];
    const activeItem = currentImage
        ? elements.galleryGrid.querySelector(`[data-id="${currentImage.id}"]`)
        : null;
    
    if (activeItem) {
        activeItem.focus();
    }
}

/**
 * Updates the lightbox image display
 */
function updateLightboxImage() {
    const image = state.filteredImages[state.currentImageIndex];
    if (!image) return;
    
    elements.lightboxImage.classList.remove('loaded');
    elements.lightboxLoader.classList.remove('hidden');
    
    elements.lightboxTitle.textContent = image.title;
    elements.lightboxAuthor.textContent = `by ${image.author}`;
    elements.lightboxCounter.textContent = `${state.currentImageIndex + 1} / ${state.filteredImages.length}`;
    
    // Update favorite button
    updateFavoritesUI();
    
    const newImage = new Image();
    newImage.onload = () => {
        elements.lightboxImage.src = image.urls.regular;
        elements.lightboxImage.alt = image.alt;
        elements.lightboxImage.classList.add('loaded');
        elements.lightboxLoader.classList.add('hidden');
    };
    newImage.onerror = () => {
        elements.lightboxImage.src = image.urls.small;
        elements.lightboxImage.alt = image.alt;
        elements.lightboxImage.classList.add('loaded');
        elements.lightboxLoader.classList.add('hidden');
    };
    newImage.src = image.urls.regular;
}

/**
 * Updates navigation button states
 */
function updateNavigationButtons() {
    elements.lightboxPrev.disabled = state.currentImageIndex === 0;
    elements.lightboxNext.disabled = state.currentImageIndex === state.filteredImages.length - 1;
}

/**
 * Navigates to next image
 */
function nextImage() {
    if (state.currentImageIndex < state.filteredImages.length - 1) {
        state.currentImageIndex++;
        updateLightboxImage();
        updateNavigationButtons();
        
        if (state.isSlideShowPlaying) {
            resetSlideshowProgress();
        }
    } else if (state.isSlideShowPlaying) {
        // Loop back to first image in slideshow mode
        state.currentImageIndex = 0;
        updateLightboxImage();
        updateNavigationButtons();
        resetSlideshowProgress();
    }
}

/**
 * Navigates to previous image
 */
function prevImage() {
    if (state.currentImageIndex > 0) {
        state.currentImageIndex--;
        updateLightboxImage();
        updateNavigationButtons();
        
        if (state.isSlideShowPlaying) {
            resetSlideshowProgress();
        }
    }
}

// ============================================
// Slideshow Functions
// ============================================

/**
 * Starts the slideshow
 */
function startSlideshow() {
    state.isSlideShowPlaying = true;
    
    // Update UI
    elements.slideshowToggle.classList.add('is-playing');
    elements.slideshowToggle.querySelector('.play-icon').classList.add('hidden');
    elements.slideshowToggle.querySelector('.pause-icon').classList.remove('hidden');
    elements.slideshowProgress.classList.remove('hidden');
    
    // Get interval from select
    const interval = parseInt(elements.slideshowInterval.value) || CONFIG.slideshowInterval;
    
    // Start progress animation
    resetSlideshowProgress();
    
    // Start timer
    state.slideshowTimer = setInterval(() => {
        nextImage();
    }, interval);
}

/**
 * Stops the slideshow
 */
function stopSlideshow() {
    state.isSlideShowPlaying = false;
    
    // Update UI
    elements.slideshowToggle.classList.remove('is-playing');
    elements.slideshowToggle.querySelector('.play-icon').classList.remove('hidden');
    elements.slideshowToggle.querySelector('.pause-icon').classList.add('hidden');
    elements.slideshowProgress.classList.add('hidden');
    
    // Clear timers
    if (state.slideshowTimer) {
        clearInterval(state.slideshowTimer);
        state.slideshowTimer = null;
    }
    
    if (state.slideshowProgressTimer) {
        clearTimeout(state.slideshowProgressTimer);
        state.slideshowProgressTimer = null;
    }
    
    elements.slideshowProgressBar.style.width = '0%';
}

/**
 * Toggles slideshow play/pause
 */
function toggleSlideshow() {
    if (state.isSlideShowPlaying) {
        stopSlideshow();
    } else {
        startSlideshow();
    }
}

/**
 * Resets slideshow progress bar animation
 */
function resetSlideshowProgress() {
    const interval = parseInt(elements.slideshowInterval.value) || CONFIG.slideshowInterval;
    
    elements.slideshowProgressBar.style.transition = 'none';
    elements.slideshowProgressBar.style.width = '0%';
    
    // Force reflow
    elements.slideshowProgressBar.offsetHeight;
    
    elements.slideshowProgressBar.style.transition = `width ${interval}ms linear`;
    elements.slideshowProgressBar.style.width = '100%';
}

// ============================================
// Fullscreen Functions
// ============================================

/**
 * Enters fullscreen mode
 */
async function enterFullscreen() {
    try {
        if (elements.lightbox.requestFullscreen) {
            await elements.lightbox.requestFullscreen();
        } else if (elements.lightbox.webkitRequestFullscreen) {
            await elements.lightbox.webkitRequestFullscreen();
        } else if (elements.lightbox.msRequestFullscreen) {
            await elements.lightbox.msRequestFullscreen();
        }
        
        state.isFullscreen = true;
        elements.lightbox.classList.add('fullscreen');
        elements.fullscreenBtn.querySelector('.fullscreen-enter').classList.add('hidden');
        elements.fullscreenBtn.querySelector('.fullscreen-exit').classList.remove('hidden');
    } catch (error) {
        console.warn('Fullscreen not supported:', error);
    }
}

/**
 * Exits fullscreen mode
 */
async function exitFullscreen() {
    try {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        }
        
        state.isFullscreen = false;
        elements.lightbox.classList.remove('fullscreen');
        elements.fullscreenBtn.querySelector('.fullscreen-enter').classList.remove('hidden');
        elements.fullscreenBtn.querySelector('.fullscreen-exit').classList.add('hidden');
    } catch (error) {
        console.warn('Exit fullscreen error:', error);
    }
}

/**
 * Toggles fullscreen mode
 */
function toggleFullscreen() {
    if (state.isFullscreen) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

// ============================================
// Download Function
// ============================================

/**
 * Downloads the current image
 */
async function downloadImage() {
    const image = state.filteredImages[state.currentImageIndex];
    if (!image) return;
    
    try {
        // Show loading state on button
        elements.downloadBtn.disabled = true;
        
        // Fetch image as blob
        const response = await fetch(image.urls.full);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${image.title.replace(/[^a-z0-9]/gi, '_')}_${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: open in new tab
        window.open(image.urls.full, '_blank');
    } finally {
        elements.downloadBtn.disabled = false;
    }
}

// ============================================
// Category Filter Functions
// ============================================

/**
 * Filters gallery by category
 * @param {string} category - Category to filter
 * @param {boolean} forceReload - Force reload even if same category
 */
async function filterByCategory(category, forceReload = false) {
    if (category === state.currentCategory && !forceReload) return;
    
    // Clear search when changing category
    if (state.searchQuery) {
        state.searchQuery = '';
        elements.searchInput.value = '';
        elements.searchResultsInfo.classList.add('hidden');
        elements.searchClear.classList.add('hidden');
    }
    
    state.currentCategory = category;
    state.currentPage = 1;
    state.filteredImages = [];
    state.hasMoreImages = true;
    
    // Update active button state
    elements.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Hide empty states
    elements.noResults.classList.add('hidden');
    elements.emptyFavorites.classList.add('hidden');
    elements.endOfContent.classList.add('hidden');
    elements.scrollSentinel.classList.remove('hidden');
    
    if (category === 'favorites') {
        loadFavoritesView();
    } else {
        showSkeletonLoading();
    await loadImages();
    }
}

/**
 * Loads favorites view
 */
function loadFavoritesView() {
    if (state.favorites.length === 0) {
        elements.galleryGrid.innerHTML = '';
        elements.emptyFavorites.classList.remove('hidden');
        elements.scrollSentinel.classList.add('hidden');
        return;
    }
    
    // Get favorited images from all images
    const favoriteImages = state.images.filter(img => state.favorites.includes(img.id));
    
    // Also check fallback images
    const fallbackFavorites = fallbackImages.filter(img => state.favorites.includes(img.id));
    
    // Merge unique images
    const allFavorites = [...favoriteImages];
    fallbackFavorites.forEach(img => {
        if (!allFavorites.find(f => f.id === img.id)) {
            allFavorites.push(img);
        }
    });
    
    state.filteredImages = allFavorites;
    
    if (allFavorites.length === 0) {
        elements.galleryGrid.innerHTML = '';
        elements.emptyFavorites.classList.remove('hidden');
    } else {
        elements.emptyFavorites.classList.add('hidden');
        renderGallery(allFavorites, false);
    }
    
    elements.scrollSentinel.classList.add('hidden');
    elements.endOfContent.classList.add('hidden');
}

// ============================================
// Infinite Scroll Functions
// ============================================

/**
 * Sets up Intersection Observer for infinite scroll
 */
function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !state.isLoading && state.hasMoreImages && state.currentCategory !== 'favorites') {
                loadMoreImages();
            }
        });
    }, {
        rootMargin: '200px'
    });
    
    observer.observe(elements.scrollSentinel);
}

/**
 * Loads images and renders them
 * @param {boolean} append - Whether to append to existing images
 */
async function loadImages(append = false) {
    if (state.isLoading) return;
    
    state.isLoading = true;
    
    if (!append) {
        showSkeletonLoading();
    } else {
        elements.loader.classList.remove('hidden');
    }
    
    try {
        const newImages = await fetchImages(state.currentCategory, state.currentPage);
        
        if (newImages.length === 0) {
            state.hasMoreImages = false;
            elements.endOfContent.classList.remove('hidden');
            elements.scrollSentinel.classList.add('hidden');
            
            if (!append) {
                elements.galleryGrid.innerHTML = '';
            }
        } else {
            if (append) {
                state.filteredImages = [...state.filteredImages, ...newImages];
                state.images = [...state.images, ...newImages];
            } else {
                state.filteredImages = newImages;
                state.images = [...state.images, ...newImages.filter(img => !state.images.find(i => i.id === img.id))];
            }
            
            removeSkeletons();
            renderGallery(newImages, append);
            
            // Check if we should load more (less than expected)
            if (newImages.length < CONFIG.imagesPerPage) {
                state.hasMoreImages = false;
                elements.endOfContent.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading images:', error);
    } finally {
        state.isLoading = false;
        elements.loader.classList.add('hidden');
    }
}

/**
 * Loads more images (pagination)
 */
async function loadMoreImages() {
    state.currentPage++;
    await loadImages(true);
}

// ============================================
// Accessibility Functions
// ============================================

/**
 * Traps keyboard focus inside an element.
 * The handler reference is stored on the state so it can later be
 * removed by releaseFocusTrap(), preventing listener accumulation.
 * @param {HTMLElement} element - Element to trap focus in
 */
function trapFocus(element) {
    // Remove any previously attached trap before adding a new one
    releaseFocusTrap();
    
    function handleTab(event) {
        if (event.key !== 'Tab') return;
        
        // Query focusable elements lazily so dynamic controls are included
        const focusableElements = [...element.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )].filter(el => el.offsetParent !== null);
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
    
    state.focusTrapHandler = { element, handler: handleTab };
    element.addEventListener('keydown', handleTab);
}

/**
 * Removes the active focus trap listener, if any
 */
function releaseFocusTrap() {
    if (state.focusTrapHandler) {
        const { element, handler } = state.focusTrapHandler;
        element.removeEventListener('keydown', handler);
        state.focusTrapHandler = null;
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Escapes a value so it is safe inside both HTML text and
 * double/single quoted attributes (prevents XSS and attribute breakout)
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Mobile Menu Functions
// ============================================

/**
 * Toggles the mobile menu open/closed state
 */
function toggleMobileMenu() {
    const isOpen = elements.mobileMenuToggle.classList.contains('active');
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

/**
 * Opens the mobile navigation menu
 */
function openMobileMenu() {
    elements.mobileMenuToggle.classList.add('active');
    elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    elements.mobileMenuOverlay.classList.add('active');
    elements.nav.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the mobile navigation menu
 */
function closeMobileMenu() {
    elements.mobileMenuToggle.classList.remove('active');
    elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    elements.mobileMenuOverlay.classList.remove('active');
    elements.nav.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Handles window resize to close mobile menu on desktop
 */
function handleResize() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

// Add resize listener
window.addEventListener('resize', debounce(handleResize, 150));

// ============================================
// Event Listeners Setup
// ============================================

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // Mobile menu toggle
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Mobile menu overlay click to close
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Language toggle
    if (elements.langToggle) {
        elements.langToggle.addEventListener('click', toggleLanguage);
    }
    
    // Category navigation
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterByCategory(btn.dataset.category);
            // Close mobile menu after selection on mobile
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Search
    elements.searchInput.addEventListener('input', debounce((e) => {
        if (e.target.value.trim()) {
            performSearch(e.target.value);
        } else {
            clearSearch();
        }
    }, 300));
    
    elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch(e.target.value);
        }
    });
    
    elements.searchBtn.addEventListener('click', () => {
        performSearch(elements.searchInput.value);
    });
    
    elements.searchClear.addEventListener('click', clearSearch);
    elements.clearSearchBtn.addEventListener('click', clearSearch);
    
    // Lightbox controls
    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightboxPrev.addEventListener('click', prevImage);
    elements.lightboxNext.addEventListener('click', nextImage);
    elements.lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
    
    // Slideshow controls
    elements.slideshowToggle.addEventListener('click', toggleSlideshow);
    elements.slideshowInterval.addEventListener('change', () => {
        if (state.isSlideShowPlaying) {
            stopSlideshow();
            startSlideshow();
        }
    });
    
    // Lightbox action buttons
    elements.favoriteBtn.addEventListener('click', () => {
        const image = state.filteredImages[state.currentImageIndex];
        if (image) {
            toggleFavorite(image.id);
        }
    });
    
    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Fullscreen change event
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Touch/Swipe support
    setupTouchSupport();
}

/**
 * Handles fullscreen change event
 */
function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    
    if (!isFullscreen && state.isFullscreen) {
        state.isFullscreen = false;
        elements.lightbox.classList.remove('fullscreen');
        elements.fullscreenBtn.querySelector('.fullscreen-enter').classList.remove('hidden');
        elements.fullscreenBtn.querySelector('.fullscreen-exit').classList.add('hidden');
    }
}

/**
 * Handles keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
    if (!state.isLightboxOpen) return;
    
    switch (event.key) {
        case 'Escape':
            if (state.isFullscreen) {
                exitFullscreen();
            } else {
            closeLightbox();
            }
            break;
        case 'ArrowLeft':
            event.preventDefault();
            prevImage();
            break;
        case 'ArrowRight':
            event.preventDefault();
            nextImage();
            break;
        case 'Home':
            event.preventDefault();
            state.currentImageIndex = 0;
            updateLightboxImage();
            updateNavigationButtons();
            break;
        case 'End':
            event.preventDefault();
            state.currentImageIndex = state.filteredImages.length - 1;
            updateLightboxImage();
            updateNavigationButtons();
            break;
        case ' ':
            event.preventDefault();
            toggleSlideshow();
            break;
        case 'f':
        case 'F':
            event.preventDefault();
            toggleFullscreen();
            break;
        case 'd':
        case 'D':
            event.preventDefault();
            downloadImage();
            break;
    }
}

/**
 * Sets up touch/swipe support for lightbox
 */
function setupTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const lightboxContent = elements.lightbox.querySelector('.lightbox-content');
    
    lightboxContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightboxContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    }
}

// ============================================
// Initialization
// ============================================

/**
 * Initializes the gallery application
 */
async function init() {
    // Apply language before rendering any UI text
    setLanguage(resolveInitialLanguage());
    
    // Load favorites from localStorage
    state.favorites = loadFavorites();
    updateFavoritesUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup infinite scroll
    setupInfiniteScroll();
    
    // Load initial images
    await loadImages();
    
    console.log('Lumina Gallery initialized successfully');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
