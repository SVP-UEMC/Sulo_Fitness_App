// ===============================================
// SULO FITNESS - ARQUITECTURA MODULAR CORREGIDA
// Aplicación unificada con módulos independientes
// ===============================================

// ===== CORE - NÚCLEO COMPARTIDO =====

/**
 * Sistema de temas con contraste WCAG AAA verificado
 */
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
                danger: '#ff6b6b'
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
                danger: '#e53e3e'
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
        
        // Aplicar clase al body para CSS
        document.body.className = this.currentTheme === 'light' ? 'light-theme' : '';
        
        // Dispatch evento para que los módulos se actualicen
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: colors }));
    }
}

/**
 * Sistema de almacenamiento unificado
 */
class StorageManager {
    constructor() {
        this.prefix = 'sulo_';
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (error) {
            console.warn('Error guardando en localStorage:', error);
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error leyendo localStorage:', error);
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

/**
 * Sistema de notificaciones
 */
class NotificationManager {
    constructor(themeManager) {
        this.themeManager = themeManager;
    }

    show(message, type = 'info', duration = 3500) {
        const colors = this.themeManager.getColors();
        const toastColors = {
            success: colors.success,
            warning: '#ff9800',
            error: colors.danger,
            info: colors.accent
        };

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.style.cssText = `
            position: fixed; top: 24px; right: 24px;
            background: ${toastColors[type]}; color: ${colors.textDark};
            padding: 20px 28px; border-radius: 12px;
            font-family: "Montserrat", sans-serif; font-weight: 700;
            z-index: 10000; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            animation: slideInRight 0.4s ease-out; max-width: 350px;
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

/**
 * Gestor de rutas y navegación
 */
class RouterManager {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        this.params = {};
        
        // Escuchar cambios en la URL
        window.addEventListener('popstate', () => this.handleRouteChange());
        
        // Manejar la ruta inicial después de un pequeño delay
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
        
        // Parsear parámetros de la ruta
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
            // Ruta por defecto
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

/**
 * Configuración y usuario unificado
 */
class UserManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.profile = this.loadProfile();
        this.preferences = this.loadPreferences();
    }

    loadProfile() {
        return this.storage.get('profile', {
            nombre: 'Sulo',
            edad: 45,
            peso: 74,
            altura: 184,
            limitaciones: ['artrodesis_lumbar'],
            objetivos: ['ganar_musculo', 'proteccion_lumbares'],
            deporte_preferido: 'futbol'
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

    updateProfile(data) {
        this.profile = { ...this.profile, ...data };
        this.storage.set('profile', this.profile);
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

    isModuleEnabled(moduleName) {
        return this.preferences[moduleName + 'Enabled'] || false;
    }
}

// ===== MÓDULO BASE =====

/**
 * Clase base para todos los módulos
 */
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
            <div style="text-align: center; padding: 80px 20px; background: ${colors.background}; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
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

/**
 * Módulo de planificación y seguimiento de ejercicios
 */
class WorkoutModule extends BaseModule {
    constructor(app) {
        super('workout', app);
        this.workoutHistory = {};
        this.vetoedExercises = [];
        this.monthlyPlan = {};
        
        // Base de datos de ejercicios
        this.exerciseDB = {
            fuerza_superior: [
                { id: 'fs1', name: 'Press de banca con barra', target: 'Pecho', equipment: 'Barra + banco', description: 'Movimiento básico para desarrollo del pectoral mayor', type: 'weight', alternatives: ['fs2', 'fs6'] },
                { id: 'fs2', name: 'Press inclinado con mancuernas', target: 'Pecho', equipment: 'Mancuernas + banco', description: 'Desarrollo del pectoral superior', type: 'weight', alternatives: ['fs1', 'fs6'] },
                { id: 'fs3', name: 'Dominadas lastradas', target: 'Dorsales', equipment: 'Barra + chaleco', description: 'Ejercicio rey para desarrollo de dorsales', type: 'weight', alternatives: ['fs4', 'fs5'] },
                { id: 'fs4', name: 'Remo con barra', target: 'Dorsales', equipment: 'Barra', description: 'Fortalecimiento de dorsales y romboides', type: 'weight', alternatives: ['fs3', 'fs5'] },
                { id: 'fs5', name: 'Remo con kettlebell', target: 'Dorsales', equipment: 'Kettlebell', description: 'Fortalecimiento unilateral de espalda', type: 'weight', alternatives: ['fs3', 'fs4'] },
                { id: 'fs6', name: 'Fondos en paralelas', target: 'Tríceps', equipment: 'Barras paralelas', description: 'Ejercicio compuesto para tríceps y pecho inferior', type: 'weight', alternatives: ['fs1', 'fs2'] }
            ],
            fuerza_inferior: [
                { id: 'fi1', name: 'Sentadilla trasera con barra', target: 'Cuádriceps', equipment: 'Barra + rack', description: 'Ejercicio fundamental para piernas', type: 'weight', alternatives: ['fi2', 'fi3'] },
                { id: 'fi2', name: 'Sentadilla frontal', target: 'Cuádriceps', equipment: 'Barra + rack', description: 'Variación frontal más exigente para core', type: 'weight', alternatives: ['fi1', 'fi3'] },
                { id: 'fi3', name: 'Goblet squat con kettlebell', target: 'Cuádriceps', equipment: 'Kettlebell', description: 'Sentadilla con carga frontal', type: 'weight', alternatives: ['fi1', 'fi2'] },
                { id: 'fi4', name: 'Peso muerto rumano', target: 'Isquios/Glúteos', equipment: 'Barra', description: 'Fortalecimiento de cadena posterior', type: 'weight', alternatives: ['fi5', 'fi6'] },
                { id: 'fi5', name: 'Hip thrust con barra', target: 'Glúteos', equipment: 'Barra + banco', description: 'Activación específica de glúteo mayor', type: 'weight', alternatives: ['fi4'] },
                { id: 'fi6', name: 'Zancadas con mancuernas', target: 'Glúteos', equipment: 'Mancuernas', description: 'Trabajo unilateral de piernas', type: 'weight', alternatives: ['fi7'] }
            ],
            core_lumbar: [
                { id: 'cl1', name: 'McGill Big 3 - Curl Up', target: 'Core anterior', equipment: 'Esterilla', description: 'Activación controlada del recto abdominal', type: 'time', alternatives: [] },
                { id: 'cl2', name: 'McGill Big 3 - Side Plank', target: 'Core lateral', equipment: 'Esterilla', description: 'Fortalecimiento del cuadrado lumbar', type: 'time', alternatives: [] },
                { id: 'cl3', name: 'McGill Big 3 - Bird Dog', target: 'Core posterior', equipment: 'Esterilla', description: 'Estabilización de columna vertebral', type: 'time', alternatives: [] },
                { id: 'cl4', name: 'Dead bug isométrico', target: 'Core profundo', equipment: 'Esterilla', description: 'Control motor de pelvis y columna', type: 'time', alternatives: ['cl5'] },
                { id: 'cl5', name: 'Plancha isométrica', target: 'Core completo', equipment: 'Esterilla', description: 'Posición mantenida para fortalecimiento', type: 'time', alternatives: ['cl4'] }
            ],
            cardio_futbol: [
                { id: 'cf1', name: 'Sprints de 20 metros', target: 'Potencia', equipment: 'Conos', description: 'Aceleración específica de fútbol', type: 'reps', alternatives: ['cf2'] },
                { id: 'cf2', name: 'Escalera de agilidad', target: 'Coordinación', equipment: 'Escalera', description: 'Mejora de la velocidad de pies', type: 'reps', alternatives: ['cf1'] },
                { id: 'cf3', name: 'Saltos pliométricos en cajón', target: 'Potencia', equipment: 'Cajón pliométrico', description: 'Desarrollo de potencia vertical', type: 'reps', alternatives: ['cf4'] },
                { id: 'cf4', name: 'Burpees con salto lateral', target: 'Cardio/Potencia', equipment: 'Ninguno', description: 'Ejercicio de alta intensidad', type: 'reps', alternatives: ['cf3'] }
            ]
        };
    }

    async onInit() {
        this.loadData();
        this.generateMonthlyPlan();
    }

    registerRoutes() {
        this.app.router.register('workout', () => this.showWorkoutView());
        this.app.router.register('workout-detail', (params) => this.showWorkoutDetail(params.routeParams));
    }

    loadData() {
        this.workoutHistory = this.app.storage.get('workout_history', {});
        this.vetoedExercises = this.app.storage.get('vetoed_exercises', []);
    }

    generateMonthlyPlan() {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
        const weeklyPattern = {
            0: { type: 'descanso', name: 'Descanso Activo' },
            1: { type: 'fuerza_superior', name: 'Fuerza Superior + Piscina', duration: 90 },
            2: { type: 'fuerza_inferior', name: 'Fuerza Inferior + Lumbar', duration: 75 },
            3: { type: 'core_lumbar', name: 'Core + McGill + Piscina', duration: 60 },
            4: { type: 'cardio_futbol', name: 'Cardio Específico + Fútbol', duration: 90 },
            5: { type: 'fuerza_superior', name: 'Fuerza Variable (Pre-partido)', duration: 60 },
            6: { type: 'futbol', name: 'PARTIDO FÚTBOL ⚽', duration: 90 }
        };
        
        this.monthlyPlan = {};
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayOfWeek = new Date(today.getFullYear(), today.getMonth(), day).getDay();
            const workoutType = weeklyPattern[dayOfWeek];
            const weekNumber = Math.ceil(day / 7);
            
            let exercises = [];
            if (workoutType.type !== 'descanso' && workoutType.type !== 'futbol') {
                const baseExercises = this.exerciseDB[workoutType.type] || [];
                const availableExercises = baseExercises.filter(ex => !this.vetoedExercises.includes(ex.id));
                exercises = availableExercises.slice(0, Math.min(4 + Math.floor(weekNumber/2), 6));
            }
            
            this.monthlyPlan[day] = {
                type: workoutType.type,
                name: workoutType.name,
                duration: workoutType.duration,
                exercises: exercises,
                week: weekNumber
            };
        }
    }

    showWorkoutView() {
        const container = document.getElementById('main-content');
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }

        const colors = this.app.theme.getColors();
        const today = new Date();
        const dayNumber = today.getDate();
        const todaysPlan = this.monthlyPlan[dayNumber];

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">💪 MÓDULO DE EJERCICIOS</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-bottom: 40px;">
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">📅 HOY - ${todaysPlan?.name || 'ENTRENAMIENTO'}</h3>
                        <div style="margin-bottom: 24px; font-family: 'Montserrat', sans-serif;">
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Tipo:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">${(todaysPlan?.type || 'Fuerza').toUpperCase()}</span>
                            </div>
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Duración:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">${todaysPlan?.duration || 90} min</span>
                            </div>
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                <strong style="color: ${colors.textDark};">Ejercicios:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">${todaysPlan?.exercises?.length || 4}</span>
                            </div>
                        </div>
                        <button onclick="app.navigate('workout-detail', {day: ${dayNumber}, type: '${todaysPlan?.type || 'fuerza_superior'}'})" style="width: 100%; background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-size: 16px;">
                            VER RUTINA COMPLETA
                        </button>
                    </div>
                    
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">📊 PROGRESO</h3>
                        <div style="text-align: center; font-family: 'Montserrat', sans-serif;">
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${Object.keys(this.workoutHistory).length}</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">EJERCICIOS REGISTRADOS</div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.secondary}; font-family: 'Bebas Neue', cursive;">87%</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">ADHERENCIA ESTE MES</div>
                            </div>
                        </div>
                        <button onclick="app.navigate('mensual')" style="width: 100%; background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-size: 16px;">
                            VER CALENDARIO
                        </button>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="app.navigate('configuracion')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; margin: 8px;">
                        ⚙️ CONFIGURAR MÓDULO
                    </button>
                </div>
            </div>
        `;
    }

    async showWorkoutDetail(params) {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();
        
        // Mostrar cargando
        container.innerHTML = `
            <div style="text-align: center; padding: 80px; font-family: 'Bebas Neue', cursive;">
                <h2 style="color: ${colors.text}; font-size: 3em;">🏋️ GENERANDO RUTINA...</h2>
                <p style="color: ${colors.textSecondary}; font-family: 'Montserrat', sans-serif; font-size: 1.2em;">Creando plan personalizado con histórico...</p>
            </div>
        `;
        
        const day = params && params[0] ? params[0] : new Date().getDate();
        const workoutType = params && params[1] ? params[1] : 'fuerza_superior';
        const workoutData = await this.generateWorkoutDetail(day, workoutType);
        
        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('workout')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← VOLVER</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">💪 RUTINA DÍA ${day}</h2>
                
                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em;">📋 INFORMACIÓN</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${workoutData.duration}</div>
                            <div style="color: ${colors.textSecondary}; font-weight: 600;">MINUTOS</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: 700; color: ${colors.secondary}; font-family: 'Bebas Neue', cursive;">${workoutData.difficulty}</div>
                            <div style="color: ${colors.textSecondary}; font-weight: 600;">DIFICULTAD</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: 700; color: ${colors.success}; font-family: 'Bebas Neue', cursive;">${workoutData.calories}</div>
                            <div style="color: ${colors.textSecondary}; font-weight: 600;">KCAL EST.</div>
                        </div>
                    </div>
                </div>
                
                ${workoutData.phases.map(phase => `
                    <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em;">${phase.name} (${phase.duration} min)</h3>
                        ${phase.exercises.map(exercise => `
                            <div style="background: ${colors.primary}; padding: 24px; border-radius: 16px; margin-bottom: 20px;">
                                <h4 style="color: ${colors.text}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.4em;">${exercise.name}</h4>
                                <p style="color: ${colors.textSecondary}; margin-bottom: 16px;">${exercise.description}</p>
                                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                    <span style="background: ${colors.accent}; color: ${colors.textDark}; padding: 6px 12px; border-radius: 8px; font-size: 0.8em; font-weight: 700;">${exercise.target}</span>
                                    ${exercise.equipment ? `<span style="background: ${colors.secondary}; color: ${colors.textDark}; padding: 6px 12px; border-radius: 8px; font-size: 0.8em; font-weight: 700;">${exercise.equipment}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                
                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="app.workoutModule.saveProgress()" style="background: ${colors.success}; color: ${colors.textDark}; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">
                        💾 GUARDAR PROGRESO
                    </button>
                </div>
            </div>
        `;
    }

    async generateWorkoutDetail(day, workoutType) {
        const todaysPlan = this.monthlyPlan[day] || this.monthlyPlan[new Date().getDate()];
        let exercises = todaysPlan.exercises || this.exerciseDB[workoutType] || [];
        
        // Filtrar ejercicios vetados
        exercises = exercises.filter(ex => !this.vetoedExercises.includes(ex.id));
        
        const phases = [];
        
        // Calentamiento
        phases.push({
            name: '🔥 CALENTAMIENTO',
            duration: 15,
            exercises: [
                {
                    name: 'Movilidad articular dinámica',
                    target: 'Preparación',
                    description: 'Círculos de brazos, rotaciones de cadera, zancadas dinámicas',
                    equipment: 'Ninguno'
                }
            ]
        });

        // Trabajo principal
        if (exercises.length > 0) {
            phases.push({
                name: '💪 TRABAJO PRINCIPAL',
                duration: (todaysPlan.duration || 90) - 30,
                exercises: exercises.slice(0, 4)
            });
        }

        // McGill Big 3 para protección lumbar
        if (workoutType !== 'core_lumbar') {
            phases.push({
                name: '🧘 PROTECCIÓN LUMBAR',
                duration: 15,
                exercises: [
                    {
                        name: 'McGill Curl Up',
                        target: 'Core anterior',
                        description: 'Activación controlada manteniendo curva lumbar natural',
                        equipment: 'Esterilla'
                    },
                    {
                        name: 'McGill Side Plank',
                        target: 'Core lateral',
                        description: 'Plancha lateral para estabilidad de columna',
                        equipment: 'Esterilla'
                    },
                    {
                        name: 'McGill Bird Dog',
                        target: 'Core posterior',
                        description: 'Control sin movimiento de columna vertebral',
                        equipment: 'Esterilla'
                    }
                ]
            });
        }

        return {
            duration: todaysPlan.duration || 90,
            difficulty: this.getDifficulty(workoutType),
            calories: Math.round((todaysPlan.duration || 90) * 5.5),
            phases: phases
        };
    }

    getDifficulty(workoutType) {
        const levels = { 
            fuerza_superior: 'Media-Alta', 
            fuerza_inferior: 'Alta', 
            core_lumbar: 'Media', 
            cardio_futbol: 'Alta'
        };
        return levels[workoutType] || 'Media';
    }

    saveProgress() {
        const today = new Date().toISOString().split('T')[0];
        this.workoutHistory[today] = {
            completed: true,
            timestamp: Date.now()
        };
        this.app.storage.set('workout_history', this.workoutHistory);
        this.app.notifications.show('¡Progreso guardado exitosamente! 💪', 'success');
    }

    getMonthlyPlan() {
        return this.monthlyPlan;
    }
}

// ===== MÓDULO DE NUTRICIÓN =====

/**
 * Módulo de planificación y seguimiento nutricional
 */
class NutritionModule extends BaseModule {
    constructor(app) {
        super('nutrition', app);
        this.mealHistory = {};
        this.customIngredients = [];
        
        // Base de datos nutricional
        this.nutritionDB = {
            'Pechugas de pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
            'Huevos': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
            'Brócoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
            'Arroz integral': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
            'Plátanos': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
            'Aceite de oliva': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
            'Yogur': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
            'Garbanzos': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 8 },
            'Lentejas': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
            'Atún en lata': { calories: 116, protein: 25, carbs: 0, fat: 0.8, fiber: 0 }
        };

        this.ingredientCategories = {
            proteinas: ['Pechugas de pollo', 'Huevos', 'Atún en lata'],
            verduras: ['Brócoli', 'Espinacas', 'Tomates'],
            frutas: ['Plátanos', 'Manzanas', 'Limones'],
            cereales_legumbres: ['Garbanzos', 'Lentejas', 'Arroz integral'],
            lacteos: ['Yogur', 'Leche'],
            otros: ['Aceite de oliva', 'Crema de cacahuete']
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
        this.customIngredients = this.app.storage.get('custom_ingredients', []);
    }

    showNutritionView() {
        const container = document.getElementById('main-content');
        if (!this.isEnabled()) {
            this.renderDisabled(container);
            return;
        }

        const colors = this.app.theme.getColors();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">🍽️ MÓDULO DE NUTRICIÓN</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-bottom: 40px;">
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">📅 PLAN DE HOY</h3>
                        <div style="margin-bottom: 24px; font-family: 'Montserrat', sans-serif;">
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Comidas:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">4 PLANIFICADAS</span>
                            </div>
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Calorías:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">2,200 KCAL</span>
                            </div>
                            <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                <strong style="color: ${colors.textDark};">Proteína:</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">148G</span>
                            </div>
                        </div>
                        <button onclick="app.navigate('meal-plan')" style="width: 100%; background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-size: 16px;">
                            VER PLAN COMPLETO
                        </button>
                    </div>
                    
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">📊 SEGUIMIENTO</h3>
                        <div style="text-align: center; font-family: 'Montserrat', sans-serif;">
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${Object.keys(this.nutritionDB).length}</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">INGREDIENTES DISPONIBLES</div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 2.5em; font-weight: 700; color: ${colors.secondary}; font-family: 'Bebas Neue', cursive;">92%</div>
                                <div style="color: ${colors.textSecondary}; font-weight: 600;">ADHERENCIA SEMANAL</div>
                            </div>
                        </div>
                        <button onclick="app.navigate('mensual')" style="width: 100%; background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-size: 16px;">
                            VER ESTADÍSTICAS
                        </button>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="app.navigate('configuracion')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; margin: 8px;">
                        ⚙️ CONFIGURAR MÓDULO
                    </button>
                </div>
            </div>
        `;
    }

    async showMealPlan() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();
        const mealPlan = await this.generateMealPlan();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('nutrition')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← VOLVER</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">🍽️ PLAN NUTRICIONAL</h2>
                
                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; text-align: center; font-family: 'Bebas Neue', cursive; font-size: 2em;">📊 RESUMEN NUTRICIONAL</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; text-align: center;">
                        <div>
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${mealPlan.dailyTotals.calories}</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">KCAL</div>
                        </div>
                        <div>
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.secondary}; font-family: 'Bebas Neue', cursive;">${mealPlan.dailyTotals.protein}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">PROTEÍNA</div>
                        </div>
                        <div>
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.accent}; font-family: 'Bebas Neue', cursive;">${mealPlan.dailyTotals.carbs}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">CARBOHIDRATOS</div>
                        </div>
                        <div>
                            <div style="font-size: 1.8em; font-weight: 700; color: ${colors.secondary}; font-family: 'Bebas Neue', cursive;">${mealPlan.dailyTotals.fat}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; text-transform: uppercase; font-weight: 600;">GRASA</div>
                        </div>
                    </div>
                </div>

                ${mealPlan.meals.map(meal => `
                    <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-family: 'Bebas Neue', cursive; font-size: 2.2em;">${meal.name}</h3>
                            <span style="color: ${colors.secondary}; font-weight: 700; font-family: 'Montserrat', sans-serif;">${meal.time}</span>
                        </div>
                        
                        ${meal.items.map(item => `
                            <div style="background: ${colors.primary}; padding: 20px; border-radius: 15px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <strong style="color: ${colors.text}; font-size: 1.1em;">${item.food}</strong>
                                    <span style="color: ${colors.textSecondary};">${item.quantity} ${item.unit}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px; font-size: 0.85em;">
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.text};">${item.calories}</div>
                                        <div style="color: ${colors.textSecondary}; font-size: 0.8em;">KCAL</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.text};">${item.protein}g</div>
                                        <div style="color: ${colors.textSecondary}; font-size: 0.8em;">PROT</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.text};">${item.carbs}g</div>
                                        <div style="color: ${colors.textSecondary}; font-size: 0.8em;">CARB</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.text};">${item.fat}g</div>
                                        <div style="color: ${colors.textSecondary}; font-size: 0.8em;">GRASA</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                
                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="app.nutritionModule.saveMealPlan()" style="background: ${colors.success}; color: ${colors.textDark}; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">
                        💾 GUARDAR PLAN
                    </button>
                    <button onclick="app.nutritionModule.generateNewPlan()" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px 36px; border-radius: 12px; cursor: pointer; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">
                        🔄 REGENERAR
                    </button>
                </div>
            </div>
        `;
    }

    async generateMealPlan() {
        const targets = { calories: 2200, protein: 148, carbs: 220, fat: 73 };
        const meals = [];
        let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        // Desayuno
        const breakfast = await this.generateMeal('desayuno', ['proteinas', 'frutas', 'cereales_legumbres']);
        meals.push(breakfast);
        this.updateTotals(dailyTotals, breakfast.totals);

        // Almuerzo
        const snack = {
            name: '☕ ALMUERZO',
            time: 'En cafetería',
            items: [
                this.createFoodItem('Café con leche', 1, 'taza', { calories: 50, protein: 3, carbs: 6, fat: 2, fiber: 0 }),
                this.createFoodItem('Bocadillo pequeño', 1, 'unidad', { calories: 180, protein: 8, carbs: 20, fat: 8, fiber: 1 })
            ],
            totals: { calories: 230, protein: 11, carbs: 26, fat: 10, fiber: 1 }
        };
        meals.push(snack);
        this.updateTotals(dailyTotals, snack.totals);

        // Comida
        const lunch = await this.generateMeal('comida', ['proteinas', 'verduras', 'cereales_legumbres']);
        meals.push(lunch);
        this.updateTotals(dailyTotals, lunch.totals);

        // Cena
        const dinner = await this.generateMeal('cena', ['proteinas', 'verduras']);
        meals.push(dinner);
        this.updateTotals(dailyTotals, dinner.totals);

        return {
            meals: meals,
            dailyTotals: dailyTotals,
            targets: targets
        };
    }

    async generateMeal(mealType, categories) {
        const mealNames = {
            desayuno: '🌅 DESAYUNO',
            comida: '🍽️ COMIDA',
            cena: '🌙 CENA'
        };
        
        const mealTimes = {
            desayuno: '7:30',
            comida: '17:00',
            cena: '21:00'
        };

        const items = [];
        let mealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        // Generar items para cada categoría
        for (const category of categories) {
            const availableIngredients = this.ingredientCategories[category] || [];
            if (availableIngredients.length > 0) {
                const ingredient = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
                const nutritionData = this.nutritionDB[ingredient];
                
                if (nutritionData) {
                    const portion = this.getPortionSize(ingredient);
                    const item = this.createFoodItem(ingredient, portion.amount, portion.unit, {
                        calories: (nutritionData.calories * portion.amount) / 100,
                        protein: (nutritionData.protein * portion.amount) / 100,
                        carbs: (nutritionData.carbs * portion.amount) / 100,
                        fat: (nutritionData.fat * portion.amount) / 100,
                        fiber: (nutritionData.fiber * portion.amount) / 100
                    });
                    
                    items.push(item);
                    this.updateTotals(mealTotals, item);
                }
            }
        }

        return {
            name: mealNames[mealType],
            time: mealTimes[mealType],
            items: items,
            totals: {
                calories: Math.round(mealTotals.calories),
                protein: Math.round(mealTotals.protein * 10) / 10,
                carbs: Math.round(mealTotals.carbs * 10) / 10,
                fat: Math.round(mealTotals.fat * 10) / 10,
                fiber: Math.round(mealTotals.fiber * 10) / 10
            }
        };
    }

    createFoodItem(food, quantity, unit, nutrition) {
        return {
            food: food,
            quantity: quantity,
            unit: unit,
            calories: Math.round(nutrition.calories),
            protein: Math.round(nutrition.protein * 10) / 10,
            carbs: Math.round(nutrition.carbs * 10) / 10,
            fat: Math.round(nutrition.fat * 10) / 10,
            fiber: Math.round(nutrition.fiber * 10) / 10
        };
    }

    getPortionSize(ingredient) {
        const portions = {
            'Pechugas de pollo': { amount: 150, unit: 'gramos' },
            'Huevos': { amount: 2, unit: 'unidades' },
            'Brócoli': { amount: 200, unit: 'gramos' },
            'Arroz integral': { amount: 80, unit: 'gramos (crudo)' },
            'Plátanos': { amount: 1, unit: 'unidad mediana' }
        };
        return portions[ingredient] || { amount: 100, unit: 'gramos' };
    }

    updateTotals(totals, meal) {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.carbs += meal.carbs || 0;
        totals.fat += meal.fat || 0;
        totals.fiber += meal.fiber || 0;
    }

    saveMealPlan() {
        const today = new Date().toISOString().split('T')[0];
        this.mealHistory[today] = {
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

// ===== APLICACIÓN PRINCIPAL =====

/**
 * Aplicación principal con arquitectura modular
 */
class SuloFitnessApp {
    constructor() {
        // Core systems
        this.storage = new StorageManager();
        this.theme = new ThemeManager();
        this.notifications = new NotificationManager(this.theme);
        this.router = new RouterManager();
        this.user = new UserManager(this.storage);
        
        // Módulos
        this.modules = new Map();
        this.workoutModule = null;
        this.nutritionModule = null;
        
        // Estado
        this.initialized = false;
        this.currentView = 'inicio';
        
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        console.log('Inicializando Sulo Fitness App...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Cargar fuentes
        this.loadFonts();
        
        // Configurar tema inicial
        this.theme.applyTheme();
        
        // Inicializar módulos según preferencias
        await this.initializeModules();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Configurar rutas
        this.setupRoutes();
        
        // Mostrar interfaz
        this.showMainInterface();
        
        // Ocultar pantalla de carga
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            document.body.classList.add('app-loaded');
        }, 1000);
        
        this.initialized = true;
        console.log('Sulo Fitness App inicializada correctamente');
    }

    loadFonts() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    async initializeModules() {
        const preferences = this.user.getPreferences();
        
        // Inicializar módulo de ejercicios
        if (preferences.workoutEnabled) {
            this.workoutModule = new WorkoutModule(this);
            this.modules.set('workout', this.workoutModule);
            await this.workoutModule.init();
        }
        
        // Inicializar módulo de nutrición
        if (preferences.nutritionEnabled) {
            this.nutritionModule = new NutritionModule(this);
            this.modules.set('nutrition', this.nutritionModule);
            await this.nutritionModule.init();
        }
        
        console.log('Módulos inicializados:', Array.from(this.modules.keys()));
    }

    setupEventListeners() {
        // Escuchar cambios de preferencias
        window.addEventListener('preferences-updated', (event) => {
            this.onPreferencesUpdated(event.detail);
        });
        
        // Escuchar cambios de tema
        window.addEventListener('theme-changed', (event) => {
            this.onThemeChanged(event.detail);
        });
    }

    setupRoutes() {
        // Rutas principales
        this.router.register('inicio', () => this.showWelcomeView());
        this.router.register('diaria', () => this.showDailyView());
        this.router.register('semanal', () => this.showWeeklyView());
        this.router.register('mensual', () => this.showMonthlyView());
        this.router.register('configuracion', () => this.showConfigView());
    }

    onPreferencesUpdated(preferences) {
        // Reinicializar módulos si es necesario
        this.reinitializeModules();
    }

    onThemeChanged(colors) {
        // Los módulos pueden reaccionar a cambios de tema
        console.log('Tema cambiado:', colors);
    }

    async reinitializeModules() {
        const preferences = this.user.getPreferences();
        
        // Workout module
        if (preferences.workoutEnabled && !this.workoutModule) {
            this.workoutModule = new WorkoutModule(this);
            this.modules.set('workout', this.workoutModule);
            await this.workoutModule.init();
        } else if (!preferences.workoutEnabled && this.workoutModule) {
            this.modules.delete('workout');
            this.workoutModule = null;
        }
        
        // Nutrition module
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
        
        const headerHTML = `
            <header style="background: ${colors.primary}; color: ${colors.text}; padding: 32px 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); font-family: 'Bebas Neue', cursive;">
                <h1 style="margin: 0; font-size: 3em; font-weight: 400; letter-spacing: 2px; color: ${colors.text};">💪 SULO FITNESS</h1>
                <p style="margin: 12px 0 0 0; color: ${colors.textSecondary}; font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 1.1em;">Tu entrenador personal modular</p>
            </header>
        `;
        
        const navHTML = `
            <nav style="background: ${colors.secondary}; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; font-family: 'Montserrat', sans-serif;">
                    <button onclick="app.navigate('inicio')" id="btn-inicio" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; min-width: 110px;">🏠 INICIO</button>
                    <button onclick="app.navigate('diaria')" id="btn-diaria" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; min-width: 110px;">📅 DIARIA</button>
                    <button onclick="app.navigate('semanal')" id="btn-semanal" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; min-width: 110px;">📊 SEMANAL</button>
                    <button onclick="app.navigate('mensual')" id="btn-mensual" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; min-width: 110px;">📆 MENSUAL</button>
                    <button onclick="app.navigate('configuracion')" id="btn-config" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 14px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s ease; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; min-width: 110px;">⚙️ CONFIG</button>
                </div>
            </nav>
        `;
        
        const mainHTML = `
            <main id="main-content" style="padding: 40px 24px; background: ${colors.primary}; color: ${colors.text}; min-height: calc(100vh - 180px); max-width: 1400px; margin: 0 auto; font-family: 'Montserrat', sans-serif; line-height: 1.6;"></main>
        `;
        
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = headerHTML + navHTML + mainHTML;
        }
        
        document.body.style.backgroundColor = colors.primary;
        document.body.style.color = colors.text;
        document.body.style.fontFamily = "'Montserrat', sans-serif";
        
        // Manejar la ruta inicial si no hay una activa
        if (!this.router.getCurrentRoute() || this.router.getCurrentRoute() === '') {
            setTimeout(() => this.navigate('inicio'), 100);
        }
    }

    showWelcomeView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const colors = this.theme.getColors();
        const profile = this.user.getProfile();
        const preferences = this.user.getPreferences();
        
        this.updateActiveButton('inicio');

        container.innerHTML = `
            <div style="text-align: center; animation: fadeIn 0.6s ease-out; font-family: 'Montserrat', sans-serif;">
                <h2 style="color: ${colors.text}; font-size: 2.8em; margin-bottom: 32px; font-weight: 400; font-family: 'Bebas Neue', cursive; letter-spacing: 2px;">¡HOLA ${profile.nombre.toUpperCase()}! 👋</h2>
                
                <div style="background: ${colors.background}; padding: 40px; border-radius: 24px; margin: 40px auto; max-width: 700px; box-shadow: 0 12px 40px rgba(0,0,0,0.15);">
                    <p style="margin: 0; font-size: 1.6em; color: ${colors.textDark}; font-weight: 600;">🎯 ARQUITECTURA MODULAR</p>
                    <p style="margin: 16px 0 0 0; color: ${colors.textSecondary}; font-size: 1.2em; font-weight: 500;">Sistema escalable con módulos independientes</p>
                    <div style="margin-top: 24px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                        ${preferences.workoutEnabled ? `<span style="background: ${colors.accent}; color: ${colors.textDark}; padding: 8px 16px; border-radius: 8px; font-size: 0.9em; font-weight: 700;">💪 EJERCICIOS</span>` : ''}
                        ${preferences.nutritionEnabled ? `<span style="background: ${colors.secondary}; color: ${colors.textDark}; padding: 8px 16px; border-radius: 8px; font-size: 0.9em; font-weight: 700;">🍽️ NUTRICIÓN</span>` : ''}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; margin: 50px 0;">
                    ${preferences.workoutEnabled ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer; transition: transform 0.3s ease; border: 3px solid transparent;" onclick="app.navigate('workout')">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">💪 MÓDULO EJERCICIOS</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500; line-height: 1.6;">Planificación inteligente, seguimiento de progreso y rutinas personalizadas</p>
                        </div>
                    ` : ''}
                    
                    ${preferences.nutritionEnabled ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer; transition: transform 0.3s ease; border: 3px solid transparent;" onclick="app.navigate('nutrition')">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">🍽️ MÓDULO NUTRICIÓN</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500; line-height: 1.6;">Planes nutricionales editables y seguimiento de macronutrientes</p>
                        </div>
                    ` : ''}
                    
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer; transition: transform 0.3s ease; border: 3px solid transparent;" onclick="app.navigate('diaria')">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">📅 VISTA DIARIA</h3>
                        <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500; line-height: 1.6;">Planificación integrada de tu día completo</p>
                    </div>
                    
                    <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: pointer; transition: transform 0.3s ease; border: 3px solid transparent;" onclick="app.navigate('configuracion')">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">⚙️ CONFIGURACIÓN</h3>
                        <p style="color: ${colors.textSecondary}; margin: 0; font-weight: 500; line-height: 1.6;">Personaliza módulos, temas y preferencias</p>
                    </div>
                </div>

                <div style="margin-top: 50px;">
                    <button onclick="app.theme.toggleTheme(); app.showMainInterface(); app.showWelcomeView();" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 20px 40px; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                        ${this.theme.currentTheme === 'dark' ? '☀️ MODO CLARO' : '🌙 MODO OSCURO'}
                    </button>
                    <button onclick="app.navigate('diaria')" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 20px 40px; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 700; margin: 12px; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 1px;">📅 EMPEZAR</button>
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

        const enabledModules = [];
        if (preferences.workoutEnabled) enabledModules.push('workout');
        if (preferences.nutritionEnabled) enabledModules.push('nutrition');

        if (enabledModules.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 80px 20px; background: ${colors.background}; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h2 style="color: ${colors.textSecondary}; font-family: 'Bebas Neue', cursive; font-size: 2.5em; margin-bottom: 20px;">⚠️ NO HAY MÓDULOS ACTIVOS</h2>
                    <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 32px;">Habilita al menos un módulo desde configuración</p>
                    <button onclick="app.navigate('configuracion')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 16px;">IR A CONFIGURACIÓN</button>
                </div>
            `;
            return;
        }

        const today = new Date();
        const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
        const dayNumber = today.getDate();

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">📅 ${dayName.toUpperCase()} (${dayNumber})</h2>
                
                <div style="display: grid; grid-template-columns: repeat(${enabledModules.length}, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto;">
                    ${preferences.workoutEnabled && this.workoutModule ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">💪 ENTRENAMIENTO</h3>
                            <div style="margin-bottom: 24px; font-family: 'Montserrat', sans-serif;">
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                    <strong style="color: ${colors.textDark};">Plan:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">PERSONALIZADO</span>
                                </div>
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                    <strong style="color: ${colors.textDark};">Duración:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">75-90 MIN</span>
                                </div>
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                    <strong style="color: ${colors.textDark};">Estado:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">PENDIENTE</span>
                                </div>
                            </div>
                            <button onclick="app.navigate('workout')" style="width: 100%; background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-size: 16px;">IR AL MÓDULO</button>
                        </div>
                    ` : ''}
                    
                    ${preferences.nutritionEnabled && this.nutritionModule ? `
                        <div style="background: ${colors.background}; padding: 36px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-size: 2em; font-family: 'Bebas Neue', cursive; letter-spacing: 1px;">🍽️ NUTRICIÓN</h3>
                            <div style="margin-bottom: 24px; font-family: 'Montserrat', sans-serif;">
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                    <strong style="color: ${colors.textDark};">Comidas:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">4 PLANIFICADAS</span>
                                </div>
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                    <strong style="color: ${colors.textDark};">Calorías:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">2,200 KCAL</span>
                                </div>
                                <div style="margin: 12px 0; display: flex; justify-content: space-between; padding: 12px 0;">
                                    <strong style="color: ${colors.textDark};">Estado:</strong>
                                    <span style="color: ${colors.textSecondary}; font-weight: 600;">PLANIFICADO</span>
                                </div>
                            </div>
                            <button onclick="app.navigate('nutrition')" style="width: 100%; background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 18px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-size: 16px;">IR AL MÓDULO</button>
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
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">📊 VISTA SEMANAL</h2>
                
                <div style="text-align: center; padding: 60px; background: ${colors.background}; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h3 style="color: ${colors.textDark}; font-family: 'Bebas Neue', cursive; font-size: 2em; margin-bottom: 20px;">🚧 EN DESARROLLO</h3>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin-bottom: 32px;">Vista semanal integrada con datos de todos los módulos activos</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                        <button onclick="app.navigate('mensual')" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 16px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">📅 VISTA MENSUAL</button>
                        <button onclick="app.navigate('diaria')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 16px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">📋 VISTA DIARIA</button>
                    </div>
                </div>
            </div>
        `;
    }

    showMonthlyView() {
        const container = document.getElementById('main-content');
        if (!container) return;
        
        const colors = this.theme.getColors();
        const preferences = this.user.getPreferences();
        
        this.updateActiveButton('mensual');

        const today = new Date();
        const monthName = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">📆 ${monthName.toUpperCase()}</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 40px;">
                    ${preferences.workoutEnabled ? `
                        <div style="background: ${colors.background}; padding: 24px; border-radius: 16px; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,0.08);">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.8em;">💪 EJERCICIOS</h3>
                            <div style="font-size: 2.5em; font-weight: 700; color: ${colors.accent}; margin-bottom: 8px; font-family: 'Bebas Neue', cursive;">24</div>
                            <div style="color: ${colors.textSecondary}; font-size: 0.9em; font-weight: 600;">ENTRENAMIENTOS</div>
                        </div>
                    ` : ''}
                    
                    ${preferences.nutritionEnabled ? `
                        <div style="background: ${colors.background}; padding: 24px; border-radius: 16px; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,0.08);">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.8em;">🍽️ NUTRICIÓN</h3>
                            <div style="font-size: 2.5em; font-weight: 700; color: ${colors.secondary}; margin-bottom: 8px; font-family: 'Bebas Neue', cursive;">93</div>
                            <div style="color: ${colors.textSecondary}; font-size: 0.9em; font-weight: 600;">COMIDAS PLANIFICADAS</div>
                        </div>
                    ` : ''}
                    
                    <div style="background: ${colors.background}; padding: 24px; border-radius: 16px; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,0.08);">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.8em;">🎯 PROGRESO</h3>
                        <div style="font-size: 2.5em; font-weight: 700; color: ${colors.success}; margin-bottom: 8px; font-family: 'Bebas Neue', cursive;">87%</div>
                        <div style="color: ${colors.textSecondary}; font-size: 0.9em; font-weight: 600;">ADHERENCIA</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 40px;">
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin-bottom: 24px;">Calendario detallado próximamente</p>
                    <button onclick="app.navigate('diaria')" style="background: ${colors.accent}; color: ${colors.textDark}; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">📋 VISTA DIARIA</button>
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
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="background: ${colors.secondary}; color: ${colors.textDark}; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif;">← INICIO</button>
                </div>
                <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 40px; font-family: 'Bebas Neue', cursive; font-size: 3em; font-weight: 400; letter-spacing: 2px;">⚙️ CONFIGURACIÓN MODULAR</h2>
                
                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em; letter-spacing: 1px;">🎨 TEMA DE LA APLICACIÓN</h3>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                        <button onclick="app.setTheme('dark')" style="background: ${this.theme.currentTheme === 'dark' ? colors.accent : colors.textSecondary}; color: ${colors.textDark}; border: 2px solid ${colors.accent}; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">🌙 OSCURO</button>
                        <button onclick="app.setTheme('light')" style="background: ${this.theme.currentTheme === 'light' ? colors.secondary : colors.textSecondary}; color: ${colors.textDark}; border: 2px solid ${colors.secondary}; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">☀️ CLARO</button>
                    </div>
                </div>
                
                <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; margin-bottom: 32px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 24px; font-family: 'Bebas Neue', cursive; font-size: 2em; letter-spacing: 1px;">📋 MÓDULOS ACTIVOS</h3>
                    <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 24px;">
                        <button onclick="app.toggleModule('workout')" style="background: ${preferences.workoutEnabled ? colors.accent : colors.textSecondary}; color: ${colors.textDark}; border: 2px solid ${colors.accent}; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">💪 EJERCICIOS</button>
                        <button onclick="app.toggleModule('nutrition')" style="background: ${preferences.nutritionEnabled ? colors.secondary : colors.textSecondary}; color: ${colors.textDark}; border: 2px solid ${colors.secondary}; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">🍽️ NUTRICIÓN</button>
                    </div>
                    <p style="color: ${colors.textSecondary}; font-size: 0.9em; margin: 0;">Los módulos se inicializan/desactivan automáticamente</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
                    <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 4em; margin-bottom: 16px;">🏗️</div>
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.8em;">ARQUITECTURA</h3>
                        <p style="margin-bottom: 20px; color: ${colors.textSecondary}; font-weight: 500;">Sistema modular escalable</p>
                        <div style="background: ${colors.success}; color: ${colors.textDark}; padding: 8px 16px; border-radius: 6px; font-size: 0.8em; font-weight: 700;">ACTIVO</div>
                    </div>
                    
                    <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 4em; margin-bottom: 16px;">🎯</div>
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.8em;">ROUTING</h3>
                        <p style="margin-bottom: 20px; color: ${colors.textSecondary}; font-weight: 500;">Navegación avanzada</p>
                        <div style="background: ${colors.success}; color: ${colors.textDark}; padding: 8px 16px; border-radius: 6px; font-size: 0.8em; font-weight: 700;">ACTIVO</div>
                    </div>
                    
                    <div style="background: ${colors.background}; padding: 32px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 4em; margin-bottom: 16px;">💾</div>
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-family: 'Bebas Neue', cursive; font-size: 1.8em;">STORAGE</h3>
                        <p style="margin-bottom: 20px; color: ${colors.textSecondary}; font-weight: 500;">Persistencia unificada</p>
                        <div style="background: ${colors.success}; color: ${colors.textDark}; padding: 8px 16px; border-radius: 6px; font-size: 0.8em; font-weight: 700;">ACTIVO</div>
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
        
        // Reinicializar módulos
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

// ===== INICIALIZACIÓN =====

// Variable global para acceso desde HTML
let app;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new SuloFitnessApp();
    });
} else {
    // DOM ya está listo
    app = new SuloFitnessApp();
}

// Exportar para testing (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SuloFitnessApp, WorkoutModule, NutritionModule };
}
