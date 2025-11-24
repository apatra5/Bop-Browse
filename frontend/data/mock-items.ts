export interface Item {
  id: string;
  name: string;
  // Legacy fields still referenced in components
  brand_code?: string;
  brand_name?: string; // Will mirror designer_name when present
  image_url: string; // Fully qualified URL for primary image
  image_url_suffix?: string; // Raw suffix path returned by API
  product_detail_url?: string;
  designer_name?: string;
  price?: string; // e.g. "$548.00"
  color?: string;
  stretch?: string | null; // e.g. "Non-Stretch" or null
  product_images?: string[]; // Array of raw suffix paths
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export const MOCK_ITEMS: Item[] = [
  {
    id: 'ITEM001',
    name: 'Floral Summer Dress',
    brand_code: 'FREEPEOPLE',
    brand_name: 'Free People',
    image_url: 'https://picsum.photos/400/600?random=1',
    categories: [
      { id: '74369', name: 'Dresses' },
      { id: '74401', name: 'Summer' },
    ],
  },
  {
    id: 'ITEM002',
    name: 'Classic White T-Shirt',
    brand_code: 'RAILS',
    brand_name: 'Rails',
    image_url: 'https://picsum.photos/400/600?random=2',
    categories: [
      { id: '74373', name: 'Tops' },
    ],
  },
  {
    id: 'ITEM003',
    name: 'High-Waisted Jeans',
    brand_code: 'LEVIS',
    brand_name: "Levi's",
    image_url: 'https://picsum.photos/400/600?random=3',
    categories: [
      { id: '13255', name: 'Jeans' },
    ],
  },
  {
    id: 'ITEM004',
    name: 'Leather Jacket',
    brand_code: 'ALLSAINTS',
    brand_name: 'AllSaints',
    image_url: 'https://picsum.photos/400/600?random=4',
    categories: [
      { id: '13256', name: 'Jackets & Coats' },
    ],
  },
  {
    id: 'ITEM005',
    name: 'Midi Skirt',
    brand_code: 'ZARA',
    brand_name: 'Zara',
    image_url: 'https://picsum.photos/400/600?random=5',
    categories: [
      { id: '13246', name: 'Skirts' },
    ],
  },
  {
    id: 'ITEM006',
    name: 'Cashmere Sweater',
    brand_code: 'EVERLANE',
    brand_name: 'Everlane',
    image_url: 'https://picsum.photos/400/600?random=6',
    categories: [
      { id: '13244', name: 'Sweaters & Knits' },
    ],
  },
  {
    id: 'ITEM007',
    name: 'Yoga Pants',
    brand_code: 'LULULEMON',
    brand_name: 'Lululemon',
    image_url: 'https://picsum.photos/400/600?random=7',
    categories: [
      { id: '74387', name: 'Activewear' },
      { id: '13247', name: 'Pants & Leggings' },
    ],
  },
  {
    id: 'ITEM008',
    name: 'Silk Blouse',
    brand_code: 'EQUIPMENT',
    brand_name: 'Equipment',
    image_url: 'https://picsum.photos/400/600?random=8',
    categories: [
      { id: '74373', name: 'Tops' },
    ],
  },
  {
    id: 'ITEM009',
    name: 'Trench Coat',
    brand_code: 'BURBERRY',
    brand_name: 'Burberry',
    image_url: 'https://picsum.photos/400/600?random=9',
    categories: [
      { id: '13256', name: 'Jackets & Coats' },
    ],
  },
  {
    id: 'ITEM010',
    name: 'Maxi Dress',
    brand_code: 'REFORMATION',
    brand_name: 'Reformation',
    image_url: 'https://picsum.photos/400/600?random=10',
    categories: [
      { id: '74369', name: 'Dresses' },
    ],
  },
];