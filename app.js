// app.js - Router, authentication state, API calls, and event bindings for Innovexa Catalyst

// Global Application State
const state = {
    user: null,
    activeChatInterval: null
};

// Initial state load from localStorage
function initAuthState() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            state.user = JSON.parse(storedUser);
        } catch (e) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }
}

// Custom Toast Notification System
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'info';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="h-5 w-5 flex-shrink-0"></i>
        <div class="text-xs font-semibold">${message}</div>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 350);
    }, 3500);
}

// Custom Confirm Modal System
function showConfirm(message, onConfirm) {
    const backdrop = document.createElement('div');
    backdrop.className = 'custom-modal-backdrop';
    
    backdrop.innerHTML = `
        <div class="glass-panel-heavy p-6 rounded-2xl w-full max-w-sm custom-modal animate-fade-in mx-4 border border-slate-700/80">
            <h3 class="font-bold text-white text-base mb-3">Please Confirm</h3>
            <p class="text-xs text-slate-400 mb-6 leading-relaxed">${message}</p>
            <div class="flex justify-end gap-3">
                <button id="confirm-cancel-btn" class="bg-dark-800 border border-slate-700 hover:bg-dark-700 text-slate-300 font-semibold px-4 py-2 rounded-lg text-xs transition">
                    Cancel
                </button>
                <button id="confirm-ok-btn" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow-md shadow-brand-500/10">
                    Confirm
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(backdrop);
    
    setTimeout(() => {
        backdrop.classList.add('show');
    }, 10);
    
    const cleanup = () => {
        backdrop.classList.remove('show');
        setTimeout(() => {
            if (backdrop.parentNode) {
                document.body.removeChild(backdrop);
            }
        }, 250);
    };
    
    backdrop.querySelector('#confirm-cancel-btn').addEventListener('click', () => {
        cleanup();
    });
    
    backdrop.querySelector('#confirm-ok-btn').addEventListener('click', () => {
        cleanup();
        onConfirm();
    });
}

// REST API Request Wrapper
async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `api/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, config);
        
        // Handle unauthorized token expiration
        if (response.status === 401 && endpoint !== 'auth/login' && endpoint !== 'auth/register') {
            const refreshed = await tryTokenRefresh();
            if (refreshed) {
                // Retry request with fresh access token
                headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
                const retryResponse = await fetch(url, config);
                return await retryResponse.json();
            } else {
                // Refresh failed: wipe session and redirect
                logout();
                window.location.hash = '#/login';
                return { success: false, message: 'Session expired. Please log in again.' };
            }
        }
        
        return await response.json();
    } catch (e) {
        console.error('API Error:', e);
        return { success: false, message: 'Unable to connect to service. Network error.' };
    }
}

// Token Refresh Utility
async function tryTokenRefresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    try {
        const response = await fetch('api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                return true;
            }
        }
    } catch (e) {
        console.error('Token refresh request failed:', e);
    }
    return false;
}

// Session Destruction
function logout() {
    state.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (state.activeChatInterval) {
        clearInterval(state.activeChatInterval);
        state.activeChatInterval = null;
    }
    router();
}

// Helper to inject HTML layout and render active route
function renderView(viewContent) {
    const appEl = document.getElementById('app');
    const headerHtml = Views.header(state.user);
    const footerHtml = Views.footer();
    
    appEl.innerHTML = `
        ${headerHtml}
        <div id="main-content-mount" class="flex-grow flex flex-col">${viewContent}</div>
        ${footerHtml}
    `;
    
    // Auto-create Lucide icons for all rendered nodes
    lucide.createIcons();
    
    // Bind universal UI listeners
    bindGlobalListeners();
}

// Helper to render error states
function renderError(title, message) {
    renderView(Views.error(title, message));
}

// Universal DOM Listeners
function bindGlobalListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Mobile navigation menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// ==========================================
// ROUTE IMPLEMENTATIONS
// ==========================================

// 1. Landing route
async function routeLanding() {
    const res = await apiCall('projects?status=open');
    const projects = res.success ? res.projects : [];
    renderView(Views.landing(projects));
}

