// =============================================
// SULO FITNESS - APLICACIÓN MODULAR FUNCIONAL
// Módulos separados: Ejercicios + Nutrición
// =============================================

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    VERSION: '1.0.0',
    STORAGE_KEY: 'sulo-fitness',
    THEME_KEY: 'sulo-theme',
    DEBUG: true
};

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====
class SuloFitnessApp {
    constructor() {
        this.currentView = 'inicio';
        this.currentTheme = 'light';
        this.isInitialized = false;
        
        // Módulos principales
        this.exerciseModule = null;
        this.nutritionModule = null;
        this.storage = null;
        
        console.log('🏋️ Inicializando Sulo Fitness App...');
    }

    // ===== INICIALIZACIÓN =====
    async init() {
        if (this.isInitialized) return;

        try {
            // Inicializar sistemas base
            this.storage = new StorageManager();
            this.loadTheme();
            
            // Inicializar módulos
            this.exerciseModule = new ExerciseModule(this);
            this.nutritionModule = new NutritionModule(this);
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Cargar vista inicial
            await this.loadView('inicio');
            
            // Ocultar loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    hideLoadingScreen() {
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            if (loading) loading.style.display = 'none';
            if (app) app.style.display = 'flex';
        }, 1000);
    }

    // ===== GESTIÓN DE VISTAS =====
    async loadView(viewName) {
        this.currentView = viewName;
        this.updateNavigation();
        
        const content = document.getElementById('main-content');
        if (!content) return;
        
        try {
            let html = '';
            
            switch (viewName) {
                case 'inicio':
                    html = this.getHomeView();
                    break;
                case 'ejercicios':
                    html = await this.exerciseModule.getView();
                    break;
                case 'nutricion':
                    html = await this.nutritionModule.getView();
                    break;
                case 'progreso':
                    html = this.getProgressView();
                    break;
                default:
                    html = this.getHomeView();
            }
            
            content.innerHTML = html;
            content.className = 'main-content fade-in';
            
        } catch (error) {
            console.error('❌ Error cargando vista:', error);
            content.innerHTML = this.getErrorView('Error cargando la vista');
        }
    }

    getHomeView() {
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h1 class="card-title">¡Bienvenido a Sulo Fitness! 💪</h1>
                        <p class="card-subtitle">Tu aplicación de entrenamiento y nutrición con módulos separados</p>
                    </div>
                    
                    <div class="grid-2">
                        <div class="card" onclick="app.loadView('ejercicios')" style="cursor: pointer;">
                            <h3 style="font-size: 1.5em; margin-bottom: 1rem;">🏋️ Módulo de Ejercicios</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                                Rutinas personalizadas adaptadas a tu historial médico (fusión lumbar L3-L4, LCA reconstruido)
                            </p>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">45</div>
                                    <div class="stat-label">Ejercicios</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">8</div>
                                    <div class="stat-label">Categorías</div>
                                </div>
                            </div>
                            <button class="btn btn-primary">Ver Ejercicios</button>
                        </div>
                        
                        <div class="card" onclick="app.loadView('nutricion')" style="cursor: pointer;">
                            <h3 style="font-size: 1.5em; margin-bottom: 1rem;">🥗 Módulo de Nutrición</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                                Planificación alimenticia con tus ingredientes específicos y cálculo automático de macros
                            </p>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">32</div>
                                    <div class="stat-label">Ingredientes</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">4</div>
                                    <div class="stat-label">Comidas/día</div>
                                </div>
                            </div>
                            <button class="btn btn-success">Ver Nutrición</button>
                        </div>
                    </div>
                    
                    <div class="card" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b;">
                        <h3 style="color: #92400e; margin-bottom: 1rem;">🏥 Adaptación Médica Activa</h3>
                        <div class="grid-3">
                            <div style="text-align: center;">
                                <div style="font-size: 2em; margin-bottom: 0.5rem;">✅</div>
                                <strong>Fusión lumbar L3-L4</strong>
                                <p style="font-size: 0.9em; color: #92400e; margin-top: 0.25rem;">Ejercicios seguros incluidos</p>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2em; margin-bottom: 0.5rem;">✅</div>
                                <strong>LCA reconstruido</strong>
                                <p style="font-size: 0.9em; color: #92400e; margin-top: 0.25rem;">Movimientos controlados</p>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2em; margin-bottom: 0.5rem;">✅</div>
                                <strong>Nutrición específica</strong>
                                <p style="font-size: 0.9em; color: #92400e; margin-top: 0.25rem;">Ingredientes personalizados</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="margin-bottom: 1rem;">🚀 Accesos Rápidos</h3>
                        <div class="grid-3">
                            <button class="btn btn-secondary" onclick="app.loadView('ejercicios')">
                                🏋️ Ver Ejercicios del Día
                            </button>
                            <button class="btn btn-secondary" onclick="app.loadView('nutricion')">
                                🥗 Plan Nutricional
                            </button>
                            <button class="btn btn-secondary" onclick="app.loadView('progreso')">
                                📊 Mi Progreso
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // [CONTINÚA EN LA SIGUIENTE PARTE...]
    // [...CONTINUACIÓN DEL app.js]

    getProgressView() {
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h1 class="card-title">📊 Progreso y Estadísticas</h1>
                        <p class="card-subtitle">Seguimiento de tu evolución</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">12</div>
                            <div class="stat-label">Sesiones</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">85%</div>
                            <div class="stat-label">Adherencia</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">2.3kg</div>
                            <div class="stat-label">Progreso</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">7</div>
                            <div class="stat-label">Días activos</div>
                        </div>
                    </div>
                    
                    <div class="grid-2">
                        <div class="card">
                            <h3 style="margin-bottom: 1rem;">🏋️ Entrenamiento</h3>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Fuerza</span>
                                    <span>75%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 75%"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Resistencia</span>
                                    <span>60%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 60%"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Flexibilidad</span>
                                    <span>45%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 45%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3 style="margin-bottom: 1rem;">🥗 Nutrición</h3>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Proteínas</span>
                                    <span>92%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 92%"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Carbohidratos</span>
                                    <span>78%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 78%"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Grasas</span>
                                    <span>65%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 65%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="margin-bottom: 1rem;">📈 Tendencias</h3>
                        <p style="color: var(--text-secondary);">
                            Los gráficos de tendencias se mostrarán aquí cuando tengas más datos registrados.
                        </p>
                        <button class="btn btn-primary" style="margin-top: 1rem;">
                            📊 Ver Análisis Completo
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getErrorView(message) {
        return `
            <div class="card" style="border-color: var(--error); background: rgba(239, 68, 68, 0.05);">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4em; margin-bottom: 1rem;">⚠️</div>
                    <h2 style="color: var(--error); margin-bottom: 1rem;">Error</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="app.loadView('inicio')">
                        🏠 Volver al Inicio
                    </button>
                </div>
            </div>
        `;
    }

    // ===== NAVEGACIÓN =====
    updateNavigation() {
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === this.currentView) {
                btn.classList.add('active');
            }
        });
    }

    // ===== GESTIÓN DE TEMA =====
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    loadTheme() {
        const saved = localStorage.getItem(CONFIG.THEME_KEY);
        if (saved) this.currentTheme = saved;
        this.applyTheme();
    }

    saveTheme() {
        localStorage.setItem(CONFIG.THEME_KEY, this.currentTheme);
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadView(btn.dataset.view);
            });
        });

        // Toggle tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    // ===== UTILIDADES =====
    showError(message) {
        console.error('❌', message);
        // Podrías mostrar un toast o notificación aquí
    }
}

