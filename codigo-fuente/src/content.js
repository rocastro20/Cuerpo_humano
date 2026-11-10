/*
 * ─────────────────────────────────────────────────────────────────────
 *  CUERPO ADENTRO · De la arepa al gol
 *  Todo el contenido editable del recurso vive en este archivo.
 *  Cambie textos, nombres, colores, preguntas o fuentes aquí y vuelva a
 *  construir con `npm run build`. No hace falta tocar el resto del código.
 * ─────────────────────────────────────────────────────────────────────
 */

export const proyecto = {
  titulo: 'Cuerpo adentro',
  subtitulo: 'De la arepa al gol',
  descripcion:
    'Un viaje interactivo por cinco sistemas del cuerpo humano para estudiantes de grados 6.° y 7.°.',
  institucion: 'Colegio Universidad Libre',
  unidad: 'Ciencias Naturales y Biología · Grados 6.° y 7.°',
  // Ruta o data-URI del logo oficial. Vacío = se muestra el nombre en texto.
  // Ver LEEME.md, sección «Cómo agregar el logo».
  logo: '',
  equipo: [
    { nombre: 'Rodrigo Castro', rol: 'Desarrollador Web' },
    { nombre: 'Oscar Espitia', rol: 'Diseñador Instruccional' },
  ],
  duracionMinutos: 10,
  // Pulso de referencia para el indicador en vivo cuando el estudiante
  // aún no ha medido el suyo: punto medio del rango 60–100 lpm (6–12 años).
  pulsoReferencia: 80,
};

/* Paleta: un acento por sistema sobre tinta morada profunda. */
export const colores = {
  fondo: '#120D24',
  tinta: '#F4F0FF',
  tintaSuave: '#C9C0E6',
  digerir: '#FFC94A',
  respirar: '#45D6DE',
  latir: '#FF6B66',
  sentir: '#B49BFF',
  mover: '#7EE5A0',
  intro: '#FFD98A',
  final: '#FFFFFF',
};

/* ───────────────────────────── Introducción ───────────────────────── */
export const introduccion = {
  id: 'inicio',
  verbo: 'adentro',
  color: colores.intro,
  gancho: 'Desde que abriste esta página, tu corazón ya latió',
  ganchoNota: 'Estimación con tu pulso o, si aún no lo mides, con 80 latidos por minuto.',
  titulo: 'Cuerpo adentro',
  bajada: '¿Cómo se convierte una arepa en un gol? Hoy lo descubrimos siguiendo a Sofía por dentro.',
  objetivos: [
    'Explicar cómo cinco sistemas trabajan juntos para convertir la comida en movimiento.',
    'Medir tu propio cuerpo con un reloj y una fórmula: pulso, respiración y reacción.',
    'Reconocer cómo usan la ciencia algunas profesiones de la salud.',
  ],
  reto: {
    pregunta: '¿Cuántos metros crees que mide el intestino delgado de una persona adulta?',
    min: 1,
    max: 12,
    paso: 0.5,
    inicial: 3,
    unidad: 'm',
    respuesta: 6.7,
    revelacion:
      'En un adulto mide unos 6,7 metros (22 pies). Va doblado para caber en la barriga.',
  },
  narracion:
    'Mientras lees esta frase, dentro de ti pasa algo increíble. Tu corazón empuja sangre, tus pulmones cambian el aire y tu cerebro decide qué mirar. Nadie te lo pidió: tu cuerpo lo hace solo. ' +
    'Hoy vamos a seguir a Sofía. Tiene once años, estudia en sexto y el miércoles juega un partido en el descanso. Esa mañana desayunó una arepa. Esta es la pregunta del viaje: ¿cómo se convierte una arepa en un gol? ' +
    'Para responderla vamos a entrar en su cuerpo y visitar cinco sistemas. En cada parada te espera una persona que trabaja en salud y que ayudó a Sofía ese día. ' +
    'Al final podrás hacer tres cosas. Primero, explicar cómo cinco sistemas trabajan juntos para convertir comida en movimiento. Segundo, medir tu propio cuerpo con un reloj y una fórmula. Tercero, conocer cómo usan la ciencia algunas profesiones de la salud. ' +
    'Antes de entrar, un primer reto. El intestino delgado es un tubo que va doblado dentro de la barriga. ¿Cuántos metros crees que mide en una persona adulta? Mueve el control, deja tu respuesta y la descubrimos en la primera parada.',
};

