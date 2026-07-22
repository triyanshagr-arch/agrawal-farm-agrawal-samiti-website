document.addEventListener('DOMContentLoaded', () => {
    // Dynamically update navbar LOGIN link to DASHBOARD if logged in
    if (localStorage.getItem('agrawalAuthLoggedIn') === 'true') {
        const loginLinks = document.querySelectorAll('a[href="login.html"]');
        loginLinks.forEach(link => {
            link.href = 'dashboard.html';
            const enSpan = link.querySelector('.lang-en');
            const hiSpan = link.querySelector('.lang-hi');
            if (enSpan) enSpan.textContent = 'DASHBOARD';
            if (hiSpan) hiSpan.textContent = 'डैशबोर्ड';
        });
    }

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    // Mobile App UI Elements Injection
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menu-overlay';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            if(mobileMenu) mobileMenu.classList.remove('is-active');
            if(navMenu) navMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    if (!document.querySelector('.mobile-bottom-bar')) {
        const bottomBar = document.createElement('nav');
        bottomBar.className = 'mobile-bottom-bar';
        
        const currentPath = window.location.pathname;
        const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/');
        const isDonate = currentPath.endsWith('donation.html');
        const isMember = currentPath.endsWith('sadasyata.html');
        const isContact = currentPath.endsWith('contact.html');

        bottomBar.innerHTML = `
            <a href="index.html" class="${isHome ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span class="lang-hi">होम</span>
                <span class="lang-en" style="display:none">Home</span>
            </a>
            <a href="donation.html" class="${isDonate ? 'active' : ''}">
                <i class="fas fa-hand-holding-heart"></i>
                <span class="lang-hi">दान दें</span>
                <span class="lang-en" style="display:none">Donate</span>
            </a>
            <a href="sadasyata.html" class="${isMember ? 'active' : ''}">
                <i class="fas fa-users"></i>
                <span class="lang-hi">सदस्यता</span>
                <span class="lang-en" style="display:none">Join</span>
            </a>
            <a href="contact.html" class="${isContact ? 'active' : ''}">
                <i class="fas fa-phone-alt"></i>
                <span class="lang-hi">संपर्क</span>
                <span class="lang-en" style="display:none">Contact</span>
            </a>
        `;
        document.body.appendChild(bottomBar);
        
        // Sync language for bottom bar immediately
        const savedLang = localStorage.getItem('preferredLanguage') || 'hi';
        const elementsHi = bottomBar.querySelectorAll('.lang-hi');
        const elementsEn = bottomBar.querySelectorAll('.lang-en');
        if (savedLang === 'en') {
            elementsHi.forEach(el => el.style.display = 'none');
            elementsEn.forEach(el => el.style.display = 'inline-block');
        } else {
            elementsHi.forEach(el => el.style.display = 'inline-block');
            elementsEn.forEach(el => el.style.display = 'none');
        }
    }

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navMenu.classList.toggle('active');
            if(overlay) overlay.classList.toggle('active');
        });
    }

    // Drawer Close Button
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    if (drawerCloseBtn && mobileMenu && navMenu) {
        drawerCloseBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('is-active');
            navMenu.classList.remove('active');
            if(overlay) overlay.classList.remove('active');
        });
    }

    // Close mobile menu when link is clicked (unless it's a dropdown toggle)
    document.querySelectorAll('.nav-links:not(.dropdown-toggle), .dropdown-link').forEach(link => {
        link.addEventListener('click', () => {
            if(mobileMenu) mobileMenu.classList.remove('is-active');
            if(navMenu) navMenu.classList.remove('active');
            if(overlay) overlay.classList.remove('active');
        });
    });

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parentLi = toggle.parentElement;
                
                // Close others
                dropdowns.forEach(drop => {
                    if (drop !== parentLi) drop.classList.remove('active');
                });
                
                // Toggle current
                parentLi.classList.toggle('active');
            }
        });
    });

    // Sticky Navbar shadow on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // Active Nav Highlight on Scroll
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Accordion for Members
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            
            // Toggle active class
            header.classList.toggle('active');

            // Expand or collapse
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // Search Filter for Members
    const searchInput = document.getElementById('memberSearch');
    const memberItems = document.querySelectorAll('.member-item');
    const accordions = document.querySelectorAll('.accordion-item');

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();

        accordions.forEach(accordion => {
            let hasMatch = false;
            const items = accordion.querySelectorAll('.member-item');
            const header = accordion.querySelector('.accordion-header');
            const content = accordion.querySelector('.accordion-content');

            items.forEach(item => {
                const name = item.querySelector('.member-name').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    item.style.display = 'flex';
                    hasMatch = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Expand accordion if there's a match and search is not empty
            if (searchTerm !== '') {
                if (hasMatch) {
                    accordion.style.display = 'block';
                    header.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + "px";
                } else {
                    accordion.style.display = 'none';
                }
            } else {
                // Reset state
                accordion.style.display = 'block';
                items.forEach(item => item.style.display = 'flex');
                header.classList.remove('active');
                }
            });
        });
    }

    // Lightbox for Gallery
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-lightbox');

    if (lightbox) {
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const title = item.querySelector('.gallery-overlay span').textContent;
                lightboxImg.innerHTML = `<div class="placeholder-img">चित्र ${index + 1}</div>`;
                lightboxCaption.innerHTML = `<h3>${title}</h3>`;
                lightbox.classList.add('active');
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
        }

        // Close lightbox on outside click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    // Contact Form Submit (Front-end only)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('धन्यवाद! आपका संदेश हमें प्राप्त हो गया है। (Thank you! Your message has been received.)');
            contactForm.reset();
        });
    }
});


