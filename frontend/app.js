const API_URL = window.location.origin;
let currentFilter = 'all';

// Check authentication
// function checkAuth() {
//     const user = sessionStorage.getItem('user');
//     // console.log('checkAuth: user =', !!user); // Debug log

//     if (!user) {
//         window.location.href = '/login';
//         return false;
//     }
//     return true;
// }

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return false;
        }

        const data = await response.json();
        sessionStorage.setItem('user', JSON.stringify(data.user));
        return true;

    } catch (err) {
        window.location.href = '/login';
        return false;
    }
}


// Get auth headers
function getAuthHeaders() {
    // Session-based auth: cookies are sent automatically with credentials
    return {
        'Content-Type': 'application/json'
    };
}

// Handle API errors
async function handleResponse(response) {
    if (response.status === 401) {
        sessionStorage.clear();
        window.location.href = '/login';
        return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    
    return data;
}

// Load user info
async function loadUser() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            document.getElementById('user-name').textContent = user.username;
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/todos/stats`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        
        const data = await handleResponse(response);
        if (data) {
            document.getElementById('stat-total').textContent = data.stats.total;
            document.getElementById('stat-completed').textContent = data.stats.completed;
            document.getElementById('stat-pending').textContent = data.stats.pending;
            document.getElementById('stat-high').textContent = data.stats.high_priority;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load todos
async function loadTodos(filter = 'all') {
    try {
        let url = `${API_URL}/api/todos`;
        
        if (filter === 'completed') {
            url += '?completed=true';
        } else if (filter === 'pending') {
            url += '?completed=false';
        }
        
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        
        const data = await handleResponse(response);
        if (data) {
            displayTodos(data.todos);
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showNotification('Failed to load tasks', 'error');
    }
}

// Display todos
function displayTodos(todos) {
    const container = document.getElementById('todos-container');
    const emptyState = document.getElementById('empty-state');
    
    if (todos.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    container.innerHTML = todos.map(todo => {
        const priorityColors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        
        const dueDate = todo.due_date ? new Date(todo.due_date).toLocaleString() : 'No due date';
        
        return `
            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition ${todo.completed ? 'opacity-75' : ''}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4 flex-1">
                        <input 
                            type="checkbox" 
                            ${todo.completed ? 'checked' : ''}
                            onchange="toggleTodo(${todo.id}, ${!todo.completed})"
                            class="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                        >
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 ${todo.completed ? 'line-through' : ''}">
                                ${escapeHtml(todo.title)}
                            </h3>
                            ${todo.description ? `
                                <p class="text-gray-600 mt-1">${escapeHtml(todo.description)}</p>
                            ` : ''}
                            <div class="flex items-center space-x-4 mt-3">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[todo.priority]}">
                                    ${todo.priority.toUpperCase()}
                                </span>
                                <span class="text-sm text-gray-500">
                                    <i class="far fa-calendar mr-1"></i>${dueDate}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button 
                            onclick="openEditModal(${todo.id})"
                            class="text-blue-600 hover:text-blue-800 p-2"
                            title="Edit"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            onclick="deleteTodo(${todo.id})"
                            class="text-red-600 hover:text-red-800 p-2"
                            title="Delete"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add todo
document.getElementById('add-todo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-description').value;
    const priority = document.getElementById('todo-priority').value;
    const dueDate = document.getElementById('todo-due-date').value;
    
    try {
        const response = await fetch(`${API_URL}/api/todos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                title,
                description,
                priority,
                due_date: dueDate || null
            })
        });
        
        const data = await handleResponse(response);
        if (data) {
            showNotification('Task added successfully!', 'success');
            e.target.reset();
            loadTodos(currentFilter);
            loadStats();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to add task', 'error');
    }
});

// Toggle todo completion
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ completed })
        });
        
        const data = await handleResponse(response);
        if (data) {
            loadTodos(currentFilter);
            loadStats();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to update task', 'error');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        
        const data = await handleResponse(response);
        if (data) {
            showNotification('Task deleted successfully!', 'success');
            loadTodos(currentFilter);
            loadStats();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to delete task', 'error');
    }
}

// Open edit modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/api/todos/${id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        
        const data = await handleResponse(response);
        if (data) {
            const todo = data.todo;
            document.getElementById('edit-todo-id').value = todo.id;
            document.getElementById('edit-todo-title').value = todo.title;
            document.getElementById('edit-todo-description').value = todo.description || '';
            document.getElementById('edit-todo-priority').value = todo.priority;
            
            if (todo.due_date) {
                const date = new Date(todo.due_date);
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                document.getElementById('edit-todo-due-date').value = localDate;
            } else {
                document.getElementById('edit-todo-due-date').value = '';
            }
            
            document.getElementById('edit-modal').classList.remove('hidden');
        }
    } catch (error) {
        showNotification(error.message || 'Failed to load task', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

document.getElementById('close-modal').addEventListener('click', closeEditModal);
document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

// Edit todo
document.getElementById('edit-todo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-todo-id').value;
    const title = document.getElementById('edit-todo-title').value;
    const description = document.getElementById('edit-todo-description').value;
    const priority = document.getElementById('edit-todo-priority').value;
    const dueDate = document.getElementById('edit-todo-due-date').value;
    
    try {
        const response = await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                title,
                description,
                priority,
                due_date: dueDate || null
            })
        });
        
        const data = await handleResponse(response);
        if (data) {
            showNotification('Task updated successfully!', 'success');
            closeEditModal();
            loadTodos(currentFilter);
            loadStats();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to update task', 'error');
    }
});

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => {
            t.classList.remove('active', 'border-b-2', 'border-indigo-600', 'text-indigo-600');
        });
        tab.classList.add('active', 'border-b-2', 'border-indigo-600', 'text-indigo-600');
        
        currentFilter = tab.dataset.filter;
        loadTodos(currentFilter);
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        sessionStorage.clear();
        window.location.href = '/login';
    }
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
    const isAuth = await checkAuth();
    if (isAuth) {
            loadUser();
            loadStats();
            loadTodos();
            
            // Set initial filter tab state
            document.querySelector('.filter-tab[data-filter="all"]').classList.add('border-b-2', 'border-indigo-600', 'text-indigo-600');
        }
});