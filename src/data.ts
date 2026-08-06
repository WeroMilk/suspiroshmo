export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tag?: string;
};

export type Store = {
  city: string;
  address: string;
  state: string;
  hours: string;
  featured?: boolean;
};

export type TransferInfo = {
  bank: string;
  holder: string;
  clabe: string;
  concept: string;
};

export type SiteContent = {
  products: Product[];
  stores: Store[];
  transferInfo: TransferInfo;
  categories: string[];
};

export const defaultTransferInfo: TransferInfo = {
  bank: 'BBVA México',
  holder: 'Suspiros Cakes S.A. de C.V.',
  clabe: '012 180 001234567890',
  concept: 'Pedido Suspiros',
};

export const defaultCategories = ['Pasteles', 'Brownies', 'Cheesecakes', 'Bollitos', 'Temporada'];

export const defaultProducts: Product[] = [
  { id: 1, name: 'Chocolate Suspiro', description: 'Bizcocho de chocolate, mousse y ganache semiamargo.', price: 495, category: 'Pasteles', tag: 'Favorito', image: 'https://images.pexels.com/photos/17939219/pexels-photo-17939219.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 2, name: 'Fresas & Crema', description: 'Vainilla ligera, crema batida y fresas de temporada.', price: 465, category: 'Pasteles', image: 'https://images.pexels.com/photos/9329433/pexels-photo-9329433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 3, name: 'Cheesecake de la casa', description: 'Textura sedosa, base de galleta y frutos rojos.', price: 420, category: 'Cheesecakes', tag: 'Nuevo', image: 'https://images.pexels.com/photos/35225556/pexels-photo-35225556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 4, name: 'Caja de Suspiros', description: 'Seis bocados suaves para compartir el momento.', price: 265, category: 'Bollitos', image: 'https://images.pexels.com/photos/8498186/pexels-photo-8498186.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 5, name: 'Brownie intenso', description: 'Chocolate oscuro, nuez tostada y sal de mar.', price: 195, category: 'Brownies', image: 'https://images.pexels.com/photos/18874692/pexels-photo-18874692.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 6, name: 'Tarta de almendra', description: 'Crema de almendra, mantequilla y un acabado crujiente.', price: 310, category: 'Temporada', image: 'https://images.pexels.com/photos/34844491/pexels-photo-34844491.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

export const defaultStores: Store[] = [
  { city: 'Hermosillo', address: 'Blvd. Morelos 220, Col. Centro', state: 'Sonora', hours: 'Lun — Dom · 10:00 — 20:00', featured: true },
  { city: 'Mexicali', address: 'Gral. Santiago Vidaurri 460, Jardines de Calafia', state: 'Baja California', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Tijuana', address: 'Av. Colina de San Pablo, Colinas de la Presa', state: 'Baja California', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Saltillo', address: 'Blvd. Isidro López Zertuche 1275', state: 'Coahuila', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Monterrey', address: 'Av. Suspiroblo II 245, Riberas de las Puentes', state: 'Nuevo León', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'San José del Cabo', address: 'Calle Forjadores, Col. Santa Rosa', state: 'Baja California Sur', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Querétaro', address: 'Plaza Real, Camino Real 307, Valle Real', state: 'Querétaro', hours: 'Lun — Dom · 10:00 — 20:00' },
];

export const defaultContent: SiteContent = {
  products: defaultProducts,
  stores: defaultStores,
  transferInfo: defaultTransferInfo,
  categories: defaultCategories,
};

export const milestones = [
  { year: '2004', title: 'El primer suspiro', copy: 'Abrimos nuestra primera cocina en Hermosillo con una idea simple: que cada pastel se sintiera hecho para alguien.' },
  { year: '2012', title: 'Más allá de Sonora', copy: 'Llegamos a Baja California y empezamos a compartir la misma receta en nuevas ciudades.' },
  { year: '2018', title: 'Una familia más grande', copy: 'Abrimos en el norte y el centro del país. Misma esencia, nuevas mesas para celebrar.' },
  { year: 'Hoy', title: 'Momentos en todo México', copy: 'Siete sucursales y una sola intención: convertir un día cualquiera en un recuerdo dulce.' },
];

export const values = [
  { title: 'Hecho a mano', copy: 'Cada pieza sale de nuestra cocina, con tiempos reales y detalle paciente.' },
  { title: 'Ingredientes honestos', copy: 'Elegimos lo mejor de temporada para que el sabor hable por sí solo.' },
  { title: 'Cerca de ti', copy: 'Desde Hermosillo hasta Cabo, queremos estar donde se celebra.' },
];

export const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
