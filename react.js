document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-active');
        navMenu.classList.toggle('active');
    });

    // Drawer Close Button
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('is-active');
            navMenu.classList.remove('active');
        });
    }


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