/* ───────────────────────────── Paradas ───────────────────────────── */
export const paradas = [
  {
    id: 'digerir',
    numero: 1,
    verbo: 'digerir',
    sistema: 'Sistema digestivo',
    color: colores.digerir,
    hora: '10:00 a. m. · Salón de clase',
    profesional: {
      nombre: 'Laura Méndez',
      oficio: 'Nutricionista',
      retrato: 'laura',
      caso:
        'Sofía no desayunó y a las diez no logra concentrarse. ¿Qué desayuno le da energía para toda la mañana y para el partido?',
    },
    conexion: [
      { area: 'Matemáticas', texto: 'Multiplicación y suma de cantidades con unidades (gramos y kilocalorías).' },
      { area: 'Ciencias Naturales', texto: 'Mecanismos de obtención de energía en los seres vivos: los nutrientes.' },
    ],
    narracion:
      'Primera parada: digerir. Son las diez de la mañana y Sofía no logra concentrarse en clase. Le cuenta a Laura Méndez, la nutricionista, que hoy no alcanzó a desayunar. Laura le explica algo clave: la comida no solo quita el hambre, es combustible. ' +
      'Cuando muerdes una arepa, los dientes la parten y la saliva empieza a desarmarla. El estómago la mezcla con jugos y la vuelve una papilla. Después llega el protagonista: el intestino delgado. ¿Recuerdas el reto? En un adulto mide unos seis metros con setenta. Va enrollado para caber en la barriga, y la comida puede pasar hasta seis horas recorriéndolo. Ahí los nutrientes atraviesan la pared del intestino y entran a la sangre. Esa pared está llena de pliegues diminutos que, como una toalla, aumentan el espacio para absorber. ' +
      'Los nutrientes que dan energía son tres: carbohidratos, proteínas y grasas. Y aquí entra la matemática. Cada gramo de carbohidrato da unas cuatro kilocalorías, cada gramo de proteína otras cuatro, y cada gramo de grasa da nueve. Con esa regla, que usa la FAO, puedes calcular la energía de cualquier desayuno. ' +
      'Prueba el simulador: arma el desayuno de Sofía y mira cuánta energía le das. Laura no busca el número más alto, sino un desayuno que combine los tres nutrientes.',
    fichas: [
      { dato: '≈ 6,7 m', texto: 'largo del intestino delgado en un adulto', fuente: 'cleveland-intestino' },
      { dato: 'hasta 6 h', texto: 'puede pasar la comida en el intestino delgado', fuente: 'cleveland-intestino' },
      { dato: '4 · 4 · 9', texto: 'kcal por gramo de carbohidrato, proteína y grasa', fuente: 'fao-atwater' },
    ],
    simulador: {
      tipo: 'energia',
      titulo: 'Arma el desayuno de Sofía',
      formula: 'E = 4·C + 4·P + 9·G',
      leyenda: 'E: energía en kilocalorías · C, P, G: gramos de carbohidratos, proteínas y grasas',
      controles: [
        { id: 'C', etiqueta: 'Carbohidratos', unidad: 'g', min: 0, max: 120, paso: 1, inicial: 45 },
        { id: 'P', etiqueta: 'Proteínas', unidad: 'g', min: 0, max: 50, paso: 1, inicial: 12 },
        { id: 'G', etiqueta: 'Grasas', unidad: 'g', min: 0, max: 40, paso: 1, inicial: 10 },
      ],
      nota: 'Los gramos son valores de práctica para experimentar, no una recomendación nutricional.',
    },
  },
  {
    id: 'respirar',
    numero: 2,
    verbo: 'respirar',
    sistema: 'Sistema respiratorio',
    color: colores.respirar,
    hora: '11:30 a. m. · Clase de educación física',
    profesional: {
      nombre: 'Andrés Rojas',
      oficio: 'Terapeuta respiratorio',
      retrato: 'andres',
      caso:
        'Sofía calienta trotando y empieza a jadear. Se asusta un poco. ¿Por qué respiramos más rápido cuando corremos?',
    },
    conexion: [
      { area: 'Matemáticas', texto: 'Multiplicar por 2 y por 1 440: pasar de 30 segundos a un minuto y a un día.' },
      { area: 'Ciencias Naturales', texto: 'Relación entre sistemas de órganos: el oxígeno que entra se usa en las células.' },
    ],
    narracion:
      'Segunda parada: respirar. En educación física, Sofía calienta trotando alrededor de la cancha y empieza a jadear. Se asusta un poco y busca a Andrés Rojas, terapeuta respiratorio. ' +
      'Andrés le explica que la energía de la arepa no sirve sola. Para soltarla, las células necesitan oxígeno, y el oxígeno entra por la nariz y la boca. El aire baja por la tráquea, que se divide en dos bronquios, y estos se ramifican como un árbol al revés hasta terminar en bolsitas diminutas llamadas alvéolos. Alrededor de cada alvéolo hay vasos sanguíneos muy delgados: por ahí el oxígeno pasa a la sangre y sale el dióxido de carbono que luego expulsas. Mientras tanto, el diafragma, un músculo debajo de los pulmones, baja para que entre el aire y sube para sacarlo. ' +
      'Cuando corres, los músculos piden más oxígeno; por eso respiras más rápido. Jadear después de correr es normal: es tu cuerpo trabajando. ' +
      'Andrés propone un experimento. Cuenta cuántas veces respiras en treinta segundos y multiplica por dos: esa es tu frecuencia respiratoria. En niños de seis a doce años, en reposo, suele estar entre catorce y veintidós respiraciones por minuto, aunque las tablas cambian según la fuente. Luego multiplica por mil cuatrocientos cuarenta, los minutos de un día, y descubre cuántas veces respiras sin darte cuenta.',
    fichas: [
      { dato: '14–22', texto: 'respiraciones por minuto en reposo, de 6 a 12 años', fuente: 'cleveland-vitales' },
      { dato: '1 440', texto: 'minutos tiene un día: la clave del cálculo', fuente: null },
      { dato: 'alvéolos', texto: 'donde el oxígeno pasa del aire a la sangre', fuente: null },
    ],
    simulador: {
      tipo: 'respiracion',
      titulo: 'Cuenta tus respiraciones',
      formula: 'FR = respiraciones en 30 s × 2   ·   al día = FR × 1 440',
      leyenda: 'FR: frecuencia respiratoria en respiraciones por minuto',
      segundos: 30,
      rangoReposo: [14, 22],
      inicial: 18,
      nota: 'Cuenta en reposo y otra vez después de saltar 20 veces. Compara.',
    },
  },
  {
    id: 'latir',
    numero: 3,
    verbo: 'latir',
    sistema: 'Sistema circulatorio',
    color: colores.latir,
    hora: '12:15 p. m. · Primer tiempo del partido',
    profesional: {
      nombre: 'Valentina Ospina',
      oficio: 'Médica del deporte',
      retrato: 'valentina',
      caso:
        'Sofía siente el corazón golpeándole el pecho después de correr. ¿Es peligroso que lata tan rápido?',
    },
    conexion: [
      { area: 'Matemáticas', texto: 'Multiplicar por 4, restar y calcular porcentajes.' },
      { area: 'Ciencias Naturales', texto: 'El corazón como bomba: une la respiración con la digestión.' },
    ],
    narracion:
      'Tercera parada: latir. En el partido, Sofía corre detrás del balón y siente el corazón golpeándole el pecho. Al terminar el primer tiempo le pregunta a Valentina Ospina, médica del deporte, si eso es peligroso. ' +
      'Valentina le cuenta que el corazón es un músculo que funciona como una bomba doble. El lado derecho envía la sangre a los pulmones para recoger oxígeno. El lado izquierdo la recibe y la empuja con fuerza por las arterias a todo el cuerpo, hasta los músculos de las piernas. Así viajan juntos el oxígeno de la parada anterior y la energía de la arepa. ' +
      'Cuando corres, el corazón late más rápido para que la sangre llegue más veces por minuto. En reposo, el de un niño de seis a doce años suele latir entre sesenta y cien veces por minuto. ' +
      'Ahora mídete. Pon dos dedos en la muñeca o a un lado del cuello, cuenta los latidos durante quince segundos y multiplica por cuatro. Para saber qué tan fuerte trabajas, se usa una estimación: doscientos veinte menos tu edad da tu frecuencia máxima aproximada. Valentina le dice a Sofía que su corazón acelerado es entrenamiento, no peligro. Y si algún día sientes dolor en el pecho o te mareas, avisa enseguida a un adulto.',
    fichas: [
      { dato: '60–100', texto: 'latidos por minuto en reposo, de 6 a 12 años', fuente: 'cleveland-vitales' },
      { dato: '220 − edad', texto: 'estimación de la frecuencia cardiaca máxima', fuente: 'cdc-fc' },
      { dato: '70–85 %', texto: 'de la máxima: actividad vigorosa', fuente: 'cdc-fc' },
    ],
    simulador: {
      tipo: 'pulso',
      titulo: 'Tómate el pulso',
      formula: 'lpm = latidos en 15 s × 4   ·   FCmáx ≈ 220 − edad',
      leyenda: 'lpm: latidos por minuto · FCmáx: frecuencia cardiaca máxima estimada',
      segundos: 15,
      edadInicial: 11,
      latidosIniciales: 20,
      zonas: [
        { hasta: 50, nombre: 'reposo o actividad suave', tono: 'calma' },
        { hasta: 70, nombre: 'actividad moderada', tono: 'media' },
        { hasta: 85, nombre: 'actividad vigorosa', tono: 'alta' },
        { hasta: 999, nombre: 'por encima de la zona vigorosa: baja el ritmo', tono: 'alerta' },
      ],
      nota: 'Escucha: el sonido late al ritmo que calculaste. Es sonificación de tus datos.',
    },
    video: true,
  },
  {
    id: 'sentir',
    numero: 4,
    verbo: 'sentir',
    sistema: 'Sistema nervioso',
    color: colores.sentir,
    hora: '12:40 p. m. · Segundo tiempo, Sofía tapa',
    profesional: {
      nombre: 'Catalina Herrera',
      oficio: 'Neuróloga pediatra',
      retrato: 'catalina',
      caso:
        'A Sofía le toca tapar. El balón viene y en menos de un segundo tiene que verlo, decidir y lanzarse. ¿Cómo lo logra su cuerpo?',
    },
    conexion: [
      { area: 'Matemáticas', texto: 'Distancia = velocidad × tiempo, con milisegundos y metros por segundo.' },
      { area: 'Ciencias Naturales', texto: 'La neurona como célula especializada y la coordinación entre sistemas.' },
    ],
    narracion:
      'Cuarta parada: sentir. En el segundo tiempo a Sofía le toca tapar. El balón viene hacia ella y en menos de un segundo tiene que verlo, decidir y lanzarse. Se lo explica Catalina Herrera, neuróloga pediatra. ' +
      'Los ojos ven el balón y envían un mensaje eléctrico al cerebro. El cerebro compara, decide «a la izquierda» y manda una orden por la médula espinal y los nervios hasta los músculos. Todo viaja por neuronas, células largas que se pasan señales eléctricas y químicas. Cada neurona recibe mensajes por ramas cortas y los envía por una prolongación larga llamada axón. ' +
      'Algunas fibras nerviosas están cubiertas por una capa llamada mielina, como el forro de un cable. En las fibras más gruesas con mielina, la señal puede viajar a más de cien metros por segundo. En fibras sin mielina, apenas a un metro por segundo: la velocidad de caminar. ' +
      'Catalina le propone un juego para medir su tiempo de reacción. Cuando el balón cambie de color, toca lo más rápido que puedas. Luego calcularás con la fórmula distancia igual a velocidad por tiempo cuánto avanzó el balón mientras reaccionabas y cuánto tardó el mensaje en bajar por tus nervios. Te vas a sorprender: casi todo el tiempo lo usa tu cerebro pensando, no el cable viajando.',
    fichas: [
      { dato: '> 100 m/s', texto: 'en las fibras nerviosas más gruesas con mielina', fuente: 'umn-mielina' },
      { dato: '≈ 1 m/s', texto: 'en fibras sin mielina: velocidad de caminar', fuente: 'umn-mielina' },
      { dato: 'neurona', texto: 'célula que transmite señales eléctricas y químicas', fuente: null },
    ],
    simulador: {
      tipo: 'reaccion',
      titulo: 'Ataja como Sofía',
      formula: 'd = v × t',
      leyenda: 'd: distancia en metros · v: velocidad en m/s · t: tiempo en segundos',
      velocidadNervio: 100,
      velocidadBalonInicial: 15,
      estaturaInicial: 1.45,
      nota: 'Haz tres intentos: se guarda el mejor.',
    },
  },
  {
    id: 'mover',
    numero: 5,
    verbo: 'mover',
    sistema: 'Sistema locomotor',
    color: colores.mover,
    hora: '4:30 p. m. · Camino a casa',
    profesional: {
      nombre: 'Julián Pardo',
      oficio: 'Fisioterapeuta',
      retrato: 'julian',
      caso:
        'Sofía metió el gol, pero de regreso a casa con la maleta le duele la espalda. ¿Cuánto peso puede cargar sin lastimarse?',
    },
    conexion: [
      { area: 'Matemáticas', texto: 'Porcentajes y razones: parte ÷ todo × 100.' },
      { area: 'Ciencias Naturales', texto: 'Huesos, músculos y articulaciones como sistema; la columna protege la médula.' },
    ],
    narracion:
      'Quinta parada: mover. Sofía remata y la pelota entra. Pero esa tarde, camino a casa con la maleta, le duele la espalda. Lo consulta con Julián Pardo, fisioterapeuta. Ese día llevaba cuadernos, lonchera y el uniforme de educación física. ' +
      'Julián le explica que moverse es trabajo en equipo entre huesos, músculos y articulaciones. Los huesos son la estructura: un adulto tiene doscientos seis, y un bebé nace con muchos más, porque varios se unen al crecer. Los músculos tiran de los huesos, y las articulaciones, como la rodilla, les permiten doblarse. Para patear, el cerebro ordenó, la sangre llevó oxígeno y energía, y los músculos de la pierna se contrajeron. ' +
      'En el centro está la columna vertebral: una pila de vértebras que protege la médula espinal y te sostiene. Si cargas demasiado peso en la espalda, el cuerpo se inclina para compensar y los músculos se cansan. ' +
      'Por eso Julián pregunta: ¿cuánto pesa tu maleta comparada con tu cuerpo? Médicos y fisioterapeutas recomiendan no cargar más del diez al veinte por ciento de tu peso. Calcúlalo: divide el peso de la maleta entre tu peso y multiplica por cien. Y sigue sus consejos: usa las dos correas, ajústala al centro de la espalda y levántala doblando las rodillas.',
    fichas: [
      { dato: '206', texto: 'huesos en un adulto; al nacer hay muchos más', fuente: 'acibadem-huesos' },
      { dato: '10–20 %', texto: 'del peso corporal: máximo recomendado para la maleta', fuente: 'kidshealth-maleta' },
      { dato: '2 correas', texto: 'reparten el peso; una sola carga un lado', fuente: 'kidshealth-maleta' },
    ],
    simulador: {
      tipo: 'maleta',
      titulo: 'Pesa tu maleta',
      formula: '% = maleta ÷ peso corporal × 100',
      leyenda: 'Usa una balanza en casa. Ambos pesos en kilogramos.',
      peso: { min: 25, max: 70, paso: 1, inicial: 40 },
      maleta: { min: 0.5, max: 14, paso: 0.5, inicial: 5 },
      limites: [10, 20],
      nota: 'Verde: hasta 10 %. Ámbar: entre 10 y 20 %. Rojo: más de 20 %.',
    },
  },
];

