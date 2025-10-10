// ===============================================
// MOTOR DE PROGRESIÓN AUTOMÁTICA INTELIGENTE v2.0
// SISTEMA DE MACHINE LEARNING BÁSICO PARA ADAPTACIÓN
// ===============================================

class AutoProgressionEngine {
    constructor(userProfile, exerciseHistory) {
        this.userProfile = userProfile;
        this.exerciseHistory = exerciseHistory;
        this.learningModel = new SimpleMLModel();
        this.progressionRules = this.initializeProgressionRules();
    }

    // ===== INICIALIZACIÓN DE REGLAS DE PROGRESIÓN =====
    initializeProgressionRules() {
        return {
            // Reglas específicas para tu historial médico
            medical_exercises: {
                lumbar_rehabilitation: {
                    progression_type: 'time_duration',
                    initial_duration: 20, // segundos
                    increment: 5, // +5 segundos
                    max_duration: 60, // límite seguridad
                    frequency: 'weekly',
                    regression_trigger: 'pain_reported'
                },
                knee_strengthening: {
                    progression_type: 'repetition_based',
                    initial_reps: 8,
                    increment: 1,
                    max_reps: 15,
                    frequency: 'weekly',
                    regression_trigger: 'knee_discomfort'
                }
            },
            
            // Reglas para ejercicios de fuerza
            strength_exercises: {
                upper_body: {
                    progression_type: 'weight_based',
                    initial_percentage: 0.65, // 65% 1RM estimado
                    increment_kg: 2.5,
                    increment_frequency: 'bi_weekly',
                    plateau_detection: true,
                    deload_percentage: 0.85 // 85% del peso actual
                },
                lower_body: {
                    progression_type: 'weight_based',
                    initial_percentage: 0.60, // Más conservador por rodilla
                    increment_kg: 2.5,
                    increment_frequency: 'bi_weekly',
                    knee_protection: true,
                    safety_checks: ['knee_stability', 'pain_free_rom']
                }
            },
            
            // Reglas para ejercicios cardiovasculares
            cardio_exercises: {
                swimming: {
                    progression_type: 'time_distance',
                    metric: 'duration_intensity',
                    increment: '2_minutes_weekly',
                    max_session: 60 // minutos
                },
                cycling: {
                    progression_type: 'distance_based',
                    increment: '5km_bi_weekly',
                    current_baseline: 40, // km actuales
                    max_distance: 80 // km límite razonable
                }
            }
        };
    }

    // ===== ALGORITMO PRINCIPAL DE PROGRESIÓN =====
    calculateNextProgression(exerciseId, currentPerformance, userFeedback) {
        const exercise = this.getExerciseById(exerciseId);
        const history = this.exerciseHistory.getHistory(exerciseId);
        const trend = this.analyzeTrend(history);
        
        // Machine Learning: Predicción basada en patrones históricos
        const mlPrediction = this.learningModel.predict({
            currentPerformance,
            trend,
            userFeedback,
            medicalFactors: this.getMedicalFactors(exercise)
        });
        
        // Aplicar reglas de progresión específicas
        const ruleBasedProgression = this.applyProgressionRules(exercise, currentPerformance);
        
        // Combinar ML y reglas (weighted average)
        const finalProgression = this.combineRecommendations(mlPrediction, ruleBasedProgression);
        
        // Validación de seguridad médica
        const safeProgression = this.validateMedicalSafety(finalProgression, exercise);
        
        return safeProgression;
    }

    // ===== DETECCIÓN DE PLATEAU =====
    detectPlateau(exerciseId, lookbackWeeks = 4) {
        const recentHistory = this.exerciseHistory.getRecentHistory(exerciseId, lookbackWeeks);
        
        if (recentHistory.length < 3) return false;
        
        // Calcular variación en rendimiento
        const performances = recentHistory.map(session => session.totalVolume);
        const variance = this.calculateVariance(performances);
        const trend = this.calculateTrend(performances);
        
        // Plateau detectado si:
        // 1. Poca variación (< 5%)
        // 2. Tendencia plana o negativa
        // 3. RPE consistentemente alto (>8)
        const avgRPE = recentHistory.reduce((sum, s) => sum + s.avgRPE, 0) / recentHistory.length;
        
        const plateauDetected = variance < 0.05 && Math.abs(trend) < 0.02 && avgRPE > 8;
        
        if (plateauDetected) {
            return {
                detected: true,
                type: this.classifyPlateau(recentHistory),
                recommendation: this.generatePlateauStrategy(exerciseId)
            };
        }
        
        return { detected: false };
    }

