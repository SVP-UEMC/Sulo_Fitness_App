// ===============================================
// SISTEMA DE CRONÓMETROS Y HERRAMIENTAS AVANZADAS v2.0
// WEB AUDIO API + NOTIFICACIONES + VIBRACIÓN
// ===============================================

class AdvancedWorkoutTools {
    constructor(app) {
        this.app = app;
        this.timers = {
            rest: null,
            session: null,
            exercise: null
        };
        this.audioSystem = new WorkoutAudioSystem();
        this.notificationSystem = new WorkoutNotifications();
        this.analytics = new RealTimeAnalytics();
    }

    // ===== CRONÓMETRO INTELIGENTE ENTRE SERIES =====
    generateRestTimerHTML(colors) {
        return `
            <div class="rest-timer-container" id="rest-timer" style="
                position: fixed; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%); 
                background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}dd 100%); 
                color: white; 
                border-radius: 20px; 
                padding: 32px; 
                box-shadow: 0 12px 40px rgba(0,0,0,0.3); 
                z-index: 1000;
                display: none;
                text-align: center;
                min-width: 320px;
                border: 3px solid rgba(255,255,255,0.2);
            ">
                
                <!-- Timer principal -->
                <div class="timer-main-display">
                    <div class="time-remaining" id="time-remaining" style="
                        font-size: 4em; 
                        font-weight: 900; 
                        margin-bottom: 12px; 
                        font-family: 'Poppins', sans-serif; 
                        text-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        letter-spacing: -2px;
                    ">3:00</div>
                    
                    <div class="timer-label" style="
                        font-size: 1.1em; 
                        font-weight: 600; 
                        margin-bottom: 24px; 
                        opacity: 0.9;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">Descanso entre series</div>
                </div>
                
                <!-- Barra de progreso circular -->
                <div class="progress-circle" style="margin-bottom: 32px; position: relative;">
                    <svg width="120" height="120" style="transform: rotate(-90deg);">
                        <circle cx="60" cy="60" r="50" 
                                fill="none" 
                                stroke="rgba(255,255,255,0.2)" 
                                stroke-width="8"/>
                        <circle cx="60" cy="60" r="50" 
                                fill="none" 
                                stroke="white" 
                                stroke-width="8"
                                stroke-linecap="round"
                                id="progress-circle"
                                style="
                                    stroke-dasharray: 314; 
                                    stroke-dashoffset: 0; 
                                    transition: stroke-dashoffset 1s ease-out;
                                "/>
                    </svg>
                    <div style="
                        position: absolute; 
                        top: 50%; 
                        left: 50%; 
                        transform: translate(-50%, -50%); 
                        font-size: 1.2em; 
                        font-weight: 700;
                    ">
                        <span id="progress-percentage">100%</span>
                    </div>
                </div>
                
                <!-- Controles del timer -->
                <div class="timer-controls" style="display: flex; justify-content: center; gap: 16px; margin-bottom: 20px;">
                    <button onclick="workoutTools.pauseRestTimer()" class="timer-btn" style="
                        background: rgba(255,255,255,0.2); 
                        border: 2px solid rgba(255,255,255,0.4); 
                        color: white; 
                        padding: 12px 20px; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        font-weight: 700;
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                    ">⏸️ Pausar</button>
                    
                    <button onclick="workoutTools.addTimeToRest(30)" class="timer-btn" style="
                        background: rgba(255,255,255,0.2); 
                        border: 2px solid rgba(255,255,255,0.4); 
                        color: white; 
                        padding: 12px 20px; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        font-weight: 700;
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                    ">+30s</button>
                    
                    <button onclick="workoutTools.skipRest()" class="timer-btn" style="
                        background: rgba(255,255,255,0.2); 
                        border: 2px solid rgba(255,255,255,0.4); 
                        color: white; 
                        padding: 12px 20px; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        font-weight: 700;
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                    ">⏭️ Saltar</button>
                </div>
                
                <!-- Información adicional -->
                <div class="timer-info" style="font-size: 0.9em; opacity: 0.8;">
                    <div id="next-set-info">Siguiente: Serie 2 de 3</div>
                    <div style="margin-top: 8px; font-size: 0.85em; opacity: 0.7;">
                        Tip: Respira profundo y mantente hidratado
                    </div>
                </div>
            </div>
        `;
    }

