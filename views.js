// views.js - High-fidelity layout and component renderer for Innovexa Catalyst
const Views = {
    // Shared Layout Helpers
    header: function(user) {
        let navLinks = '';
        let authButtons = '';
        
        if (user) {
            navLinks = `
                <a href="#/projects" class="text-sm font-medium text-slate-300 hover:text-brand-400 transition">Browse Projects</a>
                <a href="#/dashboard" class="text-sm font-medium text-slate-300 hover:text-brand-400 transition">Dashboard</a>
                <a href="#/chat" class="text-sm font-medium text-slate-300 hover:text-brand-400 transition flex items-center gap-1">
                    Messages
                    <span id="unread-dot" class="hidden h-2 w-2 rounded-full bg-brand-500"></span>
                </a>
                <a href="#/contracts" class="text-sm font-medium text-slate-300 hover:text-brand-400 transition">Contracts</a>
            `;
            
            if (user.role === 'client') {
                navLinks += `
                    <a href="#/post-project" class="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition shadow-md shadow-brand-500/20">+ Post Project</a>
                `;
            }
            
            authButtons = `
                <div class="flex items-center gap-4">
                    <div class="hidden sm:flex flex-col text-right">
                        <span class="text-xs text-slate-400 capitalize">${user.role}</span>
                        <a href="#/profile" class="text-sm font-semibold text-slate-200 hover:text-brand-400 transition" title="My Profile & Settings">${user.name}</a>
                    </div>
                    <div class="bg-dark-800 border border-slate-700/50 rounded-lg px-3 py-1 text-center">
                        <span class="text-xs text-slate-400 block font-medium">Balance</span>
                        <span class="text-sm font-bold text-emerald-400">₹${parseFloat(user.balance).toFixed(2)}</span>
                    </div>
                    <button id="logout-btn" class="p-2 hover:bg-dark-800 rounded-lg text-slate-400 hover:text-rose-400 transition" title="Logout">
                        <i data-lucide="log-out" class="h-5 w-5"></i>
                    </button>
                </div>
            `;
        } else {
            navLinks = `
                <a href="#/projects" class="text-sm font-medium text-slate-300 hover:text-brand-400 transition">Browse Projects</a>
            `;
            authButtons = `
                <div class="flex items-center gap-3">
                    <a href="#/login" class="text-sm font-medium text-slate-300 hover:text-brand-400 transition px-3 py-2">Login</a>
                    <a href="#/register" class="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition shadow-md shadow-brand-500/20">Sign Up</a>
                </div>
            `;
        }
        
        return `
            <nav class="glass-panel sticky top-0 z-50 border-b border-slate-800/80">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo -->
                        <div class="flex items-center gap-8">
                            <a href="#/" class="flex items-center gap-2">
                                <div class="bg-gradient-brand p-2 rounded-xl text-white shadow-lg shadow-brand-500/20">
                                    <i data-lucide="cpu" class="h-6 w-6"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-lg leading-tight tracking-wide font-display text-white">INNOVEXA</span>
                                    <span class="text-[10px] text-brand-400 tracking-widest font-semibold uppercase leading-none">CATALYST</span>
                                </div>
                            </a>
                            <div class="hidden md:flex items-center gap-6">
                                ${navLinks}
                            </div>
                        </div>
                        
                        <!-- Auth Actions -->
                        <div class="flex items-center gap-4">
                            ${authButtons}
                            
                            <!-- Mobile Menu Toggle -->
                            <button id="mobile-menu-toggle" class="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 transition">
                                <i data-lucide="menu" class="h-6 w-6"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Mobile Navigation Menu -->
                <div id="mobile-menu" class="hidden md:hidden border-t border-slate-800/80 bg-dark-900 px-4 py-3 flex flex-col gap-3">
                    <a href="#/projects" class="text-sm font-medium text-slate-300 hover:text-brand-400 py-2 border-b border-slate-800/40">Browse Projects</a>
                    ${user ? `
                        <a href="#/dashboard" class="text-sm font-medium text-slate-300 hover:text-brand-400 py-2 border-b border-slate-800/40">Dashboard</a>
                        <a href="#/chat" class="text-sm font-medium text-slate-300 hover:text-brand-400 py-2 border-b border-slate-800/40">Messages</a>
                        <a href="#/contracts" class="text-sm font-medium text-slate-300 hover:text-brand-400 py-2 border-b border-slate-800/40">Contracts</a>
                        <a href="#/profile" class="text-sm font-medium text-slate-300 hover:text-brand-400 py-2 border-b border-slate-800/40">My Profile</a>
                        ${user.role === 'client' ? '<a href="#/post-project" class="text-sm font-medium text-brand-400 py-2">Post Project</a>' : ''}
                    ` : `
                        <a href="#/login" class="text-sm font-medium text-slate-300 hover:text-brand-400 py-2">Login</a>
                        <a href="#/register" class="text-sm font-semibold bg-brand-600 text-white px-4 py-2 rounded-lg text-center mt-2">Sign Up</a>
                    `}
                </div>
            </nav>
        `;
    },

    footer: function() {
        return `
            <footer class="border-t border-slate-800/60 bg-dark-950 py-8 mt-auto">
                <div class="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center text-slate-500">
                    <div class="flex items-center justify-center gap-2 mb-4 sm:mb-0">
                        <i data-lucide="cpu" class="h-5 w-5 text-brand-400"></i>
                        <span class="font-bold text-sm tracking-wide font-display text-slate-300">INNOVEXA CATALYST</span>
                    </div>
                    <p class="text-xs">&copy; 2026 Innovexa Catalyst Inc. All rights reserved. Built for Freelance Marketplace Case Study.</p>
                </div>
            </footer>
        `;
    },

    // 1. LANDING VIEW
    landing: function(featuredProjects = []) {
        let projectsHtml = '';
        if (featuredProjects.length > 0) {
            featuredProjects.slice(0, 3).forEach(p => {
                projectsHtml += `
                    <div class="glass-panel glass-panel-hover card-glow p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">${p.category}</span>
                                <span class="text-emerald-400 font-bold font-display text-sm">₹${parseFloat(p.budget).toLocaleString()}</span>
                            </div>
                            <h3 class="font-semibold text-lg text-white mb-2 leading-snug">${p.title}</h3>
                            <p class="text-slate-400 text-sm mb-4 line-clamp-3">${p.description}</p>
                        </div>
                        <div class="flex items-center justify-between pt-4 border-t border-slate-800/40">
                            <div class="flex items-center gap-2">
                                <div class="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 capitalize">
                                    ${p.client_name ? p.client_name[0] : 'C'}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-xs font-medium text-slate-300">${p.client_name || 'Client'}</span>
                                    <span class="text-[10px] text-slate-500">Owner</span>
                                </div>
                            </div>
                            <a href="#/project/${p.id}" class="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition">
                                View Scope <i data-lucide="arrow-right" class="h-3.5 w-3.5"></i>
                            </a>
                        </div>
                    </div>
                `;
            });
        } else {
            projectsHtml = `
                <div class="col-span-full text-center py-12 glass-panel rounded-2xl text-slate-400">
                    <i data-lucide="briefcase" class="h-10 w-10 mx-auto text-slate-600 mb-2"></i>
                    No active projects currently listed.
                </div>
            `;
        }

        return `
            <main class="flex-grow">
                <!-- Hero Section -->
                <section class="relative pt-24 pb-16 overflow-hidden">
                    <div class="absolute inset-0 z-0">
                        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                    </div>
                    <div class="max-w-7xl mx-auto px-4 relative z-10 text-center">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6 animate-fade-in">
                            <span class="h-1.5 w-1.5 rounded-full bg-brand-400 animate-ping"></span>
                            Case Study Challenge: Full Stack Freelance Hub
                        </span>
                        <h1 class="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight font-display max-w-4xl mx-auto animate-fade-in" style="animation-delay: 0.1s">
                            The Decentralized Catalyst for <span class="text-gradient-brand">Elite Freelancing</span>
                        </h1>
                        <p class="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in" style="animation-delay: 0.2s">
                            Welcome to Innovexa Catalyst, a secure freelance marketplace featuring milestones contracts, double-party escrow guarantees, real-time messaging, and interactive tracking dashboards.
                        </p>
                        <div class="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in" style="animation-delay: 0.3s">
                            <a href="#/projects" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-brand-500/25 transition flex items-center gap-2">
                                Browse Projects <i data-lucide="search" class="h-4 w-4"></i>
                            </a>
                            <a href="#/register" class="bg-dark-800 border border-slate-700/50 hover:bg-dark-700 text-slate-200 font-semibold px-8 py-4 rounded-xl transition flex items-center gap-2">
                                Register Now <i data-lucide="user-plus" class="h-4 w-4"></i>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Stats Grid -->
                <section class="max-w-7xl mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
                            <div class="bg-brand-500/10 p-4 rounded-xl border border-brand-500/20 text-brand-400">
                                <i data-lucide="shield-check" class="h-6 w-6"></i>
                            </div>
                            <div>
                                <span class="text-2xl font-bold font-display text-white">100% Secure</span>
                                <p class="text-xs text-slate-500 mt-0.5">Escrow Guaranteed Funds</p>
                            </div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
                            <div class="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-400">
                                <i data-lucide="zap" class="h-6 w-6"></i>
                            </div>
                            <div>
                                <span class="text-2xl font-bold font-display text-white">Zero Friction</span>
                                <p class="text-xs text-slate-500 mt-0.5">Instant Milestone Release</p>
                            </div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
                            <div class="bg-sky-500/10 p-4 rounded-xl border border-sky-500/20 text-sky-400">
                                <i data-lucide="message-square" class="h-6 w-6"></i>
                            </div>
                            <div>
                                <span class="text-2xl font-bold font-display text-white">Live Sync</span>
                                <p class="text-xs text-slate-500 mt-0.5">Real-time Live Chat Polling</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- How It Works Section -->
                <section class="max-w-7xl mx-auto px-4 py-16 border-t border-slate-800/40">
                    <div class="text-center mb-12">
                        <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">How Innovexa Works</h2>
                        <p class="text-sm text-slate-400 mt-1 max-w-xl mx-auto">Five simple steps to secure, verify, and complete custom project contracts with ease.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div class="glass-panel p-5 rounded-2xl relative text-center flex flex-col items-center">
                            <div class="bg-brand-500/10 text-brand-400 p-3 rounded-xl border border-brand-500/20 mb-4">
                                <i data-lucide="user-check" class="h-5 w-5"></i>
                            </div>
                            <h3 class="font-semibold text-sm text-white mb-2">1. Connect Node</h3>
                            <p class="text-xs text-slate-400 leading-relaxed">Register your profile as a Freelancer or Client in seconds.</p>
                        </div>
                        <div class="glass-panel p-5 rounded-2xl relative text-center flex flex-col items-center">
                            <div class="bg-brand-500/10 text-brand-400 p-3 rounded-xl border border-brand-500/20 mb-4">
                                <i data-lucide="file-plus" class="h-5 w-5"></i>
                            </div>
                            <h3 class="font-semibold text-sm text-white mb-2">2. Publish / Bid</h3>
                            <p class="text-xs text-slate-400 leading-relaxed">Clients publish scopes; Freelancers bid rates and timelines.</p>
                        </div>
                        <div class="glass-panel p-5 rounded-2xl relative text-center flex flex-col items-center">
                            <div class="bg-brand-500/10 text-brand-400 p-3 rounded-xl border border-brand-500/20 mb-4">
                                <i data-lucide="wallet" class="h-5 w-5"></i>
                            </div>
                            <h3 class="font-semibold text-sm text-white mb-2">3. Fund Escrow</h3>
                            <p class="text-xs text-slate-400 leading-relaxed">Clients accept bids and lock 100% of the funds securely into Escrow.</p>
                        </div>
                        <div class="glass-panel p-5 rounded-2xl relative text-center flex flex-col items-center">
                            <div class="bg-brand-500/10 text-brand-400 p-3 rounded-xl border border-brand-500/20 mb-4">
                                <i data-lucide="upload-cloud" class="h-5 w-5"></i>
                            </div>
                            <h3 class="font-semibold text-sm text-white mb-2">4. Deliver Milestones</h3>
                            <p class="text-xs text-slate-400 leading-relaxed">Freelancers submit deliverables directly through the contract room.</p>
                        </div>
                        <div class="glass-panel p-5 rounded-2xl relative text-center flex flex-col items-center">
                            <div class="bg-brand-500/10 text-brand-400 p-3 rounded-xl border border-brand-500/20 mb-4">
                                <i data-lucide="party-popper" class="h-5 w-5"></i>
                            </div>
                            <h3 class="font-semibold text-sm text-white mb-2">5. Get Paid</h3>
                            <p class="text-xs text-slate-400 leading-relaxed">Clients release escrow payments; leave rating feedback.</p>
                        </div>
                    </div>
                </section>

                <!-- Feature Comparison Grid -->
                <section class="max-w-7xl mx-auto px-4 py-16 border-t border-slate-800/40">
                    <div class="text-center mb-12">
                        <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">Designed for Elite Performers</h2>
                        <p class="text-sm text-slate-400 mt-1 max-w-xl mx-auto">Why top freelancers are leaving traditional platforms for Innovexa Catalyst.</p>
                    </div>
                    <div class="glass-panel rounded-2xl overflow-hidden">
                        <div class="grid grid-cols-3 bg-dark-900/60 p-4 border-b border-slate-800 font-semibold text-xs text-slate-300">
                            <div>FEATURE</div>
                            <div class="text-center text-brand-400">INNOVEXA CATALYST</div>
                            <div class="text-center text-slate-500">LEGACY WEBSITES</div>
                        </div>
                        <div class="grid grid-cols-3 p-4 border-b border-slate-800/40 text-xs text-slate-300">
                            <div class="font-medium text-white">Platform Commission</div>
                            <div class="text-center text-emerald-400 font-semibold">10% Flat Rate</div>
                            <div class="text-center text-slate-500">20% + Project Setup Fees</div>
                        </div>
                        <div class="grid grid-cols-3 p-4 border-b border-slate-800/40 text-xs text-slate-300">
                            <div class="font-medium text-white">Escrow Protection</div>
                            <div class="text-center text-emerald-400 font-semibold">Instant Smart Escrow</div>
                            <div class="text-center text-slate-500">Manual holding / Delayed disputes</div>
                        </div>
                        <div class="grid grid-cols-3 p-4 border-b border-slate-800/40 text-xs text-slate-300">
                            <div class="font-medium text-white">Milestone Releases</div>
                            <div class="text-center text-emerald-400 font-semibold">Instantly credited</div>
                            <div class="text-center text-slate-500">3-5 business days delay</div>
                        </div>
                        <div class="grid grid-cols-3 p-4 text-xs text-slate-300">
                            <div class="font-medium text-white">Review System</div>
                            <div class="text-center text-emerald-400 font-semibold">Dual-sided verified rating</div>
                            <div class="text-center text-slate-500">Unverified spam / Paid boosting</div>
                        </div>
                    </div>
                </section>

                <!-- Featured Projects -->
                <section class="max-w-7xl mx-auto px-4 py-16 border-t border-slate-800/40">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Opportunities</h2>
                            <p class="text-sm text-slate-400 mt-1">Ready for immediate bids and contracts</p>
                        </div>
                        <a href="#/projects" class="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition">
                            See all <i data-lucide="chevron-right" class="h-4 w-4"></i>
                        </a>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${projectsHtml}
                    </div>
                </section>

                <!-- Testimonials Section -->
                <section class="max-w-7xl mx-auto px-4 py-16 border-t border-slate-800/40 mb-12">
                    <div class="text-center mb-12">
                        <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">Client Testimonials</h2>
                        <p class="text-sm text-slate-400 mt-1 max-w-xl mx-auto">What builders and hire-leads say about our zero-friction platform.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                            <p class="text-slate-300 text-xs italic leading-relaxed">
                                "The smartest escrow logic I've seen in the modern freelance space. No more chasing invoices. Once the milestone is submitted, releasing payment happens in a single click."
                            </p>
                            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/40">
                                <div class="h-8 w-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">M</div>
                                <div>
                                    <h4 class="text-xs font-bold text-white">Marcus Sterling</h4>
                                    <span class="text-[10px] text-slate-500">Product Manager, MetaFlux</span>
                                </div>
                            </div>
                        </div>
                        <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                            <p class="text-slate-300 text-xs italic leading-relaxed">
                                "Bidding is transparent, and the user verification system gives clients peace of mind. We hired a developer for a dashboard build and completed it 2 days ahead of schedule."
                            </p>
                            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/40">
                                <div class="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">A</div>
                                <div>
                                    <h4 class="text-xs font-bold text-white">Aria Chen</h4>
                                    <span class="text-[10px] text-slate-500">Co-founder, SynthLabs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        `;
    },

    // 2. LOGIN / REGISTER VIEW
    login: function(error = '') {
        return `
            <div class="flex-grow flex items-center justify-center py-16 px-4">
                <div class="glass-panel p-8 rounded-2xl w-full max-w-md animate-fade-in shadow-xl shadow-brand-950/20">
                    <div class="text-center mb-6">
                        <div class="bg-gradient-brand p-3 rounded-2xl text-white inline-block shadow-lg shadow-brand-500/20 mb-4">
                            <i data-lucide="cpu" class="h-8 w-8"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
                        <p class="text-slate-400 text-sm mt-1">Sign in to manage your marketplace projects</p>
                    </div>
                    
                    ${error ? `<div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2"><i data-lucide="alert-circle" class="h-4 w-4 flex-shrink-0"></i> <span>${error}</span></div>` : ''}
                    
                    <form id="login-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                            <div class="relative">
                                <input type="email" id="email" required class="w-full glass-input px-4 py-3 rounded-xl pl-10 text-sm" placeholder="john@example.com">
                                <i data-lucide="mail" class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <div class="relative">
                                <input type="password" id="password" required class="w-full glass-input px-4 py-3 rounded-xl pl-10 text-sm" placeholder="••••••••">
                                <i data-lucide="lock" class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"></i>
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-brand-500/10 mt-6 flex items-center justify-center gap-2">
                            Sign In <i data-lucide="arrow-right" class="h-4 w-4"></i>
                        </button>
                    </form>
                    
                    <p class="text-slate-500 text-xs text-center mt-6">
                        Don't have an account? <a href="#/register" class="text-brand-400 font-semibold hover:underline">Create account</a>
                    </p>
                </div>
            </div>
        `;
    },

    register: function(error = '') {
        return `
            <div class="flex-grow flex items-center justify-center py-16 px-4">
                <div class="glass-panel p-8 rounded-2xl w-full max-w-md animate-fade-in shadow-xl shadow-brand-950/20">
                    <div class="text-center mb-6">
                        <div class="bg-gradient-brand p-3 rounded-2xl text-white inline-block shadow-lg shadow-brand-500/20 mb-4">
                            <i data-lucide="cpu" class="h-8 w-8"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-white">Get Started</h2>
                        <p class="text-slate-400 text-sm mt-1">Create an account to join the Catalyst pool</p>
                    </div>
                    
                    ${error ? `<div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2"><i data-lucide="alert-circle" class="h-4 w-4 flex-shrink-0"></i> <span>${error}</span></div>` : ''}
                    
                    <form id="register-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="border border-slate-700/60 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-dark-800/40 transition">
                                    <input type="radio" name="role" value="freelancer" checked class="accent-brand-500">
                                    <span class="text-sm font-medium text-slate-300">Freelancer</span>
                                </label>
                                <label class="border border-slate-700/60 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-dark-800/40 transition">
                                    <input type="radio" name="role" value="client" class="accent-brand-500">
                                    <span class="text-sm font-medium text-slate-300">Employer</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                            <div class="relative">
                                <input type="text" id="name" required class="w-full glass-input px-4 py-3 rounded-xl pl-10 text-sm" placeholder="John Doe">
                                <i data-lucide="user" class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                            <div class="relative">
                                <input type="email" id="email" required class="w-full glass-input px-4 py-3 rounded-xl pl-10 text-sm" placeholder="john@example.com">
                                <i data-lucide="mail" class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <div class="relative">
                                <input type="password" id="password" required minlength="6" class="w-full glass-input px-4 py-3 rounded-xl pl-10 text-sm" placeholder="Minimum 6 characters">
                                <i data-lucide="lock" class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"></i>
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-brand-500/10 mt-6 flex items-center justify-center gap-2">
                            Create Account <i data-lucide="arrow-right" class="h-4 w-4"></i>
                        </button>
                    </form>
                    
                    <p class="text-slate-500 text-xs text-center mt-6">
                        Already have an account? <a href="#/login" class="text-brand-400 font-semibold hover:underline">Sign In</a>
                    </p>
                </div>
            </div>
        `;
    },

    // 3. PROJECTS LIST VIEW
    projects: function(projectsList = [], filters = {}) {
        let cardsHtml = '';
        if (projectsList.length > 0) {
            projectsList.forEach(p => {
                const skillsBadges = p.skills.map(s => `<span class="bg-dark-800 border border-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-md">${s}</span>`).join(' ');
                cardsHtml += `
                    <div class="glass-panel card-glow p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
                        <div class="flex-grow max-w-3xl">
                            <div class="flex items-center gap-3 mb-2 flex-wrap">
                                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">${p.category}</span>
                                ${p.client_verified ? `
                                    <span class="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                        <i data-lucide="check-circle-2" class="h-3 w-3"></i> Verified Client
                                    </span>
                                ` : ''}
                                <span class="text-xs text-slate-500">Deadline: ${p.deadline}</span>
                            </div>
                            <h3 class="text-lg font-bold text-white mb-2 leading-snug">${p.title}</h3>
                            <p class="text-slate-400 text-sm mb-4 line-clamp-2">${p.description}</p>
                            <div class="flex flex-wrap gap-2">
                                ${skillsBadges}
                            </div>
                        </div>
                        
                        <div class="flex flex-col items-start md:items-end justify-between min-w-[150px] border-t md:border-t-0 border-slate-800/40 pt-4 md:pt-0">
                            <div class="mb-4 text-left md:text-right">
                                <span class="text-xs text-slate-500 uppercase tracking-wider block">Budget</span>
                                <span class="text-xl font-bold font-display text-emerald-400">₹${parseFloat(p.budget).toLocaleString()}</span>
                            </div>
                            <a href="#/project/${p.id}" class="w-full md:w-auto bg-dark-800 border border-slate-700/50 hover:bg-brand-600 hover:border-brand-500 text-slate-200 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition text-center text-sm shadow-sm flex items-center justify-center gap-2">
                                View Project <i data-lucide="arrow-right" class="h-4 w-4"></i>
                            </a>
                        </div>
                    </div>
                `;
            });
        } else {
            cardsHtml = `
                <div class="text-center py-16 glass-panel rounded-2xl text-slate-400">
                    <i data-lucide="search" class="h-12 w-12 mx-auto text-slate-600 mb-3"></i>
                    <h3 class="font-bold text-white text-lg">No projects match your search</h3>
                    <p class="text-sm text-slate-500 mt-1">Try resetting the filters or modifying your query keywords.</p>
                </div>
            `;
        }

        return `
            <div class="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="mb-8">
                    <h1 class="text-3xl font-extrabold text-white tracking-tight">Browse Open Projects</h1>
                    <p class="text-sm text-slate-400 mt-1">Explore and place proposals on dynamic job postings</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <!-- Filters Sidebar -->
                    <div class="lg:col-span-1 space-y-6">
                        <div class="glass-panel p-6 rounded-2xl sticky top-20">
                            <div class="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/60">
                                <h2 class="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider"><i data-lucide="filter" class="h-4 w-4 text-brand-400"></i> Filters</h2>
                                <button id="clear-filters" class="text-xs text-slate-500 hover:text-brand-400 font-semibold transition">Clear All</button>
                            </div>
                            
                            <!-- Search Query -->
                            <div class="space-y-2 mb-5">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Keywords</label>
                                <div class="relative">
                                    <input type="text" id="filter-search" value="${filters.search || ''}" class="w-full glass-input px-3.5 py-2.5 rounded-xl pl-9 text-xs" placeholder="React, Node, etc...">
                                    <i data-lucide="search" class="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500"></i>
                                </div>
                            </div>
                            
                            <!-- Category Filter -->
                            <div class="space-y-2 mb-5">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</label>
                                <select id="filter-category" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs">
                                    <option value="">All Categories</option>
                                    <option value="Web Development" ${filters.category === 'Web Development' ? 'selected' : ''}>Web Development</option>
                                    <option value="Web Design" ${filters.category === 'Web Design' ? 'selected' : ''}>Web Design</option>
                                    <option value="Mobile Apps" ${filters.category === 'Mobile Apps' ? 'selected' : ''}>Mobile Apps</option>
                                    <option value="Writing" ${filters.category === 'Writing' ? 'selected' : ''}>Writing</option>
                                    <option value="Marketing" ${filters.category === 'Marketing' ? 'selected' : ''}>Marketing</option>
                                </select>
                            </div>
                            
                            <!-- Budget Range -->
                            <div class="space-y-2">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Budget Scope</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <span class="absolute left-2.5 top-2 text-slate-500 text-xs">$</span>
                                        <input type="number" id="filter-min-budget" value="${filters.minBudget || ''}" class="w-full glass-input pl-6 pr-2 py-2 rounded-xl text-xs" placeholder="Min">
                                    </div>
                                    <div class="relative">
                                        <span class="absolute left-2.5 top-2 text-slate-500 text-xs">$</span>
                                        <input type="number" id="filter-max-budget" value="${filters.maxBudget || ''}" class="w-full glass-input pl-6 pr-2 py-2 rounded-xl text-xs" placeholder="Max">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Projects Cards Feed -->
                    <div class="lg:col-span-3 space-y-4">
                        ${cardsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // 4. PROJECT DETAILS & BIDDING VIEW
    projectDetails: function(project, user, bids = [], myBid = null) {
        const skillsBadges = project.skills.map(s => `<span class="bg-dark-800 border border-slate-700/50 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg">${s}</span>`).join(' ');
        
        let actionsHtml = '';
        let bidSectionHtml = '';
        
        const isClient = user && (project.client_id === user.id);
        const isFreelancer = user && (user.role === 'freelancer');
        const isBiddingOpen = project.status === 'open';

        if (isClient) {
            actionsHtml = `
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <a href="#/project/${project.id}/edit" class="flex-1 sm:flex-initial bg-dark-800 border border-slate-700 hover:bg-dark-700 text-slate-200 font-semibold px-5 py-3 rounded-xl transition text-center text-sm flex items-center justify-center gap-2">
                        <i data-lucide="edit-3" class="h-4 w-4"></i> Edit Scope
                    </a>
                    <button id="delete-project-btn" class="flex-1 sm:flex-initial bg-rose-500/10 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-rose-400 font-semibold px-5 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
                        <i data-lucide="trash-2" class="h-4 w-4"></i> Delete Listing
                    </button>
                </div>
            `;
            
            // Client View: show all proposals
            let bidsListHtml = '';
            if (bids.length > 0) {
                bids.forEach(b => {
                    bidsListHtml += `
                        <div class="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 card-glow">
                            <div class="flex-grow">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 capitalize">
                                        ${b.freelancer_name[0]}
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-1.5">
                                            <span class="font-bold text-white text-sm">${b.freelancer_name}</span>
                                            ${b.freelancer_verified ? `<i data-lucide="check-circle-2" class="h-4 w-4 text-emerald-400" title="Verified Professional"></i>` : ''}
                                        </div>
                                        <span class="text-xs text-slate-500">Proposal placed: ${new Date(b.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p class="text-slate-300 text-sm whitespace-pre-wrap mb-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800/60 leading-relaxed">${b.cover_letter}</p>
                                <div class="flex flex-wrap gap-1">
                                    ${b.freelancer_skills ? b.freelancer_skills.slice(0, 4).map(s => `<span class="bg-dark-800 text-[10px] text-slate-400 px-2 py-0.5 rounded border border-slate-800">${s}</span>`).join(' ') : ''}
                                </div>
                            </div>
                            
                            <div class="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 min-w-[180px] border-t md:border-t-0 border-slate-800/40 pt-4 md:pt-0">
                                <div class="text-left md:text-right">
                                    <div class="text-emerald-400 font-bold font-display text-lg">₹${parseFloat(b.amount).toFixed(2)}</div>
                                    <span class="text-xs text-slate-500">${b.delivery_days} Days delivery</span>
                                </div>
                                <div class="flex items-center gap-2 w-full md:w-auto">
                                    <a href="#/chat/${b.freelancer_id}" class="flex-1 md:flex-initial p-2.5 bg-dark-800 border border-slate-700 hover:bg-dark-700 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center" title="Chat with Freelancer">
                                        <i data-lucide="message-square" class="h-4 w-4"></i>
                                    </a>
                                    ${isBiddingOpen ? `
                                        <button data-bid-id="${b.id}" class="award-contract-btn flex-1 md:flex-initial bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5">
                                            Award Project
                                        </button>
                                    ` : `
                                        <span class="text-xs text-slate-500 uppercase tracking-widest font-semibold">${b.status}</span>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                bidsListHtml = `
                    <div class="text-center py-10 glass-panel rounded-2xl text-slate-500">
                        <i data-lucide="users" class="h-8 w-8 mx-auto text-slate-600 mb-2"></i>
                        No bids received yet for this project.
                    </div>
                `;
            }
            
            bidSectionHtml = `
                <div class="mt-12">
                    <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2"><i data-lucide="send" class="h-5 w-5 text-brand-400"></i> Proposals Received (${bids.length})</h2>
                    <div class="space-y-4">
                        ${bidsListHtml}
                    </div>
                </div>
            `;
        } else if (isFreelancer) {
            // Freelancer View: Form to place/edit bid
            if (isBiddingOpen) {
                bidSectionHtml = `
                    <div class="glass-panel p-6 rounded-2xl mt-12">
                        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="edit-3" class="h-5 w-5 text-brand-400"></i> ${myBid ? 'Modify Your Proposal' : 'Submit a Proposal'}</h2>
                        <form id="bid-form" class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Bid Amount (₹)</label>
                                    <input type="number" id="bid-amount" required value="${myBid ? myBid.amount : ''}" min="1" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs" placeholder="e.g. 1000">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Estimated Delivery (Days)</label>
                                    <input type="number" id="bid-days" required value="${myBid ? myBid.delivery_days : ''}" min="1" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs" placeholder="e.g. 7">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cover Letter / Pitch</label>
                                <textarea id="bid-cover" required rows="5" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs" placeholder="Describe your experience, technical approach, and why you are the best fit for this project...">${myBid ? myBid.cover_letter : ''}</textarea>
                            </div>
                            <div class="flex justify-end pt-2">
                                <button type="submit" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-brand-500/10 flex items-center gap-2 text-xs">
                                    <i data-lucide="send" class="h-4 w-4"></i> ${myBid ? 'Update Proposal' : 'Submit Proposal'}
                                </button>
                            </div>
                        </form>
                    </div>
                `;
            } else {
                bidSectionHtml = `
                    <div class="bg-dark-900/60 border border-slate-800 px-6 py-4 rounded-xl text-slate-400 text-center text-sm mt-8">
                        <i data-lucide="lock" class="h-5 w-5 mx-auto text-slate-600 mb-1"></i> Bidding has closed. Project is ${project.status}.
                    </div>
                `;
            }
        } else if (!user) {
            bidSectionHtml = `
                <div class="bg-brand-500/5 border border-brand-500/20 px-6 py-4 rounded-xl text-slate-400 text-center text-sm mt-8">
                    Please <a href="#/login" class="text-brand-400 font-semibold hover:underline">sign in</a> to submit a proposal or bid on this project.
                </div>
            `;
        }

        return `
            <div class="max-w-5xl mx-auto px-4 py-12 flex-grow w-full">
                <!-- Navigation -->
                <div class="mb-6">
                    <a href="#/projects" class="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition">
                        <i data-lucide="arrow-left" class="h-3.5 w-3.5"></i> Back to Browse
                    </a>
                </div>
                
                <!-- Main details panel -->
                <div class="glass-panel p-6 sm:p-8 rounded-2xl animate-fade-in">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-800/80">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">${project.category}</span>
                                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${project.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}">${project.status}</span>
                            </div>
                            <h1 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-display">${project.title}</h1>
                        </div>
                        ${actionsHtml}
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Left pane: scope and descriptions -->
                        <div class="lg:col-span-2 space-y-6">
                            <div>
                                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Scope & Details</h3>
                                <p class="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">${project.description}</p>
                            </div>
                            
                            <div>
                                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Required Technical Skills</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${skillsBadges}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right pane: metadata stats cards -->
                        <div class="lg:col-span-1 space-y-4">
                            <div class="bg-dark-900/60 border border-slate-800/80 p-5 rounded-xl space-y-4">
                                <div>
                                    <span class="text-[10px] text-slate-500 uppercase tracking-wider block">Escrow Budget</span>
                                    <span class="text-2xl font-bold font-display text-emerald-400">₹${parseFloat(project.budget).toLocaleString()}</span>
                                </div>
                                <div class="pt-3 border-t border-slate-800/80 flex justify-between">
                                    <div>
                                        <span class="text-[10px] text-slate-500 uppercase tracking-wider block">Expires On</span>
                                        <span class="text-xs font-semibold text-slate-200">${project.deadline}</span>
                                    </div>
                                    <div>
                                        <span class="text-[10px] text-slate-500 uppercase tracking-wider block">Bids Received</span>
                                        <span class="text-xs font-semibold text-slate-200">${bids.length}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Client widget -->
                            <div class="bg-dark-900/60 border border-slate-800/80 p-5 rounded-xl flex items-center gap-3">
                                <div class="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 capitalize">
                                    ${project.client_name ? project.client_name[0] : 'C'}
                                </div>
                                <div class="flex-grow">
                                    <div class="flex items-center gap-1 leading-none">
                                        <span class="text-xs font-bold text-slate-200">${project.client_name}</span>
                                        ${project.client_verified ? `<i data-lucide="check-circle-2" class="h-3 w-3 text-emerald-400" title="Verified client"></i>` : ''}
                                    </div>
                                    <span class="text-[9px] text-slate-500 block mt-1">${project.client_email}</span>
                                    ${user && user.id !== project.client_id ? `
                                        <a href="#/chat/${project.client_id}" class="text-[10px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 mt-1.5 transition">
                                            <i data-lucide="message-square" class="h-3 w-3"></i> Chat with client
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Bids Form / List Section -->
                ${bidSectionHtml}
            </div>
        `;
    },

    // 5. POST A PROJECT VIEW
    postProject: function() {
        return `
            <div class="max-w-3xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="glass-panel p-6 sm:p-8 rounded-2xl animate-fade-in shadow-xl">
                    <div class="mb-6 pb-4 border-b border-slate-800/80">
                        <h1 class="text-2xl font-extrabold text-white tracking-tight">Post a New Project</h1>
                        <p class="text-xs text-slate-400 mt-1">Specify your requirements and budget for the Innovexa pool</p>
                    </div>
                    
                    <form id="post-project-form" class="space-y-6">
                        <!-- Step 1: Core Details -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Title</label>
                                <input type="text" id="project-title" required class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="e.g. Build an E-Commerce Landing Page">
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                    <select id="project-category" required class="w-full glass-input px-4 py-3 rounded-xl text-sm">
                                        <option value="">Select Category</option>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Web Design">Web Design</option>
                                        <option value="Mobile Apps">Mobile Apps</option>
                                        <option value="Writing">Writing</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Skills (Comma separated)</label>
                                    <input type="text" id="project-skills" required class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="e.g. React, Tailwind CSS, PHP">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detailed Description</label>
                                <textarea id="project-description" required rows="6" class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="Detail the features, constraints, objectives, and deliverables required..."></textarea>
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Escrow Budget (₹)</label>
                                    <input type="number" id="project-budget" required min="1" class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="e.g. 1500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Proposal Deadline</label>
                                    <input type="date" id="project-deadline" required class="w-full glass-input px-4 py-3 rounded-xl text-sm">
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                            <a href="#/dashboard" class="bg-dark-800 border border-slate-700 hover:bg-dark-700 text-slate-300 font-semibold px-6 py-3 rounded-xl transition text-sm">
                                Cancel
                            </a>
                            <button type="submit" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-brand-500/10 text-sm flex items-center gap-2">
                                <i data-lucide="check" class="h-4 w-4"></i> Post Scope
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // 6. DASHBOARDS (CLIENT / FREELANCER / ADMIN)
    dashboard: function(user, data = {}) {
        let contentHtml = '';
        
        if (user.role === 'client') {
            // Client Dashboard
            let activeContractsHtml = '';
            if (data.contracts && data.contracts.filter(c => c.status === 'active').length > 0) {
                data.contracts.filter(c => c.status === 'active').forEach(c => {
                    activeContractsHtml += `
                        <div class="flex items-center justify-between p-4 border-b border-slate-800/40 last:border-0 hover:bg-dark-800/20 transition rounded-xl">
                            <div>
                                <h4 class="font-bold text-white text-sm">${c.project_title}</h4>
                                <p class="text-xs text-slate-500 mt-1">Freelancer: ${c.freelancer_name} | Escrow: <span class="capitalize text-slate-400">${c.escrow_status}</span></p>
                            </div>
                            <div class="text-right flex items-center gap-3">
                                <span class="text-emerald-400 text-sm font-semibold">₹${parseFloat(c.budget).toFixed(2)}</span>
                                <a href="#/contracts" class="text-xs bg-dark-800 border border-slate-700 hover:bg-brand-600 hover:border-brand-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition">Manage</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                activeContractsHtml = `<div class="p-6 text-center text-slate-500 text-sm">No active contracts currently running.</div>`;
            }
            
            let postedJobsHtml = '';
            if (data.myProjects && data.myProjects.length > 0) {
                data.myProjects.forEach(p => {
                    postedJobsHtml += `
                        <div class="flex items-center justify-between p-4 border-b border-slate-800/40 last:border-0 hover:bg-dark-800/20 transition rounded-xl">
                            <div>
                                <h4 class="font-bold text-slate-200 text-sm">${p.title}</h4>
                                <p class="text-xs text-slate-500 mt-1">Budget: ₹${parseFloat(p.budget).toLocaleString()} | Status: <span class="capitalize text-slate-400">${p.status}</span></p>
                            </div>
                            <div class="text-right">
                                <a href="#/project/${p.id}" class="text-xs font-semibold text-brand-400 hover:text-brand-300 transition">View Details & Bids &rarr;</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                postedJobsHtml = `<div class="p-6 text-center text-slate-500 text-sm">You haven't posted any projects yet.</div>`;
            }

            contentHtml = `
                <!-- Top Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div class="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <span class="text-xs text-slate-500 uppercase tracking-wider block">Wallet Balance</span>
                            <span class="text-2xl font-bold font-display text-white mt-1">₹${parseFloat(user.balance).toFixed(2)}</span>
                        </div>
                        <button id="add-funds-btn" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-md shadow-brand-500/10">+ Add Funds</button>
                    </div>
                    
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Total Spent</span>
                        <span class="text-2xl font-bold font-display text-emerald-400 mt-1">₹${parseFloat(data.totalSpent || 0).toFixed(2)}</span>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Contracts Active</span>
                        <span class="text-2xl font-bold font-display text-white mt-1">${data.contracts ? data.contracts.filter(c => c.status === 'active').length : 0}</span>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Open Projects</span>
                        <span class="text-2xl font-bold font-display text-white mt-1">${data.myProjects ? data.myProjects.filter(p => p.status === 'open').length : 0}</span>
                    </div>
                </div>
                
                <!-- Main Columns -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <!-- Left: Active contracts -->
                    <div class="glass-panel p-6 rounded-2xl">
                        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="activity" class="h-5 w-5 text-brand-400"></i> Active Contracts</h2>
                        <div class="space-y-1">
                            ${activeContractsHtml}
                        </div>
                    </div>
                    
                    <!-- Right: Posted projects -->
                    <div class="glass-panel p-6 rounded-2xl">
                        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="briefcase" class="h-5 w-5 text-brand-400"></i> My Posted Projects</h2>
                        <div class="space-y-1">
                            ${postedJobsHtml}
                        </div>
                    </div>
                </div>
            `;
        } else if (user.role === 'freelancer') {
            // Freelancer Dashboard
            let activeContractsHtml = '';
            if (data.contracts && data.contracts.filter(c => c.status === 'active').length > 0) {
                data.contracts.filter(c => c.status === 'active').forEach(c => {
                    activeContractsHtml += `
                        <div class="flex items-center justify-between p-4 border-b border-slate-800/40 last:border-0 hover:bg-dark-800/20 transition rounded-xl">
                            <div>
                                <h4 class="font-bold text-white text-sm">${c.project_title}</h4>
                                <p class="text-xs text-slate-500 mt-1">Client: ${c.client_name} | Escrow: <span class="capitalize text-slate-400">${c.escrow_status}</span></p>
                            </div>
                            <div class="text-right flex items-center gap-3">
                                <span class="text-emerald-400 text-sm font-semibold">₹${parseFloat(c.budget).toFixed(2)}</span>
                                <a href="#/contracts" class="text-xs bg-dark-800 border border-slate-700 hover:bg-brand-600 hover:border-brand-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition">Submit Work</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                activeContractsHtml = `<div class="p-6 text-center text-slate-500 text-sm">No active contracts currently running.</div>`;
            }
            
            let activeBidsHtml = '';
            if (data.bids && data.bids.length > 0) {
                data.bids.forEach(b => {
                    activeBidsHtml += `
                        <div class="flex items-center justify-between p-4 border-b border-slate-800/40 last:border-0 hover:bg-dark-800/20 transition rounded-xl">
                            <div>
                                <h4 class="font-bold text-slate-200 text-sm">${b.project_title || 'Project Proposal'}</h4>
                                <p class="text-xs text-slate-500 mt-1">My Bid: ₹${parseFloat(b.amount).toFixed(2)} | Delivery: ${b.delivery_days} Days</p>
                            </div>
                            <div class="text-right flex items-center gap-3">
                                <span class="text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : b.status === 'shortlisted' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${b.status}</span>
                                <a href="#/project/${b.project_id}" class="text-xs font-semibold text-brand-400 hover:text-brand-300 transition">View</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                activeBidsHtml = `<div class="p-6 text-center text-slate-500 text-sm">You have no pending bids.</div>`;
            }

            contentHtml = `
                <!-- Top Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div class="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <span class="text-xs text-slate-500 uppercase tracking-wider block">Wallet Balance</span>
                            <span class="text-2xl font-bold font-display text-white mt-1">₹${parseFloat(user.balance).toFixed(2)}</span>
                        </div>
                        <button id="withdraw-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-md shadow-emerald-500/10">Withdraw</button>
                    </div>
                    
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Total Earnings</span>
                        <span class="text-2xl font-bold font-display text-emerald-400 mt-1">₹${parseFloat(data.totalEarnings || 0).toFixed(2)}</span>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Contracts Active</span>
                        <span class="text-2xl font-bold font-display text-white mt-1">${data.contracts ? data.contracts.filter(c => c.status === 'active').length : 0}</span>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Pending Bids</span>
                        <span class="text-2xl font-bold font-display text-white mt-1">${data.bids ? data.bids.filter(b => b.status === 'pending').length : 0}</span>
                    </div>
                </div>
                
                <!-- Main Columns -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <!-- Left: Active contracts -->
                    <div class="glass-panel p-6 rounded-2xl">
                        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="activity" class="h-5 w-5 text-brand-400"></i> Active Contracts</h2>
                        <div class="space-y-1">
                            ${activeContractsHtml}
                        </div>
                    </div>
                    
                    <!-- Right: Active proposals -->
                    <div class="glass-panel p-6 rounded-2xl">
                        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="send" class="h-5 w-5 text-brand-400"></i> My Active Proposals</h2>
                        <div class="space-y-1">
                            ${activeBidsHtml}
                        </div>
                    </div>
                </div>
            `;
        } else if (user.role === 'admin') {
            // Admin Dashboard
            let usersTableHtml = '';
            if (data.usersList && data.usersList.length > 0) {
                data.usersList.forEach(u => {
                    usersTableHtml += `
                        <tr class="border-b border-slate-800/40 hover:bg-dark-800/20 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200 capitalize">${u.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">${u.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400 capitalize">${u.role}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-400">₹${parseFloat(u.balance).toFixed(2)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}">${u.is_verified ? 'Verified' : 'Pending'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_banned ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}">${u.is_banned ? 'Banned' : 'Active'}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                                <button data-user-id="${u.id}" data-action="verify" data-state="${u.is_verified ? 0 : 1}" class="admin-action-btn bg-dark-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition">${u.is_verified ? 'Unverify' : 'Verify'}</button>
                                <button data-user-id="${u.id}" data-action="ban" data-state="${u.is_banned ? 0 : 1}" class="admin-action-btn border ${u.is_banned ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white'} px-3 py-1.5 rounded-lg transition">${u.is_banned ? 'Unban' : 'Ban'}</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                usersTableHtml = `<tr><td colspan="7" class="text-center py-6 text-slate-500 text-sm">No users registered on the platform.</td></tr>`;
            }

            contentHtml = `
                <!-- Admin Analytics Metrics -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Total Members</span>
                        <span class="text-2xl font-bold font-display text-white mt-1">${data.analytics ? data.analytics.users.total : 0}</span>
                        <div class="text-[10px] text-slate-500 mt-1">${data.analytics ? data.analytics.users.clients : 0} Clients | ${data.analytics ? data.analytics.users.freelancers : 0} Freelancers</div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Total Projects</span>
                        <span class="text-2xl font-bold font-display text-white mt-1">${data.analytics ? data.analytics.projects.total : 0}</span>
                        <div class="text-[10px] text-slate-500 mt-1">${data.analytics ? data.analytics.projects.open : 0} Open | ${data.analytics ? data.analytics.projects.active : 0} Active</div>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Active Escrow Value</span>
                        <span class="text-2xl font-bold font-display text-emerald-400 mt-1">₹${parseFloat(data.analytics ? data.analytics.escrow.activeEscrow : 0).toLocaleString()}</span>
                    </div>
                    <div class="glass-panel p-6 rounded-2xl">
                        <span class="text-xs text-slate-500 uppercase tracking-wider block">Platform Fees (10% Est)</span>
                        <span class="text-2xl font-bold font-display text-emerald-400 mt-1">₹${parseFloat(data.analytics ? data.analytics.escrow.platformEarnings : 0).toLocaleString()}</span>
                    </div>
                </div>
                
                <!-- Users moderation table -->
                <div class="glass-panel p-6 rounded-2xl mt-8">
                    <h2 class="text-lg font-bold text-white mb-5 flex items-center gap-2"><i data-lucide="users" class="h-5 w-5 text-brand-400"></i> User Moderation & Verification</h2>
                    <div class="overflow-x-auto border border-slate-800/80 rounded-xl">
                        <table class="min-w-full divide-y divide-slate-800/60 bg-dark-900/40">
                            <thead class="bg-dark-950/40">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/40">
                                ${usersTableHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        return `
            <div class="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="mb-8">
                    <h1 class="text-3xl font-extrabold text-white tracking-tight">${user.role === 'admin' ? 'Marketplace Administration' : 'Management Dashboard'}</h1>
                    <p class="text-xs text-slate-400 mt-1">Account reference node: ${user.email} (${user.role})</p>
                </div>
                ${contentHtml}
            </div>
        `;
    },

    // 7. CONTRACTS & MILESTONES VIEW
    contracts: function(contracts = [], transactions = [], user) {
        let contractsHtml = '';
        if (contracts.length > 0) {
            contracts.forEach(c => {
                let milestonesListHtml = '';
                c.milestones.forEach(m => {
                    let actionButtonHtml = '';
                    if (m.status === 'pending' && user.role === 'freelancer') {
                        actionButtonHtml = `
                            <button data-contract-id="${c.id}" data-milestone-id="${m.id}" class="submit-deliverable-btn bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition shadow-sm">
                                Submit Deliverable
                            </button>
                        `;
                    } else if (m.status === 'submitted' && user.role === 'client') {
                        actionButtonHtml = `
                            <button data-contract-id="${c.id}" data-milestone-id="${m.id}" class="approve-milestone-btn bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition shadow-sm">
                                Release Escrow
                            </button>
                        `;
                    }
                    
                    milestonesListHtml += `
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-dark-950/40 border border-slate-800/80 rounded-xl gap-3">
                            <div>
                                <h4 class="font-bold text-slate-200 text-xs">${m.title}</h4>
                                <span class="text-emerald-400 font-semibold text-xs block mt-1">₹${parseFloat(m.amount).toFixed(2)}</span>
                                ${m.deliverable_url ? `
                                    <div class="mt-2 text-xs space-y-1">
                                        <p class="text-slate-400">Deliverable: <a href="${m.deliverable_url}" target="_blank" class="text-brand-400 font-semibold hover:underline break-all">${m.deliverable_url}</a></p>
                                        <p class="text-slate-500 italic">"${m.submission_notes}"</p>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="flex items-center gap-3 self-end sm:self-center">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${m.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : m.status === 'submitted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}">${m.status}</span>
                                ${actionButtonHtml}
                            </div>
                        </div>
                    `;
                });

                contractsHtml += `
                    <div class="glass-panel p-6 rounded-2xl animate-fade-in card-glow">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
                            <div>
                                <h3 class="font-bold text-lg text-white">${c.project_title}</h3>
                                <p class="text-xs text-slate-500 mt-1">
                                    Client: <a href="#/profile/${c.client_id}" class="text-brand-400 hover:underline">${c.client_name}</a> | 
                                    Freelancer: <a href="#/profile/${c.freelancer_id}" class="text-brand-400 hover:underline">${c.freelancer_name}</a>
                                </p>
                                ${c.status === 'completed' ? `
                                    <div class="mt-2.5">
                                        <a href="#/review/${c.id}" class="inline-flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/35 text-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition border border-amber-500/20">
                                            <i data-lucide="star" class="h-3 w-3 fill-amber-300"></i> Leave Feedback
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="text-left sm:text-right flex items-center sm:flex-col gap-3 sm:gap-1">
                                <span class="text-xs text-slate-500 block uppercase tracking-wider">Budget Escrowed</span>
                                <span class="text-lg font-bold font-display text-emerald-400">₹${parseFloat(c.budget).toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Milestones Tracker</h4>
                            ${milestonesListHtml}
                        </div>
                    </div>
                `;
            });
        } else {
            contractsHtml = `
                <div class="text-center py-12 glass-panel rounded-2xl text-slate-500">
                    <i data-lucide="file-text" class="h-10 w-10 mx-auto text-slate-600 mb-2"></i>
                    No active contracts or milestone agreements.
                </div>
            `;
        }

        let ledgerHtml = '';
        if (transactions.length > 0) {
            transactions.forEach(t => {
                const isDebit = t.amount < 0;
                ledgerHtml += `
                    <div class="flex items-center justify-between p-3.5 border-b border-slate-800/40 last:border-0 hover:bg-dark-800/10 transition rounded-lg">
                        <div>
                            <span class="text-xs text-slate-300 font-semibold block capitalize">${t.description || t.type.replace('_', ' ')}</span>
                            <span class="text-[10px] text-slate-500 block mt-0.5">${new Date(t.created_at).toLocaleString()}</span>
                        </div>
                        <span class="text-sm font-bold font-display ${isDebit ? 'text-rose-400' : 'text-emerald-400'}">
                            ${isDebit ? '' : '+'}₹${parseFloat(t.amount).toFixed(2)}
                        </span>
                    </div>
                `;
            });
        } else {
            ledgerHtml = `<div class="p-6 text-center text-slate-500 text-xs">No transactions recorded in the account ledger.</div>`;
        }

        return `
            <div class="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="mb-8">
                    <h1 class="text-3xl font-extrabold text-white tracking-tight">Escrow Contracts & Ledger</h1>
                    <p class="text-xs text-slate-400 mt-1">Review active milestone agreements and payment records</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left: Active Contracts and milestones -->
                    <div class="lg:col-span-2 space-y-6">
                        ${contractsHtml}
                    </div>
                    
                    <!-- Right: Ledger Transactions history -->
                    <div class="lg:col-span-1">
                        <div class="glass-panel p-6 rounded-2xl sticky top-20">
                            <h2 class="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800/60 flex items-center gap-2"><i data-lucide="wallet" class="h-4 w-4 text-brand-400"></i> Account Ledger</h2>
                            <div class="space-y-1 max-h-[450px] overflow-y-auto pr-1">
                                ${ledgerHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 8. CHAT / CONVERSATIONS VIEW
    chat: function(conversations = [], activeChatUser = null, messages = [], user) {
        let conversationsListHtml = '';
        if (conversations.length > 0) {
            conversations.forEach(c => {
                const isActive = activeChatUser && (c.id === activeChatUser.id);
                const snipText = c.latestMessage ? c.latestMessage.message_text : 'No messages yet';
                const snipTime = c.latestMessage ? new Date(c.latestMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                
                conversationsListHtml += `
                    <a href="#/chat/${c.id}" class="flex items-center gap-3 p-3.5 rounded-xl border ${isActive ? 'bg-brand-500/10 border-brand-500/30' : 'border-transparent hover:bg-dark-800/40'} transition text-left">
                        <div class="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 capitalize">
                            ${c.name[0]}
                        </div>
                        <div class="flex-grow min-w-0">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-slate-200 block truncate">${c.name}</span>
                                <span class="text-[9px] text-slate-500">${snipTime}</span>
                            </div>
                            <p class="text-[11px] text-slate-500 truncate mt-0.5">${snipText}</p>
                        </div>
                    </a>
                `;
            });
        } else {
            conversationsListHtml = `
                <div class="text-center py-8 text-slate-600 text-xs">
                    No active conversations.
                </div>
            `;
        }

        let chatPaneHtml = '';
        if (activeChatUser) {
            let messagesHtml = '';
            if (messages.length > 0) {
                messages.forEach(m => {
                    const isMe = m.sender_id === user.id;
                    messagesHtml += `
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
            } else {
                messagesHtml = `
                    <div class="text-center py-12 text-slate-600 text-xs">
                        No message logs found. Start the conversation by sending a message below!
                    </div>
                `;
            }

            chatPaneHtml = `
                <div class="flex flex-col h-full">
                    <!-- Chat Header -->
                    <div class="p-4 border-b border-slate-800/80 flex items-center justify-between bg-dark-900/20">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 capitalize">
                                ${activeChatUser.name[0]}
                            </div>
                            <div>
                                <span class="text-xs font-bold text-white block capitalize leading-none">${activeChatUser.name}</span>
                                <span class="text-[9px] text-slate-500 mt-1 block">${activeChatUser.email} (${activeChatUser.role})</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Messages Log -->
                    <div id="messages-log" class="flex-grow p-4 space-y-4 overflow-y-auto max-h-[380px] min-h-[380px]">
                        ${messagesHtml}
                    </div>
                    
                    <!-- Chat Input Form -->
                    <form id="chat-input-form" class="p-4 border-t border-slate-800/80 flex items-center gap-3 bg-dark-900/20">
                        <input type="text" id="chat-message-text" autocomplete="off" placeholder="Write your message here..." class="flex-grow glass-input px-4 py-2.5 rounded-xl text-xs">
                        <button type="submit" class="p-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-white transition shadow-md shadow-brand-500/10">
                            <i data-lucide="send" class="h-4.5 w-4.5"></i>
                        </button>
                    </form>
                </div>
            `;
        } else {
            chatPaneHtml = `
                <div class="flex flex-col items-center justify-center h-full text-slate-500 py-16">
                    <i data-lucide="message-square" class="h-12 w-12 text-slate-700 mb-2"></i>
                    <h3 class="font-bold text-white text-sm">Select a Conversation</h3>
                    <p class="text-[11px] mt-0.5">Pick a user from the left pane to open chat logs.</p>
                </div>
            `;
        }

        return `
            <div class="max-w-6xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="glass-panel rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                    <!-- Left pane: conversations -->
                    <div class="md:col-span-1 border-r border-slate-800/80 bg-dark-900/10 p-4 flex flex-col gap-4">
                        <h2 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><i data-lucide="message-square" class="h-4 w-4 text-brand-400"></i> Active Conversations</h2>
                        <div class="flex-grow overflow-y-auto space-y-1.5 max-h-[430px]">
                            ${conversationsListHtml}
                        </div>
                    </div>
                    
                    <!-- Right pane: Chat interface -->
                    <div class="md:col-span-2">
                        ${chatPaneHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // 9. MODALS & POPUPS
    addFundsModal: function() {
        return `
            <div id="add-funds-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
                <div class="glass-panel-heavy p-6 rounded-2xl w-full max-w-md animate-fade-in">
                    <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                        <h3 class="font-bold text-white text-base">Add Wallet Funds</h3>
                        <button id="close-funds-modal" class="text-slate-400 hover:text-white transition"><i data-lucide="x" class="h-5 w-5"></i></button>
                    </div>
                    
                    <form id="add-funds-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fund Amount (₹)</label>
                            <input type="number" id="fund-amount" required min="5" max="10000" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-semibold" placeholder="Minimum ₹5">
                        </div>
                        
                        <!-- Stripe mockup input -->
                        <div class="space-y-3 bg-dark-900/60 p-4 rounded-xl border border-slate-800">
                            <label class="block text-[10px] font-bold text-brand-400 uppercase tracking-widest leading-none">Stripe Secured Card Details (Mockup)</label>
                            
                            <div class="relative">
                                <input type="text" id="card-number" required class="w-full glass-input px-3.5 py-2 rounded-lg pl-9 text-xs" placeholder="4242 4242 4242 4242">
                                <i data-lucide="credit-card" class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500"></i>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-2">
                                <input type="text" id="card-expiry" required class="w-full glass-input px-2.5 py-2 rounded-lg text-xs" placeholder="MM/YY">
                                <input type="text" id="card-cvc" required class="w-full glass-input px-2.5 py-2 rounded-lg text-xs" placeholder="CVC">
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-brand-500/10 mt-6 flex items-center justify-center gap-2 text-xs">
                            <i data-lucide="check" class="h-4 w-4"></i> Complete Deposit
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    withdrawModal: function(balance) {
        return `
            <div id="withdraw-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
                <div class="glass-panel-heavy p-6 rounded-2xl w-full max-w-md animate-fade-in">
                    <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                        <h3 class="font-bold text-white text-base">Withdraw Earnings</h3>
                        <button id="close-withdraw-modal" class="text-slate-400 hover:text-white transition"><i data-lucide="x" class="h-5 w-5"></i></button>
                    </div>
                    
                    <form id="withdraw-form" class="space-y-4">
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Withdrawal Amount (₹)</label>
                                <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Available: ₹${parseFloat(balance).toFixed(2)}</span>
                            </div>
                            <input type="number" id="withdraw-amount" required min="0.01" step="0.01" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-semibold" placeholder="Enter amount up to ₹${parseFloat(balance).toFixed(2)}">
                        </div>
                        
                        <!-- Bank details input -->
                        <div class="space-y-3 bg-dark-900/60 p-4 rounded-xl border border-slate-800">
                            <label class="block text-[10px] font-bold text-brand-400 uppercase tracking-widest leading-none">Bank Account Details (Mockup)</label>
                            
                            <div>
                                <label class="block text-[10px] text-slate-500 mb-1">Bank Name</label>
                                <input type="text" id="bank-name" required class="w-full glass-input px-3 py-1.5 rounded-lg text-xs" placeholder="e.g. Chase, Bank of America">
                            </div>
                            <div>
                                <label class="block text-[10px] text-slate-500 mb-1">Account Number / IBAN</label>
                                <input type="text" id="bank-iban" required class="w-full glass-input px-3 py-1.5 rounded-lg text-xs" placeholder="e.g. US1234567890">
                            </div>
                        </div>
                        
                        <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-emerald-500/10 mt-6 flex items-center justify-center gap-2 text-xs">
                            <i data-lucide="check" class="h-4 w-4"></i> Process Withdrawal
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    submitDeliverableModal: function(contractId, milestoneId) {
        return `
            <div id="submit-work-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
                <div class="glass-panel-heavy p-6 rounded-2xl w-full max-w-md animate-fade-in">
                    <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                        <h3 class="font-bold text-white text-base">Submit Work Deliverable</h3>
                        <button id="close-work-modal" class="text-slate-400 hover:text-white transition"><i data-lucide="x" class="h-5 w-5"></i></button>
                    </div>
                    
                    <form id="submit-work-form" class="space-y-4" data-contract-id="${contractId}" data-milestone-id="${milestoneId}">
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deliverable URL Link</label>
                            <input type="url" id="deliverable-url" required class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs" placeholder="e.g. GitHub Repository, Figma Link, GDrive URL">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Submission Notes</label>
                            <textarea id="submission-notes" required rows="4" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs" placeholder="Summarize your progress, completed checklist features, and instructions for review..."></textarea>
                        </div>
                        
                        <button type="submit" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-brand-500/10 mt-6 flex items-center justify-center gap-2 text-xs">
                            <i data-lucide="check" class="h-4 w-4"></i> Submit to Employer
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    profile: function(user) {
        const skillsVal = user.skills || '';
        const portfolioVal = user.portfolio || '';
        const bioVal = user.bio || '';
        
        return `
            <div class="max-w-3xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="glass-panel p-6 sm:p-8 rounded-2xl animate-fade-in shadow-xl">
                    <div class="mb-6 pb-4 border-b border-slate-800/80">
                        <h1 class="text-2xl font-extrabold text-white tracking-tight font-display">Profile Settings</h1>
                        <p class="text-xs text-slate-400 mt-1">Manage your professional identity and portfolio listed in the Catalyst pool</p>
                    </div>
                    
                    <form id="profile-settings-form" class="space-y-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                                <input type="text" disabled class="w-full glass-input px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed" value="${user.name}">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input type="email" disabled class="w-full glass-input px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed" value="${user.email}">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Role</label>
                            <span class="inline-flex items-center px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold border border-brand-500/20 capitalize">${user.role}</span>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Professional Bio</label>
                            <textarea id="profile-bio" rows="4" class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="Tell clients or developers about your experience, skills, and values...">${bioVal}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma-separated)</label>
                            <input type="text" id="profile-skills" class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="e.g. React, Node.js, Python, Tailwind" value="${skillsVal}">
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio Website / GitHub Link</label>
                            <input type="url" id="profile-portfolio" class="w-full glass-input px-4 py-3 rounded-xl text-sm" placeholder="e.g. https://github.com/myusername" value="${portfolioVal}">
                        </div>
                        
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                            <a href="#/dashboard" class="bg-dark-800 border border-slate-700 hover:bg-dark-700 text-slate-300 font-semibold px-6 py-3 rounded-xl transition text-sm">
                                Back to Dashboard
                            </a>
                            <button type="submit" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-brand-500/10 text-sm flex items-center gap-2">
                                <i data-lucide="check" class="h-4 w-4"></i> Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    publicProfile: function(targetUser, reviews = [], currentUser = null) {
        const skillsArray = targetUser.skills ? targetUser.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
        const skillsHtml = skillsArray.map(s => `<span class="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs px-3 py-1 rounded-full font-medium">${s}</span>`).join(' ');
        
        let reviewsListHtml = '';
        let avgRatingHtml = 'N/A';
        let ratingStarsHtml = '';
        
        if (reviews.length > 0) {
            let totalRating = 0;
            reviews.forEach(r => {
                totalRating += r.rating;
                
                let stars = '';
                for (let i = 1; i <= 5; i++) {
                    stars += `<i data-lucide="star" class="h-3.5 w-3.5 ${i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}"></i>`;
                }
                
                reviewsListHtml += `
                    <div class="p-4 bg-dark-900/40 border border-slate-800/80 rounded-xl space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-200">${r.reviewer_name}</span>
                            <span class="text-[10px] text-slate-500">${new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="flex items-center gap-1">${stars}</div>
                        <p class="text-xs text-slate-400 italic">"${r.comment || 'No comment left.'}"</p>
                        <span class="text-[9px] text-slate-500 block">Project: ${r.project_title}</span>
                    </div>
                `;
            });
            
            const avg = totalRating / reviews.length;
            avgRatingHtml = `${avg.toFixed(1)} / 5.0`;
            
            for (let i = 1; i <= 5; i++) {
                ratingStarsHtml += `<i data-lucide="star" class="h-5 w-5 ${i <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}"></i>`;
            }
        } else {
            reviewsListHtml = `<div class="p-6 text-center text-slate-500 text-xs">No reviews received yet.</div>`;
            ratingStarsHtml = `<div class="text-xs text-slate-500">Unrated</div>`;
        }
        
        const chatButtonHtml = (currentUser && currentUser.id !== targetUser.id) ? `
            <a href="#/chat/${targetUser.id}" class="mt-4 w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl transition shadow-md shadow-brand-500/10 text-center flex items-center justify-center gap-2 text-xs">
                <i data-lucide="message-square" class="h-4 w-4"></i> Send Message
            </a>
        ` : '';

        return `
            <div class="max-w-5xl mx-auto px-4 py-12 flex-grow w-full">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Sidebar: Profile Details -->
                    <div class="lg:col-span-1 space-y-6">
                        <div class="glass-panel p-6 rounded-2xl text-center flex flex-col items-center">
                            <div class="h-20 w-20 rounded-full bg-slate-800 border-2 border-brand-500/40 flex items-center justify-center text-2xl font-bold text-slate-200 capitalize mb-4">
                                ${targetUser.name[0]}
                            </div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-1.5 capitalize">
                                ${targetUser.name}
                                ${targetUser.is_verified ? `<i data-lucide="check-circle-2" class="h-4 w-4 text-emerald-400" title="Verified Member"></i>` : ''}
                            </h2>
                            <span class="text-xs text-slate-400 uppercase tracking-widest mt-1 font-semibold block capitalize">${targetUser.role}</span>
                            
                            <div class="mt-4 pt-4 border-t border-slate-800/80 w-full">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-slate-500">Rating</span>
                                    <span class="font-bold text-amber-400 flex items-center gap-1">
                                        <i data-lucide="star" class="h-3.5 w-3.5 fill-amber-400 text-amber-400"></i> ${avgRatingHtml}
                                    </span>
                                </div>
                                ${targetUser.portfolio ? `
                                    <div class="flex items-center justify-between text-xs mt-2">
                                        <span class="text-slate-500">Portfolio</span>
                                        <a href="${targetUser.portfolio}" target="_blank" class="font-semibold text-brand-400 hover:underline truncate max-w-[150px]">${targetUser.portfolio.replace(/^https?:\/\//, '')}</a>
                                    </div>
                                ` : ''}
                            </div>
                            
                            ${chatButtonHtml}
                        </div>
                    </div>
                    
                    <!-- Right content: Bio, Skills and Reviews -->
                    <div class="lg:col-span-2 space-y-6">
                        <div class="glass-panel p-6 rounded-2xl">
                            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About ${targetUser.name}</h3>
                            <p class="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">${targetUser.bio || 'No bio listed yet.'}</p>
                        </div>
                        
                        ${targetUser.role === 'freelancer' ? `
                            <div class="glass-panel p-6 rounded-2xl">
                                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Core Skillsets</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${skillsHtml || '<span class="text-xs text-slate-500">No skills specified.</span>'}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="glass-panel p-6 rounded-2xl">
                            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                                <i data-lucide="star" class="h-4.5 w-4.5 text-amber-400"></i> Reviews & Ratings (${reviews.length})
                            </h3>
                            
                            <div class="space-y-4">
                                ${reviewsListHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    reviewForm: function(contract, reviewee) {
        return `
            <div class="max-w-md mx-auto px-4 py-12 flex-grow w-full">
                <div class="glass-panel p-6 sm:p-8 rounded-2xl animate-fade-in shadow-xl">
                    <div class="text-center mb-6 border-b border-slate-800/80 pb-4">
                        <div class="bg-gradient-brand p-3 rounded-2xl text-white inline-block shadow-lg shadow-brand-500/20 mb-4">
                            <i data-lucide="star" class="h-8 w-8 text-amber-400 fill-amber-400"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-white font-display">Leave Feedback</h2>
                        <p class="text-slate-400 text-sm mt-1">Review your collaboration on <strong>${contract.project_title}</strong> with <strong>${reviewee.name}</strong></p>
                    </div>
                    
                    <form id="review-submission-form" class="space-y-6">
                        <div class="text-center">
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Overall Rating</label>
                            <div class="star-rating">
                                <input type="radio" id="star5" name="rating" value="5" required /><label for="star5" title="5 stars"><i data-lucide="star" class="h-8 w-8"></i></label>
                                <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 stars"><i data-lucide="star" class="h-8 w-8"></i></label>
                                <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 stars"><i data-lucide="star" class="h-8 w-8"></i></label>
                                <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 stars"><i data-lucide="star" class="h-8 w-8"></i></label>
                                <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 star"><i data-lucide="star" class="h-8 w-8"></i></label>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Written Comment</label>
                            <textarea id="review-comment" required rows="4" class="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs" placeholder="Describe your experience working with them..."></textarea>
                        </div>
                        
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                            <a href="#/contracts" class="bg-dark-800 border border-slate-700 hover:bg-dark-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition text-xs flex items-center">
                                Cancel
                            </a>
                            <button type="submit" class="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-500/10 text-xs flex items-center gap-2">
                                <i data-lucide="check" class="h-4 w-4"></i> Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // 10. 404 & ERROR VIEWS
    error: function(title, message) {
        return `
            <div class="flex-grow flex items-center justify-center py-20 px-4">
                <div class="text-center max-w-md glass-panel p-8 rounded-2xl border border-slate-800/80 animate-fade-in">
                    <div class="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
                        <i data-lucide="alert-triangle" class="h-6 w-6"></i>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-2">${title}</h2>
                    <p class="text-xs text-slate-400 leading-relaxed mb-6">${message}</p>
                    <a href="#/" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-500/10">
                        <i data-lucide="home" class="h-4 w-4"></i> Back to Safety
                    </a>
                </div>
            </div>
        `;
    }
};
