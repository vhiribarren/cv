/*
Copyright (c) 2026 Vincent Hiribarren

Permission is granted to redistribute this file in its original,
unmodified form, provided that this copyright notice is preserved.

All other rights are reserved.
*/

/**
 * ============================================================================
 * FEATURE: Section Details (Fullscreen Overlay)
 * Handles opening and closing the detail views of sections.
 * ============================================================================
 */
(function initSectionDetails() {
    const allDetailsBlocks = document.querySelectorAll('.section__detail');
    const sections = Array.from(allDetailsBlocks).map(detail => detail.parentElement);

    const detailOverlay = document.getElementById('detail-overlay');
    const detailDrawer = document.getElementById('detail-drawer');
    const detailContent = document.getElementById('detail-content');
    const closeBtn = document.getElementById('close-drawer-btn');

    let activeSection = null;

    if (!detailOverlay || !detailDrawer || !detailContent || !closeBtn) return;

    sections.forEach(section => {
        const detailBlock = section.querySelector('.section__detail');
        if (detailBlock) {
            section.classList.add('section--interactive');
        }

        section.addEventListener('click', (e) => {
            // Prevent triggering if already in fullscreen or if clicking a link inside
            if (activeSection === section || e.target.tagName.toLowerCase() === 'a') return;

            if (!section.classList.contains('section--interactive')) return;

            openFullscreen(section);
        });
    });

    closeBtn.addEventListener('click', closeFullscreen);

    // Close on click outside the content
    detailOverlay.addEventListener('click', (e) => {
        if (e.target === detailOverlay) {
            closeFullscreen();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailOverlay.classList.contains('is-open')) {
            closeFullscreen();
        }
    });

    function openFullscreen(section) {
        // Prevent body scrolling
        document.body.classList.add('is-overlay-active');

        activeSection = section;

        // Check if there is a detailed content block
        const detailBlock = section.querySelector('.section__detail');
        if (!detailBlock) return;

        // Clone the content to stick in the overlay
        const clonedContent = detailBlock.cloneNode(true);

        // Ensure the clone is visible (in case we cloned a .u-hidden detail block)
        clonedContent.classList.remove('u-hidden');

        // Remove the ID from the clone to avoid duplicates in the DOM
        clonedContent.removeAttribute('id');

        // Clear previous content and append new
        detailContent.innerHTML = '';
        detailContent.appendChild(clonedContent);

        // Show overlay and drawer
        detailOverlay.classList.add('is-open');
        detailDrawer.classList.add('is-open');
    }

    function closeFullscreen() {
        if (!activeSection) return;

        // Hide overlay and drawer
        detailOverlay.classList.remove('is-open');
        detailDrawer.classList.remove('is-open');

        // Restore body scrolling
        document.body.classList.remove('is-overlay-active');

        // Clear references and content after transition finishes
        setTimeout(() => {
            detailContent.innerHTML = '';
            activeSection = null;
        }, 400); // Wait for CSS transition (0.4s)
    }
})();

/**
 * ============================================================================
 * FEATURE: Print Document
 * Handles the logic for the print button.
 * ============================================================================
 */
(function initPrintDocument() {
    const printDocBtn = document.getElementById('print-doc-btn');
    if (printDocBtn) {
        const triggerPrint = () => {
            if (typeof window.print === 'function') {
                window.print();
            } else {
                alert('Printing is not supported on your device. Use the browser\'s share/print feature.');
            }
        };

        printDocBtn.addEventListener('click', triggerPrint);
        // Some mobile browsers may not fire "click" reliably for buttons,
        // so also listen for touchend to ensure the action runs.
        printDocBtn.addEventListener('touchend', triggerPrint);
    }
})();

/**
 * ============================================================================
 * FEATURE: Share Document
 * Handles the logic to share the CV natively or fallback to copy clipboard.
 * ============================================================================
 */
