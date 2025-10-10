// ===============================================
// SULO FITNESS - VERSIÓN FINAL COMPLETA
// Aplicación sin errores con Service Worker integrado
// ===============================================

// ===== SISTEMA PRINCIPAL =====
class SuloFitnessApp {
    constructor() {
        this.storage = new StorageManager();
        this.theme = new ThemeManager();
        this.notifications = new NotificationManager(this.theme);
        this.router = new RouterManager();
        this.user = new UserManager(this.storage);

        this.modules = new Map();
        this.workoutModule = null;
        this.nutritionModule = null;

        this.initialized = false;

        this.init();
    }

    async init() {
        if (this.initialized) return;

        console.log('Inicializando Sulo Fitness App...');

        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Registrar Service Worker PRIMERO
        await this.registerServiceWorker();

        this.loadFonts();
        this.theme.applyTheme();
        await this.initializeModules();
        this.setupEventListeners();
        this.setupRoutes();
        this.showMainInterface();

        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            document.body.classList.add('app-loaded');
        }, 1000);

        this.initialized = true;
        console.log('App inicializada correctamente');
    }

    // ===== CONFIGURACIÓN SERVICE WORKER =====
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                console.log('🔧 Registrando Service Worker...');
                const registration = await navigator.serviceWorker.register('./service-worker.js', {
                    scope: './'
                });

                console.log('✅ Service Worker registrado:', registration);

                // Manejar actualizaciones del Service Worker
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Nueva versión del Service Worker disponible');
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // Nueva versión disponible
                                this.showUpdateAvailable();
                            } else {
                                // Primera instalación
                                console.log('📱 App lista para funcionar offline');
                            }
                        }
                    });
                });

                // Escuchar mensajes del Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });

            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
            }
        } else {
            console.warn('⚠️ Service Workers no soportados en este navegador');
        }
    }

    showUpdateAvailable() {
        const colors = this.theme.getColors();

        // Crear notificación de actualización
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; z-index: 10001;
            background: ${colors.warning}; color: ${colors.textDark};
            padding: 16px; text-align: center; font-weight: 700;
            font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        updateBanner.innerHTML = `
            <span>🚀 Nueva versión disponible</span>
            <button onclick="app.updateApp()" style="
                background: ${colors.textDark}; color: ${colors.warning}; 
                border: none; padding: 8px 16px; border-radius: 6px; 
                margin-left: 12px; cursor: pointer; font-weight: 700;
            ">ACTUALIZAR</button>
            <button onclick="document.getElementById('update-banner').remove()" style="
                background: transparent; color: ${colors.textDark}; 
                border: 1px solid ${colors.textDark}; padding: 8px 16px; 
                border-radius: 6px; margin-left: 8px; cursor: pointer; font-weight: 700;
            ">DESPUÉS</button>
        `;

        document.body.prepend(updateBanner);
    }

    async updateApp() {
        try {
            // Enviar mensaje al Service Worker para que se active
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });

                // Recargar la página después de la actualización
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            }
        } catch (error) {
            console.error('Error actualizando:', error);
            window.location.reload();
        }
    }

    handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'CACHE_UPDATED':
                this.notifications.show('Cache actualizada', 'success');
                break;
            case 'OFFLINE_MODE':
                this.notifications.show('Modo offline activado', 'info');
                break;
            case 'ONLINE_MODE':
                this.notifications.show('Conexión restaurada', 'success');
                break;
        }
    }

    // Método para limpiar cache manualmente
    async clearCache() {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const messageChannel = new MessageChannel();

                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        this.notifications.show('Cache limpiada', 'success');
                    }
                };

                registration.active.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                );
            }
        } catch (error) {
            console.error('Error limpiando cache:', error);
        }
    }

    loadFonts() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.textContent = this.getCSSAnimations();
        document.head.appendChild(style);
    }

    getCSSAnimations() {
        return `
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
            .app-loaded #loading-screen {
                display: none !important;
            }
            .offline-indicator {
                position: fixed; bottom: 20px; left: 20px; z-index: 9999;
                background: #ff6b6b; color: white; padding: 8px 16px;
                border-radius: 20px; font-size: 0.9em; font-weight: 600;
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

        console.log('Módulos inicializados:', Array.from(this.modules.keys()));
    }

    setupEventListeners() {
        window.addEventListener('preferences-updated', (event) => {
            this.onPreferencesUpdated(event.detail);
        });

        window.addEventListener('theme-changed', (event) => {
            this.onThemeChanged(event.detail);
        });

        // Detectar estado de conexión
        window.addEventListener('online', () => {
            this.removeOfflineIndicator();
            this.notifications.show('Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showOfflineIndicator();
            this.notifications.show('Modo offline', 'warning');
        });

        // Verificar estado inicial
        if (!navigator.onLine) {
            this.showOfflineIndicator();
        }
    }

    showOfflineIndicator() {
        if (document.querySelector('.offline-indicator')) return;

        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.innerHTML = '📶 Sin conexión - Modo offline';
        document.body.appendChild(indicator);
    }

    removeOfflineIndicator() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.remove();
        }
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
        console.log('Tema cambiado:', colors);
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

        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = this.getMainInterfaceHTML(colors);
        }

        document.body.style.backgroundColor = colors.primary;
        document.body.style.color = colors.text;
        document.body.style.fontFamily = "'Montserrat', sans-serif";

        if (!this.router.getCurrentRoute() || this.router.getCurrentRoute() === '') {
            setTimeout(() => this.navigate('inicio'), 100);
        }
    }

    getMainInterfaceHTML(colors) {
        const headerHTML = `
            <header style="background: ${colors.primary}; color: ${colors.text}; padding: 32px 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: 'Bebas Neue', cursive;">
                <h1 style="margin: 0; font-size: 3em; font-weight: 400; letter-spacing: 2px; color: ${colors.text};">💪 SULO FITNESS</h1>
                <p style="margin: 12px 0 0 0; color: ${colors.textSecondary}; font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 1.1em;">Tu entrenador personal avanzado</p>
            </header>
        `;

        const navHTML = `
            <nav style="background: ${colors.secondary}; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; font-family: 'Montserrat', sans-serif;">
                    <button onclick="app.navigate('inicio')" id="btn-inicio" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; text-transform: uppercase; min-width: 110px;">🏠 INICIO</button>
                    <button onclick="app.navigate('diaria')" id="btn-diaria" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; text-transform: uppercase; min-width: 110px;">📅 DIARIA</button>
                    <button onclick="app.navigate('semanal')" id="btn-semanal" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; text-transform: uppercase; min-width: 110px;">📊 SEMANAL</button>
                    <button onclick="app.navigate('mensual')" id="btn-mensual" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; text-transform: uppercase; min-width: 110px;">📆 MENSUAL</button>
                    <button onclick="app.navigate('configuracion')" id="btn-config" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; text-transform: uppercase; min-width: 110px;">⚙️ CONFIG</button>
                </div>
            </nav>
        `;

        const mainHTML = `
            <main id="main-content" style="padding: 40px 24px; background: ${colors.primary}; color: ${colors.text}; min-height: calc(100vh - 180px); max-width: 1400px; margin: 0 auto; font-family: 'Montserrat', sans-serif;"></main>
        `;

        return headerHTML + navHTML + mainHTML;
    }

    showWelcomeView() {
        const container = document.getElementById('main-content');
        if (!container) return;

        const colors = this.theme.getColors();
        const profile = this.user.getProfile();
        const preferences = this.user.getPreferences();

        this.updateActiveButton('inicio');

        container.innerHTML = this.getWelcomeHTML(colors, profile, preferences);
    }

    getWelcomeHTML(colors, profile, preferences) {
        return `
            <div style="text-align: center; animation: fadeIn 0.6s ease-out; font-family: 'Montserrat', sans-serif;">
                <h2 style="color: ${colors.text}; font-size: 2.8em; margin-bottom: 32px; font-weight: 400; font-family: 'Bebas Neue', cursive; letter-spacing: 2px;">¡HOLA ${profile.nombre.toUpperCase()}! 👋</h2>

                <div style="background: ${colors.background}; padding: 40px; border-radius: 24px; margin: 40px auto; max-width: 700px; box-shadow: 0 12px 40px rgba(0,0,0,0.15);">
                    <p style="margin: 0; font-size: 1.6em; color: ${colors.textDark}; font-weight: 600;">🚀 SISTEMA AVANZADO</p>
                    <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 1.2em; font-weight: 500;">Planes completamente editables con seguimiento en tiempo real</p>
                    <div style="margin-top: 20px;">
                        <span style="background: ${colors.success}; color: ${colors.textDark}; padding: 6px 12px; border-radius: 15px; font-size: 0.9em; font-weight: 700;">📱 PWA READY</span>
                        <span style="background: ${colors.accent}; color: ${colors.textDark}; padding: 6px 12px; border-radius: 15px; font-size: 0.9em; font-weight: 700; margin-left: 8px;">🔄 OFFLINE</span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; margin: 50px 0;">
                    ${preferences.workoutEnabled ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer;" onclick="app.navigate('workout')">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive;">💪 EJERCICIOS AVANZADOS</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500;">Seguimiento de pesos, series editables, histórico completo</p>
                        </div>
                    ` : ''}

                    ${preferences.nutritionEnabled ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer;" onclick="app.navigate('nutrition')">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive;">🍽️ NUTRICIÓN COMPLETA</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500;">Planes editables, seguimiento en tiempo real</p>
                        </div>
                    ` : ''}

                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer;" onclick="app.navigate('configuracion')">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive;">⚙️ CONFIGURACIÓN</h3>
                        <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500;">Personaliza módulos y preferencias</p>
                    </div>
                </div>

                <div style="margin-top: 50px;">
                    <button onclick="app.theme.toggleTheme(); app.showMainInterface(); app.showWelcomeView();" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 20px 40px; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">
                        ${this.theme.currentTheme === 'dark' ? '☀️ MODO CLARO' : '🌙 MODO OSCURO'}
                    </button>
                    <button onclick="app.navigate('diaria')" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 20px 40px; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">📅 EMPEZAR</button>
                    <button onclick="app.clearCache()" style="background: ${colors.warning}; color: ${colors.textDark}; border: none; padding: 20px 40px; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">🗑️ LIMPIAR CACHE</button>
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

        container.innerHTML = this.getDailyViewHTML(colors, preferences);
    }

    getDailyViewHTML(colors, preferences) {
        const today = new Date();
        const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
        const dayNumber = today.getDate();

        return `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">📅 ${dayName.toUpperCase()} (${dayNumber})</h2>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto;">
                    ${preferences.workoutEnabled ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive;">💪 ENTRENAMIENTO</h3>
                            <div style="margin-bottom: 24px;">
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                    <strong style="color: ${colors.textDark};">Plan:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">PERSONALIZADO</span>
                                </div>
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                    <strong style="color: ${colors.textDark};">Estado:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">LISTO</span>
                                </div>
                            </div>
                            <button onclick="app.navigate('workout')" style="width: 100%; background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">IR AL MÓDULO</button>
                        </div>
                    ` : ''}

                    ${preferences.nutritionEnabled ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive;">🍽️ NUTRICIÓN</h3>
                            <div style="margin-bottom: 24px;">
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                    <strong style="color: ${colors.textDark};">Plan:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">EDITABLE</span>
                                </div>
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                    <strong style="color: ${colors.textDark};">Estado:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">OPTIMIZADO</span>
                                </div>
                            </div>
                            <button onclick="app.navigate('nutrition')" style="width: 100%; background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">IR AL MÓDULO</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showWeeklyView() {
        const container = document.getElementById('main-content');
        if (!container) return;

        const colors = this.theme.getColors();
        this.updateActiveButton('semanal');

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">📊 VISTA SEMANAL</h2>

                <div style="text-align: center; padding: 60px; background: ${colors.background}; border-radius: 20px;">
                    <h3 style="color: ${colors.textDark}; font-family: 'Bebas Neue', cursive; font-size: 2em; margin-bottom: 20px;">🚧 EN DESARROLLO</h3>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em;">Vista semanal próximamente</p>
                </div>
            </div>
        `;
    }

    showMonthlyView() {
        const container = document.getElementById('main-content');
        if (!container) return;

        const colors = this.theme.getColors();
        this.updateActiveButton('mensual');

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">📆 VISTA MENSUAL</h2>

                <div style="text-align: center; padding: 60px; background: ${colors.background}; border-radius: 20px;">
                    <h3 style="color: ${colors.textDark}; font-family: 'Bebas Neue', cursive; font-size: 2em; margin-bottom: 20px;">🚧 EN DESARROLLO</h3>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em;">Calendario mensual próximamente</p>
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

        container.innerHTML = this.getConfigHTML(colors, preferences);
    }

    getConfigHTML(colors, preferences) {
        return `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">⚙️ CONFIGURACIÓN</h2>

                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px; text-align: center;">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em;">🎨 TEMA</h3>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                        <button onclick="app.setTheme('dark')" style="background: ${this.theme.currentTheme === 'dark' ? colors.accent : colors.textSecondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">🌙 OSCURO</button>
                        <button onclick="app.setTheme('light')" style="background: ${this.theme.currentTheme === 'light' ? colors.secondary : colors.textSecondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">☀️ CLARO</button>
                    </div>
                </div>

                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px; text-align: center;">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em;">📋 MÓDULOS</h3>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                        <button onclick="app.toggleModule('workout')" style="background: ${preferences.workoutEnabled ? colors.accent : colors.textSecondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">💪 EJERCICIOS</button>
                        <button onclick="app.toggleModule('nutrition')" style="background: ${preferences.nutritionEnabled ? colors.secondary : colors.textSecondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">🍽️ NUTRICIÓN</button>
                    </div>
                </div>

                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; text-align: center;">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em;">🔧 SISTEMA</h3>
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                        <button onclick="app.clearCache()" style="background: ${colors.warning}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">🗑️ LIMPIAR CACHE</button>
                        <button onclick="window.location.reload()" style="background: ${colors.danger}; color: white; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">🔄 RECARGAR APP</button>
                    </div>
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
        this.notifications.show(`Módulo ${moduleName} ${newPreferences[moduleName + 'Enabled'] ? 'habilitado' : 'deshabilitado'}`, 'info');

        this.reinitializeModules().then(() => {
            this.showConfigView();
        });
    }

    updateActiveButton(activeView) {
        const buttons = document.querySelectorAll('button[id^="btn-"]');
        const colors = this.theme.getColors();

        buttons.forEach(btn => {
            if (btn) {
                btn.style.background = colors.accent;
                btn.style.opacity = '0.8';
            }
        });

        const activeButton = document.getElementById('btn-' + activeView);
        if (activeButton) {
            activeButton.style.background = colors.secondary;
            activeButton.style.opacity = '1';
        }
    }
}