// ===== MÓDULO DE EJERCICIOS =====
class ExerciseModule {
    constructor(app) {
        this.app = app;
        this.exercises = this.initializeExercises();
    }

    initializeExercises() {
        return {
            // Ejercicios seguros para fusión lumbar L3-L4
            'upper_body_safe': [
                {
                    id: 'chest_supported_row',
                    name: 'Remo con apoyo pectoral',
                    target: 'Dorsales',
                    description: 'Remo sentado con apoyo en el pecho. SEGURO para fusión lumbar L3-L4.',
                    medical_safe: true,
                    sets: 3,
                    reps: '10-12',
                    rest: 90
                },
                {
                    id: 'incline_dumbbell_press',
                    name: 'Press inclinado con mancuernas',
                    target: 'Pecho superior',
                    description: 'Press en banco inclinado 30-45°. Menos estrés lumbar.',
                    medical_safe: true,
                    sets: 3,
                    reps: '8-10',
                    rest: 120
                },
                {
                    id: 'lat_pulldown',
                    name: 'Jalón al pecho',
                    target: 'Dorsales',
                    description: 'Jalón vertical con agarre amplio. Excelente sin cargar lumbar.',
                    medical_safe: true,
                    sets: 3,
                    reps: '10-12',
                    rest: 90
                },
                {
                    id: 'seated_shoulder_press',
                    name: 'Press militar sentado',
                    target: 'Deltoides',
                    description: 'Press de hombros sentado con respaldo. Soporte lumbar completo.',
                    medical_safe: true,
                    medical_priority: true,
                    sets: 3,
                    reps: '8-10',
                    rest: 120
                }
            ],
            
            // Ejercicios seguros para rodilla (LCA reconstruido)
            'lower_body_knee_safe': [
                {
                    id: 'goblet_squat',
                    name: 'Sentadilla goblet',
                    target: 'Cuádriceps',
                    description: 'Sentadilla sosteniendo mancuerna. Control total, seguro para LCA.',
                    medical_safe: true,
                    knee_safe: true,
                    sets: 3,
                    reps: '10-12',
                    rest: 120
                },
                {
                    id: 'leg_press',
                    name: 'Prensa de piernas',
                    target: 'Cuádriceps',
                    description: 'Desarrollo de piernas sin carga axial en columna.',
                    medical_safe: true,
                    sets: 3,
                    reps: '12-15',
                    rest: 90
                },
                {
                    id: 'step_ups',
                    name: 'Subidas al cajón',
                    target: 'Cuádriceps',
                    description: 'Fortalecimiento unilateral controlado, excelente para LCA.',
                    medical_safe: true,
                    medical_priority: true,
                    sets: 3,
                    reps: '8-10 cada pierna',
                    rest: 90
                }
            ],
            
            // Ejercicios rehabilitación lumbar (CRÍTICOS)
            'lumbar_rehabilitation': [
                {
                    id: 'dead_bug',
                    name: 'Dead Bug',
                    target: 'Core profundo',
                    description: 'Ejercicio fundamental para estabilidad lumbar. ESENCIAL para fusión L3-L4.',
                    medical_safe: true,
                    medical_priority: true,
                    medical_critical: true,
                    sets: 3,
                    reps: '8-10 cada lado',
                    rest: 45
                },
                {
                    id: 'glute_bridge',
                    name: 'Puente de glúteo',
                    target: 'Glúteos',
                    description: 'FUNDAMENTAL para reducir carga lumbar. Glúteos débiles sobrecargan fusión.',
                    medical_safe: true,
                    medical_priority: true,
                    sets: 3,
                    reps: '12-15',
                    rest: 60
                },
                {
                    id: 'bird_dog',
                    name: 'Bird Dog',
                    target: 'Core',
                    description: 'Cuadrupedia con extensión opuesta. Estabilidad lumbo-pélvica.',
                    medical_safe: true,
                    medical_priority: true,
                    sets: 3,
                    reps: '10 cada lado',
                    rest: 30
                }
            ]
        };
    }
    // [...CONTINUACIÓN DEL ExerciseModule.getView()]