    // ===== ESTRATEGIAS ANTI-PLATEAU =====
    generatePlateauStrategy(exerciseId) {
        const exercise = this.getExerciseById(exerciseId);
        const strategies = [];
        
        // Estrategia 1: Deload (reducción temporal)
        strategies.push({
            type: 'deload',
            description: 'Reducir carga 15% por 1 semana',
            duration: '1_week',
            reduction: 0.15
        });
        
        // Estrategia 2: Cambio de rep ranges
        strategies.push({
            type: 'rep_range_change',
            description: 'Cambiar de 8-10 reps a 5-6 reps (más peso)',
            newRange: '5-6',
            expectedIncrease: '10-15%'
        });
        
        // Estrategia 3: Sustitución temporal
        const alternatives = this.getAlternativeExercises(exerciseId);
        strategies.push({
            type: 'temporary_substitution',
            description: 'Sustituir 2 semanas por ejercicio similar',
            alternatives: alternatives.slice(0, 2)
        });
        
        // Estrategia médica específica
        if (exercise.medical_priority) {
            strategies.push({
                type: 'medical_review',
                description: 'Revisión de técnica y posible adaptación médica',
                action: 'consult_technique'
            });
        }
        
        return strategies;
    }

    // ===== MACHINE LEARNING SIMPLE =====
    class SimpleMLModel {
        constructor() {
            this.weights = {
                currentPerformance: 0.4,
                trend: 0.3,
                userFeedback: 0.2,
                medicalFactors: 0.1
            };
            this.learningRate = 0.01;
        }
        
        predict(inputs) {
            // Normalizar inputs
            const normalized = this.normalizeInputs(inputs);
            
            // Cálculo weighted sum
            let prediction = 0;
            prediction += normalized.currentPerformance * this.weights.currentPerformance;
            prediction += normalized.trend * this.weights.trend;  
            prediction += normalized.userFeedback * this.weights.userFeedback;
            prediction += normalized.medicalFactors * this.weights.medicalFactors;
            
            // Aplicar función de activación (sigmoid)
            return this.sigmoid(prediction);
        }
        
        // Aprendizaje basado en feedback del usuario
        learn(inputs, actualOutcome, expectedOutcome) {
            const error = expectedOutcome - actualOutcome;
            
            // Ajustar pesos usando gradiente descendente básico
            this.weights.currentPerformance += this.learningRate * error * inputs.currentPerformance;
            this.weights.trend += this.learningRate * error * inputs.trend;
            this.weights.userFeedback += this.learningRate * error * inputs.userFeedback;
            this.weights.medicalFactors += this.learningRate * error * inputs.medicalFactors;
        }
        
        sigmoid(x) {
            return 1 / (1 + Math.exp(-x));
        }
    }

    // ===== VALIDACIÓN DE SEGURIDAD MÉDICA =====
    validateMedicalSafety(proposition, exercise) {
        const safeProgression = { ...proposition };
        
        // Validaciones específicas para fusión lumbar
        if (this.userProfile.medical.lumbar_fusion_L3L4) {
            if (exercise.lumbar_load && proposition.increment > 2.5) {
                safeProgression.increment = 2.5; // Limitar incrementos
                safeProgression.reason = 'lumbar_protection';
            }
            
            if (exercise.core_exercise && proposition.duration > 45) {
                safeProgression.duration = 45; // Límite temporal
                safeProgression.reason = 'core_safety_limit';
            }
        }
        
        // Validaciones específicas para LCA reconstruido
        if (this.userProfile.medical.acl_reconstruction_right) {
            if (exercise.knee_load && proposition.increment > 1) {
                safeProgression.increment = Math.min(proposition.increment, 1);
                safeProgression.reason = 'knee_protection';
            }
        }
        
        // Validación de RPE máximo
        if (proposition.expectedRPE > 9) {
            safeProgression = this.reduceIntensity(safeProgression);
            safeProgression.reason = 'rpe_too_high';
        }
        
        return safeProgression;
    }

