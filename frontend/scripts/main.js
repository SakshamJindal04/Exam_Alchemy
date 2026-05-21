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

});