import { CONFIG } from './config.js';

// Initialize Supabase Client
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
    const form = $('waitlist-form');
    const emailInput = $('waitlist-email');
    const roleSelect = $('waitlist-role');
    const submitBtn = $('waitlist-submit-btn');
    const successContainer = $('success-container');
    const formContainer = $('form-container');
    
    // Parse URL source/ref parameter if exists (e.g. waitlist.html?ref=twitter)
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('ref') || urlParams.get('utm_source') || 'direct';

    function showToast(msg, isError = true) {
        const toast = $('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.borderColor = isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
        toast.style.background = isError ? 'rgba(20, 10, 10, 0.9)' : 'rgba(10, 20, 10, 0.9)';
        toast.classList.remove('opacity-0', 'translate-y-20');
        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-20'), 4000);
    }

    function showSuccess(message, position) {
        const successTitle = $('success-title');
        const posContainer = $('position-badge-container');
        const posNumber = $('position-number');
        const twitterBtn = $('share-twitter-btn');
        const whatsappBtn = $('share-whatsapp-btn');

        if (successTitle) {
            successTitle.textContent = message;
        }

        if (position && posContainer && posNumber) {
            posNumber.textContent = `#${position}`;
            posContainer.classList.remove('hidden');
        } else if (posContainer) {
            posContainer.classList.add('hidden');
        }

        // Configure Twitter/WhatsApp share buttons
        const twitterText = encodeURIComponent("I just joined the Cloasta waitlist 🌊\nYour AI. Closest to you.\nLaunching May 20 👇\ncloasta-waitlist.vercel.app\n#Cloasta #AI #buildinpublic");
        const whatsappText = encodeURIComponent("Check out Cloasta 🌊 \nYour AI closest to you.\nLaunching May 20!\ncloasta-waitlist.vercel.app");

        if (twitterBtn) {
            twitterBtn.href = `https://twitter.com/intent/tweet?text=${twitterText}`;
        }
        if (whatsappBtn) {
            whatsappBtn.href = `https://api.whatsapp.com/send?text=${whatsappText}`;
        }

        // Start countdown to May 20
        startCountdown();

        // Smooth cinematic transition to success state
        if (formContainer && successContainer) {
            formContainer.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
                setTimeout(() => {
                    successContainer.classList.remove('opacity-0', 'scale-95');
                }, 50);
            }, 300);
        }
    }

    function showError(message) {
        showToast(message, true);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Get Early Access</span>`;
        }
    }

    async function joinWaitlist(email, role) {
        try {
            const { error } = await supabase
                .from('cloasta_waitlist')
                .insert([{ 
                    email: email.trim().toLowerCase(),
                    role: role || 'User',
                    source: source || 'direct'
                }]);
            
            if (error) {
                if (error.code === '23505') {
                    showSuccess("You're already on the list! See you May 20 🎉", null);
                    return;
                }
                console.error('Insert error:', error);
                showError('Something went wrong: ' + error.message);
                return;
            }
            
            const { count } = await supabase
                .from('cloasta_waitlist')
                .select('*', { count: 'exact', head: true });
            
            showSuccess("You're on the list! 🎉", count);
            
        } catch (err) {
            console.error('Catch error:', err);
            showError('Please try again.');
        }
    }

    function startCountdown() {
        const launchDate = new Date("May 20, 2026 00:00:00").getTime();
        
        function update() {
            const now = new Date().getTime();
            const distance = launchDate - now;
            
            if (distance < 0) {
                if ($('countdown-days')) $('countdown-days').textContent = '00';
                if ($('countdown-hours')) $('countdown-hours').textContent = '00';
                if ($('countdown-mins')) $('countdown-mins').textContent = '00';
                if ($('countdown-secs')) $('countdown-secs').textContent = '00';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if ($('countdown-days')) $('countdown-days').textContent = String(days).padStart(2, '0');
            if ($('countdown-hours')) $('countdown-hours').textContent = String(hours).padStart(2, '0');
            if ($('countdown-mins')) $('countdown-mins').textContent = String(minutes).padStart(2, '0');
            if ($('countdown-secs')) $('countdown-secs').textContent = String(seconds).padStart(2, '0');
        }
        
        update();
        setInterval(update, 1000);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput?.value.trim();
            const role = roleSelect?.value;

            if (!email || !email.includes('@')) {
                showToast('Please enter a valid email address.');
                return;
            }

            if (!role) {
                showToast('Please select your role.');
                return;
            }

            // Disable submit button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Securing Spot...</span>
                `;
            }

            await joinWaitlist(email, role);
        });
    }
});
