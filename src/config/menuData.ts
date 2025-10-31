export type MenuCategory = 'entradas' | 'principales' | 'postres' | 'bebidas';

export interface MenuItem {
  id: number;
  key: string; 
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string; 
}

export const menuItems: MenuItem[] = [
  { id: 1, key: 'carpaccio', name: 'Carpaccio de Res', description: 'Finas láminas de res con parmesano, rúcula y reducción de balsámico', price: 42, category: 'entradas', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { id: 2, key: 'ceviche', name: 'Ceviche Clásico', description: 'Pescado fresco marinado en limón con cebolla, ají y camote', price: 48, category: 'entradas', image: 'https://www.recetasnestle.cl/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/379d1ba605985c4bc3ea975cabacce13.webp?itok=OPDxjAtZ' },
  { id: 3, key: 'caesar', name: 'Ensalada César Premium', description: 'Lechuga romana, croutons artesanales, parmesano y aderezo César', price: 38, category: 'entradas', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { id: 4, key: 'lomo', name: 'Lomo Saltado Premium', description: 'Jugoso lomo fino salteado con papas fritas y arroz blanco', price: 68, category: 'principales', image: 'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=2031&q=80' },
  { id: 5, key: 'risotto', name: 'Risotto de Hongos', description: 'Arroz arborio cremoso con hongos silvestres y trufa negra', price: 62, category: 'principales', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { id: 6, key: 'salmon', name: 'Salmón a la Plancha', description: 'Filete de salmón con vegetales asados y salsa de alcaparras', price: 75, category: 'principales', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=2087&q=80' },
  { id: 7, key: 'ossobuco', name: 'Ossobuco', description: 'Osobuco de res braseado con puré de papas y gremolata', price: 82, category: 'principales', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80' },
  { id: 8, key: 'tiramisu', name: 'Tiramisú Clásico', description: 'Postre italiano tradicional con mascarpone y café', price: 28, category: 'postres', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2020&q=80' },
  { id: 9, key: 'volcano', name: 'Volcán de Chocolate', description: 'Bizcocho de chocolate con centro fundido y helado de vainilla', price: 32, category: 'postres', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=2089&q=80' },
  { id: 10, key: 'cheesecake', name: 'Cheesecake de Frutos Rojos', description: 'Suave cheesecake con coulis de frutos del bosque', price: 30, category: 'postres', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { id: 11, key: 'wine', name: 'Vino Tinto Reserva', description: 'Copa de vino tinto selección especial', price: 35, category: 'bebidas', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80' },
  { id: 12, key: 'pisco', name: 'Pisco Sour', description: 'Cóctel peruano tradicional con pisco acholado', price: 25, category: 'bebidas', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { id: 13, key: 'paella', name: 'Paella Mixta', description: 'Arroz con mariscos y carnes, azafrán y pimientos asados', price: 78, category: 'principales', image: 'https://www.rieglpalate.com/wp-content/uploads/2024/04/Paella-Mixta-1024x683.jpg' },
  { id: 14, key: 'pollo_brasa', name: 'Pollo a la Brasa', description: 'Clásico peruano con papas y ensalada, salsa huancaína', price: 55, category: 'principales', image: 'https://elcomercio.pe/resizer/v2/55QLUH7SV5E53AFZHMYNTJ4TTE.jpg?auth=bdffd2a0f4da7a109fb83ad9b94fcf63e5ca1c345be580dc898152c14dac10a0&width=1200&height=675&quality=75&smart=true' },
  { id: 15, key: 'pasta_alfredo', name: 'Pasta Alfredo con Camarones', description: 'Fettuccine cremoso con mantequilla, parmesano y camarones', price: 66, category: 'principales', image: 'https://www.cocinadelirante.com/800x600/filters:format(webp):quality(75)/sites/default/files/images/2023/05/pasta-alfredo-con-camarones-y-pesto.jpg' },
  { id: 16, key: 'chicha', name: 'Chicha Morada', description: 'Refresco tradicional de maíz morado con fruta y especias', price: 16, category: 'bebidas', image: 'https://origin.cronosmedia.glr.pe/large/2023/07/24/lg_64bebe2ae1753238157f7157.jpg' },
  { id: 17, key: 'limonada', name: 'Limonada de Hierbabuena', description: 'Limonada fresca con hoja de menta y hielo', price: 14, category: 'bebidas', image: 'https://www.apega.pe/wp-content/uploads/2025/08/receta-de-limonada-con-hierbabuena-800x445.jpg.webp' },
  { id: 18, key: 'gin_tonic', name: 'Gin Tonic Clásico', description: 'Gin premium con tónica, limón y enebro', price: 28, category: 'bebidas', image: 'https://www.paulinacocina.net/wp-content/uploads/2022/05/gin-tonic-receta.jpg.webp' },
  { id: 19, key: 'suspiro', name: 'Suspiro a la Limeña', description: 'Manjar blanco y merengue, un clásico dulce peruano', price: 26, category: 'postres', image: 'https://www.eatperu.com/wp-content/uploads/2016/12/suspiro-Limeno-recipe-sweet-dessert.jpg' },
  { id: 20, key: 'tres_leches', name: 'Tres Leches', description: 'Bizcocho húmedo con mezcla de tres leches y canela', price: 24, category: 'postres', image: 'https://www.lemonblossoms.com/wp-content/uploads/2023/03/Tres-Leches-Cake-S2.jpg' },
  { id: 21, key: 'helado_artesanal', name: 'Helado Artesanal', description: 'Selección de sabores artesanales con frutas de estación', price: 22, category: 'postres', image: 'https://mejisa.com/wp-content/uploads/2019/04/helado-artesanal.jpg' },
];

export const getMenuItemByKey = (key: string): MenuItem | undefined => menuItems.find(item => item.key === key);