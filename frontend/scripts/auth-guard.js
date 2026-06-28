/**
 * Auth Guard & Logout Utilities
 * Include this script on all protected pages BEFORE other scripts.
 */

(function() {
    'use strict';

    // --- Auth Guard ---
    // Redirect to login if no auth token is present
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'auth.html';
        return; // Stop further script execution
    }

    // --- Logout Handler ---
    // Attach logout behavior to all logout links/buttons
    document.addEventListener('DOMContentLoaded', function() {
        const logoutLinks = document.querySelectorAll('a[href="index.html"]');
        logoutLinks.forEach(link => {
            // Only target logout links (those in sidebar footer or with logout icon)
            const isLogoutLink = link.closest('.sidebar-footer') || 
                                 link.querySelector('.bx-log-out') ||
                                 link.textContent.trim().toLowerCase().includes('logout');
            if (isLogoutLink) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Clear all auth data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRoles');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userEmail');
                    window.location.href = 'index.html';
                });
            }
        });

        // Also handle header logout buttons
        const logoutButtons = document.querySelectorAll('.header-actions a[href="index.html"]');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRoles');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                window.location.href = 'index.html';
            });
        });
    });
})();
