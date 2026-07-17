document.addEventListener('DOMContentLoaded', function() {
    // JavaScript form intercepts removed to allow native HTML Formspree submission.
});

// --- Horizontal Video Slider Logic ---
const videoReel = document.getElementById('videoReel');
const btnLeft = document.getElementById('slideLeft');
const btnRight = document.getElementById('slideRight');

if (videoReel && btnLeft && btnRight) {
    // Dynamic math to track width sizing changes
    const getScrollPosition = () => {
        const firstCard = videoReel.querySelector('.video-card');
        return firstCard ? firstCard.clientWidth + 24 : 320; // Card width + layout gaps
    };

    btnLeft.addEventListener('click', () => {
        videoReel.scrollBy({ left: -getScrollPosition(), behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
        videoReel.scrollBy({ left: getScrollPosition(), behavior: 'smooth' });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const videoWrapper = document.getElementById("xhorseVideoWrapper");
    const videoOverlay = document.getElementById("videoOverlay");
    const iframe = document.getElementById("xhorseIframe");

    if (videoOverlay && iframe) {
        videoOverlay.addEventListener("click", function() {
            // 1. Hide the glass shield overlay
            videoOverlay.style.display = "none";
            
            // 2. Allow pointer events to register on YouTube's player UI
            videoWrapper.classList.add("activated");
            
            // 3. Swap the iframe src to load full controls and remove force-mute
            iframe.src = "https://www.youtube.com/embed/LVGqfBbJvG8?autoplay=1&controls=1&rel=0";
        });
    }
});

