# 📸 Lumina Gallery

A modern, responsive, and accessible photo gallery application with stunning UI. Browse beautiful photographs with smooth animations, lightbox viewing, slideshow, search, favorites, and a bilingual (English/Turkish) interface.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Masonry Grid Layout**: Beautiful CSS Grid-based masonry layout that automatically adjusts to image aspect ratios
- **Lightbox Modal**: Full-screen image viewing with smooth transitions and backdrop blur effects
- **Slideshow**: Auto-play mode with adjustable speed (2s–8s) and a live progress bar
- **Fullscreen Mode**: View any photo using the Fullscreen API (with vendor fallbacks)
- **Image Download**: Download the original photo as a blob, with a new-tab fallback
- **Favorites**: Save favorites that persist across sessions via `localStorage`
- **Search**: Debounced search across title, author and description
- **Infinite Scroll**: Seamless pagination powered by `IntersectionObserver`
- **Skeleton Loading**: Animated placeholders while images are fetched
- **Bilingual UI (i18n)**: One-click English/Turkish switch, remembered across visits
- **Keyboard Navigation**: Complete keyboard support including Arrow keys, Escape, Home, End, Space (slideshow), F (fullscreen) and D (download)
- **Touch/Swipe Support**: Mobile-friendly swipe gestures for navigating between images
- **Lazy Loading**: Optimized performance with native lazy loading (`loading="lazy"`)
- **Responsive Images**: Multiple image sizes with `srcset` for optimal loading on all devices
- **Category Filtering**: Filter images by categories (Nature, Architecture, People) plus a Favorites view
- **Accessibility (a11y)**: Full ARIA support, focus trap, focus management, reduced-motion support and screen reader compatibility
- **Dark Theme**: Elegant dark moody theme with gold accents

## Live Demo

