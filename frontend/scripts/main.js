// Wait for the entire HTML document to be loaded
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. DASHBOARD PAGE LOGIC (SIDEBAR) ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        // Dynamically create and append mobile overlay backdrop
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Helper to check if currently in mobile view
        const isMobile = () => window.innerWidth <= 992;

        const toggleSidebar = () => {
            document.body.classList.toggle('sidebar-collapsed');
        };

        const closeSidebar = () => {
            document.body.classList.remove('sidebar-collapsed');
        };

        menuToggle.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', closeSidebar);

        // Dynamically inject close button in sidebar header if not present
        const sidebarHeader = sidebar.querySelector('.sidebar-header');
        if (sidebarHeader) {
            let closeBtn = sidebarHeader.querySelector('.sidebar-close-btn');
            if (!closeBtn) {
                closeBtn = document.createElement('button');
                closeBtn.id = 'sidebar-close';
                closeBtn.className = 'sidebar-close-btn';
                closeBtn.setAttribute('aria-label', 'Close Sidebar');
                closeBtn.innerHTML = "<i class='bx bx-x'></i>";
                sidebarHeader.appendChild(closeBtn);
            }
            closeBtn.addEventListener('click', closeSidebar);
        }

        // Close sidebar automatically when clicking a navigation link on mobile
        const navLinks = sidebar.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isMobile()) {
                    closeSidebar();
                }
            });
        });
    }

    // --- 2. LOGIN PAGE (ROLE TOGGLE) ---
    const roleToggles = document.querySelectorAll('.toggle-btn');
    if (roleToggles.length > 0) {
        roleToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                roleToggles.forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
            });
        });
    }


    // --- 3. DARK MODE TOGGLE (GLOBAL) ---
    const initDarkMode = () => {
        // Create toggle button
        const themeBtn = document.createElement('button');
        themeBtn.id = 'theme-toggle-btn';
        themeBtn.className = 'theme-toggle-btn';
        themeBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        document.body.appendChild(themeBtn);

        // Check local storage for preference
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = "<i class='bx bx-sun'></i>";
        } else {
            themeBtn.innerHTML = "<i class='bx bx-moon'></i>";
        }

        // Toggle event
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = "<i class='bx bx-moon'></i>";
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = "<i class='bx bx-sun'></i>";
            }
        });
    };
    initDarkMode();
    // --- 4. SCROLL REVEAL ANIMATIONS ---
    const observeElements = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Stop observing once animated if we only want it once
                    // observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        // Select elements to animate.
        const elementsToAnimate = document.querySelectorAll('.scroll-reveal, .card');
        elementsToAnimate.forEach(el => {
            if (!el.classList.contains('scroll-reveal')) {
                el.classList.add('scroll-reveal'); // Add base class for JS animations if missing
            }
            observer.observe(el);
        });
    };
    observeElements();
    // --- 5. ROTATING QUOTES ---
    const quoteContainer = document.getElementById('quote-container');
    if (quoteContainer) {
        const quotes = [
            "\"Education is not the learning of facts, but the training of the mind to think.\" – Albert Einstein",
            "\"The beautiful thing about learning is that nobody can take it away from you.\" – B.B. King",
            "\"Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.\" – Pelé",
            "\"Don't let what you cannot do interfere with what you can do.\" – John Wooden",
            "\"The expert in anything was once a beginner.\" – Helen Hayes"
        ];
        
        const changeQuote = () => {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteContainer.style.opacity = '0';
            setTimeout(() => {
                quoteContainer.textContent = randomQuote;
                quoteContainer.style.opacity = '1';
            }, 500);
        };
        
        // Initial setup
        quoteContainer.style.transition = 'opacity 0.5s ease';
        changeQuote();
        
        // Rotate every 10 seconds
        setInterval(changeQuote, 10000);
    }

});