(function initShareDocument() {
    const shareDocBtn = document.getElementById('share-doc-btn');
    if (shareDocBtn) {
        const triggerShare = async () => {
            const shareData = {
                title: document.title,
                url: window.location.href,
            };
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (e) {
                    // User cancelled or share failed — silently ignore
                }
            } else {
                // Fallback: copy URL to clipboard
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    const label = shareDocBtn.querySelector('.action-btn__text');
                    const original = label ? label.textContent : null;
                    if (label) label.textContent = 'Copied!';
                    shareDocBtn.disabled = true;
                    setTimeout(() => {
                        if (label && original) label.textContent = original;
                        shareDocBtn.disabled = false;
                    }, 2000);
                } catch (e) {
                    alert('Copy this URL to share: ' + window.location.href);
                }
            }
        };
        shareDocBtn.addEventListener('click', triggerShare);
    }
})();

/**
 * ============================================================================
 * FEATURE: Section Navigation Dropdown
 * Handles smooth scrolling from the section selector.
 * ============================================================================
 */
(function initSectionNavigation() {
    const sectionNav = document.getElementById('section-nav');
    if (sectionNav) {
        sectionNav.addEventListener('change', (e) => {
            const targetId = e.target.value;
            if (targetId) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // Reset select so "Jump to..." is visible again
                    e.target.value = "";
                }
            }
        });
    }
})();

/**
 * ============================================================================
 * FEATURE: Contact Info Decoder
 * De-obfuscates contact info. Listens for custom event 'cv:decode-contacts'.
 * ============================================================================
 */
(function initContactDecoder() {
    function decodeContacts(container = document) {
        const key = 'VG';
        const contacts = container.querySelectorAll('.js-contact');

        contacts.forEach(el => {
            const obfuscated = el.getAttribute('data-o');
            const type = el.getAttribute('data-t');
            if (!obfuscated) return;

            // Decode: B64 -> Reverse -> XOR
            try {
                const binary = atob(obfuscated);
                const reversed = binary.split('').reverse().join('');
                const decoded = reversed.split('').map((char, i) =>
                    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
                ).join('');

                const link = document.createElement('a');
                link.href = (type === 'm' ? 'mailto:' : 'tel:') + decoded;
                link.textContent = decoded;
                el.replaceWith(link);
            } catch (e) {
                console.error('Failed to decode contact info', e);
            }
        });
    }

    // Initial call on page load
    decodeContacts();

    // Allow other components to trigger decoding
    document.addEventListener('cv:decode-contacts', (e) => {
        decodeContacts(e.detail?.container || document);
    });
})();

/**
 * ============================================================================
 * FEATURE: Web Components
 * Initializes custom HTML elements globally.
 * ============================================================================
 */
(function initWebComponents() {
    class CVFooter extends HTMLElement {
        connectedCallback() {
            const template = document.getElementById('footer-template');
            if (template) {
                this.appendChild(template.content.cloneNode(true));
                // Trigger contact de-obfuscation for the newly inserted elements
                document.dispatchEvent(new CustomEvent('cv:decode-contacts', { 
                    detail: { container: this } 
                }));
            }
        }
    }
    
    if (!customElements.get('cv-footer')) {
        customElements.define('cv-footer', CVFooter);
    }
})();

/**
 * ============================================================================
 * FEATURE: iFrame Integration
 * Reports page height to parent window and syncs header position when embedded.
 * ============================================================================
 */
(function initIFrameIntegration() {
    // --- 1. Height Reporting ---
    function reportHeight() {
        if (window.parent !== window) {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'cv-height', height: height }, '*');
        }
    }

    // Report height on load and whenever the content might change
    window.addEventListener('load', reportHeight);
    window.addEventListener('resize', reportHeight);

    // MutationObserver to watch for content changes (like zoomed sections)
    const resizerObserver = new MutationObserver(reportHeight);
    resizerObserver.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true 
    });

    // --- 2. Header Synchronization ---
    let revealTimeout = null;
    window.addEventListener('message', (e) => {
        if (e.data.type === 'cv-offset' && typeof e.data.offset === 'number') {
            const header = document.querySelector('header');
            if (header) {
                header.classList.add('is-scrolling');
            }

            // Debounce reveal
            if (revealTimeout) clearTimeout(revealTimeout);
            
            requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--header-offset', `${e.data.offset}px`);
            });

            revealTimeout = setTimeout(() => {
                if (header) {
                    header.classList.remove('is-scrolling');
                }
            }, 1200);
        }
    });
})();