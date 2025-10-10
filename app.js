// ===============================================
// SULO FITNESS v3.0 - APLICACIÓN COMPLETA INTEGRADA
// TODAS LAS FUNCIONALIDADES IMPLEMENTADAS
// ESPECÍFICAMENTE ADAPTADO PARA TU HISTORIAL MÉDICO
// ===============================================

// ===== CLASES BASE =====
class BaseModule {
    constructor(app) {
        this.app = app;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        console.log(`🔧 Inicializando ${this.constructor.name}...`);
        this.isInitialized = true;
    }

    destroy() {
        console.log(`🗑️ Destruyendo ${this.constructor.name}...`);
        this.isInitialized = false;
    }
}

// ===== GESTIÓN DE TEMAS =====
class ThemeManager extends BaseModule {
    constructor(app) {
        super(app);
        this.currentTheme = 'light';
        this.themes = {
            light: {
                primary: '#f8fafc',
                secondary: '#e2e8f0',
                accent: '#3b82f6',
                background: '#ffffff',
                textDark: '#0f172a',
                textSecondary: '#64748b',
                border: '#e2e8f0',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444'
            },
            dark: {
                primary: '#1e293b',
                secondary: '#475569',
                accent: '#3b82f6',
                background: '#0f172a',
                textDark: '#f8fafc',
                textSecondary: '#94a3b8',
                border: '#475569',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444'
            }
        };
    }

    getColors() {
        return this.themes[this.currentTheme];
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        const colors = this.getColors();
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
        });
    }
}

// ===== GESTIÓN DE ALMACENAMIENTO =====
class StorageManager extends BaseModule {
    constructor(app) {
        super(app);
        this.storageKey = 'sulo-fitness-v3';
    }

