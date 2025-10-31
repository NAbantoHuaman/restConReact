export interface Zone {
  id: string;
  name: string;
  description: string;
  capacity: number;
  tables: number[];
}

export interface ConsumptionType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface RestaurantConfig {
  zones: Zone[];
  consumptionTypes: ConsumptionType[];
  maxGuestsPerReservation: number;
  reservationTimeSlots: string[];
  businessHours: {
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
}

export const restaurantConfig: RestaurantConfig = {
  zones: [
    {
      id: 'terraza',
      name: 'Terraza',
      description: 'Área al aire libre con vista panorámica',
      capacity: 40,
      tables: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      id: 'interior',
      name: 'Interior',
      description: 'Ambiente acogedor con aire acondicionado',
      capacity: 60,
      tables: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    },
    {
      id: 'privado',
      name: 'Salón Privado',
      description: 'Espacio exclusivo para eventos especiales',
      capacity: 20,
      tables: [21, 22, 23, 24]
    },
    {
      id: 'barra',
      name: 'Barra',
      description: 'Área de barra para comidas rápidas',
      capacity: 16,
      tables: [25, 26, 27, 28, 29, 30, 31, 32]
    }
  ],
  consumptionTypes: [
    {
      id: 'almuerzo',
      name: 'Almuerzo',
      description: 'Comida del mediodía',
      icon: '🍽️'
    },
    {
      id: 'cena',
      name: 'Cena',
      description: 'Comida de la noche',
      icon: '🌙'
    }
  ],
  maxGuestsPerReservation: 8,
  reservationTimeSlots: [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ],
  businessHours: {
    lunch: { start: '12:00', end: '15:00' },
    dinner: { start: '19:00', end: '23:00' }
  }
};


export const RESTAURANT_ZONES = restaurantConfig.zones;
export const CONSUMPTION_TYPES = restaurantConfig.consumptionTypes;

export const getZoneName = (zoneId: string): string => {
  const zone = restaurantConfig.zones.find(z => z.id === zoneId);
  return zone ? zone.name : zoneId;
};

export const getConsumptionTypeName = (typeId: string): string => {
  const type = restaurantConfig.consumptionTypes.find(t => t.id === typeId);
  return type ? type.name : typeId;
};