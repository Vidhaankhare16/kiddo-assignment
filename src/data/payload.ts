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
 * product. Every photo id below has been verified to resolve (HTTP 200) so the
 * catalog renders fully — no broken tiles. Fixed ids keep it stable across
 * reloads. Requested at 400x400 (auto-format + crop) for crisp, light payloads.
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
  product('Banana Oat Cookies', 79,   u('1499636136210-6f4ee915583e'), { mrp: 99, badge: '₹99 deal' }),
  product('Fruit Puree Pouch', 49,    u('1559181567-c3190ca9959b'), { mrp: 65 }),
  product('Veggie Star Puffs', 89,    u('1542838132-92c53300491e'), { badge: 'Bestseller' }),
  product('Mini Rice Crackers', 59,   u('1568051243858-533a607809a5'), { mrp: 75 }),
  product('Apple Cinnamon Bites', 95, u('1567306226416-28f0efdc88ce')),
  product('Cheesy Millet Sticks', 69, u('1604908176997-125f25cc6f3d'), { mrp: 85 }),
];

const ESSENTIALS: Product[] = [
  product('Ultra-Soft Diapers (M)', 499, u('1583947581924-860bda6a26df'), { mrp: 649, badge: 'Save 23%' }),
  product('Gentle Baby Wipes x72', 149,  u('1620916566398-39f1143ab7be'), { mrp: 199 }),
  product('Tear-Free Shampoo', 229,       u('1556228578-8c89e6adf883')),
  product('Organic Cotton Onesie', 399,   u('1622290319146-7b63df48a635'), { badge: 'New' }),
];

const TOYS: Product[] = [
  product('Stacking Rainbow Rings', 349, u('1545558014-8692077e9b5c'), { mrp: 449 }),
  product('Wooden Shape Sorter', 599,    u('1596461404969-9ae70f2830c1'), { badge: 'Bestseller' }),
  product('Plush Elephant Buddy', 299,   u('1622290291468-a28f7a7dc6a8'), { mrp: 399 }),
  product('Bath-Time Squirters', 199,    u('1519689680058-324335c77eba')),
  product('Musical Activity Cube', 899,  u('1606107557195-0e29a4b5b4aa'), { mrp: 1099 }),
];

const LUNCHBOXES: Product[] = [
  product('Leakproof Bento Box', 549,      u('1546069901-ba9599a7e63c'), { mrp: 699, badge: 'Back to School' }),
  product('Insulated Sipper Bottle', 379,  u('1602143407151-7111542de6e8'), { mrp: 449 }),
  product('Dino Backpack (Small)', 799,     u('1553062407-98eeb64c6a62'), { badge: 'New' }),
  product('Snack Pots Set of 3', 249,       u('1584473457406-6240486418e9'), { mrp: 329 }),
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
        imageUrl: u('1492725764893-90b379c2b6e7'),
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
        imageUrl: u('1607522370275-f14206abe5d3'),
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
            ? u('1607344645866-009c320b63e0')
            : u('1503454537195-1dcabb73ffb9'),
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
