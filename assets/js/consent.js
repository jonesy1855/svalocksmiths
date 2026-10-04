// Shared media-consent + map gating for every page that can show a Google Map
// or a cookie banner. This is the single source of truth for consent behaviour;
// pages no longer carry their own inline copy.
//
// Contract (all elements optional - every page gets a different subset):
//   #cookie-banner        consent banner shown when no choice has been made
//   #accept-cookies       accept button
//   #decline-cookies      decline button
//   #google-map-iframe    map frame, carries data-src until consent is given
//   #map-placeholder      overlay prompting the visitor to enable the map
//   #placeholder-accept   button inside that overlay
//   #cookie-settings      footer link that withdraws / re-asks consent
(function () {
    'use strict';

    var KEY = 'sva_cookie_consent';

    function readConsent() {
        try {
            return localStorage.getItem(KEY);
        } catch (err) {
            return null;
        }
    }

    function writeConsent(value) {
        try {
            localStorage.setItem(KEY, value);
        } catch (err) {
            // Storage unavailable (private mode); consent simply will not persist.
        }
    }

    function clearConsent() {
        try {
            localStorage.removeItem(KEY);
        } catch (err) {
            /* nothing persisted */
        }
    }

    // Promote data-src -> src, which is what actually triggers the map request.
    function loadMap(iframe, placeholder) {
        if (!iframe) return;
        var dataSrc = iframe.getAttribute('data-src');
        if (!dataSrc) return;

        iframe.src = dataSrc;
        iframe.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    }

    // Undo a load made under a previous consent choice. Clearing the attribute
    // alone is not enough to tear the frame down, so point it at about:blank.
    function unloadMap(iframe, placeholder) {
        if (iframe) {
            iframe.removeAttribute('src');
            iframe.src = 'about:blank';
            iframe.style.display = 'none';
        }
        if (placeholder) placeholder.style.display = 'flex';
    }

    function showBanner(banner) {
        if (banner) banner.style.display = 'flex';
    }

    function hideBanner(banner) {
        if (banner) banner.style.display = 'none';
    }

    function accept(banner, iframe, placeholder) {
        writeConsent('accepted');
        hideBanner(banner);
        loadMap(iframe, placeholder);
    }

    function decline(banner, iframe, placeholder) {
        writeConsent('declined');
        hideBanner(banner);
        // Any map that was loaded under an earlier choice must come down.
        unloadMap(iframe, placeholder);
    }

    function init() {
        var banner = document.getElementById('cookie-banner');
        var acceptBtn = document.getElementById('accept-cookies');
        var declineBtn = document.getElementById('decline-cookies');
        var iframe = document.getElementById('google-map-iframe');
        var placeholder = document.getElementById('map-placeholder');
        var placeholderAccept = document.getElementById('placeholder-accept');
        var settingsLink = document.getElementById('cookie-settings');

        var consent = readConsent();

        // No stored choice: prompt. Pages without a banner rely on the map
        // placeholder being visible, which it already is.
        if (!consent) {
            showBanner(banner);
        } else if (consent === 'accepted') {
            loadMap(iframe, placeholder);
        } else {
            // Previously declined: make sure nothing is left loaded.
            unloadMap(iframe, placeholder);
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                accept(banner, iframe, placeholder);
            });
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', function () {
                decline(banner, iframe, placeholder);
            });
        }

        if (placeholderAccept) {
            placeholderAccept.addEventListener('click', function () {
                accept(banner, iframe, placeholder);
            });
        }

        if (settingsLink) {
            settingsLink.addEventListener('click', function (e) {
                e.preventDefault();
                clearConsent();
                unloadMap(iframe, placeholder);
                showBanner(banner);
                settingsLink.textContent = 'Consent cleared - please choose again';

                var target = banner || placeholder;
                if (target && target.scrollIntoView) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();