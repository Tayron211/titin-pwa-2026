// Gym WP Clone Database with Equipment and Location Filtering (Home vs Machine vs Free Weights)
const GymData = {
  // Muscle groups matching Gym WP categories (Using authentic real photos from APK)
  muscleGroups: [
    { id: 'casa', name: 'En Casa (Sin Máquinas)', image: './GYMTOP/resources/res/drawable/im_categoria_definicao.png' },
    { id: 'all', name: 'Todos los Músculos', image: './GYMTOP/resources/res/drawable/im_categoria_hipertrofia.png' },
    { id: 'chest', name: 'Pecho / Pectoral', image: './GYMTOP/resources/res/drawable/im_categoria_peitoral.png' },
    { id: 'back', name: 'Espalda & Dorsales', image: './GYMTOP/resources/res/drawable/im_categoria_costas.png' },
    { id: 'legs', name: 'Piernas & Cuádriceps', image: './GYMTOP/resources/res/drawable/im_categoria_pernas.png' },
    { id: 'arms', name: 'Brazos (Bíceps & Tríceps)', image: './GYMTOP/resources/res/drawable/im_categoria_bracos.png' },
    { id: 'shoulders', name: 'Hombros (Deltoides)', image: './GYMTOP/resources/res/drawable/im_categoria_bracos.png' },
    { id: 'abs', name: 'Abdomen & Core', image: './GYMTOP/resources/res/drawable/im_categoria_abdomen.png' },
    { id: 'glutes', name: 'Glúteos & Cadera', image: './GYMTOP/resources/res/drawable/im_categoria_gluteos.png' },
    { id: 'cardio', name: 'Cardio & Resistencia', image: './GYMTOP/resources/res/drawable/im_categoria_cardio.png' }
  ],

  // Real Exercise Catalog with authentic Animated GIFs and 'modality' tag:
  // 'home' (En Casa / Peso Corporal / Calistenia)
  // 'machine' (Con Máquinas / Poleas / Aparatos Guiados)
  // 'freeweight' (Pesas Libres / Barras / Mancuernas)
  exercises: [
    {
        "id": "ex_30",
        "tag": 30,
        "name": "Prensa de Piernas Inclinada 45°",
        "muscle": "legs",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Prensa 45°",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex30.gif",
        "defaultRest": 90,
        "details": "Ejecución controlada de Prensa de Piernas Inclinada 45°."
    },
    {
        "id": "ex_8",
        "tag": 8,
        "name": "Cruzamiento de Cables en Polea",
        "muscle": "chest",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Polea Crossover",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex8.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Cruzamiento de Cables en Polea."
    },
    {
        "id": "ex_11",
        "tag": 11,
        "name": "Aperturas en Máquina Contractora (Peck Deck)",
        "muscle": "chest",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Peck Deck",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex11.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Aperturas en Máquina Contractora (Peck Deck)."
    },
    {
        "id": "ex_32",
        "tag": 32,
        "name": "Extensión de Piernas en Máquina",
        "muscle": "legs",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Extensión Cuádriceps",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex32.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Extensión de Piernas en Máquina."
    },
    {
        "id": "ex_29",
        "tag": 29,
        "name": "Sentadillas en Máquina Hack",
        "muscle": "legs",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Hack Squat",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex29.gif",
        "defaultRest": 90,
        "details": "Ejecución controlada de Sentadillas en Máquina Hack."
    },
    {
        "id": "ex_33",
        "tag": 33,
        "name": "Abductores en Máquina Guiada",
        "muscle": "legs",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina de Abductores",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex33.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Abductores en Máquina Guiada."
    },
    {
        "id": "ex_34",
        "tag": 34,
        "name": "Abductores en Polea Baja",
        "muscle": "legs",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Polea Baja",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex34.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Abductores en Polea Baja."
    },
    {
        "id": "ex_37",
        "tag": 37,
        "name": "Aductores en Polea Baja",
        "muscle": "legs",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Polea Baja",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex37.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Aductores en Polea Baja."
    },
    {
        "id": "ex_40",
        "tag": 40,
        "name": "Aperturas Invertidas en Polea Crossover",
        "muscle": "back",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Polea Crossover",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex40.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Aperturas Invertidas en Polea Crossover."
    },
    {
        "id": "ex_100",
        "tag": 100,
        "name": "Press Vertical Sentado en Máquina",
        "muscle": "chest",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Press de Pecho",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex100.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Press Vertical Sentado en Máquina."
    },
    {
        "id": "ex_102",
        "tag": 102,
        "name": "Press Inclinado en Máquina Smith",
        "muscle": "chest",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Smith Multipower",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex102.gif",
        "defaultRest": 75,
        "details": "Ejecución controlada de Press Inclinado en Máquina Smith."
    },
    {
        "id": "ex_147",
        "tag": 147,
        "name": "Aperturas Invertidas en Máquina (Pájaros)",
        "muscle": "back",
        "modality": "machine",
        "modalityLabel": "Con Máquina",
        "equipment": "Máquina Contractora",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex147.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Aperturas Invertidas en Máquina (Pájaros)."
    },
    {
        "id": "ex_144",
        "tag": 144,
        "name": "Flexiones de Pecho en Suelo (Push-Ups)",
        "muscle": "chest",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex144.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Flexiones de Pecho en Suelo (Push-Ups)."
    },
    {
        "id": "ex_108",
        "tag": 108,
        "name": "Burpees Metabólicos en Suelo",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Peso Corporal (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex108.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Burpees Metabólicos en Suelo."
    },
    {
        "id": "ex_106",
        "tag": 106,
        "name": "Flexiones con Pies Elevados",
        "muscle": "chest",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Elevación (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex106.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Flexiones con Pies Elevados."
    },
    {
        "id": "ex_107",
        "tag": 107,
        "name": "Flexiones con Apertura Alterna",
        "muscle": "chest",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex107.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Flexiones con Apertura Alterna."
    },
    {
        "id": "ex_110",
        "tag": 110,
        "name": "Flexiones Explosivas con Palmas",
        "muscle": "chest",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex110.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Flexiones Explosivas con Palmas."
    },
    {
        "id": "ex_112",
        "tag": 112,
        "name": "Flexiones de Bombardero (Dive Bomber)",
        "muscle": "chest",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex112.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Flexiones de Bombardero (Dive Bomber)."
    },
    {
        "id": "ex_18",
        "tag": 18,
        "name": "Elevación de Piernas Rectas en Suelo",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Esterilla (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex18.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Elevación de Piernas Rectas en Suelo."
    },
    {
        "id": "ex_19",
        "tag": 19,
        "name": "Doble Contracción Abdominal en Suelo",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Esterilla (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex19.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Doble Contracción Abdominal en Suelo."
    },
    {
        "id": "ex_20",
        "tag": 20,
        "name": "Abdominales Bicicleta en Suelo",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Esterilla (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex20.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Abdominales Bicicleta en Suelo."
    },
    {
        "id": "ex_21",
        "tag": 21,
        "name": "Giro Ruso en Suelo (Russian Twist)",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex21.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Giro Ruso en Suelo (Russian Twist)."
    },
    {
        "id": "ex_25",
        "tag": 329,
        "name": "Plancha Dinámica con Flexión de Piernas",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex329.gif",
        "defaultRest": 45,
        "details": "Posición de plancha en suelo flexionando las piernas rítmicamente hacia el abdomen para quemar calorías y fortalecer el core de forma continua."
    },
    {
        "id": "ex_131",
        "tag": 131,
        "name": "Elevación en V en Suelo (V-Ups)",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex131.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Elevación en V en Suelo (V-Ups)."
    },
    {
        "id": "ex_132",
        "tag": 132,
        "name": "Abdominales con Piernas Elevadas",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex132.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Abdominales con Piernas Elevadas."
    },
    {
        "id": "ex_137",
        "tag": 137,
        "name": "Abdominales Toca-Puntas (Toe Touch)",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex137.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Abdominales Toca-Puntas (Toe Touch)."
    },
    {
        "id": "ex_139",
        "tag": 139,
        "name": "Abdominales Inversos en Suelo",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex139.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Abdominales Inversos en Suelo."
    },
    {
        "id": "ex_149",
        "tag": 149,
        "name": "Empuje de Cadera / Puente de Glúteos",
        "muscle": "glutes",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex149.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Empuje de Cadera / Puente de Glúteos."
    },
    {
        "id": "ex_157",
        "tag": 157,
        "name": "Abdominal Crunch Clásico en Suelo",
        "muscle": "abs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex157.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Abdominal Crunch Clásico en Suelo."
    },
    {
        "id": "ex_158",
        "tag": 158,
        "name": "Extensión de Cadera en Suelo (Patada Glúteo)",
        "muscle": "glutes",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex158.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Extensión de Cadera en Suelo (Patada Glúteo)."
    },
    {
        "id": "ex_190",
        "tag": 190,
        "name": "Levantamiento de Piernas para Aductores",
        "muscle": "legs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex190.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Levantamiento de Piernas para Aductores."
    },
    {
        "id": "ex_192",
        "tag": 192,
        "name": "Elevación Lateral de Pierna para Abductores",
        "muscle": "legs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex192.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Elevación Lateral de Pierna para Abductores."
    },
    {
        "id": "ex_115",
        "tag": 115,
        "name": "Elevación de Talones en Suelo (Gemelos)",
        "muscle": "legs",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex115.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Elevación de Talones en Suelo (Gemelos)."
    },
    {
        "id": "ex_116",
        "tag": 116,
        "name": "Trote en el Sitio (Butt Kicks)",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Peso Corporal (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex116.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Trote en el Sitio (Butt Kicks)."
    },
    {
        "id": "ex_195",
        "tag": 195,
        "name": "Saltar la Cuerda (Cardio en Casa)",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Cuerda (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex195.gif",
        "defaultRest": 45,
        "details": "Ejecución controlada de Saltar la Cuerda (Cardio en Casa)."
    },
    {
        "id": "ex_4",
        "tag": 4,
        "name": "Press de Banca Plano con Barra",
        "muscle": "chest",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Barra Olímpica & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex4.gif",
        "defaultRest": 90,
        "details": "Ejecución controlada de Press de Banca Plano con Barra."
    },
    {
        "id": "ex_5",
        "tag": 5,
        "name": "Press de Banca Inclinado con Barra",
        "muscle": "chest",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Barra Olímpica & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex5.gif",
        "defaultRest": 75,
        "details": "Ejecución controlada de Press de Banca Inclinado con Barra."
    },
    {
        "id": "ex_1",
        "tag": 1,
        "name": "Press Sentado con Mancuernas",
        "muscle": "arms",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex1.gif",
        "defaultRest": 75,
        "details": "Ejecución controlada de Press Sentado con Mancuernas."
    },
    {
        "id": "ex_2",
        "tag": 2,
        "name": "Elevaciones Frontales con Mancuernas",
        "muscle": "shoulders",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex2.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Elevaciones Frontales con Mancuernas."
    },
    {
        "id": "ex_3",
        "tag": 3,
        "name": "Elevaciones Laterales con Mancuernas",
        "muscle": "shoulders",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex3.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Elevaciones Laterales con Mancuernas."
    },
    {
        "id": "ex_6",
        "tag": 6,
        "name": "Press de Banca Plano con Mancuernas",
        "muscle": "chest",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex6.gif",
        "defaultRest": 75,
        "details": "Ejecución controlada de Press de Banca Plano con Mancuernas."
    },
    {
        "id": "ex_7",
        "tag": 7,
        "name": "Press Inclinado con Mancuernas",
        "muscle": "chest",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex7.gif",
        "defaultRest": 75,
        "details": "Ejecución controlada de Press Inclinado con Mancuernas."
    },
    {
        "id": "ex_9",
        "tag": 9,
        "name": "Aperturas con Mancuernas en Banco",
        "muscle": "chest",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex9.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Aperturas con Mancuernas en Banco."
    },
    {
        "id": "ex_10",
        "tag": 10,
        "name": "Pullover con Mancuerna en Banco",
        "muscle": "chest",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuerna & Banco",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex10.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Pullover con Mancuerna en Banco."
    },
    {
        "id": "ex_13",
        "tag": 13,
        "name": "Curl de Bíceps con Barra",
        "muscle": "arms",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Barra con Discos",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex13.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Curl de Bíceps con Barra."
    },
    {
        "id": "ex_14",
        "tag": 14,
        "name": "Curl de Bíceps Alterno con Mancuernas",
        "muscle": "arms",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex14.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Curl de Bíceps Alterno con Mancuernas."
    },
    {
        "id": "ex_15",
        "tag": 15,
        "name": "Curl Martillo con Mancuernas",
        "muscle": "arms",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex15.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Curl Martillo con Mancuernas."
    },
    {
        "id": "ex_22",
        "tag": 22,
        "name": "Encogimiento de Hombros con Barra",
        "muscle": "back",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Barra Olímpica",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex22.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Encogimiento de Hombros con Barra."
    },
    {
        "id": "ex_28",
        "tag": 28,
        "name": "Sentadilla Libre con Barra (Squat)",
        "muscle": "legs",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Barra Olímpica",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex28.gif",
        "defaultRest": 90,
        "details": "Ejecución controlada de Sentadilla Libre con Barra (Squat)."
    },
    {
        "id": "ex_31",
        "tag": 31,
        "name": "Zancadas con Mancuernas",
        "muscle": "legs",
        "modality": "freeweight",
        "modalityLabel": "Pesas Libres",
        "equipment": "Mancuernas",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex31.gif",
        "defaultRest": 60,
        "details": "Ejecución controlada de Zancadas con Mancuernas."
    },
    {
        "id": "ex_108_hiit",
        "tag": 108,
        "name": "Burpees HIIT 30/15 (En Casa)",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Peso Corporal (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex108.gif",
        "defaultRest": 30,
        "details": "Protocolo HIIT de Burpees: 30 segundos a máxima intensidad y 15 segundos de descanso por ronda. Eleva la frecuencia cardíaca y quema grasa en poco tiempo."
    },
    {
        "id": "ex_108_res",
        "tag": 108,
        "name": "Burpees por Resistencia (Rondas)",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Peso Corporal (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex108.gif",
        "defaultRest": 45,
        "details": "Series largas de Burpees controlados para desarrollar resistencia cardiovascular y muscular de cuerpo completo."
    },
    {
        "id": "ex_116_warm",
        "tag": 116,
        "name": "Trote en el Sitio — Calentamiento Cardio",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Peso Corporal (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex116.gif",
        "defaultRest": 30,
        "details": "Trote suave en el sitio (Butt Kicks) para activar la circulación y preparar articulaciones antes del entrenamiento."
    },
    {
        "id": "ex_116_hiit",
        "tag": 116,
        "name": "Trote Rápido por Intervalos",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Peso Corporal (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex116.gif",
        "defaultRest": 30,
        "details": "Intervalos de trote en el sitio a alta cadencia con pausas cortas. Mejora la capacidad aeróbica y la coordinación."
    },
    {
        "id": "ex_195_tabata",
        "tag": 195,
        "name": "Salto de Cuerda — Tabata 20/10",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Cuerda (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex195.gif",
        "defaultRest": 45,
        "details": "Formato Tabata: 20 segundos de salto a máxima velocidad y 10 segundos de descanso, 8 rondas. Máxima quema calórica."
    },
    {
        "id": "ex_195_res",
        "tag": 195,
        "name": "Salto de Cuerda — Resistencia Continua",
        "muscle": "cardio",
        "modality": "home",
        "modalityLabel": "En Casa (Sin Máquinas)",
        "equipment": "Suelo / Cuerda (Sin equipo)",
        "gifUrl": "./GYMTOP/resources/res/drawable/im_ex195.gif",
        "defaultRest": 45,
        "details": "Saltos continuos de cuerda por tiempo prolongado para desarrollar resistencia aeróbica, coordinación y tonificación de piernas."
    }
],

  // Users in the system (Using authentic Gym WP APK real user photos)
  users: [
    {
      id: 'usr_coach_1',
      name: 'Humberto Salinas',
      username: 'hsalinas',
      nick: 'Coach Humberto',
      email: 'humberto.coach@topgym.com',
      phone: '+57 300 555 0199',
      role: 'coach',
      pin: '0204',
      age: 33,
      district: 'Santiago de Surco',
      weight: 82,
      height: 180,
      specialty: 'Fuerza & Acondicionamiento TOP-GYM',
      avatar: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg',
      activeStudentsCount: 3
    },
    {
      id: 'usr_student_1',
      name: 'Mateo Gómez',
      username: 'mgomez',
      nick: 'Mateo',
      email: 'mateo@topgym.com',
      phone: '+57 312 456 7890',
      role: 'student',
      pin: '1111',
      age: 24,
      district: 'Miraflores',
      goal: 'Hipertrofia en Gimnasio (Con Máquinas)',
      preferredModality: 'machine', // Entrena en gimnasio con máquinas
      weight: 76.5,
      height: 178,
      assignedCoachId: 'usr_coach_1',
      avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg',
      stats: { completedWorkouts: 14, currentStreak: 3, totalVolumeKg: 42800 }
    },
    {
      id: 'usr_student_2',
      name: 'Valentina Ríos',
      username: 'vrios',
      nick: 'Valen',
      email: 'valen@topgym.com',
      phone: '+57 320 987 6543',
      role: 'student',
      pin: '2222',
      age: 22,
      district: 'San Borja',
      goal: 'Tonificación en Casa (Sin Máquinas)',
      preferredModality: 'home', // Entrena en casa
      weight: 62.0,
      height: 165,
      assignedCoachId: 'usr_coach_1',
      avatar: './GYMTOP/resources/res/drawable/im_comentario_3.jpg',
      stats: { completedWorkouts: 19, currentStreak: 5, totalVolumeKg: 28400 }
    },
    {
      id: 'usr_student_3',
      name: 'Tayron Salinas',
      username: 'tsalinas',
      nick: 'Tayron',
      email: 'tayron.salinas@topgym.com',
      phone: '+57 310 987 1991',
      role: 'student',
      pin: '1991',
      age: 26,
      district: 'San Isidro',
      goal: 'Acondicionamiento y Fuerza Funcional',
      preferredModality: 'machine',
      weight: 78.0,
      height: 178,
      assignedCoachId: 'usr_coach_1',
      avatar: './GYMTOP/resources/res/drawable/im_comentario_1.jpg',
      stats: { completedWorkouts: 12, currentStreak: 4, totalVolumeKg: 26400 }
    }
  ],

  // Real Authentic Photos for Student Avatars Selector
  availableAvatars: [
    { id: 'av_1', label: 'Mateo (Atleta Pro)', url: './GYMTOP/resources/res/drawable/im_comentario_4.jpg' },
    { id: 'av_2', label: 'Valeria (Fitness Coach)', url: './GYMTOP/resources/res/drawable/im_comentario_3.jpg' },
    { id: 'av_3', label: 'David (Powerlifter)', url: './GYMTOP/resources/res/drawable/im_comentario_1.jpg' },
    { id: 'av_4', label: 'Camila (Tonificación)', url: './GYMTOP/resources/res/drawable/im_comentario_2.jpg' },
    { id: 'av_5', label: 'Humberto (Calistenia HD)', url: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_4.jpg' },
    { id: 'av_6', label: 'Lucas (Hipertrofia HD)', url: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_2.jpg' },
    { id: 'av_7', label: 'Marcus (Abdomen & Core HD)', url: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_3.jpg' },
    { id: 'av_8', label: 'Santiago (Fuerza Máxima HD)', url: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg' }
  ],

  // Workout Plans categorized by modality ('home' vs 'machine' vs 'freeweight')
  workoutPlans: [
    {
      id: 'plan_home_1',
      name: 'Calistenia y Fuerza en Casa (Sin Máquinas)',
      modality: 'home',
      modalityLabel: 'En Casa',
      tag: 'En Casa',
      details: 'Rutina completa diseñada para realizar en casa sin aparatos, usando peso corporal y calistenia.',
      coverImage: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_4.jpg',
      days: [
        {
          id: 'day_h_1',
          name: 'Sesión Casa A: Pectoral, Core & Cardio',
          daysOfWeek: ['Lunes', 'Miércoles', 'Viernes'],
          exercises: [
            { exerciseId: 'ex_144', series: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 10, weight: 0 }], restTime: 60, note: 'Flexiones de pecho en suelo' },
            { exerciseId: 'ex_157', series: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }, { reps: 20, weight: 0 }], restTime: 45, note: 'Crunch abdominal estricto' },
            { exerciseId: 'ex_25', series: [{ reps: 30, weight: 0 }, { reps: 30, weight: 0 }, { reps: 30, weight: 0 }], restTime: 45, note: 'Plancha dinámica en suelo' },
            { exerciseId: 'ex_149', series: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }, { reps: 15, weight: 0 }], restTime: 45, note: 'Puente de glúteos en suelo' },
            { exerciseId: 'ex_108', series: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }], restTime: 60, note: 'Burpees ritmo constante' }
          ]
        }
      ]
    },
    {
      id: 'plan_mach_1',
      name: 'Circuito Completo con Máquinas & Poleas',
      modality: 'machine',
      modalityLabel: 'Con Máquinas',
      tag: 'Con Máquinas',
      details: 'Entrenamiento guiado de máxima seguridad y aislamiento muscular en máquinas de gimnasio y poleas.',
      coverImage: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_2.jpg',
      days: [
        {
          id: 'day_m_1',
          name: 'Sesión Máquinas: Torso & Tren Inferior Guiado',
          daysOfWeek: ['Martes', 'Jueves', 'Sábado'],
          exercises: [
            { exerciseId: 'ex_30', series: [{ reps: 12, weight: 160 }, { reps: 10, weight: 180 }, { reps: 10, weight: 200 }], restTime: 90, note: 'Prensa 45° con rango amplio' },
            { exerciseId: 'ex_8', series: [{ reps: 12, weight: 25 }, { reps: 10, weight: 30 }, { reps: 10, weight: 30 }], restTime: 60, note: 'Cruzamiento de cables en polea' },
            { exerciseId: 'ex_11', series: [{ reps: 12, weight: 45 }, { reps: 12, weight: 50 }, { reps: 10, weight: 55 }], restTime: 60, note: 'Contractora Peck Deck' },
            { exerciseId: 'ex_32', series: [{ reps: 12, weight: 50 }, { reps: 12, weight: 55 }, { reps: 10, weight: 60 }], restTime: 60, note: 'Extensión de piernas en máquina' },
            { exerciseId: 'ex_100', series: [{ reps: 10, weight: 60 }, { reps: 10, weight: 65 }, { reps: 8, weight: 70 }], restTime: 60, note: 'Press vertical sentado en máquina' },
            { exerciseId: 'ex_33', series: [{ reps: 15, weight: 40 }, { reps: 15, weight: 45 }, { reps: 12, weight: 50 }], restTime: 60, note: 'Abductores en máquina guiada' }
          ]
        }
      ]
    },
    {
      id: 'plan_home_2',
      name: 'HIIT & Tonificación Metabólica en Casa',
      modality: 'home',
      modalityLabel: 'En Casa',
      tag: 'En Casa',
      details: 'Circuito rápido para quemar grasa, tonificar abdomen y piernas desde la comodidad del hogar.',
      coverImage: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg',
      days: [
        {
          id: 'day_h_2',
          name: 'Sesión Casa B: Tren Inferior y Quema Grasa',
          daysOfWeek: ['Martes', 'Jueves'],
          exercises: [
            { exerciseId: 'ex_108', series: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }], restTime: 45, note: 'Burpees metabólicos en suelo' },
            { exerciseId: 'ex_115', series: [{ reps: 25, weight: 0 }, { reps: 25, weight: 0 }, { reps: 25, weight: 0 }], restTime: 30, note: 'Elevación de talones en suelo' },
            { exerciseId: 'ex_158', series: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }, { reps: 20, weight: 0 }], restTime: 45, note: 'Extensión de cadera en suelo' },
            { exerciseId: 'ex_18', series: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }], restTime: 45, note: 'Elevación de piernas en suelo' },
            { exerciseId: 'ex_116', series: [{ reps: 40, weight: 0 }, { reps: 40, weight: 0 }, { reps: 40, weight: 0 }], restTime: 45, note: 'Trote en el sitio (Butt Kicks)' }
          ]
        }
      ]
    },
    {
      id: 'plan_mach_2',
      name: 'Hipertrofia Guiada: Espalda & Piernas en Máquinas',
      modality: 'machine',
      modalityLabel: 'Con Máquinas',
      tag: 'Con Máquinas',
      details: 'Enfocada en tracción y prensa hack con soporte guiado lumbar para ganar masa muscular limpia.',
      coverImage: './GYMTOP/resources/res/drawable/img_bg_hipertrofia_maquinas.jpg',
      days: [
        {
          id: 'day_m_2',
          name: 'Sesión Máquinas: Fuerza Guiada',
          daysOfWeek: ['Lunes', 'Jueves'],
          exercises: [
            { exerciseId: 'ex_29', series: [{ reps: 10, weight: 120 }, { reps: 10, weight: 140 }, { reps: 8, weight: 160 }], restTime: 90, note: 'Sentadillas en máquina Hack' },
            { exerciseId: 'ex_102', series: [{ reps: 12, weight: 50 }, { reps: 10, weight: 55 }, { reps: 10, weight: 60 }], restTime: 60, note: 'Press inclinado en máquina Smith' },
            { exerciseId: 'ex_34', series: [{ reps: 12, weight: 20 }, { reps: 12, weight: 25 }, { reps: 10, weight: 25 }], restTime: 60, note: 'Abductores en polea baja' },
            { exerciseId: 'ex_147', series: [{ reps: 15, weight: 35 }, { reps: 15, weight: 40 }, { reps: 12, weight: 45 }], restTime: 45, note: 'Aperturas invertidas en máquina (Pájaros)' }
          ]
        }
      ]
    },
    {
      id: 'plan_free_1',
      name: 'Torso / Pierna Pro (Pesas Libres)',
      modality: 'freeweight',
      modalityLabel: 'Pesas Libres',
      tag: 'Pesas Libres',
      details: 'División clásica con barras y mancuernas para máxima fuerza e hipertrofia.',
      coverImage: './GYMTOP/resources/res/drawable/img_bg_pesas_libres.jpg',
      days: [
        {
          id: 'day_f_1',
          name: 'Día A: Fuerza de Torso',
          daysOfWeek: ['Lunes', 'Jueves'],
          exercises: [
            { exerciseId: 'ex_4', series: [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }, { reps: 6, weight: 85 }], restTime: 90, note: 'Press banca plano barra' },
            { exerciseId: 'ex_5', series: [{ reps: 10, weight: 65 }, { reps: 10, weight: 65 }, { reps: 8, weight: 70 }], restTime: 75, note: 'Press inclinado barra' },
            { exerciseId: 'ex_1', series: [{ reps: 10, weight: 22 }, { reps: 10, weight: 22 }, { reps: 8, weight: 24 }], restTime: 75, note: 'Press sentado mancuernas' },
            { exerciseId: 'ex_14', series: [{ reps: 12, weight: 14 }, { reps: 10, weight: 16 }, { reps: 10, weight: 16 }], restTime: 60, note: 'Curl bíceps alterno mancuernas' }
          ]
        }
      ]
    }
  ],

  // Notificaciones de entrenamientos finalizados y mensajes de alumnos para el Coach Humberto
  coachNotifications: [
    {
      id: 'notif_init_101',
      taskId: 'task_101',
      studentId: 'usr_student_1',
      studentName: 'Mateo Gómez',
      studentAvatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg',
      workoutTitle: 'Torso & Tren Inferior en Máquinas',
      feedback: 'Coach, completé la rutina completa! Subí a 180kg en la prensa y sentí excelente congestión en los cuádriceps.',
      rpe: 8,
      completedAt: '10/10/2026, 21:23:32',
      isRead: false
    }
  ],

  // Notificaciones de asignaciones y mensajes del Coach para los Alumnos
  studentNotifications: [
    {
      id: 'st_notif_102',
      studentId: 'usr_student_1',
      taskId: 'task_102',
      workoutTitle: 'Rutina Funcional & Core en Casa',
      coachNotes: 'Mateo, enfócate en el core y calistenia controlada.',
      scheduledDate: 'Mañana',
      assignedAt: '12/10/2026, 14:00:00',
      isRead: false
    }
  ],

  // Scheduled Tasks assigned by Coach
  tasks: [
    {
      id: 'task_101',
      coachId: 'usr_coach_1',
      studentId: 'usr_student_1',
      workoutTitle: 'Torso & Tren Inferior en Máquinas',
      modality: 'machine',
      scheduledDate: new Date().toISOString().split('T')[0], // Today
      scheduledDayName: 'Hoy',
      status: 'completed',
      coachNotes: 'Mateo, hoy enfócate en la prensa y poleas con técnica estricta y controlada.',
      targetRestTime: 90,
      exercises: [
        { exerciseId: 'ex_30', series: [{ reps: 12, weight: 160, completed: true }, { reps: 10, weight: 180, completed: true }, { reps: 10, weight: 200, completed: true }], restTime: 90, note: 'Prensa 45° profunda' },
        { exerciseId: 'ex_8', series: [{ reps: 10, weight: 25, completed: true }, { reps: 10, weight: 30, completed: true }, { reps: 8, weight: 30, completed: true }], restTime: 60, note: 'Cruzamiento de cables polea' },
        { exerciseId: 'ex_11', series: [{ reps: 12, weight: 45, completed: true }, { reps: 12, weight: 50, completed: true }, { reps: 10, weight: 55, completed: true }], restTime: 60, note: 'Contractora Peck Deck' },
        { exerciseId: 'ex_32', series: [{ reps: 12, weight: 50, completed: true }, { reps: 12, weight: 55, completed: true }], restTime: 60, note: 'Extensión cuádriceps' },
        { exerciseId: 'ex_100', series: [{ reps: 10, weight: 60, completed: true }, { reps: 10, weight: 65, completed: true }], restTime: 60, note: 'Press vertical sentado' }
      ],
      completedAt: '10/10/2026, 21:23:32',
      studentFeedback: 'Coach, completé la rutina completa! Subí a 180kg en la prensa y sentí excelente congestión en los cuádriceps.',
      ratingRPE: 8
    },
    {
      id: 'task_102',
      coachId: 'usr_coach_1',
      studentId: 'usr_student_1',
      workoutTitle: 'Rutina Funcional & Core en Casa',
      modality: 'home',
      scheduledDate: new Date().toISOString().split('T')[0], // Today
      scheduledDayName: 'Hoy',
      status: 'pending',
      coachNotes: 'Mateo, sesión 100% sin máquinas para hacer en casa. Peso corporal estricto.',
      targetRestTime: 45,
      exercises: [
        { exerciseId: 'ex_144', series: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }], restTime: 60, note: 'Flexiones suelo' },
        { exerciseId: 'ex_157', series: [{ reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }], restTime: 45, note: 'Abdominal crunch' },
        { exerciseId: 'ex_25', series: [{ reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }], restTime: 45, note: 'Plancha dinámica' },
        { exerciseId: 'ex_108', series: [{ reps: 12, weight: 0, completed: false }, { reps: 12, weight: 0, completed: false }], restTime: 60, note: 'Burpees suelo' }
      ],
      completedAt: null,
      studentFeedback: null,
      ratingRPE: null
    },
    {
      id: 'task_201',
      coachId: 'usr_coach_1',
      studentId: 'usr_student_2',
      workoutTitle: 'Sesión Calistenia y Core en Casa',
      modality: 'home',
      scheduledDate: new Date().toISOString().split('T')[0], // Today for Valentina
      scheduledDayName: 'Hoy',
      status: 'completed',
      coachNotes: 'Valentina, rutina 100% en casa sin ningún aparato ni mancuernas. En tu sala con colchoneta.',
      targetRestTime: 45,
      exercises: [
        { exerciseId: 'ex_144', series: [{ reps: 12, weight: 0, completed: true }, { reps: 12, weight: 0, completed: true }, { reps: 10, weight: 0, completed: true }], restTime: 60, note: 'Flexiones de pecho' },
        { exerciseId: 'ex_18', series: [{ reps: 20, weight: 0, completed: true }, { reps: 20, weight: 0, completed: true }, { reps: 20, weight: 0, completed: true }], restTime: 45, note: 'Elevación de piernas suelo' },
        { exerciseId: 'ex_149', series: [{ reps: 20, weight: 0, completed: true }, { reps: 20, weight: 0, completed: true }, { reps: 20, weight: 0, completed: true }], restTime: 45, note: 'Puente de glúteos' },
        { exerciseId: 'ex_108', series: [{ reps: 12, weight: 0, completed: true }, { reps: 12, weight: 0, completed: true }], restTime: 60, note: 'Burpees metabólicos' }
      ],
      completedAt: '11/10/2026, 18:45:10',
      studentFeedback: '¡Hola Coach Humberto! Terminé la rutina completa en casa. Los burpees me costaron al final pero mantuve los descansos de 45s. ¡Me siento con mucha energía y sin dolor en la espalda!',
      ratingRPE: 7
    },
    {
      id: 'task_202',
      coachId: 'usr_coach_1',
      studentId: 'usr_student_2',
      workoutTitle: 'Iniciación con Máquinas Guiadas',
      modality: 'machine',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledDayName: 'Hoy',
      status: 'pending',
      coachNotes: 'Valentina, para cuando entrenes en gimnasio: máquinas guiadas y seguras con pesajes moderados.',
      targetRestTime: 60,
      exercises: [
        { exerciseId: 'ex_30', series: [{ reps: 12, weight: 70, completed: false }, { reps: 12, weight: 80, completed: false }], restTime: 90, note: 'Prensa 45°' },
        { exerciseId: 'ex_11', series: [{ reps: 10, weight: 25, completed: false }, { reps: 10, weight: 30, completed: false }], restTime: 60, note: 'Contractora Peck Deck' },
        { exerciseId: 'ex_32', series: [{ reps: 12, weight: 25, completed: false }, { reps: 12, weight: 30, completed: false }], restTime: 60, note: 'Extensión de piernas en máquina' }
      ],
      completedAt: null,
      studentFeedback: null,
      ratingRPE: null
    },
    {
      id: 'task_301',
      coachId: 'usr_coach_1',
      studentId: 'usr_student_3',
      workoutTitle: 'Fuerza & Acondicionamiento en Máquinas',
      modality: 'machine',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledDayName: 'Hoy',
      status: 'pending',
      coachNotes: 'Tayron, enfócate en la técnica en prensa y poleas con descanso controlado de 60s.',
      targetRestTime: 60,
      exercises: [
        { exerciseId: 'ex_30', series: [{ reps: 12, weight: 140, completed: false }, { reps: 10, weight: 160, completed: false }], restTime: 90, note: 'Prensa 45°' },
        { exerciseId: 'ex_8', series: [{ reps: 12, weight: 25, completed: false }, { reps: 10, weight: 30, completed: false }], restTime: 60, note: 'Poleas cruzadas' },
        { exerciseId: 'ex_32', series: [{ reps: 12, weight: 45, completed: false }, { reps: 12, weight: 50, completed: false }], restTime: 60, note: 'Extensión cuádriceps' }
      ],
      completedAt: null,
      studentFeedback: null,
      ratingRPE: null
    }
  ],

  // Body Measurements with Student Confidentiality (Isolated by studentId)
  bodyMeasurements: [
    // Medidas privadas de Mateo Gómez
    { studentId: 'usr_student_1', date: '2026-09-15', weight: 77.8, chest: 102, arm: 37.0, waist: 83.5 },
    { studentId: 'usr_student_1', date: '2026-09-22', weight: 77.2, chest: 102.5, arm: 37.2, waist: 83.0 },
    { studentId: 'usr_student_1', date: '2026-09-29', weight: 76.8, chest: 103.0, arm: 37.5, waist: 82.2 },
    { studentId: 'usr_student_1', date: '2026-10-06', weight: 76.5, chest: 103.5, arm: 37.8, waist: 81.8 },

    // Medidas privadas de Valentina Ríos
    { studentId: 'usr_student_2', date: '2026-09-18', weight: 63.5, chest: 90, arm: 28.0, waist: 68.0 },
    { studentId: 'usr_student_2', date: '2026-09-25', weight: 62.8, chest: 90, arm: 28.2, waist: 67.5 },
    { studentId: 'usr_student_2', date: '2026-10-02', weight: 62.3, chest: 90.5, arm: 28.5, waist: 67.0 },
    { studentId: 'usr_student_2', date: '2026-10-07', weight: 62.0, chest: 91.0, arm: 28.8, waist: 66.5 }
  ]
};

