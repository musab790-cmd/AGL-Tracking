// AGL MCT Airfield Maintenance Tracker - v3.0 (FIREBASE SYNC)
// NEW: Real-time sync across all devices using Firebase
// Data Storage
let ppmTasks = [];
let cmTasks = [];
let currentEditingTaskId = null;
let uploadedPhotos = [];
let isFirebaseReady = false;
let ppmTasksRef = null;
let cmTasksRef = null;
let isSyncing = false; // Flag to prevent listener loops
let currentView = 'ppm'; // Track current view (ppm or cm)

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase connection
    initializeFirebase();
    
    // Show shift filter by default (PPM view)
    document.getElementById('shiftFilter').style.display = 'inline-block';
    document.getElementById('cmStatusFilter').style.display = 'none';
    
    // Event Listeners
    document.getElementById('ppmForm').addEventListener('submit', addPPMTask);
    document.getElementById('cmForm').addEventListener('submit', addCMTask);
    document.getElementById('searchInput').addEventListener('input', filterTasks);
    document.getElementById('shiftFilter').addEventListener('change', filterTasks);
    document.getElementById('cmStatusFilter').addEventListener('change', filterCMTasks);
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
    
    // Initialize Microsoft Teams (with error handling)
    try {
        if (typeof microsoftTeams !== 'undefined') {
            microsoftTeams.initialize();
        }
    } catch (e) {
        console.log('Teams SDK not available (running standalone)');
    }
});

// Initialize Firebase and setup real-time sync
function initializeFirebase() {
    try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }
        
        // Get database references
        ppmTasksRef = firebase.database().ref('ppmTasks');
        cmTasksRef = firebase.database().ref('cmTasks');
        
        // Setup connection status monitoring
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            if (snapshot.val() === true) {
                updateSyncStatus('online', 'Synced');
                console.log('✅ Firebase connected');
            } else {
                updateSyncStatus('offline', 'Offline');
                console.log('❌ Firebase disconnected');
            }
        });
        
        // Setup real-time listeners for PPM tasks
        ppmTasksRef.on('value', (snapshot) => {
            // Skip if we're currently syncing to prevent loops
            if (isSyncing) {
                console.log('⏸️ Skipping listener (sync in progress)');
                return;
            }
            
            const data = snapshot.val();
            if (data) {
                ppmTasks = Object.values(data).filter(task => {
                    if (!task.dueDate || !isValidDate(task.dueDate)) {
                        console.warn('Filtered task with invalid date:', task);
                        return false;
                    }
                    return true;
                });
            } else {
                ppmTasks = [];
            }
            updateDashboard();
            if (currentView === 'ppm') {
                renderTasks();
            }
            console.log('📥 PPM tasks synced from Firebase:', ppmTasks.length);
        });
        
        // Setup real-time listeners for CM tasks
        cmTasksRef.on('value', (snapshot) => {
            // Skip if we're currently syncing to prevent loops
            if (isSyncing) {
                console.log('⏸️ Skipping CM listener (sync in progress)');
                return;
            }
            
            const data = snapshot.val();
            cmTasks = data ? Object.values(data) : [];
            updateDashboard();
            if (currentView === 'cm') {
                renderCMTasks();
            }
            console.log('📥 CM tasks synced from Firebase:', cmTasks.length);
        });
        
        isFirebaseReady = true;
        updateSyncStatus('online', 'Synced');
        console.log('🚀 Firebase initialized successfully!');
        
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        updateSyncStatus('error', 'Sync Error');
        showNotification('Firebase connection error. Please check firebase-config.js', 'error');
        
        // Fallback to localStorage
        loadData();
        updateDashboard();
        renderTasks();
    }
}

// Update sync status indicator
function updateSyncStatus(status, text) {
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (!indicator || !statusText) return;
    
    // Remove all status classes
    indicator.className = 'status-indicator';
    
    // Add appropriate class
    if (status === 'online') {
        indicator.classList.add('online');
        statusText.style.color = '#2ecc71';
    } else if (status === 'offline') {
        indicator.classList.add('offline');
        statusText.style.color = '#e74c3c';
    } else if (status === 'error') {
        indicator.classList.add('error');
        statusText.style.color = '#e74c3c';
    }
    
    statusText.textContent = text;
}

// Load Data from localStorage (Fallback only)
function loadData() {
    console.log('⚠️ Loading from localStorage (fallback mode)');
    const savedPPM = localStorage.getItem('agl_ppm_tasks');
    const savedCM = localStorage.getItem('agl_cm_tasks');
    
    if (savedPPM) {
        try {
            ppmTasks = JSON.parse(savedPPM);
            ppmTasks = ppmTasks.filter(task => {
                if (!task.dueDate || !isValidDate(task.dueDate)) {
                    console.warn('Removed task with invalid date:', task);
                    return false;
                }
                return true;
            });
        } catch (e) {
            console.error('Error loading PPM tasks:', e);
            ppmTasks = [];
        }
    }
    
    if (savedCM) {
        try {
            cmTasks = JSON.parse(savedCM);
        } catch (e) {
            console.error('Error loading CM tasks:', e);
            cmTasks = [];
        }
    }
}