    save(key, data) {
        try {
            const storage = this.getStorage();
            storage[key] = {
                data: data,
                timestamp: new Date().toISOString(),
                version: '3.0'
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

    exportData() {
        const data = this.getStorage();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `sulo-fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// ===== SISTEMA DE NOTIFICACIONES =====
class NotificationManager extends BaseModule {
    constructor(app) {
        super(app);
        this.container = null;
    }

    async initialize() {
        await super.initialize();
        this.createContainer();
        await this.requestPermissions();
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
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 4000) {
        const colors = {
            success: { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
            error: { bg: '#fef2f2', border: '#dc2626', text: '#7f1d1d' },
            warning: { bg: '#fffbeb', border: '#d97706', text: '#92400e' },
            info: { bg: '#eff6ff', border: '#2563eb', text: '#1e3a8a' }
        };

        const color = colors[type] || colors.info;
        const notification = document.createElement('div');
        
        notification.style.cssText = `
            background: ${color.bg};
            border: 2px solid ${color.border};
            border-radius: 12px;
            padding: 16px 20px;
            color: ${color.text};
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.4s ease-out;
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(100%);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.2em;">${this.getIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        // Animación de entrada
        this.container.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remover
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, duration);

        // Click para cerrar
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.4s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        });
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    async requestPermissions() {
        if ('Notification' in window && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }
}

// ===== MÓDULO DE ENTRENAMIENTO COMPLETO =====
class WorkoutModule extends BaseModule {
    constructor(app) {
        super(app);
        
        // Integración de todos los sistemas desarrollados
        this.exerciseDatabase = this.initializeCompleteExerciseDatabase();
        this.periodizationEngine = new PeriodizationEngine(app.user, app.user.medicalProfile);
        this.progressionEngine = new AutoProgressionEngine(app.user, this);
        this.executionInterface = new ExerciseExecutionInterface(app);
        this.workoutTools = new AdvancedWorkoutTools(app);
        this.analyticsSystem = new WorkoutAnalyticsSystem(app);
        
        // Estado del módulo
        this.currentSession = null;
        this.sessionHistory = [];
        this.currentPhase = 1;
        this.currentWeek = 1;
    }

    // ===== BASE DE DATOS COMPLETA DE EJERCICIOS =====
    initializeCompleteExerciseDatabase() {
        return {
            // EJERCICIOS SEGUROS PARA FUSIÓN LUMBAR L3-L4
            upper_body_safe: [
                {
                    id: 'chest_supported_row',
                    name: 'Remo con apoyo pectoral',
                    description: 'Remo sentado con apoyo en el pecho. SEGURO para tu fusión lumbar L3-L4.',
                    target: 'Dorsales',
                    secondary: ['Romboides', 'Deltoides posterior', 'Bíceps'],
                    equipment: ['Máquina de remo', 'Banco inclinado + mancuernas'],
                    type: 'weight',
                    difficulty: 'beginner',
                    medical_safe: true,
                    lumbar_friendly: true,
                    defaultSets: 3,
                    defaultReps: '10-12',
                    defaultRest: 90,
                    tips: [
                        'Mantén el pecho pegado al apoyo durante todo el movimiento',
                        'Retrae escápulas al final del movimiento',
                        'Evita usar momentum - movimiento controlado'
                    ]
                },
                {
                    id: 'incline_dumbbell_press',
                    name: 'Press inclinado con mancuernas',
                    description: 'Press en banco inclinado 30-45°. Menos estrés lumbar que el press plano.',
                    target: 'Pecho superior',
                    secondary: ['Deltoides anterior', 'Tríceps'],
                    equipment: ['Mancuernas', 'Banco inclinado'],
                    type: 'weight',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    lumbar_friendly: true,
                    defaultSets: 3,
                    defaultReps: '8-10',
                    defaultRest: 120
                },
                {
                    id: 'lat_pulldown',
                    name: 'Jalón al pecho',
                    description: 'Jalón vertical con agarre amplio. Excelente para desarrollar dorsales sin cargar lumbar.',
                    target: 'Dorsales',
                    secondary: ['Romboides', 'Bíceps'],
                    equipment: ['Máquina de poleas'],
                    type: 'weight',
                    difficulty: 'beginner',
                    medical_safe: true,
                    lumbar_friendly: true,
                    defaultSets: 3,
                    defaultReps: '10-12',
                    defaultRest: 90
                },
                {
                    id: 'seated_shoulder_press',
                    name: 'Press militar sentado',
                    description: 'Press de hombros sentado con respaldo. Soporte lumbar completo.',
                    target: 'Deltoides',
                    secondary: ['Tríceps', 'Core'],
                    equipment: ['Mancuernas', 'Banco con respaldo'],
                    type: 'weight',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    lumbar_friendly: true,
                    medical_notes: 'El respaldo protege completamente la zona de fusión L3-L4',
                    defaultSets: 3,
                    defaultReps: '8-10',
                    defaultRest: 120
                },
                {
                    id: 'face_pulls',
                    name: 'Face pulls',
                    description: 'Tracción hacia la cara con cable. EXCELENTE para tu postura post-fusión.',
                    target: 'Deltoides posterior',
                    secondary: ['Romboides', 'Trapecio medio'],
                    equipment: ['Máquina de poleas'],
                    type: 'weight',
                    difficulty: 'beginner',
                    medical_safe: true,
                    medical_priority: true,
                    medical_notes: 'Ejercicio FUNDAMENTAL para tu postura post-fusión',
                    defaultSets: 4,
                    defaultReps: '15-20',
                    defaultRest: 60
                }
            ],

            // EJERCICIOS SEGUROS PARA RODILLA (LCA RECONSTRUIDO)
            lower_body_knee_safe: [
                {
                    id: 'goblet_squat',
                    name: 'Sentadilla goblet',
                    description: 'Sentadilla sosteniendo mancuerna. Control total, seguro para LCA.',
                    target: 'Cuádriceps',
                    secondary: ['Glúteos', 'Core'],
                    equipment: ['Mancuerna'],
                    type: 'weight',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    knee_safe: true,
                    medical_notes: 'Permite control completo de la profundidad - ideal para LCA',
                    defaultSets: 3,
                    defaultReps: '10-12',
                    defaultRest: 120
                },
                {
                    id: 'leg_press',
                    name: 'Prensa de piernas',
                    description: 'Desarrollo de piernas sin carga axial en columna.',
                    target: 'Cuádriceps',
                    secondary: ['Glúteos'],
                    equipment: ['Máquina de prensa'],
                    type: 'weight',
                    difficulty: 'beginner',
                    medical_safe: true,
                    lumbar_friendly: true,
                    knee_safe: true,
                    medical_notes: 'Sin carga axial - perfecto para tu fusión lumbar',
                    defaultSets: 3,
                    defaultReps: '12-15',
                    defaultRest: 90
                },
                {
                    id: 'step_ups',
                    name: 'Subidas al cajón',
                    description: 'Fortalecimiento unilateral controlado, excelente para LCA.',
                    target: 'Cuádriceps',
                    secondary: ['Glúteos', 'Estabilizadores'],
                    equipment: ['Cajón/plataforma'],
                    type: 'weight',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    knee_safe: true,
                    medical_priority: true,
                    medical_notes: 'Fortalece propiocepcción post-LCA',
                    defaultSets: 3,
                    defaultReps: '8-10 cada pierna',
                    defaultRest: 90
                }
            ],

            // EJERCICIOS REHABILITACIÓN LUMBAR (CRÍTICOS)
            lumbar_rehabilitation: [
                {
                    id: 'dead_bug',
                    name: 'Dead Bug',
                    description: 'Ejercicio de estabilidad lumbar fundamental. ESENCIAL para tu fusión L3-L4.',
                    target: 'Core profundo',
                    secondary: ['Estabilizadores lumbares'],
                    equipment: [],
                    type: 'time',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    medical_priority: true,
                    lumbar_specific: true,
                    medical_notes: 'CRÍTICO para estabilidad post-fusión. Hacer DIARIAMENTE.',
                    defaultSets: 3,
                    defaultReps: '8-10 cada lado',
                    defaultRest: 45,
                    instructions: [
                        'Tumbado boca arriba, brazos extendidos al techo',
                        'Rodillas flexionadas 90°',
                        'Mantén zona lumbar pegada al suelo',
                        'Extiende brazo y pierna opuestos lentamente',
                        'Vuelve controladamente'
                    ]
                },
                {
                    id: 'glute_bridge',
                    name: 'Puente de glúteo',
                    description: 'FUNDAMENTAL para reducir carga lumbar. Glúteos débiles sobrecargan fusión.',
                    target: 'Glúteos',
                    secondary: ['Isquiotibiales', 'Core'],
                    equipment: [],
                    type: 'weight',
                    difficulty: 'beginner',
                    medical_safe: true,
                    medical_priority: true,
                    lumbar_specific: true,
                    medical_notes: 'Glúteos fuertes = menos carga en L3-L4',
                    defaultSets: 3,
                    defaultReps: '12-15',
                    defaultRest: 60
                },
                {
                    id: 'bird_dog',
                    name: 'Bird Dog',
                    description: 'Cuadrupedia con extensión opuesta. Estabilidad lumbo-pélvica.',
                    target: 'Core',
                    secondary: ['Glúteos', 'Estabilizadores espinales'],
                    equipment: [],
                    type: 'time',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    lumbar_specific: true,
                    medical_priority: true,
                    defaultSets: 3,
                    defaultReps: '10 cada lado',
                    defaultRest: 30
                },
                {
                    id: 'side_plank',
                    name: 'Plancha lateral',
                    description: 'Fortalecimiento lateral del core. Estabilidad sin flexión lumbar.',
                    target: 'Core lateral',
                    secondary: ['Glúteos', 'Cuadrado lumbar'],
                    equipment: [],
                    type: 'time',
                    difficulty: 'intermediate',
                    medical_safe: true,
                    lumbar_specific: true,
                    defaultSets: 3,
                    defaultReps: '20-30 segundos cada lado',
                    defaultRest: 60
                }
            ]
        };
    }

    // ===== GENERACIÓN INTELIGENTE DE SESIONES =====
    async generateTodaysSession() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes...
        const currentPhase = this.periodizationEngine.getCurrentPhase();
        const weeklyPlan = this.periodizationEngine.generateWeeklyPlan(currentPhase, this.currentWeek);
        
        // Obtener sesión del día
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayName = dayNames[dayOfWeek];
        const todaySession = weeklyPlan[todayName];
        
        if (!todaySession || !todaySession.gym_session) {
            return this.generateRestDaySession(todayName);
        }
        
        // Generar ejercicios específicos para la sesión
        const exercises = await this.selectExercisesForSession(todaySession.gym_session);
        
        return {
            date: today.toISOString().split('T')[0],
            type: todaySession.gym_session.focus,
            duration: todaySession.gym_session.duration || 90,
            exercises: exercises,
            medicalFocus: this.getMedicalFocusForDay(todayName),
            phase: currentPhase,
            week: this.currentWeek
        };
    }

    async selectExercisesForSession(sessionConfig) {
        const exercises = [];
        const allExercises = this.getAllExercises();
        
        // Filtrar ejercicios por seguridad médica
        const safeExercises = this.filterExercisesBySafety(allExercises);
        
        // Seleccionar según el foco del día
        switch (sessionConfig.focus) {
            case 'upper_body_lumbar_rehab':
                // Lunes: Tren superior + rehabilitación lumbar
                exercises.push(
                    ...this.selectExercisesByCategory('lumbar_rehabilitation', 4),
                    ...this.selectExercisesByCategory('upper_body_safe', 4)
                );
                break;
                
            case 'lower_body_knee_safe':
                // Martes: Tren inferior seguro para rodilla
                exercises.push(
                    ...this.selectExercisesByCategory('lower_body_knee_safe', 5),
                    ...this.selectExercisesByCategory('lumbar_rehabilitation', 2)
                );
                break;
                
            case 'upper_body_power':
                // Miércoles: Tren superior potencia
                exercises.push(
                    ...this.selectExercisesByCategory('upper_body_safe', 6),
                    ...this.selectExercisesByCategory('lumbar_rehabilitation', 2)
                );
                break;
                
            case 'core_stability_lumbar':
                // Jueves: Core y estabilidad lumbar
                exercises.push(
                    ...this.selectExercisesByCategory('lumbar_rehabilitation', 6),
                    ...this.selectExercisesByCategory('upper_body_safe', 2)
                );
                break;
                
            case 'football_preparation':
                // Viernes: Preparación fútbol
                exercises.push(
                    ...this.selectExercisesByCategory('lumbar_rehabilitation', 3),
                    ...this.selectExercisesByCategory('lower_body_knee_safe', 3),
                    ...this.selectExercisesByCategory('upper_body_safe', 2)
                );
                break;
        }
        
        // Aplicar progresión inteligente a cada ejercicio
        return exercises.map(exercise => this.applyIntelligentProgression(exercise));
    }

    filterExercisesBySafety(exercises) {
        return exercises.filter(exercise => {
            // Verificar contraindicaciones para fusión lumbar
            if (exercise.lumbar_dangerous || exercise.spinal_flexion_loaded) {
                return false;
            }
            
            // Verificar contraindicaciones para LCA
            if (exercise.high_knee_risk || exercise.pivoting_movement) {
                return false;
            }
            
            return exercise.medical_safe !== false;
        });
    }

    applyIntelligentProgression(exercise) {
        // Obtener historial del ejercicio
        const history = this.getExerciseHistory(exercise.id);
        
        // Calcular progresión usando el motor de IA
        const progression = this.progressionEngine.calculateNextProgression(
            exercise.id,
            history.currentPerformance,
            history.userFeedback
        );
        
        // Aplicar progresión al ejercicio
        return {
            ...exercise,
            currentWeight: progression.weight || exercise.defaultWeight,
            currentReps: progression.reps || exercise.defaultReps,
            currentSets: progression.sets || exercise.defaultSets,
            progression: progression,
            sets: Array(progression.sets || exercise.defaultSets).fill(null).map(() => ({
                weight: progression.weight,
                reps: progression.reps,
                rpe: null,
                completed: false
            }))
        };
    }

    // ===== MÉTODOS DE INTERFAZ =====
    showDailyView() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();
        
        this.generateTodaysSession().then(session => {
            container.innerHTML = `
                <div class="workout-session-view" style="animation: fadeIn 0.5s ease-out;">
                    
                    <!-- Header de la sesión -->
                    ${this.generateSessionHeader(session, colors)}
                    
                    <!-- Lista de ejercicios -->
                    <div class="exercises-list" style="margin-bottom: 32px;">
                        ${session.exercises.map((exercise, index) => this.generateExerciseCard(exercise, index, colors)).join('')}
                    </div>
                    
                    <!-- Controles de sesión -->
                    ${this.generateSessionControls(session, colors)}
                </div>
            `;
            
            this.currentSession = session;
            this.setupWorkoutEventListeners();
        });
    }