    async getView() {
        const todayExercises = this.generateTodayWorkout();
        
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h1 class="card-title">🏋️ Módulo de Ejercicios</h1>
                        <p class="card-subtitle">Rutina personalizada para hoy - Adaptada médicamente</p>
                    </div>
                    
                    <div class="card" style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fca5a5;">
                        <h3 style="color: #dc2626; margin-bottom: 1rem;">🏥 Adaptaciones Médicas Activas</h3>
                        <div class="grid-2">
                            <div>
                                <strong>✅ Fusión lumbar L3-L4:</strong>
                                <p style="font-size: 0.9em; color: #7f1d1d; margin-top: 0.25rem;">
                                    Sin flexión/rotación lumbar cargada
                                </p>
                            </div>
                            <div>
                                <strong>✅ LCA reconstruido:</strong>
                                <p style="font-size: 0.9em; color: #7f1d1d; margin-top: 0.25rem;">
                                    Movimientos controlados, sin pivoteo
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <h2 style="margin: 2rem 0 1rem 0;">📅 Rutina de Hoy</h2>
                    
                    ${todayExercises.map((exercise, index) => `
                        <div class="card exercise-card">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                <div>
                                    <h3 style="margin-bottom: 0.5rem;">${exercise.name}</h3>
                                    <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                                        <span class="badge badge-primary">${exercise.target}</span>
                                        ${exercise.medical_safe ? '<span class="badge badge-success">✅ SEGURO</span>' : ''}
                                        ${exercise.medical_priority ? '<span class="badge badge-warning">⚡ PRIORITARIO</span>' : ''}
                                    </div>
                                </div>
                                <div style="text-align: right; font-weight: 700; color: var(--primary);">
                                    ${exercise.sets} × ${exercise.reps}
                                </div>
                            </div>
                            
                            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                                ${exercise.description}
                            </p>
                            
                            <div class="grid-3">
                                <div style="text-align: center;">
                                    <div style="font-weight: 700;">${exercise.sets}</div>
                                    <div style="font-size: 0.8em; color: var(--text-secondary);">SERIES</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-weight: 700;">${exercise.reps}</div>
                                    <div style="font-size: 0.8em; color: var(--text-secondary);">REPS</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-weight: 700;">${exercise.rest}s</div>
                                    <div style="font-size: 0.8em; color: var(--text-secondary);">DESCANSO</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="card">
                        <h3 style="margin-bottom: 1rem;">⚡ Ejercicios Críticos para tu Historial</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                            Estos ejercicios son FUNDAMENTALES para tu fusión lumbar L3-L4:
                        </p>
                        <div class="grid-3">
                            <button class="btn btn-warning">🎯 Dead Bug</button>
                            <button class="btn btn-warning">🎯 Puente Glúteo</button>
                            <button class="btn btn-warning">🎯 Bird Dog</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTodayWorkout() {
        const allExercises = [];
        
        // Agregar ejercicios seguros de cada categoría
        allExercises.push(...this.exercises.upper_body_safe.slice(0, 3));
        allExercises.push(...this.exercises.lower_body_knee_safe.slice(0, 2));
        allExercises.push(...this.exercises.lumbar_rehabilitation.slice(0, 2));
        
        return allExercises;
    }
}

// ===== MÓDULO DE NUTRICIÓN =====
class NutritionModule {
    constructor(app) {
        this.app = app;
        this.ingredients = this.initializeIngredients();
        this.dailyTargets = {
            calories: 2200,
            protein: 148,
            carbs: 220,
            fat: 73
        };
    }

    initializeIngredients() {
        return {
            // Proteínas
            'Pechugas de pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: 150 },
            'Huevos': { calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: 120 },
            'Atún en lata': { calories: 116, protein: 25, carbs: 0, fat: 0.8, portion: 100 },
            'Pavo cocido en lonchas': { calories: 135, protein: 30, carbs: 0, fat: 1.5, portion: 100 },
            'Tofu': { calories: 144, protein: 15, carbs: 3, fat: 9, portion: 120 },
            
            // Verduras
            'Brócoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, portion: 200 },
            'Espinacas': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, portion: 150 },
            'Tomates': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, portion: 150 },
            'Pimientos': { calories: 31, protein: 1, carbs: 7, fat: 0.3, portion: 120 },
            
            // Frutas
            'Plátanos': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: 120 },
            'Manzanas': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: 150 },
            'Limones': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, portion: 60 },
            
            // Cereales y legumbres
            'Garbanzos': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, portion: 150 },
            'Lentejas': { calories: 116, protein: 9, carbs: 20, fat: 0.4, portion: 150 },
            'Pan tostado integral': { calories: 247, protein: 13, carbs: 41, fat: 4.2, portion: 50 },
            'Patatas': { calories: 77, protein: 2, carbs: 17, fat: 0.1, portion: 200 },
            
            // Lácteos
            'Yogur': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, portion: 125 },
            'Leche': { calories: 42, protein: 3.4, carbs: 5, fat: 1, portion: 250 },
            
            // Otros
            'Aceite de oliva': { calories: 884, protein: 0, carbs: 0, fat: 100, portion: 10 },
            'Crema de cacahuete': { calories: 588, protein: 25, carbs: 20, fat: 50, portion: 20 }
        };
    }

    async getView() {
        const mealPlan = this.generateDailyMealPlan();
        const totals = this.calculateDailyTotals(mealPlan);
        
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h1 class="card-title">🥗 Módulo de Nutrición</h1>
                        <p class="card-subtitle">Plan alimenticio personalizado con tus ingredientes</p>
                    </div>
                    
                    <!-- Resumen diario -->
                    <div class="card">
                        <h3 style="margin-bottom: 1rem;">📊 Resumen Nutricional del Día</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">${totals.calories}</div>
                                <div class="stat-label">Calorías</div>
                                <div style="font-size: 0.75em; color: var(--text-muted); margin-top: 0.25rem;">
                                    Meta: ${this.dailyTargets.calories}
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${totals.protein}g</div>
                                <div class="stat-label">Proteína</div>
                                <div style="font-size: 0.75em; color: var(--text-muted); margin-top: 0.25rem;">
                                    Meta: ${this.dailyTargets.protein}g
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${totals.carbs}g</div>
                                <div class="stat-label">Carbos</div>
                                <div style="font-size: 0.75em; color: var(--text-muted); margin-top: 0.25rem;">
                                    Meta: ${this.dailyTargets.carbs}g
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${totals.fat}g</div>
                                <div class="stat-label">Grasas</div>
                                <div style="font-size: 0.75em; color: var(--text-muted); margin-top: 0.25rem;">
                                    Meta: ${this.dailyTargets.fat}g
                                </div>
                            </div>
                        </div>
                        
                        <!-- Barras de progreso -->
                        <div style="margin-top: 1.5rem;">
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Proteína</span>
                                    <span>${Math.round((totals.protein/this.dailyTargets.protein)*100)}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min((totals.protein/this.dailyTargets.protein)*100, 100)}%"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Calorías</span>
                                    <span>${Math.round((totals.calories/this.dailyTargets.calories)*100)}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min((totals.calories/this.dailyTargets.calories)*100, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Plan de comidas -->
                    <h2 style="margin: 2rem 0 1rem 0;">🍽️ Plan de Comidas del Día</h2>
                    
                    ${Object.entries(mealPlan).map(([mealName, meal]) => `
                        <div class="card meal-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h3 style="margin: 0;">${meal.name}</h3>
                                <span style="color: var(--text-secondary); font-weight: 600;">${meal.time}</span>
                            </div>
                            
                            ${meal.items.map(item => `
                                <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius); margin-bottom: 0.75rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <strong>${item.food}</strong>
                                        <span style="color: var(--text-secondary);">${item.portion}</span>
                                    </div>
                                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.85em; text-align: center;">
                                        <div>
                                            <div style="font-weight: 700;">${item.calories}</div>
                                            <div style="color: var(--text-secondary);">kcal</div>
                                        </div>
                                        <div>
                                            <div style="font-weight: 700;">${item.protein}g</div>
                                            <div style="color: var(--text-secondary);">prot</div>
                                        </div>
                                        <div>
                                            <div style="font-weight: 700;">${item.carbs}g</div>
                                            <div style="color: var(--text-secondary);">carb</div>
                                        </div>
                                        <div>
                                            <div style="font-weight: 700;">${item.fat}g</div>
                                            <div style="color: var(--text-secondary);">grasa</div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            
                            <!-- Totales de la comida -->
                            <div style="background: var(--primary)15; padding: 0.75rem; border-radius: var(--radius); border: 1px solid var(--primary)40;">
                                <strong style="color: var(--primary);">TOTALES: </strong>
                                ${meal.totals.calories} kcal | ${meal.totals.protein}g prot | ${meal.totals.carbs}g carbs | ${meal.totals.fat}g grasas
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Ingredientes disponibles -->
                    <div class="card">
                        <h3 style="margin-bottom: 1rem;">🥘 Tus Ingredientes Disponibles</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                            Tienes ${Object.keys(this.ingredients).length} ingredientes específicos configurados
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${Object.keys(this.ingredients).slice(0, 15).map(ingredient => `
                                <span class="badge badge-primary">${ingredient}</span>
                            `).join('')}
                            ${Object.keys(this.ingredients).length > 15 ? `<span class="badge badge-secondary">+${Object.keys(this.ingredients).length - 15} más</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateDailyMealPlan() {
        return {
            breakfast: {
                name: '🌅 DESAYUNO',
                time: '7:30',
                items: [
                    { food: 'Huevos', portion: '120g', calories: 186, protein: 15.6, carbs: 1.3, fat: 13.2 },
                    { food: 'Pan tostado integral', portion: '50g', calories: 124, protein: 6.5, carbs: 20.5, fat: 2.1 },
                    { food: 'Plátanos', portion: '120g', calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4 }
                ],
                totals: { calories: 417, protein: 23.4, carbs: 49.4, fat: 15.7 }
            },
            lunch: {
                name: '🥪 ALMUERZO',
                time: 'En cafetería',
                items: [
                    { food: 'Mini bocadillo', portion: '1 unidad', calories: 180, protein: 8, carbs: 20, fat: 8 },
                    { food: 'Café con leche', portion: '1 taza', calories: 50, protein: 3, carbs: 6, fat: 2 }
                ],
                totals: { calories: 230, protein: 11, carbs: 26, fat: 10 }
            },
            dinner: {
                name: '🍽️ COMIDA',
                time: '17:00',
                items: [
                    { food: 'Pechugas de pollo', portion: '150g', calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
                    { food: 'Brócoli', portion: '200g', calories: 68, protein: 5.6, carbs: 14, fat: 0.8 },
                    { food: 'Patatas', portion: '200g', calories: 154, protein: 4, carbs: 34, fat: 0.2 },
                    { food: 'Aceite de oliva', portion: '10g', calories: 88, protein: 0, carbs: 0, fat: 10 }
                ],
                totals: { calories: 558, protein: 56.1, carbs: 48, fat: 16.4 }
            },
            supper: {
                name: '🌙 CENA',
                time: '21:00',
                items: [
                    { food: 'Atún en lata', portion: '100g', calories: 116, protein: 25, carbs: 0, fat: 0.8 },
                    { food: 'Espinacas', portion: '150g', calories: 35, protein: 4.4, carbs: 5.4, fat: 0.6 },
                    { food: 'Yogur', portion: '125g', calories: 74, protein: 12.5, carbs: 4.5, fat: 0.5 }
                ],
                totals: { calories: 225, protein: 41.9, carbs: 9.9, fat: 1.9 }
            }
        };
    }

    calculateDailyTotals(mealPlan) {
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        Object.values(mealPlan).forEach(meal => {
            totals.calories += meal.totals.calories;
            totals.protein += meal.totals.protein;
            totals.carbs += meal.totals.carbs;
            totals.fat += meal.totals.fat;
        });
        
        // Redondear valores
        totals.calories = Math.round(totals.calories);
        totals.protein = Math.round(totals.protein * 10) / 10;
        totals.carbs = Math.round(totals.carbs * 10) / 10;
        totals.fat = Math.round(totals.fat * 10) / 10;
        
        return totals;
    }
}

// ===== GESTIÓN DE ALMACENAMIENTO =====
class StorageManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
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
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    load(key) {
        try {
            const storage = this.getStorage();
            return storage[key]?.data || null;
        } catch (error) {
            console.error('Error cargando de localStorage:', error);
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

// ===== INICIALIZACIÓN =====
let app;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 DOM cargado, inicializando aplicación...');
    
    try {
        app = new SuloFitnessApp();
        window.app = app; // Acceso global para eventos onClick
        await app.init();
        
        console.log('🎉 Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('💥 Error crítico inicializando:', error);
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; font-family: sans-serif;">
                <div style="padding: 40px; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; max-width: 500px;">
                    <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Error de Carga</h1>
                    <p style="color: #7f1d1d; margin-bottom: 20px;">No se pudo inicializar la aplicación</p>
                    <p style="font-size: 0.9em; color: #7f1d1d; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="location.reload()" style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">🔄 Recargar</button>
                </div>
            </div>
        `;
    }
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ SW registrado:', registration.scope);
            })
            .catch(error => {
                console.log('ℹ️ SW no disponible:', error.message);
            });
    });
}

console.log('📱 Sulo Fitness - Módulos separados cargado correctamente');

    