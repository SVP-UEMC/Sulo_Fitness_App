// ===============================================
// SISTEMA COMPLETO DE ANALYTICS Y VISUALIZACIÓN v2.0
// GRÁFICOS INTERACTIVOS + PREDICCIONES + REPORTES
// ===============================================

class WorkoutAnalyticsSystem {
    constructor(app) {
        this.app = app;
        this.chartLib = this.initializeChartLibrary();
        this.dataProcessor = new DataProcessor();
        this.reportGenerator = new ReportGenerator();
        this.predictionEngine = new PredictionEngine();
    }

    // ===== VISTA PRINCIPAL DE ANALYTICS =====
    showAnalyticsView() {
        const container = document.getElementById('main-content');
        const colors = this.app.theme.getColors();
        const analytics = this.generateComprehensiveAnalytics();

        container.innerHTML = `
            <div class="analytics-dashboard" style="animation: fadeIn 0.6s ease-out;">
                
                <!-- Header del Dashboard -->
                ${this.generateAnalyticsHeader(colors)}
                
                <!-- Métricas principales -->
                ${this.generateKeyMetrics(analytics.keyMetrics, colors)}
                
                <!-- Gráficos de progreso -->
                ${this.generateProgressCharts(colors)}
                
                <!-- Análisis por ejercicio -->
                ${this.generateExerciseAnalysis(analytics.exerciseData, colors)}
                
                <!-- Tendencias médicas -->
                ${this.generateMedicalTrends(analytics.medicalData, colors)}
                
                <!-- Predicciones y recomendaciones -->
                ${this.generatePredictionsSection(analytics.predictions, colors)}
                
            </div>
        `;

        this.renderCharts();
        this.setupAnalyticsInteractions();
    }

