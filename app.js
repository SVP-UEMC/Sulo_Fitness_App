// ===============================================
// SULO FITNESS v3.0 - APLICACIÓN COMPLETA
// CON MÓDULO DE NUTRICIÓN INTEGRADO
// ===============================================

// ===== GESTIÓN DE ALMACENAMIENTO =====
class StorageManager {
    constructor() {
        this.storageKey = 'sulo-fitness-v3';
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

// ===== SISTEMA DE NOTIFICACIONES =====
class NotificationManager {
    constructor() {
        this.container = null;
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
            cursor: pointer;
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.2em;">${this.getIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        this.container.appendChild(notification);

        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // Click para cerrar
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.remove();
            }
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
}

// ===== MÓDULO DE NUTRICIÓN INTEGRADO =====
class NutritionModule {
    constructor(app) {
        this.app = app;
        
        // Base de datos nutricional completa
        this.nutritionDB = {
            // Proteínas
            'Pechugas de pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
            'Muslos deshuesados de pollo': { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0 },
            'Pavo cocido en lonchas': { calories: 135, protein: 30, carbs: 0, fat: 1.5, fiber: 0 },
            'Jamón serrano': { calories: 375, protein: 43, carbs: 0, fat: 22, fiber: 0 },
            'Tofu': { calories: 144, protein: 15, carbs: 3, fat: 9, fiber: 2 },
            'Atún en lata': { calories: 116, protein: 25, carbs: 0, fat: 0.8, fiber: 0 },
            'Sardinillas': { calories: 185, protein: 25, carbs: 0, fat: 8.5, fiber: 0 },
            'Huevos': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
            
            // Verduras
            'Pimientos': { calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5 },
            'Tomates cherry': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
            'Tomates': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
            'Calabacín': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
            'Berenjena': { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },
            'Brócoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
            'Espinacas': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
            
            // Frutas
            'Manzanas': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
            'Mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
            'Plátanos': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
            'Arándanos congelados': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
            'Limones': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8 },
            
            // Cereales y legumbres
            'Garbanzos': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 8 },
            'Lentejas': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
            'Alubias blancas': { calories: 127, protein: 9.7, carbs: 23, fat: 0.5, fiber: 6.3 },
            'Pan tostado integral': { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 6 },
            'Patatas': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
            'Pasta de lentejas': { calories: 348, protein: 25, carbs: 48, fat: 2.5, fiber: 11 },
            
            // Lácteos
            'Leche': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 },
            'Yogur': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
            
            // Otros
            'Aceite de oliva': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
            'Crema de cacahuete': { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 8 },
            'Tahini': { calories: 595, protein: 17, carbs: 21, fat: 53, fiber: 9 }
        };

        // Categorías de ingredientes
        this.ingredientCategories = {
            proteinas: ['Pechugas de pollo', 'Huevos', 'Atún en lata', 'Pavo cocido en lonchas', 'Tofu'],
            verduras: ['Brócoli', 'Espinacas', 'Tomates', 'Pimientos', 'Calabacín', 'Berenjena'],
            frutas: ['Plátanos', 'Manzanas', 'Limones', 'Mango', 'Arándanos congelados'],
            cerealeslegumbres: ['Garbanzos', 'Lentejas', 'Pan tostado integral', 'Patatas', 'Pasta de lentejas'],
            lacteos: ['Yogur', 'Leche'],
            otros: ['Aceite de oliva', 'Crema de cacahuete']
        };