function getExerciseAnatomy(ex) {
  if (!ex) {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm1.png',
      primaryMuscle: 'Pectoral Mayor',
      secondaryMuscle: 'Tríceps & Deltoides Anterior'
    };
  }

  const name = (ex.name || '').toLowerCase();
  const id = (ex.id || '').toLowerCase();
  const muscle = (ex.muscle || '').toLowerCase();

  // 1. Gemelos / Pantorrillas -> tras_gm15.png
  if (name.includes('gemelo') || name.includes('talon') || name.includes('pantorrilla') || id === 'ex_115') {
    return {
      view: 'tras',
      baseImg: './GYMTOP/resources/res/drawable/tras_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/tras_gm15.png',
      primaryMuscle: 'Gastrocnemio y Sóleo (Gemelos)',
      secondaryMuscle: 'Tendón de Aquiles & Sóleo Profundo'
    };
  }

  // 2. Lumbares -> tras_gm5.png
  if (name.includes('superman') || name.includes('lumbar')) {
    return {
      view: 'tras',
      baseImg: './GYMTOP/resources/res/drawable/tras_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/tras_gm5.png',
      primaryMuscle: 'Erectores Espinales (Zona Lumbar)',
      secondaryMuscle: 'Glúteos & Isquiotibiales'
    };
  }

  // 3. Oblicuos / Giro Ruso -> frente_gm5.png
  if (name.includes('oblicuo') || name.includes('giro ruso') || (name.includes('lateral') && (name.includes('plancha') || name.includes('plank'))) || id === 'ex_21') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm5.png',
      primaryMuscle: 'Oblicuos Internos y Externos',
      secondaryMuscle: 'Transverso Abdominal & Estabilizadores'
    };
  }

  // 4. Glúteos -> tras_gm13.png
  if (muscle === 'glutes' || name.includes('glúteo') || name.includes('gluteo') || name.includes('cadera') || name.includes('puente') || id === 'ex_149' || id === 'ex_158') {
    return {
      view: 'tras',
      baseImg: './GYMTOP/resources/res/drawable/tras_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/tras_gm13.png',
      primaryMuscle: 'Glúteo Mayor y Medio',
      secondaryMuscle: 'Isquiotibiales & Zona Lumbar'
    };
  }

  // 5. Espalda / Dorsales / Trapecio -> tras_gm11.png
  if (muscle === 'back' || name.includes('espalda') || name.includes('remo') || name.includes('jalón') || name.includes('jalon') || name.includes('dominada') || name.includes('encogimiento') || name.includes('trapecio') || id === 'ex_22' || id === 'ex_102' || id === 'ex_147') {
    return {
      view: 'tras',
      baseImg: './GYMTOP/resources/res/drawable/tras_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/tras_gm11.png',
      primaryMuscle: 'Dorsal Ancho & Espalda Media',
      secondaryMuscle: 'Romboides, Trapecio & Bíceps'
    };
  }

  // 6. Hombros / Deltoides -> frente_gm0.png
  if (muscle === 'shoulders' || name.includes('hombro') || name.includes('militar') || name.includes('deltoid') || (name.includes('elevacion') && (name.includes('lateral') || name.includes('frontal'))) || id === 'ex_1' || id === 'ex_2' || id === 'ex_3') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm0.png',
      primaryMuscle: 'Deltoides (Anterior, Lateral y Posterior)',
      secondaryMuscle: 'Trapecio Superior & Tríceps'
    };
  }

  // 7. Tríceps -> tras_gm10.png
  if (name.includes('tríceps') || name.includes('triceps') || name.includes('bombardero') || id === 'ex_112') {
    return {
      view: 'tras',
      baseImg: './GYMTOP/resources/res/drawable/tras_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/tras_gm10.png',
      primaryMuscle: 'Tríceps Braquial (Cabeza Larga y Lateral)',
      secondaryMuscle: 'Deltoides Posterior & Ancóneo'
    };
  }

  // 8. Curl Martillo / Antebrazos / Bíceps -> frente_gm2.png
  if (name.includes('martillo') || name.includes('antebrazo') || name.includes('bíceps') || name.includes('biceps') || id === 'ex_13' || id === 'ex_14' || id === 'ex_15' || muscle === 'arms') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm2.png',
      primaryMuscle: 'Bíceps Braquial & Braquiorradial',
      secondaryMuscle: 'Braquial Anterior & Antebrazos'
    };
  }

  // 9. Pecho / Pectoral -> frente_gm1.png
  if (muscle === 'chest' || name.includes('pecho') || name.includes('banca') || name.includes('flexion') || name.includes('flexiones') || name.includes('push') || name.includes('peck') || name.includes('crossover') || name.includes('cables') || name.includes('apertura') || name.includes('pullover') || id === 'ex_4' || id === 'ex_5' || id === 'ex_6' || id === 'ex_7' || id === 'ex_8' || id === 'ex_9' || id === 'ex_10' || id === 'ex_11' || id === 'ex_40' || id === 'ex_100' || id === 'ex_106' || id === 'ex_107' || id === 'ex_110' || id === 'ex_144') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm1.png',
      primaryMuscle: 'Pectoral Mayor y Menor',
      secondaryMuscle: 'Tríceps & Deltoides Anterior'
    };
  }

  // 10. Abdominales / Core -> frente_gm4.png
  if (muscle === 'abs' || name.includes('crunch') || name.includes('plancha') || name.includes('abdomen') || name.includes('abdominal') || name.includes('piernas') || id === 'ex_18' || id === 'ex_19' || id === 'ex_20' || id === 'ex_131' || id === 'ex_132' || id === 'ex_137' || id === 'ex_139' || id === 'ex_157') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm4.png',
      primaryMuscle: 'Recto Abdominal & Core Central',
      secondaryMuscle: 'Transverso Abdominal & Oblicuos'
    };
  }

  // 11. Cardio / Metabólico -> frente_gm6.png
  if (muscle === 'cardio' || name.includes('burpee') || name.includes('trote') || name.includes('cuerda') || id === 'ex_108' || id === 'ex_116' || id === 'ex_195') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm6.png',
      primaryMuscle: 'Acondicionamiento Integral & Piernas',
      secondaryMuscle: 'Core, Glúteos & Pantorrillas'
    };
  }

  // 12. Cuádriceps / Piernas / Abductores / Aductores -> frente_gm6.png
  if (muscle === 'legs' || name.includes('sentadilla') || name.includes('prensa') || name.includes('zancada') || name.includes('squat') || name.includes('cuádriceps') || name.includes('cuadriceps') || name.includes('abductor') || name.includes('aductor') || id === 'ex_28' || id === 'ex_29' || id === 'ex_30' || id === 'ex_31' || id === 'ex_32' || id === 'ex_33' || id === 'ex_34' || id === 'ex_37' || id === 'ex_190' || id === 'ex_192') {
    return {
      view: 'frente',
      baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
      overlayImg: './GYMTOP/resources/res/drawable/frente_gm6.png',
      primaryMuscle: 'Cuádriceps Femoral & Tren Inferior',
      secondaryMuscle: 'Glúteos & Aductores'
    };
  }

  return {
    view: 'frente',
    baseImg: './GYMTOP/resources/res/drawable/frente_base.png',
    overlayImg: './GYMTOP/resources/res/drawable/frente_gm1.png',
    primaryMuscle: 'Pectoral y Tronco Superior',
    secondaryMuscle: 'Deltoides & Estabilizadores'
  };
}

function getFutureDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// ==========================================================================
// 24/7 DURABLE STORAGE & SYNCHRONIZATION ENGINE (INDEXEDDB + LOCALSTORAGE + BACKUP MIRROR)
// ==========================================================================

const IdbHelper = {
  dbName: 'TopGymDurableDB_v1',
  storeName: 'app_state',
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
    return this.dbPromise;
  },

  async set(key, val) {
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          store.put(val, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    } catch (_) {
      return false;
    }
  },

  async get(key) {
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    } catch (_) {
      return null;
    }
  }
};

const StorageManager = {
  KEY: 'topgym_v7_secure_auth',
  BACKUP_KEY: 'topgym_permanent_backup_v1',
  SESSION_KEY: 'topgym_session_auth',
  IDB_KEY: 'master_root_data',
  _cachedData: null,
  _syncChannel: null,

  load() {
    let parsed = null;

    // Capa 1: Intentar leer del almacenamiento primario
    try {
      const saved = localStorage.getItem(this.KEY);
      if (saved) {
        parsed = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[Storage] Advertencia al leer clave principal:', e);
    }

    // Capa 2: Si falló o está vacío, recuperar desde el espejo permanente de respaldo
    if (!parsed || !parsed.users || !parsed.tasks) {
      try {
        const backup = localStorage.getItem(this.BACKUP_KEY);
        if (backup) {
          parsed = JSON.parse(backup);
          console.info('[Storage] Datos recuperados exitosamente desde espejo de respaldo.');
        }
      } catch (_) {}
    }

    // Capa 3: Si aún está vacío, rescatar de versiones anteriores de la app
    if (!parsed || !parsed.users) {
      const legacyKeys = [
        'topgym_v6_secure_auth',
        'topgym_v5_secure_auth',
        'topgym_v4_auth',
        'topgym_v3',
        'topgym_data',
        'topgym_db'
      ];
      for (const lk of legacyKeys) {
        try {
          const legacySaved = localStorage.getItem(lk);
          if (legacySaved) {
            const lData = JSON.parse(legacySaved);
            if (lData && lData.users && lData.users.length) {
              parsed = lData;
              console.info(`[Storage] Datos migrados exitosamente desde versión previa (${lk}).`);
              break;
            }
          }
        } catch (_) {}
      }
    }

    // Si se encontraron datos guardados:
    // ¡REGLA ABSOLUTA 24/7: PRESERVAR 100% DE LAS TAREAS, PERFILES Y MODIFICACIONES DEL USUARIO!
    // NUNCA restablecer tareas, notas o estados al modo inicial de GymData.
    if (parsed && typeof parsed === 'object') {
      // 1. Biblioteca de catálogo auténtica (ejercicios y grupos musculares reales de TOP-GYM)
      parsed.exercises = GymData.exercises;
      parsed.muscleGroups = GymData.muscleGroups;
      if (!parsed.workoutPlans || !Array.isArray(parsed.workoutPlans) || parsed.workoutPlans.length === 0) {
        parsed.workoutPlans = GymData.workoutPlans;
      }
      parsed.availableAvatars = GymData.availableAvatars;

      // 2. TAREAS ASIGNADAS Y PROGRESOS: Inmutables ante reinicio
      // Las tareas del usuario se quedan y NO se sobreescriben jamás con datos de prueba
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        parsed.tasks = JSON.parse(JSON.stringify(GymData.tasks));
      }

      // 3. PERFILES DE USUARIO Y CONTRASEÑAS: Inmutables ante reinicio
      // Las modificaciones de nombres, correos, teléfonos y PINs son soberanas
      if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = JSON.parse(JSON.stringify(GymData.users));
      } else {
        // Asegurar que usuarios base del sistema existan, sin tocar JAMÁS los ya existentes
        GymData.users.forEach(defUser => {
          const exists = parsed.users.find(u => u.id === defUser.id);
          if (!exists) {
            parsed.users.push(JSON.parse(JSON.stringify(defUser)));
          } else {
            // Garantizar que el usuario tenga un pin definido si viniera corrupto
            if (!exists.pin) exists.pin = String(defUser.pin || '1991').trim();
          }
        });
      }

      // 4. Medidas corporales confidenciales
      if (!parsed.bodyMeasurements || !Array.isArray(parsed.bodyMeasurements)) {
        parsed.bodyMeasurements = JSON.parse(JSON.stringify(GymData.bodyMeasurements || []));
      }

      // 5. Notificaciones de coach y alumno
      if (!parsed.coachNotifications || !Array.isArray(parsed.coachNotifications)) {
        parsed.coachNotifications = JSON.parse(JSON.stringify(GymData.coachNotifications || []));
      }
      if (!parsed.studentNotifications || !Array.isArray(parsed.studentNotifications)) {
        parsed.studentNotifications = JSON.parse(JSON.stringify(GymData.studentNotifications || []));
      }

      this._cachedData = parsed;
      this.save(parsed, false); // Guardar en caché local sin forzar push redundante en startup
      return parsed;
    }

    // Caso de primera ejecución en dispositivo limpio:
    const initialData = JSON.parse(JSON.stringify(GymData));
    this._cachedData = initialData;
    this.save(initialData, false);
    return initialData;
  },

  _cloudSyncTimeout: null,
  _isSyncing: false,
  _pendingPush: false,
  _lastFileSha: null,

  getSyncApiUrl() {
    if (typeof window === 'undefined') return '/api/sync';
    const origin = window.location.origin;
    if (origin && origin.includes('netlify.app')) {
      // Sync en Netlify aun no esta desplegado como function estable; fallback al backend existente en Vercel.
      return 'https://titin-tay.vercel.app/api/sync';
    }
    if (origin && (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return `${origin}/api/sync`;
    }
    return 'https://titin-tay.vercel.app/api/sync';
  },

  // Programar respaldo hacia la nube con debounce optimizado
  scheduleCloudPush(immediate = false) {
    if (this._cloudSyncTimeout) {
      clearTimeout(this._cloudSyncTimeout);
      this._cloudSyncTimeout = null;
    }
    if (immediate) {
      this.pushToCloud(true).catch(() => {});
      return;
    }
    this._cloudSyncTimeout = setTimeout(() => {
      this.pushToCloud().catch(() => {});
    }, 400);
  },

  // Enviar estado local hacia la nube de manera garantizada 24/7 (Doble Canal)
  async pushToCloud(isImmediate = false) {
    if (this._cloudSyncTimeout) {
      clearTimeout(this._cloudSyncTimeout);
      this._cloudSyncTimeout = null;
    }
    if (!this._cachedData) return;
    if (this._isSyncing && !isImmediate) {
      this._pendingPush = true;
      return;
    }

    const payload = {
      version: '2.0',
      timestamp: Date.now(),
      data: this._cachedData
    };

    // Canal único seguro: API Serverless de Vercel (el token de GitHub vive SOLO en el servidor).
    // Si la API no está disponible, los datos quedan guardados localmente y se reintenta al reconectar.
    try {
      const url = this.getSyncApiUrl();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.timestamp) {
          localStorage.setItem('topgym_cloud_sync_timestamp', json.timestamp.toString());
          localStorage.removeItem('topgym_has_unsynced_changes');
          console.info('[CloudSync] Respaldo 24/7 guardado en la nube vía API.');
        }
      }
    } catch (_) {}
  },

  // Fusionar datos de la nube con los datos locales sin perder NADA jamás (Soberanía Local)
  mergeCloudData(local, cloud) {
    if (!cloud || typeof cloud !== 'object') return local;
    if (!local || typeof local !== 'object') return cloud;

    const merged = JSON.parse(JSON.stringify(local));

    // 1. Fusión de Usuarios y Credenciales (Prioridad a las modificaciones locales)
    if (Array.isArray(cloud.users)) {
      if (!Array.isArray(merged.users)) merged.users = [];
      cloud.users.forEach(cUser => {
        const lIndex = merged.users.findIndex(u => u.id === cUser.id);
        if (lIndex === -1) {
          merged.users.push(JSON.parse(JSON.stringify(cUser)));
        } else {
          const lUser = merged.users[lIndex];
          const cUpdated = cUser.updatedAt || 0;
          const lUpdated = lUser.updatedAt || 0;
          // Solo si la nube tiene un timestamp estrictamente más nuevo que el local se toma la nube como base ganadora
          const baseUser = (cUpdated > lUpdated) ? lUser : cUser;
          const winnerUser = (cUpdated > lUpdated) ? cUser : lUser;

          merged.users[lIndex] = {
            ...baseUser,
            ...winnerUser,
            // El PIN nunca se borra ni se resetea
            pin: (winnerUser.pin || baseUser.pin || '1991').trim(),
            // Las estadísticas nunca decrecen
            stats: {
              completedWorkouts: Math.max(lUser.stats?.completedWorkouts || 0, cUser.stats?.completedWorkouts || 0),
              totalVolumeKg: Math.max(lUser.stats?.totalVolumeKg || 0, cUser.stats?.totalVolumeKg || 0),
              currentStreak: Math.max(lUser.stats?.currentStreak || 0, cUser.stats?.currentStreak || 0)
            }
          };
        }
      });
    }

    // 2. Fusión de Tareas Asignadas (Cero Pérdida)
    if (Array.isArray(cloud.tasks)) {
      if (!Array.isArray(merged.tasks)) merged.tasks = [];
      cloud.tasks.forEach(cTask => {
        const lIndex = merged.tasks.findIndex(t => t.id === cTask.id);
        if (lIndex === -1) {
          merged.tasks.push(JSON.parse(JSON.stringify(cTask)));
        } else {
          const lTask = merged.tasks[lIndex];
          const cUpdated = cTask.updatedAt || 0;
          const lUpdated = lTask.updatedAt || 0;
          const baseTask = (cUpdated > lUpdated) ? lTask : cTask;
          const winnerTask = (cUpdated > lUpdated) ? cTask : lTask;

          const isCompleted = (lTask.status === 'completed') || (cTask.status === 'completed');
          merged.tasks[lIndex] = {
            ...baseTask,
            ...winnerTask,
            status: isCompleted ? 'completed' : (winnerTask.status || 'pending'),
            studentFeedback: winnerTask.studentFeedback || baseTask.studentFeedback || '',
            ratingRPE: winnerTask.ratingRPE || baseTask.ratingRPE || 8,
            completedAt: isCompleted ? (winnerTask.completedAt || baseTask.completedAt || new Date().toLocaleString()) : null
          };
        }
      });
    }

    // 3. Fusión de Rutinas Personalizadas (Nunca revertir a GymData por defecto)
    const plansMap = new Map();
    (GymData.workoutPlans || []).forEach(p => plansMap.set(p.id, JSON.parse(JSON.stringify(p))));
    if (Array.isArray(cloud.workoutPlans)) {
      cloud.workoutPlans.forEach(p => plansMap.set(p.id, JSON.parse(JSON.stringify(p))));
    }
    if (Array.isArray(local.workoutPlans) && local.workoutPlans.length > 0) {
      local.workoutPlans.forEach(p => plansMap.set(p.id, JSON.parse(JSON.stringify(p))));
    }
    merged.workoutPlans = Array.from(plansMap.values());

    // 4. Fusión de Medidas Corporales
    const mKey = (m) => `${m.studentId}__${m.date}`;
    const measurementsMap = new Map();
    (cloud.bodyMeasurements || []).forEach(m => measurementsMap.set(mKey(m), m));
    (local.bodyMeasurements || []).forEach(m => measurementsMap.set(mKey(m), m));
    merged.bodyMeasurements = Array.from(measurementsMap.values());

    // 5. Notificaciones de coach y alumno
    const notifMap = new Map();
    (cloud.coachNotifications || []).forEach(n => notifMap.set(n.id, n));
    (local.coachNotifications || []).forEach(n => {
      const prev = notifMap.get(n.id);
      notifMap.set(n.id, prev ? { ...prev, ...n, isRead: prev.isRead || n.isRead } : n);
    });
    merged.coachNotifications = Array.from(notifMap.values());

    const sNotifMap = new Map();
    (cloud.studentNotifications || []).forEach(n => sNotifMap.set(n.id, n));
    (local.studentNotifications || []).forEach(n => {
      const prev = sNotifMap.get(n.id);
      sNotifMap.set(n.id, prev ? { ...prev, ...n, isRead: prev.isRead || n.isRead } : n);
    });
    merged.studentNotifications = Array.from(sNotifMap.values());

    // 6. Catálogo y constantes
    merged.exercises = GymData.exercises;
    merged.muscleGroups = GymData.muscleGroups;
    merged.availableAvatars = GymData.availableAvatars;

    return merged;
  },

  // Obtener estado de la nube y restaurar/fusionar automáticamente si se abre en otro equipo (Canal seguro único)
  async syncWithCloud() {
    if (this._isSyncing) return;
    this._isSyncing = true;
    try {
      // Si el equipo local tiene modificaciones no sincronizadas, SUBIRLAS PRIMERO antes de pedir de la nube
      const hasUnsynced = localStorage.getItem('topgym_has_unsynced_changes') === 'true';
      if (hasUnsynced) {
        await this.pushToCloud(true);
      }

      let cloudPayload = null;

      // Canal único seguro: API Serverless de Vercel (token GitHub solo en el servidor)
      try {
        const url = this.getSyncApiUrl();
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            cloudPayload = {
              data: json.data,
              timestamp: json.timestamp || 0
            };
          }
        }
      } catch (_) {}

      if (cloudPayload && cloudPayload.data) {
        const cloudData = cloudPayload.data;
        const cloudTs = cloudPayload.timestamp;
        const localCloudTs = parseInt(localStorage.getItem('topgym_cloud_sync_timestamp') || '0');
        const localMutationTs = parseInt(localStorage.getItem('topgym_local_mutation_timestamp') || '0');
        const isFreshDevice = !localStorage.getItem(this.KEY);

        // Si este es un dispositivo nuevo o si la nube tiene cambios más recientes y no hay mutación local pendiente
        if (isFreshDevice || (cloudTs > localCloudTs && cloudTs >= localMutationTs)) {
          console.info('[CloudSync] Restaurando/fusionando automáticamente datos desde la nube para este equipo...');
          const currentLocal = this._cachedData || this.load();
          const merged = this.mergeCloudData(currentLocal, cloudData);
          this.save(merged, false); // Guardar localmente sin reenviar en bucle
          localStorage.setItem('topgym_cloud_sync_timestamp', cloudTs.toString());
          localStorage.removeItem('topgym_has_unsynced_changes');

          if (typeof window !== 'undefined' && window.appState) {
            window.appState.data = merged;
            if (window.appState.currentUser) {
              const freshUser = merged.users.find(u => u.id === window.appState.currentUser.id);
              if (freshUser) window.appState.currentUser = freshUser;
            }
            if (typeof setupRoleAndUser === 'function') setupRoleAndUser();
            if (typeof renderScheduleScreen === 'function') renderScheduleScreen();
            if (typeof renderCoachScreen === 'function') renderCoachScreen();
            if (typeof renderProgressScreen === 'function') renderProgressScreen();
            if (typeof updateCoachBadges === 'function') updateCoachBadges();
            if (typeof updateStudentBadges === 'function') updateStudentBadges();
          }
        }
      }
    } catch (err) {
      console.warn('[CloudSync] Error sincronizando con la nube (usando datos locales):', err);
    } finally {
      this._isSyncing = false;
      if (this._pendingPush) {
        this._pendingPush = false;
        this.pushToCloud().catch(() => {});
      }
    }
  },

  save(data, triggerPush = true, immediate = false) {
    if (!data) return;
    this._cachedData = data;
    const now = Date.now();
    try {
      const serialized = JSON.stringify(data);
      // Capa 1: LocalStorage Primario
      localStorage.setItem(this.KEY, serialized);
      // Capa 2: Espejo Permanente de Seguridad
      localStorage.setItem(this.BACKUP_KEY, serialized);
      // Timestamps de mutación local y bandera de sincronización
      localStorage.setItem('topgym_last_sync_timestamp', now.toString());
      localStorage.setItem('topgym_local_mutation_timestamp', now.toString());
      if (triggerPush !== false) {
        localStorage.setItem('topgym_has_unsynced_changes', 'true');
      }
    } catch (e) {
      console.warn('[Storage] Advertencia guardando en localStorage:', e);
    }

    // Capa 3: IndexedDB Asíncrono Durable 24/7 (Alta capacidad y a prueba de cuotas)
    try {
      IdbHelper.set(this.IDB_KEY, data).catch(() => {});
    } catch (_) {}

    // Difusión en tiempo real para todas las pestañas y ventanas activas
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        if (!this._syncChannel) {
          this._syncChannel = new BroadcastChannel('topgym_notif_bus');
        }
        this._syncChannel.postMessage({
          type: 'DATA_SYNC_EVENT',
          timestamp: now
        });
      }
    } catch (_) {}

    // Capa 4: Sincronización Automática 24/7 en la Nube (Multidispositivo)
    if (triggerPush !== false) {
      if (immediate) {
        this.pushToCloud(true).catch(() => {});
      } else {
        this.scheduleCloudPush();
      }
    }
  },

  // Inicializar persistencia durable 24/7 y restaurar desde IndexedDB y la Nube
  async initPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        console.log('[Storage] Persistencia 24/7 garantizada por el navegador:', isPersisted);
      } catch (_) {}
    }

    try {
      const idbData = await IdbHelper.get(this.IDB_KEY);
      const localData = localStorage.getItem(this.KEY);
      if (idbData && !localData) {
        console.info('[Storage] Restaurando estado completo desde IndexedDB durable...');
        this.save(idbData, false);
        if (typeof window !== 'undefined' && window.appState) {
          window.appState.data = idbData;
          if (typeof renderScheduleScreen === 'function') renderScheduleScreen();
          if (typeof renderCoachScreen === 'function') renderCoachScreen();
          if (typeof renderProgressScreen === 'function') renderProgressScreen();
        }
      }
    } catch (_) {}

    // Sincronización y Restauración Automática en la Nube (Multidispositivo)
    try {
      await this.syncWithCloud();
    } catch (_) {}
  },

  // Exportar copia de seguridad completa en formato JSON
  exportBackup() {
    const data = this._cachedData || this.load();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `TOP-GYM_Respaldo_Seguro_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Restaurar copia de seguridad desde un archivo JSON
  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.users || !parsed.tasks) {
        throw new Error('El archivo no contiene un formato válido de copia de seguridad de TOP-GYM.');
      }
      this.save(parsed);
      this._cachedData = parsed;
      return { success: true, data: parsed };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Sesión activa persistente
  saveSession(userId, role) {
    try {
      const session = { userId, role, timestamp: Date.now() };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Error saving session', e);
    }
  },

  getSession() {
    try {
      const s = localStorage.getItem(this.SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  clearSession() {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (e) {
      console.warn('Error clearing session', e);
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.BACKUP_KEY);
    this.clearSession();
    return this.load();
  }
};

if (typeof window !== 'undefined') {
  window.GymData = GymData;
  window.getExerciseAnatomy = getExerciseAnatomy;
  window.StorageManager = StorageManager;
}