// ===== SISTEMA DE TEMAS =====
class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                primary: '#141414',
                secondary: '#738290',
                accent: '#a1b5d8',
                background: '#fffcf7',
                success: '#e4f0d0',
                text: '#fffcf7',
                textDark: '#141414',
                textSecondary: '#a1b5d8',
                border: '#738290',
                danger: '#ff6b6b',
                warning: '#ff9800'
            },
            light: {
                primary: '#fffcf7',
                secondary: '#a1b5d8',
                accent: '#738290',
                background: '#f8f9fa',
                success: '#2d5016',
                text: '#141414',
                textDark: '#141414',
                textSecondary: '#4a5568',
                border: '#cbd5e0',
                danger: '#e53e3e',
                warning: '#b45309'
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
        document.body.style.fontFamily = "'Montserrat', sans-serif";

        document.body.className = this.currentTheme === 'light' ? 'light-theme' : '';
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: colors }));
    }
}

// ===== SISTEMA DE ALMACENAMIENTO =====
class StorageManager {
    constructor() {
        this.prefix = 'sulo_';
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

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

// ===== SISTEMA DE NOTIFICACIONES =====
class NotificationManager {
    constructor(themeManager) {
        this.themeManager = themeManager;
    }

    show(message, type = 'info', duration = 3500) {
        const colors = this.themeManager.getColors();
        const toastColors = {
            success: colors.success,
            warning: colors.warning,
            error: colors.danger,
            info: colors.accent
        };

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.style.cssText = `
            position: fixed; top: 24px; right: 24px;
            background: ${toastColors[type]}; color: ${colors.textDark};
            padding: 20px 28px; border-radius: 12px;
            font-weight: 700; z-index: 10000;
            animation: slideInRight 0.4s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.4s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 400);
        }, duration);
    }
}

// ===== SISTEMA DE RUTAS =====
class RouterManager {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        this.params = {};

        window.addEventListener('popstate', () => this.handleRouteChange());
        setTimeout(() => this.handleRouteChange(), 100);
    }

    register(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path, params = {}) {
        this.params = params;
        history.pushState(params, '', window.location.origin + window.location.pathname + '#' + path);
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || 'inicio';
        const [route, ...routeParams] = hash.split('/');

        this.currentRoute = route;

        if (routeParams.length > 0) {
            this.params = { ...this.params, routeParams };
        }

        const handler = this.routes.get(route);
        if (handler) {
            try {
                handler(this.params);
            } catch (error) {
                console.error('Error en ruta:', route, error);
                this.navigate('inicio');
            }
        } else {
            this.navigate('inicio');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getParams() {
        return this.params;
    }
}

// ===== SISTEMA DE USUARIO =====
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
            limitaciones: ['artrodesis_lumbar'],
            objetivos: ['ganar_musculo', 'proteccion_lumbares'],
            deporte_preferido: 'futbol',
            actividad_fisica: 'alta'
        });
    }

    loadPreferences() {
        return this.storage.get('preferences', {
            workoutEnabled: true,
            nutritionEnabled: true,
            theme: 'dark',
            language: 'es',
            notifications: true
        });
    }

    calculateNutritionTargets() {
        const profile = this.profile;
        const bmr = this.calculateBMR(profile.peso, profile.altura, profile.edad);
        const tdee = bmr * 1.75;

        return {
            calories: Math.round(tdee),
            protein: Math.round(profile.peso * 2.2),
            carbs: Math.round(tdee * 0.4 / 4),
            fat: Math.round(tdee * 0.25 / 9),
            fiber: 35
        };
    }

    calculateBMR(peso, altura, edad) {
        return (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    }

    updateProfile(data) {
        this.profile = { ...this.profile, ...data };
        this.storage.set('profile', this.profile);
        this.nutritionTargets = this.calculateNutritionTargets();
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: this.profile }));
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

// ===== MÓDULO BASE =====
class BaseModule {
    constructor(name, app) {
        this.name = name;
        this.app = app;
        this.initialized = false;
        this.routes = [];
    }

    async init() {
        if (this.initialized) return;

        console.log(`Inicializando módulo ${this.name}...`);
        await this.onInit();
        this.registerRoutes();
        this.initialized = true;

        console.log(`Módulo ${this.name} inicializado`);
    }

    async onInit() {
        // Override en cada módulo
    }

    registerRoutes() {
        // Override en cada módulo
    }

    isEnabled() {
        return this.app.user.isModuleEnabled(this.name);
    }

    render(container) {
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }
        this.onRender(container);
    }

    onRender(container) {
        // Override en cada módulo
    }

    renderDisabled(container) {
        const colors = this.app.theme.getColors();
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; background: ${colors.background}; border-radius: 20px;">
                <h2 style="color: ${colors.textSecondary}; font-family: 'Bebas Neue', cursive; font-size: 2.5em; margin-bottom: 20px;">
                    📱 MÓDULO ${this.name.toUpperCase()} DESHABILITADO
                </h2>
                <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 32px;">
                    Habilita este módulo desde la configuración
                </p>
                <button onclick="app.navigate('configuracion')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 16px;">
                    IR A CONFIGURACIÓN
                </button>
            </div>
        `;
    }
}

// ===== MÓDULO DE EJERCICIOS =====
class WorkoutModule extends BaseModule {
    constructor(app) {
        super('workout', app);
        this.workoutHistory = {};
        this.exerciseHistory = {};
        this.vetoedExercises = [];

        this.exerciseDB = {
            fuerza_superior: [
                { id: 'fs1', name: 'Press de banca con barra', target: 'Pecho', equipment: 'Barra + banco', description: 'Desarrollo del pectoral mayor', type: 'weight', alternatives: ['fs2'] },
                { id: 'fs2', name: 'Press inclinado con mancuernas', target: 'Pecho', equipment: 'Mancuernas + banco', description: 'Desarrollo del pectoral superior', type: 'weight', alternatives: ['fs1'] }
            ],
            fuerza_inferior: [
                { id: 'fi1', name: 'Sentadilla trasera con barra', target: 'Cuádriceps', equipment: 'Barra + rack', description: 'Ejercicio fundamental para piernas', type: 'weight', alternatives: ['fi2'] },
                { id: 'fi2', name: 'Peso muerto rumano', target: 'Isquios/Glúteos', equipment: 'Barra', description: 'Fortalecimiento de cadena posterior', type: 'weight', alternatives: ['fi1'] }
            ]
        };
    }

    async onInit() {
        this.loadData();
    }

    registerRoutes() {
        this.app.router.register('workout', () => this.showWorkoutView());
        this.app.router.register('workout-detail', (params) => this.showWorkoutDetail(params.routeParams));
    }

    loadData() {
        this.workoutHistory = this.app.storage.get('workout_history', {});
        this.exerciseHistory = this.app.storage.get('exercise_history', {});
        this.vetoedExercises = this.app.storage.get('vetoed_exercises', []);
    }

    showWorkoutView() {
        const container = document.getElementById('main-content');
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }

        const colors = this.app.theme.getColors();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">💪 MÓDULO DE EJERCICIOS</h2>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-bottom: 40px;">
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px;">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive;">📅 RUTINA DE HOY</h3>
                        <p style="color: ${colors.textSecondary}; margin-bottom: 24px;">Plan personalizado con seguimiento de pesos y series</p>
                        <button onclick="app.navigate('workout-detail')" style="width: 100%; background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">
                            VER RUTINA COMPLETA
                        </button>
                    </div>

                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px;">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive;">📊 PROGRESO</h3>
                        <div style="text-align: center;">
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${Object.keys(this.exerciseHistory).length}</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">EJERCICIOS REGISTRADOS</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showWorkoutDetail() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();

        const exercises = this.exerciseDB.fuerza_superior.concat(this.exerciseDB.fuerza_inferior);

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('workout')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← VOLVER</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">💪 RUTINA COMPLETA</h2>

                ${exercises.map((exercise, index) => `
                    <div class="exercise-container" id="exercise-${exercise.id}" style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-family: 'Bebas Neue', cursive; font-size: 2em;">${exercise.name}</h3>
                            <div style="display: flex; gap: 12px;">
                                <button onclick="app.workoutModule.substituteExercise('${exercise.id}')" style="background: ${colors.warning}; color: ${colors.textDark}; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.8em;">🔄 SUSTITUIR</button>
                                <button onclick="app.workoutModule.vetoExercise('${exercise.id}')" style="background: ${colors.danger}; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.8em;">❌ VETAR</button>
                                <button onclick="app.workoutModule.completeExercise('${exercise.id}')" style="background: ${colors.success}; color: ${colors.textDark}; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.8em;">✅ COMPLETADO</button>
                            </div>
                        </div>
                        <p style="color: ${colors.textSecondary}; margin-bottom: 24px; font-size: 1.1em;">${exercise.description}</p>

                        <div id="sets-container-${exercise.id}" style="margin-bottom: 20px;">
                            ${this.generateSetsHTML(exercise, colors)}
                        </div>

                        <button onclick="app.workoutModule.addSet('${exercise.id}')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 700;">+ AÑADIR SERIE</button>
                    </div>
                `).join('')}

                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="app.workoutModule.saveProgress()" style="background: ${colors.success}; color: ${colors.textDark}; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">
                        💾 GUARDAR PROGRESO
                    </button>
                </div>
            </div>
        `;
    }

    generateSetsHTML(exercise, colors) {
        let setsHTML = '';
        for (let i = 0; i < 3; i++) {
            setsHTML += `
                <div class="set-row" style="display: grid; grid-template-columns: 40px 1fr 1fr auto; gap: 12px; align-items: center; padding: 12px; margin-bottom: 8px; background: ${colors.primary}; border-radius: 8px;">
                    <div style="font-weight: 700; color: ${colors.text}; text-align: center;">${i + 1}</div>
                    <div>
                        <input type="number" placeholder="Reps" onchange="app.workoutModule.updateSet('${exercise.id}', ${i}, 'reps', this.value)" style="width: 100%; padding: 8px; border: 2px solid ${colors.border}; border-radius: 6px; background: ${colors.background}; color: ${colors.textDark}; text-align: center; font-weight: 600;">
                        <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px;">REPS</div>
                    </div>
                    <div>
                        <input type="number" step="0.5" placeholder="${exercise.type === 'time' ? 'Segundos' : 'Peso'}" onchange="app.workoutModule.updateSet('${exercise.id}', ${i}, '${exercise.type === 'time' ? 'time' : 'weight'}', this.value)" style="width: 100%; padding: 8px; border: 2px solid ${colors.border}; border-radius: 6px; background: ${colors.background}; color: ${colors.textDark}; text-align: center; font-weight: 600;">
                        <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px;">${exercise.type === 'time' ? 'SEG' : 'KG'}</div>
                    </div>
                    <button onclick="app.workoutModule.removeSet('${exercise.id}', ${i})" style="background: ${colors.danger}; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 700;">✕</button>
                </div>
            `;
        }
        return setsHTML;
    }

    updateSet(exerciseId, setIndex, field, value) {
        if (!this.exerciseHistory[exerciseId]) {
            this.exerciseHistory[exerciseId] = [];
        }

        const today = new Date().toISOString().split('T')[0];
        let todayWorkout = this.exerciseHistory[exerciseId].find(w => w.date === today);

        if (!todayWorkout) {
            todayWorkout = { date: today, sets: 3, data: [] };
            this.exerciseHistory[exerciseId].push(todayWorkout);
        }

        if (!todayWorkout.data[setIndex]) {
            todayWorkout.data[setIndex] = {};
        }

        todayWorkout.data[setIndex][field] = parseFloat(value) || 0;
        this.app.storage.set('exercise_history', this.exerciseHistory);
    }

    addSet(exerciseId) {
        const container = document.getElementById(`sets-container-${exerciseId}`);
        if (!container) return;

        const colors = this.app.theme.getColors();
        const setIndex = container.children.length;

        const newSetHTML = `
            <div class="set-row" style="display: grid; grid-template-columns: 40px 1fr 1fr auto; gap: 12px; align-items: center; padding: 12px; margin-bottom: 8px; background: ${colors.primary}; border-radius: 8px;">
                <div style="font-weight: 700; color: ${colors.text}; text-align: center;">${setIndex + 1}</div>
                <div>
                    <input type="number" placeholder="Reps" onchange="app.workoutModule.updateSet('${exerciseId}', ${setIndex}, 'reps', this.value)" style="width: 100%; padding: 8px; border: 2px solid ${colors.border}; border-radius: 6px; background: ${colors.background}; color: ${colors.textDark}; text-align: center; font-weight: 600;">
                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px;">REPS</div>
                </div>
                <div>
                    <input type="number" step="0.5" placeholder="Peso" onchange="app.workoutModule.updateSet('${exerciseId}', ${setIndex}, 'weight', this.value)" style="width: 100%; padding: 8px; border: 2px solid ${colors.border}; border-radius: 6px; background: ${colors.background}; color: ${colors.textDark}; text-align: center; font-weight: 600;">
                    <div style="text-align: center; font-size: 0.8em; color: ${colors.textSecondary}; margin-top: 4px;">KG</div>
                </div>
                <button onclick="app.workoutModule.removeSet('${exerciseId}', ${setIndex})" style="background: ${colors.danger}; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 700;">✕</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', newSetHTML);
        this.app.notifications.show('Serie añadida', 'success', 2000);
    }

    removeSet(exerciseId, setIndex) {
        const container = document.getElementById(`sets-container-${exerciseId}`);
        if (!container || container.children.length <= 1) return;

        if (container.children[setIndex]) {
            container.children[setIndex].remove();
            this.app.notifications.show('Serie eliminada', 'info', 2000);
        }
    }

    substituteExercise(exerciseId) {
        this.app.notifications.show('Ejercicio sustituido', 'info');
    }

    vetoExercise(exerciseId) {
        if (!this.vetoedExercises.includes(exerciseId)) {
            this.vetoedExercises.push(exerciseId);
            this.app.storage.set('vetoed_exercises', this.vetoedExercises);
            this.app.notifications.show('Ejercicio vetado', 'warning');

            const exerciseContainer = document.getElementById(`exercise-${exerciseId}`);
            if (exerciseContainer) {
                exerciseContainer.style.opacity = '0.5';
                exerciseContainer.style.pointerEvents = 'none';
            }
        }
    }

    completeExercise(exerciseId) {
        const exerciseContainer = document.getElementById(`exercise-${exerciseId}`);
        if (exerciseContainer) {
            const colors = this.app.theme.getColors();
            exerciseContainer.style.background = colors.success;

            const today = new Date().toISOString().split('T')[0];
            if (!this.workoutHistory[today]) {
                this.workoutHistory[today] = { completed: [], timestamp: Date.now() };
            }

            if (!this.workoutHistory[today].completed.includes(exerciseId)) {
                this.workoutHistory[today].completed.push(exerciseId);
                this.app.storage.set('workout_history', this.workoutHistory);
            }

            this.app.notifications.show('¡Ejercicio completado! 🎉', 'success');
        }
    }

    saveProgress() {
        const today = new Date().toISOString().split('T')[0];
        this.workoutHistory[today] = {
            completed: true,
            timestamp: Date.now()
        };
        this.app.storage.set('workout_history', this.workoutHistory);
        this.app.storage.set('exercise_history', this.exerciseHistory);
        this.app.notifications.show('¡Progreso guardado exitosamente! 💪', 'success');
    }
}

// ===== MÓDULO DE NUTRICIÓN =====
class NutritionModule extends BaseModule {
    constructor(app) {
        super('nutrition', app);
        this.mealHistory = {};
        this.currentMealPlan = null;
        this.extraMeals = [];

        this.nutritionDB = {
            'Café con leche': { calories: 50, protein: 3, carbs: 6, fat: 2, fiber: 0 },
            'Tostada integral': { calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 2 },
            'Huevos': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
            'Plátano': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
            'Pechugas de pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
            'Atún en lata': { calories: 116, protein: 25, carbs: 0, fat: 0.8, fiber: 0 },
            'Brócoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
            'Arroz integral': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 }
        };
    }

