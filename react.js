document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when link is clicked (unless it's a dropdown toggle)
    document.querySelectorAll('.nav-links:not(.dropdown-toggle), .dropdown-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('is-active');
            navMenu.classList.remove('active');
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
    // Inject HTML for Chatbox
    const chatHTML = `
        <button class="ai-chat-btn" id="aiChatBtn">
            <i class="fas fa-robot"></i>
            <span class="badge"></span>
        </button>

        <div class="ai-chat-window" id="aiChatWindow">
            <div class="ai-chat-header">
                <div class="ai-chat-header-info">
                    <i class="fas fa-robot"></i>
                    <div>
                        <h4>AI Assistant</h4>
                        <span>ऑनलाइन (Online)</span>
                    </div>
                </div>
                <button class="ai-chat-close" id="aiChatClose"><i class="fas fa-times"></i></button>
            </div>
            <div class="ai-chat-body" id="aiChatBody">
                <div class="chat-msg bot">नमस्कार! 🙏<br>अग्रवाल समाज समिति में आपका स्वागत है। मैं आपकी कैसे सहायता कर सकता हूँ? (How can I help you?)</div>
            </div>
            <div class="ai-chat-footer">
                <input type="text" id="aiChatInput" placeholder="अपना प्रश्न यहाँ लिखें...">
                <button id="aiChatSend"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Chatbox Logic
    const chatBtn = document.getElementById('aiChatBtn');
    const chatWindow = document.getElementById('aiChatWindow');
    const chatClose = document.getElementById('aiChatClose');
    const chatBody = document.getElementById('aiChatBody');
    const chatInput = document.getElementById('aiChatInput');
    const chatSend = document.getElementById('aiChatSend');

    // Toggle Chat
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.add('active');
        chatBtn.style.display = 'none'; // hide button when open
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        setTimeout(() => {
            chatBtn.style.display = 'flex';
        }, 300);
    });

    // Send Message
    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (text === '') return;

        // Add user message
        appendMessage('user', text);
        chatInput.value = '';

        // Add typing indicator
        const typingId = 'typing-' + Date.now();
        chatBody.insertAdjacentHTML('beforeend', `
            <div class="chat-typing" id="${typingId}">
                <span></span><span></span><span></span>
            </div>
        `);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Simulate AI processing delay
        setTimeout(() => {
            document.getElementById(typingId).remove();
            const response = getAIResponse(text.toLowerCase());
            appendMessage('bot', response);
        }, 1500);
    };

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    const appendMessage = (sender, text) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // Simple Rule-Based AI Logic
    
    // Member Database for AI
    const membersData = [
        // Executive Committee
        { name_hi: "दीपक गुप्ता", name_en: "Deepak Gupta", role: "<span class=\"lang-hi\">मुख्य संरक्षक</span><span class=\"lang-en\">Chief Patron</span>", phone: "9829125789" , img: "images/deepak_gupta.jpg" },
        { name_hi: "डॉ प्रवीण मंगलूनिया", name_en: "Dr. Praveen Manglunia", role: "<span class=\"lang-hi\">मुख्य सलाहकार</span><span class=\"lang-en\">Chief Advisor</span>", phone: "9829011770" , img: "images/praveen_manglunia.jpg" },
        { name_hi: "कैलाश गंगल", name_en: "Kailash Gangal", role: "<span class=\"lang-hi\">अध्यक्ष</span><span class=\"lang-en\">President</span>", phone: "8949061612" , img: "images/kailash_gangal.jpg" },
        { name_hi: "जितेंद्र कुमार गुप्ता", name_en: "Jitendra Kumar Gupta", role: "<span class=\"lang-hi\">उपाध्यक्ष</span><span class=\"lang-en\">Vice President</span>", phone: "8209781281" , img: "images/jitendra_gupta.jpg" },
        { name_hi: "सुधीर कुमार सिंघल", name_en: "Sudhir Kumar Singhal", role: "<span class=\"lang-hi\">कोषाध्यक्ष</span><span class=\"lang-en\">Treasurer</span>", phone: "9784530000" , img: "images/sudhir_singhal.jpg" },
        { name_hi: "कृष्णदीप सिंघल", name_en: "Krishnadeep Singhal", role: "<span class=\"lang-hi\">महासचिव</span><span class=\"lang-en\">General Secretary</span>", phone: "9829220486" , img: "images/krishnadeep_singhal.jpg" },
        { name_hi: "सतीश चंद्र अग्रवाल", name_en: "Satish Chandra Agarwal", role: "<span class=\"lang-hi\">संयुक्त सचिव</span><span class=\"lang-en\">Joint Secretary</span>", phone: "9414889212" , img: "images/satish_agarwal.jpg" },
        { name_hi: "विजय गुप्ता", name_en: "Vijay Gupta", role: "<span class=\"lang-hi\">संगठन मंत्री</span><span class=\"lang-en\">Organizing Secretary</span>", phone: "8764786100" , img: "images/vijay_gupta.jpg" },
        { name_hi: "अनिल मंगल", name_en: "Anil Mangal", role: "<span class=\"lang-hi\">युवाध्यक्ष</span><span class=\"lang-en\">Youth President</span>", phone: "8432314636" , img: "images/anil_mangal.jpg" },
        { name_hi: "पुष्पा मंगल", name_en: "Pushpa Mangal", role: "<span class=\"lang-hi\">महिला अध्यक्ष</span><span class=\"lang-en\">Women's President</span>", phone: "9413182210" , img: "images/pushpa_mangal.jpg" },
        
        // Sector Members
        { name_hi: "रिंकू कुमार मित्तल", name_en: "Rinku Kumar Mittal", role: "<span class=\"lang-hi\">सेक्टर 7</span><span class=\"lang-en\">Sector 7</span>", phone: "9829028209" , img: "images/rinku_kumar_mittal.jpg" },
        { name_hi: "जय प्रकाश कंसल", name_en: "Jay Prakash Kansal", role: "<span class=\"lang-hi\">सेक्टर 7</span><span class=\"lang-en\">Sector 7</span>", phone: "9413308720" , img: "images/jay_prakash_kansal.jpg" },
        { name_hi: "सुधीर कुमार गोयल", name_en: "Sudhir Kumar Goyal", role: "<span class=\"lang-hi\">सेक्टर 7</span><span class=\"lang-en\">Sector 7</span>", phone: "9413288808" , img: "images/sudhir_kumar_goyal.jpg" },
        { name_hi: "गोविन्द शरण गुप्ता", name_en: "Govind Sharan Gupta", role: "<span class=\"lang-hi\">सेक्टर 7</span><span class=\"lang-en\">Sector 7</span>", phone: "9928827690" , img: "images/govind_sharan_gupta.jpg" },
        { name_hi: "बनवारी लाल गुप्ता", name_en: "Banwari Lal Gupta", role: "<span class=\"lang-hi\">सेक्टर 8</span><span class=\"lang-en\">Sector 8</span>", phone: "9414077760" , img: "images/banwari_lal_gupta.jpg" },
        { name_hi: "अजय कुमार गुप्ता", name_en: "Ajay Kumar Gupta", role: "<span class=\"lang-hi\">सेक्टर 8</span><span class=\"lang-en\">Sector 8</span>", phone: "9414045505" , img: "images/ajay_kumar_gupta.jpg" },
        { name_hi: "सुनील गोयल", name_en: "Sunil Goyal", role: "<span class=\"lang-hi\">सेक्टर 9</span><span class=\"lang-en\">Sector 9</span>", phone: "9414401644" , img: "images/sunil_goyal.jpg" },
        { name_hi: "देवकीनन्दन गर्ग", name_en: "Deoki Nandan Garg", role: "<span class=\"lang-hi\">सेक्टर 9</span><span class=\"lang-en\">Sector 9</span>", phone: "8764241268" , img: "images/deoki_nandan_garg.jpg" },
        { name_hi: "प्रकाश चन्द्र सिंघल", name_en: "Prakash Chandra Singhal", role: "<span class=\"lang-hi\">सेक्टर 10</span><span class=\"lang-en\">Sector 10</span>", phone: "9928909820" , img: "images/prakash_chandra_singhal.jpg" },
        { name_hi: "अशोक अग्रवाल", name_en: "Ashok Agarwal", role: "<span class=\"lang-hi\">सेक्टर 10</span><span class=\"lang-en\">Sector 10</span>", phone: "9828118134" , img: "images/ashok_agarwal.jpg" },
        { name_hi: "बालकृष्ण गर्ग", name_en: "Balkrishna Garg", role: "<span class=\"lang-hi\">सेक्टर 11</span><span class=\"lang-en\">Sector 11</span>", phone: "9314508120" , img: "images/balkrishna_garg.jpg" },
        { name_hi: "पवन अग्रवाल", name_en: "Pawan Agarwal", role: "<span class=\"lang-hi\">सेक्टर 11</span><span class=\"lang-en\">Sector 11</span>", phone: "9352611001" , img: "images/pawan_agarwal.jpg" },
        { name_hi: "सतीश गर्ग", name_en: "Satish Garg", role: "<span class=\"lang-hi\">सेक्टर 11</span><span class=\"lang-en\">Sector 11</span>", phone: "9829578670" , img: "images/satish_garg.jpg" },
        { name_hi: "बृजमोहन गोयल", name_en: "Brijmohan Goyal", role: "<span class=\"lang-hi\">सेक्टर 11</span><span class=\"lang-en\">Sector 11</span>", phone: "9413186699" , img: "images/brijmohan_goyal.jpg" },
        { name_hi: "लक्ष्मी नारायण अग्रवाल", name_en: "Laxmi Narayan Agarwal", role: "<span class=\"lang-hi\">सेक्टर 11</span><span class=\"lang-en\">Sector 11</span>", phone: "9413300248" , img: "images/laxmi_narayan_agarwal.jpg" },
        { name_hi: "चन्द्र प्रकाश गोयल", name_en: "Chandra Prakash Goyal", role: "<span class=\"lang-hi\">सेक्टर 11</span><span class=\"lang-en\">Sector 11</span>", phone: "9314682938" , img: "images/chandra_prakash_goyal.jpg" },
        { name_hi: "राज कुमार गंगल", name_en: "Raj Kumar Gangal", role: "<span class=\"lang-hi\">सेक्टर 12</span><span class=\"lang-en\">Sector 12</span>", phone: "9413348359" , img: "images/raj_kumar_gangal.jpg" },
        { name_hi: "अमित कुमार गर्ग", name_en: "Amit Kumar Garg", role: "सेक्टर 15 व अन्य", phone: "9571118777" , img: "images/amit_kumar_garg.jpg" },
        { name_hi: "नवीन चन्द्र अग्रवाल", name_en: "Naveen Chandra Agarwal", role: "SFS, RIICO", phone: "9413975058" , img: "images/naveen_chandra_agarwal.jpg" },
        { name_hi: "हरीश चंद्र गोयल", name_en: "Harish Chandra Goyal", role: "SFS, RIICO", phone: "9414075155" },
        { name_hi: "आदित्य कुमार गोयल", name_en: "Aditya Kumar Goyal", role: "SFS, RIICO", phone: "9829014291" , img: "images/aditya_kumar_goyal.jpg" },
        { name_hi: "गोपाल अग्रवाल", name_en: "Gopal Agarwal", role: "PRN", phone: "9784085239" , img: "images/gopal_agarwal.jpg" },
        { name_hi: "राजकुमार गुप्ता", name_en: "Rajkumar Gupta", role: "PRN", phone: "9460309368" , img: "images/rajkumar_gupta.jpg" },
        { name_hi: "आलोक अग्रवाल", name_en: "Alok Agarwal", role: "PRN", phone: "9887379944" , img: "images/alok_agarwal.jpg" },
        { name_hi: "विजय कुमार गुप्ता", name_en: "Vijay Kumar Gupta", role: "PRN", phone: "9351405727" , img: "images/vijay_kumar_gupta.jpg" }
    ];

    const getAIResponse = (input) => {
        let text = input.toLowerCase();
        
        // Search for members
        let foundMembers = [];
        for (let member of membersData) {
            let n_hi = member.name_hi.split(' ')[0]; // Match first name Hindi
            let n_en = member.name_en.toLowerCase().split(' ')[0]; // Match first name English
            let full_hi = member.name_hi;
            let full_en = member.name_en.toLowerCase();
            
            if (text.includes(n_hi) || text.includes(n_en) || text.includes(full_hi) || text.includes(full_en)) {
                foundMembers.push(member);
            }
        }
        
        if (foundMembers.length > 0) {
            let res = "मुझे इन सदस्य(यों) की जानकारी मिली है:<br><br>";
            foundMembers.forEach(m => {
                res += `<strong>${m.name_hi} (${m.name_en})</strong><br>`;
                res += `पद/सेक्टर: ${m.role}<br>`;
                res += `संपर्क: <a href="tel:+91${m.phone}" style="color:var(--primary-color)">${m.phone}</a><br><br>`;
            });
            return res;
        }

        // Original fallback logic
        if (text.includes('hi') || text.includes('hello') || text.includes('नमस्ते')) {
            return "नमस्ते! मैं आपकी क्या मदद कर सकता हूँ?";
        }
        else if (text.includes('member') || text.includes('सदस्य') || text.includes('join')) {
            return "आप 'सदस्य (Members)' पेज पर जाकर सभी सदस्यों की सूची देख सकते हैं। यदि आप सदस्य बनना चाहते हैं, तो 'संपर्क' पेज पर जाकर फॉर्म भरें। आप मुझसे किसी सदस्य का नाम भी पूछ सकते हैं!";
        }
        else if (text.includes('event') || text.includes('गतिविधि') || text.includes('activity')) {
            return "हमारे आगामी कार्यक्रमों की जानकारी 'सूचनाएँ (Notices)' एवं 'गतिविधियाँ (Activities)' पेज पर उपलब्ध है।";
        }
        else if (text.includes('contact') || text.includes('संपर्क') || text.includes('phone') || text.includes('number')) {
            return "आप हमें assagarwalfarmjpr@gmail.com पर ईमेल कर सकते हैं या 9829220486 पर संपर्क कर सकते हैं। कार्यालय का पता 'संपर्क' पेज पर है।";
        }
        else if (text.includes('committee') || text.includes('कार्यकारिणी')) {
            return "हमारी कार्यकारिणी समिति के सदस्यों की जानकारी 'सदस्य (Members)' पेज में सबसे ऊपर दी गई है। आप मुझे किसी का नाम लिखकर भी पूछ सकते हैं।";
        }
        else {
            return "क्षमा करें, मैं अभी एक AI हूँ और सीख रहा हूँ। अधिक जानकारी के लिए कृपया 'संपर्क (Contact)' पेज पर जाकर हमारी टीम को संदेश भेजें।";
        }
    };

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


// --- Language Manager ---
document.addEventListener('DOMContentLoaded', () => {
    const langToggleBtn = document.getElementById('lang-toggle');
    const currentLangText = langToggleBtn ? langToggleBtn.querySelector('.current-lang') : null;
    const body = document.body;
    
    // Default language is Hindi (hi).
    let currentLang = localStorage.getItem('lang') || 'hi';
    body.classList.add('lang-' + currentLang);
    if(currentLangText) {
        currentLangText.textContent = currentLang === 'hi' ? 'English' : 'हिंदी';
    }

    if(langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            body.classList.remove('lang-' + currentLang);
            currentLang = currentLang === 'hi' ? 'en' : 'hi';
            body.classList.add('lang-' + currentLang);
            localStorage.setItem('lang', currentLang);
            
            if(currentLangText) {
                currentLangText.textContent = currentLang === 'hi' ? 'English' : 'हिंदी';
            }
        });
    }
});
