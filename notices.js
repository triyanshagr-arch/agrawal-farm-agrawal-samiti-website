document.addEventListener('DOMContentLoaded', () => {
    loadNotices();
});

function loadNotices() {
    const container = document.getElementById('dynamic-notices');
    const achievementsContainer = document.getElementById('dynamic-achievements');
    if (!container) return;

    fetch(`${GOOGLE_SCRIPT_URL}?action=get_notices&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.notices) {
                const regularNotices = data.notices.filter(n => !n.title.startsWith('[ACHIEVEMENT]'));
                const achievementNotices = data.notices.filter(n => n.title.startsWith('[ACHIEVEMENT]'));
                
                renderNotices(regularNotices, container);
                
                if (achievementsContainer && achievementNotices.length > 0) {
                    renderAchievements(achievementNotices, achievementsContainer);
                }
            } else {
                container.innerHTML = '<li style="color:red;">Failed to load notices.</li>';
            }
        })
        .catch(err => {
            container.innerHTML = '<li style="color:red;">Error loading notices. Please check your connection.</li>';
        });
}

function renderNotices(notices, container) {
    container.innerHTML = '';
    
    if (notices.length === 0) {
        container.innerHTML = '<li><p style="color: #666;">No new notices at this time.</p></li>';
        return;
    }
    
    notices.forEach(n => {
        const li = document.createElement('li');
        li.style.marginBottom = "15px";
        li.style.paddingBottom = "15px";
        li.style.borderBottom = "1px solid #eee";
        
        let linkHtml = '';
        if (n.link && n.link.trim() !== '') {
            linkHtml = `<br><a href="${n.link}" target="_blank" style="color: var(--primary-color); font-size: 0.9em; text-decoration: underline;"><i class="fas fa-link"></i> View Document / Link</a>`;
        }
        
        li.innerHTML = `
            <strong>${n.title}</strong><br>
            <span style="font-size: 0.9em; color: var(--secondary-color);"><i class="far fa-clock"></i> ${n.date}</span>
            <p style="margin-top: 5px; color: var(--text-dark);">${n.description.replace(/\n/g, '<br>')}</p>
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
            const parts = desc.split('|');
            const name = parts[0];
            const score = parts.length > 1 ? ` (${parts[1]})` : '';
            return `• ${name}${score}`;
        }).join('<br>');

        li.innerHTML = `
            <i class="fas ${styleInfo.icon}" style="color: ${styleInfo.color}; font-size: 2rem; margin-bottom: 10px;"></i><br>
            <strong style="color: var(--primary-color);">${cat}</strong><br>
            <div style="font-size: 0.9em; color: var(--text-dark); margin-top: 10px; text-align: left; display: inline-block;">
                ${studentsHtml}
            </div>
        `;
        container.appendChild(li);
    }
}
