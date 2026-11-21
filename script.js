/**
 * ==========================================================================
 * ROLLINS BRIGHT WONDER — CLIENT SCRIPTS
 * Style: Clean Vanilla JS / Agency Interaction Engine
 * ==========================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ─── 01. Dynamic Copyright Year ─── */
    document.querySelectorAll('#year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    /* ─── 02. Navigation Active State & Scroll Handling ─── */
    const nav      = document.getElementById('main-nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#nav-links a');
    const backBtn  = document.getElementById('back-to-top');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Active link tracking
        let currentId = '';
        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop - 140) {
                currentId = sec.id;
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
                link.classList.add('active');
            } else if (href && href.startsWith('#')) {
                link.classList.remove('active');
            }
        });

        // Back to top visibility
        if (backBtn) {
            backBtn.classList.toggle('visible', scrollY > 400);
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ─── 03. Mobile Menu Drawer ─── */
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

    /* ─── 04. Back to Top Smooth Scroll ─── */
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ─── 05. Case Study Filter Pills ─── */
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                const show = filter === 'all' || card.dataset.category === filter;
                card.style.display = show ? 'flex' : 'none';
            });
        });
    });

    /* ─── 06. Toast Notice ─── */
    function showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }
    window.showToast = showToast;

    /* ─── 07. Copy to Clipboard ─── */
    window.copyToClipboard = function(btn, event) {
        if (event) event.preventDefault();
        const text = btn.dataset.copy;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            showToast(`✓ Copied to clipboard: ${text}`);
            setTimeout(() => {
                btn.textContent = orig;
            }, 2000);
        }).catch(() => {
            showToast('Unable to copy automatically. Please copy manually.');
        });
    };

    /* ─── 08. Agency Contact Form (AJAX via Formspree) ─── */
    const contactForm = document.getElementById('contact-form');
    const formStatus  = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending Message...</span>`;
            formStatus.className = 'form-status-alert';
            formStatus.textContent = '';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.className = 'form-status-alert success';
                    formStatus.textContent = '✓ Thank you! Your message has been received. I will be in touch shortly.';
                    contactForm.reset();
                    showToast('✓ Message sent successfully!');
                } else {
                    throw new Error('Non-200 server response');
                }
            } catch {
                formStatus.className = 'form-status-alert error';
                formStatus.innerHTML = 'Something went wrong. Please email directly at <strong>rollinswonder@outlook.com</strong>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        });
    }

});
