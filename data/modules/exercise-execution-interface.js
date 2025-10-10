// ===============================================
// INTERFACES PROFESIONALES AVANZADAS v2.0
// SISTEMA COMPLETO DE EJECUCIÓN Y REGISTRO
// ===============================================

class ExerciseExecutionInterface {
    constructor(app) {
        this.app = app;
        this.currentExercise = null;
        this.currentSet = 0;
        this.restTimer = null;
        this.sessionTimer = null;
        this.medicalAlerts = new MedicalAlertSystem(app.user.medicalProfile);
    }

    // ===== VISTA PRINCIPAL DE EJERCICIO =====
    showExerciseDetail(exerciseId) {
        const exercise = this.app.workoutModule.getExerciseById(exerciseId);
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();
        
        // Generar alertas médicas específicas
        const medicalAlerts = this.medicalAlerts.generateAlertsForExercise(exercise);
        
        container.innerHTML = `
            <div class="exercise-execution-view" style="animation: slideInRight 0.4s ease-out;">
                
                <!-- Header con información del ejercicio -->
                ${this.generateExerciseHeader(exercise, colors)}
                
                <!-- Alertas médicas -->
                ${medicalAlerts.length > 0 ? this.generateMedicalAlertsHTML(medicalAlerts, colors) : ''}
                
                <!-- Descripción técnica detallada -->
                ${this.generateTechniqueSection(exercise, colors)}
                
                <!-- Sistema de registro de series -->
                ${this.generateSetLoggingInterface(exercise, colors)}
                
                <!-- Cronómetro y controles -->
                ${this.generateTimerControls(colors)}
                
                <!-- Acciones del ejercicio -->
                ${this.generateExerciseActions(exercise, colors)}
                
            </div>
        `;
        
        this.setupEventListeners(exercise);
        this.startSessionTimer();
    }

