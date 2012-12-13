window.addEventListener('message', function(e) {
    if (e.data === 'highlight') {
        // Calling Prism to highlight the code, with async enabled
        Prism.highlightElement(source, true, function() {
            window.postMessage("highlighted", e.origin);
            document.querySelector('body').style.display = 'block';
        });
    }
}, false);