    async onInit() {
        this.loadData();
    }

    registerRoutes() {
        this.app.router.register('nutrition', () => this.showNutritionView());
        this.app.router.register('meal-plan', () => this.showMealPlan());
    }

    loadData() {
        this.mealHistory = this.app.storage.get('meal_history', {});
        this.extraMeals = this.app.storage.get('extra_meals', []);
    }

    showNutritionView() {
        const container = document.getElementById('main-content');
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }

        const colors = this.app.theme.getColors();
        const targets = this.app.user.getNutritionTargets();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">🍽️ MÓDULO DE NUTRICIÓN</h2>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-bottom: 40px;">
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px;">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive;">🎯 OBJETIVOS DIARIOS</h3>
                        <div style="margin-bottom: 24px;">
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Calorías:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">${targets.calories} KCAL</span>
                            </div>
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Proteína:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">${targets.protein}G</span>
                            </div>
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                <strong style="color: ${colors.textDark};">Carbohidratos:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">${targets.carbs}G</span>
                            </div>
                        </div>
                        <button onclick="app.navigate('meal-plan')" style="width: 100%; background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">
                            VER PLAN COMPLETO
                        </button>
                    </div>

                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px;">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive;">📊 SEGUIMIENTO</h3>
                        <div style="text-align: center;">
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${Object.keys(this.nutritionDB).length}</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">INGREDIENTES</div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.secondary}; font-family: 'Bebas Neue', cursive;">92%</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">ADHERENCIA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async showMealPlan() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();
        const mealPlan = await this.generateMealPlan();
        const targets = this.app.user.getNutritionTargets();