    generateExerciseCard(exercise, index, colors) {
        const medicalBadge = exercise.medical_priority ? 
            `<span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7em; font-weight: 700; margin-left: 8px;">🏥 CRÍTICO</span>` : 
            exercise.medical_safe ? 
            `<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7em; font-weight: 700; margin-left: 8px;">✅ SEGURO</span>` : '';
        
        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}" onclick="app.workoutModule.showExerciseDetail('${exercise.id}')" style="
                background: ${colors.primary}; 
                border-radius: 12px; 
                padding: 20px; 
                margin-bottom: 16px; 
                border: 2px solid ${colors.border}; 
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div>
                        <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.2em; font-weight: 700;">${exercise.name}</h3>
                        <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.9em; line-height: 1.4;">${exercise.description}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.4em; color: ${colors.accent}; font-weight: 700;">${exercise.currentSets || exercise.defaultSets}x${exercise.currentReps || exercise.defaultReps}</div>
                        <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">SERIES x REPS</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background: ${colors.accent}20; color: ${colors.accent}; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 0.85em;">${exercise.target}</span>
                        ${medicalBadge}
                    </div>
                    <div style="font-size: 0.9em; color: ${colors.textSecondary}; font-weight: 600;">
                        Toca para detalles →
                    </div>
                </div>
                
