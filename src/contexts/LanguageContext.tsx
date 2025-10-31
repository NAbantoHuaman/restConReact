import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    nav: {
      home: 'Inicio',
      menu: 'Carta',
      reservations: 'Reservas'
    },
    home: {
      hero: {
        title: 'Bella Vista',
        subtitle: 'Experiencia gastronómica excepcional en el corazón de la ciudad',
        reserveButton: 'Reservar Mesa',
        menuButton: 'Ver Carta'
      },
      welcome: {
        title: 'Bienvenidos a Bella Vista',
        description: 'Descubre nuestra propuesta gastronómica que combina técnicas tradicionales con toques contemporáneos, creando platos memorables que deleitan todos los sentidos'
      },
      features: {
        quality: {
          title: 'Calidad Premium',
          description: 'Ingredientes frescos y de la más alta calidad, seleccionados cuidadosamente por nuestros chefs.'
        },
        experience: {
          title: 'Experiencia Única',
          description: 'Cada visita es una experiencia memorable con atención personalizada y ambiente acogedor.'
        },
        atmosphere: {
          title: 'Ambiente Exclusivo',
          description: 'Un espacio elegante y sofisticado, perfecto para cualquier ocasión especial.'
        }
      },
      history: {
        title: 'Nuestra Historia',
        description1: 'Desde 2010, Bella Vista ha sido sinónimo de excelencia culinaria. Nuestro chef ejecutivo, con más de 20 años de experiencia internacional, lidera un equipo apasionado por crear experiencias gastronómicas únicas.',
        description2: 'Cada plato cuenta una historia, fusionando sabores tradicionales con técnicas innovadoras, utilizando ingredientes frescos de productores locales cuidadosamente seleccionados.'
      },
      info: {
        title: 'Información',
        address: {
          label: 'Dirección',
          value: 'Av. Principal 123, Miraflores'
        },
        hours: {
          label: 'Horario',
          value: 'Lun - Dom: 12:00 PM - 11:00 PM'
        },
        phone: {
          label: 'Teléfono',
          value: '+51 902291058'
        }
      }
    },
    menu: {
      title: 'Nuestra Carta',
      subtitle: 'Descubre nuestra selección de platos cuidadosamente preparados con ingredientes de primera calidad',
      categoriesTitle: 'Categorías',
      categoriesSubtitle: 'Explora nuestras deliciosas opciones por categoría',
      categories: {
        all: 'Todo',
        entradas: 'Entradas',
        principales: 'Platos Principales',
        postres: 'Postres',
        bebidas: 'Bebidas'
      },
      items: {
        carpaccio: {
          name: 'Carpaccio de Res',
          description: 'Finas láminas de res con parmesano, rúcula y reducción de balsámico'
        },
        ceviche: {
          name: 'Ceviche Clásico',
          description: 'Pescado fresco marinado en limón con cebolla, ají y camote'
        },
        caesar: {
          name: 'Ensalada César Premium',
          description: 'Lechuga romana, croutons artesanales, parmesano y aderezo César'
        },
        lomo: {
          name: 'Lomo Saltado Premium',
          description: 'Jugoso lomo fino salteado con papas fritas y arroz blanco'
        },
        risotto: {
          name: 'Risotto de Hongos',
          description: 'Arroz arborio cremoso con hongos silvestres y trufa negra'
        },
        salmon: {
          name: 'Salmón a la Plancha',
          description: 'Filete de salmón con vegetales asados y salsa de alcaparras'
        },
        ossobuco: {
          name: 'Ossobuco',
          description: 'Osobuco de res braseado con puré de papas y gremolata'
        },
        tiramisu: {
          name: 'Tiramisú Clásico',
          description: 'Postre italiano tradicional con mascarpone y café'
        },
        volcano: {
          name: 'Volcán de Chocolate',
          description: 'Bizcocho de chocolate con centro fundido y helado de vainilla'
        },
        cheesecake: {
          name: 'Cheesecake de Frutos Rojos',
          description: 'Suave cheesecake con coulis de frutos del bosque'
        },
        wine: {
          name: 'Vino Tinto Reserva',
          description: 'Copa de vino tinto selección especial'
        },
        pisco: {
          name: 'Pisco Sour',
          description: 'Cóctel peruano tradicional con pisco acholado'
        },
        paella: {
          name: 'Paella Mixta',
          description: 'Arroz con mariscos y carnes, azafrán y pimientos asados'
        },
        pollo_brasa: {
          name: 'Pollo a la Brasa',
          description: 'Clásico peruano con papas, ensalada y salsa huancaína'
        },
        pasta_alfredo: {
          name: 'Pasta Alfredo con Camarones',
          description: 'Fettuccine cremoso con mantequilla, parmesano y camarones'
        },
        chicha: {
          name: 'Chicha Morada',
          description: 'Refresco de maíz morado con frutas y especias'
        },
        limonada: {
          name: 'Limonada de Hierbabuena',
          description: 'Limonada fresca con hierbabuena y hielo'
        },
        gin_tonic: {
          name: 'Gin Tonic Clásico',
          description: 'Gin premium con tónica, limón y enebro'
        },
        suspiro: {
          name: 'Suspiro a la Limeña',
          description: 'Manjar blanco con merengue, clásico dulce peruano'
        },
        tres_leches: {
          name: 'Tres Leches',
          description: 'Bizcocho húmedo con mezcla de tres leches y canela'
        },
        helado_artesanal: {
          name: 'Helado Artesanal',
          description: 'Selección de sabores artesanales con frutas de estación'
        }
      }
    },

    reservations: {
      title: 'Sistema de Reservas',
      subtitle: 'Gestiona las reservas del restaurante y evita conflictos de horarios',
      updateButton: 'Actualizar',
      newReservation: 'Nueva Reserva',
      statistics: 'Estadísticas',
      totalReservations: 'Total Reservas',
      availableTables: 'Mesas Disponibles',
      upcomingReservations: 'Próximas Reservas',
      calendar: 'Calendario de Reservas',
      noReservations: 'No hay reservas registradas. Crea tu primera reserva.',
      createFirstReservation: 'Aún no tienes reservas programadas. ¡Crea tu primera reserva!',
      prev: 'Anterior',
      next: 'Siguiente',
      stepCounter: 'Paso {{current}} de {{total}}',
      table: 'Mesa',
      consumptionType: 'Tipo de consumo',
      people: 'personas',
      person: 'persona',
      confirmDelete: '¿Estás seguro de que deseas eliminar esta reserva?',
      today: 'Hoy',
      tomorrow: 'Mañana',
      notAvailable: 'No disponible',
      notSelected: 'No seleccionada',
      date: 'Fecha',
      time: 'Hora',
      zone: 'Zona',
      type: 'Tipo',
      tablesAvailable: 'mesas disponibles',
      capacityUpTo: 'Hasta {{count}} personas',
      choosePeopleTitle: 'Elige la cantidad de personas',
      childrenNote: '* Bebés y niños deben ser incluidos en la cantidad de personas',
      adults: 'Adultos',
      adultsSubtitle: '13 años en adelante',
      children: 'Niños',
      childrenSubtitle: '2-12 años',
      babies: 'Bebés',
      babiesSubtitle: '0-23 meses',
      totalPeople: 'Total: {{count}} personas',
      maxPeoplePerReservation: 'Máximo {{max}} personas por reserva',
      selectDateTitle: 'Selecciona la fecha',
      selectDateSubtitle: 'Elige el día para tu reserva',
      selectedDate: 'Fecha seleccionada',
      selectTimeTitle: 'Elige el horario',
      selectTimeSubtitle: 'Selecciona la hora para tu reserva',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      selectedTime: 'Horario seleccionado',
      chooseZoneTypeTitle: 'Elige zona',
      chooseZoneTypeSubtitle: 'Selecciona el ambiente y el tipo de experiencia que prefieres',
      restaurantZone: 'Zona del restaurante',
      availableTablesIn: 'Mesas disponibles en',
      occupied: 'Ocupada',
      noTablesAvailableZone: 'No hay mesas disponibles para {{count}} personas en esta zona.',
      selectAnotherZone: 'Por favor, selecciona otra zona.',
      consumptionTypeTitle: 'Tipo de consumo',
      currentSelection: 'Selección actual:',
      yourDetailsTitle: 'Tus datos',
      yourDetailsSubtitle: 'Completa la información para confirmar tu reserva',
      reservationSummaryTitle: 'Resumen de tu reserva',
      processing: 'Procesando...',
      successTitle: '¡Reserva Confirmada!',
      successBody: 'Tu reserva ha sido creada exitosamente. Recibirás un email de confirmación en breve.',
      successDetailsTitle: 'Detalles de tu reserva:',
      redirecting: 'Redirigiendo a la página de reservas...',
      successModal: {
        title: '¡Reserva Confirmada!',
        message: 'Tu reserva ha sido creada exitosamente. Recibirás un email de confirmación en breve.',
        detailsTitle: 'Detalles de tu reserva:',
        redirecting: 'Redirigiendo a la página de reservas...'
      },
      contactLargeGroups: 'Para grupos de más de 8 personas, contacta directamente al restaurante',
      zones: {
        terraza: { name: 'Terraza', description: 'Área al aire libre con vista panorámica' },
        interior: { name: 'Interior', description: 'Ambiente acogedor con aire acondicionado' },
        privado: { name: 'Salón Privado', description: 'Espacio exclusivo para eventos especiales' },
        barra: { name: 'Barra', description: 'Área de barra para comidas rápidas' }
      },
      consumptionTypes: {
        almuerzo: { name: 'Almuerzo', description: 'Comida del mediodía' },
        cena: { name: 'Cena', description: 'Comida de la noche' }
      },
      infoImportantTitle: 'Información importante:',
      infoImportantBullets: {
        bullet1: 'Recibirás un email de confirmación en los próximos minutos',
        bullet2: 'Las reservas se confirman sujetas a disponibilidad',
        bullet3: 'Puedes cancelar o modificar tu reserva hasta 2 horas antes',
        bullet4: 'Para grupos de más de 8 personas, contacta directamente al restaurante'
      },
      form: {
        date: 'Fecha',
        time: 'Hora',
        selectTime: 'Seleccionar hora',
        notSelected: 'No seleccionada',
        timeNotSelected: 'Hora no seleccionada',
        notAvailable: '(No disponible)',
        table: 'Mesa',
        selectTable: 'Seleccionar mesa',
        tableOption: 'Mesa {{number}} (Capacidad: {{capacity}} personas)',
        customerName: 'Nombre del Cliente',
        customerNamePlaceholder: 'Ej: Juan Pérez',
        email: 'Email',
        emailPlaceholder: 'juan@ejemplo.com',
        phone: 'Teléfono',
        phonePlaceholder: '999 888 777',
        cancel: 'Cancelar',
        createReservation: 'Crear Reserva',
        specialRequestsLabel: 'Solicitudes especiales (opcional)',
        specialRequestsPlaceholder: 'Alergias, celebraciones especiales, preferencias de mesa, etc.'
      },
      errors: {
        allFieldsRequired: 'Todos los campos son obligatorios',
        tableNotFound: 'Mesa no encontrada',
        capacityExceeded: 'La mesa {{tableNumber}} solo tiene capacidad para {{capacity}} personas',
        alreadyReserved: 'Esta mesa ya está reservada para la fecha y hora seleccionadas',
        mustSelectAdults: 'Debe seleccionar al menos 1 adulto',
        mustSelectDate: 'Debe seleccionar una fecha',
        mustSelectTime: 'Debe seleccionar una hora',
        mustSelectZone: 'Debe seleccionar una zona',
        mustSelectTable: 'Debe seleccionar una mesa',
        mustSelectConsumptionType: 'Debe seleccionar un tipo de consumo',
        customerNameRequired: 'El nombre es obligatorio',
        customerNameMinLength: 'El nombre debe tener al menos 2 caracteres',
        customerEmailRequired: 'El email es obligatorio',
        invalidEmail: 'Ingresa un email válido',
        customerPhoneRequired: 'El teléfono es obligatorio',
        phoneMinLength: 'El teléfono debe tener al menos 8 dígitos',
        acceptTermsRequired: 'Debe aceptar los términos y condiciones',
        acceptTermsStart: 'Acepto los ',
        acceptTermsAnd: ' y la ',
      }
    },
    footer: {
      rights: '© 2024 Bella Vista. Todos los derechos reservados.',
      contact: 'Contacto',
      hours: 'Horarios',
      follow: 'Síguenos',
      phone: 'Teléfono',
      email: 'Email',
      emailValue: 'contacto@bellavista.com',
      location: 'Ubicación',
      viewOnMaps: 'Ver en Google Maps',
      hoursTitle: 'HORARIO DE ATENCIÓN',
      mondayToSaturday: 'Lunes a Sábado',
      sunday: 'Domingo',
      closed: 'Cerrado',
      note: 'Recomendamos hacer reservas con anticipación, especialmente para fines de semana.',
      restaurantName: 'Restaurante Bella Vista',
      description: 'Experiencia culinaria nikkei auténtica en el corazón de Miraflores',
      premiumCuisine: 'Cocina Nikkei Premium',
      freshIngredients: 'Ingredientes Frescos Diarios',
      familyAtmosphere: 'Ambiente Familiar',
      privacyPolicy: 'Política de Privacidad',
      termsOfService: 'Términos de Servicio'
    }
  },
  en: {
    nav: {
      home: 'Home',
      menu: 'Menu',
      reservations: 'Reservations'
    },
    home: {
      hero: {
        title: 'Bella Vista',
        subtitle: 'Exceptional gastronomic experience in the heart of the city',
        reserveButton: 'Reserve Table',
        menuButton: 'View Menu'
      },
      welcome: {
        title: 'Welcome to Bella Vista',
        description: 'Discover our gastronomic proposal that combines traditional techniques with contemporary touches, creating memorable dishes that delight all the senses'
      },
      features: {
        quality: {
          title: 'Premium Quality',
          description: 'Fresh ingredients of the highest quality, carefully selected by our chefs.'
        },
        experience: {
          title: 'Unique Experience',
          description: 'Each visit is a memorable experience with personalized attention and cozy atmosphere.'
        },
        atmosphere: {
          title: 'Exclusive Atmosphere',
          description: 'An elegant and sophisticated space, perfect for any special occasion.'
        }
      },
      history: {
        title: 'Our Story',
        description1: 'Since 2010, Bella Vista has been synonymous with culinary excellence. Our executive chef, with over 20 years of international experience, leads a passionate team to create unique gastronomic experiences.',
        description2: 'Each dish tells a story, fusing traditional flavors with innovative techniques, using fresh ingredients from carefully selected local producers.'
      },
      info: {
        title: 'Information',
        address: {
          label: 'Address',
          value: 'Av. Principal 123, Miraflores'
        },
        hours: {
          label: 'Hours',
          value: 'Mon - Sun: 12:00 PM - 11:00 PM'
        },
        phone: {
          label: 'Phone',
          value: '+51 902291058'
        }
      }
    },
    menu: {
      title: 'Our Menu',
      subtitle: 'Discover our selection of carefully prepared dishes with premium quality ingredients',
      categoriesTitle: 'Categories',
      categoriesSubtitle: 'Explore our delicious options by category',
      categories: {
        all: 'All',
        entradas: 'Appetizers',
        principales: 'Main Courses',
        postres: 'Desserts',
        bebidas: 'Beverages'
      },
      items: {
        carpaccio: {
          name: 'Beef Carpaccio',
          description: 'Thin slices of beef with parmesan, arugula and balsamic reduction'
        },
        ceviche: {
          name: 'Classic Ceviche',
          description: 'Fresh fish marinated in lime with onion, chili and sweet potato'
        },
        caesar: {
          name: 'Premium Caesar Salad',
          description: 'Romaine lettuce, artisanal croutons, parmesan and Caesar dressing'
        },
        lomo: {
          name: 'Premium Lomo Saltado',
          description: 'Juicy fine beef stir-fried with french fries and white rice'
        },
        risotto: {
          name: 'Mushroom Risotto',
          description: 'Creamy arborio rice with wild mushrooms and black truffle'
        },
        salmon: {
          name: 'Grilled Salmon',
          description: 'Salmon fillet with roasted vegetables and caper sauce'
        },
        ossobuco: {
          name: 'Ossobuco',
          description: 'Braised beef ossobuco with mashed potatoes and gremolata'
        },
        tiramisu: {
          name: 'Classic Tiramisu',
          description: 'Traditional Italian dessert with mascarpone and coffee'
        },
        volcano: {
          name: 'Chocolate Volcano',
          description: 'Chocolate sponge cake with molten center and vanilla ice cream'
        },
        cheesecake: {
          name: 'Berry Cheesecake',
          description: 'Smooth cheesecake with forest berry coulis'
        },
        wine: {
          name: 'Reserve Red Wine',
          description: 'Glass of special selection red wine'
        },
        pisco: {
          name: 'Pisco Sour',
          description: 'Traditional Peruvian cocktail with acholado pisco'
        },
        paella: {
          name: 'Mixed Paella',
          description: 'Rice with seafood and meats, saffron and roasted peppers'
        },
        pollo_brasa: {
          name: 'Rotisserie Chicken',
          description: 'Peruvian classic with fries, salad and huancaína sauce'
        },
        pasta_alfredo: {
          name: 'Shrimp Alfredo Pasta',
          description: 'Creamy fettuccine with butter, parmesan and shrimp'
        },
        chicha: {
          name: 'Chicha Morada',
          description: 'Purple corn drink with fruit and spices'
        },
        limonada: {
          name: 'Mint Lemonade',
          description: 'Fresh lemonade with mint and ice'
        },
        gin_tonic: {
          name: 'Classic Gin Tonic',
          description: 'Premium gin with tonic, lemon and juniper'
        },
        suspiro: {
          name: 'Suspiro Limeño',
          description: 'Peruvian dessert with dulce de leche and meringue'
        },
        tres_leches: {
          name: 'Tres Leches Cake',
          description: 'Moist sponge cake soaked in three milks and cinnamon'
        },
        helado_artesanal: {
          name: 'Artisanal Ice Cream',
          description: 'Selection of artisanal flavors with seasonal fruits'
        }
      }
    },

    reservations: {
      title: 'Reservation System',
      subtitle: 'Manage restaurant reservations and avoid scheduling conflicts',
      updateButton: 'Update',
      newReservation: 'New Reservation',
      statistics: 'Statistics',
      totalReservations: 'Total Reservations',
      availableTables: 'Available Tables',
      upcomingReservations: 'Upcoming Reservations',
      calendar: 'Reservation Calendar',
      noReservations: 'No reservations registered. Create your first reservation.',
      createFirstReservation: 'You have no scheduled reservations yet. Create your first one!',
      prev: 'Previous',
      next: 'Next',
      stepCounter: 'Step {{current}} of {{total}}',
      table: 'Table',
      consumptionType: 'Consumption Type',
      people: 'people',
        person: 'person',
         confirmDelete: 'Are you sure you want to delete this reservation?',
        today: 'Today',
        tomorrow: 'Tomorrow',
        notAvailable: 'Not available',
        notSelected: 'Not selected',
        date: 'Date',
        time: 'Time',
        zone: 'Zone',
        type: 'Type',
        tablesAvailable: 'tables available',
        capacityUpTo: 'Up to {{count}} people',
        choosePeopleTitle: 'Choose number of people',
        childrenNote: '* Babies and children must be included in the headcount',
        adults: 'Adults',
        adultsSubtitle: 'Age 13+',
        children: 'Children',
        childrenSubtitle: 'Age 2–12',
        babies: 'Babies',
        babiesSubtitle: '0–23 months',
        totalPeople: 'Total: {{count}} people',
        maxPeoplePerReservation: 'Maximum {{max}} people per reservation',
        selectDateTitle: 'Select the date',
        selectDateSubtitle: 'Pick a day for your reservation',
        selectedDate: 'Selected date',
        selectTimeTitle: 'Choose a time',
        selectTimeSubtitle: 'Select a time for your reservation',
        lunch: 'Lunch',
        dinner: 'Dinner',
        selectedTime: 'Selected time',
        chooseZoneTypeTitle: 'Choose zone and consumption type',
        chooseZoneTypeSubtitle: 'Pick the area and experience type you prefer',
        restaurantZone: 'Restaurant zone',
        availableTablesIn: 'Available tables in',
        occupied: 'Occupied',
        noTablesAvailableZone: 'No tables available for {{count}} people in this zone.',
        selectAnotherZone: 'Please select another zone.',
        consumptionTypeTitle: 'Consumption type',
        currentSelection: 'Current selection:',
        yourDetailsTitle: 'Your details',
        yourDetailsSubtitle: 'Complete your information to confirm your reservation',
        reservationSummaryTitle: 'Your reservation summary',
        processing: 'Processing...',
        successTitle: 'Reservation Confirmed!',
        successBody: 'Your reservation has been created successfully. You will receive a confirmation email shortly.',
        successDetailsTitle: 'Your reservation details:',
        redirecting: 'Redirecting to the reservations page...',
        successModal: {
          title: 'Reservation Confirmed!',
          message: 'Your reservation has been created successfully. You will receive a confirmation email shortly.',
          detailsTitle: 'Your reservation details:',
          redirecting: 'Redirecting to the reservations page...'
        },
        contactLargeGroups: 'For groups larger than 8, please contact the restaurant directly',
      zones: {
        terraza: { name: 'Terrace', description: 'Outdoor area with panoramic view' },
        interior: { name: 'Indoor', description: 'Cozy environment with air conditioning' },
        privado: { name: 'Private Room', description: 'Exclusive space for special events' },
        barra: { name: 'Bar', description: 'Bar area for quick meals' }
      },
      consumptionTypes: {
        almuerzo: { name: 'Lunch', description: 'Midday meal' },
        cena: { name: 'Dinner', description: 'Evening meal' }
      },
      infoImportantTitle: 'Important information:',
      infoImportantBullets: {
        bullet1: 'You will receive a confirmation email in the next few minutes',
        bullet2: 'Reservations are confirmed subject to availability',
        bullet3: 'You can cancel or modify your reservation up to 2 hours before',
        bullet4: 'For groups larger than 8, please contact the restaurant directly'
      },
       form: {
        date: 'Date',
        time: 'Time',
        selectTime: 'Select time',
        notSelected: 'Not selected',
        timeNotSelected: 'Time not selected',
        notAvailable: '(Not available)',
        table: 'Table',
        selectTable: 'Select Table',
        tableOption: 'Table {{number}} (Capacity: {{capacity}} people)',
        customerName: 'Customer Name',
        customerNamePlaceholder: 'e.g: John Doe',
        email: 'Email',
        emailPlaceholder: 'john@example.com',
        phone: 'Phone',
        phonePlaceholder: '999 888 777',
        cancel: 'Cancel',
        createReservation: 'Create Reservation',
        specialRequestsLabel: 'Special requests (optional)',
        specialRequestsPlaceholder: 'Allergies, special occasions, table preferences, etc.'
      },
      errors: {
        allFieldsRequired: 'All fields are required',
        tableNotFound: 'Table not found',
        capacityExceeded: 'Table {{tableNumber}} only has capacity for {{capacity}} people',
        alreadyReserved: 'This table is already reserved for the selected date and time',
        mustSelectAdults: 'At least 1 adult must be selected',
        mustSelectDate: 'You must select a date',
        mustSelectTime: 'You must select a time',
        mustSelectZone: 'You must select a zone',
        mustSelectTable: 'You must select a table',
        mustSelectConsumptionType: 'You must select a consumption type',
        customerNameRequired: 'Name is required',
        customerNameMinLength: 'Name must be at least 2 characters',
        customerEmailRequired: 'Email is required',
        invalidEmail: 'Please enter a valid email',
        customerPhoneRequired: 'Phone is required',
        phoneMinLength: 'Phone must be at least 8 digits',
        acceptTermsRequired: 'You must accept the terms and conditions',
        acceptTermsStart: 'I accept the ',
        acceptTermsAnd: ' and the ',
      }
    },
    footer: {
      rights: '© 2024 Bella Vista. All rights reserved.',
      contact: 'Contact',
      hours: 'Hours',
      follow: 'Follow Us',
      phone: 'Phone',
      email: 'Email',
      emailValue: 'contact@bellavista.com',
      location: 'Location',
      viewOnMaps: 'View on Google Maps',
      hoursTitle: 'OPENING HOURS',
      mondayToSaturday: 'Monday to Saturday',
      sunday: 'Sunday',
      closed: 'Closed',
      note: 'We recommend making reservations in advance, especially for weekends.',
      restaurantName: 'Bella Vista Restaurant',
      description: 'Authentic nikkei culinary experience in the heart of Miraflores',
      premiumCuisine: 'Premium Nikkei Cuisine',
      freshIngredients: 'Fresh Daily Ingredients',
      familyAtmosphere: 'Family Atmosphere',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service'
    }
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string, variables?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; 
      }
    }
    
    if (typeof value === 'string' && variables) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        return variables[variableName] !== undefined ? String(variables[variableName]) : match;
      });
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}