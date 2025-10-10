// ===============================================
// SULO FITNESS v2.0 - BACKUP DE VERSIÓN ACTUAL
// APLICACIÓN COMPLETA RENOVADA
// Enfoque moderno: macronutrientes + planificación inteligente
// Backup creado el: 10 de Octubre 2025, 15:31 CEST
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
            * {
                box-sizing: border-box;
            }
            
            body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(300px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(300px); opacity: 0; }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .app-loaded #loading-screen {
                display: none !important;
            }
            
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
            
            .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .grid-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 16px;
            }
            
            .grid-4 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                gap: 16px;
            }
            
            @media (max-width: 768px) {
                .grid-2, .grid-3, .grid-4 {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
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
            <header style="
                background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
                color: ${colors.text};
                padding: 20px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                position: sticky;
                top: 0;
                z-index: 1000;
            ">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="margin: 0; font-size: 1.8em; font-weight: 800; font-family: 'Poppins', sans-serif;">
                            💪 Sulo Fitness v2.0
                        </h1>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.9em;">
                            Tu nueva experiencia de fitness inteligente
                        </p>
                    </div>
                    <button onclick="app.theme.toggleTheme()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: ${colors.text};
                        padding: 8px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1.2em;
                    ">🌙</button>
                </div>
            </header>
            
            <nav style="
                background: ${colors.background};
                border-bottom: 2px solid ${colors.border};
                padding: 16px 0;
                position: sticky;
                top: 72px;
                z-index: 999;
            ">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: center; gap: 8px; padding: 0 20px;">
                    <button id="btn-inicio" onclick="app.navigate('inicio')" class="nav-button">
                        🏠 Inicio
                    </button>
                    <button id="btn-diaria" onclick="app.navigate('diaria')" class="nav-button">
                        📅 Vista Diaria
                    </button>
                    <button id="btn-semanal" onclick="app.navigate('semanal')" class="nav-button">
                        📊 Vista Semanal  
                    </button>
                    <button id="btn-mensual" onclick="app.navigate('mensual')" class="nav-button">
                        📈 Vista Mensual
                    </button>
                    <button id="btn-configuracion" onclick="app.navigate('configuracion')" class="nav-button">
                        ⚙️ Configuración
                    </button>
                </div>
            </nav>
            
            <main id="main-content" style="
                max-width: 1200px;
                margin: 0 auto;
                padding: 32px 20px;
                min-height: calc(100vh - 200px);
            ">
                <!-- Contenido dinámico -->
            </main>
            
            <style>
                .nav-button {
                    background: ${colors.secondary};
                    color: ${colors.textDark};
                    border: none;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                }
                
                .nav-button:hover {
                    background: ${colors.accent};
                    color: white;
                    transform: translateY(-2px);
                }
                
                .nav-button.active {
                    background: ${colors.accent};
                    color: white;
                }
            </style>
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
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="
                        color: ${colors.textDark}; 
                        font-size: 2.5em; 
                        margin-bottom: 16px; 
                        font-weight: 800; 
                        font-family: 'Poppins', sans-serif;
                    ">
                        ¡Bienvenido a tu centro de fitness inteligente! 🚀
                    </h2>
                    <p style="
                        color: ${colors.textSecondary}; 
                        font-size: 1.2em; 
                        margin-bottom: 32px; 
                        max-width: 600px; 
                        margin-left: auto; 
                        margin-right: auto;
                    ">
                        Seguimiento inteligente de macronutrientes y planificación automática
                    </p>
                </div>
                
                <div class="grid-2" style="margin-bottom: 40px;">
                    ${preferences.nutritionEnabled ? `
                        <div class="macro-card">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 16px; font-size: 1.4em; font-weight: 700;">
                                📊 Macronutrientes en tiempo real
                            </h3>
                            <p style="color: ${colors.textSecondary}; margin-bottom: 20px;">
                                Seguimiento preciso de proteínas, carbohidratos y grasas
                            </p>
                            <button onclick="app.navigate('diaria')" class="btn-primary">
                                Ver Dashboard Nutricional
                            </button>
                        </div>
                    ` : ''}
                    
                    ${preferences.workoutEnabled ? `
                        <div class="macro-card">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 16px; font-size: 1.4em; font-weight: 700;">
                                🏋️ Planificación automática
                            </h3>
                            <p style="color: ${colors.textSecondary}; margin-bottom: 20px;">
                                Rutinas personalizadas adaptadas a tus objetivos
                            </p>
                            <button onclick="app.navigate('diaria')" class="btn-primary">
                                Ver Plan de Entrenamiento
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                ${!preferences.nutritionEnabled && !preferences.workoutEnabled ? `
                    <div style="
                        text-align: center; 
                        padding: 60px 20px; 
                        background: ${colors.background}; 
                        border-radius: 16px; 
                        border: 2px solid ${colors.border};
                        margin-bottom: 40px;
                    ">
                        <div style="font-size: 4em; margin-bottom: 20px;">⚙️</div>
                        <h3 style="color: ${colors.textDark}; font-size: 1.8em; margin-bottom: 16px;">
                            Tu plan personalizado para hoy
                        </h3>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin-bottom: 24px;">
                            Habilita al menos un módulo desde configuración
                        </p>
                        <button onclick="app.navigate('configuracion')" class="btn-primary">
                            Ir a Configuración
                        </button>
                    </div>
                ` : `
                    <div style="
                        background: ${colors.accent}20; 
                        border-radius: 16px; 
                        padding: 24px; 
                        text-align: center; 
                        border: 2px solid ${colors.accent}40;
                    ">
                        <h3 style="color: ${colors.accent}; margin-bottom: 16px; font-size: 1.4em; font-weight: 700;">
                            ✨ Características activas
                        </h3>
                        <div class="grid-2">
                            ${preferences.nutritionEnabled ? '<div style="color: #10b981; font-weight: 600;">✅ Seguimiento de macronutrientes</div>' : ''}
                            ${preferences.workoutEnabled ? '<div style="color: #10b981; font-weight: 600;">✅ Plan de ejercicios personalizado</div>' : ''}
                        </div>
                    </div>
                `}
                
                <div style="
                    background: ${colors.background}; 
                    border-radius: 12px; 
                    padding: 20px; 
                    margin-top: 32px; 
                    border: 1px solid ${colors.border};
                ">
                    <h4 style="color: ${colors.textDark}; margin-bottom: 12px;">📋 Accesos rápidos</h4>
                    <div class="grid-4">
                        <button onclick="app.navigate('diaria')" class="btn-secondary">📅 Vista Diaria</button>
                        <button onclick="app.navigate('semanal')" class="btn-secondary">📊 Vista Semanal</button>
                        <button onclick="app.navigate('mensual')" class="btn-secondary">📈 Vista Mensual</button>
                        <button onclick="app.navigate('configuracion')" class="btn-secondary">⚙️ Configuración</button>
                    </div>
                </div>
            </div>
        `;
    }

    updateActiveButton(currentView) {
        // Limpiar botones activos
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activar botón actual
        const activeButton = document.getElementById(`btn-${currentView}`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
}

// ===== GESTIÓN DE ALMACENAMIENTO =====
class StorageManager {
    constructor() {
        this.storageKey = 'sulo-fitness-v2';
    }

    save(key, data) {
        try {
            const storage = this.getStorage();
            storage[key] = {
                data: data,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(storage));
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    }

    load(key) {
        try {
            const storage = this.getStorage();
            return storage[key]?.data || null;
        } catch (error) {
            console.error('Error cargando datos:', error);
            return null;
        }
    }

    getStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    }
}

// ===== GESTIÓN DE TEMAS =====
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                primary: '#f8fafc',
                secondary: '#e2e8f0',
                accent: '#3b82f6',
                background: '#ffffff',
                text: '#0f172a',
                textDark: '#0f172a',
                textSecondary: '#64748b',
                border: '#e2e8f0'
            },
            dark: {
                primary: '#1e293b',
                secondary: '#475569',
                accent: '#3b82f6',
                background: '#0f172a',
                text: '#f8fafc',
                textDark: '#f8fafc',
                textSecondary: '#94a3b8',
                border: '#475569'
            }
        };
        this.currentTheme = 'light';
    }

    getColors() {
        return this.themes[this.currentTheme];
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        if (window.app) {
            window.app.showMainInterface();
        }
    }

    applyTheme() {
        const colors = this.getColors();
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
        });
    }
}

