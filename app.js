// ===============================================
// SULO FITNESS v2.0 - APLICACIÓN COMPLETA RENOVADA
// Enfoque moderno: macronutrientes + planificación inteligente
// ===============================================

// ===== SISTEMA PRINCIPAL =====
class SuloFitnessApp {
    constructor() {
        this.storage = new StorageManager();
        this.theme = new ThemeManager();
        this.notifications = new NotificationManager(this.theme);
        this.router = new RouterManager();
        this.user = new UserManager(this.storage);
        this.nutritionAPI = new NutritionAPIService();
        
        this.modules = new Map();
        this.workoutModule = null;
        this.nutritionModule = null;
        this.initialized = false;
        
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        console.log('Inicializando Sulo Fitness v2.0...');
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        await this.registerServiceWorker();
        this.loadFonts();
        this.theme.applyTheme();
        await this.initializeModules();
        this.setupEventListeners();
        this.setupRoutes();
        this.showMainInterface();
        
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) loadingScreen.style.display = 'none';
            document.body.classList.add('app-loaded');
        }, 1000);
        
        this.initialized = true;
        console.log('App v2.0 inicializada correctamente');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('✅ Service Worker registrado:', registration);
            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
            }
        }
    }

    loadFonts() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        const style = document.createElement('style');
        style.textContent = this.getCSSStyles();
        document.head.appendChild(style);
    }

    getCSSStyles() {
        return `
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
            
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInRight { from { transform: translateX(300px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(300px); opacity: 0; } }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            
            .app-loaded #loading-screen { display: none !important; }
            
            .macro-card {
                background: var(--card-bg); 
                border-radius: 16px; 
                padding: 20px; 
                margin: 12px 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            
            .macro-card.target-met { border-color: #10b981; }
            .macro-card.target-over { border-color: #ef4444; }
            .macro-card.target-under { border-color: #f59e0b; }
            
            .meal-card {
                background: var(--card-bg);
                border-radius: 12px;
                padding: 20px;
                margin: 16px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-left: 4px solid var(--accent-color);
            }
            
            .exercise-card {
                background: var(--card-bg);
                border-radius: 12px;
                padding: 24px;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                border-left: 4px solid var(--primary-color);
            }
            
            .btn-primary {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
            
            .btn-secondary {
                background: var(--secondary-color);
                color: var(--text-dark);
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.3s ease;
            }
            
            .btn-warning {
                background: #f59e0b;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.3s ease;
            }
            
            .btn-success {
                background: #10b981;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.3s ease;
            }
            
            .input-modern {
                border: 2px solid var(--border-color);
                border-radius: 10px;
                padding: 12px 16px;
                font-size: 15px;
                background: var(--input-bg);
                color: var(--text-primary);
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
            }
            
            .input-modern:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .autocomplete-container { position: relative; width: 100%; }
            
            .autocomplete-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--card-bg);
                border: 2px solid var(--border-color);
                border-top: none;
                border-radius: 0 0 10px 10px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .autocomplete-suggestion {
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
                transition: background-color 0.2s ease;
            }
            
            .autocomplete-suggestion:hover,
            .autocomplete-suggestion.highlighted {
                background: var(--hover-bg);
            }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
            .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
            
            @media (max-width: 768px) {
                .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; gap: 16px; }
                .macro-card { padding: 16px; }
                .meal-card { padding: 16px; }
                .exercise-card { padding: 20px; }
            }
        `;
    }

    async initializeModules() {
        const preferences = this.user.getPreferences();
        
        if (preferences.workoutEnabled) {
            this.workoutModule = new WorkoutModule(this);
            this.modules.set('workout', this.workoutModule);
            await this.workoutModule.init();
        }
        
        if (preferences.nutritionEnabled) {
            this.nutritionModule = new NutritionModule(this);
            this.modules.set('nutrition', this.nutritionModule);
            await this.nutritionModule.init();
        }
    }

    setupEventListeners() {
        window.addEventListener('preferences-updated', (event) => {
            this.onPreferencesUpdated(event.detail);
        });
        
        window.addEventListener('theme-changed', (event) => {
            this.onThemeChanged(event.detail);
        });
    }

    setupRoutes() {
        this.router.register('inicio', () => this.showWelcomeView());
        this.router.register('diaria', () => this.showDailyView());
        this.router.register('semanal', () => this.showWeeklyView());
        this.router.register('mensual', () => this.showMonthlyView());
        this.router.register('configuracion', () => this.showConfigView());
    }

    onPreferencesUpdated(preferences) {
        this.reinitializeModules();
    }

    onThemeChanged(colors) {
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        document.documentElement.style.setProperty('--accent-color', colors.accent);
        document.documentElement.style.setProperty('--card-bg', colors.background);
        document.documentElement.style.setProperty('--text-primary', colors.text);
        document.documentElement.style.setProperty('--text-dark', colors.textDark);
        document.documentElement.style.setProperty('--text-secondary', colors.textSecondary);
        document.documentElement.style.setProperty('--border-color', colors.border);
        document.documentElement.style.setProperty('--input-bg', colors.background);
        document.documentElement.style.setProperty('--hover-bg', colors.secondary + '40');
    }

    async reinitializeModules() {
        const preferences = this.user.getPreferences();
        
        if (preferences.workoutEnabled && !this.workoutModule) {
            this.workoutModule = new WorkoutModule(this);
            this.modules.set('workout', this.workoutModule);
            await this.workoutModule.init();
        } else if (!preferences.workoutEnabled && this.workoutModule) {
            this.modules.delete('workout');
            this.workoutModule = null;
        }
        
        if (preferences.nutritionEnabled && !this.nutritionModule) {
            this.nutritionModule = new NutritionModule(this);
            this.modules.set('nutrition', this.nutritionModule);
            await this.nutritionModule.init();
        } else if (!preferences.nutritionEnabled && this.nutritionModule) {
            this.modules.delete('nutrition');
            this.nutritionModule = null;
        }
    }

    navigate(route, params = {}) {
        this.router.navigate(route, params);
    }

    showMainInterface() {
        const colors = this.theme.getColors();
        this.onThemeChanged(colors);
        
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = this.getMainInterfaceHTML(colors);
        }
        
        document.body.style.backgroundColor = colors.primary;
        document.body.style.color = colors.text;
        
        if (!this.router.getCurrentRoute() || this.router.getCurrentRoute() === '') {
            setTimeout(() => this.navigate('inicio'), 100);
        }
    }

    getMainInterfaceHTML(colors) {
        return `
            <header style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; padding: 24px 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <h1 style="margin: 0; font-size: 2.5em; font-weight: 800; letter-spacing: -1px; color: white; font-family: 'Poppins', sans-serif;">💪 SULO FITNESS</h1>
                <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-weight: 500; font-size: 1.05em;">Tu asistente inteligente de fitness y nutrición</p>
            </header>
            
            <nav style="background: ${colors.background}; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-bottom: 1px solid ${colors.border};">
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; max-width: 800px; margin: 0 auto;">
                    <button onclick="app.navigate('inicio')" id="btn-inicio" class="nav-btn" style="background: ${colors.accent}; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 100px; transition: all 0.3s ease;">🏠 INICIO</button>
                    <button onclick="app.navigate('diaria')" id="btn-diaria" class="nav-btn" style="background: ${colors.accent}; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 100px; transition: all 0.3s ease;">📅 DIARIA</button>
                    <button onclick="app.navigate('semanal')" id="btn-semanal" class="nav-btn" style="background: ${colors.accent}; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 100px; transition: all 0.3s ease;">📊 SEMANAL</button>
                    <button onclick="app.navigate('mensual')" id="btn-mensual" class="nav-btn" style="background: ${colors.accent}; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 100px; transition: all 0.3s ease;">📆 MENSUAL</button>
                    <button onclick="app.navigate('configuracion')" id="btn-config" class="nav-btn" style="background: ${colors.accent}; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; min-width: 100px; transition: all 0.3s ease;">⚙️ CONFIG</button>
                </div>
            </nav>
            
            <main id="main-content" style="padding: 32px 20px; background: ${colors.primary}; color: ${colors.text}; min-height: calc(100vh - 200px); max-width: 1200px; margin: 0 auto; line-height: 1.6;"></main>
        `;
    }

    showWelcomeView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const colors = this.theme.getColors();
        const profile = this.user.getProfile();
        const preferences = this.user.getPreferences();
        
        this.updateActiveButton('inicio');

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out; max-width: 1000px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="color: ${colors.text}; font-size: 2.5em; margin-bottom: 16px; font-weight: 700; font-family: 'Poppins', sans-serif;">¡Hola ${profile.nombre}! 👋</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin: 0; font-weight: 500;">Tu nueva experiencia de fitness inteligente</p>
                </div>
                
                <div class="macro-card" style="background: linear-gradient(135deg, ${colors.background} 0%, ${colors.secondary}40 100%); text-align: center; margin-bottom: 40px;">
                    <h3 style="color: ${colors.textDark}; font-size: 1.8em; margin-bottom: 16px; font-weight: 700; font-family: 'Poppins', sans-serif;">🚀 Nueva Experiencia v2.0</h3>
                    <p style="color: ${colors.textDark}; font-size: 1.1em; margin-bottom: 20px; opacity: 0.9;">Seguimiento inteligente de macronutrientes y planificación automática</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                        <span style="background: #10b98130; color: #059669; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; font-weight: 700; border: 2px solid #10b981;">📊 MACROS INTELIGENTES</span>
                        <span style="background: #3b82f630; color: #2563eb; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; font-weight: 700; border: 2px solid #3b82f6;">🎯 PLANIFICACIÓN AUTO</span>
                        <span style="background: #f59e0b30; color: #d97706; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; font-weight: 700; border: 2px solid #f59e0b;">📱 PWA READY</span>
                    </div>
                </div>

                <div class="grid-2">
                    ${preferences.nutritionEnabled ? `
                        <div class="macro-card" style="cursor: pointer; transition: transform 0.3s ease;" onclick="app.navigate('diaria')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; margin-right: 16px;">🍽️</div>
                                <div>
                                    <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.4em; font-weight: 700;">Nutrición Inteligente</h3>
                                    <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.95em;">Macronutrientes en tiempo real</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${preferences.workoutEnabled ? `
                        <div class="macro-card" style="cursor: pointer; transition: transform 0.3s ease;" onclick="app.navigate('diaria')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; margin-right: 16px;">💪</div>
                                <div>
                                    <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.4em; font-weight: 700;">Entrenamiento Avanzado</h3>
                                    <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.95em;">Planificación automática</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="app.navigate('diaria')" class="btn-primary" style="font-size: 18px; padding: 16px 32px; margin: 8px; animation: pulse 2s infinite;">
                        📅 Comenzar Hoy
                    </button>
                    <button onclick="app.theme.toggleTheme(); app.showMainInterface(); app.showWelcomeView();" class="btn-secondary" style="font-size: 16px; padding: 12px 24px; margin: 8px;">
                        ${this.theme.currentTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
                    </button>
                </div>
            </div>
        `;
    }

    showDailyView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const colors = this.theme.getColors();
        const preferences = this.user.getPreferences();
        
        this.updateActiveButton('diaria');

        if (preferences.nutritionEnabled && preferences.workoutEnabled) {
            this.showCombinedDailyView(container, colors);
        } else if (preferences.nutritionEnabled) {
            this.nutritionModule.showDailyView();
        } else if (preferences.workoutEnabled) {
            this.workoutModule.showDailyView();
        } else {
            this.showEmptyDailyView(container, colors);
        }
    }

    showCombinedDailyView(container, colors) {
        const today = new Date();
        const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
        const dayNumber = today.getDate();
        const monthName = today.toLocaleDateString('es-ES', { month: 'long' });

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="color: ${colors.text}; font-size: 2.2em; margin-bottom: 8px; font-weight: 700; font-family: 'Poppins', sans-serif; text-transform: capitalize;">${dayName}, ${dayNumber} de ${monthName}</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Tu plan personalizado para hoy</p>
                </div>
                
                <div class="grid-2">
                    <div class="macro-card" style="cursor: pointer;" onclick="app.nutritionModule.showDailyView()">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-size: 1.5em; font-weight: 700;">🍽️ Nutrición</h3>
                            <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8em; font-weight: 700;">ACTIVO</span>
                        </div>
                        <p style="color: ${colors.textSecondary}; margin-bottom: 20px;">Seguimiento de macronutrientes</p>
                        <button class="btn-primary" style="width: 100%;">Ver Nutrición Diaria</button>
                    </div>
                    
                    <div class="macro-card" style="cursor: pointer;" onclick="app.workoutModule.showDailyView()">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-size: 1.5em; font-weight: 700;">💪 Entrenamiento</h3>
                            <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8em; font-weight: 700;">ACTIVO</span>
                        </div>
                        <p style="color: ${colors.textSecondary}; margin-bottom: 20px;">Plan de ejercicios personalizado</p>
                        <button class="btn-primary" style="width: 100%;">Ver Entrenamiento</button>
                    </div>
                </div>
            </div>
        `;
    }

    showEmptyDailyView(container, colors) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <div class="macro-card">
                    <h2 style="color: ${colors.textSecondary}; font-family: 'Poppins', sans-serif; font-size: 2.2em; margin-bottom: 20px;">⚠️ No hay módulos activos</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 32px;">Habilita al menos un módulo desde configuración</p>
                    <button onclick="app.navigate('configuracion')" class="btn-primary">IR A CONFIGURACIÓN</button>
                </div>
            </div>
        `;
    }

    showWeeklyView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const preferences = this.user.getPreferences();
        this.updateActiveButton('semanal');

        if (preferences.workoutEnabled) {
            this.workoutModule.showWeeklyView();
        } else if (preferences.nutritionEnabled) {
            this.nutritionModule.showWeeklyView();
        } else {
            this.showEmptyView(container, 'semanal');
        }
    }

    showMonthlyView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const preferences = this.user.getPreferences();
        this.updateActiveButton('mensual');

        if (preferences.workoutEnabled) {
            this.workoutModule.showMonthlyView();
        } else if (preferences.nutritionEnabled) {
            this.nutritionModule.showMonthlyView();
        } else {
            this.showEmptyView(container, 'mensual');
        }
    }

    showEmptyView(container, viewType) {
        const colors = this.theme.getColors();
        const viewNames = { semanal: 'Semanal', mensual: 'Mensual' };
        
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <div class="macro-card">
                    <h2 style="color: ${colors.textSecondary}; font-family: 'Poppins', sans-serif; font-size: 2.2em; margin-bottom: 20px;">⚠️ No hay módulos activos</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 32px;">Habilita al menos un módulo para ver la vista ${viewNames[viewType].toLowerCase()}</p>
                    <button onclick="app.navigate('configuracion')" class="btn-primary">IR A CONFIGURACIÓN</button>
                </div>
            </div>
        `;
    }

    showConfigView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const colors = this.theme.getColors();
        const preferences = this.user.getPreferences();
        
        this.updateActiveButton('configuracion');

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="color: ${colors.text}; font-size: 2.2em; margin-bottom: 8px; font-weight: 700; font-family: 'Poppins', sans-serif;">⚙️ Configuración</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Personaliza tu experiencia</p>
                </div>
                
                <div class="macro-card">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Poppins', sans-serif; font-size: 1.5em; font-weight: 700;">🎨 Apariencia</h3>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                        <button onclick="app.setTheme('dark')" class="btn-secondary" style="background: ${this.theme.currentTheme === 'dark' ? colors.accent : colors.textSecondary}; color: white; padding: 16px 24px;">🌙 Tema Oscuro</button>
                        <button onclick="app.setTheme('light')" class="btn-secondary" style="background: ${this.theme.currentTheme === 'light' ? colors.accent : colors.textSecondary}; color: ${this.theme.currentTheme === 'light' ? 'white' : colors.textDark}; padding: 16px 24px;">☀️ Tema Claro</button>
                    </div>
                </div>
                
                <div class="macro-card">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Poppins', sans-serif; font-size: 1.5em; font-weight: 700;">📋 Módulos</h3>
                    <div class="grid-2">
                        <div style="text-align: center;">
                            <div style="margin-bottom: 16px;">
                                <div style="background: ${preferences.nutritionEnabled ? '#10b981' : '#6b7280'}; color: white; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2em; margin: 0 auto 12px;">🍽️</div>
                                <h4 style="margin: 0 0 8px 0; color: ${colors.textDark}; font-weight: 700;">Nutrición</h4>
                                <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 0.9em;">Seguimiento de macronutrientes</p>
                            </div>
                            <button onclick="app.toggleModule('nutrition')" class="btn-secondary" style="background: ${preferences.nutritionEnabled ? '#10b981' : '#6b7280'}; color: white; font-weight: 700;">
                                ${preferences.nutritionEnabled ? 'ACTIVADO' : 'DESACTIVADO'}
                            </button>
                        </div>
                        
                        <div style="text-align: center;">
                            <div style="margin-bottom: 16px;">
                                <div style="background: ${preferences.workoutEnabled ? '#3b82f6' : '#6b7280'}; color: white; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2em; margin: 0 auto 12px;">💪</div>
                                <h4 style="margin: 0 0 8px 0; color: ${colors.textDark}; font-weight: 700;">Entrenamiento</h4>
                                <p style="margin: 0 0 16px 0; color: ${colors.textSecondary}; font-size: 0.9em;">Planificación de ejercicios</p>
                            </div>
                            <button onclick="app.toggleModule('workout')" class="btn-secondary" style="background: ${preferences.workoutEnabled ? '#3b82f6' : '#6b7280'}; color: white; font-weight: 700;">
                                ${preferences.workoutEnabled ? 'ACTIVADO' : 'DESACTIVADO'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                    <button onclick="app.navigate('inicio')" class="btn-primary">Volver al Inicio</button>
                </div>
            </div>
        `;
    }

    setTheme(theme) {
        this.theme.setTheme(theme);
        this.showMainInterface();
        this.showConfigView();
    }

    toggleModule(moduleName) {
        const preferences = this.user.getPreferences();
        const newPreferences = { ...preferences };
        newPreferences[moduleName + 'Enabled'] = !preferences[moduleName + 'Enabled'];
        
        this.user.updatePreferences(newPreferences);
        this.notifications.show(`Módulo ${moduleName} ${newPreferences[moduleName + 'Enabled'] ? 'activado' : 'desactivado'}`, 'info');
        
        this.reinitializeModules().then(() => {
            this.showConfigView();
        });
    }

    updateActiveButton(activeView) {
        const buttons = document.querySelectorAll('.nav-btn');
        const colors = this.theme.getColors();
        
        buttons.forEach(btn => {
            if (btn) {
                btn.style.background = colors.accent;
                btn.style.opacity = '0.7';
                btn.style.transform = 'none';
                btn.style.boxShadow = 'none';
            }
        });
        
        const activeButton = document.getElementById('btn-' + activeView);
        if (activeButton) {
            activeButton.style.background = colors.secondary;
            activeButton.style.opacity = '1';
            activeButton.style.transform = 'translateY(-2px)';
            activeButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
    }
}

// ===== MÓDULO DE NUTRICIÓN RENOVADO =====
class NutritionModule extends BaseModule {
    constructor(app) {
        super('nutrition', app);
        this.dailyIntake = {};
        this.meals = [];
    }

    async onInit() {
        this.loadData();
    }

    registerRoutes() {
        this.app.router.register('nutrition-daily', () => this.showDailyView());
        this.app.router.register('nutrition-weekly', () => this.showWeeklyView());
        this.app.router.register('nutrition-monthly', () => this.showMonthlyView());
    }

    loadData() {
        const today = this.getTodayKey();
        this.dailyIntake = this.app.storage.get('daily_intake_' + today, {
            meals: [
                { id: 'desayuno', name: 'Desayuno', foods: [], macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
                { id: 'almuerzo', name: 'Almuerzo', foods: [], macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
                { id: 'comida', name: 'Comida', foods: [], macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
                { id: 'cena', name: 'Cena', foods: [], macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
            ],
            totalMacros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        });
        this.meals = this.dailyIntake.meals;
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    showDailyView() {
        const container = document.getElementById('main-content');
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }

        const colors = this.app.theme.getColors();
        const targets = this.app.user.getNutritionTargets();
        const current = this.dailyIntake.totalMacros;

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                    <div>
                        <h2 style="color: ${colors.text}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">🍽️ Nutrición Diaria</h2>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                </div>

                ${this.generateMacroSummaryHTML(targets, current, colors)}
                ${this.generateMealsHTML(colors)}
                
                <div style="text-align: center; margin-top: 32px;">
                    <button onclick="app.nutritionModule.addMeal()" class="btn-secondary" style="margin-right: 12px;">+ Añadir Comida</button>
                    <button onclick="app.nutritionModule.saveDay()" class="btn-primary">💾 Guardar Día</button>
                </div>
            </div>
        `;

        this.setupFoodInputs();
    }

    generateMacroSummaryHTML(targets, current, colors) {
        return `
            <div class="macro-card" style="margin-bottom: 32px;">
                <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Poppins', sans-serif; font-size: 1.5em; font-weight: 700; text-align: center;">📊 Objetivos vs Consumo</h3>
                <div class="grid-4">
                    ${this.generateMacroCardHTML('Calorías', 'KCAL', targets.calories, current.calories, colors)}
                    ${this.generateMacroCardHTML('Proteína', 'G', targets.protein, current.protein, colors)}
                    ${this.generateMacroCardHTML('Carbohidratos', 'G', targets.carbs, current.carbs, colors)}
                    ${this.generateMacroCardHTML('Grasa', 'G', targets.fat, current.fat, colors)}
                </div>
            </div>
        `;
    }

    generateMacroCardHTML(name, unit, target, current, colors) {
        const percentage = target > 0 ? (current / target) * 100 : 0;
        let statusColor = colors.textSecondary;
        let borderColor = colors.border;
        
        if (percentage >= 90 && percentage <= 110) {
            statusColor = '#10b981'; // Verde - Objetivo cumplido
            borderColor = '#10b981';
        } else if (percentage < 80 || percentage > 120) {
            statusColor = '#ef4444'; // Rojo - Muy fuera del objetivo
            borderColor = '#ef4444';
        } else {
            statusColor = '#f59e0b'; // Amarillo - Cerca del objetivo
            borderColor = '#f59e0b';
        }

        return `
            <div style="background: ${colors.primary}; border: 3px solid ${borderColor}; border-radius: 16px; padding: 20px; text-align: center; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="font-size: 2em; font-weight: 800; color: ${statusColor}; font-family: 'Poppins', sans-serif;">${Math.round(current)}</div>
                    <div style="text-align: right;">
                        <div style="color: ${colors.textSecondary}; font-size: 0.8em; font-weight: 600;">META</div>
                        <div style="color: ${colors.text}; font-size: 1.2em; font-weight: 700;">${target}</div>
                    </div>
                </div>
                <div style="color: ${colors.textSecondary}; font-size: 0.9em; font-weight: 600; margin-bottom: 12px; text-transform: uppercase;">${name} (${unit})</div>
                <div style="background: ${colors.background}; border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="background: ${statusColor}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.5s ease; border-radius: 10px;"></div>
                </div>
                <div style="color: ${statusColor}; font-size: 0.75em; font-weight: 700; margin-top: 8px;">${Math.round(percentage)}%</div>
            </div>
        `;
    }

    generateMealsHTML(colors) {
        return this.meals.map(meal => `
            <div class="meal-card" id="meal-${meal.id}">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <h4 style="color: ${colors.textDark}; margin: 0; font-size: 1.4em; font-weight: 700; font-family: 'Poppins', sans-serif;">${meal.name}</h4>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="app.nutritionModule.addFoodToMeal('${meal.id}')" class="btn-secondary" style="padding: 8px 16px; font-size: 0.9em;">+ Alimento</button>
                        ${meal.id !== 'desayuno' ? `<button onclick="app.nutritionModule.deleteMeal('${meal.id}')" class="btn-danger" style="padding: 8px 16px; font-size: 0.9em;">🗑️</button>` : ''}
                    </div>
                </div>
                
                <div id="foods-${meal.id}" style="margin-bottom: 20px;">
                    ${meal.foods.map((food, index) => `
                        <div class="food-item" style="background: ${colors.primary}; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 2px solid ${colors.border};">
                            <div class="grid-3" style="margin-bottom: 16px; gap: 16px;">
                                <div class="autocomplete-container">
                                    <input type="text" value="${food.name || ''}" placeholder="Buscar alimento..." class="input-modern food-name" data-meal="${meal.id}" data-index="${index}" style="width: 100%;">
                                    <div class="autocomplete-suggestions" style="display: none;"></div>
                                </div>
                                <input type="number" value="${food.quantity || ''}" placeholder="Cantidad (g)" class="input-modern food-quantity" data-meal="${meal.id}" data-index="${index}" style="width: 100%; text-align: center;">
                                <button onclick="app.nutritionModule.removeFoodFromMeal('${meal.id}', ${index})" class="btn-danger" style="width: 100%; padding: 12px;">Eliminar</button>
                            </div>
                            <div class="grid-4" style="font-size: 0.9em; text-align: center; background: ${colors.secondary}; padding: 12px; border-radius: 8px;">
                                <div>
                                    <div style="font-weight: 700; color: ${colors.textDark}; font-size: 1.1em;">${Math.round(food.calories || 0)}</div>
                                    <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.7;">KCAL</div>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: ${colors.textDark}; font-size: 1.1em;">${Math.round(food.protein || 0)}</div>
                                    <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.7;">PROT</div>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: ${colors.textDark}; font-size: 1.1em;">${Math.round(food.carbs || 0)}</div>
                                    <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.7;">CARB</div>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: ${colors.textDark}; font-size: 1.1em;">${Math.round(food.fat || 0)}</div>
                                    <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.7;">GRASA</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${meal.foods.length === 0 ? `<p style="color: ${colors.textSecondary}; text-align: center; font-style: italic; margin: 20px 0;">No hay alimentos agregados</p>` : ''}
                </div>
                
                <div class="grid-4" style="background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent}20 100%); border-radius: 12px; padding: 16px; font-size: 1em; text-align: center; border: 2px solid ${colors.accent}40;">
                    <div>
                        <div style="font-weight: 800; font-size: 1.3em; color: ${colors.textDark};">${Math.round(meal.macros.calories)}</div>
                        <div style="font-size: 0.8em; opacity: 0.8; color: ${colors.textDark}; font-weight: 600;">KCAL TOTAL</div>
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 1.3em; color: ${colors.textDark};">${Math.round(meal.macros.protein)}</div>
                        <div style="font-size: 0.8em; opacity: 0.8; color: ${colors.textDark}; font-weight: 600;">PROT TOTAL</div>
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 1.3em; color: ${colors.textDark};">${Math.round(meal.macros.carbs)}</div>
                        <div style="font-size: 0.8em; opacity: 0.8; color: ${colors.textDark}; font-weight: 600;">CARB TOTAL</div>
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 1.3em; color: ${colors.textDark};">${Math.round(meal.macros.fat)}</div>
                        <div style="font-size: 0.8em; opacity: 0.8; color: ${colors.textDark}; font-weight: 600;">GRASA TOTAL</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupFoodInputs() {
        // Configurar autocompletado para nombres de alimentos
        document.querySelectorAll('.food-name').forEach(input => {
            input.addEventListener('input', (e) => this.handleFoodNameChange(e));
        });

        // Configurar cambios de cantidad
        document.querySelectorAll('.food-quantity').forEach(input => {
            input.addEventListener('input', (e) => this.handleQuantityChange(e));
        });
    }

    async handleFoodNameChange(event) {
        const input = event.target;
        const query = input.value.trim();
        
        if (query.length >= 2) {
            const suggestions = await this.app.nutritionAPI.searchFood(query);
            this.showSuggestions(input, suggestions);
        } else {
            this.hideSuggestions(input);
        }
    }

    showSuggestions(input, suggestions) {
        const container = input.parentElement.querySelector('.autocomplete-suggestions');
        
        if (suggestions.length > 0) {
            container.innerHTML = suggestions.map(food => `
                <div class="autocomplete-suggestion" onclick="app.nutritionModule.selectFood(this, '${input.dataset.meal}', ${input.dataset.index})" data-food='${JSON.stringify(food)}'>
                    <div style="font-weight: 600; color: var(--text-dark);">${food.name}</div>
                    <div style="font-size: 0.85em; opacity: 0.7; color: var(--text-secondary);">${food.calories} kcal • ${food.protein}g prot • ${food.carbs}g carb • ${food.fat}g grasa</div>
                </div>
            `).join('');
            container.style.display = 'block';
        } else {
            this.hideSuggestions(input);
        }
    }

    hideSuggestions(input) {
        const container = input.parentElement.querySelector('.autocomplete-suggestions');
        if (container) container.style.display = 'none';
    }

    selectFood(element, mealId, foodIndex) {
        const foodData = JSON.parse(element.dataset.food);
        const meal = this.meals.find(m => m.id === mealId);
        
        if (meal && meal.foods[foodIndex]) {
            // Actualizar datos del alimento
            meal.foods[foodIndex] = {
                ...meal.foods[foodIndex],
                name: foodData.name,
                baseCalories: foodData.calories,
                baseProtein: foodData.protein,
                baseCarbs: foodData.carbs,
                baseFat: foodData.fat
            };
            
            // Recalcular con la cantidad actual
            const quantity = meal.foods[foodIndex].quantity || 100;
            this.updateFoodMacros(meal.foods[foodIndex], quantity);
            
            this.updateMealMacros(mealId);
            this.updateTotalMacros();
            this.refreshMacroDisplay();
        }
        
        // Actualizar input y ocultar sugerencias
        const input = element.parentElement.parentElement.querySelector('.food-name');
        input.value = foodData.name;
        this.hideSuggestions(input);
    }

    handleQuantityChange(event) {
        const input = event.target;
        const mealId = input.dataset.meal;
        const foodIndex = parseInt(input.dataset.index);
        const quantity = parseFloat(input.value) || 0;
        
        const meal = this.meals.find(m => m.id === mealId);
        if (meal && meal.foods[foodIndex]) {
            meal.foods[foodIndex].quantity = quantity;
            this.updateFoodMacros(meal.foods[foodIndex], quantity);
            
            this.updateMealMacros(mealId);
            this.updateTotalMacros();
            this.refreshMacroDisplay();
        }
    }

    updateFoodMacros(food, quantity) {
        const multiplier = quantity / 100; // Por cada 100g
        food.calories = (food.baseCalories || 0) * multiplier;
        food.protein = (food.baseProtein || 0) * multiplier;
        food.carbs = (food.baseCarbs || 0) * multiplier;
        food.fat = (food.baseFat || 0) * multiplier;
    }

    addFoodToMeal(mealId) {
        const meal = this.meals.find(m => m.id === mealId);
        if (meal) {
            meal.foods.push({
                name: '',
                quantity: 100,
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                baseCalories: 0,
                baseProtein: 0,
                baseCarbs: 0,
                baseFat: 0
            });
            this.showDailyView();
        }
    }

    removeFoodFromMeal(mealId, foodIndex) {
        const meal = this.meals.find(m => m.id === mealId);
        if (meal) {
            meal.foods.splice(foodIndex, 1);
            this.updateMealMacros(mealId);
            this.updateTotalMacros();
            this.showDailyView();
            this.app.notifications.show('Alimento eliminado', 'info', 2000);
        }
    }

    addMeal() {
        const newMealId = 'meal_' + Date.now();
        const newMeal = {
            id: newMealId,
            name: 'Nueva comida',
            foods: [],
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        };
        
        this.meals.push(newMeal);
        this.showDailyView();
        this.app.notifications.show('Nueva comida agregada', 'success', 2000);
    }

    deleteMeal(mealId) {
        this.meals = this.meals.filter(m => m.id !== mealId);
        this.updateTotalMacros();
        this.showDailyView();
        this.app.notifications.show('Comida eliminada', 'info');
    }

    updateMealMacros(mealId) {
        const meal = this.meals.find(m => m.id === mealId);
        if (meal) {
            meal.macros = {
                calories: meal.foods.reduce((sum, food) => sum + (food.calories || 0), 0),
                protein: meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0),
                carbs: meal.foods.reduce((sum, food) => sum + (food.carbs || 0), 0),
                fat: meal.foods.reduce((sum, food) => sum + (food.fat || 0), 0)
            };
        }
    }

    updateTotalMacros() {
        this.dailyIntake.totalMacros = {
            calories: this.meals.reduce((sum, meal) => sum + (meal.macros.calories || 0), 0),
            protein: this.meals.reduce((sum, meal) => sum + (meal.macros.protein || 0), 0),
            carbs: this.meals.reduce((sum, meal) => sum + (meal.macros.carbs || 0), 0),
            fat: this.meals.reduce((sum, meal) => sum + (meal.macros.fat || 0), 0)
        };
    }

    refreshMacroDisplay() {
        setTimeout(() => {
            // Re-renderizar solo la sección de macros
            this.showDailyView();
        }, 100);
    }

    saveDay() {
        this.dailyIntake.meals = this.meals;
        this.app.storage.set('daily_intake_' + this.getTodayKey(), this.dailyIntake);
        this.app.notifications.show('Día guardado exitosamente 💾', 'success');
    }

    showWeeklyView() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                    <div>
                        <h2 style="color: ${colors.text}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">📊 Vista Semanal</h2>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Seguimiento de macronutrientes semanal</p>
                    </div>
                    <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                </div>
                
                <div class="macro-card">
                    <h3 style="color: ${colors.textDark}; text-align: center; font-family: 'Poppins', sans-serif; font-size: 1.8em; margin-bottom: 40px; font-weight: 700;">🚧 Próximamente</h3>
                    <p style="color: ${colors.textSecondary}; text-align: center; font-size: 1.2em; margin-bottom: 32px;">Vista semanal con gráficos de tendencias y estadísticas detalladas</p>
                    <div style="text-align: center;">
                        <button onclick="app.navigate('nutrition-daily')" class="btn-primary">Ver Vista Diaria</button>
                    </div>
                </div>
            </div>
        `;
    }

    showMonthlyView() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                    <div>
                        <h2 style="color: ${colors.text}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">📆 Vista Mensual</h2>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Análisis nutricional mensual</p>
                    </div>
                    <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                </div>
                
                <div class="macro-card">
                    <h3 style="color: ${colors.textDark}; text-align: center; font-family: 'Poppins', sans-serif; font-size: 1.8em; margin-bottom: 40px; font-weight: 700;">🚧 Próximamente</h3>
                    <p style="color: ${colors.textSecondary}; text-align: center; font-size: 1.2em; margin-bottom: 32px;">Vista mensual con patrones alimentarios y recomendaciones personalizadas</p>
                    <div style="text-align: center;">
                        <button onclick="app.navigate('nutrition-daily')" class="btn-primary">Ver Vista Diaria</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDisabled(container) {
        const colors = this.app.theme.getColors();
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <div class="macro-card">
                    <h2 style="color: ${colors.textSecondary}; font-family: 'Poppins', sans-serif; font-size: 2.5em; margin-bottom: 20px;">🍽️ MÓDULO NUTRICIÓN DESHABILITADO</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 32px;">Habilita este módulo desde configuración</p>
                    <button onclick="app.navigate('configuracion')" class="btn-primary">IR A CONFIGURACIÓN</button>
                </div>
            </div>
        `;
    }
}