// 2. Login route
function routeLogin() {
    if (state.user) {
        window.location.hash = '#/dashboard';
        return;
    }
    renderView(Views.login());
    
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const res = await apiCall('auth/login', 'POST', { email, password });
        if (res.success) {
            localStorage.setItem('accessToken', res.accessToken);
            localStorage.setItem('refreshToken', res.refreshToken);
            localStorage.setItem('user', JSON.stringify(res.user));
            state.user = res.user;
            window.location.hash = '#/dashboard';
        } else {
            renderView(Views.login(res.message));
        }
    });
}

// 3. Register route
function routeRegister() {
    if (state.user) {
        window.location.hash = '#/dashboard';
        return;
    }
    renderView(Views.register());
    
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = form.elements['role'].value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const res = await apiCall('auth/register', 'POST', { name, email, password, role });
        if (res.success) {
            localStorage.setItem('accessToken', res.accessToken);
            localStorage.setItem('refreshToken', res.refreshToken);
            localStorage.setItem('user', JSON.stringify(res.user));
            state.user = res.user;
            window.location.hash = '#/dashboard';
        } else {
            renderView(Views.register(res.message));
        }
    });
}

// 4. Projects Listing route
let currentFilters = { search: '', category: '', minBudget: '', maxBudget: '' };
async function routeProjects() {
    // Construct query parameters
    const params = new URLSearchParams();
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.minBudget) params.append('minBudget', currentFilters.minBudget);
    if (currentFilters.maxBudget) params.append('maxBudget', currentFilters.maxBudget);
    params.append('status', 'open');
    
    const res = await apiCall(`projects?${params.toString()}`);
    const list = res.success ? res.projects : [];
    
    renderView(Views.projects(list, currentFilters));
    
    // Bind filters changes
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const minInput = document.getElementById('filter-min-budget');
    const maxInput = document.getElementById('filter-max-budget');
    const clearBtn = document.getElementById('clear-filters');
    
    const triggerSearch = () => {
        currentFilters.search = searchInput.value;
        currentFilters.category = categorySelect.value;
        currentFilters.minBudget = minInput.value;
        currentFilters.maxBudget = maxInput.value;
        routeProjects();
    };
    
    // Debounce/Timeout filters or trigger on input-change
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerSearch(); });
    categorySelect.addEventListener('change', triggerSearch);
    minInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerSearch(); });
    maxInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerSearch(); });
    
    clearBtn.addEventListener('click', () => {
        currentFilters = { search: '', category: '', minBudget: '', maxBudget: '' };
        routeProjects();
    });
}

// 5. Project Details route
async function routeProjectDetails(id) {
    const projectRes = await apiCall(`projects/${id}`);
    if (!projectRes.success) {
        renderError('Project Not Found', projectRes.message);
        return;
    }
    
    const project = projectRes.project;
    
    // Fetch bids
    const bidsRes = await apiCall(`projects/${id}/bids`);
    const bids = bidsRes.success ? bidsRes.bids : [];
    
    // Identify my bid if freelancer
    const myBid = (state.user && state.user.role === 'freelancer') 
        ? bids.find(b => b.freelancer_id === state.user.id) || null
        : null;
        
    renderView(Views.projectDetails(project, state.user, bids, myBid));
    
    // Freelancer: Bid placing listener
    const bidForm = document.getElementById('bid-form');
    if (bidForm) {
        bidForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('bid-amount').value);
            const deliveryDays = parseInt(document.getElementById('bid-days').value);
            const coverLetter = document.getElementById('bid-cover').value;
            
            const bidRes = await apiCall(`projects/${id}/bids`, 'POST', { amount, deliveryDays, coverLetter });
            if (bidRes.success) {
                showToast(bidRes.message, 'success');
                routeProjectDetails(id);
            } else {
                showToast(bidRes.message, 'error');
            }
        });
    }
    
    // Client: Award project listener
    const awardBtns = document.querySelectorAll('.award-contract-btn');
    awardBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const bidId = btn.getAttribute('data-bid-id');
            showConfirm('Are you sure you want to award this contract to this freelancer? This will fund the escrow with the bid amount.', async () => {
                const awardRes = await apiCall(`bids/${bidId}/status`, 'PUT', { status: 'accepted' });
                if (awardRes.success) {
                    showToast(awardRes.message, 'success');
                    window.location.hash = '#/contracts';
                } else {
                    showToast(awardRes.message, 'error');
                }
            });
        });
    });
    
    // Client: Delete listing
    const deleteBtn = document.getElementById('delete-project-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            showConfirm('Are you sure you want to delete this project listing permanently?', async () => {
                const delRes = await apiCall(`projects/${id}`, 'DELETE');
                if (delRes.success) {
                    showToast(delRes.message, 'success');
                    window.location.hash = '#/dashboard';
                } else {
                    showToast(delRes.message, 'error');
                }
            });
        });
    }
}

