// ===============================================
// BASE DE DATOS COMPLETA DE EJERCICIOS v2.0
// ADAPTADA ESPECÍFICAMENTE PARA TU HISTORIAL MÉDICO
// Fusión lumbar L3-L4 + LCA reconstruido + Objetivos específicos
// ===============================================

const EXERCISE_DATABASE_COMPLETE = {
    
    // ===== EJERCICIOS TREN SUPERIOR SEGUROS =====
    upper_body_safe: [
        {
            id: 'chest_supported_row',
            name: 'Remo con apoyo pectoral',
            description: 'Remo sentado con apoyo en el pecho. SEGURO para tu fusión lumbar L3-L4. El apoyo elimina completamente la carga sobre la columna lumbar.',
            target: 'Dorsales',
            secondary: ['Romboides', 'Deltoides posterior', 'Bíceps'],
            equipment: ['Máquina de remo', 'Banco inclinado + mancuernas'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            lumbar_friendly: true,
            contraindications: [],
            defaultSets: 3,
            defaultReps: '10-12',
            defaultRest: 90,
            progressionWeeks: 4,
            tips: [
                'Mantén el pecho pegado al apoyo durante todo el movimiento',
                'Retrae escápulas al final del movimiento',
                'Evita usar momentum - movimiento controlado'
            ],
            alternatives: ['seated_cable_row', 'single_arm_dumbbell_row']
        },
        {
            id: 'incline_dumbbell_press',
            name: 'Press inclinado con mancuernas',
            description: 'Press en banco inclinado 30-45°. Desarrollo del pectoral superior con menos estrés lumbar que el press plano.',
            target: 'Pecho superior',
            secondary: ['Deltoides anterior', 'Tríceps'],
            equipment: ['Mancuernas', 'Banco inclinado'],
            type: 'weight',
            difficulty: 'intermediate',
            medical_safe: true,
            lumbar_friendly: true,
            knee_safe: true,
            defaultSets: 3,
            defaultReps: '8-10',
            defaultRest: 120,
            tips: [
                'Mantén los pies firmemente apoyados',
                'No arquees excesivamente la espalda',
                'Baja controladamente hasta sentir estiramiento'
            ]
        },
        {
            id: 'lat_pulldown',
            name: 'Jalón al pecho',
            description: 'Jalón vertical con agarre amplio. Excelente para desarrollar dorsales sin cargar la lumbar.',
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
            description: 'Press de hombros sentado con respaldo. Desarrollo de deltoides con soporte lumbar completo.',
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
            id: 'cable_lateral_raises',
            name: 'Elevaciones laterales en polea',
            description: 'Elevaciones laterales con cable. Desarrollo de deltoides medios con resistencia constante.',
            target: 'Deltoides medios',
            secondary: [],
            equipment: ['Máquina de poleas'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            defaultSets: 3,
            defaultReps: '12-15',
            defaultRest: 60
        },
        {
            id: 'tricep_pushdown',
            name: 'Extension de tríceps en polea',
            description: 'Extensión de tríceps de pie con cable. Desarrollo específico de tríceps sin compromiso lumbar.',
            target: 'Tríceps',
            secondary: [],
            equipment: ['Máquina de poleas'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            defaultSets: 3,
            defaultReps: '10-12',
            defaultRest: 75
        },
        {
            id: 'hammer_curls',
            name: 'Curl martillo',
            description: 'Curl con agarre neutro. Desarrollo de bíceps y braquial sin estrés articular.',
            target: 'Bíceps',
            secondary: ['Braquial', 'Braquiorradial'],
            equipment: ['Mancuernas'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            defaultSets: 3,
            defaultReps: '10-12',
            defaultRest: 60
        },
        {
            id: 'face_pulls',
            name: 'Face pulls',
            description: 'Tracción hacia la cara con cable. EXCELENTE para tu postura y salud de hombros. Específico para contrarrestar cifosis.',
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

    // ===== EJERCICIOS TREN INFERIOR SEGUROS PARA RODILLA =====
    lower_body_knee_safe: [
        {
            id: 'goblet_squat',
            name: 'Sentadilla goblet',
            description: 'Sentadilla sosteniendo mancuerna en el pecho. Control total del movimiento, seguro para tu LCA reconstruido.',
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
            defaultRest: 120,
            progressionWeeks: 6
        },
        {
            id: 'leg_press',
            name: 'Prensa de piernas',
            description: 'Prensa horizontal o inclinada. Desarrollo de piernas sin carga axial en la columna.',
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
            description: 'Subida controlada a plataforma. Fortalecimiento unilateral controlado, excelente para LCA.',
            target: 'Cuádriceps',
            secondary: ['Glúteos', 'Estabilizadores'],
            equipment: ['Cajón/plataforma', 'Mancuernas opcionales'],
            type: 'weight',
            difficulty: 'intermediate',
            medical_safe: true,
            knee_safe: true,
            medical_priority: true,
            medical_notes: 'Fortalece propiocepcción post-LCA',
            defaultSets: 3,
            defaultReps: '8-10 cada pierna',
            defaultRest: 90
        },
        {
            id: 'seated_leg_extension',
            name: 'Extension de cuádriceps sentado',
            description: 'Extension de rodilla en máquina. Fortalecimiento específico de cuádriceps sin carga articular.',
            target: 'Cuádriceps',
            secondary: [],
            equipment: ['Máquina de extensiones'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            knee_rehabilitation: true,
            medical_notes: 'Fortalecimiento específico post-LCA - progresión muy controlada',
            defaultSets: 3,
            defaultReps: '12-15',
            defaultRest: 75
        },
        {
            id: 'lying_leg_curl',
            name: 'Curl femoral tumbado',
            description: 'Flexión de rodilla tumbado boca abajo. Fortalecimiento de isquiotibiales sin carga lumbar.',
            target: 'Isquiotibiales',
            secondary: [],
            equipment: ['Máquina de curl femoral'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            knee_rehabilitation: true,
            lumbar_friendly: true,
            defaultSets: 3,
            defaultReps: '10-12',
            defaultRest: 75
        },
        {
            id: 'calf_raises_seated',
            name: 'Elevaciones gemelos sentado',
            description: 'Elevaciones de talones sentado. Desarrollo de sóleo sin carga en columna.',
            target: 'Sóleo',
            secondary: [],
            equipment: ['Máquina de gemelos sentado'],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            lumbar_friendly: true,
            defaultSets: 4,
            defaultReps: '15-20',
            defaultRest: 45
        }
    ],

    // ===== EJERCICIOS ESPECÍFICOS REHABILITACIÓN LUMBAR =====
    lumbar_rehabilitation: [
        {
            id: 'dead_bug',
            name: 'Dead Bug',
            description: 'Ejercicio de estabilidad lumbar fundamental. ESENCIAL para tu fusión L3-L4. Fortalece core profundo sin flexión lumbar.',
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
            id: 'bird_dog',
            name: 'Bird Dog',
            description: 'Cuadrupedia con extensión opuesta. Estabilidad y coordinación lumbo-pélvica.',
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
            id: 'glute_bridge',
            name: 'Puente de glúteo',
            description: 'Fortalecimiento de glúteos. FUNDAMENTAL para reducir carga lumbar. Los glúteos débiles sobrecargan tu zona de fusión.',
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
            id: 'side_plank',
            name: 'Plancha lateral',
            description: 'Fortalecimiento lateral del core. Estabilidad frontal sin flexión lumbar.',
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
        },
        {
            id: 'cat_cow',
            name: 'Gato-Camello',
            description: 'Movilidad vertebral controlada. IMPORTANTE: Movimiento suave, evita rangos extremos en tu zona de fusión.',
            target: 'Movilidad vertebral',
            secondary: [],
            equipment: [],
            type: 'mobility',
            difficulty: 'beginner',
            medical_safe: true,
            lumbar_specific: true,
            medical_notes: 'Movimiento SUAVE - evita forzar zona L3-L4',
            defaultSets: 2,
            defaultReps: '8-10',
            defaultRest: 0
        },
        {
            id: 'hip_flexor_stretch',
            name: 'Estiramiento psoas',
            description: 'Estiramiento de flexores de cadera. CRÍTICO: Los flexores tensos aumentan lordosis y carga en tu fusión.',
            target: 'Flexores de cadera',
            secondary: [],
            equipment: [],
            type: 'stretching',
            difficulty: 'beginner',
            medical_safe: true,
            medical_priority: true,
            lumbar_specific: true,
            medical_notes: 'Psoas tenso = más carga en fusión L3-L4',
            defaultSets: 2,
            defaultReps: '30 segundos cada lado',
            defaultRest: 0
        },
        {
            id: 'thoracic_extension',
            name: 'Extensión torácica',
            description: 'Movilidad de columna dorsal. Compensa la rigidez lumbar mejorando movilidad torácica.',
            target: 'Movilidad torácica',
            secondary: [],
            equipment: ['Foam roller o toalla'],
            type: 'mobility',
            difficulty: 'beginner',
            medical_safe: true,
            lumbar_specific: true,
            medical_notes: 'Mejora movilidad torácica para compensar rigidez lumbar',
            defaultSets: 2,
            defaultReps: '8-10',
            defaultRest: 0
        },
        {
            id: 'pelvic_tilt',
            name: 'Basculación pélvica',
            description: 'Educación postural. Aprender a controlar la posición pélvica para proteger la fusión.',
            target: 'Control pélvico',
            secondary: ['Core profundo'],
            equipment: [],
            type: 'control',
            difficulty: 'beginner',
            medical_safe: true,
            medical_priority: true,
            lumbar_specific: true,
            medical_notes: 'FUNDAMENTAL para proteger tu fusión L3-L4',
            defaultSets: 2,
            defaultReps: '10-12',
            defaultRest: 30
        }
    ],

    // ===== EJERCICIOS FORTALECIMIENTO RODILLA =====
    knee_strengthening: [
        {
            id: 'wall_sits',
            name: 'Sentadilla isométrica en pared',
            description: 'Fortalecimiento isométrico de cuádriceps. Seguro para tu LCA, sin estrés articular.',
            target: 'Cuádriceps',
            secondary: ['Glúteos'],
            equipment: ['Pared'],
            type: 'time',
            difficulty: 'beginner',
            medical_safe: true,
            knee_rehabilitation: true,
            medical_notes: 'Sin estrés en LCA - fortalecimiento seguro',
            defaultSets: 3,
            defaultReps: '30-45 segundos',
            defaultRest: 90
        },
        {
            id: 'single_leg_balance',
            name: 'Equilibrio monopodal',
            description: 'Trabajo propioceptivo. CRÍTICO para tu rodilla reconstruida - mejora estabilidad y previene re-lesiones.',
            target: 'Propiocepción',
            secondary: ['Estabilizadores rodilla'],
            equipment: ['Superficie inestable opcional'],
            type: 'balance',
            difficulty: 'intermediate',
            medical_safe: true,
            knee_rehabilitation: true,
            medical_priority: true,
            medical_notes: 'ESENCIAL post-LCA para prevenir re-lesiones',
            defaultSets: 3,
            defaultReps: '30 segundos cada pierna',
            defaultRest: 60
        },
        {
            id: 'mini_squats',
            name: 'Mini sentadillas',
            description: 'Sentadillas parciales controladas. Progresión segura hacia sentadilla completa.',
            target: 'Cuádriceps',
            secondary: ['Glúteos'],
            equipment: [],
            type: 'weight',
            difficulty: 'beginner',
            medical_safe: true,
            knee_rehabilitation: true,
            medical_notes: 'Progresión controlada - respeta límites de tu rodilla',
            defaultSets: 3,
            defaultReps: '10-15',
            defaultRest: 60
        }
    ],

    // ===== EJERCICIOS CARDIO ESPECÍFICOS =====
    cardio_specific: [
        {
            id: 'swimming_freestyle',
            name: 'Natación crol',
            description: 'Técnica de crol para tus sesiones L-X 20:00-20:45. Sin impacto, ideal para tu historial.',
            target: 'Cardiovascular',
            secondary: ['Todo el cuerpo'],
            equipment: ['Piscina'],
            type: 'cardio',
            difficulty: 'intermediate',
            medical_safe: true,
            lumbar_friendly: true,
            knee_safe: true,
            defaultSets: 1,
            defaultReps: '30-45 minutos',
            defaultRest: 0
        },
        {
            id: 'cycling_endurance',
            name: 'Ciclismo resistencia',
            description: 'Ciclismo de carretera/montaña domingos. Adaptado a tus 40km habituales.',
            target: 'Cardiovascular',
            secondary: ['Cuádriceps', 'Glúteos'],
            equipment: ['Bicicleta'],
            type: 'cardio',
            difficulty: 'intermediate',
            medical_safe: true,
            knee_safe: true,
            defaultSets: 1,
            defaultReps: '60-90 minutos',
            defaultRest: 0
        },
        {
            id: 'football_specific',
            name: 'Fútbol - Match',
            description: 'Partidos sábados 9:00. Oct-Jun. Incluye calentamiento específico y prevención lesiones.',
            target: 'Deporte específico',
            secondary: ['Todo el cuerpo'],
            equipment: ['Campo de fútbol'],
            type: 'sport',
            difficulty: 'advanced',
            medical_safe: true,
            knee_attention: true,
            medical_notes: 'ATENCIÓN: Evita entradas y giros bruscos con la rodilla derecha',
            defaultSets: 1,
            defaultReps: '90 minutos',
            defaultRest: 0
        }
    ],

    // ===== EJERCICIOS CONTRAINDICADOS (NUNCA HACER) =====
    contraindicated: [
        {
            id: 'deadlift_conventional',
            name: 'Peso muerto convencional',
            reason: 'Flexión lumbar cargada - PELIGROSO para fusión L3-L4',
            alternatives: ['hip_hinge_cable', 'leg_press']
        },
        {
            id: 'overhead_press_standing',
            name: 'Press militar de pie',
            reason: 'Carga axial excesiva en columna lumbar',
            alternatives: ['seated_shoulder_press', 'dumbbell_press_incline']
        },
        {
            id: 'russian_twists',
            name: 'Giros rusos',
            reason: 'Rotación lumbar cargada - PROHIBIDO post-fusión',
            alternatives: ['side_plank', 'pallof_press']
        }
    ]
};

// ===== CONFIGURACIÓN MÉDICA ESPECÍFICA PARA TU PERFIL =====
const MEDICAL_PROFILE_CONFIG = {
    conditions: {
        lumbar_fusion_L3L4: {
            active: true,
            severity: 'moderate',
            restrictions: [
                'no_lumbar_flexion_loaded',
                'no_lumbar_rotation_loaded', 
                'no_overhead_standing',
                'limit_axial_compression'
            ],
            priorities: [
                'glute_strengthening',
                'core_stability',
                'hip_mobility',
                'thoracic_mobility'
            ]
        },
        acl_reconstruction_right: {
            active: true,
            severity: 'mild', // Assuming 2+ years post-op
            restrictions: [
                'controlled_pivoting',
                'progressive_plyometrics',
                'avoid_valgus_stress'
            ],
            priorities: [
                'proprioceptive_training',
                'hamstring_strengthening',
                'quad_strengthening'
            ]
        }
    },
    
    weekly_schedule: {
        monday: {
            gym: '15:00-16:30',
            swimming: '20:00-20:45',
            focus: 'upper_body_lumbar_rehab'
        },
        tuesday: {
            gym: '15:00-16:30',
            focus: 'lower_body_knee_safe'
        },
        wednesday: {
            gym: '15:00-16:30',
            swimming: '20:00-20:45',
            focus: 'upper_body_power'
        },
        thursday: {
            gym: '15:00-16:30',
            focus: 'core_stability_lumbar'
        },
        friday: {
            gym: '15:00-16:30',
            focus: 'football_preparation'
        },
        saturday: {
            football: '09:00-10:30', // Oct-Jun only
            focus: 'match_day'
        },
        sunday: {
            cycling: 'optional_40km',
            focus: 'active_recovery'
        }
    },
    
    progression_rules: {
        lumbar_exercises: {
            increment: 'weekly',
            progression_type: 'time_based',
            max_increase: '5_seconds'
        },
        strength_exercises: {
            increment: 'bi_weekly',
            progression_type: 'weight_based',
            max_increase: '2.5kg'
        },
        knee_rehab: {
            increment: 'weekly',
            progression_type: 'controlled',
            max_increase: '1_rep'
        }
    }
};

export { EXERCISE_DATABASE_COMPLETE, MEDICAL_PROFILE_CONFIG };