// ===== MÓDULO DE ENTRENAMIENTO RENOVADO =====
class WorkoutModule extends BaseModule {
    constructor(app) {
        super('workout', app);
        this.weeklyPlan = {};
        this.exerciseHistory = {};
        this.vetoedExercises = [];
        
        this.sessionTypes = {
            'entrenamiento': { name: 'Entrenamiento', icon: '💪', color: '#3b82f6' },
            'descanso_activo': { name: 'Descanso Activo', icon: '🚶', color: '#10b981' },
            'futbol': { name: 'Fútbol', icon: '⚽', color: '#ef4444' },
            'piscina': { name: 'Piscina', icon: '🏊', color: '#06b6d4' },
            'bicicleta': { name: 'Bicicleta', icon: '🚴', color: '#f59e0b' },
            'caminata': { name: 'Caminata', icon: '🥾', color: '#84cc16' }
        };
        
        this.exerciseDatabase = {
            fuerza_superior: [
                {
                    id: 'fs1',
                    name: 'Press de banca con barra',
                    description: 'Ejercicio fundamental para el desarrollo del pectoral mayor. Técnica: espalda arqueada, pies firmes en el suelo, bajada controlada hasta el pecho.',
                    target: 'Pecho',
                    equipment: 'Barra + banco',
                    type: 'weight',
                    defaultSets: 4,
                    alternatives: ['fs2', 'fs3']
                },
                {
                    id: 'fs2',
                    name: 'Press inclinado con mancuernas',
                    description: 'Desarrollo del pectoral superior y mayor activación de estabilizadores. Banco a 30-45 grados, movimiento controlado.',
                    target: 'Pecho superior',
                    equipment: 'Mancuernas + banco',
                    type: 'weight',
                    defaultSets: 3,
                    alternatives: ['fs1', 'fs4']
                },
                {
                    id: 'fs3',
                    name: 'Dominadas con agarre supino',
                    description: 'Ejercicio para dorsales y bíceps. Ideal para ganar fuerza funcional. Colgarse completamente y subir hasta barbilla por encima de la barra.',
                    target: 'Dorsales/Bíceps',
                    equipment: 'Barra de dominadas',
                    type: 'weight',
                    defaultSets: 4,
                    alternatives: ['fs4', 'fs5']
                }
            ],
            fuerza_inferior: [
                {
                    id: 'fi1',
                    name: 'Sentadilla trasera con barra',
                    description: 'Rey de los ejercicios de pierna. Desarrollo completo del tren inferior. Espalda recta, rodillas en línea con los pies, bajar hasta 90 grados.',
                    target: 'Cuádriceps/Glúteos',
                    equipment: 'Barra + rack',
                    type: 'weight',
                    defaultSets: 4,
                    alternatives: ['fi2', 'fi3']
                },
                {
                    id: 'fi2',
                    name: 'Peso muerto rumano',
                    description: 'Fortalecimiento de la cadena posterior. Fundamental para proteger la espalda. Cadera hacia atrás, rodillas ligeramente flexionadas.',
                    target: 'Isquios/Glúteos',
                    equipment: 'Barra',
                    type: 'weight',
                    defaultSets: 4,
                    alternatives: ['fi1', 'fi4']
                },
                {
                    id: 'fi3',
                    name: 'Zancadas alternas',
                    description: 'Ejercicio unilateral que mejora equilibrio y fuerza. Paso amplio hacia adelante, rodilla trasera casi toca el suelo.',
                    target: 'Cuádriceps/Glúteos',
                    equipment: 'Mancuernas',
                    type: 'weight',
                    defaultSets: 3,
                    alternatives: ['fi1', 'fi2']
                }
            ]
        };
    }

