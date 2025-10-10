// ===============================================
// SISTEMA DE PERIODIZACIÓN INTELIGENTE v2.0
// ADAPTADO A TU PERFIL MÉDICO Y HORARIO REAL
// ===============================================

class PeriodizationEngine {
    constructor(userProfile, medicalProfile) {
        this.userProfile = userProfile;
        this.medicalProfile = medicalProfile;
        this.currentPhase = 1;
        this.currentWeek = 1;
        this.seasonalMode = this.calculateSeasonalMode();
    }

    // ===== MACROCICLO DE 12 SEMANAS =====
    getMacrocycle() {
        return {
            phase1: { // Semanas 1-4: Adaptación anatómica + Rehabilitación
                name: 'Adaptación Médica',
                weeks: [1, 2, 3, 4],
                volume: 'moderate',
                intensity: 'low',
                focus: 'medical_adaptation',
                priorities: [
                    'lumbar_rehabilitation',
                    'knee_strengthening', 
                    'movement_patterns',
                    'base_strength'
                ],
                medical_emphasis: true,
                lumbar_exercises_per_session: 4,
                knee_exercises_per_session: 2,
                load_progression: 'conservative'
            },
            
            phase2: { // Semanas 5-8: Desarrollo de fuerza
                name: 'Desarrollo de Fuerza',
                weeks: [5, 6, 7, 8],
                volume: 'high',
                intensity: 'moderate',
                focus: 'strength_building',
                priorities: [
                    'compound_movements',
                    'progressive_overload',
                    'muscle_endurance',
                    'continued_rehab'
                ],
                medical_emphasis: 'moderate',
                lumbar_exercises_per_session: 3,
                knee_exercises_per_session: 1,
                load_progression: 'moderate'
            },
            
            phase3: { // Semanas 9-12: Fuerza + Deporte específico
                name: 'Rendimiento Deportivo',
                weeks: [9, 10, 11, 12],
                volume: 'moderate',
                intensity: 'high',
                focus: 'sport_performance',
                priorities: [
                    'sport_specific_strength',
                    'power_development',
                    'injury_prevention',
                    'maintenance_rehab'
                ],
                football_specific: true,
                swimming_focus: true,
                medical_emphasis: 'maintenance'
            }
        };
    }

    // ===== MICROCICLO SEMANAL ADAPTADO =====
    generateWeeklyPlan(phase, week) {
        const baseTemplate = this.getWeeklyTemplate();
        const phaseData = this.getMacrocycle()[`phase${phase}`];
        
        return {
            monday: this.generateMondaySession(phaseData, week),
            tuesday: this.generateTuesdaySession(phaseData, week),
            wednesday: this.generateWednesdaySession(phaseData, week),
            thursday: this.generateThursdaySession(phaseData, week),
            friday: this.generateFridaySession(phaseData, week),
            saturday: this.generateSaturdaySession(phaseData, week),
            sunday: this.generateSundaySession(phaseData, week)
        };
    }

    // ===== LUNES: TREN SUPERIOR + PISCINA + REHABILITACIÓN =====
    generateMondaySession(phaseData, week) {
        return {
            gym_session: {
                time: '15:00-16:30',
                duration: 90,
                focus: 'upper_body_lumbar_rehab',
                exercises: [
                    // Calentamiento específico
                    { category: 'warmup', exercises: ['cat_cow', 'thoracic_extension'], duration: 10 },
                    
                    // Rehabilitación lumbar (PRIORITARIO)
                    { 
                        category: 'lumbar_rehab', 
                        exercises: ['dead_bug', 'bird_dog', 'glute_bridge', 'pelvic_tilt'],
                        sets: phaseData.lumbar_exercises_per_session,
                        priority: 'high'
                    },
                    
                    // Fuerza tren superior segura
                    {
                        category: 'upper_strength',
                        exercises: ['chest_supported_row', 'incline_dumbbell_press', 'lat_pulldown'],
                        progression: this.calculateProgression(phaseData, week)
                    },
                    
                    // Trabajo postural específico
                    {
                        category: 'postural',
                        exercises: ['face_pulls'],
                        sets: 4,
                        reps: '15-20',
                        priority: 'medical'
                    }
                ]
            },
            swimming_session: {
                time: '20:00-20:45',
                duration: 45,
                focus: 'technique_endurance',
                type: 'low_impact_cardio',
                exercises: [
                    { exercise: 'swimming_freestyle', duration: '30 min' },
                    { exercise: 'cool_down_stretching', duration: '15 min' }
                ]
            }
        };
    }

