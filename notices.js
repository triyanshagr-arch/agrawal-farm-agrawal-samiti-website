document.addEventListener('DOMContentLoaded', () => {
    loadNotices();
});

function loadNotices() {
    const container = document.getElementById('dynamic-notices');
    const achievementsContainer = document.getElementById('dynamic-achievements');
    if (!container) return;

    // 1. Load from cache instantly if available
    const cachedNoticesStr = localStorage.getItem('cachedNotices');
    if (cachedNoticesStr) {
        try {
            const data = JSON.parse(cachedNoticesStr);
            const regularNotices = data.notices.filter(n => !n.title.startsWith('[ACHIEVEMENT]'));
            const achievementNotices = data.notices.filter(n => n.title.startsWith('[ACHIEVEMENT]'));
            renderNotices(regularNotices, container);
            if (achievementsContainer && achievementNotices.length > 0) {
                renderAchievements(achievementNotices, achievementsContainer);
            }
        } catch(e) {
            console.error('Error parsing cached notices', e);
        }
    } else {
        // Only show loading if we don't have cache
        container.innerHTML = '<li style="text-align:center;"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br><span class="lang-hi">लोड हो रहा है...</span><span class="lang-en">Loading...</span></li>';
    }

    // 2. Fetch fresh data in the background
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_notices&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.notices) {
                const newDataStr = JSON.stringify(data);
                if (cachedNoticesStr !== newDataStr) {
                    const regularNotices = data.notices.filter(n => !n.title.startsWith('[ACHIEVEMENT]'));
                    const achievementNotices = data.notices.filter(n => n.title.startsWith('[ACHIEVEMENT]'));
                    
                    renderNotices(regularNotices, container);
                    
                    if (achievementsContainer && achievementNotices.length > 0) {
                        renderAchievements(achievementNotices, achievementsContainer);
                    }
                    localStorage.setItem('cachedNotices', newDataStr);
                }
            } else if (!cachedNoticesStr) {
                container.innerHTML = '<li style="color:red;"><span class="lang-hi">सूचनाएँ लोड करने में विफल।</span><span class="lang-en">Failed to load notices.</span></li>';
            }
        })
        .catch(err => {
            console.error(err);
            if (!cachedNoticesStr) {
                container.innerHTML = '<li style="color:red;"><span class="lang-hi">सूचनाएँ लोड करने में त्रुटि। कृपया अपना कनेक्शन जांचें।</span><span class="lang-en">Error loading notices. Please check your connection.</span></li>';
            }
        });
}

function renderNotices(notices, container) {
    container.innerHTML = '';
    
    if (notices.length === 0) {
        container.innerHTML = '<li><p style="color: #666;"><span class="lang-hi">इस समय कोई नई सूचना नहीं है।</span><span class="lang-en">No new notices at this time.</span></p></li>';
        return;
    }
    
    notices.forEach(n => {
        const li = document.createElement('li');
        li.style.marginBottom = "15px";
        li.style.paddingBottom = "15px";
        li.style.borderBottom = "1px solid #eee";
        
        let linkHtml = '';
        if (n.link && n.link.trim() !== '') {
            linkHtml = `<br><a href="${n.link}" target="_blank" style="color: var(--primary-color); font-size: 0.9em; text-decoration: underline;"><i class="fas fa-link"></i> <span class="lang-hi">दस्तावेज़ / लिंक देखें</span><span class="lang-en">View Document / Link</span></a>`;
        }
        
        const partsTitle = n.title.split('|||');
        const titleHi = partsTitle[0];
        const titleEn = partsTitle[1] || partsTitle[0];

        const partsDesc = n.description.split('|||');
        const descHi = partsDesc[0].replace(/\n/g, '<br>');
        const descEn = partsDesc[1] ? partsDesc[1].replace(/\n/g, '<br>') : descHi;

        let displayDate = n.date;
        try {
            const d = new Date(n.date);
            if (!isNaN(d.getTime())) {
                displayDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
        } catch(e) {}

        li.innerHTML = `
            <strong><span class="lang-hi">${titleHi}</span><span class="lang-en">${titleEn}</span></strong><br>
            <span style="font-size: 0.9em; color: var(--secondary-color);"><i class="far fa-clock"></i> ${displayDate}</span>
            <p style="margin-top: 5px; color: var(--text-dark);"><span class="lang-hi">${descHi}</span><span class="lang-en">${descEn}</span></p>
            ${linkHtml}
        `;
        container.appendChild(li);
    });
}

function renderAchievements(achievements, container) {
    container.innerHTML = '';
    
    // Group achievements by category
    const grouped = {};
    achievements.forEach(n => {
        const cat = n.title.replace('[ACHIEVEMENT] ', '');
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(n.description);
    });

    const icons = {
        "Class 10th & 12th Board": { icon: "fa-medal", color: "gold" },
        "JEE & NEET": { icon: "fa-user-graduate", color: "var(--secondary-color)" },
        "UPSC / State PCS": { icon: "fa-landmark", color: "#4CAF50" },
        "Other": { icon: "fa-star", color: "var(--primary-color)" }
    };

    for (const [cat, students] of Object.entries(grouped)) {
        const li = document.createElement('li');
        li.style.background = "var(--white)";
        li.style.padding = "15px";
        li.style.borderRadius = "8px";
        li.style.textAlign = "center";
        li.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
        
        const styleInfo = icons[cat] || icons["Other"];

        let studentsHtml = students.map(desc => {
            const parts = desc.split('|||');
            
            const hiParts = parts[0].split('|');
            const nameHi = hiParts[0];
            const scoreHi = hiParts.length > 1 ? ` (${hiParts[1]})` : '';
            
            let nameEn = nameHi;
            let scoreEn = scoreHi;
            
            if (parts.length > 1) {
                const enParts = parts[1].split('|');
                nameEn = enParts[0];
                scoreEn = enParts.length > 1 ? ` (${enParts[1]})` : '';
            }

            return `• <span class="lang-hi">${nameHi}${scoreHi}</span><span class="lang-en">${nameEn}${scoreEn}</span>`;
        }).join('<br>');

        let catDisplay = cat;
        if (cat === 'Class 10th & 12th Board') {
            catDisplay = '<span class="lang-hi">कक्षा 10वीं और 12वीं बोर्ड</span><span class="lang-en">Class 10th & 12th Board</span>';
        } else if (cat === 'JEE & NEET') {
            catDisplay = '<span class="lang-hi">जेईई और नीट</span><span class="lang-en">JEE & NEET</span>';
        } else if (cat === 'UPSC / State PCS') {
            catDisplay = '<span class="lang-hi">यूपीएससी / स्टेट पीसीएस</span><span class="lang-en">UPSC / State PCS</span>';
        } else {
            catDisplay = `<span class="lang-hi">${cat}</span><span class="lang-en">${cat}</span>`;
        }

        li.innerHTML = `
            <i class="fas ${styleInfo.icon}" style="color: ${styleInfo.color}; font-size: 2rem; margin-bottom: 10px;"></i><br>
            <strong style="color: var(--primary-color);">${catDisplay}</strong><br>
            <div style="font-size: 0.9em; color: var(--text-dark); margin-top: 10px; text-align: left; display: inline-block;">
                ${studentsHtml}
            </div>
        `;
        container.appendChild(li);
    }
}