// 6. Post Project route
function routePostProject() {
    if (!state.user || state.user.role !== 'client') {
        window.location.hash = '#/login';
        return;
    }
    renderView(Views.postProject());
    
    const form = document.getElementById('post-project-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('project-title').value;
        const category = document.getElementById('project-category').value;
        const skills = document.getElementById('project-skills').value;
        const description = document.getElementById('project-description').value;
        const budget = parseFloat(document.getElementById('project-budget').value);
        const deadline = document.getElementById('project-deadline').value;
        
        const res = await apiCall('projects', 'POST', { title, category, skills, description, budget, deadline });
        if (res.success) {
            showToast(res.message, 'success');
            window.location.hash = '#/dashboard';
        } else {
            showToast(res.message, 'error');
        }
    });
}

// 7. Dashboard route
async function routeDashboard() {
    if (!state.user) {
        window.location.hash = '#/login';
        return;
    }
    
    let dashboardData = {};
    
    if (state.user.role === 'client') {
        // Fetch client contracts and projects
        const cRes = await apiCall('contracts');
        const pRes = await apiCall('projects?status=all');
        const ledgerRes = await apiCall('payments/history');
        
        const contracts = cRes.success ? cRes.contracts : [];
        const myProjects = pRes.success ? pRes.projects.filter(p => p.client_id === state.user.id) : [];
        
        // Sum total spent on completed contracts
        let totalSpent = 0;
        if (ledgerRes.success) {
            ledgerRes.transactions.forEach(t => {
                if (t.type === 'escrow_release') {
                    totalSpent += Math.abs(t.amount);
                }
            });
        }
        
        dashboardData = { contracts, myProjects, totalSpent };
    } else if (state.user.role === 'freelancer') {
        // Fetch freelancer contracts
        const cRes = await apiCall('contracts');
        
        // Fetch bids list using my-bids API
        const myBidsRes = await apiCall('my-bids');
        
        // In the PHP backend, get my transactions
        const ledgerRes = await apiCall('payments/history');
        let totalEarnings = 0;
        if (ledgerRes.success) {
            ledgerRes.transactions.forEach(t => {
                if (t.type === 'deposit' && t.contract_id !== null) {
                    totalEarnings += t.amount;
                }
            });
        }
        
        dashboardData = { 
            contracts: cRes.success ? cRes.contracts : [], 
            bids: myBidsRes.success ? myBidsRes.bids : [], 
            totalEarnings 
        };
    } else if (state.user.role === 'admin') {
        // Fetch admin analytics and users list
        const aRes = await apiCall('admin/analytics');
        const uRes = await apiCall('admin/users');
        
        dashboardData = {
            analytics: aRes.success ? aRes.analytics : null,
            usersList: uRes.success ? uRes.users : []
        };
    }
    
    renderView(Views.dashboard(state.user, dashboardData));
    
    // Bind Add Funds Action (Client Only)
    const addFundsBtn = document.getElementById('add-funds-btn');
    if (addFundsBtn) {
        addFundsBtn.addEventListener('click', showAddFundsModal);
    }

    // Bind Withdraw Action (Freelancer Only)
    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', showWithdrawModal);
    }
    
    // Bind admin actions (Verify, Ban/Unban)
    const adminBtns = document.querySelectorAll('.admin-action-btn');
    adminBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.getAttribute('data-user-id');
            const action = btn.getAttribute('data-action');
            const stateVal = parseInt(btn.getAttribute('data-state'));
            
            let res;
            if (action === 'verify') {
                res = await apiCall(`admin/users/${userId}/verify`, 'PUT', { verify: stateVal });
            } else {
                res = await apiCall(`admin/users/${userId}/ban`, 'PUT', { ban: stateVal });
            }
            
            if (res.success) {
                showToast(res.message, 'success');
                routeDashboard();
            } else {
                showToast(res.message, 'error');
            }
        });
    });
}

