// Fetch and Render Dynamic Events
document.addEventListener('DOMContentLoaded', () => {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby08nUWGacQ6RlJNVu76AfH3IWNZczVF8ePdDS2TudKySASjGb-B-6NTR__p6iZdnEE/exec";
    const cacheKey = "cachedEventsData";
    const cacheTimeKey = "cachedEventsTime";
    const CACHE_DURATION = 15 * 60 * 1000; // 15 mins

    function renderEvents(events) {
        const listContainer = document.getElementById('dynamic-events-list');
        const loader = document.getElementById('events-loader');
        
        if (!listContainer || !loader) return;

        if (!events || events.length === 0) {
            loader.style.display = 'none';
            listContainer.style.display = 'block';
            listContainer.innerHTML = '<p style="text-align: center; color: #666;">No activities planned at the moment.</p>';
            return;
        }

        let html = '';
        events.forEach(event => {
            const titleParts = event.title.split('|||');
            const freqParts = event.frequency.split('|||');
            const descParts = event.description.split('|||');

            const titleHi = titleParts[0] || '';
            const titleEn = titleParts[1] || titleHi;

            const freqHi = freqParts[0] || '';
            const freqEn = freqParts[1] || freqHi;

            const descHi = descParts[0] || '';
            const descEn = descParts[1] || descHi;

            html += `
                <div class="activity-item">
                    <div class="activity-logo">
                        <div class="logo-placeholder tiny" style="background-image: none;"><i class="${event.icon}"></i></div>
                    </div>
                    <div class="activity-content">
                        <h3><span class="lang-hi">${titleHi}</span><span class="lang-en">${titleEn}</span></h3>
                        <p class="activity-date"><i class="far fa-calendar-alt"></i> <span class="lang-hi">${freqHi}</span><span class="lang-en">${freqEn}</span></p>
                        <p><span class="lang-hi">${descHi}</span><span class="lang-en">${descEn}</span></p>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
        loader.style.display = 'none';
        listContainer.style.display = 'block';

        // Force language update
        const isEnglish = localStorage.getItem('siteLang') === 'en';
        document.querySelectorAll('.lang-hi').forEach(el => el.style.display = isEnglish ? 'none' : 'inline');
        document.querySelectorAll('.lang-en').forEach(el => el.style.display = isEnglish ? 'inline' : 'none');
    }

    // Zero-delay rendering
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedData && cachedTime && (Date.now() - cachedTime < CACHE_DURATION)) {
        renderEvents(JSON.parse(cachedData));
        // Still fetch in background to silently update cache
        fetch(`${GOOGLE_SCRIPT_URL}?action=get_events`)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    localStorage.setItem(cacheKey, JSON.stringify(data.events));
                    localStorage.setItem(cacheTimeKey, Date.now());
                }
            }).catch(e => console.log('Silent event fetch failed'));
    } else {
        // No cache or expired, fetch blocking
        fetch(`${GOOGLE_SCRIPT_URL}?action=get_events`)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    localStorage.setItem(cacheKey, JSON.stringify(data.events));
                    localStorage.setItem(cacheTimeKey, Date.now());
                    renderEvents(data.events);
                } else {
                    renderEvents([]);
                }
            })
            .catch(error => {
                console.error("Error fetching events:", error);
                renderEvents([]);
            });
    }
});
