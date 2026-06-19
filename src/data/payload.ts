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
 * Keyword-matched product photography.
 *
 * Each image is fetched by *tag* (e.g. "cookies", "diaper") so the picture
 * actually depicts the item rather than being a random placeholder. `lock` pins
 * a specific result per product so the catalog looks stable across reloads
 * instead of reshuffling on every render.
 */
const shopImg = (tags: string, lock: number): string =>
  `https://loremflickr.com/400/400/${tags}?lock=${lock}`;

let productSeq = 0;
function product(
  title: string,
  price: number,
  /** Image search tag(s) describing the product, e.g. "banana,cookies". */
  tags: string,
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
    imageUrl: shopImg(tags, seq),
    action: { type: 'ADD_TO_CART', payload: { id, title, price } },
  };
}

const SNACKS: Product[] = [
  product('Banana Oat Cookies', 79, 'cookies', { mrp: 99, badge: '₹99 deal' }),
  product('Fruit Puree Pouch', 49, 'fruit,puree', { mrp: 65 }),
  product('Veggie Star Puffs', 89, 'snack', { badge: 'Bestseller' }),
  product('Mini Rice Crackers', 59, 'crackers', { mrp: 75 }),
  product('Apple Cinnamon Bites', 95, 'apple'),
  product('Cheesy Millet Sticks', 69, 'breadsticks', { mrp: 85 }),
];

const ESSENTIALS: Product[] = [
  product('Ultra-Soft Diapers (M)', 499, 'diaper', { mrp: 649, badge: 'Save 23%' }),
  product('Gentle Baby Wipes x72', 149, 'babycare', { mrp: 199 }),
  product('Tear-Free Shampoo', 229, 'shampoo'),
  product('Organic Cotton Onesie', 399, 'babyclothes', { badge: 'New' }),
];

const TOYS: Product[] = [
  product('Stacking Rainbow Rings', 349, 'toy', { mrp: 449 }),
  product('Wooden Shape Sorter', 599, 'woodentoy', { badge: 'Bestseller' }),
  product('Plush Elephant Buddy', 299, 'plush,toy', { mrp: 399 }),
  product('Bath-Time Squirters', 199, 'rubberduck'),
  product('Musical Activity Cube', 899, 'toy', { mrp: 1099 }),
];

const LUNCHBOXES: Product[] = [
  product('Leakproof Bento Box', 549, 'lunchbox', { mrp: 699, badge: 'Back to School' }),
  product('Insulated Sipper Bottle', 379, 'waterbottle', { mrp: 449 }),
  product('Dino Backpack (Small)', 799, 'backpack', { badge: 'New' }),
  product('Snack Pots Set of 3', 249, 'container', { mrp: 329 }),
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
        imageUrl: shopImg('baby,family', 901),
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
        imageUrl: shopImg('school,supplies', 902),
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
          imageUrl: shopImg(band % 2 === 0 ? 'delivery,box' : 'kids,shopping', 910 + band),
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