    // ===== MARTES: TREN INFERIOR SEGURO PARA RODILLA =====
    generateTuesdaySession(phaseData, week) {
        return {
            gym_session: {
                time: '15:00-16:30',
                duration: 90,
                focus: 'lower_body_knee_safe',
                exercises: [
                    // Calentamiento específico rodilla
                    { category: 'knee_warmup', exercises: ['single_leg_balance', 'mini_squats'], duration: 15 },
                    
                    // Fortalecimiento rodilla (CRÍTICO)
                    {
                        category: 'knee_strengthening',
                        exercises: ['wall_sits', 'seated_leg_extension', 'lying_leg_curl'],
                        sets: 3,
                        progression: 'conservative',
                        priority: 'medical'
                    },
                    
                    // Fuerza tren inferior segura
                    {
                        category: 'lower_strength',
                        exercises: ['goblet_squat', 'leg_press', 'step_ups'],
                        progression: this.calculateProgression(phaseData, week),
                        knee_protection: true
                    },
                    
                    // Core sin flexión lumbar
                    {
                        category: 'core_safe',
                        exercises: ['side_plank', 'glute_bridge'],
                        medical_adaptation: true
                    }
                ]
            }
        };
    }

    // ===== AUTO-REGULACIÓN POR FATIGA =====
    autoRegulateIntensity(baseIntensity, recoveryMetrics) {
        let adjustedIntensity = baseIntensity;
        
        // Ajustes por métricas de recuperación
        if (recoveryMetrics.sleep_quality < 7) {
            adjustedIntensity *= 0.9;
        }
        
        if (recoveryMetrics.perceived_fatigue > 7) {
            adjustedIntensity *= 0.85;
        }
        
        // Ajustes por historial médico
        if (recoveryMetrics.lumbar_discomfort > 0) {
            adjustedIntensity *= 0.8; // Reducción significativa si hay molestias
        }
        
        if (recoveryMetrics.knee_discomfort > 0) {
            adjustedIntensity *= 0.85; // Protección adicional para rodilla
        }
        
        return Math.max(adjustedIntensity, 0.6); // Mínimo 60% de la intensidad base
    }

    // ===== PROGRESIÓN INTELIGENTE POR EJERCICIO =====
    calculateProgression(phaseData, week) {
        const progressionRules = {
            lumbar_rehab: {
                type: 'time_based',
                increment: 5, // +5 segundos por semana
                max_per_session: 60 // Máximo 60 segundos por serie
            },
            strength_upper: {
                type: 'weight_based',
                increment: 2.5, // +2.5kg cada 2 semanas
                frequency: 'bi_weekly'
            },
            strength_lower: {
                type: 'weight_based', 
                increment: 2.5, // Más conservador por rodilla
                frequency: 'bi_weekly',
                knee_protection: true
            },
            knee_rehab: {
                type: 'rep_based',
                increment: 1, // +1 rep por semana
                max_reps: 20 // Límite para seguridad
            }
        };
        
        return progressionRules;
    }

    // ===== ADAPTACIÓN ESTACIONAL (FÚTBOL) =====
    calculateSeasonalMode() {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        
        if (currentMonth >= 10 || currentMonth <= 6) { // Oct-Jun
            return {
                mode: 'football_season',
                sport_priority: 'high',
                friday_focus: 'match_preparation',
                saturday_recovery: true,
                sunday_activity: 'light_active'
            };
        } else { // Jul-Sep
            return {
                mode: 'off_season',
                sport_priority: 'low',
                strength_focus: 'high',
                saturday_training: true,
                sunday_activity: 'cycling_long'
            };
        }
    }

