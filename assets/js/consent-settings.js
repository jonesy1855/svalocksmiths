// Lets the visitor change or withdraw their media-consent choice after the fact.
// The stored choice lives in localStorage; clearing it makes the consent prompt
// appear again so the visitor can accept or refuse afresh.
(function () {
    'use strict';

    var KEY = 'sva_cookie_consent';

    function resetConsent() {
        try {
            localStorage.removeItem(KEY);
        } catch (err) {
            // Storage blocked (e.g. private browsing) - nothing persisted anyway.
        }

        // Homepage and other banner pages: re-open the banner.
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'flex';

        // Town pages have no banner; the map placeholder is the prompt instead.
        var placeholder = document.getElementById('map-placeholder');
        if (placeholder) placeholder.style.display = 'flex';

        // Withdraw the media that was loaded under the old choice.
        var iframe = document.getElementById('google-map-iframe');
        if (iframe) {
            var dataSrc = iframe.getAttribute('data-src');
            if (dataSrc) {
                iframe.removeAttribute('src');
                iframe.src = '';
            }
            iframe.style.display = 'none';
        }
    }

    function init() {
        var trigger = document.getElementById('cookie-settings');
        if (!trigger) return;

        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            resetConsent();
            trigger.textContent = 'Consent cleared - please choose again';

            var top = document.getElementById('cookie-banner') ||
                document.getElementById('map-placeholder');
            if (top && top.scrollIntoView) {
                top.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();