    // ===== HEADER PROFESIONAL DEL EJERCICIO =====
    generateExerciseHeader(exercise, colors) {
        const difficulty = {
            'beginner': { icon: '🟢', text: 'Principiante', color: '#10b981' },
            'intermediate': { icon: '🟡', text: 'Intermedio', color: '#f59e0b' },
            'advanced': { icon: '🔴', text: 'Avanzado', color: '#ef4444' }
        };
        
        const diffInfo = difficulty[exercise.difficulty] || difficulty.intermediate;
        
        return `
            <div class="exercise-header" style="background: linear-gradient(135deg, ${colors.background} 0%, ${colors.secondary}30 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 2px solid ${colors.accent}40;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <h1 style="color: ${colors.textDark}; font-size: 2em; margin: 0 0 12px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">${exercise.name}</h1>
                        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                            <span style="background: ${diffInfo.color}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 700;">
                                ${diffInfo.icon} ${diffInfo.text}
                            </span>
                            <span style="background: ${colors.accent}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 700;">
                                🎯 ${exercise.target}
                            </span>
                            ${exercise.medical_safe ? `<span style="background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 700;">✅ MÉDICAMENTE SEGURO</span>` : ''}
                            ${exercise.medical_priority ? `<span style="background: #dc2626; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 700;">🏥 REHABILITACIÓN</span>` : ''}
                        </div>
                    </div>
                    
                    <button onclick="app.workoutModule.backToWorkout()" class="btn-secondary" style="padding: 12px 20px;">← Volver</button>
                </div>
                
                <div class="muscle-info" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                    <div>
                        <h3 style="color: ${colors.textDark}; margin: 0 0 8px 0; font-size: 1.2em; font-weight: 600;">Músculos trabajados:</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <span style="background: ${colors.accent}20; color: ${colors.accent}; padding: 4px 12px; border-radius: 12px; font-weight: 600; border: 1px solid ${colors.accent}40;">${exercise.target}</span>
                            ${(exercise.secondary || []).map(muscle => `
                                <span style="background: ${colors.textSecondary}20; color: ${colors.textSecondary}; padding: 4px 12px; border-radius: 12px; font-size: 0.9em;">${muscle}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="text-align: right;">
                        <div style="background: ${colors.primary}; border-radius: 12px; padding: 16px; border: 2px solid ${colors.border};">
                            <div style="font-size: 1.8em; font-weight: 800; color: ${colors.accent}; margin-bottom: 4px;">${exercise.defaultSets}</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 8px;">SERIES</div>
                            <div style="font-size: 1.1em; font-weight: 700; color: ${colors.textDark};">${exercise.defaultReps} reps</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== ALERTAS MÉDICAS CONTEXTUALES =====
    generateMedicalAlertsHTML(alerts, colors) {
        return `
            <div class="medical-alerts-section" style="margin-bottom: 24px;">
                ${alerts.map(alert => `
                    <div class="medical-alert ${alert.priority}" style="
                        background: ${alert.priority === 'high' ? '#fef2f2' : '#f0f9ff'}; 
                        border: 2px solid ${alert.priority === 'high' ? '#ef4444' : '#3b82f6'}; 
                        border-radius: 12px; 
                        padding: 16px; 
                        margin-bottom: 12px;
                        animation: alertPulse 2s ease-in-out infinite;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 1.5em;">${alert.priority === 'high' ? '⚠️' : 'ℹ️'}</span>
                            <div>
                                <div style="font-weight: 700; color: ${alert.priority === 'high' ? '#dc2626' : '#1e40af'}; margin-bottom: 4px;">${alert.title}</div>
                                <div style="color: ${alert.priority === 'high' ? '#7f1d1d' : '#1e3a8a'}; font-size: 0.95em;">${alert.message}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===== SECCIÓN DE TÉCNICA DETALLADA =====
    generateTechniqueSection(exercise, colors) {
        return `
            <div class="technique-section" style="background: ${colors.primary}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 2px solid ${colors.border};">
                
                <div class="technique-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="color: ${colors.textDark}; margin: 0; font-size: 1.4em; font-weight: 700;">📋 Técnica de Ejecución</h3>
                    <button onclick="this.toggleTechnique()" class="btn-secondary" style="padding: 8px 16px; font-size: 0.9em;">Ver/Ocultar</button>
                </div>
                
                <div class="technique-content" id="technique-content">
                    <div class="description" style="margin-bottom: 20px;">
                        <h4 style="color: ${colors.textDark}; margin: 0 0 8px 0; font-size: 1.1em; font-weight: 600;">Descripción:</h4>
                        <p style="color: ${colors.textSecondary}; line-height: 1.6; margin: 0;">${exercise.description}</p>
                    </div>
                    
                    ${exercise.instructions ? `
                        <div class="instructions" style="margin-bottom: 20px;">
                            <h4 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 1.1em; font-weight: 600;">Paso a paso:</h4>
                            <ol style="color: ${colors.textSecondary}; margin: 0; padding-left: 20px;">
                                ${exercise.instructions.map(step => `<li style="margin-bottom: 8px; line-height: 1.5;">${step}</li>`).join('')}
                            </ol>
                        </div>
                    ` : ''}
                    
                    ${exercise.tips ? `
                        <div class="tips" style="margin-bottom: 16px;">
                            <h4 style="color: ${colors.textDark}; margin: 0 0 12px 0; font-size: 1.1em; font-weight: 600;">💡 Tips importantes:</h4>
                            <ul style="color: ${colors.textSecondary}; margin: 0; padding-left: 20px;">
                                ${exercise.tips.map(tip => `<li style="margin-bottom: 6px; line-height: 1.4;">${tip}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${exercise.medical_notes ? `
                        <div class="medical-notes" style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 12px;">
                            <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 1em; font-weight: 700;">🏥 Notas médicas específicas:</h4>
                            <p style="color: #7f1d1d; margin: 0; font-size: 0.95em; line-height: 1.4;">${exercise.medical_notes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ===== INTERFACE AVANZADA DE REGISTRO DE SERIES =====
    generateSetLoggingInterface(exercise, colors) {
        const targetWeight = this.calculateTargetWeight(exercise);
        const targetReps = this.parseRepRange(exercise.defaultReps);
        
        return `
            <div class="set-logging-interface" style="background: ${colors.primary}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 2px solid ${colors.accent}40;">
                
                <div class="logging-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: ${colors.textDark}; margin: 0; font-size: 1.4em; font-weight: 700;">📊 Registro de Series</h3>
                    <div class="quick-actions" style="display: flex; gap: 8px;">
                        <button onclick="this.autoFillSets()" class="btn-secondary" style="padding: 8px 16px; font-size: 0.9em;">Auto-rellenar</button>
                        <button onclick="this.copyLastSession()" class="btn-secondary" style="padding: 8px 16px; font-size: 0.9em;">Copiar anterior</button>
                    </div>
                </div>
                
                <div class="target-info" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; padding: 16px; background: ${colors.secondary}20; border-radius: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; font-weight: 800; color: ${colors.accent};">${targetWeight}kg</div>
                        <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600; text-transform: uppercase;">Peso objetivo</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; font-weight: 800; color: ${colors.accent};">${targetReps.min}-${targetReps.max}</div>
                        <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600; text-transform: uppercase;">Reps objetivo</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; font-weight: 800; color: ${colors.accent};">${exercise.defaultRest}s</div>
                        <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600; text-transform: uppercase;">Descanso</div>
                    </div>
                </div>
                
                <div class="sets-container" id="sets-container">
                    ${this.generateSetsHTML(exercise, colors, targetWeight, targetReps)}
                </div>
                
                <div class="set-summary" style="margin-top: 20px; padding: 16px; background: ${colors.background}; border-radius: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; text-align: center;">
                        <div>
                            <div class="summary-value" id="total-volume" style="font-size: 1.3em; font-weight: 700; color: ${colors.textDark};">0</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">VOLUMEN (KG)</div>
                        </div>
                        <div>
                            <div class="summary-value" id="total-reps" style="font-size: 1.3em; font-weight: 700; color: ${colors.textDark};">0</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">REPS TOTAL</div>
                        </div>
                        <div>
                            <div class="summary-value" id="avg-rpe" style="font-size: 1.3em; font-weight: 700; color: ${colors.textDark};">-</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">RPE PROMEDIO</div>
                        </div>
                        <div>
                            <div class="summary-value" id="estimated-1rm" style="font-size: 1.3em; font-weight: 700; color: ${colors.textDark};">-</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">1RM ESTIMADO</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== GENERAR HTML DE SERIES INDIVIDUALES =====
    generateSetsHTML(exercise, colors, targetWeight, targetReps) {
        let setsHTML = '';
        
        for (let setIndex = 0; setIndex < exercise.defaultSets; setIndex++) {
            setsHTML += `
                <div class="set-row" data-set="${setIndex}" style="
                    display: grid; 
                    grid-template-columns: 60px 1fr 1fr 1fr 1fr 80px; 
                    gap: 12px; 
                    padding: 16px; 
                    margin-bottom: 12px; 
                    background: ${colors.background}; 
                    border-radius: 12px; 
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                " id="set-${setIndex}">
                    
                    <div class="set-number" style="display: flex; align-items: center; justify-content: center; background: ${colors.accent}; color: white; border-radius: 8px; font-weight: 700; font-size: 1.1em;">
                        ${setIndex + 1}
                    </div>
                    
                    <div class="weight-input-container">
                        <label style="display: block; font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 4px;">PESO (KG)</label>
                        <div style="display: flex; align-items: center;">
                            <button onclick="this.adjustWeight(${setIndex}, -2.5)" class="weight-adjust" style="background: ${colors.secondary}; border: none; color: ${colors.textDark}; padding: 8px 12px; border-radius: 6px 0 0 6px; cursor: pointer; font-weight: 700;">-</button>
                            <input type="number" 
                                   value="${targetWeight}" 
                                   step="2.5" 
                                   min="0"
                                   class="weight-input" 
                                   data-set="${setIndex}"
                                   style="width: 80px; text-align: center; border: 2px solid ${colors.border}; border-left: none; border-right: none; padding: 8px 4px; font-weight: 700; font-size: 1em;"
                                   onchange="this.updateSetSummary()">
                            <button onclick="this.adjustWeight(${setIndex}, 2.5)" class="weight-adjust" style="background: ${colors.secondary}; border: none; color: ${colors.textDark}; padding: 8px 12px; border-radius: 0 6px 6px 0; cursor: pointer; font-weight: 700;">+</button>
                        </div>
                    </div>
                    
                    <div class="reps-input-container">
                        <label style="display: block; font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 4px;">REPS</label>
                        <div style="display: flex; align-items: center;">
                            <button onclick="this.adjustReps(${setIndex}, -1)" class="reps-adjust" style="background: ${colors.secondary}; border: none; color: ${colors.textDark}; padding: 8px 12px; border-radius: 6px 0 0 6px; cursor: pointer; font-weight: 700;">-</button>
                            <input type="number" 
                                   value="${targetReps.min}" 
                                   min="1"
                                   max="50"
                                   class="reps-input" 
                                   data-set="${setIndex}"
                                   style="width: 60px; text-align: center; border: 2px solid ${colors.border}; border-left: none; border-right: none; padding: 8px 4px; font-weight: 700; font-size: 1em;"
                                   onchange="this.updateSetSummary()">
                            <button onclick="this.adjustReps(${setIndex}, 1)" class="reps-adjust" style="background: ${colors.secondary}; border: none; color: ${colors.textDark}; padding: 8px 12px; border-radius: 0 6px 6px 0; cursor: pointer; font-weight: 700;">+</button>
                        </div>
                    </div>
                    
                    <div class="rpe-input-container">
                        <label style="display: block; font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 4px;">RPE (1-10)</label>
                        <select class="rpe-input" 
                                data-set="${setIndex}"
                                style="width: 100%; padding: 8px; border: 2px solid ${colors.border}; border-radius: 6px; background: ${colors.primary}; color: ${colors.textDark}; font-weight: 600;"
                                onchange="this.updateSetSummary()">
                            <option value="">-</option>
                            <option value="6">6 - Fácil</option>
                            <option value="7">7 - Algo duro</option>
                            <option value="8">8 - Duro</option>
                            <option value="9">9 - Muy duro</option>
                            <option value="10">10 - Máximo</option>
                        </select>
                    </div>
                    
                    <div class="volume-display" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <div class="volume-value" style="font-size: 1.2em; font-weight: 700; color: ${colors.accent};">0</div>
                        <div style="font-size: 0.7em; color: ${colors.textSecondary}; font-weight: 600;">VOLUMEN</div>
                    </div>
                    
                    <div class="set-actions" style="display: flex; flex-direction: column; gap: 4px;">
                        <button onclick="this.completeSet(${setIndex})" 
                                class="btn-complete-set" 
                                style="background: #10b981; color: white; border: none; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 700;">
                            ✓
                        </button>
                        <button onclick="this.failSet(${setIndex})" 
                                class="btn-fail-set" 
                                style="background: #ef4444; color: white; border: none; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 700;">
                            ✗
                        </button>
                    </div>
                </div>
            `;
        }
        
        return setsHTML;
    }
}

// ===== SISTEMA DE CRONÓMETROS AVANZADO =====
class AdvancedTimerSystem {
    constructor() {
        this.restTimer = null;
        this.sessionTimer = null;
        this.isRestActive = false;
        this.restTimeRemaining = 0;
        this.sessionStartTime = null;
        this.sounds = this.initializeSounds();
    }
    
    // Inicializar sonidos (Web Audio API)
    initializeSounds() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return {
            start: this.createBeep(audioContext, 800, 0.2),
            warning: this.createBeep(audioContext, 600, 0.3),
            complete: this.createBeep(audioContext, 1000, 0.5)
        };
    }
    
    // Crear sonidos de beep
    createBeep(audioContext, frequency, duration) {
        return () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    // Iniciar cronómetro de descanso
    startRestTimer(duration) {
        this.stopRestTimer(); // Detener cualquier timer activo
        
        this.restTimeRemaining = duration;
        this.isRestActive = true;
        
        // Actualizar UI inmediatamente
        this.updateRestTimerDisplay();
        
        // Sound feedback
        this.sounds.start();
        
        this.restTimer = setInterval(() => {
            this.restTimeRemaining--;
            this.updateRestTimerDisplay();
            
            // Alertas de tiempo
            if (this.restTimeRemaining === 30) {
                this.sounds.warning();
                this.showTimerAlert('30 segundos restantes', 'warning');
            } else if (this.restTimeRemaining === 10) {
                this.sounds.warning();
                this.showTimerAlert('10 segundos restantes', 'warning');
            } else if (this.restTimeRemaining === 0) {
                this.sounds.complete();
                this.completeRestTimer();
            }
        }, 1000);
    }
    
    // Completar cronómetro de descanso
    completeRestTimer() {
        this.stopRestTimer();
        this.showTimerAlert('¡Tiempo cumplido! Lista para la siguiente serie', 'success');
        
        // Vibración si está disponible
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

export { ExerciseExecutionInterface, AdvancedTimerSystem };