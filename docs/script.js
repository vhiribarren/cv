/*
Copyright (c) 2026 Vincent Hiribarren

Permission is granted to redistribute this file in its original,
unmodified form, provided that this copyright notice is preserved.

All other rights are reserved.
*/

// Select all elements that have a .section__detail child
const allDetailsBlocks = document.querySelectorAll('.section__detail');
const sections = Array.from(allDetailsBlocks).map(detail => detail.parentElement);

const overlay = document.getElementById('fullscreen-overlay');
const overlayContent = document.getElementById('fullscreen-content');
const closeBtn = document.getElementById('close-btn');

// Store the original parent and next sibling of the currently expanded section
// so we can put it back exactly where it was.
let originalParent = null;
let originalNextSibling = null;
let activeSection = null;

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
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeFullscreen();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('u-hidden')) {
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
    overlayContent.innerHTML = '';
    overlayContent.appendChild(clonedContent);

    // Show overlay
    overlay.classList.remove('u-hidden');
}

function closeFullscreen() {
    if (!activeSection) return;

    // Hide overlay
    overlay.classList.add('u-hidden');

    // Restore body scrolling
    document.body.classList.remove('is-overlay-active');

    // Clear references and content after transition finishes
    setTimeout(() => {
        overlayContent.innerHTML = '';
        activeSection = null;
    }, 400); // Wait for CSS transition (0.4s)
}


// Print Document Logic
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

// Share Document Logic
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

// Section Navigation Dropdown
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

// Custom Footer Component
class CVFooter extends HTMLElement {
    connectedCallback() {
        const template = document.getElementById('footer-template');
        if (template) {
            this.appendChild(template.content.cloneNode(true));
            // Trigger contact de-obfuscation for the new elements
            decodeContacts(this);
        }
    }
}
customElements.define('cv-footer', CVFooter);

// Initialize contact information (obfuscation decoding)
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

// Initial call
decodeContacts();

// --- iFrame Resizer logic ---
// When this page is embedded in an iframe, it reports its height to the parent
// to allow the parent to resize the iframe accordingly.
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