    // ===== VALIDACIÓN DE CARGA SEMANAL =====
    validateWeeklyLoad(plannedSessions, currentCapacity) {
        const totalVolume = this.calculateTotalVolume(plannedSessions);
        const medicalLoad = this.calculateMedicalStress(plannedSessions);
        
        // Validación por capacidad
        if (totalVolume > currentCapacity * 1.1) {
            return {
                valid: false,
                reason: 'volume_too_high',
                adjustment: 'reduce_intensity_10_percent'
            };
        }
        
        // Validación médica específica
        if (medicalLoad.lumbar_stress > 7) {
            return {
                valid: false,
                reason: 'lumbar_overload',
                adjustment: 'add_extra_lumbar_rehab'
            };
        }
        
        if (medicalLoad.knee_stress > 6) {
            return {
                valid: false,
                reason: 'knee_overload', 
                adjustment: 'reduce_knee_exercises'
            };
        }
        
        return { valid: true };
    }

    // ===== GENERACIÓN DE SESIONES ESPECÍFICAS =====
    generateFridaySession(phaseData, week) {
        // Preparación específica para fútbol sábado
        if (this.seasonalMode.mode === 'football_season') {
            return {
                gym_session: {
                    time: '15:00-16:30',
                    focus: 'football_preparation',
                    exercises: [
                        { category: 'activation', exercises: ['glute_bridge', 'single_leg_balance'] },
                        { category: 'injury_prevention', exercises: ['dead_bug', 'side_plank'] },
                        { category: 'power', exercises: ['step_ups'], intensity: 'moderate' },
                        { category: 'recovery', exercises: ['hip_flexor_stretch'], duration: 15 }
                    ],
                    intensity: 'light', // Para no fatigarse antes del partido
                    medical_focus: 'injury_prevention'
                }
            };
        } else {
            // Sesión normal de fuerza en temporada baja
            return {
                gym_session: {
                    time: '15:00-16:30',
                    focus: 'strength_session',
                    intensity: 'high'
                }
            };
        }
    }
}

// ===== CLASE DE ADAPTACIÓN MÉDICA =====
class MedicalAdaptationEngine {
    constructor(medicalProfile) {
        this.profile = medicalProfile;
        this.restrictions = this.loadRestrictions();
        this.priorities = this.loadPriorities();
    }

    // Filtrar ejercicios por seguridad médica
    filterExercisesBySafety(exercises) {
        return exercises.filter(exercise => {
            // Verificar restricciones lumbares
            if (this.profile.conditions.lumbar_fusion_L3L4.active) {
                if (exercise.lumbar_dangerous) return false;
                if (exercise.spinal_flexion_loaded) return false;
                if (exercise.spinal_rotation_loaded) return false;
            }
            
            // Verificar restricciones de rodilla
            if (this.profile.conditions.acl_reconstruction_right.active) {
                if (exercise.high_knee_risk) return false;
                if (exercise.pivoting_movement) return false;
            }
            
            return exercise.medical_safe || exercise.contraindications.length === 0;
        });
    }

    // Generar alertas en tiempo real
    generateRealTimeAlerts(currentExercise) {
        const alerts = [];
        
        if (this.profile.conditions.lumbar_fusion_L3L4.active) {
            if (currentExercise.target.includes('Core') || currentExercise.lumbar_load) {
                alerts.push({
                    type: 'medical_warning',
                    message: '⚠️ FUSIÓN L3-L4: Mantén curvatura natural lumbar',
                    priority: 'high'
                });
            }
        }
        
        if (this.profile.conditions.acl_reconstruction_right.active) {
            if (currentExercise.knee_load || currentExercise.single_leg) {
                alerts.push({
                    type: 'medical_info',
                    message: '🦵 LCA: Control total del movimiento, evita valgus',
                    priority: 'medium'
                });
            }
        }
        
        return alerts;
    }
}

export { PeriodizationEngine, MedicalAdaptationEngine };