/* ───────────────────────────── Conclusión ─────────────────────────── */
export const conclusion = {
  id: 'final',
  verbo: 'gol',
  color: colores.final,
  titulo: 'Cinco sistemas, un gol',
  cadena: [
    { verbo: 'digerir', texto: 'desarmó la arepa en nutrientes y los pasó a la sangre' },
    { verbo: 'respirar', texto: 'metió el oxígeno que las células necesitan' },
    { verbo: 'latir', texto: 'llevó nutrientes y oxígeno hasta los músculos' },
    { verbo: 'sentir', texto: 'vio el balón, decidió y dio la orden' },
    { verbo: 'mover', texto: 'huesos y músculos hicieron el remate' },
  ],
  ideas: [
    { titulo: 'Tu cuerpo es un equipo', texto: 'Ningún sistema trabaja solo: la arepa se volvió gol gracias a los cinco.' },
    { titulo: 'Tu cuerpo se puede medir', texto: 'Con un reloj y una fórmula sabes cómo están tu corazón y tu respiración.' },
    { titulo: 'Cuidarlo es una decisión diaria', texto: 'Desayunar, moverte y cargar bien la maleta son decisiones de todos los días.' },
  ],
  pregunta: '¿Qué decisión vas a tomar mañana para que tu cuerpo juegue mejor?',
  cierre:
    'Sofía metió el gol, pero no lo metió sola. Lo metieron sus cinco sistemas, trabajando juntos sin que ella se diera cuenta. Igual que el tuyo, ahora mismo, mientras lees.',
  narracion:
    'Volvamos al principio. ¿Cómo se convirtió una arepa en un gol? ' +
    'El sistema digestivo desarmó la arepa en nutrientes y los pasó a la sangre. El sistema respiratorio metió el oxígeno que las células necesitaban para soltar esa energía. El corazón llevó las dos cosas hasta los músculos. El sistema nervioso vio el balón, decidió y dio la orden. Y huesos y músculos hicieron el remate. ' +
    'Llévate tres ideas. Primera: ningún sistema trabaja solo; tu cuerpo es un equipo. Segunda: tu cuerpo se puede medir; con un reloj y una fórmula sabes cómo están tu corazón y tu respiración. Tercera: cuidarlo es una decisión de todos los días: desayunar, moverte y cargar bien la maleta. ' +
    'Ahora una pregunta para pensar, sin respuesta correcta: ¿qué decisión vas a tomar mañana para que tu cuerpo juegue mejor? ' +
    'Sofía metió el gol, pero no lo metió sola. Lo metieron sus cinco sistemas, trabajando juntos sin que ella se diera cuenta. Igual que el tuyo, ahora mismo, mientras lees. Gracias por hacer este viaje. Pon a prueba lo que aprendiste en el quiz y reclama tu certificado.',
};

