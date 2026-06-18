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
    achievements.forEach(n => {
        const li = document.createElement('li');
        li.style.background = "var(--white)";
        li.style.padding = "15px";
        li.style.borderRadius = "8px";
        li.style.textAlign = "center";
        li.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
        
        let cleanTitle = n.title.replace('[ACHIEVEMENT] ', '');
        let linkHtml = '';
        if (n.link && n.link.trim() !== '') {
            linkHtml = `<br><br><a href="${n.link}" target="_blank" style="color: var(--primary-color); font-size: 0.9em; text-decoration: underline;"><i class="fas fa-link"></i> View Details</a>`;
        }

        li.innerHTML = `
            <i class="fas fa-star" style="color: gold; font-size: 2rem; margin-bottom: 10px;"></i><br>
            <strong style="color: var(--primary-color);">${cleanTitle}</strong><br>
            <div style="font-size: 0.9em; color: var(--text-dark); margin-top: 10px; text-align: left; display: inline-block;">
                ${n.description.replace(/\n/g, '<br>')}
            </div>
            ${linkHtml}
        `;
        container.appendChild(li);
    });
}