    async onInit() {
        this.loadData();
        this.generateWeeklyPlan();
    }

    registerRoutes() {
        this.app.router.register('workout-daily', () => this.showDailyView());
        this.app.router.register('workout-weekly', () => this.showWeeklyView());
        this.app.router.register('workout-monthly', () => this.showMonthlyView());
    }

    loadData() {
        this.exerciseHistory = this.app.storage.get('exercise_history', {});
        this.vetoedExercises = this.app.storage.get('vetoed_exercises', []);
        this.weeklyPlan = this.app.storage.get('weekly_plan', {});
        
        if (Object.keys(this.weeklyPlan).length === 0) {
            this.generateWeeklyPlan();
        }
    }

    generateWeeklyPlan() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes

        this.weeklyPlan = {};
        const sessionPattern = ['entrenamiento', 'descanso_activo', 'entrenamiento', 'futbol', 'entrenamiento', 'piscina', 'caminata'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            
            this.weeklyPlan[dateKey] = {
                date: dateKey,
                dayName: date.toLocaleDateString('es-ES', { weekday: 'long' }),
                sessionType: sessionPattern[i],
                completed: false,
                exercises: this.generateDayExercises(sessionPattern[i], i)
            };
        }

        this.app.storage.set('weekly_plan', this.weeklyPlan);
    }

    generateDayExercises(sessionType, dayIndex) {
        if (sessionType === 'entrenamiento') {
            // Alternar entre superior e inferior
            const isUpperDay = dayIndex === 0 || dayIndex === 4; // Lunes y Viernes
            
            if (isUpperDay) {
                return this.exerciseDatabase.fuerza_superior
                    .filter(ex => !this.vetoedExercises.includes(ex.id))
                    .slice(0, 3)
                    .map(ex => ({ ...ex, sets: this.generateEmptySets(ex.defaultSets, ex.type) }));
            } else {
                return this.exerciseDatabase.fuerza_inferior
                    .filter(ex => !this.vetoedExercises.includes(ex.id))
                    .slice(0, 3)
                    .map(ex => ({ ...ex, sets: this.generateEmptySets(ex.defaultSets, ex.type) }));
            }
        } else if (sessionType === 'descanso_activo') {
            return [{
                id: 'da1',
                name: 'Movilidad y estiramientos',
                description: 'Rutina de movilidad para mejorar flexibilidad y recuperación activa.',
                type: 'time',
                sets: [{ duration: 30 }]
            }];
        } else {
            return [{
                id: sessionType,
                name: this.sessionTypes[sessionType].name,
                description: `Sesión de ${this.sessionTypes[sessionType].name.toLowerCase()}`,
                type: 'cardio',
                sets: [{ duration: '', distance: '' }]
            }];
        }
    }

    generateEmptySets(count, type = 'weight') {
        const sets = [];
        for (let i = 0; i < count; i++) {
            if (type === 'time') {
                sets.push({ reps: '', duration: '' });
            } else if (type === 'cardio') {
                sets.push({ duration: '', distance: '' });
            } else {
                sets.push({ reps: '', weight: '' });
            }
        }
        return sets;
    }

    showDailyView() {
        const container = document.getElementById('main-content');
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }

        const colors = this.app.theme.getColors();
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = this.weeklyPlan[today];

        if (!todayPlan) {
            this.generateWeeklyPlan();
            return this.showDailyView();
        }

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                    <div>
                        <h2 style="color: ${colors.text}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">💪 Plan de Hoy</h2>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0; text-transform: capitalize;">${todayPlan.dayName}, ${new Date().getDate()} de ${new Date().toLocaleDateString('es-ES', { month: 'long' })}</p>
                    </div>
                    <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                </div>

                ${this.generateSessionHeaderHTML(todayPlan, colors)}
                ${this.generateExercisesHTML(todayPlan, colors)}
                
                <div style="text-align: center; margin-top: 32px;">
                    <button onclick="app.workoutModule.saveWorkout()" class="btn-secondary" style="margin-right: 16px;">💾 Guardar Sesión</button>
                    <button onclick="app.workoutModule.completeWorkout('${today}')" class="btn-success" style="padding: 14px 28px;">✅ Completar Sesión</button>
                </div>
            </div>
        `;

        this.setupWorkoutInputs();
    }

    generateSessionHeaderHTML(todayPlan, colors) {
        const session = this.sessionTypes[todayPlan.sessionType];
        
        return `
            <div class="macro-card" style="text-align: center; margin-bottom: 32px; background: linear-gradient(135deg, ${session.color}20 0%, ${session.color}08 100%); border: 3px solid ${session.color};">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <div style="background: ${session.color}; color: white; width: 72px; height: 72px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 2.2em; margin-right: 24px; box-shadow: 0 8px 24px ${session.color}40;">${session.icon}</div>
                    <div style="text-align: left;">
                        <h3 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 2em; font-weight: 700; font-family: 'Poppins', sans-serif;">${session.name}</h3>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            <span style="background: ${todayPlan.completed ? '#10b981' : '#f59e0b'}; color: white; padding: 6px 16px; border-radius: 16px; font-size: 0.9em; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                ${todayPlan.completed ? '✅ COMPLETADO' : '⏳ PENDIENTE'}
                            </span>
                            <span style="background: ${session.color}; color: white; padding: 6px 16px; border-radius: 16px; font-size: 0.9em; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                ${todayPlan.exercises.length} EJERCICIOS
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateExercisesHTML(todayPlan, colors) {
        return todayPlan.exercises.map((exercise, exerciseIndex) => `
            <div class="exercise-card" id="exercise-${exerciseIndex}" style="border-left-color: ${exercise.completed ? '#10b981' : colors.accent};">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px;">
                    <div style="flex: 1;">
                        <h4 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 1.5em; font-weight: 700; font-family: 'Poppins', sans-serif;">${exercise.name}</h4>
                        <p style="color: ${colors.textSecondary}; margin: 0 0 16px 0; font-size: 1em; line-height: 1.6;">${exercise.description}</p>
                        ${exercise.target ? `
                            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                                <span style="background: ${colors.secondary}; color: ${colors.textDark}; padding: 6px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 600;">🎯 ${exercise.target}</span>
                                ${exercise.equipment ? `<span style="background: ${colors.accent}30; color: ${colors.textDark}; padding: 6px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 600;">🏋️ ${exercise.equipment}</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; margin-left: 20px; flex-wrap: wrap;">
                        <button onclick="app.workoutModule.substituteExercise(${exerciseIndex})" class="btn-warning" style="padding: 8px 12px; font-size: 0.85em;">🔄 Cambiar</button>
                        <button onclick="app.workoutModule.vetoExercise('${exercise.id}', ${exerciseIndex})" class="btn-danger" style="padding: 8px 12px; font-size: 0.85em;">❌ Vetar</button>
                        <button onclick="app.workoutModule.completeExercise(${exerciseIndex})" class="btn-success" style="padding: 8px 12px; font-size: 0.85em;">✅ Hecho</button>
                    </div>
                </div>
                
                <div id="sets-${exerciseIndex}" style="margin-bottom: 24px;">
                    ${exercise.sets.map((set, setIndex) => `
                        <div class="set-row" style="display: grid; grid-template-columns: 50px 1fr 1fr 50px; gap: 16px; align-items: center; padding: 16px; margin-bottom: 12px; background: ${colors.primary}; border-radius: 12px; border: 2px solid ${colors.border};">
                            <div style="font-weight: 800; color: white; text-align: center; background: ${colors.accent}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1em; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">${setIndex + 1}</div>
                            
                            ${exercise.type === 'cardio' ? `
                                <div>
                                    <input type="number" placeholder="Minutos" value="${set.duration || ''}" class="input-modern set-duration" data-exercise="${exerciseIndex}" data-set="${setIndex}" style="text-align: center; width: 100%;">
                                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px; font-weight: 600; text-transform: uppercase;">TIEMPO</div>
                                </div>
                                <div>
                                    <input type="number" step="0.1" placeholder="Km" value="${set.distance || ''}" class="input-modern set-distance" data-exercise="${exerciseIndex}" data-set="${setIndex}" style="text-align: center; width: 100%;">
                                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px; font-weight: 600; text-transform: uppercase;">DISTANCIA</div>
                                </div>
                            ` : exercise.type === 'time' ? `
                                <div>
                                    <input type="number" placeholder="Reps" value="${set.reps || ''}" class="input-modern set-reps" data-exercise="${exerciseIndex}" data-set="${setIndex}" style="text-align: center; width: 100%;">
                                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px; font-weight: 600; text-transform: uppercase;">REPS</div>
                                </div>
                                <div>
                                    <input type="number" placeholder="Segundos" value="${set.duration || ''}" class="input-modern set-duration" data-exercise="${exerciseIndex}" data-set="${setIndex}" style="text-align: center; width: 100%;">
                                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px; font-weight: 600; text-transform: uppercase;">TIEMPO</div>
                                </div>
                            ` : `
                                <div>
                                    <input type="number" placeholder="Reps" value="${set.reps || ''}" class="input-modern set-reps" data-exercise="${exerciseIndex}" data-set="${setIndex}" style="text-align: center; width: 100%;">
                                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px; font-weight: 600; text-transform: uppercase;">REPS</div>
                                </div>
                                <div>
                                    <input type="number" step="0.5" placeholder="Kg" value="${set.weight || ''}" class="input-modern set-weight" data-exercise="${exerciseIndex}" data-set="${setIndex}" style="text-align: center; width: 100%;">
                                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px; font-weight: 600; text-transform: uppercase;">PESO</div>
                                </div>
                            `}
                            
                            <button onclick="app.workoutModule.removeSet(${exerciseIndex}, ${setIndex})" class="btn-danger" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0;">✕</button>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display: flex; gap: 16px;">
                    <button onclick="app.workoutModule.addSet(${exerciseIndex})" class="btn-secondary" style="padding: 12px 24px;">+ Añadir Serie</button>
                </div>
            </div>
        `).join('');
    }

    setupWorkoutInputs() {
        // Configurar eventos para inputs de series
        document.querySelectorAll('.set-reps, .set-weight, .set-duration, .set-distance').forEach(input => {
            input.addEventListener('input', (e) => this.handleSetChange(e));
        });
    }

    handleSetChange(event) {
        const input = event.target;
        const exerciseIndex = parseInt(input.dataset.exercise);
        const setIndex = parseInt(input.dataset.set);
        const value = input.value;
        
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = this.weeklyPlan[today];
        
        if (todayPlan && todayPlan.exercises[exerciseIndex] && todayPlan.exercises[exerciseIndex].sets[setIndex]) {
            if (input.classList.contains('set-reps')) {
                todayPlan.exercises[exerciseIndex].sets[setIndex].reps = value;
            } else if (input.classList.contains('set-weight')) {
                todayPlan.exercises[exerciseIndex].sets[setIndex].weight = value;
                // Guardar en historial de pesos
                this.saveWeightHistory(todayPlan.exercises[exerciseIndex].id, value);
            } else if (input.classList.contains('set-duration')) {
                todayPlan.exercises[exerciseIndex].sets[setIndex].duration = value;
            } else if (input.classList.contains('set-distance')) {
                todayPlan.exercises[exerciseIndex].sets[setIndex].distance = value;
            }
            
            // Guardar cambios inmediatamente
            this.saveWorkout();
        }
    }

    saveWeightHistory(exerciseId, weight) {
        if (!this.exerciseHistory[exerciseId]) {
            this.exerciseHistory[exerciseId] = [];
        }
        
        const today = new Date().toISOString().split('T')[0];
        const existingEntry = this.exerciseHistory[exerciseId].find(entry => entry.date === today);
        
        if (existingEntry) {
            existingEntry.maxWeight = Math.max(existingEntry.maxWeight, parseFloat(weight) || 0);
        } else {
            this.exerciseHistory[exerciseId].push({
                date: today,
                maxWeight: parseFloat(weight) || 0,
                timestamp: Date.now()
            });
        }
        
        // Mantener solo los últimos 30 registros
        if (this.exerciseHistory[exerciseId].length > 30) {
            this.exerciseHistory[exerciseId] = this.exerciseHistory[exerciseId].slice(-30);
        }
    }

    addSet(exerciseIndex) {
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = this.weeklyPlan[today];
        const exercise = todayPlan.exercises[exerciseIndex];
        
        if (exercise.type === 'cardio') {
            exercise.sets.push({ duration: '', distance: '' });
        } else if (exercise.type === 'time') {
            exercise.sets.push({ reps: '', duration: '' });
        } else {
            exercise.sets.push({ reps: '', weight: '' });
        }
        
        this.showDailyView();
        this.app.notifications.show('Serie añadida ➕', 'success', 2000);
    }

    removeSet(exerciseIndex, setIndex) {
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = this.weeklyPlan[today];
        const exercise = todayPlan.exercises[exerciseIndex];
        
        if (exercise.sets.length > 1) {
            exercise.sets.splice(setIndex, 1);
            this.showDailyView();
            this.app.notifications.show('Serie eliminada ➖', 'info', 2000);
        } else {
            this.app.notifications.show('Debe mantener al menos una serie', 'warning', 2000);
        }
    }

    substituteExercise(exerciseIndex) {
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = this.weeklyPlan[today];
        const currentExercise = todayPlan.exercises[exerciseIndex];
        
        // Encontrar alternativas
        let alternatives = [];
        for (const category of Object.values(this.exerciseDatabase)) {
            const current = category.find(ex => ex.id === currentExercise.id);
            if (current && current.alternatives) {
                alternatives = current.alternatives.map(altId => {
                    for (const cat of Object.values(this.exerciseDatabase)) {
                        const found = cat.find(ex => ex.id === altId);
                        if (found && !this.vetoedExercises.includes(found.id)) return found;
                    }
                    return null;
                }).filter(Boolean);
                break;
            }
        }
        
        if (alternatives.length > 0) {
            const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
            todayPlan.exercises[exerciseIndex] = {
                ...randomAlt,
                sets: this.generateEmptySets(randomAlt.defaultSets, randomAlt.type)
            };
            
            this.showDailyView();
            this.app.notifications.show(`Ejercicio cambiado por: ${randomAlt.name} 🔄`, 'info');
        } else {
            this.app.notifications.show('No hay alternativas disponibles', 'warning');
        }
    }

    vetoExercise(exerciseId, exerciseIndex) {
        if (!this.vetoedExercises.includes(exerciseId)) {
            this.vetoedExercises.push(exerciseId);
            this.app.storage.set('vetoed_exercises', this.vetoedExercises);
            
            this.app.notifications.show('Ejercicio vetado ❌', 'warning');
            
            // Sustituir inmediatamente
            this.substituteExercise(exerciseIndex);
        }
    }

    completeExercise(exerciseIndex) {
        const exerciseCard = document.getElementById(`exercise-${exerciseIndex}`);
        if (exerciseCard) {
            const colors = this.app.theme.getColors();
            exerciseCard.style.background = '#10b98115';
            exerciseCard.style.borderLeftColor = '#10b981';
            exerciseCard.style.transform = 'scale(0.98)';
            
            const today = new Date().toISOString().split('T')[0];
            const todayPlan = this.weeklyPlan[today];
            todayPlan.exercises[exerciseIndex].completed = true;
            
            this.app.notifications.show('¡Ejercicio completado! 💪🎉', 'success');
        }
    }

    completeWorkout(dateKey) {
        const plan = this.weeklyPlan[dateKey];
        if (plan) {
            plan.completed = true;
            plan.completedAt = new Date().toISOString();
            this.saveWorkout();
            this.app.notifications.show('¡Sesión completada exitosamente! 🏆✨', 'success');
            
            // Actualizar visualización
            setTimeout(() => this.showDailyView(), 1500);
        }
    }

    saveWorkout() {
        this.app.storage.set('weekly_plan', this.weeklyPlan);
        this.app.storage.set('exercise_history', this.exerciseHistory);
    }

    showWeeklyView() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                    <div>
                        <h2 style="color: ${colors.text}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">📊 Plan Semanal</h2>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Planificación inteligente de entrenamientos</p>
                    </div>
                    <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
                    ${Object.values(this.weeklyPlan).map(day => {
                        const session = this.sessionTypes[day.sessionType];
                        return `
                            <div class="macro-card day-card" style="cursor: pointer; text-align: center; transition: all 0.3s ease; border: 3px solid ${day.completed ? '#10b981' : session.color}40; position: relative;" onclick="app.workoutModule.openDayDetail('${day.date}')" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'">
                                ${day.completed ? '<div style="position: absolute; top: 12px; right: 12px; background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">✓</div>' : ''}
                                <div style="background: ${session.color}; color: white; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2em; margin: 0 auto 16px; box-shadow: 0 4px 16px ${session.color}40;">${session.icon}</div>
                                <h4 style="color: ${colors.textDark}; margin: 0 0 8px 0; font-size: 1.2em; font-weight: 700; text-transform: capitalize; font-family: 'Poppins', sans-serif;">${day.dayName}</h4>
                                <p style="color: ${colors.textSecondary}; margin: 0 0 16px 0; font-size: 0.95em; font-weight: 500;">${session.name}</p>
                                <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                                    <span style="background: ${day.completed ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8em; font-weight: 700;">
                                        ${day.completed ? '✅ HECHO' : '⏳ PENDIENTE'}
                                    </span>
                                    <span style="background: ${session.color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8em; font-weight: 700;">
                                        ${day.exercises.length} EJ.
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                    <button onclick="app.workoutModule.generateNewWeek()" class="btn-secondary" style="margin-right: 16px;">🔄 Regenerar Semana</button>
                    <button onclick="app.navigate('workout-daily')" class="btn-primary">Ver Hoy</button>
                </div>
            </div>
        `;
    }

    openDayDetail(dateKey) {
        // Mostrar vista diaria específica para esa fecha
        this.app.navigate('workout-daily');
    }

    generateNewWeek() {
        this.generateWeeklyPlan();
        this.app.notifications.show('Nueva semana generada 🗓️', 'success');
        this.showWeeklyView();
    }

    showMonthlyView() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                    <div>
                        <h2 style="color: ${colors.text}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">📆 Vista Mensual</h2>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Calendario de entrenamientos y progreso</p>
                    </div>
                    <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                </div>
                
                <div class="macro-card">
                    <h3 style="color: ${colors.textDark}; text-align: center; font-family: 'Poppins', sans-serif; font-size: 1.8em; margin-bottom: 40px; font-weight: 700;">🚧 Próximamente</h3>
                    <p style="color: ${colors.textSecondary}; text-align: center; font-size: 1.2em; margin-bottom: 32px;">Vista mensual con calendario interactivo, estadísticas de progreso y análisis de entrenamientos</p>
                    <div style="text-align: center;">
                        <button onclick="app.navigate('workout-weekly')" class="btn-primary" style="margin-right: 12px;">Ver Plan Semanal</button>
                        <button onclick="app.navigate('workout-daily')" class="btn-secondary">Ver Hoy</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDisabled(container) {
        const colors = this.app.theme.getColors();
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <div class="macro-card">
                    <h2 style="color: ${colors.textSecondary}; font-family: 'Poppins', sans-serif; font-size: 2.5em; margin-bottom: 20px;">💪 MÓDULO ENTRENAMIENTO DESHABILITADO</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 32px;">Habilita este módulo desde configuración</p>
                    <button onclick="app.navigate('configuracion')" class="btn-primary">IR A CONFIGURACIÓN</button>
                </div>
            </div>
        `;
    }
}

// ===== CLASES DE SOPORTE =====
class BaseModule {
    constructor(name, app) {
        this.name = name;
        this.app = app;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        console.log(`Inicializando módulo ${this.name}...`);
        await this.onInit();
        this.registerRoutes();
        this.initialized = true;
        console.log(`Módulo ${this.name} inicializado`);
    }

    async onInit() {}
    registerRoutes() {}

    isEnabled() {
        return this.app.user.isModuleEnabled(this.name);
    }
}

class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                primary: '#0f172a',
                secondary: '#475569',
                accent: '#3b82f6',
                background: '#1e293b',
                text: '#f8fafc',
                textDark: '#0f172a',
                textSecondary: '#64748b',
                border: '#475569'
            },
            light: {
                primary: '#ffffff',
                secondary: '#e2e8f0',
                accent: '#3b82f6',
                background: '#f8fafc',
                text: '#0f172a',
                textDark: '#0f172a',
                textSecondary: '#64748b',
                border: '#e2e8f0'
            }
        };
        this.currentTheme = 'dark';
        this.loadTheme();
    }

    loadTheme() {
        const saved = localStorage.getItem('sulo_theme');
        if (saved) this.currentTheme = saved;
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('sulo_theme', theme);
        this.applyTheme();
    }

    toggleTheme() {
        this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
    }

    getColors() {
        return this.themes[this.currentTheme];
    }

    applyTheme() {
        const colors = this.getColors();
        document.body.style.backgroundColor = colors.primary;
        document.body.style.color = colors.text;
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: colors }));
    }
}

