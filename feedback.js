/**
 * ==========================================================================
 * FEEDBACK ENGINE — CLIENT SCRIPT
 * ==========================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ─── Dynamic Year ─── */
    document.querySelectorAll('#year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    /* ─── Mobile Nav Drawer ─── */
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('nav-links');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ─── Rating Slider Output ─── */
    const ratingSlider = document.getElementById('overall-rating');
    if (ratingSlider) {
        const ratingLabel = document.createElement('span');
        ratingLabel.style.cssText = 'margin-left: 0.75rem; font-weight: 700; color: var(--color-primary); font-size: 0.95rem;';
        ratingLabel.textContent = `${ratingSlider.value} / 10`;
        ratingSlider.parentNode.appendChild(ratingLabel);

        ratingSlider.addEventListener('input', () => {
            ratingLabel.textContent = `${ratingSlider.value} / 10`;
        });
    }

    /* ─── Toast Notice Helper ─── */
    function showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }

    /* ─── Handle Form Submission ─── */
    const feedbackForm   = document.getElementById('clientFeedbackForm');
    const successMessage = document.getElementById('success-message');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault();

            feedbackForm.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'block';
            }
            window.scrollTo({
                top: document.querySelector('.form-container').offsetTop - 60,
                behavior: 'smooth'
            });

            showToast('✓ Thank you for submitting your feedback!');
        });
    }

});