        this.currentMealPlan = mealPlan;

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('nutrition')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700;">← VOLVER</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em;">🍽️ PLAN NUTRICIONAL EDITABLE</h2>

                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px;">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; text-align: center; font-family: 'Bebas Neue', cursive; font-size: 2em;">📊 TOTALES DIARIOS</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; text-align: center;">
                        <div style="padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 3px solid ${this.getStatusColor(mealPlan.dailyTotals.calories, targets.calories, colors)};">
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.text}; font-family: 'Bebas Neue', cursive;">${Math.round(mealPlan.dailyTotals.calories)}</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">KCAL</div>
                            <div style="font-size: 0.8em; color: ${this.getStatusColor(mealPlan.dailyTotals.calories, targets.calories, colors)}; font-weight: 600; margin-top: 4px;">Meta: ${targets.calories}</div>
                        </div>
                        <div style="padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 3px solid ${this.getStatusColor(mealPlan.dailyTotals.protein, targets.protein, colors)};">
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.text}; font-family: 'Bebas Neue', cursive;">${Math.round(mealPlan.dailyTotals.protein * 10) / 10}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">PROTEÍNA</div>
                            <div style="font-size: 0.8em; color: ${this.getStatusColor(mealPlan.dailyTotals.protein, targets.protein, colors)}; font-weight: 600; margin-top: 4px;">Meta: ${targets.protein}g</div>
                        </div>
                        <div style="padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 3px solid ${this.getStatusColor(mealPlan.dailyTotals.carbs, targets.carbs, colors)};">
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.text}; font-family: 'Bebas Neue', cursive;">${Math.round(mealPlan.dailyTotals.carbs * 10) / 10}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">CARBOHIDRATOS</div>
                            <div style="font-size: 0.8em; color: ${this.getStatusColor(mealPlan.dailyTotals.carbs, targets.carbs, colors)}; font-weight: 600; margin-top: 4px;">Meta: ${targets.carbs}g</div>
                        </div>
                        <div style="padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 3px solid ${this.getStatusColor(mealPlan.dailyTotals.fat, targets.fat, colors)};">
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.text}; font-family: 'Bebas Neue', cursive;">${Math.round(mealPlan.dailyTotals.fat * 10) / 10}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">GRASA</div>
                            <div style="font-size: 0.8em; color: ${this.getStatusColor(mealPlan.dailyTotals.fat, targets.fat, colors)}; font-weight: 600; margin-top: 4px;">Meta: ${targets.fat}g</div>
                        </div>
                    </div>
                </div>

                ${mealPlan.meals.map(meal => `
                    <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-family: 'Bebas Neue', cursive; font-size: 2.2em;">${meal.name}</h3>
                            <span style="color: ${colors.secondary}; font-weight: 700;">${meal.time}</span>
                        </div>

                        ${meal.ingredients.map(ingredient => `
                            <div style="background: ${colors.primary}; padding: 20px; border-radius: 15px; margin-bottom: 16px;">
                                <div style="display: grid; grid-template-columns: 2fr 120px 100px 60px; gap: 12px; margin-bottom: 16px; align-items: center;">
                                    <div>
                                        <label style="display: block; margin-bottom: 8px; font-weight: 700; color: ${colors.text}; font-size: 0.85em; text-transform: uppercase;">ALIMENTO:</label>
                                        <input type="text" value="${ingredient.name}" style="width: 100%; padding: 12px; border: 2px solid ${colors.border}; border-radius: 8px; background: ${colors.background}; color: ${colors.textDark}; font-weight: 500;">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 8px; font-weight: 700; color: ${colors.text}; font-size: 0.85em; text-transform: uppercase; text-align: center;">CANTIDAD:</label>
                                        <input type="number" value="${ingredient.quantity}" step="0.1" style="width: 100%; padding: 12px; border: 2px solid ${colors.border}; border-radius: 8px; background: ${colors.background}; color: ${colors.textDark}; text-align: center; font-weight: 500;">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 8px; font-weight: 700; color: ${colors.text}; font-size: 0.85em; text-transform: uppercase; text-align: center;">UNIDAD:</label>
                                        <select style="width: 100%; padding: 12px; border: 2px solid ${colors.border}; border-radius: 8px; background: ${colors.background}; color: ${colors.textDark}; font-weight: 500; text-align: center;">
                                            <option value="gramos" ${ingredient.unit === 'gramos' ? 'selected' : ''}>g</option>
                                            <option value="unidades" ${ingredient.unit === 'unidades' ? 'selected' : ''}>ud</option>
                                            <option value="mililitros" ${ingredient.unit === 'mililitros' ? 'selected' : ''}>ml</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 8px; font-weight: 700; color: ${colors.text}; font-size: 0.85em; text-transform: uppercase; text-align: center;">CRUDO:</label>
                                        <input type="checkbox" ${ingredient.raw ? 'checked' : ''} style="width: 20px; height: 20px; margin: 10px auto; display: block;">
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; font-size: 0.9em; padding: 16px; background: ${colors.secondary}; border-radius: 10px;">
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${Math.round(ingredient.calories)}</div>
                                        <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.8; font-weight: 600;">KCAL</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${Math.round(ingredient.protein * 10) / 10}g</div>
                                        <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.8; font-weight: 600;">PROT</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${Math.round(ingredient.carbs * 10) / 10}g</div>
                                        <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.8; font-weight: 600;">CARB</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${Math.round(ingredient.fat * 10) / 10}g</div>
                                        <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.8; font-weight: 600;">GRASA</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${Math.round(ingredient.fiber * 10) / 10}g</div>
                                        <div style="font-size: 0.8em; color: ${colors.textDark}; opacity: 0.8; font-weight: 600;">FIBRA</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}

                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px;">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em;">🍴 COMIDAS NO PLANIFICADAS</h3>
                    <div id="extra-meals-container">
                        ${this.extraMeals.length === 0 ? '<p style="color: ' + colors.textSecondary + '; text-align: center;">No hay comidas adicionales</p>' : ''}
                    </div>
                    <button onclick="app.nutritionModule.addExtraMeal()" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 16px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase;">
                        + AÑADIR COMIDA NO PLANIFICADA
                    </button>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="app.nutritionModule.saveMealPlan()" style="background: ${colors.success}; color: ${colors.textDark}; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; margin: 12px; text-transform: uppercase;">
                        💾 GUARDAR PLAN
                    </button>
                    <button onclick="app.nutritionModule.generateNewPlan()" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; margin: 12px; text-transform: uppercase;">
                        🔄 REGENERAR
                    </button>
                </div>
            </div>
        `;
    }

    getStatusColor(current, target, colors) {
        const percentage = (current / target) * 100;
        if (percentage >= 90 && percentage <= 110) {
            return colors.success;
        } else if (percentage >= 80 && percentage <= 120) {
            return colors.warning;
        } else {
            return colors.danger;
        }
    }

    async generateMealPlan() {
        const targets = this.app.user.getNutritionTargets();
        const meals = [];

        // DESAYUNO POR DEFECTO (Café + tostada + huevos + plátano)
        const breakfast = {
            id: 'breakfast',
            name: '🌅 DESAYUNO',
            time: '7:30',
            ingredients: [
                this.createIngredient('Café con leche', 200, 'mililitros'),
                this.createIngredient('Tostada integral', 2, 'unidades'),
                this.createIngredient('Huevos', 2, 'unidades'),
                this.createIngredient('Plátano', 1, 'unidades')
            ]
        };
        meals.push(breakfast);

        // ALMUERZO
        const snack = {
            id: 'snack',
            name: '☕ ALMUERZO',
            time: 'En cafetería',
            ingredients: [
                this.createIngredient('Café con leche', 1, 'unidades', false, { calories: 50, protein: 3, carbs: 6, fat: 2, fiber: 0 })
            ]
        };
        meals.push(snack);

        // COMIDA
        const lunch = {
            id: 'comida',
            name: '🍽️ COMIDA',
            time: '17:00',
            ingredients: [
                this.createIngredient('Pechugas de pollo', 150, 'gramos'),
                this.createIngredient('Brócoli', 200, 'gramos'),
                this.createIngredient('Arroz integral', 80, 'gramos')
            ]
        };
        meals.push(lunch);

        // CENA
        const dinner = {
            id: 'cena',
            name: '🌙 CENA',
            time: '21:00',
            ingredients: [
                this.createIngredient('Atún en lata', 100, 'gramos'),
                this.createIngredient('Brócoli', 150, 'gramos')
            ]
        };
        meals.push(dinner);

        // Calcular totales diarios
        const dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        meals.forEach(meal => {
            meal.ingredients.forEach(ingredient => {
                dailyTotals.calories += ingredient.calories;
                dailyTotals.protein += ingredient.protein;
                dailyTotals.carbs += ingredient.carbs;
                dailyTotals.fat += ingredient.fat;
                dailyTotals.fiber += ingredient.fiber || 0;
            });
        });

        return {
            meals: meals,
            dailyTotals: dailyTotals,
            targets: targets
        };
    }

    createIngredient(name, quantity, unit, raw = false, customNutrition = null) {
        const nutritionData = customNutrition || this.nutritionDB[name];
        let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        if (nutritionData) {
            const multiplier = this.getQuantityMultiplier(quantity, unit, name);
            nutrition = {
                calories: (nutritionData.calories * multiplier),
                protein: (nutritionData.protein * multiplier),
                carbs: (nutritionData.carbs * multiplier),
                fat: (nutritionData.fat * multiplier),
                fiber: (nutritionData.fiber * multiplier)
            };
        }

        return {
            id: 'ingredient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name,
            quantity: quantity,
            unit: unit,
            raw: raw,
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            fiber: nutrition.fiber
        };
    }

    getQuantityMultiplier(quantity, unit, ingredientName) {
        if (unit === 'gramos') {
            return quantity / 100;
        } else if (unit === 'unidades') {
            const unitWeights = {
                'Huevos': 60,
                'Plátano': 120,
                'Tostada integral': 30
            };
            const weight = unitWeights[ingredientName] || 100;
            return (quantity * weight) / 100;
        } else if (unit === 'mililitros') {
            return quantity / 100;
        }
        return quantity / 100;
    }

    addExtraMeal() {
        const newMeal = {
            id: 'extra_' + Date.now(),
            name: 'Nueva comida',
            description: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        };

        this.extraMeals.push(newMeal);
        this.app.notifications.show('Comida no planificada añadida', 'success', 2000);
    }

    saveMealPlan() {
        const today = new Date().toISOString().split('T')[0];
        this.mealHistory[today] = {
            plan: this.currentMealPlan,
            saved: true,
            timestamp: Date.now()
        };
        this.app.storage.set('meal_history', this.mealHistory);
        this.app.notifications.show('¡Plan nutricional guardado! 📊', 'success');
    }

    generateNewPlan() {
        this.app.notifications.show('Generando nuevo plan...', 'info');
        setTimeout(() => {
            this.showMealPlan();
        }, 1000);
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SuloFitnessApp, WorkoutModule, NutritionModule };
}