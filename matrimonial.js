
let allProfiles = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPublicMatrimonialProfiles();
    
    const searchInput = document.getElementById('searchProfile');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allProfiles.filter(p => {
                return (p.name && p.name.toLowerCase().includes(query)) ||
                       (p.gotra && p.gotra.toLowerCase().includes(query)) ||
                       (p.profession && p.profession.toLowerCase().includes(query)) ||
                       (p.education && p.education.toLowerCase().includes(query));
            });
            renderGallery(filtered);
        });
    }
});

function loadPublicMatrimonialProfiles() {
    const loader = document.getElementById('profiles-loader');
    const gallery = document.getElementById('profiles-grid');
    if(!loader || !gallery) return;
    
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAa5F3qja9vdo-8DA_vy9wOuLrQZTD-tDjAXjKrcYKlmaZXZHdyFfziFFlKt0e2BM/exec';

    fetch(`${SCRIPT_URL}?action=get_public_matrimonial&t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            if (data.profiles && data.profiles.length > 0) {
                allProfiles = data.profiles;
                gallery.style.display = 'grid';
                renderGallery(allProfiles);
                
                // Trigger language update if translate exists
                if(typeof updateLanguage === 'function'){
                    setTimeout(updateLanguage, 100);
                }
            } else {
                loader.innerHTML = '<i class="fas fa-info-circle fa-2x"></i><br><br><span class="lang-hi">अभी कोई प्रोफाइल उपलब्ध नहीं है।</span><span class="lang-en">No profiles available right now.</span>';
                loader.style.display = 'block';
            }
        })
        .catch(err => {
            console.error(err);
            loader.innerHTML = '<i class="fas fa-exclamation-triangle fa-2x" style="color:#d32f2f;"></i><br><br><span class="lang-hi">प्रोफाइल लोड करने में विफल।</span><span class="lang-en">Failed to load profiles.</span>';
            loader.style.display = 'block';
        });
}

function calculateAge(dobString) {
    if(!dobString) return '-';
    // Handle both dd/mm/yyyy and yyyy-mm-dd
    let parts = dobString.split(/[\/\-]/);
    if(parts.length !== 3) return dobString;
    
    let year, month, day;
    if(parts[0].length === 4) { // yyyy-mm-dd
        year = parts[0]; month = parts[1]; day = parts[2];
    } else { // dd/mm/yyyy
        day = parts[0]; month = parts[1]; year = parts[2];
    }
    
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function renderGallery(profiles) {
    const gallery = document.getElementById('profiles-grid');
    if(!gallery) return;
    
    gallery.innerHTML = '';
    
    if(profiles.length === 0) {
        gallery.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;"><span class="lang-hi">कोई प्रोफाइल नहीं मिला।</span><span class="lang-en">No profiles found matching your search.</span></div>';
        return;
    }
    
    profiles.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card profile-card animate-on-scroll';
        card.style.cssText = 'text-align: center; padding: 25px; transition: transform 0.3s;';
        
        let photoSrc = p.photo && p.photo.trim() !== '' ? p.photo : (p.gender === 'Female' ? 'images/placeholder_female.jpg' : 'images/placeholder_male.jpg');
        
        let age = calculateAge(p.dob);
        
        card.innerHTML = `
            <img src="${photoSrc}" onerror="this.src='https://via.placeholder.com/150'" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 4px solid var(--border-color);">
            <h4 style="color: var(--primary-color); margin-bottom: 5px; font-size: 1.4rem;">${escapeHtml(p.name)}</h4>
            <p style="color: var(--text-muted); font-weight: bold; margin-bottom: 10px;">
                <span class="lang-hi">आयु</span><span class="lang-en">Age</span>: ${age} | <span class="lang-hi">ऊंचाई</span><span class="lang-en">Height</span>: ${escapeHtml(p.height || '-')}
            </p>
            <div style="font-size: 0.95rem; text-align: left; line-height: 1.6; margin-bottom: 20px; background: var(--bg-main); padding: 15px; border-radius: 8px;">
                <strong><span class="lang-hi">गोत्र</span><span class="lang-en">Gotra</span>:</strong> ${escapeHtml(p.gotra || '-')}<br>
                <strong><span class="lang-hi">शिक्षा</span><span class="lang-en">Education</span>:</strong> ${escapeHtml(p.education || '-')}<br>
                <strong><span class="lang-hi">पेशा</span><span class="lang-en">Profession</span>:</strong> ${escapeHtml(p.profession || '-')}<br>
                <strong><span class="lang-hi">मांगलिक</span><span class="lang-en">Manglik</span>:</strong> ${escapeHtml(p.manglik || '-')}
            </div>
            <button class="btn btn-outline" style="width: 100%;" onclick="showContactModal('${escapeHtml(p.name)}')"><i class="fas fa-envelope"></i> <span class="lang-hi">संपर्क करें</span><span class="lang-en">Contact</span></button>
        `;
        
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        
        gallery.appendChild(card);
    });
}

function showContactModal(profileName) {
    Swal.fire({
        title: document.body.classList.contains('lang-en') ? `Interested in ${profileName}?` : `क्या आप ${profileName} में रुचि रखते हैं?`,
        text: document.body.classList.contains('lang-en') ? 
            'To protect privacy, contact details are kept secure. Please WhatsApp the Admin to request more details or connect with this family.' : 
            'गोपनीयता की रक्षा के लिए संपर्क विवरण सुरक्षित रखे गए हैं। अधिक विवरण मांगने या इस परिवार से जुड़ने के लिए कृपया एडमिन को व्हाट्सएप करें।',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '<i class="fab fa-whatsapp"></i> ' + (document.body.classList.contains('lang-en') ? 'WhatsApp Admin' : 'व्हाट्सएप एडमिन'),
        cancelButtonText: document.body.classList.contains('lang-en') ? 'Close' : 'बंद करें',
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
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