/* ───────────────────────────── Quiz (8 preguntas) ─────────────────── */
export const quiz = [
  {
    pregunta: '¿Qué sistema convierte la arepa en nutrientes que pasan a la sangre?',
    opciones: ['El sistema respiratorio', 'El sistema digestivo', 'El sistema nervioso', 'El sistema locomotor'],
    correcta: 1,
    explicacion:
      'El sistema digestivo desarma los alimentos. En el intestino delgado los nutrientes atraviesan la pared y entran a la sangre.',
  },
  {
    pregunta: 'Un desayuno tiene 40 g de carbohidratos, 10 g de proteínas y 10 g de grasas. ¿Cuánta energía aporta?',
    opciones: ['230 kcal', '290 kcal', '360 kcal', '600 kcal'],
    correcta: 1,
    explicacion: 'E = 4·40 + 4·10 + 9·10 = 160 + 40 + 90 = 290 kcal. Las grasas dan 9 kcal por gramo; los otros dos, 4.',
  },
  {
    pregunta: '¿En qué parte pasa el oxígeno del aire a la sangre?',
    opciones: ['En la tráquea', 'En los alvéolos', 'En el estómago', 'En la médula espinal'],
    correcta: 1,
    explicacion:
      'Los alvéolos son bolsitas al final de los bronquios, rodeadas de vasos sanguíneos muy delgados. Ahí ocurre el intercambio de gases.',
  },
  {
    pregunta: 'Contaste 22 latidos en 15 segundos. ¿Cuál es tu frecuencia cardiaca?',
    opciones: ['37 lpm', '66 lpm', '88 lpm', '110 lpm'],
    correcta: 2,
    explicacion: 'Un minuto tiene cuatro veces 15 segundos: 22 × 4 = 88 latidos por minuto.',
  },
  {
    pregunta: 'Con la estimación «220 menos la edad», ¿cuál es la frecuencia máxima aproximada de alguien de 11 años?',
    opciones: ['189 lpm', '209 lpm', '211 lpm', '231 lpm'],
    correcta: 1,
    explicacion: '220 − 11 = 209 latidos por minuto. Es una estimación general, no una medida exacta para cada persona.',
  },
  {
    pregunta: '¿Para qué sirve la mielina que cubre algunas fibras nerviosas?',
    opciones: [
      'Para que la señal viaje más rápido',
      'Para digerir las grasas',
      'Para bombear la sangre',
      'Para unir los huesos',
    ],
    correcta: 0,
    explicacion:
      'La mielina funciona como el forro de un cable: en las fibras gruesas con mielina la señal supera los 100 m/s; sin ella, va a cerca de 1 m/s.',
  },
  {
    pregunta: 'Sofía pesa 40 kg y su maleta 6 kg. ¿Qué porcentaje de su peso carga?',
    opciones: ['6 %', '15 %', '24 %', '40 %'],
    correcta: 1,
    explicacion:
      '6 ÷ 40 × 100 = 15 %. Está dentro del rango de 10 a 20 % que se recomienda no superar; mejor acercarse al 10 %.',
  },
  {
    pregunta: '¿Qué idea resume mejor el viaje de la arepa al gol?',
    opciones: [
      'Cada sistema trabaja por su cuenta, sin depender de los demás',
      'Solo el corazón importa, porque mueve la sangre',
      'Los sistemas trabajan en equipo: energía, oxígeno, transporte, órdenes y movimiento',
      'El gol depende únicamente de los músculos de la pierna',
    ],
    correcta: 2,
    explicacion:
      'Digestión y respiración aportan energía y oxígeno, la circulación los transporta, el sistema nervioso ordena y el locomotor ejecuta.',
  },
];

