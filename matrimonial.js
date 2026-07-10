document.addEventListener('DOMContentLoaded', () => {
    loadPublicMatrimonialProfiles();
});

function loadPublicMatrimonialProfiles() {
    const loader = document.getElementById('matrimonialGalleryLoader');
    const gallery = document.getElementById('matrimonialGallery');
    
    // We fetch from the globally defined GOOGLE_SCRIPT_URL
    // But since it's not defined in matrimonial.html, we need to define it or fetch it.
    // wait, is GOOGLE_SCRIPT_URL defined in matrimonial.html? No, only in admin.html, notices.html, and submit_handler.js
    // I'll define it here so this script is self-contained.
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJ1e5XCWBYEwbm7tQBgfkYsLHFDhGHZXpztTwkbbwCkuRfZv6BHZ0qTSiVY9k68rE/exec';

    fetch(`${SCRIPT_URL}?action=get_public_matrimonial&t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            if (data.profiles && data.profiles.length > 0) {
                gallery.style.display = 'grid';
                renderGallery(data.profiles);
            } else {
                loader.innerHTML = '<i class="fas fa-info-circle fa-2x"></i><br><br>No profiles available right now.';
                loader.style.display = 'block';
            }
        })
        .catch(err => {
            console.error(err);
            loader.innerHTML = '<i class="fas fa-exclamation-triangle fa-2x" style="color:#d32f2f;"></i><br><br>Failed to load profiles.';
        });
}

function renderGallery(profiles) {
    const gallery = document.getElementById('matrimonialGallery');
    gallery.innerHTML = '';
    
    profiles.forEach(p => {
        // Build card
        const card = document.createElement('div');
        card.className = 'matrimonial-card';
        card.style.cssText = 'background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s; display: flex; flex-direction: column;';
        
        // Default avatar if no photo
        let photoUrl = p.photo && p.photo.trim() !== '' ? p.photo : 'images/default_avatar.png'; // Need a fallback or just empty div
        
        const photoSection = p.photo ? `
            <div style="height: 250px; overflow: hidden; background: #eee;">
                <img src="${p.photo}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: top;">
            </div>
        ` : `
            <div style="height: 200px; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #ccc;">
                <i class="fas fa-user"></i>
            </div>
        `;
        
        card.innerHTML = `
            ${photoSection}
            <div style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; color: #d32f2f; margin-bottom: 5px; font-size: 1.4rem;">${p.name || 'Unknown'}</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">
                    <i class="fas fa-venus-mars"></i> ${p.gender || '-'} &nbsp;|&nbsp; 
                    <i class="fas fa-birthday-cake"></i> ${p.dob || '-'}
                </p>
                
                <div style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px; flex-grow: 1;">
                    <div><strong>Gotra:</strong> ${p.gotra || '-'}</div>
                    <div><strong>Education:</strong> ${p.education || '-'}</div>
                    <div><strong>Profession:</strong> ${p.profession || '-'}</div>
                </div>
                
                <button class="btn-primary" onclick="showContactModal('${escapeHtml(p.name)}')" style="width: 100%; margin-top: auto; border-radius: 4px; padding: 10px;">
                    <i class="fas fa-envelope"></i> Contact Admin
                </button>
            </div>
        `;
        
        // Add hover effect via JS since CSS isn't defined
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        
        gallery.appendChild(card);
    });
}

function showContactModal(profileName) {
    Swal.fire({
        title: 'Interested in ' + profileName + '?',
        text: 'To protect privacy, contact details are kept secure. Please WhatsApp the Admin to request more details or connect with this family.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '<i class="fab fa-whatsapp"></i> WhatsApp Admin',
        cancelButtonText: 'Close',
        confirmButtonColor: '#25D366'
    }).then((result) => {
        if (result.isConfirmed) {
            const msg = encodeURIComponent(`Namaste, I would like more information regarding the Matrimonial profile of ${profileName} listed on the website.`);
            window.open(`https://wa.me/919829220486?text=${msg}`, '_blank');
        }
    });
}

function escapeHtml(unsafe) {
    if(!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