// ===== GESTIÓN DE NOTIFICACIONES =====
class NotificationManager {
    constructor(themeManager) {
        this.theme = themeManager;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notifications-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const colors = this.theme.getColors();
        const typeColors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: colors.accent
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${colors.background};
            border: 2px solid ${typeColors[type]};
            color: ${colors.textDark};
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            cursor: pointer;
            font-weight: 600;
            max-width: 350px;
            animation: slideInRight 0.4s ease-out;
        `;
        
        notification.textContent = message;
        this.container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.4s ease-out';
                setTimeout(() => notification.remove(), 400);
            }
        }, duration);

        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
    }
}

// ===== GESTIÓN DE RUTAS =====
class RouterManager {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
    }

    register(route, handler) {
        this.routes.set(route, handler);
    }

    navigate(route, params = {}) {
        if (this.routes.has(route)) {
            this.currentRoute = route;
            const handler = this.routes.get(route);
            handler(params);
        } else {
            console.warn(`Ruta no encontrada: ${route}`);
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

// ===== GESTIÓN DE USUARIO =====
class UserManager {
    constructor(storage) {
        this.storage = storage;
        this.loadUserData();
    }

    loadUserData() {
        this.profile = this.storage.load('profile') || this.getDefaultProfile();
        this.preferences = this.storage.load('preferences') || this.getDefaultPreferences();
    }

    getDefaultProfile() {
        return {
            name: 'Usuario',
            age: 30,
            weight: 70,
            height: 170,
            activityLevel: 'moderate'
        };
    }

    getDefaultPreferences() {
        return {
            nutritionEnabled: true,
            workoutEnabled: true,
            theme: 'light',
            notifications: true
        };
    }

    getProfile() {
        return this.profile;
    }

    getPreferences() {
        return this.preferences;
    }

    updateProfile(newProfile) {
        this.profile = { ...this.profile, ...newProfile };
        this.storage.save('profile', this.profile);
    }

    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        this.storage.save('preferences', this.preferences);
        window.dispatchEvent(new CustomEvent('preferences-updated', { detail: this.preferences }));
    }
}

// ===== PLACEHOLDER PARA MÓDULOS (no implementados en v2.0) =====
class WorkoutModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('WorkoutModule inicializado (placeholder)');
    }
}

class NutritionModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('NutritionModule inicializado (placeholder)');
    }
}

class NutritionAPIService {
    constructor() {
        console.log('NutritionAPIService inicializado (placeholder)');
    }
}

// ===== INICIALIZACIÓN =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM cargado, inicializando aplicación v2.0...');
    
    try {
        app = new SuloFitnessApp();
        window.app = app; // Acceso global
        
        console.log('🎉 Aplicación v2.0 inicializada correctamente');
    } catch (error) {
        console.error('💥 Error crítico inicializando:', error);
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; font-family: sans-serif;">
                <div style="padding: 40px; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px;">
                    <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Error de Carga</h1>
                    <p style="color: #7f1d1d; margin-bottom: 20px;">No se pudo inicializar la aplicación v2.0</p>
                    <button onclick="location.reload()" style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">🔄 Recargar</button>
                </div>
            </div>
        `;
    }
});

console.log('📱 Sulo Fitness v2.0 - Script de backup cargado correctamente');