/* ───────────────────────────── Video ──────────────────────────────── */
export const video = {
  titulo: 'El viaje del oxígeno: del aire al músculo',
  duracion: 45,
  descripcion: 'Animación de 45 segundos que muestra el proceso completo, con subtítulos.',
  // Los subtítulos se crean con JavaScript para que funcionen también en file://
  subtitulos: [
    { ini: 0.5, fin: 5.8, texto: 'El viaje del oxígeno empieza con una respiración.' },
    { ini: 6.2, fin: 10.0, texto: 'El aire llega a los alvéolos, rodeados de vasos sanguíneos.' },
    { ini: 10.2, fin: 13.8, texto: 'El oxígeno pasa a los glóbulos rojos y el dióxido de carbono sale.' },
    { ini: 14.2, fin: 18.0, texto: 'La sangre con oxígeno vuelve al lado izquierdo del corazón.' },
    { ini: 18.2, fin: 21.8, texto: 'Cada latido la empuja por las arterias hacia todo el cuerpo.' },
    { ini: 22.2, fin: 26.8, texto: 'En el camino se suma la glucosa que vino de la arepa.' },
    { ini: 27.0, fin: 31.8, texto: 'La sangre llega hasta los músculos de la pierna.' },
    { ini: 32.2, fin: 36.8, texto: 'En la célula muscular, oxígeno y glucosa liberan energía.' },
    { ini: 37.0, fin: 40.0, texto: 'El músculo se contrae… ¡y la pierna patea!' },
    { ini: 40.4, fin: 44.6, texto: 'Oxígeno + glucosa = energía para moverte.' },
  ],
};