// 8. Contracts & Ledger Route
async function routeContracts() {
    if (!state.user) {
        window.location.hash = '#/login';
        return;
    }
    
    const cRes = await apiCall('contracts');
    const lRes = await apiCall('payments/history');
    
    const contracts = cRes.success ? cRes.contracts : [];
    const transactions = lRes.success ? lRes.transactions : [];
    
    renderView(Views.contracts(contracts, transactions, state.user));
    
    // Bind submit deliverable (Freelancer)
    const submitWorkBtns = document.querySelectorAll('.submit-deliverable-btn');
    submitWorkBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const contractId = btn.getAttribute('data-contract-id');
            const milestoneId = btn.getAttribute('data-milestone-id');
            showSubmitWorkModal(contractId, milestoneId);
        });
    });
    
    // Bind approve milestone (Client)
    const approveBtns = document.querySelectorAll('.approve-milestone-btn');
    approveBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const contractId = btn.getAttribute('data-contract-id');
            const milestoneId = btn.getAttribute('data-milestone-id');
            const milestoneAmount = btn.parentNode.previousElementSibling.children[1].innerText;
            
            showConfirm(`Are you sure you want to approve this milestone and release ${milestoneAmount} from escrow to the freelancer?`, async () => {
                const res = await apiCall(`contracts/${contractId}/approve`, 'PUT', { milestoneId });
                if (res.success) {
                    showToast(res.message, 'success');
                    
                    // Fetch fresh profile state to update user balance in state
                    const profileRes = await apiCall('auth/me');
                    if (profileRes.success) {
                        state.user = profileRes.user;
                        localStorage.setItem('user', JSON.stringify(profileRes.user));
                    }
                    
                    routeContracts();
                } else {
                    showToast(res.message, 'error');
                }
            });
        });
    });
}

// 9. Chat Messaging Route
async function routeChat(activeUserId = null) {
    if (!state.user) {
        window.location.hash = '#/login';
        return;
    }
    
    // Fetch conversations list
    const convRes = await apiCall('conversations');
    const conversations = convRes.success ? convRes.conversations : [];
    
    let activeChatUser = null;
    let messages = [];
    
    if (activeUserId) {
        // Fetch active partner info (since endpoint details aren't separate, we check local conversations or query mock user reviews endpoint info)
        activeChatUser = conversations.find(c => c.id == activeUserId);
        
        if (!activeChatUser) {
            // Fetch users list or fallback detail mockup
            const usersRes = await apiCall('admin/users'); // Admins can read this, otherwise mock matching
            if (usersRes.success) {
                activeChatUser = usersRes.users.find(u => u.id == activeUserId);
            }
            if (!activeChatUser) {
                activeChatUser = { id: activeUserId, name: 'Marketplace Partner', email: '', role: 'Partner' };
            }
        }
        
        // Fetch message history
        const msgRes = await apiCall(`conversations/${activeUserId}/messages`);
        messages = msgRes.success ? msgRes.messages : [];
    }
    
    renderView(Views.chat(conversations, activeChatUser, messages, state.user));
    
    // Scroll messages log to bottom
    const logEl = document.getElementById('messages-log');
    if (logEl) {
        logEl.scrollTop = logEl.scrollHeight;
    }
    
    // Set up chat text submit
    const chatForm = document.getElementById('chat-input-form');
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageTextEl = document.getElementById('chat-message-text');
            const messageText = messageTextEl.value.trim();
            if (!messageText) return;
            
            const sendRes = await apiCall(`conversations/${activeUserId}/messages`, 'POST', { message_text: messageText });
            if (sendRes.success) {
                messageTextEl.value = '';
                // Instantly re-route to reload list & chat pane
                routeChat(activeUserId);
            }
        });
    }
    
    // Start Chat Polling (Refresh logs every 3 seconds)
    if (activeUserId) {
        state.activeChatInterval = setInterval(async () => {
            const pollRes = await apiCall(`conversations/${activeUserId}/messages`);
            if (pollRes.success) {
                // If message count has changed, update DOM
                const log = document.getElementById('messages-log');
                if (log && pollRes.messages.length !== messages.length) {
                    messages = pollRes.messages;
                    let logsHtml = '';
                    messages.forEach(m => {
                        const isMe = m.sender_id === state.user.id;
                        logsHtml += `
                            <div class="flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in">
                                <div class="max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                                    <div class="px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-dark-800 text-slate-200 rounded-tl-none border border-slate-700/50'}">
                                        ${m.message_text}
                                    </div>
                                    <span class="text-[9px] text-slate-500 mt-1">${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        `;
                    });
                    log.innerHTML = logsHtml;
                    log.scrollTop = log.scrollHeight;
                }
            }
        }, 3000);
    }
}

