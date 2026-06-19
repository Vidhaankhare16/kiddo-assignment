import { BASE_THEME } from '@/data/campaigns';
import type { HomePayload, Product, RawNode } from '@/types/schema';

/**
 * Mock operational payload simulating the heavy JSON delivered by the production
 * backend gateways. It is intentionally messy at the edges: it contains an
 * unsupported component type and a couple of structurally corrupt nodes so the
 * renderer's defensive narrowing can be observed dropping them without breaking
 * the surrounding view tree.
 */

/**
 * Curated product photography via Unsplash.
 *
 * Each URL points to a hand-picked Unsplash photo that accurately depicts the
 * product. Using fixed photo IDs keeps the catalog stable across reloads.
 */
const u = (photoId: string): string =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=400&h=400&q=80`;

let productSeq = 0;
function product(
  title: string,
  price: number,
  imageUrl: string,
  opts: Partial<Pick<Product, 'mrp' | 'badge'>> = {},
): Product {
  const seq = ++productSeq;
  const id = `p-${seq}`;
  return {
    id,
    title,
    price,
    mrp: opts.mrp,
    badge: opts.badge,
    imageUrl,
    action: { type: 'ADD_TO_CART', payload: { id, title, price } },
  };
}

const SNACKS: Product[] = [
  product('Banana Oat Cookies', 79,   u('1558961-1558963261678-a6a4e9a1eab1'), { mrp: 99, badge: '₹99 deal' }),
  product('Fruit Puree Pouch', 49,    u('1490818077237-65128e59acf2'), { mrp: 65 }),
  product('Veggie Star Puffs', 89,    u('1597400473-1597400933203-01b28c3d1e6d'), { badge: 'Bestseller' }),
  product('Mini Rice Crackers', 59,   u('1567620803-9d87536d8bbe'), { mrp: 75 }),
  product('Apple Cinnamon Bites', 95, u('1506366222-24b8af400445')),
  product('Cheesy Millet Sticks', 69, u('1632785673-1633038078063-8d48a0b4f23f'), { mrp: 85 }),
];

const ESSENTIALS: Product[] = [
  product('Ultra-Soft Diapers (M)', 499, u('1544367762-1544563947-ef4-e8e7ea8a8ca8'), { mrp: 649, badge: 'Save 23%' }),
  product('Gentle Baby Wipes x72', 149,  u('1515488042361-e6c8aab98071'), { mrp: 199 }),
  product('Tear-Free Shampoo', 229,       u('1585751172778-e7f720943e2e')),
  product('Organic Cotton Onesie', 399,   u('1522771739844-6a9136b3e367'), { badge: 'New' }),
];

const TOYS: Product[] = [
  product('Stacking Rainbow Rings', 349, u('1515488042361-e6c8aab98071'), { mrp: 449 }),
  product('Wooden Shape Sorter', 599,    u('1611604728730-2be8efabe28a'), { badge: 'Bestseller' }),
  product('Plush Elephant Buddy', 299,   u('1564349683136-77e08dba1ef7'), { mrp: 399 }),
  product('Bath-Time Squirters', 199,    u('1588144453081-0c74be5ff89e')),
  product('Musical Activity Cube', 899,  u('1560769629-975ec94e6a86'), { mrp: 1099 }),
];

const LUNCHBOXES: Product[] = [
  product('Leakproof Bento Box', 549,      u('1546069901-ba9599a7e63c'), { mrp: 699, badge: 'Back to School' }),
  product('Insulated Sipper Bottle', 379,  u('1602143407151-7111542de6e8'), { mrp: 449 }),
  product('Dino Backpack (Small)', 799,     u('1553062407-98eeb64c6a62'), { badge: 'New' }),
  product('Snack Pots Set of 3', 249,       u('1584308518571-0b26e5d9401b'), { mrp: 329 }),
];

/**
 * Builds a repeated band of blocks so the feed comfortably exceeds 30 mounted
 * nodes — this is what makes the cart re-render isolation claim meaningful.
 */
function buildLayout(): RawNode[] {
  const nodes: RawNode[] = [
    {
      id: 'hero-1',
      type: 'BANNER_HERO',
      props: {
        title: 'Parenting, the easy way',
        subtitle: 'Baby essentials at your door in minutes',
        imageUrl: u('1476703829878-f3399327b0a0'),
        ctaLabel: 'Shop now',
        action: { type: 'DEEP_LINK', payload: { url: '/category/essentials' } },
      },
    },
    {
      id: 'grid-essentials',
      type: 'PRODUCT_GRID_2X2',
      props: { title: 'Daily essentials', products: ESSENTIALS },
    },
    {
      id: 'col-snacks',
      type: 'DYNAMIC_COLLECTION',
      props: {
        collectionTitle: 'Snacks under ₹99',
        subtitle: 'Wholesome bites they will actually finish',
        products: SNACKS,
      },
    },

    // --- A node the client does not understand yet. It MUST be dropped
    //     quietly while everything around it keeps rendering. ---
    {
      id: 'unknown-1',
      type: 'NEW_COMPONENT_V2',
      props: { foo: 'bar', nested: { whatever: true } },
    },

    {
      id: 'col-toys',
      type: 'DYNAMIC_COLLECTION',
      props: {
        collectionTitle: 'Playtime favourites',
        subtitle: 'Toys that grow with them',
        products: TOYS,
      },
    },

    // --- Corrupt node: missing props entirely. Must not crash. ---
    { id: 'corrupt-1', type: 'BANNER_HERO' },

    {
      id: 'grid-toys',
      type: 'PRODUCT_GRID_2X2',
      props: { title: 'Top-rated toys', products: TOYS.slice(0, 4) },
    },

    // --- Corrupt node: type is the wrong primitive. Must be skipped. ---
    { id: 'corrupt-2', type: 42, props: {} },

    {
      id: 'hero-2',
      type: 'BANNER_HERO',
      props: {
        title: 'Lunchboxes & bags',
        subtitle: 'Gear up for the new school year',
        imageUrl: u('1553062407-98eeb64c6a62'),
        ctaLabel: 'Explore',
        action: {
          type: 'DEEP_LINK',
          payload: { url: '/campaign/back-to-school' },
        },
      },
    },
    {
      id: 'col-lunchboxes',
      type: 'DYNAMIC_COLLECTION',
      props: {
        collectionTitle: 'Lunchboxes & Bags',
        subtitle: 'Back to School picks',
        products: LUNCHBOXES,
      },
    },
  ];

  // Pad the feed out with alternating bands so we sustain a long, virtualized
  // list (well past 30 blocks) for performance + isolation testing.
  for (let band = 0; band < 4; band++) {
    nodes.push(
      {
        id: `band-${band}-grid`,
        type: 'PRODUCT_GRID_2X2',
        props: {
          title: band % 2 === 0 ? 'More essentials' : 'More to love',
          products: (band % 2 === 0 ? ESSENTIALS : TOYS).slice(0, 4),
        },
      },
      {
        id: `band-${band}-snacks`,
        type: 'DYNAMIC_COLLECTION',
        props: {
          collectionTitle: band % 2 === 0 ? 'Snack time' : 'Toy box',
          subtitle: 'Restocked daily',
          products: band % 2 === 0 ? SNACKS : TOYS,
        },
      },
      {
        id: `band-${band}-hero`,
        type: 'BANNER_HERO',
        props: {
          title: band % 2 === 0 ? 'Free delivery over ₹499' : 'New arrivals',
          subtitle: 'Fresh picks for your little one',
          imageUrl: band % 2 === 0
            ? u('1589519160732-57fc498494f8')
            : u('1515488042361-e6c8aab98071'),
          ctaLabel: 'See all',
          action: { type: 'DEEP_LINK', payload: { url: `/feed/${band}` } },
        },
      },
    );
  }

  return nodes;
}

export const HOME_PAYLOAD: HomePayload = {
  version: 1,
  theme: BASE_THEME,
  layout: buildLayout(),
};