/* ───────────────────────────── Cómo se hizo ───────────────────────── */
export const comoSeHizo = {
  perfil: {
    resumen:
      'Estudiantes de grados 6.° y 7.° (básica secundaria) del Colegio Universidad Libre, de 10 a 12 años, que usan el recurso en el aula y en el celular.',
    rasgos: [
      'Edad: 10 a 12 años; transición del pensamiento concreto al abstracto.',
      'Nivel: grados 6.° y 7.°, básica secundaria (en Colombia, la educación media corresponde a 10.° y 11.°).',
      'Matemáticas que ya manejan: multiplicación, división, fracciones y porcentajes.',
      'Ciencias Naturales: estándar «Explico las funciones de los seres vivos a partir de las relaciones entre diferentes sistemas de órganos».',
      'Acceso: celular propio o compartido, computadores del colegio, conexión variable.',
      'Contexto: Colombia; fútbol en el descanso, arepa al desayuno, maleta escolar diaria.',
    ],
  },
  decisiones: [
    { sabemos: 'Aprenden mejor con lo concreto y lo propio', decision: 'Cada simulador mide su propio cuerpo: pulso, respiración, reacción y peso de la maleta.' },
    { sabemos: 'Manejan multiplicación y porcentajes', decision: 'Fórmulas visibles de una o dos operaciones, con los valores sustituidos en vivo.' },
    { sabemos: 'Ven sistemas de órganos en Ciencias Naturales (grados 6.° y 7.°)', decision: 'El hilo narrativo une los cinco sistemas como un equipo: de la arepa al gol.' },
    { sabemos: 'Aún no tienen una profesión', decision: 'Una profesional de la salud resuelve el caso de una estudiante de su edad: oficio futuro y situación cercana.' },
    { sabemos: 'Su atención se sostiene en tramos cortos', decision: 'Narración en bloques de 60 a 90 segundos, con subtítulos y paradas independientes.' },
    { sabemos: 'Viven en Colombia', decision: 'Arepa, descanso, educación física, maleta y nombres locales; español de Colombia.' },
    { sabemos: 'Usan mucho el celular', decision: 'Diseño adaptable, controles táctiles grandes y rendimiento limitado para equipos modestos.' },
    { sabemos: 'Leen y oyen de formas distintas', decision: 'Modo con o sin sonido, subtítulos en toda la narración, contraste accesible y teclado.' },
    { sabemos: 'Los motiva el juego y el logro visible', decision: 'Bitácora con sellos por parada, quiz con explicación inmediata y certificado descargable.' },
  ],
  creditos: [
    {
      recurso: 'Guion, narración, fichas, quiz y explicaciones',
      tipo: 'Texto',
      herramienta: 'Claude (Anthropic)',
      como: 'Redacción a partir del prompt maestro del equipo; datos verificados uno a uno contra las fuentes citadas.',
      prompt:
        'Escribe el guion de un recorrido de 10 minutos sobre cinco sistemas del cuerpo humano para estudiantes de 10 a 12 años en Colombia. Hilo conductor: cómo una arepa se convierte en el gol de Sofía, 11 años. En cada parada, una profesional de la salud resuelve un momento de su día. Bloques de narración de 60 a 90 segundos (150 palabras por minuto), lenguaje cercano, solo datos verificables.',
    },
    {
      recurso: 'Escena 3D de los cinco órganos',
      tipo: 'Imagen 3D en tiempo real',
      herramienta: 'Claude (Anthropic) · código Three.js',
      como: 'Geometría procedural escrita en código: tubos, esferas deformadas e instancias. Sin modelos de terceros.',
      prompt:
        'Construye con geometría procedural de Three.js cinco órganos estilizados (intestino, pulmones con árbol bronquial, corazón con glóbulos rojos, red de neuronas y columna vertebral) dispuestos como la silueta de un cuerpo, cada uno animado con datos de su simulador.',
    },
    {
      recurso: 'Texturas: tejido, arepa, brillo y grano',
      tipo: 'Imagen',
      herramienta: 'Claude (Anthropic) · generador en Python',
      como: 'Ruido celular de Worley y ruido de valor generados con NumPy (generators/textures.py), incrustados en un script clásico.',
      prompt:
        'Genera por código cuatro texturas sin fotografías: tejido celular repetible, cara de arepa asada con tostados irregulares, destello radial para partículas y grano fino para el fondo.',
    },
    {
      recurso: 'Retratos de Sofía y las cinco profesionales',
      tipo: 'Ilustración SVG',
      herramienta: 'Claude (Anthropic) · SVG original',
      como: 'Ilustraciones vectoriales originales generadas por una función parametrizable (src/illustrations.js).',
      prompt:
        'Diseña retratos SVG originales, planos y amables, de una niña futbolista de 11 años y de cinco profesionales de la salud colombianos con diversidad de tonos de piel y peinados, cada uno con un detalle de su oficio y el color de su sistema.',
    },
    {
      recurso: 'Sellos de la bitácora y cursor de glóbulo rojo',
      tipo: 'Ilustración SVG',
      herramienta: 'Claude (Anthropic) · SVG original',
      como: 'Íconos de línea dibujados en SVG para cada sistema, compuestos en sellos circulares.',
      prompt:
        'Dibuja en SVG un sello circular por parada con un ícono de línea del sistema y su verbo, y un cursor con forma de glóbulo rojo.',
    },
    {
      recurso: 'Video «El viaje del oxígeno»',
      tipo: 'Video (45 s) con subtítulos',
      herramienta: 'Claude (Anthropic) · animación por código + FFmpeg',
      como: 'Animación 2D en canvas renderizada cuadro a cuadro con Playwright y codificada con FFmpeg; subtítulos creados con JavaScript.',
      prompt:
        'Anima en 45 segundos el recorrido del oxígeno: inspiración, intercambio en el alvéolo, corazón izquierdo, arterias, suma de la glucosa de la arepa, célula muscular y patada final, con subtítulos sincronizados.',
    },
    {
      recurso: 'Banda sonora ambiental',
      tipo: 'Audio (bucle sin cortes)',
      herramienta: 'Claude (Anthropic) · Web Audio API',
      como: 'Música generativa sintetizada en vivo: acordes con osciladores, filtro y reverberación; no se repite ni se corta.',
      prompt:
        'Compón una banda sonora ambiental generativa y tranquila con la Web Audio API, que cambie de color con cada parada y nunca tenga un corte.',
    },
    {
      recurso: 'Sonificación de datos',
      tipo: 'Audio',
      herramienta: 'Claude (Anthropic) · Web Audio API',
      como: 'El latido suena al ritmo que calcula el estudiante y la respiración a su frecuencia respiratoria.',
      prompt: 'Convierte en sonido los resultados de los simuladores: un latido a los lpm calculados y una respiración a la FR medida.',
    },
    {
      recurso: 'Narración en voz',
      tipo: 'Audio (voz sintética) con subtítulos',
      herramienta: 'Voz del navegador (Web Speech API); en Chrome, voz de Google',
      como: 'El guion se lee frase por frase con la voz en español del dispositivo; cada frase aparece como subtítulo sincronizado. Puede reemplazarse por audios MP3 (ver LEEME).',
      prompt: 'Lee el guion de cada parada con voz en español latinoamericano, ritmo pausado y subtítulo por frase.',
    },
    {
      recurso: 'Sitio web y programación',
      tipo: 'Código',
      herramienta: 'Claude (Anthropic)',
      como: 'Vite + Three.js + GSAP + Lenis, empaquetado en un solo archivo HTML.',
      prompt: 'El prompt maestro del equipo (rol, variables, requisitos pedagógicos, multimedia, dirección de arte y técnicos).',
    },
  ],
};

