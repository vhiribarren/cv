# Curriculum Vitae - Vincent Hiribarren

My resume, as a concept of interactive responsive printable web page.

- Browsable with Github Pages.
- Pure simple native HTML, CSS and Javascript.
- A subtle addition of Web Component for repetitive elements.
- Obfuscated contact information using [obfuscate.py](scripts/obfuscate.py).
- Adapt to mobile devices, and paper-style like a real CV for desktop browsing.
- Interactive sections that can be expanded in fullscreen.
- Print ready.

## How to view it

Open it in your browser: https://www.alea.net/cv/

## How to work on it

Direct file edition.

Requires a local web server since there are a couple of link to external resources.

For instance using Python:

```
python3 -m http.server
```

## How to embed in another page

This page supports automatic height adjustment when embedded in an `iframe`. 

### 1. HTML Snippet
```html
<iframe id="cv-iframe" 
        src="https://www.alea.net/cv/" 
        style="width: 100%; border: none; overflow: hidden;" 
        scrolling="no">
</iframe>
```

### 2. Javascript Snippet
Add this to the parent page to handle the automatic resizing:
```javascript
window.addEventListener('message', function(e) {
    if (e.data.type === 'cv-height') {
        const iframe = document.getElementById('cv-iframe');
        if (iframe) {
            iframe.style.height = e.data.height + 'px';
        }
    }
});
```

### 3. Header Synchronization (Optional)
If your parent page scrolls and you want the CV header to stay pinned to the top of the browser window, add this synchronization logic:

```javascript
window.addEventListener('scroll', function() {
    const iframe = document.getElementById('cv-iframe');
    if (!iframe) return;

    // If your parent page has a fixed header, set its height here
    // Example: if your parent website's header is 60px tall, set this to 60.
    const PARENT_HEADER_HEIGHT = 0; 
    
    // Use requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
        const iframeRect = iframe.getBoundingClientRect();
        let offset = 0;
        
        // If the iframe's top boundary goes above the parent's header
        if (iframeRect.top < PARENT_HEADER_HEIGHT) {
            offset = PARENT_HEADER_HEIGHT - iframeRect.top;
        }
        
        iframe.contentWindow.postMessage({ type: 'cv-offset', offset: offset }, '*');
    });
}, { passive: true });
```

## How to protect contact information

To prevent bots from easily scraping your email and phone number, the contact information is obfuscated in the HTML and decoded at runtime by `script.js`.

Use the provided Python script to generate the obfuscated strings:

```bash
./scripts/obfuscate.py "your.email@example.com"
```

Then, update the `data-o` attribute in your HTML:
```html
<span class="js-contact" data-o="...OBFUSCATED_STRING..." data-t="m">email</span>
```
- `data-t="m"` for mailto links.
- `data-t="t"` for tel links.

## License

Copyright (c) 2026 Vincent Hiribarren

Permission is granted to redistribute this software and its files
in their original, unmodified form, provided that this copyright
notice is preserved.

Modification, creation of derivative works, or redistribution of
modified versions is not permitted without prior written permission.

All other rights are reserved.