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

// Print Styles State Management
window.addEventListener('beforeprint', () => {
    document.body.classList.add('print-mode');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-mode');
});

// Print Document Logic
const printDocBtn = document.getElementById('print-doc-btn');
if (printDocBtn) {
    printDocBtn.addEventListener('click', () => {
        window.print();
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

// Direct PDF Download Logic using html2pdf
const downloadPdfBtn = document.getElementById('download-pdf-btn');
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        // Target the main container
        const element = document.querySelector('main');

        // Add a temporary class to indicate exporting state
        document.body.classList.add('print-mode');

        // Ensure window is scrolled to top before capture
        window.scrollTo(0, 0);

        const opt = {
            margin: 0,
            filename: 'CV_Vincent_Hiribarren.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css' }
        };

        // Call html2pdf
        html2pdf().set(opt).from(element).save().then(() => {
            // Remove the temporary class after PDF is generated
            document.body.classList.remove('print-mode');
        });
    });
}