/* ───────────────────────────── Fuentes ────────────────────────────── */
export const fuentes = {
  'fao-atwater': {
    cita: 'FAO. Energy and protein requirements, sección 7.1.1: factores de Atwater (4, 4 y 9 kcal/g).',
    url: 'https://www.fao.org/4/AA040E/AA040E08.htm',
  },
  'cleveland-intestino': {
    cita: 'Cleveland Clinic. Small Intestine: Function, Length & Anatomy (actualizado 14/10/2024).',
    url: 'https://my.clevelandclinic.org/health/body/22135-small-intestine',
  },
  'cleveland-vitales': {
    cita: 'Cleveland Clinic Health Essentials. Pediatric Vital Signs (13/10/2022): 6–12 años, 60–100 lpm y 14–22 rpm en reposo.',
    url: 'https://health.clevelandclinic.org/pediatric-vital-signs',
  },
  'nys-vitales': {
    cita: 'New York State Department of Health, EMS. Herramientas de evaluación pediátrica: otra referencia de rangos (6–12 años: 18–30 rpm, 70–120 lpm).',
    url: 'https://www.health.ny.gov/professionals/ems/pdf/assmttools.pdf',
  },
  'cdc-fc': {
    cita: 'CDC. Target Heart Rate and Estimated Maximum Heart Rate (versión archivada): FCmáx ≈ 220 − edad; moderada 50–70 %, vigorosa 70–85 %.',
    url: 'https://webarchive.library.unt.edu/web/20120916220528/http://www.cdc.gov/physicalactivity/everyone/measuring/heartrate.html',
  },
  'umn-mielina': {
    cita: 'University of Minnesota. Introduction to Sensation and Perception, «Conduction velocity and myelin» (adaptado de OpenStax Anatomy and Physiology).',
    url: 'https://open.lib.umn.edu/sensationandperception/chapter/conduction-velocity-and-myelin/',
  },
  'kidshealth-maleta': {
    cita: 'KidsHealth (Nemours), revisado por Yamini Durani, MD (junio de 2023). Backpack Basics.',
    url: 'https://kidshealth.org/CHOC/en/kids/backpack.html',
  },
  'acibadem-huesos': {
    cita: 'Acıbadem Healthcare Group. How Many Bones Are in the Human Body? (2026): 206 huesos en el adulto; 270–300 elementos óseos al nacer.',
    url: 'https://acibademinternational.com/blog/how-many-bones-are-in-the-human-body-the-count-that-changes-as-you-grow/',
  },
  'men-estandares': {
    cita: 'Ministerio de Educación Nacional. Estándares Básicos de Competencias en Ciencias Naturales, grados 6.° a 7.° (consulta del listado en Classace).',
    url: 'https://www.classace.io/standards/co-estandares/co-estandares-ciencias-naturales-6-7-conoc-vivo',
  },
};

export const certificado = {
  titulo: 'Certificado de expedición',
  texto: 'completó el viaje «Cuerpo adentro: de la arepa al gol» por cinco sistemas del cuerpo humano.',
  creditos: 'Recurso creado con apoyo de Claude (Anthropic) · Código y medios generados por programación',
};