// Validate Date Function
function isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

// Save Data to Firebase (with localStorage backup)
async function saveData() {
    if (isFirebaseReady && ppmTasksRef && cmTasksRef) {
        // Save to Firebase
        try {
            // Set sync flag to prevent listener loops
            isSyncing = true;
            
            // Convert arrays to objects with task IDs as keys
            const ppmObj = {};
            ppmTasks.forEach(task => {
                ppmObj[task.id] = task;
            });
            
            const cmObj = {};
            cmTasks.forEach(task => {
                cmObj[task.id] = task;
            });
            
            // Use Promise.all to ensure both writes complete
            await Promise.all([
                ppmTasksRef.set(ppmObj),
                cmTasksRef.set(cmObj)
            ]);
            
            console.log('💾 Data saved to Firebase successfully');
            console.log('   - PPM Tasks:', ppmTasks.length);
            console.log('   - CM Tasks:', cmTasks.length);
            updateSyncStatus('online', 'Synced');
            
            // Reset sync flag after a short delay to allow Firebase to propagate
            setTimeout(() => {
                isSyncing = false;
                console.log('✅ Sync flag cleared');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error saving to Firebase:', error);
            updateSyncStatus('error', 'Sync Error');
            isSyncing = false;
        }
    }
    
    // Always backup to localStorage
    localStorage.setItem('agl_ppm_tasks', JSON.stringify(ppmTasks));
    localStorage.setItem('agl_cm_tasks', JSON.stringify(cmTasks));
}

// Update Dashboard Metrics
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    const dueTodayCount = ppmTasks.filter(task => 
        task.dueDate === today && task.status !== 'Completed'
    ).length;
    
    const overdueCount = ppmTasks.filter(task => 
        task.dueDate < today && task.status !== 'Completed'
    ).length;
    
    const inProgressCount = ppmTasks.filter(task => 
        task.status === 'In Progress'
    ).length;
    
    // Count all unresolved CM tasks (Open + In Progress + Pending Parts)
    const openCMCount = cmTasks.filter(task => 
        task.status === 'Open' || task.status === 'In Progress' || task.status === 'Pending Parts'
    ).length;
    
    document.getElementById('tasksDueToday').textContent = dueTodayCount;
    document.getElementById('overdueTasks').textContent = overdueCount;
    document.getElementById('inProgressTasks').textContent = inProgressCount;
    document.getElementById('openCMTasks').textContent = openCMCount;
    
    // Log for debugging
    console.log('Dashboard updated:', {
        dueTodayCount,
        overdueCount,
        inProgressCount,
        openCMCount,
        totalCMTasks: cmTasks.length
    });
}

// Get Smart Status with Color Logic
function getSmartStatus(task) {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = task.dueDate;
    const manualStatus = task.status || 'Not Started';
    
    const todayDate = new Date(today);
    const taskDueDate = new Date(dueDate);
    const diffTime = taskDueDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let smartStatus = {
        text: manualStatus,
        class: '',
        badge: '',
        priority: 0
    };
    
    if (manualStatus === 'Completed') {
        smartStatus.class = 'status-completed';
        smartStatus.badge = '✓';
        smartStatus.priority = 5;
    }
    else if (diffDays < 0) {
        smartStatus.text = `OVERDUE (${Math.abs(diffDays)} days)`;
        smartStatus.class = 'status-overdue';
        smartStatus.badge = '⚠️';
        smartStatus.priority = 1;
    }
    else if (diffDays === 0) {
        smartStatus.text = 'DUE TODAY';
        smartStatus.class = 'status-due-today';
        smartStatus.badge = '🔔';
        smartStatus.priority = 2;
    }
    else if (manualStatus === 'In Progress') {
        smartStatus.class = 'status-progress';
        smartStatus.badge = '⏳';
        smartStatus.priority = 3;
    }
    else if (manualStatus === 'Not Started' && diffDays <= 3) {
        smartStatus.text = `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        smartStatus.class = 'status-upcoming';
        smartStatus.badge = '📅';
        smartStatus.priority = 4;
    }
    else if (manualStatus === 'Not Started') {
        smartStatus.class = 'status-not-started';
        smartStatus.badge = '○';
        smartStatus.priority = 6;
    }
    
    return smartStatus;
}

// Calculate Next Due Date Based on Frequency
function calculateNextDueDate(currentDueDate, frequency) {
    if (!isValidDate(currentDueDate)) {
        console.error('Invalid date provided:', currentDueDate);
        return new Date().toISOString().split('T')[0];
    }
    
    const date = new Date(currentDueDate);
    
    switch(frequency) {
        case 'Daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'Weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'Monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'Quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'Yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            return currentDueDate;
    }
    
    return date.toISOString().split('T')[0];
}

// Render Tasks with Smart Status
function renderTasks(tasksToRender = ppmTasks) {
    const tbody = document.getElementById('tasksTableBody');
    tbody.innerHTML = '';
    
    if (tasksToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">No tasks found</td></tr>';
        return;
    }
    
    tasksToRender.forEach(task => {
        const row = document.createElement('tr');
        
        if (!isValidDate(task.dueDate)) {
            console.error('Task has invalid date:', task);
            task.dueDate = new Date().toISOString().split('T')[0];
        }
        
        const smartStatus = getSmartStatus(task);
        
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = task.dueDate < today && task.status !== 'Completed';
        
        const photoCount = task.photos ? task.photos.length : 0;
        const photoIndicator = photoCount > 0 
            ? `<button class="photo-indicator" onclick="viewPhotos(${task.id})" title="View ${photoCount} photo(s)">📷 ${photoCount}</button>`
            : '<span style="color: #999;">No photos</span>';
        
        row.innerHTML = `
            <td>${task.shiftType || 'N/A'}</td>
            <td>${task.description || 'No description'}</td>
            <td>${task.type || 'N/A'}</td>
            <td ${isOverdue ? 'style="color: red; font-weight: bold;"' : ''}>${formatDate(task.dueDate)}</td>
            <td>${task.frequency || 'N/A'}</td>
            <td><span class="status-badge ${smartStatus.class}">${smartStatus.badge} ${smartStatus.text}</span></td>
            <td>${task.dayShift || 'N/A'}</td>
            <td>${task.nightShift || 'N/A'}</td>
            <td>${photoIndicator}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Render CM Tasks
function renderCMTasks(tasksToRender = cmTasks) {
    const tbody = document.getElementById('cmTasksTableBody');
    tbody.innerHTML = '';
    
    if (tasksToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No CM tasks found</td></tr>';
        return;
    }
    
    tasksToRender.forEach(task => {
        const row = document.createElement('tr');
        
        // Determine status color
        let statusClass = '';
        switch(task.status) {
            case 'Open':
                statusClass = 'status-overdue';
                break;
            case 'In Progress':
                statusClass = 'status-progress';
                break;
            case 'Pending Parts':
                statusClass = 'status-upcoming';
                break;
            case 'Completed':
                statusClass = 'status-completed';
                break;
            case 'Closed':
                statusClass = 'status-not-started';
                break;
        }
        
        // Determine priority color
        let priorityColor = '#999';
        let priorityIcon = '●';
        switch(task.priority) {
            case 'High':
                priorityColor = '#e74c3c';
                priorityIcon = '⚠️';
                break;
            case 'Medium':
                priorityColor = '#f39c12';
                priorityIcon = '🔸';
                break;
            case 'Low':
                priorityColor = '#3498db';
                priorityIcon = '⬇️';
                break;
        }
        
        row.innerHTML = `
            <td><strong>${task.workOrder || 'N/A'}</strong></td>
            <td>${task.description || 'No description'}</td>
            <td style="color: ${priorityColor}; font-weight: bold;">${priorityIcon} ${task.priority || 'N/A'}</td>
            <td>${task.location || 'N/A'}</td>
            <td>${task.reportedBy || 'N/A'}</td>
            <td>${formatDate(task.dateReported)}</td>
            <td><span class="status-badge ${statusClass}">${task.status || 'N/A'}</span></td>
            <td>${task.assignedTo || 'Unassigned'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editCMTask(${task.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteCMTask(${task.id})">Delete</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('📦 Rendered', tasksToRender.length, 'CM tasks');
}

// Edit Task
function editTask(taskId) {
    const task = ppmTasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentEditingTaskId = taskId;
    uploadedPhotos = task.photos ? [...task.photos] : [];
    
    document.getElementById('ppmShiftType').value = task.shiftType || '';
    document.getElementById('ppmDescription').value = task.description || '';
    document.getElementById('ppmType').value = task.type || '';
    
    if (isValidDate(task.dueDate)) {
        document.getElementById('ppmDueDate').value = task.dueDate;
    } else {
        document.getElementById('ppmDueDate').value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('ppmFrequency').value = task.frequency || '';
    document.getElementById('ppmStatus').value = task.status || 'Not Started';
    document.getElementById('ppmDayShift').value = task.dayShift || '';
    document.getElementById('ppmNightShift').value = task.nightShift || '';
    
    displayPhotoPreview();
    document.getElementById('addPPMModal').style.display = 'block';
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        ppmTasks = ppmTasks.filter(t => t.id !== taskId);
        saveData();
        updateDashboard();
        renderTasks();
        showNotification('Task deleted successfully!', 'success');
    }
}

// Edit CM Task
function editCMTask(taskId) {
    const task = cmTasks.find(t => t.id === taskId);
    if (!task) return;
    
    window.currentEditingCMTaskId = taskId;
    
    document.getElementById('cmWorkOrder').value = task.workOrder || '';
    document.getElementById('cmDescription').value = task.description || '';
    document.getElementById('cmReportedBy').value = task.reportedBy || '';
    
    if (isValidDate(task.dateReported)) {
        document.getElementById('cmDateReported').value = task.dateReported;
    } else {
        document.getElementById('cmDateReported').value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('cmStatus').value = task.status || 'Open';
    document.getElementById('cmAssignedTo').value = task.assignedTo || '';
    document.getElementById('cmPriority').value = task.priority || 'Medium';
    document.getElementById('cmLocation').value = task.location || '';
    
    document.getElementById('addCMModal').style.display = 'block';
}

// Delete CM Task
function deleteCMTask(taskId) {
    if (confirm('Are you sure you want to delete this CM task?')) {
        cmTasks = cmTasks.filter(t => t.id !== taskId);
        saveData();
        updateDashboard();
        renderCMTasks();
        showNotification('CM task deleted successfully!', 'success');
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#f44336'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format Date with Validation
function formatDate(dateString) {
    if (!isValidDate(dateString)) {
        console.error('Invalid date string:', dateString);
        return 'Invalid Date';
    }
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Invalid Date';
    }
}

// Filter Tasks
function filterTasks() {
    if (currentView === 'ppm') {
        const shiftFilter = document.getElementById('shiftFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        let filtered = ppmTasks;
        
        if (shiftFilter !== 'All') {
            filtered = filtered.filter(task => task.shiftType === shiftFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(task => 
                (task.description || '').toLowerCase().includes(searchTerm) ||
                (task.type || '').toLowerCase().includes(searchTerm) ||
                (task.status || '').toLowerCase().includes(searchTerm)
            );
        }
        
        renderTasks(filtered);
    } else {
        filterCMTasks();
    }
}

// Filter CM Tasks
function filterCMTasks() {
    const statusFilter = document.getElementById('cmStatusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = cmTasks;
    
    if (statusFilter !== 'All') {
        filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(task => 
            (task.workOrder || '').toLowerCase().includes(searchTerm) ||
            (task.description || '').toLowerCase().includes(searchTerm) ||
            (task.location || '').toLowerCase().includes(searchTerm) ||
            (task.reportedBy || '').toLowerCase().includes(searchTerm) ||
            (task.assignedTo || '').toLowerCase().includes(searchTerm)
        );
    }
    
    renderCMTasks(filtered);
}

// Switch between PPM and CM views
function switchView(view) {
    currentView = view;
    
    // Update button styles
    const ppmBtn = document.getElementById('ppmViewBtn');
    const cmBtn = document.getElementById('cmViewBtn');
    
    if (view === 'ppm') {
        ppmBtn.classList.add('active');
        cmBtn.classList.remove('active');
        
        // Show PPM container, hide CM container
        document.getElementById('ppmTasksContainer').style.display = 'block';
        document.getElementById('cmTasksContainer').style.display = 'none';
        
        // Show shift filter, hide CM status filter
        document.getElementById('shiftFilter').style.display = 'inline-block';
        document.getElementById('cmStatusFilter').style.display = 'none';
        
        // Render PPM tasks
        renderTasks();
    } else if (view === 'cm') {
        cmBtn.classList.add('active');
        ppmBtn.classList.remove('active');
        
        // Hide PPM container, show CM container
        document.getElementById('ppmTasksContainer').style.display = 'none';
        document.getElementById('cmTasksContainer').style.display = 'block';
        
        // Hide shift filter, show CM status filter
        document.getElementById('shiftFilter').style.display = 'none';
        document.getElementById('cmStatusFilter').style.display = 'inline-block';
        
        // Render CM tasks
        renderCMTasks();
    }
    
    console.log('📋 Switched to', view.toUpperCase(), 'view');
}

// Modal Functions
function openAddPPMModal() {
    currentEditingTaskId = null;
    uploadedPhotos = [];
    document.getElementById('addPPMModal').style.display = 'block';
    document.getElementById('ppmForm').reset();
    document.getElementById('ppmDueDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('photoInput').value = '';
}

function closeAddPPMModal() {
    document.getElementById('addPPMModal').style.display = 'none';
    document.getElementById('ppmForm').reset();
    currentEditingTaskId = null;
    uploadedPhotos = [];
}

function openAddCMModal() {
    document.getElementById('addCMModal').style.display = 'block';
    document.getElementById('cmForm').reset();
    // Set today's date as default for date reported
    document.getElementById('cmDateReported').value = new Date().toISOString().split('T')[0];
    // Set default status to Open
    document.getElementById('cmStatus').value = 'Open';
}

function closeAddCMModal() {
    document.getElementById('addCMModal').style.display = 'none';
    document.getElementById('cmForm').reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const ppmModal = document.getElementById('addPPMModal');
    const cmModal = document.getElementById('addCMModal');
    const photoModal = document.getElementById('photoViewModal');
    const reportModal = document.getElementById('reportModal');
    
    if (event.target === ppmModal) {
        closeAddPPMModal();
    }
    if (event.target === cmModal) {
        closeAddCMModal();
    }
    if (event.target === photoModal) {
        closePhotoViewModal();
    }
    if (event.target === reportModal) {
        closeReportModal();
    }
}

// Handle Photo Upload
function handlePhotoUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                uploadedPhotos.push({
                    name: file.name,
                    data: e.target.result,
                    timestamp: new Date().toISOString()
                });
                displayPhotoPreview();
            };
            
            reader.readAsDataURL(file);
        }
    }
}

// Display Photo Preview
function displayPhotoPreview() {
    const container = document.getElementById('photoPreview');
    container.innerHTML = uploadedPhotos.map((photo, index) => `
        <div class="photo-preview-item">
            <img src="${photo.data}" alt="${photo.name}">
            <button class="remove-photo-btn" onclick="removePhoto(${index})" type="button">×</button>
        </div>
    `).join('');
}

// Remove Photo
function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    displayPhotoPreview();
}

// View Photos Modal
function viewPhotos(taskId) {
    const task = ppmTasks.find(t => t.id === taskId);
    if (!task || !task.photos || task.photos.length === 0) return;
    
    const container = document.getElementById('photoViewContainer');
    container.innerHTML = task.photos.map(photo => `
        <div class="photo-view-item">
            <img src="${photo.data}" alt="${photo.name}">
            <p class="photo-info">
                <strong>${photo.name}</strong><br>
                <small>Uploaded: ${new Date(photo.timestamp).toLocaleString()}</small>
            </p>
        </div>
    `).join('');
    
    document.getElementById('photoViewModal').style.display = 'block';
}

function closePhotoViewModal() {
    document.getElementById('photoViewModal').style.display = 'none';
}

// Add PPM Task
function addPPMTask(event) {
    event.preventDefault();
    
    const status = document.getElementById('ppmStatus').value;
    const frequency = document.getElementById('ppmFrequency').value;
    const currentDueDate = document.getElementById('ppmDueDate').value;
    
    if (!isValidDate(currentDueDate)) {
        showNotification('Please enter a valid due date', 'error');
        return;
    }
    
    let finalDueDate = currentDueDate;
    let statusToSave = status;
    
    if (status === 'Completed' && frequency) {
        finalDueDate = calculateNextDueDate(currentDueDate, frequency);
        statusToSave = 'Not Started';
        showNotification(`Task completed! Next due date set to ${formatDate(finalDueDate)}`, 'success');
    }
    
    if (currentEditingTaskId) {
        const taskIndex = ppmTasks.findIndex(t => t.id === currentEditingTaskId);
        if (taskIndex !== -1) {
            ppmTasks[taskIndex] = {
                id: currentEditingTaskId,
                shiftType: document.getElementById('ppmShiftType').value,
                description: document.getElementById('ppmDescription').value,
                type: document.getElementById('ppmType').value,
                dueDate: finalDueDate,
                frequency: frequency,
                status: statusToSave,
                dayShift: document.getElementById('ppmDayShift').value,
                nightShift: document.getElementById('ppmNightShift').value,
                photos: uploadedPhotos,
                lastCompleted: status === 'Completed' ? new Date().toISOString() : ppmTasks[taskIndex].lastCompleted
            };
            showNotification('Task updated successfully!', 'success');
        }
    } else {
        const newTask = {
            id: Date.now(),
            shiftType: document.getElementById('ppmShiftType').value,
            description: document.getElementById('ppmDescription').value,
            type: document.getElementById('ppmType').value,
            dueDate: finalDueDate,
            frequency: frequency,
            status: statusToSave,
            dayShift: document.getElementById('ppmDayShift').value,
            nightShift: document.getElementById('ppmNightShift').value,
            photos: uploadedPhotos,
            lastCompleted: status === 'Completed' ? new Date().toISOString() : null
        };
        
        ppmTasks.unshift(newTask);
        showNotification('PPM task added successfully!', 'success');
    }
    
    saveData();
    updateDashboard();
    renderTasks();
    closeAddPPMModal();
}

// Add CM Task
function addCMTask(event) {
    event.preventDefault();
    
    const dateReported = document.getElementById('cmDateReported').value;
    
    if (!isValidDate(dateReported)) {
        showNotification('Please enter a valid date', 'error');
        return;
    }
    
    if (window.currentEditingCMTaskId) {
        // Editing existing CM task
        const taskIndex = cmTasks.findIndex(t => t.id === window.currentEditingCMTaskId);
        if (taskIndex !== -1) {
            cmTasks[taskIndex] = {
                id: window.currentEditingCMTaskId,
                workOrder: document.getElementById('cmWorkOrder').value,
                description: document.getElementById('cmDescription').value,
                reportedBy: document.getElementById('cmReportedBy').value,
                dateReported: dateReported,
                status: document.getElementById('cmStatus').value,
                assignedTo: document.getElementById('cmAssignedTo').value,
                priority: document.getElementById('cmPriority').value,
                location: document.getElementById('cmLocation').value,
                createdDate: cmTasks[taskIndex].createdDate,
                lastModified: new Date().toISOString()
            };
            showNotification('CM task updated successfully!', 'success');
        }
        window.currentEditingCMTaskId = null;
    } else {
        // Adding new CM task
        const cmTask = {
            id: Date.now(),
            workOrder: document.getElementById('cmWorkOrder').value,
            description: document.getElementById('cmDescription').value,
            reportedBy: document.getElementById('cmReportedBy').value,
            dateReported: dateReported,
            status: document.getElementById('cmStatus').value,
            assignedTo: document.getElementById('cmAssignedTo').value,
            priority: document.getElementById('cmPriority').value,
            location: document.getElementById('cmLocation').value,
            createdDate: new Date().toISOString()
        };
        
        cmTasks.unshift(cmTask);
        showNotification('CM task added successfully! Work Order: ' + cmTask.workOrder, 'success');
    }
    
    saveData();
    updateDashboard();
    
    // Auto-switch to CM view to show the newly added/edited task
    switchView('cm');
    
    closeAddCMModal();
    
    // Reset form
    document.getElementById('cmForm').reset();
}

// Show History Function
function showHistory() {
    const completedTasks = ppmTasks.filter(t => t.lastCompleted);
    
    if (completedTasks.length === 0) {
        showNotification('No completed tasks in history', 'info');
        return;
    }
    
    completedTasks.sort((a, b) => new Date(b.lastCompleted) - new Date(a.lastCompleted));
    
    let historyHTML = '<h3>Task History (Last 10 Completions)</h3><ul style="list-style: none; padding: 0;">';
    completedTasks.slice(0, 10).forEach(task => {
        const completedDate = new Date(task.lastCompleted).toLocaleString();
        historyHTML += `<li style="padding: 10px; border-bottom: 1px solid #ddd;">
            <strong>${task.description}</strong><br>
            <small>Completed: ${completedDate} | Next Due: ${formatDate(task.dueDate)}</small>
        </li>`;
    });
    historyHTML += '</ul>';
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; max-height: 80%; overflow-y: auto;">
            ${historyHTML}
            <button onclick="this.closest('div').parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ✅ FIXED: Open Report Modal with better defaults
function generateReport() {
    document.getElementById('reportModal').style.display = 'block';
    
    // ✨ IMPROVED: Set intelligent default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Default to current month
    document.getElementById('reportDateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('reportDateTo').value = lastDayOfMonth.toISOString().split('T')[0];
    
    // Show task count for selected range
    updateReportPreview();
}

// ✅ NEW: Update Report Preview
function updateReportPreview() {
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    
    if (isValidDate(dateFrom) && isValidDate(dateTo)) {
        const filteredTasks = ppmTasks.filter(task => {
            return task.dueDate >= dateFrom && task.dueDate <= dateTo;
        });
        
        const previewText = `${filteredTasks.length} task(s) found in selected range`;
        const existingPreview = document.querySelector('.report-preview');
        if (existingPreview) {
            existingPreview.textContent = previewText;
        }
    }
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// ✅ FIXED: Generate PDF Report (removed premature notification)
async function generatePDFReport() {
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    
    if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
        showNotification('Please enter valid dates', 'error');
        return;
    }
    
    if (dateFrom > dateTo) {
        showNotification('Start date must be before end date', 'error');
        return;
    }
    
    // Filter tasks by date range
    const filteredTasks = ppmTasks.filter(task => {
        return task.dueDate >= dateFrom && task.dueDate <= dateTo;
    });
    
    // ✅ FIXED: Only show notification if really no tasks, not before PDF generation
    if (filteredTasks.length === 0) {
        showNotification(`No tasks found between ${formatDate(dateFrom)} and ${formatDate(dateTo)}. Try a wider date range.`, 'info');
        return;
    }
    
    // Show generating message
    showNotification(`Generating PDF for ${filteredTasks.length} task(s)...`, 'info');
    
    // Generate PDF using jsPDF
    try {
        await generatePDFDocument(filteredTasks, dateFrom, dateTo);
        showNotification('PDF report generated successfully!', 'success');
        closeReportModal();
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF report: ' + error.message, 'error');
    }
}

// Generate PDF Document
async function generatePDFDocument(tasks, dateFrom, dateTo) {
    // Load jsPDF library if not loaded
    if (typeof window.jspdf === 'undefined') {
        await loadJsPDF();
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AGL MCT AIRFIELD', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(16);
    doc.text('MAINTENANCE TRACKER REPORT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Report Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${formatDate(dateFrom)} to ${formatDate(dateTo)}`, 14, yPos);
    yPos += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Tasks: ${tasks.length}`, 14, yPos);
    yPos += 10;
    
    // Summary Statistics
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;
    const overdue = tasks.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return t.dueDate < today && t.status !== 'Completed';
    }).length;
    
    doc.text(`✓ Completed: ${completed}`, 14, yPos);
    yPos += 6;
    doc.text(`⏳ In Progress: ${inProgress}`, 14, yPos);
    yPos += 6;
    doc.text(`○ Not Started: ${notStarted}`, 14, yPos);
    yPos += 6;
    doc.text(`⚠ Overdue: ${overdue}`, 14, yPos);
    yPos += 6;
    
    // Count tasks with photos
    const tasksWithPhotos = tasks.filter(t => t.photos && t.photos.length > 0).length;
    doc.text(`📷 Tasks with Photos: ${tasksWithPhotos}`, 14, yPos);
    yPos += 6;
    
    // Count recently completed tasks (last 7 days)
    const recentlyCompleted = tasks.filter(t => {
        if (!t.lastCompleted) return false;
        const daysSince = Math.floor((new Date() - new Date(t.lastCompleted)) / (1000 * 60 * 60 * 24));
        return daysSince <= 7;
    }).length;
    doc.text(`✅ Recently Completed (Last 7 days): ${recentlyCompleted}`, 14, yPos);
    yPos += 12;
    
    // Recent Updates Section
    if (recentlyCompleted > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RECENT UPDATES', 14, yPos);
        yPos += 8;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        const recentTasks = tasks
            .filter(t => t.lastCompleted)
            .sort((a, b) => new Date(b.lastCompleted) - new Date(a.lastCompleted))
            .slice(0, 5); // Show top 5 most recent updates
        
        for (const task of recentTasks) {
            const daysSince = Math.floor((new Date() - new Date(task.lastCompleted)) / (1000 * 60 * 60 * 24));
            const timeAgo = daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`;
            
            const description = task.description || 'No description';
            const truncatedDesc = description.length > 45 ? description.substring(0, 42) + '...' : description;
            
            doc.text(`• ${timeAgo}: ${truncatedDesc}`, 14, yPos);
            yPos += 5;
        }
        
        yPos += 7;
    }
    
    // Task Details Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TASK DETAILS', 14, yPos);
    yPos += 8;
    
    // Process tasks one by one with detailed information
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        
        // Check if we need a new page (need more space for detailed entries)
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }
        
        // Get smart status for color
        const smartStatus = getSmartStatus(task);
        
        // Task Number Header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`TASK ${i + 1}`, 14, yPos);
        yPos += 6;
        
        // Draw box around task details
        const boxStartY = yPos - 2;
        const boxHeight = 30; // Adjust based on content
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(14, boxStartY, pageWidth - 28, boxHeight);
        
        // Task Information - Left Column
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Description:', 16, yPos);
        doc.setFont('helvetica', 'normal');
        const description = task.description || 'No description';
        const truncatedDesc = description.length > 55 ? description.substring(0, 52) + '...' : description;
        doc.text(truncatedDesc, 42, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Shift:', 16, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(task.shiftType || 'N/A', 42, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Type:', 70, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(task.type || 'N/A', 85, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Frequency:', 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(task.frequency || 'N/A', 135, yPos);
        yPos += 5;
        
        // Task Status with Color
        doc.setFont('helvetica', 'bold');
        doc.text('Status:', 16, yPos);
        
        // Set color based on status
        switch(smartStatus.class) {
            case 'status-overdue':
                doc.setTextColor(220, 53, 69); // Red
                break;
            case 'status-due-today':
                doc.setTextColor(255, 153, 0); // Orange
                break;
            case 'status-completed':
                doc.setTextColor(40, 167, 69); // Green
                break;
            case 'status-in-progress':
                doc.setTextColor(0, 123, 255); // Blue
                break;
            case 'status-upcoming':
                doc.setTextColor(255, 193, 7); // Yellow
                break;
            default:
                doc.setTextColor(108, 117, 125); // Gray
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${smartStatus.badge} ${smartStatus.text}`, 42, yPos);
        doc.setTextColor(0, 0, 0); // Reset to black
        
        doc.setFont('helvetica', 'bold');
        doc.text('Due Date:', 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(task.dueDate), 135, yPos);
        yPos += 5;
        
        // Update History Section
        doc.setFont('helvetica', 'bold');
        doc.text('Assignments:', 16, yPos);
        doc.setFont('helvetica', 'normal');
        const dayShift = task.dayShift || 'Not assigned';
        const nightShift = task.nightShift || 'Not assigned';
        doc.text(`Day: ${dayShift}`, 42, yPos);
        doc.text(`Night: ${nightShift}`, 110, yPos);
        yPos += 5;
        
        // Photo Evidence
        doc.setFont('helvetica', 'bold');
        doc.text('Photos:', 16, yPos);
        doc.setFont('helvetica', 'normal');
        const photoCount = task.photos ? task.photos.length : 0;
        doc.text(`${photoCount} photo(s) attached`, 42, yPos);
        
        // Last Completed
        if (task.lastCompleted) {
            doc.setFont('helvetica', 'bold');
            doc.text('Last Completed:', 110, yPos);
            doc.setFont('helvetica', 'normal');
            const lastCompleted = new Date(task.lastCompleted).toLocaleDateString();
            doc.text(lastCompleted, 145, yPos);
        }
        yPos += 5;
        
        // Additional Update Info
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        let updateInfo = '';
        
        if (task.lastCompleted) {
            const daysSince = Math.floor((new Date() - new Date(task.lastCompleted)) / (1000 * 60 * 60 * 24));
            const timeAgo = daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`;
            updateInfo += `Last update: Completed ${timeAgo}`;
        }
        
        if (photoCount > 0) {
            if (updateInfo) updateInfo += ' | ';
            const latestPhoto = task.photos && task.photos.length > 0 ? task.photos[task.photos.length - 1] : null;
            if (latestPhoto && latestPhoto.timestamp) {
                const photoDays = Math.floor((new Date() - new Date(latestPhoto.timestamp)) / (1000 * 60 * 60 * 24));
                const photoTimeAgo = photoDays === 0 ? 'today' : photoDays === 1 ? 'yesterday' : `${photoDays} days ago`;
                updateInfo += `Latest photo uploaded ${photoTimeAgo}`;
            } else {
                updateInfo += `${photoCount} photo(s) attached`;
            }
        }
        
        if (!updateInfo) {
            updateInfo = 'No recent updates';
        }
        
        doc.text(updateInfo, 16, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        
        yPos += 8; // Space before next task
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('AGL MCT Airfield - Confidential', 14, pageHeight - 10);
    }
    
    // Save PDF
    const fileName = `AGL_Maintenance_Report_${dateFrom}_to_${dateTo}.pdf`;
    doc.save(fileName);
}

// Load jsPDF library dynamically
function loadJsPDF() {
    return new Promise((resolve, reject) => {
        if (typeof window.jspdf !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load jsPDF'));
        document.head.appendChild(script);
    });
}

// Export to CSV
function exportToCSV() {
    if (ppmTasks.length === 0) {
        showNotification('No data to export', 'info');
        return;
    }
    
    const headers = ['Shift Type', 'Description', 'Type', 'Due Date', 'Frequency', 'Status', 'Day Shift', 'Night Shift', 'Photo Count', 'Last Completed'];
    const rows = ppmTasks.map(task => [
        task.shiftType || 'N/A',
        task.description || 'No description',
        task.type || 'N/A',
        task.dueDate || 'N/A',
        task.frequency || 'N/A',
        task.status || 'N/A',
        task.dayShift || 'N/A',
        task.nightShift || 'N/A',
        task.photos ? task.photos.length : 0,
        task.lastCompleted ? new Date(task.lastCompleted).toLocaleString() : 'N/A'
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AGL_Maintenance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('CSV report exported successfully!', 'success');
}

// Clean Invalid Data Function
function cleanInvalidData() {
    const originalLength = ppmTasks.length;
    ppmTasks = ppmTasks.filter(task => isValidDate(task.dueDate));
    
    if (ppmTasks.length < originalLength) {
        saveData();
        updateDashboard();
        renderTasks();
        showNotification(`Removed ${originalLength - ppmTasks.length} task(s) with invalid dates`, 'info');
    } else {
        showNotification('No invalid tasks found', 'success');
    }
}