        // Porciones típicas
        this.typicalPortions = {
            'Pechugas de pollo': 150,
            'Huevos': 120, // 2 huevos medianos
            'Atún en lata': 100,
            'Brócoli': 200,
            'Espinacas': 150,
            'Plátanos': 120, // 1 plátano mediano
            'Manzanas': 150,
            'Garbanzos': 150,
            'Pan tostado integral': 50,
            'Yogur': 125,
            'Aceite de oliva': 10
        };
    }

    // ===== GENERAR PLAN NUTRICIONAL =====
    async generateMealPlan() {
        const targets = { calories: 2200, protein: 148, carbs: 220, fat: 73 };
        const meals = [];
        let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        // DESAYUNO (7:30)
        const breakfast = await this.generateMeal('desayuno', ['proteinas', 'frutas', 'cerealeslegumbres']);
        meals.push(breakfast);
        this.updateTotals(dailyTotals, breakfast.totals);

        // ALMUERZO (En cafetería)
        const snack = {
            name: 'ALMUERZO',
            time: 'En cafetería',
            items: [
                { food: 'Café con leche', portion: '1 taza', calories: 50, protein: 3, carbs: 6, fat: 2, fiber: 0, preparation: 'En cafetería del trabajo' },
                { food: 'Mini bocadillo tortilla francesa', portion: '1 unidad', calories: 180, protein: 8, carbs: 20, fat: 8, fiber: 1, preparation: 'Con tomate' }
            ],
            totals: { calories: 230, protein: 11, carbs: 26, fat: 10, fiber: 1 }
        };
        meals.push(snack);
        this.updateTotals(dailyTotals, snack.totals);

        // COMIDA (17:00)
        const lunch = await this.generateMeal('comida', ['proteinas', 'verduras', 'cerealeslegumbres']);
        meals.push(lunch);
        this.updateTotals(dailyTotals, lunch.totals);

        // CENA (21:00)
        const dinner = await this.generateMeal('cena', ['proteinas', 'verduras'], true);
        meals.push(dinner);
        this.updateTotals(dailyTotals, dinner.totals);

        return {
            meals: meals,
            dailyTotals: dailyTotals,
            targets: targets,
            analysis: this.analyzeMealPlan(dailyTotals, targets)
        };
    }

    async generateMeal(mealType, categories, isLightMeal = false) {
        const mealConfigs = {
            desayuno: { calorieTarget: 550, name: 'DESAYUNO', time: '7:30' },
            comida: { calorieTarget: 700, name: 'COMIDA', time: '17:00' },
            cena: { calorieTarget: isLightMeal ? 500 : 600, name: 'CENA', time: '21:00' }
        };

        const config = mealConfigs[mealType];
        const items = [];
        let mealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        // Seleccionar ingredientes de cada categoría
        for (const category of categories) {
            const availableIngredients = this.ingredientCategories[category];
            if (availableIngredients && availableIngredients.length > 0) {
                const selectedIngredient = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
                const nutritionPer100g = this.nutritionDB[selectedIngredient];
                const portionSize = this.typicalPortions[selectedIngredient] || 100;

                const item = {
                    food: selectedIngredient,
                    portion: `${portionSize}g`,
                    calories: Math.round((nutritionPer100g.calories * portionSize) / 100),
                    protein: Math.round((nutritionPer100g.protein * portionSize) / 100 * 10) / 10,
                    carbs: Math.round((nutritionPer100g.carbs * portionSize) / 100 * 10) / 10,
                    fat: Math.round((nutritionPer100g.fat * portionSize) / 100 * 10) / 10,
                    fiber: Math.round((nutritionPer100g.fiber * portionSize) / 100 * 10) / 10,
                    preparation: this.getRandomPreparation(selectedIngredient, category)
                };

                items.push(item);
                this.updateTotals(mealTotals, item);
            }
        }

        // Añadir aceite de oliva
        if (mealType !== 'desayuno') {
            const oilPortion = isLightMeal ? 5 : 10;
            const oilData = this.nutritionDB['Aceite de oliva'];
            const oil = {
                food: 'Aceite de oliva',
                portion: `${oilPortion}g`,
                calories: Math.round((oilData.calories * oilPortion) / 100),
                protein: 0,
                carbs: 0,
                fat: Math.round((oilData.fat * oilPortion) / 100 * 10) / 10,
                fiber: 0,
                preparation: 'Para cocinar/aliñar'
            };
            items.push(oil);
            this.updateTotals(mealTotals, oil);
        }

        return {
            name: config.name,
            time: config.time,
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

    updateTotals(totals, meal) {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.carbs += meal.carbs || 0;
        totals.fat += meal.fat || 0;
        totals.fiber += meal.fiber || 0;
    }

    getRandomPreparation(ingredient, category) {
        const preparations = {
            proteinas: ['A la plancha con especias', 'Al vapor con limón', 'Salteado con ajo', 'Hervido y aliñado', 'A la airfryer'],
            verduras: ['Salteadas con ajo', 'Al vapor', 'A la plancha', 'En ensalada', 'Hervidas y aliñadas'],
            frutas: ['Al natural', 'En macedonia', 'Como postre', 'En smoothie'],
            cerealeslegumbres: ['Hervidos con especias', 'Tostados', 'En ensalada', 'Guisados'],
            lacteos: ['Al natural', 'Con frutas', 'En batido']
        };

        const categoryPreps = preparations[category] || ['Preparado al gusto'];
        return categoryPreps[Math.floor(Math.random() * categoryPreps.length)];
    }

    analyzeMealPlan(daily, targets) {
        return {
            calorieBalance: daily.calories - targets.calories,
            proteinPercentage: Math.round((daily.protein / targets.protein) * 100),
            carbsPercentage: Math.round((daily.carbs / targets.carbs) * 100),
            fatPercentage: Math.round((daily.fat / targets.fat) * 100),
            fiberAdequacy: daily.fiber >= 25 ? 'Adecuada' : 'Baja'
        };
    }

    showNutritionView() {
        const colors = this.app.getColors();
        
        return `
            <div class="nutrition-view" style="animation: fadeIn 0.6s ease-out;">
                
                <!-- Header -->
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('inicio')" style="
                        background: ${colors.secondary}; 
                        color: ${colors.textDark}; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        font-weight: 700;
                    ">← Volver</button>
                </div>
                
                <h2 style="
                    color: ${colors.textDark}; 
                    text-align: center; 
                    margin-bottom: 40px; 
                    font-size: 2.5em; 
                    font-weight: 800;
                ">🥗 MÓDULO DE NUTRICIÓN</h2>
                
                <!-- Tarjetas principales -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-bottom: 40px;">
                    
                    <!-- Plan del día -->
                    <div style="
                        background: ${colors.primary}; 
                        padding: 32px; 
                        border-radius: 16px; 
                        border: 2px solid ${colors.border};
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    ">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-weight: 700;">📅 Plan Nutricional Hoy</h3>
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Comidas</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">4 PLANIFICADAS</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${colors.border};">
                                <strong style="color: ${colors.textDark};">Calorías</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">~2,200 KCAL</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                                <strong style="color: ${colors.textDark};">Proteína</strong>
                                <span style="color: ${colors.textSecondary}; font-weight: 600;">~148G</span>
                            </div>
                        </div>
                        <button onclick="app.showDetailedMealPlan()" style="
                            width: 100%; 
                            background: ${colors.accent}; 
                            color: white; 
                            border: none; 
                            padding: 16px; 
                            border-radius: 10px; 
                            cursor: pointer; 
                            font-weight: 700; 
                            font-size: 1em;
                        ">VER PLAN COMPLETO</button>
                    </div>
                    
                    <!-- Ingredientes disponibles -->
                    <div style="
                        background: ${colors.primary}; 
                        padding: 32px; 
                        border-radius: 16px; 
                        border: 2px solid ${colors.border};
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    ">
                        <h3 style="color: ${colors.textDark}; margin-bottom: 20px; font-size: 1.6em; font-weight: 700;">🥘 Tu Despensa</h3>
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 2.5em; font-weight: 800; color: ${colors.accent};">${Object.keys(this.nutritionDB).length}</div>
                            <div style="color: ${colors.textSecondary}; font-weight: 600;">INGREDIENTES</div>
                        </div>
                        <div style="display: grid; gap: 8px; font-size: 0.9em;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Proteínas:</span> <strong>${this.ingredientCategories.proteinas.length}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Verduras:</span> <strong>${this.ingredientCategories.verduras.length}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Frutas:</span> <strong>${this.ingredientCategories.frutas.length}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Cereales/Legumbres:</span> <strong>${this.ingredientCategories.cerealeslegumbres.length}</strong>
                            </div>
                        </div>
                        <button onclick="app.showIngredientsList()" style="
                            width: 100%; 
                            background: ${colors.secondary}; 
                            color: ${colors.textDark}; 
                            border: none; 
                            padding: 16px; 
                            border-radius: 10px; 
                            cursor: pointer; 
                            font-weight: 700; 
                            margin-top: 20px;
                        ">VER INGREDIENTES</button>
                    </div>
                    
                </div>
                
                <!-- Información adicional -->
                <div style="
                    background: ${colors.accent}20; 
                    padding: 24px; 
                    border-radius: 12px; 
                    border: 2px solid ${colors.accent}40; 
                    text-align: center;
                ">
                    <h3 style="color: ${colors.accent}; margin-bottom: 16px; font-weight: 700;">✨ Características del Módulo</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; color: ${colors.textDark};">
                        <div>• Planificación automática de comidas</div>
                        <div>• Cálculo nutricional preciso</div>
                        <div>• Ingredientes personalizados</div>
                        <div>• Adaptado a tu horario</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ===== APLICACIÓN PRINCIPAL CON NUTRICIÓN =====
class SuloFitnessApp {
    constructor() {
        this.storage = new StorageManager();
        this.notifications = new NotificationManager();
        this.nutrition = new NutritionModule(this);
        
        this.currentView = 'inicio';
        this.currentTheme = 'light';
        
        // Temas
        this.themes = {
            light: {
                primary: '#f8fafc',
                secondary: '#e2e8f0',
                accent: '#3b82f6',
                background: '#ffffff',
                textDark: '#0f172a',
                textSecondary: '#64748b',
                border: '#e2e8f0'
            },
            dark: {
                primary: '#1e293b',
                secondary: '#475569',
                accent: '#3b82f6',
                background: '#0f172a',
                textDark: '#f8fafc',
                textSecondary: '#94a3b8',
                border: '#475569'
            }
        };
        
        // Usuario con historial médico
        this.user = {
            profile: {
                name: 'Usuario',
                age: 45,
                weight: 74,
                height: 184
            },
            medicalProfile: {
                conditions: {
                    lumbar_fusion_L3L4: { active: true, severity: 'moderate' },
                    acl_reconstruction_right: { active: true, severity: 'mild' }
                }
            }
        };
    }

    async initialize() {
        console.log('🚀 Iniciando Sulo Fitness v3.0...');
        
        this.applyTheme();
        this.showMainInterface();
        this.navigate('inicio');
        
        console.log('✅ Sulo Fitness v3.0 inicializado');
        this.notifications.show('¡Bienvenido a Sulo Fitness v3.0! 💪', 'success');
    }

    getColors() {
        return this.themes[this.currentTheme];
    }

    applyTheme() {
        const colors = this.getColors();
        document.body.style.backgroundColor = colors.background;
        document.body.style.color = colors.textDark;
        document.body.style.fontFamily = 'Inter, -apple-system, sans-serif';
    }

    showMainInterface() {
        const colors = this.getColors();
        
        document.getElementById('app').innerHTML = `
            <!-- Header -->
            <header style="
                background: linear-gradient(135deg, ${colors.accent} 0%, #1e40af 100%);
                color: white;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
                position: sticky;
                top: 0;
                z-index: 1000;
            ">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 1.8em;">💪</div>
                        <div>
                            <h1 style="margin: 0; font-size: 1.6em; font-weight: 800;">Sulo Fitness v3.0</h1>
                            <div style="font-size: 0.8em; opacity: 0.9;">Entrenamiento y Nutrición Inteligente</div>
                        </div>
                    </div>
                    <button onclick="app.toggleTheme()" style="
                        background: rgba(255,255,255,0.2); 
                        border: none; 
                        color: white; 
                        padding: 8px 12px; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-size: 1.1em;
                    ">${this.currentTheme === 'light' ? '🌙' : '☀️'}</button>
                </div>
            </header>
            
            <!-- Contenido principal -->
            <main id="main-content" style="
                max-width: 1200px;
                margin: 0 auto;
                padding: 24px 20px;
                min-height: calc(100vh - 200px);
            ">
                <!-- Contenido dinámico -->
            </main>
            
            <!-- Navegación inferior -->
            <nav style="
                background: white;
                border-top: 2px solid ${colors.border};
                padding: 16px 20px;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
                position: sticky;
                bottom: 0;
            ">
                <div style="display: flex; justify-content: space-around; max-width: 600px; margin: 0 auto;">
                    
                    <button onclick="app.navigate('inicio')" style="
                        background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px;
                        padding: 8px 16px; border-radius: 12px; cursor: pointer; color: ${this.currentView === 'inicio' ? colors.accent : colors.textSecondary};
                    ">
                        <span style="font-size: 1.5em;">🏠</span>
                        <span style="font-size: 0.8em; font-weight: 600;">Inicio</span>
                    </button>
                    
                    <button onclick="app.navigate('entrenamiento')" style="
                        background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px;
                        padding: 8px 16px; border-radius: 12px; cursor: pointer; color: ${this.currentView === 'entrenamiento' ? colors.accent : colors.textSecondary};
                    ">
                        <span style="font-size: 1.5em;">🏋️</span>
                        <span style="font-size: 0.8em; font-weight: 600;">Entrenar</span>
                    </button>
                    
                    <button onclick="app.navigate('nutricion')" style="
                        background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px;
                        padding: 8px 16px; border-radius: 12px; cursor: pointer; color: ${this.currentView === 'nutricion' ? colors.accent : colors.textSecondary};
                    ">
                        <span style="font-size: 1.5em;">🥗</span>
                        <span style="font-size: 0.8em; font-weight: 600;">Nutrición</span>
                    </button>
                    
                    <button onclick="app.navigate('analytics')" style="
                        background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px;
                        padding: 8px 16px; border-radius: 12px; cursor: pointer; color: ${this.currentView === 'analytics' ? colors.accent : colors.textSecondary};
                    ">
                        <span style="font-size: 1.5em;">📊</span>
                        <span style="font-size: 0.8em; font-weight: 600;">Analytics</span>
                    </button>
                </div>
            </nav>
        `;
    }

    navigate(view) {
        this.currentView = view;
        const container = document.getElementById('main-content');
        const colors = this.getColors();
        
        switch (view) {
            case 'inicio':
                container.innerHTML = this.showHomeView();
                break;
            case 'entrenamiento':
                container.innerHTML = this.showWorkoutView();
                break;
            case 'nutricion':
                container.innerHTML = this.nutrition.showNutritionView();
                break;
            case 'analytics':
                container.innerHTML = this.showAnalyticsView();
                break;
            default:
                container.innerHTML = this.showHomeView();
        }
        
        // Actualizar navegación
        this.showMainInterface();
    }

    showHomeView() {
        const colors = this.getColors();
        
        return `
            <div style="text-align: center; animation: fadeIn 0.6s ease-out;">
                <h1 style="color: ${colors.textDark}; font-size: 2.5em; margin-bottom: 24px; font-weight: 800;">
                    ¡Bienvenido a Sulo Fitness v3.0! 💪
                </h1>
                
                <p style="color: ${colors.textSecondary}; font-size: 1.2em; margin-bottom: 40px;">
                    Tu entrenador personal digital con <strong>módulo de nutrición integrado</strong>
                </p>
                
                <!-- Tarjetas principales -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 40px 0;">
                    
                    <!-- Entrenamiento -->
                    <div onclick="app.navigate('entrenamiento')" style="
                        background: ${colors.primary}; 
                        padding: 32px; 
                        border-radius: 16px; 
                        border: 2px solid ${colors.accent}40; 
                        cursor: pointer; 
                        transition: transform 0.3s ease;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="font-size: 3em; margin-bottom: 16px;">🏋️</div>
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-weight: 700; font-size: 1.4em;">Entrenamiento</h3>
                        <p style="color: ${colors.textSecondary};">Rutinas adaptadas a tu fusión lumbar L3-L4 y LCA</p>
                    </div>
                    
                    <!-- Nutrición -->
                    <div onclick="app.navigate('nutricion')" style="
                        background: ${colors.primary}; 
                        padding: 32px; 
                        border-radius: 16px; 
                        border: 2px solid #10b98140; 
                        cursor: pointer; 
                        transition: transform 0.3s ease;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="font-size: 3em; margin-bottom: 16px;">🥗</div>
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-weight: 700; font-size: 1.4em;">Nutrición</h3>
                        <p style="color: ${colors.textSecondary};">Plans alimenticios personalizados con tus ingredientes</p>
                    </div>
                    
                    <!-- Analytics -->
                    <div onclick="app.navigate('analytics')" style="
                        background: ${colors.primary}; 
                        padding: 32px; 
                        border-radius: 16px; 
                        border: 2px solid #f59e0b40; 
                        cursor: pointer; 
                        transition: transform 0.3s ease;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="font-size: 3em; margin-bottom: 16px;">📊</div>
                        <h3 style="color: ${colors.textDark}; margin-bottom: 12px; font-weight: 700; font-size: 1.4em;">Analytics</h3>
                        <p style="color: ${colors.textSecondary};">Progreso y estadísticas inteligentes</p>
                    </div>
                    
                </div>
                
                <!-- Información médica -->
                <div style="
                    background: #fef2f2; 
                    border: 2px solid #fca5a5; 
                    border-radius: 12px; 
                    padding: 20px; 
                    margin: 32px 0;
                ">
                    <h3 style="color: #dc2626; margin-bottom: 12px; font-weight: 700;">🏥 Adaptado a tu historial médico</h3>
                    <p style="color: #7f1d1d; margin: 0;">
                        ✅ Fusión lumbar L3-L4 protegida | ✅ LCA reconstruido considerado | ✅ Nutrición personalizada
                    </p>
                </div>
            </div>
        `;
    }

    showWorkoutView() {
        const colors = this.getColors();
        
        return `
            <div style="animation: fadeIn 0.6s ease-out;">
                <h2 style="color: ${colors.textDark}; text-align: center; margin-bottom: 32px; font-size: 2.2em; font-weight: 800;">
                    🏋️ MÓDULO DE ENTRENAMIENTO
                </h2>
                
                <div style="text-align: center; padding: 60px; background: ${colors.primary}; border-radius: 16px; border: 2px solid ${colors.border};">
                    <div style="font-size: 4em; margin-bottom: 20px;">⚙️</div>
                    <h3 style="color: ${colors.textDark}; font-size: 1.8em; margin-bottom: 16px;">En Desarrollo</h3>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin-bottom: 24px;">
                        El módulo de entrenamiento se está desarrollando con todas las funcionalidades avanzadas
                    </p>
                    <p style="color: ${colors.textSecondary}; font-size: 0.9em;">
                        Incluirá: Rutinas personalizadas, Progresión automática, Ejercicios específicos para tu historial médico
                    </p>
                </div>
            </div>
        `;
    }

    showAnalyticsView() {
        const colors = this.getColors();
        
        return `
            <div style="animation: fadeIn 0.6s ease-out;">
                <h2 style="color: ${colors.textDark}; text-align: center; margin-bottom: 32px; font-size: 2.2em; font-weight: 800;">
                    📊 ANALYTICS Y PROGRESO
                </h2>
                
                <div style="text-align: center; padding: 60px; background: ${colors.primary}; border-radius: 16px; border: 2px solid ${colors.border};">
                    <div style="font-size: 4em; margin-bottom: 20px;">📈</div>
                    <h3 style="color: ${colors.textDark}; font-size: 1.8em; margin-bottom: 16px;">Próximamente</h3>
                    <p style="color: ${colors.textSecondary}; font-size: 1.1em; margin-bottom: 24px;">
                        Sistema completo de análisis con gráficos interactivos y predicciones IA
                    </p>
                    <p style="color: ${colors.textSecondary}; font-size: 0.9em;">
                        Incluirá: Progreso de fuerza, Análisis nutricional, Métricas de adherencia médica
                    </p>
                </div>
            </div>
        `;
    }

    async showDetailedMealPlan() {
        const container = document.getElementById('main-content');
        const colors = this.getColors();
        
        // Mostrar loading
        container.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <div style="font-size: 3em; margin-bottom: 20px;">⏳</div>
                <h3 style="color: ${colors.textDark};">Generando plan nutricional...</h3>
                <p style="color: ${colors.textSecondary};">Creando comidas personalizadas</p>
            </div>
        `;
        
        // Generar plan
        const mealPlan = await this.nutrition.generateMealPlan();
        
        // Mostrar plan completo
        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('nutricion')" style="
                        background: ${colors.secondary}; 
                        color: ${colors.textDark}; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        font-weight: 700;
                    ">← Volver a Nutrición</button>
                </div>
                
                <h2 style="color: ${colors.textDark}; text-align: center; margin-bottom: 32px; font-size: 2.2em; font-weight: 800;">
                    📋 Plan Nutricional Completo
                </h2>
                
                <!-- Resumen nutricional -->
                <div style="
                    background: ${colors.primary}; 
                    padding: 24px; 
                    border-radius: 16px; 
                    margin-bottom: 32px; 
                    border: 2px solid ${colors.border};
                ">
                    <h3 style="color: ${colors.textDark}; margin-bottom: 20px; text-align: center; font-weight: 700;">📊 Resumen Nutricional</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; text-align: center;">
                        <div>
                            <div style="font-size: 1.8em; font-weight: 800; color: ${colors.accent};">${mealPlan.dailyTotals.calories}</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; font-weight: 600;">KCAL</div>
                        </div>
                        <div>
                            <div style="font-size: 1.8em; font-weight: 800; color: #10b981;">${mealPlan.dailyTotals.protein}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; font-weight: 600;">PROTEÍNA</div>
                        </div>
                        <div>
                            <div style="font-size: 1.8em; font-weight: 800; color: #f59e0b;">${mealPlan.dailyTotals.carbs}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; font-weight: 600;">CARBOS</div>
                        </div>
                        <div>
                            <div style="font-size: 1.8em; font-weight: 800; color: #8b5cf6;">${mealPlan.dailyTotals.fat}g</div>
                            <div style="font-size: 0.9em; color: ${colors.textSecondary}; font-weight: 600;">GRASAS</div>
                        </div>
                    </div>
                </div>
                
                <!-- Comidas detalladas -->
                ${mealPlan.meals.map(meal => `
                    <div style="
                        background: ${colors.primary}; 
                        padding: 24px; 
                        border-radius: 16px; 
                        margin-bottom: 24px; 
                        border: 2px solid ${colors.border};
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: ${colors.textDark}; margin: 0; font-size: 1.6em; font-weight: 700;">${meal.name}</h3>
                            <span style="color: ${colors.textSecondary}; font-weight: 700;">${meal.time}</span>
                        </div>
                        
                        ${meal.items.map(item => `
                            <div style="
                                background: ${colors.background}; 
                                padding: 16px; 
                                border-radius: 12px; 
                                margin-bottom: 16px;
                                border: 1px solid ${colors.border};
                            ">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <strong style="color: ${colors.textDark}; font-size: 1.1em;">${item.food}</strong>
                                    <span style="color: ${colors.textSecondary};">${item.portion}</span>
                                </div>
                                <div style="font-size: 0.85em; color: ${colors.textSecondary}; margin-bottom: 8px;">
                                    ${item.preparation}
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 12px; font-size: 0.85em;">
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${item.calories}</div>
                                        <div style="color: ${colors.textSecondary};">KCAL</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${item.protein}g</div>
                                        <div style="color: ${colors.textSecondary};">PROT</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${item.carbs}g</div>
                                        <div style="color: ${colors.textSecondary};">CARB</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-weight: 700; color: ${colors.textDark};">${item.fat}g</div>
                                        <div style="color: ${colors.textSecondary};">GRASA</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        
                        <!-- Totales de la comida -->
                        <div style="
                            background: ${colors.accent}10; 
                            padding: 12px; 
                            border-radius: 8px; 
                            border: 1px solid ${colors.accent}40;
                            margin-top: 16px;
                        ">
                            <strong style="color: ${colors.accent};">TOTALES COMIDA:</strong>
                            ${meal.totals.calories} kcal | ${meal.totals.protein}g prot | ${meal.totals.carbs}g carbs | ${meal.totals.fat}g grasas
                        </div>
                    </div>
                `).join('')}
                
                <!-- Botones de acción -->
                <div style="text-align: center; margin-top: 32px;">
                    <button onclick="app.saveMealPlan()" style="
                        background: #10b981; 
                        color: white; 
                        border: none; 
                        padding: 16px 32px; 
                        border-radius: 12px; 
                        cursor: pointer; 
                        font-weight: 700; 
                        margin: 8px;
                        font-size: 1em;
                    ">💾 GUARDAR PLAN</button>
                    
                    <button onclick="app.showDetailedMealPlan()" style="
                        background: ${colors.secondary}; 
                        color: ${colors.textDark}; 
                        border: none; 
                        padding: 16px 32px; 
                        border-radius: 12px; 
                        cursor: pointer; 
                        font-weight: 700; 
                        margin: 8px;
                        font-size: 1em;
                    ">🔄 REGENERAR</button>
                </div>
            </div>
        `;
    }

    saveMealPlan() {
        this.notifications.show('Plan nutricional guardado correctamente! 💾', 'success');
    }

    showIngredientsList() {
        const container = document.getElementById('main-content');
        const colors = this.getColors();
        
        container.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <div style="margin-bottom: 24px;">
                    <button onclick="app.navigate('nutricion')" style="
                        background: ${colors.secondary}; 
                        color: ${colors.textDark}; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        font-weight: 700;
                    ">← Volver a Nutrición</button>
                </div>
                
                <h2 style="color: ${colors.textDark}; text-align: center; margin-bottom: 32px; font-size: 2.2em; font-weight: 800;">
                    🥘 Tu Lista de Ingredientes
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
                    ${Object.entries(this.nutrition.ingredientCategories).map(([category, ingredients]) => `
                        <div style="
                            background: ${colors.primary}; 
                            padding: 24px; 
                            border-radius: 16px; 
                            border: 2px solid ${colors.border};
                        ">
                            <h3 style="color: ${colors.textDark}; margin-bottom: 16px; font-weight: 700; text-transform: capitalize;">
                                ${category === 'cerealeslegumbres' ? 'Cereales/Legumbres' : category}
                            </h3>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                ${ingredients.map(ingredient => `
                                    <li style="
                                        padding: 8px 12px; 
                                        margin: 4px 0; 
                                        background: ${colors.background}; 
                                        border-radius: 8px; 
                                        font-size: 0.9em;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    ">
                                        <span>${ingredient}</span>
                                        <small style="color: ${colors.textSecondary};">
                                            ${this.nutrition.nutritionDB[ingredient]?.calories || 0} kcal/100g
                                        </small>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                
                <div style="
                    text-align: center; 
                    margin-top: 32px; 
                    padding: 24px; 
                    background: ${colors.accent}10; 
                    border-radius: 12px; 
                    border: 2px solid ${colors.accent}40;
                ">
                    <h3 style="color: ${colors.accent}; margin-bottom: 12px;">✨ Base de datos nutricional completa</h3>
                    <p style="color: ${colors.textDark}; margin: 0;">
                        <strong>${Object.keys(this.nutrition.nutritionDB).length} ingredientes</strong> con datos nutricionales precisos
                    </p>
                </div>
            </div>
        `;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.showMainInterface();
        this.navigate(this.currentView); // Mantener vista actual
        this.notifications.show(`Tema ${this.currentTheme === 'light' ? 'claro' : 'oscuro'} activado`, 'info');
    }
}

// ===== INICIALIZACIÓN =====
let app;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 DOM cargado, inicializando aplicación...');
    
    // Agregar estilos CSS básicos
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        
        button {
            transition: all 0.2s ease;
        }
        
        button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);
    
    try {
        app = new SuloFitnessApp();
        window.app = app; // Acceso global
        await app.initialize();
        
        console.log('🎉 Aplicación inicializada correctamente');
    } catch (error) {
        console.error('💥 Error crítico inicializando:', error);
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; font-family: sans-serif;">
                <div style="padding: 40px; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px;">
                    <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Error de Carga</h1>
                    <p style="color: #7f1d1d; margin-bottom: 20px;">No se pudo inicializar la aplicación</p>
                    <button onclick="location.reload()" style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">🔄 Recargar</button>
                </div>
            </div>
        `;
    }
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('✅ SW registrado'))
            .catch(error => console.log('❌ Error SW:', error));
    });
}

console.log('📱 Sulo Fitness v3.0 - Script cargado');