// Tab switching functionality
const authTabs = document.querySelectorAll('.auth-tab');
const authContents = document.querySelectorAll('.auth-content');

authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        authTabs.forEach(t => t.classList.remove('active'));
        authContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Local Storage Keys
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

// Initialize users from localStorage
let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

// Login Form Handling
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        // Redirect to dashboard
        window.location.href = 'index.html';
    } else {
        showMessage('Invalid email or password', 'error');
    }
});

// Register Form Handling
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showMessage('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password
    };
    
    // Add user to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    showMessage('Registration successful! Please sign in.', 'success');
    
    // Switch to login tab
    document.querySelector('[data-tab="login"]').click();
    
    // Clear form
    registerForm.reset();
});

// Utility function to show messages
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message`;
    messageElement.textContent = message;
    
    // Add message to the active form
    const activeForm = document.querySelector('.auth-content.active form');
    activeForm.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Check if user is already logged in
const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
if (currentUser) {
    window.location.href = 'index.html';
} 