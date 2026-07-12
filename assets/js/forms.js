document.addEventListener('DOMContentLoaded', function() {
    
    // Target the forms
    const enquiryForm = document.getElementById('enquiryForm');
    const orderForm = document.getElementById('orderForm');

    // 1. General Enquiry Submission Handler
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather input fields for backend processing
            const data = {
                name: document.getElementById('enquiryName').value,
                contact: document.getElementById('enquiryContact').value,
                location: document.getElementById('enquiryLocation').value,
                message: document.getElementById('enquiryMsg').value
            };

            console.log('Enquiry Form Submitted:', data);
            
            // Placeholder actions - Your developer can link this directly to an email API
            alert('Enquiry received. Shropshire Vehicle Access will contact you shortly.');
            enquiryForm.reset();
        });
    }

    // 2. Emergency Order Submission Handler
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather urgent machinery information
            const data = {
                class: document.getElementById('vehicleType').value,
                specs: document.getElementById('v5Details').value,
                urgency: document.getElementById('jobUrgency').value,
                location: document.getElementById('siteAddress').value
            };

            console.log('Emergency Order Dispatched:', data);
            
            // Action feedback loop
            alert('Emergency order logged. The duty mobile workshop manager will review dispatch status immediately.');
            orderForm.reset();
        });
    }
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
