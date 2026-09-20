"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  increment
} from "firebase/firestore";

interface Product {
  id: string;
  price: number | string;
  description: { am: string; en: string; om: string };
  images: string[];
  type: string;
  subCategory: string;
  visible?: boolean;
}

interface TempSubCategory {
  id: string;
  type: string;
  enabled: boolean;
  order?: number;
  name: { am: string; en: string; om: string };
}

export default function UserPage() {
  const [lang, setLang] = useState<"am" | "en" | "om">("am");
  const [activeTab, setActiveTab] = useState(siteConfig.tabs[0]?.id || "surprise");
  const [activeSub, setActiveSub] = useState("all");

  const [userManuallySelected, setUserManuallySelected] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tempSubs, setTempSubs] = useState<TempSubCategory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // ===== THEME STATES =====
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode
  const [eventTheme, setEventTheme] = useState("none");
  const [eventEnabled, setEventEnabled] = useState(false);
  const [eventAnimation, setEventAnimation] = useState(true);
  const [eventParticles, setEventParticles] = useState(false);

  // Read Dark Mode Preference
  useEffect(() => {
    const cachedDark = localStorage.getItem(`${siteConfig.storagePrefix}_dark_mode`);
    if (cachedDark !== null) {
      setIsDarkMode(cachedDark === "true");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(`${siteConfig.storagePrefix}_dark_mode`, String(newMode));
  };

  // ===== TRACK USER PAGE VIEW =====
  useEffect(() => {
    const hasVisitedSession = sessionStorage.getItem(`${siteConfig.storagePrefix}_visited`);
    if (!hasVisitedSession) {
      setDoc(doc(db, "analytics", "overview"), { totalPageViews: increment(1) }, { merge: true })
        .catch((err) => console.error("Error recording page view:", err));
      sessionStorage.setItem(`${siteConfig.storagePrefix}_visited`, "true");
    }
  }, []);

  useEffect(() => {
    const cachedTheme = localStorage.getItem(`${siteConfig.storagePrefix}_theme_name`);
    const cachedEnabled = localStorage.getItem(`${siteConfig.storagePrefix}_theme_enabled`);
    if (cachedTheme) setEventTheme(cachedTheme);
    if (cachedEnabled !== null) setEventEnabled(cachedEnabled === "true");
  }, []);

  const [subCategoryOrder, setSubCategoryOrder] = useState<Record<string, string[]>>({});
  const [sortOption, setSortOption] = useState("priceLow");

  const t = siteConfig.translations[lang];

  useEffect(() => {
    return onSnapshot(collection(db, "temporarySubCategories"), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TempSubCategory));
      setTempSubs(data.filter(x => x.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999)));
    }, error => console.error("Temporary categories:", error));
  }, []);

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "eventTheme"), snapshot => {
      if (!snapshot.exists()) {
        setEventTheme("none");
        setEventEnabled(false);
        setEventAnimation(true);
        setEventParticles(false);
        return;
      }
      const data = snapshot.data();
      setEventTheme(data.event || "none");
      setEventEnabled(data.enabled === true);
      setEventAnimation(data.animation !== false);
      setEventParticles(data.particles === true);
    }, error => console.error("Event theme:", error));
  }, []);

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "subCategoryOrder"), snapshot => {
      if (snapshot.exists()) setSubCategoryOrder(snapshot.data().orders || {});
    }, error => console.error("Subcategory order:", error));
  }, []);

  const getSubCategoriesForTab = (tab: string) => {
    const configTab = siteConfig.tabs.find(t => t.id === tab);
    const normal = configTab ? configTab.defaultSubs : ["all"];
    const temporary = tempSubs.filter(x => x.type === tab).map(x => x.id);
    const available = [...normal, ...temporary];
    const saved = subCategoryOrder[tab] || [];

    return [
      ...saved.filter(id => available.includes(id)),
      ...available.filter(id => !saved.includes(id))
    ];
  };

  const sortProductList = (items: Product[]) => {
    return [...items].sort((a, b) => {
      if (sortOption === "priceLow") return Number(a.price) - Number(b.price);
      if (sortOption === "priceHigh") return Number(b.price) - Number(a.price);
      return 0;
    });
  };

  const getSubCategories = () => getSubCategoriesForTab(activeTab);

  const getSubName = (sub: string) => {
    const temp = tempSubs.find(x => x.id === sub);
    if (temp) return temp.name?.[lang] || temp.name?.en || "Special";
    return (t.subs as any)[activeTab]?.[sub] || sub;
  };

  useEffect(() => {
    setUserManuallySelected(false);
  }, [activeTab]);

  useEffect(() => {
    if (!userManuallySelected) {
      const orderedSubs = getSubCategoriesForTab(activeTab);
      if (orderedSubs.length > 0) {
        setActiveSub(orderedSubs[0] === "all" && orderedSubs.length > 1 ? orderedSubs[1] : orderedSubs[0]);
      }
    }
  }, [activeTab, subCategoryOrder, tempSubs, userManuallySelected]);

  useEffect(() => {
    setIsDataLoading(true);
    const q = query(collection(db, "products"), where("type", "==", activeTab));

    return onSnapshot(q, snapshot => {
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images || (doc.data().imageUrl ? [doc.data().imageUrl] : [])
      } as Product));

      data = Array.from(new Map(data.map(item => [item.id, item])).values());
      data = data.filter(p => p.visible !== false);
      if (activeSub !== "all") data = data.filter(p => p.subCategory === activeSub);

      setProducts(sortProductList(data));
      setIsDataLoading(false);
    });
  }, [activeTab, activeSub, sortOption]);

  const handleOrder = (p: Product, index: number) => {
    setLoadingId(p.id);

    setDoc(doc(db, "analytics", "overview"), {
      totalOrdersClicked: increment(1),
      [`packageClicks.${p.id}`]: increment(1)
    }, { merge: true }).catch((err) => console.error("Error updating metrics:", err));

    const configTab = siteConfig.tabs.find(t => t.id === p.type);
    const titlePrefix = configTab ? configTab.prefix : "PKG";
    const categoryName = getSubName(p.subCategory);
    
    const packageName = `${titlePrefix} ${index + 1} (${categoryName.toUpperCase()} - ${Number(p.price).toLocaleString()} ETB)`;
    const phrase = (t.orderPhrases as any)[p.type] || t.orderPhrases.default;
    const desc = p.description[lang] || p.description.am || p.description.en;
    const message = `ሰላም @${siteConfig.telegramUsername}፣\n\n${phrase}\n\n*${packageName}*\n${desc}\n\n${t.callToAction}`;

    window.open(`https://t.me/${siteConfig.telegramUsername}?text=${encodeURIComponent(message)}`, "_blank");
    setTimeout(() => setLoadingId(null), 2000);
  };

  return (
    <div suppressHydrationWarning className={`min-h-screen ${isDarkMode ? "dark" : ""} ${eventEnabled && eventTheme !== "none" ? `theme-${eventTheme}` : ""} theme-page flex flex-col transition-colors`}>

      {eventEnabled && eventParticles && (
        <div className="event-particles">
          {[...Array(15)].map((_, i) => <span key={i}></span>)}
        </div>
      )}

      <header className="bg-[var(--surface-card)] border-b border-[var(--border-subtle)] shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={siteConfig.logoUrl} alt={siteConfig.name.en} className="h-14 sm:h-16 md:h-[70px] w-auto object-contain" />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide text-[var(--brand-gold)]">
                {siteConfig.name[lang].split(" ")[0]}
              </span>
              <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold tracking-[0.15em] text-[var(--text-muted)] mt-1 uppercase">
                {siteConfig.name[lang].split(" ").slice(1).join(" ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* DARK MODE TOGGLE */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--brand-gold)] transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? "🌞" : "🌙"}
            </button>

            <div className="flex gap-1.5 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-1 rounded-full transition-colors">
              {(["am", "en", "om"] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-3 py-1 rounded-full font-bold text-xs transition-colors ${
                    lang === code ? "bg-[var(--brand-gold)] text-[var(--text-on-gold)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {code === "am" ? "አማ" : code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-gold-dark)]">
            {t.collectionTitle}
          </h1>
        </div>

        {/* Dynamic Tabs Menu */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {siteConfig.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full font-bold border-2 text-sm md:text-base transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--brand-gold)] text-[var(--text-on-gold)] border-[var(--brand-gold)] shadow-lg"
                  : "bg-transparent text-[var(--brand-gold)] border-[var(--brand-gold)] hover:bg-[var(--surface-secondary)]"
              }`}
            >
              {(t.tabs as any)[tab.id]}
            </button>
          ))}
        </div>

        {/* Dynamic Subcategory Menu */}
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {getSubCategories().map((sub, index) => (
            <button
              key={`${sub}-${index}`}
              onClick={() => { setActiveSub(sub); setUserManuallySelected(true); }}
              className={`px-4 py-1.5 rounded-xl text-xs md:text-sm font-semibold border transition-colors ${
                activeSub === sub
                  ? "bg-[var(--brand-gold)] text-[var(--text-on-gold)] border-[var(--brand-gold)] shadow-md"
                  : "bg-[var(--surface-secondary)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {getSubName(sub)}
            </button>
          ))}
        </div>

        {/* Sorting Menu */}
        <div className="flex justify-end items-center mb-6 px-1">
          <div className="flex items-center gap-2 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl shadow-sm transition-colors">
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
            </svg>
            <select
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value); setProducts((prev) => sortProductList(prev)); }}
              className="bg-transparent text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="priceLow" className="bg-[var(--brand-bg)] text-[var(--text-primary)]">⬆️ Low to high</option>
              <option value="priceHigh" className="bg-[var(--brand-bg)] text-[var(--text-primary)]">⬇️ High to low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isDataLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl md:rounded-3xl p-4 aspect-[3/4] animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-[var(--surface-secondary)] rounded-xl mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-[var(--surface-secondary)] rounded w-1/2"></div>
                  <div className="h-3 bg-[var(--surface-secondary)] rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] font-medium">
            No items found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((p, index) => {
              const configTab = siteConfig.tabs.find(t => t.id === p.type);
              const titlePrefix = configTab ? configTab.prefix : "PKG";

              return (
                <div
                  key={p.id}
                  className={`theme-card bg-[var(--surface-card)] rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 shadow-sm border border-[var(--border-subtle)] flex flex-col h-full min-w-0 hover:shadow-md transition-shadow ${
                    eventAnimation ? "theme-animate" : ""
                  }`}
                >
                  <div onClick={() => setSelectedProduct(p)} className="w-full aspect-square overflow-hidden rounded-xl md:rounded-2xl cursor-pointer group relative">
                    <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`${titlePrefix} ${index + 1}`} />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md z-10 border border-white/10">
                      <span className="text-[10px] sm:text-xs text-white font-bold uppercase tracking-wider">
                        {titlePrefix} {index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 pt-3 px-1">
                    <div>
                      <div className="mb-1.5">
                        <span className="text-base sm:text-lg md:text-xl font-black text-[var(--brand-gold)] block">
                          {Number(p.price).toLocaleString()} ETB
                        </span>
                      </div>
                      <p 
                        onClick={() => setSelectedProduct(p)}
                        className="text-[11px] sm:text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 min-h-[50px] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                      >
                        {p.description[lang]}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOrder(p, index)}
                      disabled={loadingId === p.id}
                      className={`w-full mt-4 py-2 sm:py-2.5 md:py-3 text-[9px] sm:text-xs md:text-sm font-extrabold rounded-lg md:rounded-xl transition-all shadow-lg ${
                        loadingId === p.id ? "bg-amber-500 text-white" : "bg-[var(--brand-gold)] text-[var(--text-on-gold)] hover:opacity-95 hover:shadow-[0_0_15px_var(--event-glow)]"
                      }`}
                    >
                      {loadingId === p.id ? t.orderSuccess : t.orderButton}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-[var(--surface-card)] text-[var(--text-secondary)] mt-12 py-10 px-4 md:px-6 lg:px-10 border-t border-[var(--border-subtle)] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-[var(--brand-gold)] mb-2">
              {siteConfig.name[lang]}
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-md mb-4">
              {siteConfig.about[lang]}
            </p>

            <div className="flex justify-center md:justify-start gap-4">
              <a href={siteConfig.tiktokUrl} target="_blank" className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
              <a href={siteConfig.instagramUrl} target="_blank" className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={siteConfig.telegramChannel} target="_blank" className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.285-.346-.096l-6.405 4.026-2.76-.86c-.6-.188-.615-.6.128-.89l10.816-4.167c.5-.188.943.116.807.905z"/></svg>
              </a>
            </div>

            <div className="text-xs md:text-sm text-[var(--text-muted)] mt-5 space-y-2">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                {t.footerContact}: <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-[var(--text-primary)] underline">{siteConfig.phoneDisplay}</a>
              </p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${siteConfig.mapSearchQuery}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 hover:text-[var(--brand-gold)] transition-colors">
                <svg className="w-4 h-4 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {siteConfig.locationName[lang]}
              </a>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-[var(--text-muted)]">
            <p className="mb-3">
              Developed by <a href="https://t.me/temesgenwalelign" target="_blank" className="text-[var(--brand-gold)] font-bold">Temesgen Walelgn</a> {" | "} <a href="tel:+251993370491">+251 993 370 491</a>
            </p>
            <p>© {new Date().getFullYear()} {siteConfig.name[lang]}. {t.footerRights}</p>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-6" onClick={() => setSelectedProduct(null)}>
          <div className="relative w-full max-w-5xl bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] transition-colors" onClick={e => e.stopPropagation()}>
            <GalleryView 
              product={selectedProduct} 
              lang={lang} 
              onClose={() => setSelectedProduct(null)}
              onOrder={() => handleOrder(selectedProduct, products.findIndex(p => p.id === selectedProduct.id))}
              orderText={t.orderButton}
              successText={t.orderSuccess}
              isOrdering={loadingId === selectedProduct.id}
            />
          </div>
        </div>
      )}

    </div>
  );
}