    // ===== RECOMENDACIONES INTELIGENTES =====
    generateSmartRecommendations(weeklyPerformance) {
        const recommendations = [];
        
        // Análisis de tendencias
        const volumeTrend = this.calculateTrend(weeklyPerformance.volumes);
        const intensityTrend = this.calculateTrend(weeklyPerformance.intensities);
        const recoveryTrend = this.calculateTrend(weeklyPerformance.recoveryScores);
        
        // Recomendación 1: Ajuste de volumen
        if (volumeTrend > 0.15) { // Crecimiento muy rápido
            recommendations.push({
                type: 'volume_adjustment',
                message: 'Crecimiento de volumen muy rápido. Considera deload.',
                priority: 'high',
                action: 'reduce_volume_10_percent'
            });
        }
        
        // Recomendación 2: Recuperación
        if (recoveryTrend < -0.1) { // Recuperación empeorando
            recommendations.push({
                type: 'recovery_focus',
                message: 'Señales de fatiga acumulada. Prioriza recuperación.',
                priority: 'high',
                actions: ['increase_sleep', 'add_mobility_work', 'reduce_intensity']
            });
        }
        
        // Recomendación 3: Ejercicios médicos
        const lumbarCompliance = this.calculateLumbarComplianceRate();
        if (lumbarCompliance < 0.8) { // <80% cumplimiento
            recommendations.push({
                type: 'medical_compliance',
                message: 'Baja adherencia ejercicios lumbares. Crítico para tu fusión.',
                priority: 'critical',
                action: 'prioritize_lumbar_rehab'
            });
        }
        
        return recommendations;
    }

    // ===== PREDICCIONES DE RENDIMIENTO =====
    predictFuturePerformance(exerciseId, weeksAhead = 4) {
        const history = this.exerciseHistory.getHistory(exerciseId);
        if (history.length < 4) return null;
        
        const trend = this.calculateTrend(history.map(h => h.bestPerformance));
        const seasonality = this.detectSeasonality(history);
        
        const predictions = [];
        let currentPerformance = history[history.length - 1].bestPerformance;
        
        for (let week = 1; week <= weeksAhead; week++) {
            currentPerformance += trend;
            
            // Aplicar factores estacionales
            if (seasonality && seasonality.detected) {
                currentPerformance *= seasonality.factors[week % seasonality.period];
            }
            
            // Aplicar degradación por plateau potencial
            const plateauFactor = Math.max(0.95, 1 - (week * 0.02));
            currentPerformance *= plateauFactor;
            
            predictions.push({
                week: week,
                predictedPerformance: Math.round(currentPerformance * 100) / 100,
                confidence: Math.max(0.5, 0.9 - (week * 0.1))
            });
        }
        
        return predictions;
    }
}

// ===== CLASE DE ANÁLISIS DE RENDIMIENTO =====
class PerformanceAnalytics {
    constructor(exerciseHistory) {
        this.history = exerciseHistory;
    }
    
    // Análisis completo de rendimiento
    generatePerformanceReport(timeframe = 'monthly') {
        return {
            overview: this.generateOverview(timeframe),
            trends: this.analyzeTrends(timeframe),
            achievements: this.identifyAchievements(timeframe),
            areas_for_improvement: this.identifyWeaknesses(timeframe),
            medical_compliance: this.analyzeMedicalCompliance(timeframe),
            predictions: this.generatePredictions(timeframe)
        };
    }
    
    // Identificar nuevos récords personales
    identifyAchievements(timeframe) {
        const achievements = [];
        const recentSessions = this.getRecentSessions(timeframe);
        
        recentSessions.forEach(session => {
            session.exercises.forEach(exercise => {
                if (exercise.isPR) { // Personal Record
                    achievements.push({
                        type: 'personal_record',
                        exercise: exercise.name,
                        previous_best: exercise.previousBest,
                        new_best: exercise.currentBest,
                        improvement: exercise.improvement,
                        date: session.date
                    });
                }
            });
        });
        
        return achievements;
    }
}

export { AutoProgressionEngine, PerformanceAnalytics };