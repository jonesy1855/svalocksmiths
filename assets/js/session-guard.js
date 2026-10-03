/**
 * SVA Locksmiths — idle session guard
 * =====================================
 * Firebase Auth keeps a user signed in indefinitely, which is a problem on a
 * borrowed laptop or a shared tablet: the next person inherits the session.
 * This script signs the user out after 30 minutes of inactivity and destroys
 * the local traces of it, so the account is locked again.
 *
 * What "destroyed" means here:
 *   1. firebase.auth().signOut()      — discards the ID token; the next sign-in
 *                                       gets a brand new one.
 *   2. setPersistence(NONE)           — stops the browser re-persisting a token
 *                                       for this account.
 *   3. Cached HTML purged             — the service worker caches every page it
 *                                       visits, including the signed-in ones.
 *                                       Without this, the next person could go
 *                                       offline and still read them.
 *   4. sessionStorage + app keys cleared from localStorage.
 *
 * Static assets (CSS/JS/images) are deliberately left in the cache so the
 * offline fallback page keeps working.
 *
 * Logging out by hand has the same effect: this watches auth state, so the
 * "Sign Out" button and the timeout share one cleanup path.
 *
 * Loaded on: preview.html, services/all-keys-lost.html
 */
(function () {
    'use strict';

    var IDLE_LIMIT_MS = 30 * 60 * 1000;   // sign out after this much silence
    var WARN_BEFORE_MS = 2 * 60 * 1000;   // start warning this long before
    var ACTIVITY_THROTTLE_MS = 1000;      // ignore activity closer together than this

    var lastActivity = Date.now();
    var lastThrottle = 0;
    var idleTimer = null;
    var countdownTimer = null;
    var warningEl = null;
    var destroying = false;
    var firebaseAuth = null;

    // -----------------------------------------------------------------------
    // Cleanup steps
    // -----------------------------------------------------------------------

    /** Drop cached HTML but keep cached CSS/JS/images. */
    function purgeCachedPages() {
        if (!('caches' in window)) return Promise.resolve();

        return caches.keys()
            .then(function (names) {
                return Promise.all(names.map(function (name) {
                    return caches.open(name).then(function (cache) {
                        return cache.keys().then(function (requests) {
                            return Promise.all(requests.map(function (request) {
                                if (isPageRequest(request)) {
                                    return cache.delete(request);
                                }
                                return false;
                            }));
                        });
                    });
                }));
            })
            .catch(function () {
                // Cache Storage unavailable (private mode, quota). Nothing to do.
            });
    }

    /** True for anything that renders a page, false for static assets. */
    function isPageRequest(request) {
        if (request.mode === 'navigate') return true;
        if (request.mode !== 'same-origin' && request.mode !== 'cors') return false;

        var path = new URL(request.url).pathname;
        // .html documents are pages even though they have an extension. Assets
        // end in something like .css/.js/.png; a bare path is a page too.
        if (/\.html?$/i.test(path)) return true;
        return !/\.[a-z0-9]{2,5}$/i.test(path);
    }

    /**
     * Clear per-tab session state.
     *
     * localStorage is deliberately left alone. The Firebase SDK persists the
     * auth token in IndexedDB, not there, so there is no credential to remove,
     * and wiping it would throw away the visitor's cookie-consent choice and
     * make the banner reappear for no security gain.
     */
    function clearWebStorage() {
        try {
            window.sessionStorage.clear();
        } catch (e) { /* private mode */ }
    }

    /**
     * End the session and scrub the device. Safe to call more than once.
     * @param {string} reason 'timeout' | 'manual'
     */
    function destroySession(reason) {
        if (destroying) return Promise.resolve();
        destroying = true;

        hideWarning();
        stopTimers();

        var signOut = Promise.resolve();

        if (firebaseAuth) {
            // Order matters. signOut() drops the live token; NONE then stops the
            // SDK writing a fresh one straight back to disk.
            signOut = Promise.resolve(firebaseAuth.signOut())
                .catch(function () { /* already signed out */ })
                .then(function () {
                    var Persistence = getPersistenceEnum();
                    if (!Persistence || !firebaseAuth.setPersistence) return;
                    return firebaseAuth.setPersistence(Persistence.NONE)
                        .catch(function () { /* unsupported transport */ });
                });
        }

        return signOut
            .then(purgeCachedPages)
            .then(function () { clearWebStorage(); })
            .then(function () {
                var target = loginUrl();
                if (reason === 'timeout') target += '?reason=timeout';
                window.location.replace(target);
            });
    }

    function loginUrl() {
        var here = window.location.pathname;
        // services/*.html sits one level deeper than the root pages.
        return here.indexOf('/services/') === 0 ? 'login.html' : 'services/login.html';
    }

    /**
     * Locate the Persistence enum across the compat and modular SDK shapes.
     * Returns null when we cannot find it, in which case we skip
     * setPersistence rather than guessing and throwing.
     */
    function getPersistenceEnum() {
        var candidates = [
            window.firebase && firebase.Auth && firebase.Auth.Persistence,
            window.firebase && firebase.auth && firebase.auth.Auth && firebase.auth.Auth.Persistence,
            window.firebase && firebase.auth && firebase.auth.Persistence
        ];
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] && candidates[i].NONE != null) return candidates[i];
        }
        return null;
    }

    // -----------------------------------------------------------------------
    // Warning
    // -----------------------------------------------------------------------

    function hideWarning() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        if (warningEl && warningEl.parentNode) {
            warningEl.parentNode.removeChild(warningEl);
        }
        warningEl = null;
    }

    function showWarning() {
        if (warningEl) return;

        var overlay = document.createElement('div');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'sva-idle-title');
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:99999',
            'display:flex', 'align-items:center', 'justify-content:center',
            'padding:20px', 'background:rgba(6,8,12,0.88)'
        ].join(';');

        var panel = document.createElement('div');
        panel.style.cssText = [
            'background:#14171f', 'border:1px solid #2ecc71', 'border-radius:12px',
            'padding:24px', 'max-width:380px', 'width:100%', 'text-align:center',
            'box-shadow:0 12px 40px rgba(0,0,0,0.6)', 'color:#e5e7eb',
            'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif'
        ].join(';');

        var title = document.createElement('h2');
        title.id = 'sva-idle-title';
        title.textContent = 'Still there?';
        title.style.cssText = 'margin:0 0 10px;font-size:1.15rem;color:#fff';

        var body = document.createElement('p');
        body.style.cssText = 'margin:0 0 18px;font-size:0.92rem;line-height:1.5;color:#9ca3af';

        var stay = document.createElement('button');
        stay.type = 'button';
        stay.textContent = 'Stay signed in';
        stay.style.cssText = [
            'width:100%', 'padding:13px', 'border:0', 'border-radius:8px',
            'background:#2ecc71', 'color:#06240f', 'font-weight:800',
            'font-size:0.95rem', 'cursor:pointer'
        ].join(';');

        var signOutBtn = document.createElement('button');
        signOutBtn.type = 'button';
        signOutBtn.textContent = 'Sign out now';
        signOutBtn.style.cssText = [
            'margin-top:10px', 'width:100%', 'padding:11px', 'border:0',
            'background:transparent', 'color:#9ca3af', 'font-size:0.85rem',
            'cursor:pointer'
        ].join(';');

        function tick() {
            var left = Math.max(0, Math.ceil((IDLE_LIMIT_MS - (Date.now() - lastActivity)) / 1000));
            var mins = Math.floor(left / 60);
            var secs = left % 60;
            body.textContent = 'For your security we sign you out after 30 minutes of inactivity. '
                + 'You have ' + mins + ':' + (secs < 10 ? '0' + secs : secs)
                + ' left before that happens.';
        }

        stay.addEventListener('click', function () {
            recordActivity();
        });

        signOutBtn.addEventListener('click', function () {
            destroySession('manual');
        });

        panel.appendChild(title);
        panel.appendChild(body);
        panel.appendChild(stay);
        panel.appendChild(signOutBtn);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        warningEl = overlay;
        tick();
        countdownTimer = setInterval(tick, 1000);
        stay.focus();
    }

    // -----------------------------------------------------------------------
    // Activity + timers
    // -----------------------------------------------------------------------

    function recordActivity() {
        lastActivity = Date.now();
        hideWarning();
        if (!destroying) scheduleIdleCheck();
    }

    function onActivity() {
        var now = Date.now();
        // Mouse movement fires constantly. Throttle so a single sweep of the
        // cursor over the page can't pin the session open on its own.
        if (now - lastThrottle < ACTIVITY_THROTTLE_MS) return;
        lastThrottle = now;
        recordActivity();
    }

    function scheduleIdleCheck() {
        if (idleTimer) clearTimeout(idleTimer);

        var remaining = IDLE_LIMIT_MS - (Date.now() - lastActivity);

        if (remaining <= 0) {
            destroySession('timeout');
            return;
        }

        // Wake up early enough to show the warning, then again to enforce.
        var delay = remaining > WARN_BEFORE_MS
            ? remaining - WARN_BEFORE_MS
            : remaining;

        idleTimer = setTimeout(function () {
            var left = IDLE_LIMIT_MS - (Date.now() - lastActivity);
            if (left <= 0) {
                destroySession('timeout');
                return;
            }
            if (left <= WARN_BEFORE_MS) {
                showWarning();
                idleTimer = setTimeout(function () {
                    destroySession('timeout');
                }, left);
                return;
            }
            scheduleIdleCheck();
        }, Math.max(250, delay));
    }

    function stopTimers() {
        if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    }

    function attachActivityListeners() {
        var events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'wheel', 'focus'];
        events.forEach(function (evt) {
            window.addEventListener(evt, onActivity, { passive: true });
        });
        // Pointer movement, sampled rather than raw — mousemove is too chatty
        // to bind directly without hurting scrolling.
        document.addEventListener('mousemove', onActivity, { passive: true });

        // Coming back to a backgrounded tab is activity.
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) onActivity();
        });
    }

    // -----------------------------------------------------------------------
    // Boot
    // -----------------------------------------------------------------------

    function start() {
        attachActivityListeners();

        if (!window.firebase || !firebase.auth) return;

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                firebaseAuth = firebase.auth();
                lastActivity = Date.now();
                scheduleIdleCheck();
            } else {
                // Covers the "Sign Out" button too: whenever the session ends by
                // any route, scrub the device the same way.
                firebaseAuth = null;
                stopTimers();
                hideWarning();
                purgeCachedPages().then(clearWebStorage);
            }
        });
    }

    // Exposed so the logout buttons can scrub before they navigate.
    window.SVASession = {
        destroy: destroySession,
        purge: purgeCachedPages,
        idleLimitMinutes: IDLE_LIMIT_MS / 60000
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();