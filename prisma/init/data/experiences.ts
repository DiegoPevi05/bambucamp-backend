export const ExperiencesCategoriesData = [
  {
    "name": "BAMBU AMOR"
  },
  {
    "name": "BAMBU EXPERIENCIA"
  },
  {
    "name": "BAMBU AVENTURA",
  },
  {
    "name": "BAMBU TRASLADO"
  },
  {
    "name": "BAMBU PAQUETES"
  }
]

export const ExperiencesData: { header: string, name: string, description: string, price: number, duration: number, images: string, limit_age: number, qtypeople: number, categoryId: any, suggestions: string }[] = [
  {
    header: 'Experiencia Extrema',
    name: 'Canotaje',
    description: 'Experiencia Extrema realizado canotaje a lo largo del rio',
    price: 60,
    duration: 60,
    images: "canotaje",
    limit_age: 18,
    qtypeople: 1,
    categoryId: "BAMBU AVENTURA",
    suggestions: JSON.stringify([
      "LLevar ropa comoda y que se pueda mojar",
      "No llevar aparatos electronicos que se puedan mojar",
      "LLevar gorra para proteccion del sol"
    ])
  },
  {
    "header": "Experiencia Extrema",
    "name": "Canopy",
    "description": "Aventura de canopy a través de varios circuitos suspendidos entre árboles.",
    "price": 60.0,
    "duration": 60,
    "images": "canopy",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Usar ropa cómoda y deportiva",
      "Llevar guantes para mejor agarre",
      "Asegurarse de atar bien el equipo de seguridad"
    ])
  },
  {
    "header": "Exploración Cultural",
    "name": "City Tour",
    "description": "Recorrido por la ciudad con visitas a sitios históricos y culturales.",
    "price": 40.0,
    "duration": 120,
    "images": "city_tour",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Llevar calzado cómodo para caminar",
      "Llevar protector solar y una gorra",
      "Hidratación es esencial durante el recorrido"
    ])
  },
  {
    "header": "Aventura sobre Ruedas",
    "name": "Cuatrimoto Individual",
    "description": "Explora terrenos difíciles y disfruta de un paseo emocionante en cuatrimoto.",
    "price": 40.0,
    "duration": 45,
    "images": "cuatrimoto_individual",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Llevar ropa que se pueda ensuciar",
      "Utilizar casco y equipo de protección",
      "Evitar llevar objetos sueltos"
    ])
  },
  {
    "header": "Aventura en Pareja",
    "name": "Cuatrimoto en Pareja",
    "description": "Disfruta de una experiencia en cuatrimoto compartiendo la emoción con un acompañante.",
    "price": 60.0,
    "duration": 60,
    "images": "cuatrimoto_pareja",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Asegurarse de llevar equipo de protección",
      "Llevar agua para mantenerse hidratado",
      "Planear alternar la conducción para una experiencia compartida"
    ])
  },
  {
    "header": "Descenso Extremo",
    "name": "Rappel",
    "description": "Descenso controlado desde alturas usando cuerda y equipo especializado.",
    "price": 60.0,
    "duration": 60,
    "images": "rappel",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Usar guantes para proteger las manos",
      "Revisar el equipo antes de empezar",
      "Seguir las instrucciones del guía en todo momento"
    ])
  },
  {
    "header": "Cabalgata Escénica",
    "name": "Caballos",
    "description": "Paseo a caballo por senderos naturales con vistas espectaculares.",
    "price": 60.0,
    "duration": 60,
    "images": "caballos",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Usar ropa cómoda para montar",
      "Evitar llevar mochilas grandes",
      "Llevar protector solar y gorra"
    ])
  },
  {
    "header": "Circuito Completo",
    "name": "Circuito",
    "description": "Una experiencia que combina varias actividades de aventura en un solo circuito.",
    "price": 90.0,
    "duration": 120,
    "images": "circuito",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AVENTURA",
    "suggestions": JSON.stringify([
      "Llevar ropa cómoda y ajustada",
      "Mantenerse hidratado",
      "Seguir las instrucciones para cada actividad del circuito"
    ])
  },
  {
    "header": "Servicio de Romance",
    "name": "Velada Romántica",
    "description": "Una velada especial con decoración romántica y ambiente íntimo.",
    "price": 190.0,
    "duration": 120,
    "images": "velada_romantica",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU AMOR",
    "suggestions": JSON.stringify([
      "Reservar con anticipación para asegurar disponibilidad",
      "Llevar una chaqueta ligera para la noche",
      "Aprovechar el ambiente para desconectar y relajarse"
    ])
  },
  {
    "header": "Celebración Especial",
    "name": "Cena fin de año",
    "description": "Cena especial para celebrar el fin de año con un menú exclusivo.",
    "price": 190.0,
    "duration": 180,
    "images": "cena_fin_de_ano",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU AMOR",
    "suggestions": JSON.stringify([
      "Llevar ropa elegante para la ocasión",
      "Hacer reserva previa debido a la alta demanda",
      "Aprovechar para brindar por los nuevos comienzos"
    ])
  },
  {
    "header": "Desayuno Especial",
    "name": "Desayuno Dulce Amanecer",
    "description": "Desayuno romántico para comenzar el día con una experiencia gastronómica.",
    "price": 80.0,
    "duration": 60,
    "images": "desayuno_dulce_amanecer",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU AMOR",
    "suggestions": JSON.stringify([
      "Disfrutar en la comodidad de una cabaña",
      "Incluir opciones de bebidas calientes y frías",
      "Añadir detalles románticos como flores y velas"
    ])
  },
  {
    "header": "Escapada Romántica",
    "name": "Plan Romántico",
    "description": "Una experiencia romántica para parejas con decoración y detalles especiales.",
    "price": 100.0,
    "duration": 120,
    "images": "plan_romantico",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU AMOR",
    "suggestions": JSON.stringify([
      "Ideal para aniversarios y celebraciones de pareja",
      "Llevar ropa cómoda y elegante",
      "Disfrutar de una cena ligera para complementar"
    ])
  },
  {
    "header": "Desayuno en la Naturaleza",
    "name": "Desayuno Campestre",
    "description": "Disfruta de un desayuno campestre rodeado de naturaleza.",
    "price": 27.0,
    "duration": 60,
    "images": "desayuno_campestre",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU EXPERIENCIA",
    "suggestions": JSON.stringify([
      "Llevar protector solar para el sol de la mañana",
      "Disfrutar de un desayuno balanceado",
      "Aprovechar para conectar con la naturaleza"
    ])
  },
  {
    "header": "Experiencia Relajante",
    "name": "Sauna",
    "description": "Relájate en un sauna privado para una experiencia de bienestar.",
    "price": 120.0,
    "duration": 60,
    "images": "sauna",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU EXPERIENCIA",
    "suggestions": JSON.stringify([
      "Llevar traje de baño y toalla",
      "Hidratarse bien antes y después de la sesión",
      "Disfrutar del ambiente relajante y beneficios de salud"
    ])
  },
  {
    "header": "Decoración Temática",
    "name": "Decoración Picnic",
    "description": "Servicio de decoración para un picnic especial al aire libre.",
    "price": 80.0,
    "duration": 120,
    "images": "decoracion_picnic",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU EXPERIENCIA",
    "suggestions": JSON.stringify([
      "Reservar con anticipación para personalización",
      "Asegurar una buena ubicación para el picnic",
      "Disfrutar de una comida al aire libre en un entorno natural"
    ])
  },
  {
    "header": "Experiencia de Camping",
    "name": "Servicio de Fogata",
    "description": "Disfruta de una fogata en la noche con todo el equipo necesario.",
    "price": 25.0,
    "duration": 60,
    "images": "servicio_fogata",
    "limit_age": 18,
    "qtypeople": 1,
    "categoryId": "BAMBU EXPERIENCIA",
    "suggestions": JSON.stringify([
      "Llevar manta para el frío nocturno",
      "Disfrutar de la fogata con canciones y cuentos",
      "Aprovechar para tostar malvaviscos y relajarse"
    ])
  },
  {
    "header": "Servicio de Transporte",
    "name": "Traslado de Lima (Jockey Plaza) a Bambucamp",
    "description": "Servicio de transporte directo desde Lima a Bambucamp.",
    "price": 250.0,
    "duration": 180,
    "images": "traslado_lima_bambucamp",
    "limit_age": 18,
    "qtypeople": 4,
    "categoryId": "BAMBU TRASLADO",
    "suggestions": JSON.stringify([
      "Reservar con anticipación para asegurar disponibilidad",
      "Llevar una botella de agua para el viaje",
      "Asegurarse de estar puntual en el punto de partida"
    ])
  },
  {
    "header": "Servicio de Transporte",
    "name": "Traslado de Bambucamp a Lima (Jockey Plaza)",
    "description": "Servicio de transporte directo desde Bambucamp a Lima.",
    "price": 250.0,
    "duration": 180,
    "images": "traslado_bambucamp_lima",
    "limit_age": 18,
    "qtypeople": 4,
    "categoryId": "BAMBU TRASLADO",
    "suggestions": JSON.stringify([
      "Coordinar el horario de regreso con anticipación",
      "Confirmar la dirección exacta de llegada",
      "Disfrutar del trayecto y de las vistas en el camino"
    ])
  },
  {
    "header": "Taxi Local",
    "name": "Servicio de Taxi hasta la plaza de Lunahuaná",
    "description": "Taxi privado que te lleva desde Bambucamp a la plaza de Lunahuaná.",
    "price": 10.0,
    "duration": 20,
    "images": "servicio_taxi",
    "limit_age": 18,
    "qtypeople": 4,
    "categoryId": "BAMBU TRASLADO",
    "suggestions": JSON.stringify([
      "Asegurarse de coordinar con anticipación",
      "Tener efectivo para pagar el servicio",
      "Llevar una lista de lugares para visitar en Lunahuaná"
    ])
  },
  {
    "header": "Bambu Sorprende",
    "name": "Paquete Glamping 2 días - 1 noche para 2 personas",
    "description": "Incluye Glamping Suite, desayuno, picnic, fogata, 1 sesión de sauna y carbón.",
    "price": 570.0,
    "duration": 2,
    "images": "paquete_4",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU PAQUETES",
    "suggestions": JSON.stringify([
      "Traer ropa cómoda para picnic y fogata",
      "Confirmar disponibilidad de sauna con anticipación",
      "Ideal para escapada relajante en pareja"
    ])
  },
  {
    "header": "Bambu Parrillero",
    "name": "Paquete Glamping Parrillero 2 días - 1 noche para 2 personas",
    "description": "Incluye Glamping Suite, 4 porciones de carne a elección, guarniciones, paquete de chorizo, 2 copas de vino, mensaje, carbón, condimentos, estacionamiento y piscina.",
    "price": 580.0,
    "duration": 2,
    "images": "paquete_5",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU PAQUETES",
    "suggestions": JSON.stringify([
      "Perfecto para amantes de la parrilla",
      "Consultar disponibilidad de carnes",
      "Traer traje de baño para la piscina"
    ])
  },
  {
    "header": "Bambu Enamórate",
    "name": "Paquete Romántico 2 días - 1 noche para 2 personas",
    "description": "Incluye Glamping Suite, decoración romántica, vino, caja de chocolates, velada romántica con cena y postres, desayuno especial con jugos, bebida caliente, ensaladas de fruta y decoración personalizada.",
    "price": 780.0,
    "duration": 2,
    "images": "paquete_6",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU PAQUETES",
    "suggestions": JSON.stringify([
      "Paquete ideal para aniversarios o pedidas",
      "Avisar con anticipación para decoración personalizada",
      "Incluye detalles románticos sorpresa"
    ])
  },
  {
    "header": "Bambu Cumpleañero",
    "name": "Paquete de Cumpleaños 2 días - 1 noche para 2 personas",
    "description": "Incluye Glamping Suite, cóctel de bienvenida, decoración especial, desayuno, almuerzo, picnic, fogata, juegos de mesa, wifi y detalle especial de cumpleaños.",
    "price": 780.0,
    "duration": 2,
    "images": "paquete_3",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU PAQUETES",
    "suggestions": JSON.stringify([
      "Paquete ideal para celebrar cumpleaños",
      "Incluye decoración y detalle especial",
      "Consultar por opciones adicionales de torta"
    ])
  },
  {
    "header": "Bambu Aventura",
    "name": "Paquete de Aventura 2 días - 1 noche para 2 personas",
    "description": "Incluye Glamping Suite, desayuno, canotaje, cuatrimoto doble y city tour.",
    "price": 660.0,
    "duration": 2,
    "images": "paquete_2",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU PAQUETES",
    "suggestions": JSON.stringify([
      "Llevar ropa deportiva y de baño",
      "Recomendado para quienes buscan adrenalina",
      "Confirmar horarios de actividades de aventura"
      ])
  },
  {
    "header": "Bambu Relajo",
    "name": "Paquete Relax 2 días - 1 noche para 2 personas",
    "description": "Incluye Glamping Suite, bebidas de bienvenida, cata de vino, desayuno, almuerzo, cena, juegos de mesa, wifi, piscina y estacionamiento.",
    "price": 530.0,
    "duration": 2,
    "images": "paquete_1",
    "limit_age": 18,
    "qtypeople": 2,
    "categoryId": "BAMBU PAQUETES",
    "suggestions": JSON.stringify([
      "Perfecto para desconectar y descansar",
      "Disfrutar de la piscina y las catas de vino",
      "Paquete con enfoque en relajación y buena comida"
    ])
  }
]