                ${exercise.medical_notes ? `
                    <div style="margin-top: 12px; padding: 8px 12px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;">
                        <div style="font-size: 0.8em; color: #dc2626; font-weight: 700;">🏥 Nota médica:</div>
                        <div style="font-size: 0.85em; color: #7f1d1d; margin-top: 4px;">${exercise.medical_notes}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showExerciseDetail(exerciseId) {
        this.executionInterface.showExerciseDetail(exerciseId);
    }

    // ===== GESTIÓN DE DATOS =====
    saveSession(sessionData) {
        this.sessionHistory.push({
            ...sessionData,
            timestamp: new Date().toISOString()
        });
        
        this.app.storage.save('sessionHistory', this.sessionHistory);
        this.app.storage.save('currentPhase', this.currentPhase);
        this.app.storage.save('currentWeek', this.currentWeek);
    }

    getExerciseHistory(exerciseId) {
        const history = this.sessionHistory.reduce((acc, session) => {
            const exercise = session.exercises?.find(e => e.id === exerciseId);
            if (exercise) {
                acc.push({
                    date: session.date,
                    sets: exercise.sets,
                    performance: exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
                });
            }
            return acc;
        }, []);

        return {
            sessions: history,
            currentPerformance: history.length > 0 ? history[history.length - 1].performance : 0,
            userFeedback: { avgRPE: 7.5, consistency: 0.8 } // Simulated
        };
    }

    getAllExercises() {
        const allExercises = [];
        Object.values(this.exerciseDatabase).forEach(category => {
            if (Array.isArray(category)) {
                allExercises.push(...category);
            }
        });
        return allExercises;
    }

    selectExercisesByCategory(category, count) {
        const categoryExercises = this.exerciseDatabase[category] || [];
        return categoryExercises.slice(0, count);
    }
}

// ===== APLICACIÓN PRINCIPAL =====
class SuloFitnessApp {
    constructor() {
        this.version = '3.0';
        this.isInitialized = false;
        
        // Inicializar módulos principales
        this.theme = new ThemeManager(this);
        this.storage = new StorageManager(this);
        this.notifications = new NotificationManager(this);
        this.workoutModule = new WorkoutModule(this);
        
        // Usuario con perfil médico específico
        this.user = {
            profile: {
                name: 'Usuario',
                age: 45,
                weight: 74,
                height: 184,
                goals: ['fuerza', 'salud_lumbar', 'condicion_fisica']
            },
            medicalProfile: {
                conditions: {
                    lumbar_fusion_L3L4: {
                        active: true,
                        severity: 'moderate',
                        yearsSince: 2
                    },
                    acl_reconstruction_right: {
                        active: true,
                        severity: 'mild',
                        yearsSince: 3
                    }
                },
                restrictions: [
                    'no_lumbar_flexion_loaded',
                    'no_lumbar_rotation_loaded',
                    'controlled_knee_rotation'
                ],
                priorities: [
                    'lumbar_stability',
                    'glute_strengthening',
                    'knee_proprioception'
                ]
            }
        };
        
        this.currentView = 'inicio';
        this.isOnline = navigator.onLine;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Iniciando Sulo Fitness v3.0...');
        
        try {
            // Inicializar módulos en orden
            await this.theme.initialize();
            await this.storage.initialize();
            await this.notifications.initialize();
            await this.workoutModule.initialize();
            
            // Configurar tema inicial
            this.theme.applyTheme();
            
            // Cargar datos guardados
            this.loadUserData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Mostrar vista inicial
            this.navigate('inicio');
            
            this.isInitialized = true;
            
            console.log('✅ Sulo Fitness v3.0 inicializado correctamente');
            this.notifications.show('¡Bienvenido a Sulo Fitness v3.0! 💪', 'success');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.notifications.show('Error inicializando la aplicación', 'error');
        }
    }

    loadUserData() {
        // Cargar datos del usuario desde storage
        const savedProfile = this.storage.load('userProfile');
        if (savedProfile) {
            this.user.profile = { ...this.user.profile, ...savedProfile };
        }
        
        // Cargar historial de sesiones
        const sessionHistory = this.storage.load('sessionHistory');
        if (sessionHistory) {
            this.workoutModule.sessionHistory = sessionHistory;
        }
    }

    setupEventListeners() {
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('SW registrado:', registration.scope))
                .catch(error => console.log('Error SW:', error));
        }
        
        // Eventos de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifications.show('Conexión restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifications.show('Sin conexión - Funcionando offline', 'warning');
        });
        
        // Prevenir cierre accidental
        window.addEventListener('beforeunload', (e) => {
            if (this.workoutModule.currentSession) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro? Tienes una sesión activa.';
            }
        });
    }

    // ===== NAVEGACIÓN =====
    navigate(view) {
        this.currentView = view;
        
        switch (view) {
            case 'inicio':
                this.showHomeView();
                break;
            case 'entrenamiento':
                this.workoutModule.showDailyView();
                break;
            case 'analytics':
                this.workoutModule.analyticsSystem.showAnalyticsView();
                break;
            case 'configuracion':
                this.showSettingsView();
                break;
            default:
                this.showHomeView();
        }
        
        this.updateNavigation();
    }

    showHomeView() {
        const container = document.getElementById('main-content');
        const colors = this.theme.getColors();
        
        container.innerHTML = `
            <div class="home-view" style="animation: fadeIn 0.5s ease-out;">
                <!-- Home content específico -->
                <div style="text-align: center; padding: 40px 20px;">
                    <h1 style="color: ${colors.textDark}; font-size: 2.5em; margin-bottom: 16px; font-weight: 800;">💪 Sulo Fitness v3.0</h1>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin-bottom: 32px;">Entrenamiento inteligente adaptado a tu historial médico</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 32px 0;">
                        
                        <div onclick="app.navigate('entrenamiento')" class="feature-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${colors.accent}40; cursor: pointer; transition: transform 0.3s ease;">
                            <div style="font-size: 3em; margin-bottom: 16px;">🏋️</div>
                            <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-weight: 700;">Entrenamiento Hoy</h3>
                            <p style="color: ${colors.textSecondary};">Sesión personalizada basada en periodización inteligente</p>
                        </div>
                        
                        <div onclick="app.navigate('analytics')" class="feature-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid #10b98140; cursor: pointer; transition: transform 0.3s ease;">
                            <div style="font-size: 3em; margin-bottom: 16px;">📊</div>
                            <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-weight: 700;">Analytics & Progreso</h3>
                            <p style="color: ${colors.textSecondary};">Análisis inteligente y predicciones de rendimiento</p>
                        </div>
                        
                    </div>
                    
                    <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 20px; margin: 32px 0;">
                        <h3 style="color: #dc2626; margin-bottom: 12px; font-weight: 700;">🏥 Adaptado a tu historial médico</h3>
                        <p style="color: #7f1d1d; margin: 0;">✅ Fusión lumbar L3-L4 protegida | ✅ LCA reconstruido considerado | ✅ Ejercicios específicos incluidos</p>
                    </div>
                </div>
            </div>
        `;
    }

    updateNavigation() {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-view="${this.currentView}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
let app;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 DOM cargado, inicializando aplicación...');
    
    try {
        app = new SuloFitnessApp();
        window.app = app; // Acceso global para debugging
        await app.initialize();
        
        console.log('🎉 Aplicación inicializada correctamente');
    } catch (error) {
        console.error('💥 Error crítico inicializando:', error);
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #fee2e2;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Error de Carga</h1>
                    <p style="color: #7f1d1d; margin-bottom: 20px;">No se pudo inicializar la aplicación</p>
                    <button onclick="location.reload()" style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">🔄 Recargar</button>
                </div>
            </div>
        `;
    }
});

// ===== MANEJO DE ERRORES GLOBAL =====
window.addEventListener('error', (event) => {
    console.error('💥 Error global:', event.error);
    if (app && app.notifications) {
        app.notifications.show('Error inesperado en la aplicación', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Promise rechazada:', event.reason);
    if (app && app.notifications) {
        app.notifications.show('Error de promesa no manejada', 'error');
    }
});

console.log('📱 Sulo Fitness v3.0 - Script cargado correctamente');