    // ===== CRONÓMETRO DE SESIÓN COMPLETA =====
    generateSessionTimerHTML(colors) {
        return `
            <div class="session-timer-widget" style="
                position: fixed; 
                top: 20px; 
                right: 20px; 
                background: rgba(0,0,0,0.8); 
                color: white; 
                padding: 16px 20px; 
                border-radius: 16px; 
                z-index: 999;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                min-width: 200px;
            ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85em; font-weight: 600; opacity: 0.8;">DURACIÓN SESIÓN</span>
                    <button onclick="this.toggleSessionTimer()" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">⚙️</button>
                </div>
                
                <div class="session-time-display" style="display: flex; align-items: baseline; gap: 8px;">
                    <span id="session-time" style="font-size: 1.8em; font-weight: 900; font-family: 'Poppins', sans-serif;">00:00</span>
                    <span style="font-size: 0.9em; opacity: 0.7;">min</span>
                </div>
                
                <div class="session-stats" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 12px; font-size: 0.8em;">
                    <div style="text-align: center;">
                        <div id="completed-sets" style="font-weight: 700; font-size: 1.2em;">0</div>
                        <div style="opacity: 0.7;">SERIES</div>
                    </div>
                    <div style="text-align: center;">
                        <div id="total-volume" style="font-weight: 700; font-size: 1.2em;">0</div>
                        <div style="opacity: 0.7;">VOLUMEN</div>
                    </div>
                    <div style="text-align: center;">
                        <div id="calories-estimate" style="font-weight: 700; font-size: 1.2em;">0</div>
                        <div style="opacity: 0.7;">KCAL</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== SISTEMA DE AUDIO PROFESIONAL =====
    class WorkoutAudioSystem {
        constructor() {
            this.audioContext = null;
            this.sounds = {};
            this.enabled = true;
            this.volume = 0.7;
            this.initializeAudio();
        }
        
        async initializeAudio() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.preloadSounds();
            } catch (error) {
                console.warn('Audio no disponible:', error);
                this.enabled = false;
            }
        }
        
        preloadSounds() {
            // Crear sonidos sintéticos optimizados
            this.sounds = {
                setComplete: () => this.playTone([800, 1000], 0.3),
                restStart: () => this.playTone([600], 0.2),
                restWarning: () => this.playTone([500, 400], 0.4),
                restComplete: () => this.playTone([1000, 1200, 1000], 0.6),
                workoutComplete: () => this.playTone([800, 1000, 1200, 1000], 1.0),
                alert: () => this.playTone([400, 300, 400], 0.5)
            };
        }
        
        playTone(frequencies, duration) {
            if (!this.enabled || !this.audioContext) return;
            
            frequencies.forEach((frequency, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + index * 0.1);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.1);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + index * 0.1 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.1 + duration/frequencies.length);
                
                oscillator.start(this.audioContext.currentTime + index * 0.1);
                oscillator.stop(this.audioContext.currentTime + index * 0.1 + duration/frequencies.length);
            });
        }
        
        // Reproducir sonidos específicos
        playSetComplete() { this.sounds.setComplete(); }
        playRestStart() { this.sounds.restStart(); }
        playRestWarning() { this.sounds.restWarning(); }
        playRestComplete() { this.sounds.restComplete(); }
        playWorkoutComplete() { this.sounds.workoutComplete(); }
        playAlert() { this.sounds.alert(); }
    }

    // ===== SISTEMA DE NOTIFICACIONES INTELIGENTES =====
    class WorkoutNotifications {
        constructor() {
            this.permission = 'default';
            this.requestPermission();
        }
        
        async requestPermission() {
            if ('Notification' in window) {
                this.permission = await Notification.requestPermission();
            }
        }
        
        show(title, options = {}) {
            const defaultOptions = {
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                tag: 'workout'
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            
            // Notificación visual en la app
            this.showInAppNotification(title, finalOptions.body);
            
            // Notificación del sistema si hay permiso
            if (this.permission === 'granted') {
                new Notification(title, finalOptions);
            }
            
            // Vibración si está disponible
            if ('vibrate' in navigator && finalOptions.vibrate) {
                navigator.vibrate(finalOptions.vibrate);
            }
        }
        
        showInAppNotification(title, message) {
            const notification = document.createElement('div');
            notification.className = 'in-app-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                z-index: 10001;
                box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
                animation: slideInDown 0.4s ease-out;
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
            `;
            
            notification.innerHTML = `
                <div style="font-weight: 700; font-size: 1em; margin-bottom: 4px;">${title}</div>
                ${message ? `<div style="font-size: 0.9em; opacity: 0.9;">${message}</div>` : ''}
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remover después de 4 segundos
            setTimeout(() => {
                notification.style.animation = 'slideOutUp 0.4s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 400);
            }, 4000);
        }
    }

    // ===== ANALYTICS EN TIEMPO REAL =====
    class RealTimeAnalytics {
        constructor() {
            this.sessionData = {
                startTime: null,
                exercises: [],
                totalVolume: 0,
                totalSets: 0,
                totalReps: 0,
                avgRPE: 0,
                estimatedCalories: 0
            };
        }
        
        startSession() {
            this.sessionData.startTime = new Date();
            this.updateSessionDisplay();
        }
        
        logSet(exerciseId, setData) {
            const exercise = this.sessionData.exercises.find(e => e.id === exerciseId) || 
                           { id: exerciseId, sets: [] };
            
            if (!this.sessionData.exercises.includes(exercise)) {
                this.sessionData.exercises.push(exercise);
            }
            
            exercise.sets.push({
                weight: setData.weight,
                reps: setData.reps,
                rpe: setData.rpe,
                timestamp: new Date(),
                volume: setData.weight * setData.reps
            });
            
            this.updateTotals();
            this.updateSessionDisplay();
            this.generateInsights();
        }
        
        updateTotals() {
            this.sessionData.totalVolume = 0;
            this.sessionData.totalSets = 0;
            this.sessionData.totalReps = 0;
            let totalRPE = 0;
            let rpeCount = 0;
            
            this.sessionData.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    this.sessionData.totalVolume += set.volume;
                    this.sessionData.totalSets++;
                    this.sessionData.totalReps += set.reps;
                    
                    if (set.rpe) {
                        totalRPE += set.rpe;
                        rpeCount++;
                    }
                });
            });
            
            this.sessionData.avgRPE = rpeCount > 0 ? totalRPE / rpeCount : 0;
            this.sessionData.estimatedCalories = this.calculateCaloriesBurned();
        }
        
        calculateCaloriesBurned() {
            // Fórmula aproximada basada en peso corporal y volumen
            const userWeight = 74; // kg (tu peso)
            const mets = 6; // METs promedio para entrenamiento de fuerza
            const sessionDuration = this.getSessionDuration(); // horas
            
            return Math.round(mets * userWeight * sessionDuration);
        }
        
        getSessionDuration() {
            if (!this.sessionData.startTime) return 0;
            return (new Date() - this.sessionData.startTime) / (1000 * 60 * 60); // horas
        }
        
        generateInsights() {
            const insights = [];
            
            // Insight de volumen
            if (this.sessionData.totalVolume > 3000) {
                insights.push({
                    type: 'volume_high',
                    message: '🔥 ¡Excelente volumen de entrenamiento! Más de 3 toneladas movidas.',
                    priority: 'positive'
                });
            }
            
            // Insight de RPE
            if (this.sessionData.avgRPE > 8.5) {
                insights.push({
                    type: 'intensity_high',
                    message: '⚠️ Intensidad muy alta. Considera recuperación activa mañana.',
                    priority: 'warning'
                });
            }
            
            // Insight médico
            const lumbarExercises = this.sessionData.exercises.filter(e => 
                e.id.includes('lumbar') || e.id.includes('core')
            );
            
            if (lumbarExercises.length === 0) {
                insights.push({
                    type: 'medical_compliance',
                    message: '🏥 No se han realizado ejercicios lumbares. Crítico para tu fusión L3-L4.',
                    priority: 'critical'
                });
            }
            
            return insights;
        }
    }

    // ===== MÉTODOS PRINCIPALES DE CONTROL =====
    startRestTimer(duration, setNumber, totalSets) {
        this.showRestTimer();
        this.audioSystem.playRestStart();
        
        let timeRemaining = duration;
        const totalTime = duration;
        
        // Actualizar información del siguiente set
        document.getElementById('next-set-info').textContent = 
            `Siguiente: Serie ${setNumber + 1} de ${totalSets}`;
        
        this.timers.rest = setInterval(() => {
            timeRemaining--;
            this.updateRestTimerDisplay(timeRemaining, totalTime);
            
            // Alertas de tiempo
            if (timeRemaining === 30) {
                this.audioSystem.playRestWarning();
                this.notificationSystem.show('30 segundos restantes', {
                    body: 'Prepárate para la siguiente serie'
                });
            } else if (timeRemaining === 10) {
                this.audioSystem.playRestWarning();
            } else if (timeRemaining === 0) {
                this.completeRestTimer();
            }
        }, 1000);
    }
    
    completeRestTimer() {
        this.audioSystem.playRestComplete();
        this.notificationSystem.show('¡Tiempo cumplido!', {
            body: 'Lista para la siguiente serie',
            vibrate: [200, 100, 200, 100, 200]
        });
        
        this.hideRestTimer();
        this.clearRestTimer();
    }
    
    updateRestTimerDisplay(timeRemaining, totalTime) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Actualizar tiempo
        document.getElementById('time-remaining').textContent = timeString;
        
        // Actualizar progreso circular
        const percentage = (timeRemaining / totalTime) * 100;
        const circumference = 2 * Math.PI * 50; // radio = 50
        const offset = circumference * (1 - percentage / 100);
        
        document.getElementById('progress-circle').style.strokeDashoffset = offset;
        document.getElementById('progress-percentage').textContent = `${Math.round(percentage)}%`;
        
        // Cambiar color cuando queda poco tiempo
        if (timeRemaining <= 30) {
            document.getElementById('progress-circle').style.stroke = '#ef4444';
        } else if (timeRemaining <= 60) {
            document.getElementById('progress-circle').style.stroke = '#f59e0b';
        }
    }
}

export { AdvancedWorkoutTools };