document.addEventListener('DOMContentLoaded', () => {
    loadPublicGallery();
});

function loadPublicGallery() {
    const galleryGrid = document.getElementById('dynamic-gallery-grid');
    const activitiesGrid = document.getElementById('dynamic-activities-grid');
    const galleryLoader = document.getElementById('gallery-loader');
    const activitiesLoader = document.getElementById('activities-loader');
    
    // Determine which page we are on
    const isGalleryPage = !!galleryGrid;
    const isActivitiesPage = !!activitiesGrid;
    
    if (!isGalleryPage && !isActivitiesPage) return;

    // 1. Instantly load from cache if available
    const cachedGalleryStr = localStorage.getItem('cachedGalleryPhotos');
    if (cachedGalleryStr) {
        try {
            const data = JSON.parse(cachedGalleryStr);
            renderPhotos(data.photos, isGalleryPage, isActivitiesPage);
            if (galleryLoader) galleryLoader.style.display = 'none';
            if (activitiesLoader) activitiesLoader.style.display = 'none';
            if(typeof updateLanguage === 'function') setTimeout(updateLanguage, 50);
        } catch(e) {
            console.error('Error parsing cached gallery', e);
        }
    }

    // 2. Fetch fresh data in the background
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby08nUWGacQ6RlJNVu76AfH3IWNZczVF8ePdDS2TudKySASjGb-B-6NTR__p6iZdnEE/exec';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_gallery_photos&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (!cachedGalleryStr) {
                if (galleryLoader) galleryLoader.style.display = 'none';
                if (activitiesLoader) activitiesLoader.style.display = 'none';
            }
            
            if (data.success && data.photos) {
                const newDataStr = JSON.stringify(data);
                if (cachedGalleryStr !== newDataStr) {
                    renderPhotos(data.photos, isGalleryPage, isActivitiesPage);
                    localStorage.setItem('cachedGalleryPhotos', newDataStr);
                    if(typeof updateLanguage === 'function') setTimeout(updateLanguage, 50);
                }
            } else if (!cachedGalleryStr) {
                showError("Error loading photos.");
            }
        })
        .catch(err => {
            console.error(err);
            if (!cachedGalleryStr) {
                showError("Network error. Please check your connection.");
            }
        });
}

function renderPhotos(photos, isGalleryPage, isActivitiesPage) {
    const galleryGrid = document.getElementById('dynamic-gallery-grid');
    const activitiesGrid = document.getElementById('dynamic-activities-grid');
    
    // Filter photos based on category
    const mainGalleryPhotos = photos.filter(p => p.category === 'Gallery');
    const activityPhotos = photos.filter(p => p.category === 'Activities');
    
    if (isGalleryPage && galleryGrid) {
        galleryGrid.innerHTML = '';
        if (mainGalleryPhotos.length === 0) {
            galleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:#666;">No photos in the gallery yet.</div>';
        } else {
            mainGalleryPhotos.forEach(p => {
                galleryGrid.appendChild(createPhotoCard(p));
            });
        }
        galleryGrid.style.display = 'grid';
    }
    
    if (isActivitiesPage && activitiesGrid) {
        activitiesGrid.innerHTML = '';
        if (activityPhotos.length === 0) {
            activitiesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:#666;">No activity highlights yet.</div>';
        } else {
            activityPhotos.forEach(p => {
                activitiesGrid.appendChild(createPhotoCard(p));
            });
        }
        activitiesGrid.style.display = 'grid';
    }
}

function createPhotoCard(photo) {
    const div = document.createElement('div');
    // We add 'visible' so it doesn't stay hidden by the scroll animation CSS
    div.className = 'gallery-item animate-on-scroll visible';
    
    // Create an image element instead of a placeholder
    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = photo.title || 'Gallery Photo';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.loading = 'lazy';
    
    div.appendChild(img);
    
    if (photo.title) {
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        overlay.innerHTML = `<span>${photo.title}</span>`;
        div.appendChild(overlay);
    }
    
    // Simple lightbox functionality
    div.addEventListener('click', () => {
        const lightbox = document.createElement('div');
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100vw';
        lightbox.style.height = '100vh';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0.9)';
        lightbox.style.zIndex = '99999';
        lightbox.style.display = 'flex';
        lightbox.style.flexDirection = 'column';
        lightbox.style.justifyContent = 'center';
        lightbox.style.alignItems = 'center';
        lightbox.style.cursor = 'pointer';
        
        const lbImg = document.createElement('img');
        lbImg.src = photo.imageUrl;
        lbImg.style.maxWidth = '90%';
        lbImg.style.maxHeight = '85%';
        lbImg.style.objectFit = 'contain';
        lbImg.style.borderRadius = '8px';
        lbImg.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        
        const lbTitle = document.createElement('div');
        lbTitle.style.color = 'white';
        lbTitle.style.marginTop = '15px';
        lbTitle.style.fontSize = '1.2rem';
        lbTitle.innerText = photo.title || '';
        
        lightbox.appendChild(lbImg);
        if(photo.title) lightbox.appendChild(lbTitle);
        
        lightbox.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        
        document.body.appendChild(lightbox);
    });
    
    return div;
}

function showError(msg) {
    const gl = document.getElementById('gallery-loader');
    const al = document.getElementById('activities-loader');
    if(gl) {
        gl.innerHTML = `<i class="fas fa-exclamation-triangle fa-2x" style="color:red;"></i><br><br><span style="color:red;">${msg}</span>`;
    }
    if(al) {
        al.innerHTML = `<i class="fas fa-exclamation-triangle fa-2x" style="color:red;"></i><br><br><span style="color:red;">${msg}</span>`;
    }
}
