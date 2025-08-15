let allImages = [];
let viewerInstance = null;
let activeCategory = 'Todas';
let activeCharacter = 'Todos';

const galleryDiv = document.getElementById('gallery');
const categoryFilterDiv = document.getElementById('category-filters');
const characterFilterDiv = document.getElementById('character-filters');
const backToTopButton = document.getElementById('back-to-top');

function renderGallery(imagesToDisplay) {
    galleryDiv.innerHTML = '';
    if (viewerInstance) {
        viewerInstance.destroy();
    }

    imagesToDisplay.forEach(imageInfo => {
        const figureElement = document.createElement('figure');
        figureElement.classList.add('gallery-item');

        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        const imgElement = document.createElement('img');
        imgElement.src = `./${imageInfo.path}`;
        imgElement.alt = imageInfo.title;
        imgElement.loading = 'lazy';

        const figcaptionElement = document.createElement('figcaption');
        figcaptionElement.textContent = imageInfo.title;

        imageContainer.appendChild(imgElement);
        figureElement.appendChild(imageContainer);
        figureElement.appendChild(figcaptionElement);
        galleryDiv.appendChild(figureElement);
    });

    viewerInstance = new Viewer(galleryDiv, {
        inline: false,
        button: true,
        navbar: true,
        title: (image) => image.alt,
        toolbar: true,
        tooltip: true,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        transition: true,
        fullscreen: true,
        keyboard: true,
        url: 'src',
    });
}

function applyFilters() {
    let filteredImages = allImages;

    if (activeCategory !== 'Todas') {
        filteredImages = filteredImages.filter(img => img.category === activeCategory);
    }

    if (activeCharacter !== 'Todos') {
        filteredImages = filteredImages.filter(img => img.character === activeCharacter);
    }

    renderGallery(filteredImages);
}

fetch('./imagelist.json')
    .then(response => response.json())
    .then(data => {
        allImages = data.images;

        // Category Filters
        const allCategoriesButton = document.createElement('button');
        allCategoriesButton.textContent = 'Todas';
        allCategoriesButton.classList.add('filter-button', 'active');
        allCategoriesButton.addEventListener('click', () => {
            document.querySelectorAll('#category-filters .filter-button').forEach(btn => btn.classList.remove('active'));
            allCategoriesButton.classList.add('active');
            activeCategory = 'Todas';
            applyFilters();
        });
        categoryFilterDiv.appendChild(allCategoriesButton);

        data.categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category;
            button.classList.add('filter-button');
            button.addEventListener('click', () => {
                document.querySelectorAll('#category-filters .filter-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeCategory = category;
                applyFilters();
            });
            categoryFilterDiv.appendChild(button);
        });

        // Character Filters
        const allCharactersButton = document.createElement('button');
        allCharactersButton.textContent = 'Todos';
        allCharactersButton.classList.add('filter-button', 'active');
        allCharactersButton.addEventListener('click', () => {
            document.querySelectorAll('#character-filters .filter-button').forEach(btn => btn.classList.remove('active'));
            allCharactersButton.classList.add('active');
            activeCharacter = 'Todos';
            applyFilters();
        });
        characterFilterDiv.appendChild(allCharactersButton);

        data.characters.forEach(character => {
            const button = document.createElement('button');
            button.textContent = character;
            button.classList.add('filter-button');
            button.addEventListener('click', () => {
                document.querySelectorAll('#character-filters .filter-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeCharacter = character;
                applyFilters();
            });
            characterFilterDiv.appendChild(button);
        });

        applyFilters();
    })
    .catch(error => console.error('Error loading image list:', error));

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'flex';
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});