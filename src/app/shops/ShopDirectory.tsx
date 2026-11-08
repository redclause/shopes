'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, Search, ShoppingBag, X } from 'lucide-react';
import { filterShops, readSaved, type Shop } from '@/lib/shops/directory';
import styles from './shops.module.css';
const KEY = 'shopes:saved-shops:v1';
const PAGE_SIZE = 24;
export default function ShopDirectory({ shops }: { shops: Shop[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All shops');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Shop | null>(null);
  const [storageNotice, setStorageNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const resultsHeading = useRef<HTMLDivElement>(null);
  const categories = useMemo(() => ['All shops', ...Array.from(new Set(shops.map(s => s.category))).sort()], [shops]);
  useEffect(() => {
    const known = new Set(shops.map(s => s.id));
    const restore = () => { try { setSaved(readSaved(localStorage.getItem(KEY), known)); } catch { setStorageNotice('Saved shops are available for this visit only.'); } };
    restore();
    window.addEventListener('storage', restore);
    return () => window.removeEventListener('storage', restore);
  }, [shops]);
  useEffect(() => {
    if (!selected) return;
    const element = dialog.current;
    element?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = old; trigger.current?.focus(); };
  }, [selected]);
  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { setStorageNotice('Saved shops are available for this visit only.'); }
  }
  const results = useMemo(() => filterShops(shops, query, category, savedOnly, saved), [shops, query, category, savedOnly, saved]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function reset() { setQuery(''); setCategory('All shops'); setSavedOnly(false); setPage(1); }
  function changePage(next: number) { setPage(next); resultsHeading.current?.scrollIntoView({ block: 'start' }); resultsHeading.current?.focus(); }
  return <div className={styles.root}>
    <header className={styles.header}><Link className={styles.brand} href="/"><ShoppingBag size={24} />shopes<span>.</span></Link><nav aria-label="Directory navigation"><Link href="/">SEO tools</Link><Link href="/blog">Journal</Link><button aria-pressed={savedOnly} onClick={() => { setSavedOnly(!savedOnly); setPage(1); }}><Bookmark size={16} /> Saved <span>{saved.length}</span></button></nav></header>
    <main className={styles.main}>
      <section className={styles.hero}><div className={styles.eyebrow}><span /> THE SHOPPING DIRECTORY</div><h1>A world of shops.<br /><em>Your next great find.</em></h1><p>Independent labels, everyday favorites, and new discoveries.<br />Find your next online shop, all in one place.</p><div className={styles.stats}><span><b>{shops.length.toLocaleString('en-US')}</b> online shops</span><span><b>{categories.length - 1}</b> categories</span><span>Free to explore</span></div></section>
      <section aria-label="Browse shops">
        <div className={styles.searchRow}><label className={styles.search}><Search size={20} /><input aria-label="Search shops" placeholder="Search shops, categories, or domains…" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />{query && <button aria-label="Clear search" onClick={() => { setQuery(''); setPage(1); }}><X size={18} /></button>}</label><label className={styles.select}>Category<select value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}>{categories.map(item => <option key={item}>{item}</option>)}</select></label></div>
        <div className={styles.tabs} ref={resultsHeading} tabIndex={-1}><button className={!savedOnly ? styles.active : ''} aria-pressed={!savedOnly} onClick={() => { setSavedOnly(false); setPage(1); }}>Explore all</button><button className={savedOnly ? styles.active : ''} aria-pressed={savedOnly} onClick={() => { setSavedOnly(true); setPage(1); }}><Bookmark size={15} /> Saved shops ({saved.length})</button><span aria-live="polite">{results.length.toLocaleString('en-US')} shops</span></div>
        {storageNotice && <p role="status">{storageNotice}</p>}
        <div className={styles.grid}>{visible.map(shop => <article className={styles.card} key={shop.id}><div className={styles.cardTop}><span className={styles.monogram} aria-hidden="true">{shop.name.slice(0, 2).toUpperCase()}</span><button className={styles.save} aria-label={`${saved.includes(shop.id) ? 'Unsave' : 'Save'} ${shop.name}`} aria-pressed={saved.includes(shop.id)} onClick={() => toggleSaved(shop.id)}><Bookmark size={19} fill={saved.includes(shop.id) ? 'currentColor' : 'none'} /></button></div><span className={styles.category}>{shop.category}</span><h2><button onClick={event => { trigger.current = event.currentTarget; setSelected(shop); }}>{shop.name}</button></h2><p className={styles.domain}>{shop.id}</p><div className={styles.cardBottom}><button aria-label={`Details for ${shop.name}`} onClick={event => { trigger.current = event.currentTarget; setSelected(shop); }}>Shop details</button><a href={shop.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${shop.name} (opens in new tab)`}>Visit shop <ArrowUpRight size={16} /></a></div></article>)}</div>
        {!results.length && <div className={styles.empty}><ShoppingBag size={32} /><h2>{savedOnly && !saved.length ? 'Your next favorites belong here.' : 'No shops found.'}</h2><p>{savedOnly && !saved.length ? 'Use the bookmark on any shop to save it on this browser.' : 'Try a different name or category.'}</p><button onClick={reset}>Explore all shops</button></div>}
        {results.length > 0 && <nav className={styles.pagination} aria-label="Shop pages"><button disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pages}</span><button disabled={currentPage === pages} onClick={() => changePage(currentPage + 1)}>Next</button></nav>}
      </section>
      <aside className={styles.note}><ShoppingBag size={20} /><div><strong>Real storefronts. A starting point for discovery.</strong><p>Listings are drawn from a July 2026 storefront directory. Individual shop details show when a direct storefront check is available. Inclusion is not an endorsement. Availability, delivery areas, and store policies can change. Saved shops stay in this browser.</p></div></aside>
    </main><footer className={styles.footer}><Link href="/">shopes.</Link><span>A little discovery goes a long way.</span><Link href="/privacy">Privacy</Link></footer>
    {selected && <dialog ref={dialog} className={styles.dialog} aria-labelledby="shop-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setSelected(null); } }}><button autoFocus className={styles.close} aria-label="Close shop details" onClick={() => setSelected(null)}><X size={22} /></button><span className={styles.monogram}>{selected.name.slice(0, 2).toUpperCase()}</span><p className={styles.category}>{selected.category}</p><h2 id="shop-title">{selected.name}</h2><p className={styles.domain}>{selected.id}</p><p>Explore this online storefront for its current catalog, prices, and availability. Check delivery and returns directly with the shop before ordering.</p><div className={styles.detailMeta}><span>{selected.checkedAt ? "Storefront links checked" : "Directory snapshot"}</span><b>{selected.checkedAt || "July 20, 2026"}</b></div>{!selected.checkedAt && <p>Current availability has not been independently confirmed.</p>}<a className={styles.visit} href={selected.url} target="_blank" rel="noopener noreferrer">Visit online shop <ArrowUpRight size={18} /></a><button className={styles.saveWide} aria-pressed={saved.includes(selected.id)} onClick={() => toggleSaved(selected.id)}><Bookmark size={17} />{saved.includes(selected.id) ? 'Saved to your shops' : 'Save this shop'}</button></dialog>}
  </div>;
}
