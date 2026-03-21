# Curriculum Vitae - Vincent Hiribarren

My resume, as a concept of interactive responsive printable web page.

- Browsable with Github Pages.
- Pure simple native HTML, CSS and Javascript.
- A subtle addition of Web Component for repetitive elements.
- Obfuscated contact information.
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

## License

Copyright (c) 2026 Vincent Hiribarren

Permission is granted to redistribute this software and its files
in their original, unmodified form, provided that this copyright
notice is preserved.

Modification, creation of derivative works, or redistribution of
modified versions is not permitted without prior written permission.

All other rights are reserved.