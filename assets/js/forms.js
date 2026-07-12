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