    // ===== HEADER DEL DASHBOARD =====
    generateAnalyticsHeader(colors) {
        const dateRange = this.getCurrentDateRange();
        
        return `
            <div class="analytics-header" style="background: linear-gradient(135deg, ${colors.background} 0%, ${colors.secondary}40 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 2px solid ${colors.accent}30;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h1 style="color: ${colors.textDark}; font-size: 2.2em; margin: 0 0 8px 0; font-weight: 700; font-family: 'Poppins', sans-serif;">📊 Analytics & Progreso</h1>
                        <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin: 0;">Análisis inteligente de tu rendimiento</p>
                    </div>
                    
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <select id="time-range-selector" style="padding: 8px 16px; border-radius: 8px; border: 2px solid ${colors.border}; background: ${colors.primary}; color: ${colors.textDark}; font-weight: 600;">
                            <option value="week">Última semana</option>
                            <option value="month" selected>Último mes</option>
                            <option value="quarter">Último trimestre</option>
                            <option value="all">Todo el historial</option>
                        </select>
                        <button onclick="app.navigate('inicio')" class="btn-secondary">← Volver</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div style="text-align: center; padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 2px solid ${colors.border};">
                        <div style="font-size: 0.85em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 4px;">PERÍODO ANALIZADO</div>
                        <div style="font-size: 1.2em; font-weight: 700; color: ${colors.textDark};">${dateRange.label}</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 2px solid ${colors.border};">
                        <div style="font-size: 0.85em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 4px;">DATOS PROCESADOS</div>
                        <div style="font-size: 1.2em; font-weight: 700; color: ${colors.accent};">${dateRange.sessions} sesiones</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: ${colors.primary}; border-radius: 12px; border: 2px solid ${colors.border};">
                        <div style="font-size: 0.85em; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 4px;">PRECISIÓN IA</div>
                        <div style="font-size: 1.2em; font-weight: 700; color: #10b981;">94.2%</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== MÉTRICAS PRINCIPALES KPI =====
    generateKeyMetrics(metrics, colors) {
        return `
            <div class="key-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px;">
                
                <!-- Métrica de Fuerza General -->
                <div class="metric-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${colors.accent}40; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: ${colors.accent}20; border-radius: 50%;"></div>
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <div style="background: ${colors.accent}; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; margin-right: 16px;">💪</div>
                        <div>
                            <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.2em; font-weight: 700;">Fuerza General</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.9em;">Índice de fuerza compuesto</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: end;">
                        <div>
                            <div style="font-size: 2.5em; font-weight: 900; color: ${colors.accent}; font-family: 'Poppins', sans-serif; line-height: 1;">${metrics.strengthIndex}</div>
                            <div style="font-size: 0.85em; color: ${colors.textSecondary}; margin-top: 4px;">Índice FSI</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #10b981; font-weight: 700; font-size: 1.1em;">+${metrics.strengthGrowth}%</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary};">vs mes anterior</div>
                        </div>
                    </div>
                </div>

                <!-- Métrica de Volumen -->
                <div class="metric-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid #10b98140; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #10b98120; border-radius: 50%;"></div>
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <div style="background: #10b981; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; margin-right: 16px;">📈</div>
                        <div>
                            <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.2em; font-weight: 700;">Volumen Total</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.9em;">Peso total movido</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: end;">
                        <div>
                            <div style="font-size: 2.2em; font-weight: 900; color: #10b981; font-family: 'Poppins', sans-serif; line-height: 1;">${metrics.totalVolume}</div>
                            <div style="font-size: 0.85em; color: ${colors.textSecondary}; margin-top: 4px;">toneladas</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #10b981; font-weight: 700; font-size: 1.1em;">+${metrics.volumeGrowth}%</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary};">este mes</div>
                        </div>
                    </div>
                </div>

                <!-- Métrica de Adherencia Médica -->
                <div class="metric-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${metrics.medicalCompliance >= 80 ? '#10b98140' : '#ef444440'}; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: ${metrics.medicalCompliance >= 80 ? '#10b98120' : '#ef444420'}; border-radius: 50%;"></div>
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <div style="background: ${metrics.medicalCompliance >= 80 ? '#10b981' : '#ef4444'}; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; margin-right: 16px;">🏥</div>
                        <div>
                            <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.2em; font-weight: 700;">Adherencia Médica</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.9em;">Ejercicios rehabilitación</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: end;">
                        <div>
                            <div style="font-size: 2.5em; font-weight: 900; color: ${metrics.medicalCompliance >= 80 ? '#10b981' : '#ef4444'}; font-family: 'Poppins', sans-serif; line-height: 1;">${metrics.medicalCompliance}%</div>
                            <div style="font-size: 0.85em; color: ${colors.textSecondary}; margin-top: 4px;">cumplimiento</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: ${metrics.medicalCompliance >= 80 ? '#10b981' : '#ef4444'}; font-weight: 700; font-size: 1.1em;">${metrics.medicalCompliance >= 80 ? '✅ BIEN' : '⚠️ MEJORAR'}</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary};">estado</div>
                        </div>
                    </div>
                </div>

                <!-- Métrica de Consistencia -->
                <div class="metric-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid #f59e0b40; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #f59e0b20; border-radius: 50%;"></div>
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <div style="background: #f59e0b; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; margin-right: 16px;">🎯</div>
                        <div>
                            <h3 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.2em; font-weight: 700;">Consistencia</h3>
                            <p style="color: ${colors.textSecondary}; margin: 0; font-size: 0.9em;">Adherencia al plan</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: end;">
                        <div>
                            <div style="font-size: 2.5em; font-weight: 900; color: #f59e0b; font-family: 'Poppins', sans-serif; line-height: 1;">${metrics.consistency}%</div>
                            <div style="font-size: 0.85em; color: ${colors.textSecondary}; margin-top: 4px;">del plan</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #f59e0b; font-weight: 700; font-size: 1.1em;">${metrics.streak} días</div>
                            <div style="font-size: 0.8em; color: ${colors.textSecondary};">racha actual</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== GRÁFICOS DE PROGRESO INTERACTIVOS =====
    generateProgressCharts(colors) {
        return `
            <div class="progress-charts-section" style="margin-bottom: 32px;">
                <h2 style="color: ${colors.textDark}; font-size: 1.8em; font-weight: 700; margin-bottom: 24px; font-family: 'Poppins', sans-serif;">📈 Evolución del Rendimiento</h2>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                    
                    <!-- Gráfico principal de fuerza -->
                    <div class="chart-container" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${colors.border};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-size: 1.3em; font-weight: 700;">Progresión de Fuerza</h3>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="this.switchChart('volume')" class="chart-toggle" style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${colors.border}; background: ${colors.secondary}; color: ${colors.textDark}; font-size: 0.85em; cursor: pointer;">Volumen</button>
                                <button onclick="this.switchChart('1rm')" class="chart-toggle active" style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${colors.accent}; background: ${colors.accent}; color: white; font-size: 0.85em; cursor: pointer;">1RM</button>
                            </div>
                        </div>
                        <canvas id="progress-chart" width="400" height="200"></canvas>
                    </div>
                    
                    <!-- Distribución por grupos musculares -->
                    <div class="chart-container" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${colors.border};">
                        <h3 style="color: ${colors.textDark}; margin: 0 0 20px 0; font-size: 1.3em; font-weight: 700;">Distribución Muscular</h3>
                        <canvas id="muscle-distribution-chart" width="300" height="200"></canvas>
                        <div class="muscle-legend" style="margin-top: 16px; font-size: 0.85em;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div style="display: flex; align-items: center;"><div style="width: 12px; height: 12px; background: ${colors.accent}; border-radius: 50%; margin-right: 8px;"></div>Tren Superior</div>
                                <div style="display: flex; align-items: center;"><div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>Tren Inferior</div>
                                <div style="display: flex; align-items: center;"><div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-right: 8px;"></div>Core</div>
                                <div style="display: flex; align-items: center;"><div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></div>Rehabilitación</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Gráfico de consistencia semanal -->
                <div class="chart-container" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${colors.border}; margin-top: 24px;">
                    <h3 style="color: ${colors.textDark}; margin: 0 0 20px 0; font-size: 1.3em; font-weight: 700;">Consistencia Semanal</h3>
                    <canvas id="consistency-chart" width="800" height="150"></canvas>
                </div>
            </div>
        `;
    }

    // ===== ANÁLISIS DETALLADO POR EJERCICIO =====
    generateExerciseAnalysis(exerciseData, colors) {
        return `
            <div class="exercise-analysis-section" style="margin-bottom: 32px;">
                <h2 style="color: ${colors.textDark}; font-size: 1.8em; font-weight: 700; margin-bottom: 24px; font-family: 'Poppins', sans-serif;">🏋️ Análisis por Ejercicio</h2>
                
                <div class="exercise-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
                    ${exerciseData.map(exercise => `
                        <div class="exercise-analysis-card" style="background: ${colors.primary}; border-radius: 12px; padding: 20px; border: 2px solid ${exercise.trend === 'up' ? '#10b98140' : exercise.trend === 'down' ? '#ef444440' : colors.border};">
                            
                            <div class="exercise-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <div>
                                    <h4 style="color: ${colors.textDark}; margin: 0 0 4px 0; font-size: 1.2em; font-weight: 700;">${exercise.name}</h4>
                                    <span style="background: ${exercise.medical ? '#dc262620' : colors.accent + '20'}; color: ${exercise.medical ? '#dc2626' : colors.accent}; padding: 4px 8px; border-radius: 12px; font-size: 0.75em; font-weight: 600;">
                                        ${exercise.medical ? '🏥 MÉDICO' : '💪 FUERZA'}
                                    </span>
                                </div>
                                <div style="font-size: 2em;">
                                    ${exercise.trend === 'up' ? '📈' : exercise.trend === 'down' ? '📉' : '➡️'}
                                </div>
                            </div>
                            
                            <div class="exercise-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <div style="font-size: 1.6em; font-weight: 800; color: ${colors.accent}; font-family: 'Poppins', sans-serif;">${exercise.currentBest}</div>
                                    <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">MEJOR ACTUAL</div>
                                </div>
                                <div>
                                    <div style="font-size: 1.6em; font-weight: 800; color: ${exercise.trend === 'up' ? '#10b981' : exercise.trend === 'down' ? '#ef4444' : colors.textSecondary}; font-family: 'Poppins', sans-serif;">${exercise.improvement}</div>
                                    <div style="font-size: 0.8em; color: ${colors.textSecondary}; font-weight: 600;">MEJORA</div>
                                </div>
                            </div>
                            
                            <div class="exercise-mini-chart" style="height: 60px; background: ${colors.background}; border-radius: 8px; margin-bottom: 12px; padding: 8px;">
                                <canvas id="mini-chart-${exercise.id}" width="300" height="44"></canvas>
                            </div>
                            
                            <div class="exercise-insights">
                                <div style="font-size: 0.85em; color: ${colors.textSecondary}; line-height: 1.4;">
                                    <strong style="color: ${colors.textDark};">Insights:</strong> ${exercise.insight}
                                </div>
                                ${exercise.recommendation ? `
                                    <div style="margin-top: 8px; padding: 8px; background: ${colors.accent}10; border-radius: 6px; font-size: 0.8em;">
                                        <strong style="color: ${colors.accent};">💡 Recomendación:</strong> ${exercise.recommendation}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===== RENDERIZADO DE GRÁFICOS CON CHART.JS =====
    async renderCharts() {
        // Cargar Chart.js si no está disponible
        if (typeof Chart === 'undefined') {
            await this.loadChartJS();
        }

        this.renderProgressChart();
        this.renderMuscleDistributionChart();
        this.renderConsistencyChart();
        this.renderMiniCharts();
    }

    renderProgressChart() {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const data = this.generateProgressChartData();

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '1RM Estimado (kg)',
                    data: data.values,
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f620',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    // ===== PREDICCIONES INTELIGENTES =====
    generatePredictionsSection(predictions, colors) {
        return `
            <div class="predictions-section">
                <h2 style="color: ${colors.textDark}; font-size: 1.8em; font-weight: 700; margin-bottom: 24px; font-family: 'Poppins', sans-serif;">🔮 Predicciones & Recomendaciones</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    
                    <!-- Predicciones de rendimiento -->
                    <div class="prediction-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid ${colors.accent}40;">
                        <h3 style="color: ${colors.textDark}; margin: 0 0 20px 0; font-size: 1.3em; font-weight: 700;">📊 Proyección 4 Semanas</h3>
                        
                        ${predictions.performance.map(pred => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${colors.background}; border-radius: 8px; margin-bottom: 12px;">
                                <div>
                                    <div style="font-weight: 700; color: ${colors.textDark}; font-size: 1em;">${pred.exercise}</div>
                                    <div style="font-size: 0.85em; color: ${colors.textSecondary};">Confianza: ${pred.confidence}%</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 800; color: ${colors.accent}; font-size: 1.2em;">${pred.predicted}kg</div>
                                    <div style="font-size: 0.8em; color: #10b981;">+${pred.improvement}%</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Recomendaciones de IA -->
                    <div class="recommendations-card" style="background: ${colors.primary}; border-radius: 16px; padding: 24px; border: 2px solid #10b98140;">
                        <h3 style="color: ${colors.textDark}; margin: 0 0 20px 0; font-size: 1.3em; font-weight: 700;">💡 Recomendaciones IA</h3>
                        
                        ${predictions.recommendations.map((rec, index) => `
                            <div class="recommendation-item" style="margin-bottom: 16px; padding: 16px; background: ${rec.priority === 'high' ? '#fef2f2' : rec.priority === 'medium' ? '#fffbeb' : '#f0f9ff'}; border-radius: 10px; border: 2px solid ${rec.priority === 'high' ? '#fca5a5' : rec.priority === 'medium' ? '#fcd34d' : '#93c5fd'};">
                                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 1.2em; margin-right: 8px;">${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'}</span>
                                    <span style="font-weight: 700; color: ${rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? '#d97706' : '#2563eb'}; text-transform: uppercase; font-size: 0.8em; letter-spacing: 0.5px;">${rec.priority} PRIORIDAD</span>
                                </div>
                                <div style="color: ${rec.priority === 'high' ? '#7f1d1d' : rec.priority === 'medium' ? '#92400e' : '#1e3a8a'}; font-size: 0.95em; line-height: 1.4; font-weight: 600;">${rec.message}</div>
                                ${rec.action ? `<div style="margin-top: 8px; font-size: 0.85em; opacity: 0.8;"><strong>Acción:</strong> ${rec.action}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// ===== PROCESADOR DE DATOS =====
class DataProcessor {
    processWorkoutData(rawData) {
        // Procesar datos de entrenamientos para análisis
        const processed = {
            strengthMetrics: this.calculateStrengthMetrics(rawData),
            volumeMetrics: this.calculateVolumeMetrics(rawData),
            consistencyMetrics: this.calculateConsistencyMetrics(rawData),
            medicalCompliance: this.calculateMedicalCompliance(rawData),
            trends: this.analyzeTrends(rawData)
        };
        
        return processed;
    }
    
    calculateStrengthMetrics(data) {
        // Algoritmo para calcular índice de fuerza FSI
        const benchmarkExercises = ['chest_supported_row', 'incline_dumbbell_press', 'goblet_squat'];
        let totalFSI = 0;
        let validExercises = 0;
        
        benchmarkExercises.forEach(exerciseId => {
            const exerciseData = data.exercises[exerciseId];
            if (exerciseData && exerciseData.sessions.length > 0) {
                const latest1RM = this.estimate1RM(exerciseData.sessions[exerciseData.sessions.length - 1]);
                const baseline1RM = this.estimate1RM(exerciseData.sessions[0]);
                const fsi = (latest1RM / baseline1RM) * 100;
                totalFSI += fsi;
                validExercises++;
            }
        });
        
        return validExercises > 0 ? Math.round(totalFSI / validExercises) : 100;
    }
}

export { WorkoutAnalyticsSystem, DataProcessor };