// ==========================================
// MODAL CONTROLLERS
// ==========================================

// Add Funds Modal Actions
function showAddFundsModal() {
    // Render and append to body
    const modalWrap = document.createElement('div');
    modalWrap.id = 'modal-container';
    modalWrap.innerHTML = Views.addFundsModal();
    document.body.appendChild(modalWrap);
    
    lucide.createIcons();
    
    // Close button
    document.getElementById('close-funds-modal').addEventListener('click', () => {
        document.body.removeChild(modalWrap);
    });
    
    // Form submit
    document.getElementById('add-funds-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('fund-amount').value);
        const cardNum = document.getElementById('card-number').value;
        
        const res = await apiCall('payments/fund', 'POST', { amount, cardDetails: cardNum });
        if (res.success) {
            showToast(res.message, 'success');
            // Update local storage and app state
            state.user.balance = res.newBalance;
            localStorage.setItem('user', JSON.stringify(state.user));
            
            document.body.removeChild(modalWrap);
            routeDashboard();
        } else {
            showToast(res.message, 'error');
        }
    });
}

// Withdraw Modal Actions
async function showWithdrawModal() {
    // Fetch fresh balance from API before opening modal
    const profileRes = await apiCall('auth/me');
    if (profileRes.success) {
        state.user = profileRes.user;
        localStorage.setItem('user', JSON.stringify(state.user));
    }

    const currentBalance = parseFloat(state.user.balance) || 0;

    const modalWrap = document.createElement('div');
    modalWrap.id = 'modal-container';
    modalWrap.innerHTML = Views.withdrawModal(currentBalance);
    document.body.appendChild(modalWrap);
    
    lucide.createIcons();
    
    document.getElementById('close-withdraw-modal').addEventListener('click', () => {
        document.body.removeChild(modalWrap);
    });
    
    document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const bankName = document.getElementById('bank-name').value;
        const bankIban = document.getElementById('bank-iban').value;
        const bankDetails = `${bankName} - ${bankIban}`;

        if (amount <= 0) {
            showToast('Please enter a valid withdrawal amount.', 'warning');
            return;
        }
        if (amount > currentBalance) {
            showToast(`Insufficient balance. Your available balance is ₹${currentBalance.toFixed(2)}.`, 'error');
            return;
        }
        
        const res = await apiCall('payments/withdraw', 'POST', { amount, bankDetails });
        if (res.success) {
            showToast(res.message, 'success');
            state.user.balance = res.newBalance;
            localStorage.setItem('user', JSON.stringify(state.user));
            document.body.removeChild(modalWrap);
            routeDashboard();
        } else {
            showToast(res.message, 'error');
        }
    });
}

// Submit Deliverable Modal Actions
function showSubmitWorkModal(contractId, milestoneId) {
    const modalWrap = document.createElement('div');
    modalWrap.id = 'modal-container';
    modalWrap.innerHTML = Views.submitDeliverableModal(contractId, milestoneId);
    document.body.appendChild(modalWrap);
    
    lucide.createIcons();
    
    document.getElementById('close-work-modal').addEventListener('click', () => {
        document.body.removeChild(modalWrap);
    });
    
    document.getElementById('submit-work-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const deliverableUrl = document.getElementById('deliverable-url').value;
        const submissionNotes = document.getElementById('submission-notes').value;
        
        const res = await apiCall(`contracts/${contractId}/submit`, 'POST', { milestoneId, deliverableUrl, submissionNotes });
        if (res.success) {
            showToast(res.message, 'success');
            document.body.removeChild(modalWrap);
            routeContracts();
        } else {
            showToast(res.message, 'error');
        }
    });
}