function GalleryView({ product, lang, onClose, onOrder, orderText, successText, isOrdering }: any) {
  const [main, setMain] = useState(product.images[0]);

  useEffect(() => {
    setMain(product.images[0]);
  }, [product]);

  const configTab = siteConfig.tabs.find(t => t.id === product.type);
  const titlePrefix = configTab ? configTab.galleryTitle : "Package Detail";

  return (
    <>
      <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-full font-bold transition-colors z-10">✕</button>

      <div className="w-full md:w-1/2 flex flex-col bg-[var(--brand-bg)] border-b md:border-b-0 md:border-r border-[var(--border-subtle)] transition-colors">
        <div className="w-full h-[40vh] md:h-[60vh] relative flex items-center justify-center p-4 md:p-8">
          <img src={main} className="w-full h-full object-contain drop-shadow-lg rounded-lg" alt="Product view" />
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-3 justify-center overflow-x-auto p-4 bg-[var(--surface-secondary)] border-t border-[var(--border-subtle)] transition-colors">
            {product.images.map((img: string, i: number) => (
              <button
                key={`${img}-${i}`}
                onClick={() => setMain(img)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  main === img ? "border-[var(--brand-gold)] scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 lg:p-10 max-h-[50vh] md:max-h-none overflow-y-auto">
        <div className="mb-6 pr-8">
          <span className="inline-block px-3 py-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest rounded-md mb-3 transition-colors">
            {titlePrefix}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--brand-gold)] tracking-tight">
            {Number(product.price).toLocaleString()} ETB
          </h2>
        </div>

        <div className="flex-1 mb-8">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Package Includes:</h3>
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {product.description[lang] || product.description.en || product.description.am}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-[var(--border-subtle)] transition-colors">
          <button
            onClick={onOrder}
            disabled={isOrdering}
            className={`w-full py-3.5 md:py-4 text-sm md:text-base font-extrabold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
              isOrdering ? "bg-amber-500 text-white" : "bg-[var(--brand-gold)] text-[var(--text-on-gold)] hover:opacity-95"
            }`}
          >
            {isOrdering ? successText : orderText}
          </button>
        </div>
      </div>
    </>
  );
}