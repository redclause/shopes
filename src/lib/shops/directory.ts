export type Shop = { id: string; name: string; url: string; category: string; checkedAt: string | null };
export function filterShops(shops: Shop[], query: string, category: string, savedOnly: boolean, saved: string[]) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return shops.filter(shop => (category === 'All shops' || shop.category === category)
    && (!savedOnly || saved.includes(shop.id))
    && words.every(word => `${shop.name} ${shop.id} ${shop.category}`.toLowerCase().includes(word)));
}
export function readSaved(value: string | null, knownIds: Set<string>): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))] : [];
  } catch { return []; }
}