[View Live Demo](https://photo-galleryyyyy.netlify.app/)

## Screenshots

### Main Gallery View

The main gallery displays images in a responsive masonry grid layout with hover effects revealing image details.

### Lightbox View

Click any image to open the full-screen lightbox with navigation controls and image information.

### Mobile View

Fully responsive design that adapts to all screen sizes with touch-friendly interactions.

## Technologies

- **HTML5**: Semantic markup with accessibility attributes (ARIA labels, roles)
- **CSS3**: Modern CSS features including Grid, Flexbox, Custom Properties, Animations, and Backdrop Filter
- **Vanilla JavaScript (ES6+)**: Modern JavaScript with modules, async/await, and event delegation
- **Unsplash API**: Optional integration for dynamic photo loading (includes fallback images)
- **Google Fonts**: Playfair Display and Source Sans 3 typography

## Installation

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/Serkanbyx/photo-gallery.git
   cd photo-gallery
   ```

2. **Open in browser**

   Simply open `index.html` in your browser, or use a local server:

   **Using Python:**

   ```bash
   python -m http.server 8080
   ```

   **Using Node.js:**

   ```bash
   npx serve
   ```

   **Using VS Code:**

   - Install "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

3. **Access the application**
   ```
   http://localhost:8080
   ```

### Unsplash API Setup (Optional)

To use dynamic images from Unsplash:

1. Create an account at [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application to get your Access Key
3. Update `js/app.js`:
   ```javascript
   const CONFIG = {
     unsplashAccessKey: "YOUR_ACCESS_KEY_HERE",
     useFallbackImages: false,
     // ...
   };
   ```

## Usage

1. **Browse Gallery**: Scroll through the image grid to explore photographs (more load automatically as you scroll)
2. **Filter by Category**: Click category buttons (All, Nature, Architecture, People) to filter images
3. **Search**: Type in the search box to filter by title, author or description
4. **Favorites**: Click the heart on any photo to save it; open the Favorites view to see them
5. **View Full Size**: Click any image to open the lightbox modal
6. **Navigate Images**: Use arrow buttons, keyboard arrows, or swipe on touch devices
7. **Slideshow / Fullscreen / Download**: Use the lightbox controls (or the `Space`, `F`, `D` keys)
8. **Switch Language**: Use the EN/TR toggle in the header to change the interface language
9. **Close Lightbox**: Click the X button, press Escape, or click outside the image

## How It Works?

### Masonry Grid Layout

The gallery uses CSS Grid with dynamic row spans based on image aspect ratios:

```javascript
function createGalleryItemHTML(image, index) {
  // Calculate grid row span based on aspect ratio
  const rowSpan = Math.ceil((1 / image.aspectRatio) * 25) + 2;

  return `
        <article style="grid-row: span ${rowSpan};">
            <!-- Image content -->
        </article>
    `;
}
```

### Responsive Images

Images are served with multiple sizes using `srcset`:

```html
<img
  src="image-400w.jpg"
  srcset="image-400w.jpg 400w, image-1080w.jpg 1080w"
  sizes="(max-width: 480px) 50vw, (max-width: 900px) 33vw, 25vw"
  loading="lazy"
  decoding="async"
/>
```

### Keyboard Navigation

Full keyboard support for accessibility:

| Key                       | Action                                |
| ------------------------- | ------------------------------------- |
| `Enter` / `Space`         | Open selected image (from the grid)   |
| `Escape`                  | Exit fullscreen, otherwise close      |
| `Arrow Left`              | Previous image                        |
| `Arrow Right`             | Next image                            |
| `Home`                    | First image                           |
| `End`                     | Last image                            |
| `Space`                   | Toggle slideshow (in lightbox)        |
| `F`                       | Toggle fullscreen                     |
| `D`                       | Download current image                |
| `Tab`                     | Navigate between elements (trapped)   |

## Customization

### Change Color Theme

Modify CSS custom properties in `css/styles.css`:

```css
:root {
  /* Primary Colors */
  --color-bg-primary: #0a0a0b;
  --color-accent-primary: #c9a962;
  --color-accent-secondary: #e8d5a3;

  /* Text Colors */
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #a8a8a8;
}
```

### Add New Categories

1. Add button in `index.html`:

   ```html
   <button
     class="nav-btn"
     data-category="animals"
     data_tr="Hayvanlar"
     data_en="Animals"
   >
     Animals
   </button>
   ```

2. Update categories in `js/app.js`:
   ```javascript
   const CONFIG = {
     categories: {
       // ...existing categories
       animals: "animals,wildlife,pets",
     },
   };
   ```

### Add Custom Images

Add images to the `fallbackImages` array in `js/app.js`:

```javascript
const fallbackImages = [
  {
    id: "unique-id",
    title: "Image Title",
    author: "Photographer Name",
    category: "nature",
    urls: {
      small: "url-to-small-image",
      regular: "url-to-regular-image",
      full: "url-to-full-image",
    },
    alt: "Image description for accessibility",
    aspectRatio: 1.5, // width / height
  },
];
```

## Features in Detail

### Completed Features

- ✅ Responsive masonry grid layout
- ✅ Full-screen lightbox with blur overlay
- ✅ Keyboard navigation support
- ✅ Touch/swipe gestures for mobile
- ✅ Category filtering + Favorites view
- ✅ Lazy loading images
- ✅ Responsive srcset implementation
- ✅ Dark theme with elegant typography
- ✅ ARIA accessibility support
- ✅ Smooth CSS animations
- ✅ Focus trap in lightbox modal
- ✅ Image download functionality
- ✅ Infinite scroll pagination
- ✅ Favorites/bookmarks with localStorage
- ✅ Search functionality
- ✅ Slideshow with adjustable speed
- ✅ Fullscreen mode
- ✅ Skeleton loading placeholders
- ✅ Bilingual UI (English / Turkish)

### Future Features

- [ ] Social sharing buttons
- [ ] Image zoom / pan inside the lightbox
- [ ] Light theme option
- [ ] Additional languages

## Project Structure

```
photo-gallery/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles (1600+ lines)
├── js/
│   └── app.js          # Application logic (1500+ lines)
├── docs/
│   └── build-guide.md  # Step-by-step build playbook
├── .github/            # Community health files
│   ├── ISSUE_TEMPLATE/ # Bug report & feature request templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   └── SECURITY.md
├── README.md           # Documentation
├── .gitignore          # Git ignore rules
└── LICENSE             # MIT License
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

   ```bash
   git fork https://github.com/Serkanbyx/photo-gallery.git
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes and commit**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Maintenance tasks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developer

**Serkan Bayraktar**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Acknowledgments

- **[Unsplash](https://unsplash.com/)** - Beautiful free photos
- **[Google Fonts](https://fonts.google.com/)** - Playfair Display & Source Sans 3 fonts
- **[Shields.io](https://shields.io/)** - README badges

## Contact

- **Found a bug?** [Open an issue](https://github.com/Serkanbyx/photo-gallery/issues)
- **Have a suggestion?** [Start a discussion](https://github.com/Serkanbyx/photo-gallery/discussions)
- **Email**: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- **Website**: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

If you like this project, don't forget to give it a star!