// Dynamic Profile Picture Lightbox
document.addEventListener('DOMContentLoaded', () => {
    const profilePics = document.querySelectorAll('.member-photo, .member-avatar, .gallery-item .gallery-placeholder, .gallery-item img');

    if (profilePics.length > 0) {
        // Create lightbox container if it doesn't exist
        let lightbox = document.getElementById('dynamic-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'dynamic-lightbox';
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <img id="dynamic-lightbox-img" src="" alt="Profile">
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImg = document.getElementById('dynamic-lightbox-img');
        const closeBtn = lightbox.querySelector('.close-lightbox');

        profilePics.forEach(pic => {
            pic.style.cursor = 'pointer'; // Make it look clickable
            
            pic.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (pic.classList.contains('member-photo') || pic.classList.contains('member-avatar')) {
                    lightboxImg.classList.add('circle-profile-lightbox');
                } else {
                    lightboxImg.classList.remove('circle-profile-lightbox');
                }
                
                // Try to get src from img tag
                let src = pic.src;
                
                // If it's a div (avatar placeholder) with a background image, extract it
                if (!src && pic.style.backgroundImage) {
                    let match = pic.style.backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
                    if (match) src = match[1];
                }
                
                // If it's a ui-avatars link, make sure it's big
                if (src && src.includes('ui-avatars.com')) {
                    if (!src.includes('size=')) {
                        src += '&size=512';
                    } else {
                        src = src.replace(/size=\d+/, 'size=512');
                    }
                }
                
                if (src) {
                    lightboxImg.src = src;
                    lightbox.classList.add('active');
                }
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        // Close on clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
});


// Dynamic AI Chatbox Integration
document.addEventListener('DOMContentLoaded', () => {

    // Gotra Information Data
    const gotraInfo = {
        "गर्ग (Garg)": "<span class=\"lang-hi\">गर्ग गोत्र की उत्पत्ति महर्षि गर्ग (गार्ग्य) से हुई है। यह गोत्र विद्या और ज्ञान का प्रतीक माना जाता है। गर्ग ऋषि ज्योतिष और खगोल विज्ञान के महान ज्ञाता थे。</span><span class=\"lang-en\">The Garg Gotra originated from Maharishi Garg. This Gotra is considered a symbol of wisdom and knowledge. Sage Garg was a great scholar of astrology and astronomy.</span>",
        "बंसल (Bansal)": "<span class=\"lang-hi\">बंसल गोत्र के आदि गुरु महर्षि वत्स्य (वत्स) हैं। इस गोत्र के लोग अपनी बुद्धिमत्ता, व्यापार कौशल और मधुर वाणी के लिए जाने जाते हैं。</span><span class=\"lang-en\">The founding Guru of the Bansal Gotra is Maharishi Vatsa. People of this Gotra are known for their intelligence, business acumen, and sweet speech.</span>",
        "बिंदल (Bindal)": "<span class=\"lang-hi\">बिंदल गोत्र महर्षि वशिष्ठ से संबंधित है। महर्षि वशिष्ठ भगवान राम के गुरु थे। इस गोत्र के लोग धर्म, न्याय और नेतृत्व में निपुण माने जाते हैं。</span><span class=\"lang-en\">The Bindal Gotra is associated with Maharishi Vashishtha, the Guru of Lord Rama. People of this Gotra are considered adept in righteousness, justice, and leadership.</span>",
        "भंदल (Bhandal)": "<span class=\"lang-hi\">भंदल गोत्र की उत्पत्ति महर्षि धौम्य से मानी जाती है। धौम्य ऋषि पांडवों के पुरोहित थे। इस गोत्र के लोग धर्म-कर्म और निष्ठा के लिए प्रसिद्ध हैं。</span><span class=\"lang-en\">The origin of the Bhandal Gotra is traced to Maharishi Dhaumya, the priest of the Pandavas. This Gotra is famous for its religious devotion and loyalty.</span>",
        "धरण (Dharan)": "<span class=\"lang-hi\">धरण गोत्र के प्रणेता महर्षि धृणबु (कुछ स्रोतों में धौम्य या अन्य ऋषि) माने जाते हैं। यह गोत्र स्थिरता, धैर्य और संपत्ति के संरक्षण का प्रतीक है。</span><span class=\"lang-en\">The pioneer of the Dharan Gotra is believed to be Maharishi Dhrinbu. This Gotra is a symbol of stability, patience, and the preservation of wealth.</span>",
        "ऐरण (Airan)": "<span class=\"lang-hi\">ऐरण गोत्र महर्षि और्व से संबंधित है। इस गोत्र के लोग साहसी, निडर और अपने लक्ष्यों के प्रति अत्यंत समर्पित होते हैं。</span><span class=\"lang-en\">The Airan Gotra is related to Maharishi Aurva. People of this Gotra are brave, fearless, and highly dedicated to their goals.</span>",
        "गोयल (Goyal)": "<span class=\"lang-hi\">गोयल गोत्र के गोत्रकार महर्षि गौतम हैं। महर्षि गौतम न्याय दर्शन के रचयिता थे। गोयल गोत्र के लोग अपने तार्किक ज्ञान और परोपकारी स्वभाव के लिए विख्यात हैं。</span><span class=\"lang-en\">The founder of the Goyal Gotra is Maharishi Gautam, the creator of the Nyaya philosophy. People of this Gotra are renowned for their logical wisdom and philanthropic nature.</span>",
        "जिंदल (Jindal)": "<span class=\"lang-hi\">जिंदल गोत्र की उत्पत्ति महर्षि जैमिनि से हुई है। महर्षि जैमिनि वेदव्यास के शिष्य और मीमांसा दर्शन के रचयिता थे। इस गोत्र के लोग बहुत ऊर्जावान माने जाते हैं。</span><span class=\"lang-en\">The Jindal Gotra originated from Maharishi Jaimini, a disciple of Ved Vyas and creator of the Mimamsa philosophy. People of this Gotra are considered highly energetic.</span>",
        "कंसल (Kansal)": "<span class=\"lang-hi\">कंसल गोत्र महर्षि कश्यप से जुड़ा हुआ है। कश्यप ऋषि सप्तर्षियों में से एक हैं। इस गोत्र के लोग उदार और विशाल हृदय वाले होते हैं。</span><span class=\"lang-en\">The Kansal Gotra is linked to Maharishi Kashyap, one of the Saptarishis (Seven Sages). People of this Gotra are generous and large-hearted.</span>",
        "कुच्छल (Kuchhal)": "<span class=\"lang-hi\">कुच्छल गोत्र के प्रणेता महर्षि विश्वामित्र (कौशिक) हैं। कुच्छल गोत्र के व्यक्ति दृढ़ निश्चयी और अपनी मेहनत से सफलता प्राप्त करने वाले होते हैं。</span><span class=\"lang-en\">The pioneer of the Kuchhal Gotra is Maharishi Vishwamitra (Kaushik). Individuals of this Gotra are determined and achieve success through their hard work.</span>",
        "मधुकुल (Madhukul)": "<span class=\"lang-hi\">मधुकुल गोत्र महर्षि मुदगल से संबंधित है। इस गोत्र के लोग मधुर स्वभाव, आतिथ्य सत्कार और पारिवारिक एकता के लिए प्रसिद्ध हैं。</span><span class=\"lang-en\">The Madhukul Gotra is associated with Maharishi Mudgal. People of this Gotra are famous for their sweet nature, hospitality, and family unity.</span>",
        "मंगल (Mangal)": "<span class=\"lang-hi\">मंगल गोत्र के आदि गुरु महर्षि मांडव्य हैं। इस गोत्र के लोग बहुत शुभचिंतक, शांतिप्रिय और समाज में मंगल (भलाई) करने वाले माने जाते हैं。</span><span class=\"lang-en\">The founding Guru of the Mangal Gotra is Maharishi Mandavya. People of this Gotra are considered very well-wishing, peace-loving, and bringers of good (Mangal) to society.</span>",
        "मित्तल (Mittal)": "<span class=\"lang-hi\">मित्तल गोत्र महर्षि मैत्रेय से जुड़ा है। मित्तल गोत्र के व्यक्ति अपने मिलनसार स्वभाव, सच्ची मित्रता और वफादारी के लिए जाने जाते हैं。</span><span class=\"lang-en\">The Mittal Gotra is linked to Maharishi Maitreya. Individuals of this Gotra are known for their friendly nature, true friendship, and loyalty.</span>",
        "नांगल (Nangal)": "<span class=\"lang-hi\">नांगल गोत्र की उत्पत्ति महर्षि नागेंद्र से मानी जाती है। इस गोत्र के लोग अत्यंत बुद्धिमान, दूरदर्शी और कला व साहित्य प्रेमी होते हैं。</span><span class=\"lang-en\">The origin of the Nangal Gotra is traced to Maharishi Nagendra. People of this Gotra are highly intelligent, visionary, and lovers of art and literature.</span>",
        "सिंघल (Singhal)": "<span class=\"lang-hi\">सिंघल गोत्र महर्षि श्रृंगी से संबंधित है। श्रृंगी ऋषि महान तपस्वी थे। सिंघल गोत्र के लोग निडर, पराक्रमी और नेतृत्व क्षमता से धनी होते हैं。</span><span class=\"lang-en\">The Singhal Gotra is related to Maharishi Shringi, a great ascetic. People of this Gotra are fearless, valorous, and rich in leadership qualities.</span>",
        "तायल (Tayal)": "<span class=\"lang-hi\">तायल गोत्र महर्षि तैत्तिरीय से जुड़ा है। तायल गोत्र के व्यक्ति बहुत परिश्रमी, आध्यात्मिक और विद्या प्रेमी होते हैं。</span><span class=\"lang-en\">The Tayal Gotra is linked to Maharishi Taittiriya. Individuals of this Gotra are very hardworking, spiritual, and lovers of knowledge.</span>",
        "तिंगल (Tingal)": "<span class=\"lang-hi\">तिंगल गोत्र महर्षि तांड्य से संबंधित है। इस गोत्र के लोग कला, संगीत और रचनात्मक कार्यों में विशेष रुचि रखते हैं。</span><span class=\"lang-en\">The Tingal Gotra is associated with Maharishi Tandya. People of this Gotra have a special interest in art, music, and creative endeavors.</span>",
        "गोयन (Goyan)": "<span class=\"lang-hi\">गोयन गोत्र के प्रणेता महर्षि गौतम (कुछ स्रोतों में गोभिल) माने जाते हैं। गोयन गोत्र के लोग धर्म-परायण और गहरे वैचारिक विचारों वाले होते हैं。</span><span class=\"lang-en\">The pioneer of the Goyan Gotra is considered to be Maharishi Gautam (or Gobhil). People of this Gotra are religiously devoted and have deep philosophical thoughts.</span>"
    };

    // Gotra Modal Logic
    const gotraModal = document.getElementById('gotra-modal');
    const modalGotraTitle = document.getElementById('modal-gotra-title');
    const modalGotraInfo = document.getElementById('modal-gotra-info');
    const closeGotraBtn = document.querySelector('#gotra-modal .close-button');
    const gotraItems = document.querySelectorAll('.gotra-list li');

    if (gotraModal && gotraItems.length > 0) {
        gotraItems.forEach(item => {
            item.addEventListener('click', () => {
                const gotraName = item.getAttribute('data-gotra');
                const info = gotraInfo[gotraName];
                
                modalGotraTitle.textContent = gotraName;
                modalGotraInfo.innerHTML = info ? info : "<span class=\"lang-hi\">इस गोत्र की विस्तृत जानकारी जल्द ही अपडेट की जाएगी।</span><span class=\"lang-en\">Detailed information for this Gotra will be updated soon.</span>";
                
                gotraModal.classList.add('show');
            });
        });

        if (closeGotraBtn) {
            closeGotraBtn.addEventListener('click', () => {
                gotraModal.classList.remove('show');
            });
        }

        // Close when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === gotraModal) {
                gotraModal.classList.remove('show');
            }
        });
    }

});



// Language Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const langToggleBtn = document.getElementById('lang-toggle');
    const body = document.body;
    
    // Auto-detect language if not set
    let currentLang = localStorage.getItem('preferredLang');
    if (!currentLang) {
        const browserLang = navigator.language || navigator.userLanguage;
        currentLang = browserLang.toLowerCase().startsWith('hi') ? 'hi' : 'en';
        localStorage.setItem('preferredLang', currentLang);
    }
    
    function updateBilingualOptions(isEnglish) {
        document.querySelectorAll('option[data-en][data-hi]').forEach(opt => {
            opt.textContent = isEnglish ? opt.getAttribute('data-en') : opt.getAttribute('data-hi');
        });
        document.querySelectorAll('input[data-placeholder-en][data-placeholder-hi]').forEach(input => {
            input.placeholder = isEnglish ? input.getAttribute('data-placeholder-en') : input.getAttribute('data-placeholder-hi');
        });
    }

    if (currentLang === 'en') {
        body.classList.add('lang-english-mode');
        if(langToggleBtn) langToggleBtn.innerHTML = '<i class="fas fa-language"></i> हिंदी';
        updateBilingualOptions(true);
    } else {
        if(langToggleBtn) langToggleBtn.innerHTML = '<i class="fas fa-language"></i> English';
        updateBilingualOptions(false);
    }

    if(langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            body.classList.toggle('lang-english-mode');
            const isEnglish = body.classList.contains('lang-english-mode');
            
            updateBilingualOptions(isEnglish);

            if (isEnglish) {
                localStorage.setItem('preferredLang', 'en');
                langToggleBtn.innerHTML = '<i class="fas fa-language"></i> हिंदी';
            } else {
                localStorage.setItem('preferredLang', 'hi');
                langToggleBtn.innerHTML = '<i class="fas fa-language"></i> English';
            }
        });
    }
});

// Scroll Animations & Back to Top
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations
    const fadeSections = document.querySelectorAll('.section, .card, .service-card');
    fadeSections.forEach(section => section.classList.add('fade-in-section'));
    
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('animate-on-scroll')) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.add('is-visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeSections.forEach(section => observer.observe(section));
    animateElements.forEach(el => observer.observe(el));
    
    // Back to Top Button
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 3. Matrimonial Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Reset all
                tabBtns.forEach(b => {
                    b.classList.remove('active', 'btn-primary');
                    b.classList.add('btn-outline');
                });
                
                // Set active
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-outline');
                
                // Show content
                const target = btn.getAttribute('data-target');
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById(target).style.display = 'block';
            });
        });
    }
});
