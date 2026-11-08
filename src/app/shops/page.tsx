import type { Metadata } from 'next';
import ShopDirectory from './ShopDirectory';
import shops from '@/lib/shops/catalog.json';
export const metadata: Metadata = {
  title: 'Online Shop Directory',
  description: `Discover ${shops.length.toLocaleString('en-US')} online shops. Browse categories, explore storefronts, and save your favorites with Shopes.`,
  alternates: { canonical: 'https://shopes.online/shops' },
};
export default function ShopsPage() { return <ShopDirectory shops={shops} />; }