// 10. Profile Settings and Public Profile Route
async function routeProfile(id = null) {
    if (!state.user) {
        window.location.hash = '#/login';
        return;
    }
    
    if (id === null) {
        // Edit mode (My Profile)
        const meRes = await apiCall('auth/me');
        if (meRes.success) {
            state.user = meRes.user;
            localStorage.setItem('user', JSON.stringify(state.user));
        }
        
        renderView(Views.profile(state.user));
        
        const form = document.getElementById('profile-settings-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const bio = document.getElementById('profile-bio').value.trim();
                const skills = document.getElementById('profile-skills').value.trim();
                const portfolio = document.getElementById('profile-portfolio').value.trim();
                
                const updateRes = await apiCall('auth/profile', 'PUT', { bio, skills, portfolio });
                if (updateRes.success) {
                    showToast(updateRes.message, 'success');
                    state.user = updateRes.user;
                    localStorage.setItem('user', JSON.stringify(state.user));
                    routeProfile(); // Reload
                } else {
                    showToast(updateRes.message, 'error');
                }
            });
        }
    } else {
        // Public View mode
        const userRes = await apiCall(`users/${id}`);
        if (!userRes.success) {
            renderError('User Not Found', userRes.message);
            return;
        }
        
        const reviewsRes = await apiCall(`user/${id}/reviews`);
        const reviews = reviewsRes.success ? reviewsRes.reviews : [];
        
        renderView(Views.publicProfile(userRes.user, reviews, state.user));
    }
}

// 11. Review / Feedback Route
async function routeReview(contractId) {
    if (!state.user) {
        window.location.hash = '#/login';
        return;
    }
    
    const contractsRes = await apiCall('contracts');
    const contracts = contractsRes.success ? contractsRes.contracts : [];
    const contract = contracts.find(c => c.id == contractId);
    
    if (!contract) {
        renderError('Contract Not Found', 'Could not locate the associated completed contract.');
        return;
    }
    
    if (contract.status !== 'completed') {
        renderError('Action Not Allowed', 'Reviews can only be submitted for completed contracts.');
        return;
    }
    
    let revieweeId;
    let revieweeName;
    if (state.user.role === 'client') {
        revieweeId = contract.freelancer_id;
        revieweeName = contract.freelancer_name;
    } else {
        revieweeId = contract.client_id;
        revieweeName = contract.client_name;
    }
    
    renderView(Views.reviewForm(contract, { id: revieweeId, name: revieweeName }));
    
    const form = document.getElementById('review-submission-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ratingVal = form.elements['rating'].value;
            const comment = document.getElementById('review-comment').value.trim();
            
            const submitRes = await apiCall('reviews', 'POST', {
                project_id: contract.project_id,
                reviewee_id: revieweeId,
                rating: parseInt(ratingVal),
                comment: comment
            });
            
            if (submitRes.success) {
                showToast(submitRes.message, 'success');
                window.location.hash = '#/contracts';
            } else {
                showToast(submitRes.message, 'error');
            }
        });
    }
}

// ==========================================
// CENTRAL ROUTER CONTROLLER
// ==========================================
function getHashRoute() {
    const hash = window.location.hash || '#/';
    return hash.substring(1); // remove the #
}

async function router() {
    const route = getHashRoute();
    
    // Clear chat intervals when navigating to non-chat locations
    if (state.activeChatInterval) {
        clearInterval(state.activeChatInterval);
        state.activeChatInterval = null;
    }
    
    if (route === '/' || route === '') {
        await routeLanding();
    } else if (route === '/login') {
        routeLogin();
    } else if (route === '/register') {
        routeRegister();
    } else if (route === '/projects') {
        await routeProjects();
    } else if (route.startsWith('/project/')) {
        const id = route.substring('/project/'.length);
        await routeProjectDetails(id);
    } else if (route === '/post-project') {
        routePostProject();
    } else if (route === '/dashboard') {
        await routeDashboard();
    } else if (route === '/contracts') {
        await routeContracts();
    } else if (route.startsWith('/chat')) {
        const parts = route.split('/');
        const id = parts[2] || null;
        await routeChat(id);
    } else if (route === '/profile') {
        await routeProfile();
    } else if (route.startsWith('/profile/')) {
        const id = route.substring('/profile/'.length);
        await routeProfile(id);
    } else if (route.startsWith('/review/')) {
        const id = route.substring('/review/'.length);
        await routeReview(id);
    } else {
        renderError('404 Page Not Found', 'The requested page path does not exist on this server node.');
    }
}

// Initialization bootstrap
window.addEventListener('DOMContentLoaded', () => {
    initAuthState();
    window.addEventListener('hashchange', router);
    router();
});