class StorageManager {
    constructor() {
        this.prefix = 'sulo_v2_';
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (error) {
            console.warn('Error guardando:', error);
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error leyendo:', error);
            return defaultValue;
        }
    }
}

class NotificationManager {
    constructor(themeManager) {
        this.themeManager = themeManager;
    }

    show(message, type = 'info', duration = 3500) {
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 24px; right: 24px;
            background: ${colors[type]}; color: white;
            padding: 16px 24px; border-radius: 12px;
            font-weight: 600; z-index: 10000;
            animation: slideInRight 0.4s ease-out;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            font-family: 'Inter', sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.4s ease-out';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }, duration);
    }
}

class RouterManager {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        window.addEventListener('popstate', () => this.handleRouteChange());
        setTimeout(() => this.handleRouteChange(), 100);
    }

    register(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path, params = {}) {
        history.pushState(params, '', window.location.origin + window.location.pathname + '#' + path);
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || 'inicio';
        this.currentRoute = hash;
        const handler = this.routes.get(hash);
        if (handler) {
            try {
                handler();
            } catch (error) {
                console.error('Error en ruta:', hash, error);
                this.navigate('inicio');
            }
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

class UserManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.profile = this.loadProfile();
        this.preferences = this.loadPreferences();
        this.nutritionTargets = this.calculateNutritionTargets();
    }

    loadProfile() {
        return this.storage.get('profile', {
            nombre: 'Sulo',
            edad: 45,
            peso: 74,
            altura: 184,
            objetivos: ['ganar_musculo', 'proteccion_lumbares'],
            actividad_fisica: 'alta'
        });
    }

    loadPreferences() {
        return this.storage.get('preferences', {
            workoutEnabled: true,
            nutritionEnabled: true,
            theme: 'dark'
        });
    }

    calculateNutritionTargets() {
        const profile = this.profile;
        const bmr = (10 * profile.peso) + (6.25 * profile.altura) - (5 * profile.edad) + 5;
        const tdee = bmr * 1.75; // Factor de actividad alta
        
        return {
            calories: Math.round(tdee),
            protein: Math.round(profile.peso * 2.2), // 2.2g por kg para ganar músculo
            carbs: Math.round(tdee * 0.4 / 4), // 40% de calorías de carbohidratos
            fat: Math.round(tdee * 0.25 / 9) // 25% de calorías de grasa
        };
    }

    updatePreferences(data) {
        this.preferences = { ...this.preferences, ...data };
        this.storage.set('preferences', this.preferences);
        window.dispatchEvent(new CustomEvent('preferences-updated', { detail: this.preferences }));
    }

    getProfile() {
        return this.profile;
    }

    getPreferences() {
        return this.preferences;
    }

    getNutritionTargets() {
        return this.nutritionTargets;
    }

    isModuleEnabled(moduleName) {
        return this.preferences[moduleName + 'Enabled'] || false;
    }
}

