// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Display user name
document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Local Storage Keys
const WARRANTIES_KEY = `warranties_${currentUser.id}`;
const BILLS_KEY = `bills_${currentUser.id}`;
const FILES_KEY = `files_${currentUser.id}`;
const FEEDBACK_KEY = 'feedback';
const NOTIFICATIONS_KEY = `notifications_${currentUser.id}`;

// Initialize data from localStorage
let warranties = JSON.parse(localStorage.getItem(WARRANTIES_KEY)) || [];
let bills = JSON.parse(localStorage.getItem(BILLS_KEY)) || [];
let files = JSON.parse(localStorage.getItem(FILES_KEY)) || [];
let feedback = JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
let notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || [];

// Warranty Form Handling
const warrantyForm = document.getElementById('warranty-form');
warrantyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const warranty = {
        id: Date.now(),
        productName: document.getElementById('product-name').value,
        provider: document.getElementById('warranty-provider').value,
        purchaseDate: document.getElementById('purchase-date').value,
        endDate: document.getElementById('warranty-end').value,
        reminderDays: parseInt(document.getElementById('warranty-reminder-days').value),
        notes: document.getElementById('warranty-notes').value
    };
    
    warranties.push(warranty);
    saveWarranties();
    displayWarranties();
    warrantyForm.reset();
    
    // Schedule reminder
    scheduleWarrantyReminder(warranty);
});

// Bill Form Handling
const billForm = document.getElementById('bill-form');
billForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const bill = {
        id: Date.now(),
        name: document.getElementById('bill-name').value,
        amount: document.getElementById('bill-amount').value,
        date: document.getElementById('bill-date').value,
        dueDate: document.getElementById('due-date').value,
        reminderDays: parseInt(document.getElementById('bill-reminder-days').value),
        status: document.getElementById('bill-status').value
    };
    
    bills.push(bill);
    saveBills();
    displayBills();
    billForm.reset();
    
    // Schedule reminder
    scheduleBillReminder(bill);
});

// File Upload Form Handling
const fileUploadForm = document.getElementById('file-upload-form');
const fileInput = document.getElementById('file-input');
const cameraInput = document.getElementById('camera-input');
const previewImg = document.getElementById('preview-img');

// Function to handle file preview
function handleFilePreview(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Handle file input change
fileInput.addEventListener('change', (e) => {
    handleFilePreview(e.target.files[0]);
});

// Handle camera input change
cameraInput.addEventListener('change', (e) => {
    handleFilePreview(e.target.files[0]);
});

fileUploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get file from either input
    const file = fileInput.files[0] || cameraInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Get current date and time
            const now = new Date();
            const dateTime = now.toLocaleString();
            
            const newFile = {
                id: Date.now(),
                name: document.getElementById('file-name').value || `Image_${dateTime.replace(/[^0-9]/g, '')}`,
                type: document.getElementById('file-type').value,
                description: document.getElementById('file-description').value,
                image: e.target.result,
                uploadDate: now.toISOString(),
                captureDate: dateTime,
                userId: currentUser.id
            };
            
            files.push(newFile);
            saveFiles();
            displayFiles();
            fileUploadForm.reset();
            previewImg.style.display = 'none';
            
            // Clear both inputs
            fileInput.value = '';
            cameraInput.value = '';
        };
        reader.readAsDataURL(file);
    }
});

// Feedback Form Handling
const feedbackForm = document.getElementById('feedback-form');
feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newFeedback = {
        id: Date.now(),
        title: document.getElementById('feedback-title').value,
        content: document.getElementById('feedback-content').value,
        rating: document.getElementById('feedback-rating').value,
        userId: currentUser.id,
        userName: currentUser.name,
        date: new Date().toISOString()
    };
    
    feedback.push(newFeedback);
    saveFeedback();
    displayFeedback();
    feedbackForm.reset();
});

// Notification UI Handling
const notificationsBtn = document.getElementById('notifications-btn');
const notificationsDropdown = document.getElementById('notifications-dropdown');
const notificationsList = document.getElementById('notifications-list');
const clearNotificationsBtn = document.getElementById('clear-notifications');

notificationsBtn.addEventListener('click', () => {
    notificationsDropdown.classList.toggle('active');
    updateNotificationCount();
});

clearNotificationsBtn.addEventListener('click', () => {
    notifications = [];
    saveNotifications();
    displayNotifications();
    updateNotificationCount();
});

// Save to localStorage
function saveWarranties() {
    localStorage.setItem(WARRANTIES_KEY, JSON.stringify(warranties));
}

