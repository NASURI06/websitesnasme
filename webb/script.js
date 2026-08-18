// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeContent();
    initializeFooter();
    initializeContactForm();
    initializeLoginForm();
    initializeSignupForm();
    addNavbarTransitionEffects();
    initializeNavToggle();
});

// Navbar functionality
function initializeNavbar() {
    const navItems = document.querySelectorAll('.nav-li');
    
    navItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
    });
}

function handleNavClick(event) {
    const navItems = document.querySelectorAll('.nav-li');
    navItems.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Content functionality
function initializeContent() {
    const contentImage = document.querySelector('.content-image');
    
    if (contentImage) {
        contentImage.addEventListener('load', function() {
            console.log('Image loaded successfully');
        });
        
        contentImage.addEventListener('error', function() {
            console.error('Failed to load image');
            this.alt = 'Image not found';
        });
    }
}

// Footer functionality
function initializeFooter() {
    const footerLink = document.querySelector('.footer-link');
    
    if (footerLink) {
        footerLink.addEventListener('click', function(event) {
            console.log('Footer link clicked:', this.href);
        });
    }
}

// Contact form functionality
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formStatus = document.getElementById('formStatus');
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    try {
        formStatus.textContent = 'Sending...';
        formStatus.className = 'form-status loading';
        
        const response = await fetch('http://localhost:3000/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            formStatus.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
            formStatus.className = 'form-status success';
            form.reset();
            
            // Clear status message after 5 seconds
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }, 5000);
        } else {
            formStatus.textContent = '✗ Error: ' + (data.error || 'Failed to send message');
            formStatus.className = 'form-status error';
        }
    } catch (error) {
        console.error('Error:', error);
        formStatus.textContent = '✗ Error: Could not send message. Make sure the server is running on localhost:3000';
        formStatus.className = 'form-status error';
    }
}

// Utility functions
function highlightNavItem(itemText) {
    const navItems = document.querySelectorAll('.nav-li');
    navItems.forEach(item => {
        if (item.textContent === itemText) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Navbar toggle button functionality
function initializeNavToggle() {
    const toggle = document.getElementById('navToggle');
    const navbar = document.querySelector('.navbar');
    
    if (!toggle || !navbar) return;
    
    toggle.addEventListener('click', function() {
        const isOpen = navbar.classList.toggle('open');
        toggle.classList.toggle('active', isOpen);
        toggle.textContent = isOpen ? '✕' : '☰';
    });
    
    navbar.addEventListener('click', function(e) {
        if (e.target.closest('.nav-li')) {
            navbar.classList.remove('open');
            toggle.classList.remove('active');
            toggle.textContent = '☰';
        }
    });
}

// Navbar transition effects
function addNavbarTransitionEffects() {
    const navbar = document.querySelector('.navbar');
    const navItems = document.querySelectorAll('.nav-li');
    
    // Add stagger animation to nav items
    navItems.forEach((item, index) => {
        item.style.animation = `fadeInNavItems 0.6s ease-out ${0.2 + index * 0.1}s both`;
    });
    
    // Add click animation to nav items
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked item
            this.classList.add('active');
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Login form functionality
function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    
    if (form) {
        form.addEventListener('submit', handleLoginSubmit);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const loginStatus = document.getElementById('loginStatus');
    
    const loginData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        remember: document.getElementById('remember').checked
    };
    
    try {
        loginStatus.textContent = 'Signing in...';
        loginStatus.className = 'form-status loading';
        
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loginStatus.textContent = '✓ Login successful! Redirecting...';
            loginStatus.className = 'form-status success';
            
            // Store token if remember me is checked
            if (loginData.remember) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('username', loginData.username);
            }
            
            // Redirect to home after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            loginStatus.textContent = '✗ Error: ' + (data.error || 'Invalid credentials');
            loginStatus.className = 'form-status error';
        }
    } catch (error) {
        console.error('Error:', error);
        loginStatus.textContent = '✗ Error: Could not connect to server. Make sure it\'s running on localhost:3000';
        loginStatus.className = 'form-status error';
    }
}

// Signup form functionality
function initializeSignupForm() {
    const form = document.getElementById('signupForm');
    
    if (form) {
        form.addEventListener('submit', handleSignupSubmit);
    }
}

async function handleSignupSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const signupStatus = document.getElementById('signupStatus');
    
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        signupStatus.textContent = '✗ Error: Passwords do not match';
        signupStatus.className = 'form-status error';
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        signupStatus.textContent = '✗ Error: Password must be at least 6 characters';
        signupStatus.className = 'form-status error';
        return;
    }
    
    const signupData = {
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('signup-email').value,
        username: document.getElementById('signup-username').value,
        password: password
    };
    
    try {
        signupStatus.textContent = 'Creating account...';
        signupStatus.className = 'form-status loading';
        
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            signupStatus.textContent = '✓ Account created successfully! Redirecting to login...';
            signupStatus.className = 'form-status success';
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            signupStatus.textContent = '✗ Error: ' + (data.error || 'Could not create account');
            signupStatus.className = 'form-status error';
        }
    } catch (error) {
        console.error('Error:', error);
        signupStatus.textContent = '✗ Error: Could not connect to server. Make sure it\'s running on localhost:3000';
        signupStatus.className = 'form-status error';
    }
}