class NutritionAPIService {
    constructor() {
        this.cache = new Map();
    }

    async searchFood(query) {
        if (this.cache.has(query)) {
            return this.cache.get(query);
        }

        // Base de datos simulada de alimentos (por 100g)
        const foods = {
            // Proteínas
            'pollo': { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fat: 4 },
            'pavo': { name: 'Pechuga de pavo', calories: 135, protein: 30, carbs: 0, fat: 1 },
            'ternera': { name: 'Ternera magra', calories: 158, protein: 26, carbs: 0, fat: 5 },
            'salmón': { name: 'Salmón', calories: 208, protein: 20, carbs: 0, fat: 13 },
            'atún': { name: 'Atún natural', calories: 116, protein: 25, carbs: 0, fat: 1 },
            'huevo': { name: 'Huevo entero', calories: 155, protein: 13, carbs: 1, fat: 11 },
            'clara': { name: 'Clara de huevo', calories: 52, protein: 11, carbs: 1, fat: 0 },
            'queso': { name: 'Queso fresco', calories: 98, protein: 11, carbs: 4, fat: 4 },
            
            // Carbohidratos
            'arroz': { name: 'Arroz blanco', calories: 130, protein: 3, carbs: 28, fat: 0 },
            'integral': { name: 'Arroz integral', calories: 111, protein: 3, carbs: 23, fat: 1 },
            'avena': { name: 'Avena', calories: 389, protein: 17, carbs: 66, fat: 7 },
            'pasta': { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1 },
            'pan': { name: 'Pan integral', calories: 247, protein: 13, carbs: 41, fat: 4 },
            'patata': { name: 'Patata', calories: 77, protein: 2, carbs: 17, fat: 0 },
            'boniato': { name: 'Boniato', calories: 86, protein: 2, carbs: 20, fat: 0 },
            'quinoa': { name: 'Quinoa', calories: 120, protein: 4, carbs: 22, fat: 2 },
            
            // Verduras
            'brócoli': { name: 'Brócoli', calories: 34, protein: 3, carbs: 7, fat: 0 },
            'espinaca': { name: 'Espinacas', calories: 23, protein: 3, carbs: 4, fat: 0 },
            'tomate': { name: 'Tomate', calories: 18, protein: 1, carbs: 4, fat: 0 },
            'lechuga': { name: 'Lechuga', calories: 15, protein: 1, carbs: 3, fat: 0 },
            'pepino': { name: 'Pepino', calories: 16, protein: 1, carbs: 4, fat: 0 },
            'calabacín': { name: 'Calabacín', calories: 17, protein: 1, carbs: 3, fat: 0 },
            'pimiento': { name: 'Pimiento', calories: 31, protein: 1, carbs: 7, fat: 0 },
            
            // Frutas
            'plátano': { name: 'Plátano', calories: 89, protein: 1, carbs: 23, fat: 0 },
            'manzana': { name: 'Manzana', calories: 52, protein: 0, carbs: 14, fat: 0 },
            'naranja': { name: 'Naranja', calories: 47, protein: 1, carbs: 12, fat: 0 },
            'fresa': { name: 'Fresas', calories: 32, protein: 1, carbs: 8, fat: 0 },
            'kiwi': { name: 'Kiwi', calories: 61, protein: 1, carbs: 15, fat: 1 },
            
            // Frutos secos y grasas
            'almendra': { name: 'Almendras', calories: 579, protein: 21, carbs: 22, fat: 50 },
            'nuez': { name: 'Nueces', calories: 654, protein: 15, carbs: 14, fat: 65 },
            'aceite': { name: 'Aceite de oliva', calories: 884, protein: 0, carbs: 0, fat: 100 },
            'aguacate': { name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fat: 15 }
        };

        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const [key, value] of Object.entries(foods)) {
            if (key.includes(lowerQuery) || value.name.toLowerCase().includes(lowerQuery)) {
                results.push(value);
            }
        }

        // Ordenar por relevancia (coincidencia exacta primero)
        results.sort((a, b) => {
            const aExact = a.name.toLowerCase().includes(lowerQuery);
            const bExact = b.name.toLowerCase().includes(lowerQuery);
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return 0;
        });

        const finalResults = results.slice(0, 6); // Máximo 6 resultados
        this.cache.set(query, finalResults);
        return finalResults;
    }
}

// ===== INICIALIZACIÓN =====
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new SuloFitnessApp();
    });
} else {
    app = new SuloFitnessApp();
}

// Exportar para testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SuloFitnessApp, 
        NutritionModule, 
        WorkoutModule, 
        NutritionAPIService 
    };
}