function saveBills() {
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

function saveFiles() {
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

function saveFeedback() {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

function saveNotifications() {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Display functions
function displayWarranties() {
    const warrantiesList = document.getElementById('warranties-list');
    warrantiesList.innerHTML = '';
    
    warranties.forEach(warranty => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h3>${warranty.productName}</h3>
            <p><strong>Provider:</strong> ${warranty.provider}</p>
            <p><strong>Purchase Date:</strong> ${formatDate(warranty.purchaseDate)}</p>
            <p><strong>End Date:</strong> ${formatDate(warranty.endDate)}</p>
            <p><strong>Notes:</strong> ${warranty.notes}</p>
            <button class="delete-btn" onclick="deleteWarranty(${warranty.id})">Delete</button>
        `;
        warrantiesList.appendChild(card);
    });
}

function displayBills() {
    const billsList = document.getElementById('bills-list');
    billsList.innerHTML = '';
    
    bills.forEach(bill => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h3>${bill.name}</h3>
            <p><strong>Amount:</strong> $${bill.amount}</p>
            <p><strong>Date:</strong> ${formatDate(bill.date)}</p>
            <p><strong>Due Date:</strong> ${formatDate(bill.dueDate)}</p>
            <span class="status ${bill.status}">${bill.status}</span>
            <button class="delete-btn" onclick="deleteBill(${bill.id})">Delete</button>
        `;
        billsList.appendChild(card);
    });
}

function displayFiles() {
    const filesList = document.getElementById('files-list');
    filesList.innerHTML = '';
    
    const userFiles = files.filter(f => f.userId === currentUser.id);
    
    userFiles.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <img src="${file.image}" alt="${file.name}" class="file-preview">
            <div class="file-info">
                <h3>${file.name}</h3>
                <div class="file-meta">
                    <p>Type: ${file.type}</p>
                    <p>Captured: ${file.captureDate}</p>
                    <p>Uploaded: ${formatDate(file.uploadDate)}</p>
                </div>
                <div class="file-actions">
                    <button class="file-btn view-btn" onclick="viewFile(${file.id})">View</button>
                    <button class="file-btn delete-btn" onclick="deleteFile(${file.id})">Delete</button>
                </div>
            </div>
        `;
        filesList.appendChild(card);
    });
}

function displayFeedback() {
    const feedbackList = document.getElementById('feedback-list');
    feedbackList.innerHTML = '';
    
    feedback.forEach(item => {
        const card = document.createElement('div');
        card.className = 'feedback-card';
        card.innerHTML = `
            <div class="feedback-header">
                <h3 class="feedback-title">${item.title}</h3>
                <span class="feedback-date">${formatDate(item.date)}</span>
            </div>
            <div class="feedback-content">${item.content}</div>
            <div class="feedback-rating">
                ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
            </div>
            <div class="feedback-author">By: ${item.userName}</div>
        `;
        feedbackList.appendChild(card);
    });
}

function displayNotifications() {
    notificationsList.innerHTML = '';
    
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? '' : 'unread'}`;
        item.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${formatDate(notification.timestamp)}</div>
        `;
        
        item.addEventListener('click', () => {
            notification.read = true;
            saveNotifications();
            displayNotifications();
            updateNotificationCount();
        });
        
        notificationsList.appendChild(item);
    });
}

function updateNotificationCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('notification-count').textContent = unreadCount;
}

// Delete functions
function deleteWarranty(id) {
    warranties = warranties.filter(w => w.id !== id);
    saveWarranties();
    displayWarranties();
}

function deleteBill(id) {
    bills = bills.filter(b => b.id !== id);
    saveBills();
    displayBills();
}

function deleteFile(id) {
    files = files.filter(f => f.id !== id);
    saveFiles();
    displayFiles();
}

// View file in modal
function viewFile(id) {
    const file = files.find(f => f.id === id);
    if (file) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>${file.name}</h2>
                <p>Type: ${file.type}</p>
                <p>Captured: ${file.captureDate}</p>
                <p>Uploaded: ${formatDate(file.uploadDate)}</p>
                <p>${file.description}</p>
                <img src="${file.image}" alt="${file.name}" class="modal-image">
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
}

// Utility function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Initial display
displayWarranties();
displayBills();
displayFiles();
displayFeedback();
displayNotifications();
updateNotificationCount();

// Check for overdue bills
function checkOverdueBills() {
    const today = new Date();
    bills.forEach(bill => {
        if (bill.status !== 'paid' && new Date(bill.dueDate) < today) {
            bill.status = 'overdue';
        }
    });
    saveBills();
    displayBills();
}

// Check overdue bills every day
setInterval(checkOverdueBills, 24 * 60 * 60 * 1000);
checkOverdueBills(); // Initial check

// Reminder scheduling functions
function scheduleWarrantyReminder(warranty) {
    const endDate = new Date(warranty.endDate);
    const reminderDate = new Date(endDate);
    reminderDate.setDate(reminderDate.getDate() - warranty.reminderDays);
    
    if (reminderDate > new Date()) {
        const timeUntilReminder = reminderDate.getTime() - new Date().getTime();
        setTimeout(() => {
            addNotification(
                'Warranty Expiring Soon',
                `The warranty for ${warranty.productName} will expire in ${warranty.reminderDays} days.`,
                warranty.id
            );
        }, timeUntilReminder);
    }
}

function scheduleBillReminder(bill) {
    const dueDate = new Date(bill.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - bill.reminderDays);
    
    if (reminderDate > new Date()) {
        const timeUntilReminder = reminderDate.getTime() - new Date().getTime();
        setTimeout(() => {
            addNotification(
                'Bill Due Soon',
                `The bill for ${bill.name} is due in ${bill.reminderDays} days.`,
                bill.id
            );
        }, timeUntilReminder);
    }
}

// Notification functions
function addNotification(title, message, itemId) {
    const notification = {
        id: Date.now(),
        title,
        message,
        itemId,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    saveNotifications();
    displayNotifications();
    updateNotificationCount();
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/path/to/icon.png'
        });
    }
}

// Request notification permission
if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Check for existing reminders on page load
function checkExistingReminders() {
    warranties.forEach(warranty => {
        scheduleWarrantyReminder(warranty);
    });
    
    bills.forEach(bill => {
        scheduleBillReminder(bill);
    });
}

// Initial display
displayWarranties();
displayBills();
displayFiles();
displayFeedback();
displayNotifications();
updateNotificationCount();
checkExistingReminders(); 