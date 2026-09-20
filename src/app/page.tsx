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
  flowerCount?: string | number;
  visible?: boolean;
  createdAt?: any;
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
  const [activeTab, setActiveTab] = useState("surprise");
  const [activeSub, setActiveSub] = useState("all");

  // Track if the user manually clicked a subcategory
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [tempSubs, setTempSubs] = useState<TempSubCategory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // ===== EVENT THEME STATE (Hydration-Safe) =====
  const [eventTheme, setEventTheme] = useState("none");
  const [eventEnabled, setEventEnabled] = useState(false);
  const [eventAnimation, setEventAnimation] = useState(true);
  const [eventParticles, setEventParticles] = useState(false);

  // ===== TRACK USER PAGE VIEW (1 Count Per Browser Session) =====
  useEffect(() => {
    const hasVisitedSession = sessionStorage.getItem("golden_visited_session");
    if (!hasVisitedSession) {
      const analyticsRef = doc(db, "analytics", "overview");
      setDoc(
        analyticsRef,
        {
          totalPageViews: increment(1)
        },
        { merge: true }
      ).catch((err) => console.error("Error recording page view:", err));

      sessionStorage.setItem("golden_visited_session", "true");
    }
  }, []);

  // Sync cache immediately on client mount
  useEffect(() => {
    const cachedTheme = localStorage.getItem("golden_event_theme");
    const cachedEnabled = localStorage.getItem("golden_event_enabled");
    if (cachedTheme) setEventTheme(cachedTheme);
    if (cachedEnabled !== null) setEventEnabled(cachedEnabled === "true");
  }, []);

  // ===== PACKAGE / SUBCATEGORY MANAGEMENT =====
  const [subCategoryOrder, setSubCategoryOrder] = useState<Record<string, string[]>>({});
  const [sortOption, setSortOption] = useState("priceLow");

  const translations = {
    am: {
      brandName: siteConfig.name.am,
      tagline: siteConfig.tagline.am,
      footerAbout: siteConfig.about.am,
      collectionTitle: "የአማራጮቻችንን ይመልከቱ",
      orderButton: "አሁኑኑ ይዘዙ",
      orderSuccess: "ትዕዛዝ ተልኳል! ✅",
      footerContact: "እኛን ለማግኘት",
      location: siteConfig.locationName.am,
      footerRights: "መብቱ በህግ የተጠበቀ ነው።",
      tabs: {
        surprise: "የሰርፕራይዝ ጥቅል",
        decor: "ዲኮር", // Fixed typo here (was dicor)
        goldenstore: "ጎልደን ገበያ"
      },
      subs: {
        decor: {
          all: "ሁሉም",
          wedding: "ሰርግ",
          shimigilina: "ሽምግልና",
          birthday: "ልደት",
          anniversery: "አንቨርሰሪ በዓል",
          graduation: "ምረቃ"
        },
        goldenstore: {
          all: "ሁሉም",
          mens: "ለወንድ",
          womans: "ለሴት",
        },
        surprise: {
          all: "ሁሉም",
          men: "ለወንዶች",
          women: "ለሴቶች",
          children: "ለህፃናት",
          father: "ለአባት",
          mother: "ለእናት",
          "new born": "ለአራስ"
        }
      },
      orderPhrases: {
        surprise: "ዌብሳይታችሁ ላይ ካየሁት አስገራሚ ፓኬጅ ውስጥ ይሄንን ማዘዝ እፈልጋለው",
        decor: "ዌብሳይታችሁ ላይ ካየሁት የዲኮር ስራ ውስጥ ይሄንን ማዘዝ እፈልጋለው", // Updated
        goldenstore: "ዌብሳይታችሁ ላይ ካየሁት የጎልደን ገበያ እቃ ውስጥ ይሄንን ማዘዝ እፈልጋለው", // Updated
        default: "ዌብሳይታችሁ ላይ ካየሁት ፓኬጅ ውስጥ ይሄንን ማዘዝ እፈልጋለው"
      },
      callToAction: "አመሰግናለው"
    },

    en: {
      brandName: siteConfig.name.en,
      tagline: siteConfig.tagline.en,
      footerAbout: siteConfig.about.en,
      collectionTitle: "Our Collection",
      orderButton: "Order Now",
      orderSuccess: "Order Sent! ✅",
      footerContact: "Contact Us",
      location: siteConfig.locationName.en,
      footerRights: "All rights reserved.",
      tabs: {
        surprise: "Surprise pkg",
        decor: "Decor",
        goldenstore: "Golden Store"
      },
      subs: {
        decor: {
          all: "All",
          wedding: "For Wedding",
          shimigilina: "For Engagement",
          birthday: "For Birthday",
          anniversery: "For Anniversary",
          graduation: "For Graduation"
        },
        goldenstore: {
          all: "All",
          mens: "For men",
          womans: "For woman",
        },
        surprise: {
          all: "All",
          men: "For Men",
          women: "For Women",
          children: "For Children",
          father: "For Father",
          mother: "For Mother",
          "new born": "New Born"
        }
      },
      orderPhrases: {
        surprise: "Hello, I would like to order this surprise package from your website:",
        decor: "Hello, I would like to order this event decor from your website:",
        goldenstore: "Hello, I would like to order this golden store item from your website:",
        default: "Hello, I would like to order this package from your website:"
      },
      callToAction: "Thank you"
    },

    om: {
      brandName: siteConfig.name.om,
      tagline: siteConfig.tagline.om,
      footerAbout: siteConfig.about.om,
      collectionTitle: "Walitti Qabama Keenya",
      orderButton: "Ajajaa",
      orderSuccess: "Ajajni Ergame! ✅",
      footerContact: "Nu Quunnamaa",
      location: siteConfig.locationName.om,
      footerRights: "Mirgi hunduu eegamaadha.",
      tabs: {
        surprise: "surprisee",
        decor: "decoraa",
        goldenstore: "ጎልደን ገበያ"
      },
      subs: {
        decor: {
          all: "Hunda",
          wedding: "Guyyaa Gaa'elaa",
          shimigilina: "Kadhannaa",
          birthday: "Guyyaa Dhalootaa",
          anniversery: "Ayyaana Waggaa",
          graduation: "Eebbifa"
        },
        goldenstore: {
          all: "Hunda",
          mens: "Dhiira",
          womans: "Dubara",
        },
        surprise: {
          all: "Hunda",
          men: "Dhiira",
          women: "Dubara",
          children: "Ijoollee",
          father: "Abbaa",
          mother: "Haadha",
          "new born": "Mucaa Haarawa"
        }
      },
      orderPhrases: {
        surprise: "Marsariitii keessan irraa paakajeetii dinqisiisaa kana ajajuu barbaada:",
        decor: "Marsariitii keessan irraa decoraa kana ajajuu barbaada:",
        goldenstore: "Akkam jirtu, marsariitii keessanirraa goldenstore irraa kana ajajuun barbaada:",
        default: "Marsariitii keessan irraa kana ajajuu barbaada:"
      },
      callToAction: "Galatoomaa"
    }
  };

  // Load temporary categories in real time
  useEffect(() => {
    return onSnapshot(
      collection(db, "temporarySubCategories"),
      snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TempSubCategory));

        setTempSubs(
          data
            .filter(x => x.enabled)
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        );
      },
      error => console.error("Temporary categories:", error)
    );
  }, []);

  // ===== LOAD EVENT THEME IN REAL TIME (SYNC CACHE) =====
  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "eventTheme"),
      snapshot => {
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

        // Keep local cache synced with Firebase to prevent flash
        if (typeof window !== "undefined") {
          localStorage.setItem("golden_event_theme_name", data.event || "none");
          localStorage.setItem("golden_event_theme_enabled", data.enabled === true ? "true" : "false");
        }
      },
      error => console.error("Event theme:", error)
    );
  }, []);

  // ===== LOAD ADMIN SUBCATEGORY ORDER =====
  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "subCategoryOrder"),
      snapshot => {
        if (snapshot.exists()) {
          setSubCategoryOrder(snapshot.data().orders || {});
        }
      },
      error => console.error("Subcategory order:", error)
    );
  }, []);

  // Updated to match Golden Event categories
  const getDefaultSubCategories = (tab: string) => {
    if (tab === "decor") {
      return ["all", "wedding", "shimigilina", "birthday", "anniversery", "graduation"];
    }

    if (tab === "goldenstore") {
      return ["all", "mens", "womans"];
    }

    return ["all", "men", "women", "children", "father", "mother", "new born"];
  };

  const getSubCategoriesForTab = (tab: string) => {
    const normal = getDefaultSubCategories(tab);
    const temporary = tempSubs
      .filter(x => x.type === tab)
      .map(x => x.id);

    const available = [...normal, ...temporary];
    const saved = subCategoryOrder[tab] || [];

    return [
      ...saved.filter(id => available.includes(id)),
      ...available.filter(id => !saved.includes(id))
    ];
  };

  const sortProductList = (items: Product[]) => {
    return [...items].sort((a, b) => {
      if (sortOption === "priceLow") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOption === "priceHigh") {
        return Number(b.price) - Number(a.price);
      }

      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;

      return sortOption === "oldest" ? aTime - bTime : bTime - aTime;
    });
  };

  const getSubCategories = () => getSubCategoriesForTab(activeTab);

  const getSubName = (sub: string) => {
    const temp = tempSubs.find(x => x.id === sub);

    if (temp) {
      return temp.name?.[lang] || temp.name?.en || "Special";
    }

    return (translations[lang].subs as any)[activeTab][sub];
  };

  // Reset manual selection when the main tab changes
  useEffect(() => {
    setUserManuallySelected(false);
  }, [activeTab]);

  // Set the default subcategory to the FIRST item in the admin's sorted list
  useEffect(() => {
    if (!userManuallySelected) {
      const orderedSubs = getSubCategoriesForTab(activeTab);
      if (orderedSubs.length > 0) {
        if (orderedSubs[0] === "all" && orderedSubs.length > 1) {
          setActiveSub(orderedSubs[1]);
        } else {
          setActiveSub(orderedSubs[0]);
        }
      }
    }
  }, [activeTab, subCategoryOrder, tempSubs, userManuallySelected]);

  useEffect(() => {
    setIsDataLoading(true);
    const q = query(
      collection(db, "products"),
      where("type", "==", activeTab)
    );

    return onSnapshot(q, snapshot => {
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images || (doc.data().imageUrl ? [doc.data().imageUrl] : [])
      } as Product));

      // Remove duplicate products by Firestore document ID
      data = Array.from(
        new Map(data.map(item => [item.id, item])).values()
      );

      data = data.filter(p => p.visible !== false);

      if (activeSub !== "all")
        data = data.filter(p => p.subCategory === activeSub);

      setProducts(sortProductList(data));
      setIsDataLoading(false);
    });
  }, [activeTab, activeSub, sortOption]);

  const handleOrder = (p: Product, index: number) => {
    setLoadingId(p.id);

    const analyticsRef = doc(db, "analytics", "overview");
    setDoc(
      analyticsRef,
      {
        totalOrdersClicked: increment(1),
        [`packageClicks.${p.id}`]: increment(1)
      },
      { merge: true }
    ).catch((err) => console.error("Error updating order metrics:", err));

    // Updated prefixes for Golden Event
    const titlePrefix = p.type === "decor" ? "DCR" : p.type === "goldenstore" ? "GLD" : "PKG";
    const temp = tempSubs.find((x) => x.id === p.subCategory);
    const categoryName = temp?.name?.[lang] || p.subCategory;
    const packageName = `${titlePrefix} ${index + 1} (${categoryName.toUpperCase()} - ${Number(
      p.price
    ).toLocaleString()} ETB)`;

    const telegramUsername = siteConfig.telegramUsername;

    const phrases = translations[lang].orderPhrases as Record<string, string>;
    const phrase = phrases[p.type] || phrases.default;
    const desc = p.description[lang] || p.description.am || p.description.en;
    const message = `ሰላም @${telegramUsername}፣\n\n${phrase}\n\n*${packageName}*\n${desc}\n\n${translations[lang].callToAction}`;

    window.open(
      `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setTimeout(() => setLoadingId(null), 2000);
  };

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen ${
        eventEnabled && eventTheme !== "none"
          ? `theme-${eventTheme}`
          : ""
      } theme-page flex flex-col`}
    >

      {eventEnabled && eventParticles && (
        <div className="event-particles">
          {[...Array(15)].map((_, i) => (
            <span key={i}></span>
          ))}
        </div>
      )}

      <header className="bg-[var(--brand-light)] border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.name.en}
              className="h-14 sm:h-16 md:h-[70px] w-auto object-contain"
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide text-[var(--brand-green)]">
                {siteConfig.name.en.split(" ")[0]}
              </span>
              <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold tracking-[0.15em] text-gray-500 mt-1 uppercase">
                {siteConfig.name.en.split(" ").slice(1).join(" ")}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-full border">

            {(["አማርኛ", "English", "Afaan Oromoo"] as const).map((l, index) => {
              const code =
                l === "አማርኛ"
                  ? "am"
                  : l === "English"
                  ? "en"
                  : "om";

              return (
                <button
                  key={`${l}-${index}`}
                  onClick={() => setLang(code)}
                  className={`px-3 py-1 rounded-full font-bold text-xs ${
                    lang === code
                      ? "bg-[var(--event-primary)] text-white"
                      : "text-gray-600"
                  }`}
                >
                  {code === "am"
                    ? "አማ"
                    : code === "en"
                    ? "EN"
                    : "OM"}
                </button>
              );
            })}

          </div>

        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">

        <div className="text-center mb-8">

          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--event-secondary)] to-[var(--event-primary)]">
            {translations[lang].collectionTitle}
          </h1>

        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          
          {/* UPDATED TO MATCH NEW TABS */}
          {(["surprise", "decor", "goldenstore"] as const).map((tab, index) => (

            <button
              key={`${tab}-${index}`}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full font-bold border-2 text-sm md:text-base ${
                activeTab === tab
                  ? "bg-[var(--event-primary)] text-white border-[var(--event-primary)] shadow-lg"
                  : "bg-[var(--brand-light)] text-[var(--event-primary)] border-[var(--event-primary)]"
              }`}
            >
              {translations[lang].tabs[
                tab as keyof typeof translations.am.tabs
              ]}
            </button>

          ))}

        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-8">

          {getSubCategories().map((sub, index) => (

            <button
              key={`${sub}-${index}`}
              onClick={() => {
                setActiveSub(sub);
                setUserManuallySelected(true); 
              }}
              className={`px-4 py-1.5 rounded-xl text-xs md:text-sm font-semibold ${
                activeSub === sub
                  ? "bg-[var(--text-dark)] text-white shadow-md"
                  : "bg-[var(--brand-light)] text-gray-500"
              }`}
            >
              {getSubName(sub)}
            </button>

          ))}

        </div>

        {/* Sorting Menu */}
        <div className="flex justify-end items-center mb-6 px-1">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
            </svg>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setProducts((prev) => sortProductList(prev));
              }}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer"
              title="Sort packages"
            >
              <option value="priceLow">⬆️ Low to high price</option>
              <option value="priceHigh">⬇️ High to low price</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isDataLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-gray-100 rounded-2xl md:rounded-3xl p-4 aspect-[3/4] animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            No items found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">

            {products.map((p, index) => {

              // Updated prefixes for cards
              const title = p.type === "decor" ? "DCR" : p.type === "goldenstore" ? "GLD" : "PKG";

              return (

                <div
                  key={`${p.id}-${index}`}
                  className={`theme-card bg-[var(--brand-light)] rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 flex flex-col h-full min-w-0 hover:shadow-md transition-shadow ${
                    eventAnimation ? "theme-animate" : ""
                  }`}
                >

                  <div
                    onClick={() => setSelectedProduct(p)}
                    className="w-full aspect-square overflow-hidden rounded-xl md:rounded-2xl cursor-pointer group relative"
                  >
                    <img
                      src={p.images[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={`${title} ${index + 1}`}
                    />
                    
                    {/* Floating Label (PKG / DCR / GLD) */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md z-10">
                      <span className="text-[10px] sm:text-xs text-white font-bold uppercase tracking-wider">
                        {title} {index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 pt-3 px-1">
                    <div>
                      {/* Price */}
                      <div className="mb-1.5">
                        <span className="text-base sm:text-lg md:text-xl font-black text-[var(--event-primary)] block">
                          {Number(p.price).toLocaleString()} ETB
                        </span>
                      </div>

                      <p 
                        onClick={() => setSelectedProduct(p)}
                        className="text-[11px] sm:text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3 min-h-[50px] cursor-pointer hover:text-gray-900 transition-colors"
                        title="Click to read full description"
                      >
                        {p.description[lang]}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOrder(p, index)}
                      disabled={loadingId === p.id}
                      className={`w-full mt-4 py-2 sm:py-2.5 md:py-3 text-[9px] sm:text-xs md:text-sm font-extrabold rounded-lg md:rounded-xl transition-all shadow-lg ${
                        loadingId === p.id
                          ? "bg-amber-500 text-white"
                          : "bg-[var(--event-primary)] text-white hover:opacity-95"
                      }`}
                    >
                      {loadingId === p.id
                        ? translations[lang].orderSuccess
                        : translations[lang].orderButton}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </main>

      <footer className="bg-[var(--text-dark)] text-white mt-12 py-10 px-4 md:px-6 lg:px-10">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-[var(--brand-gold)] mb-2">
              {translations[lang].brandName}
            </h3>
            <p className="text-xs md:text-sm text-gray-400 max-w-md mb-4">
              {translations[lang].footerAbout}
            </p>

           {/* Social Icons */}
            <div className="flex justify-center md:justify-start gap-4">
              <a href={siteConfig.tiktokUrl} target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--brand-gold)] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href={siteConfig.instagramUrl} target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--brand-gold)] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href={siteConfig.telegramChannel} target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--brand-gold)] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.285-.346-.096l-6.405 4.026-2.76-.86c-.6-.188-.615-.6.128-.89l10.816-4.167c.5-.188.943.116.807.905z"/>
                </svg>
              </a>
            </div>

            {/* Contact & Location Links */}
            <div className="text-xs md:text-sm text-gray-300 mt-5 space-y-2">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {translations[lang].footerContact}: <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-white underline">{siteConfig.phoneDisplay}</a>
              </p>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${siteConfig.mapSearchQuery}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center md:justify-start gap-2 hover:text-[var(--brand-gold)] transition-colors"
              >
                <svg className="w-4 h-4 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {translations[lang].location}
              </a>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-gray-400">
            <p className="mb-3">
              Developed by <a href="https://t.me/temesgenwalelign" target="_blank" className="text-[var(--brand-gold)] font-bold">Temesgen Walelgn</a> {" | "} <a href="tel:+251993370491">+251 993 370 491</a>
            </p>
            <p>© {new Date().getFullYear()} {translations[lang].brandName}. {translations[lang].footerRights}</p>
          </div>

        </div>

      </footer>

      {/* PROFESSIONAL GALLERY POP-UP */}
      {selectedProduct && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6"
          onClick={() => setSelectedProduct(null)}
        >

          <div
            className="relative w-full max-w-5xl bg-[var(--brand-light)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >

            <GalleryView 
              product={selectedProduct} 
              lang={lang} 
              onClose={() => setSelectedProduct(null)}
              onOrder={() => handleOrder(selectedProduct, products.findIndex(p => p.id === selectedProduct.id))}
              orderText={translations[lang].orderButton}
              successText={translations[lang].orderSuccess}
              isOrdering={loadingId === selectedProduct.id}
            />

          </div>

        </div>

      )}

    </div>
  );
}

// PROFESSIONAL GALLERY VIEW COMPONENT
function GalleryView({ 
  product, 
  lang, 
  onClose, 
  onOrder, 
  orderText, 
  successText, 
  isOrdering 
}: { 
  product: Product; 
  lang: "am" | "en" | "om"; 
  onClose: () => void; 
  onOrder: () => void; 
  orderText: string; 
  successText: string; 
  isOrdering: boolean;
}) {
  const [main, setMain] = useState(product.images[0]);

  // If product changes, reset main image
  useEffect(() => {
    setMain(product.images[0]);
  }, [product]);

  // Updated Gallery title prefixes
  const titlePrefix = product.type === "decor" ? "Event Decor" : product.type === "goldenstore" ? "Golden Store" : "Surprise Package";

  return (
    <>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold transition-colors z-10"
      >
        ✕
      </button>

      {/* LEFT SIDE: Image Gallery */}
      <div className="w-full md:w-1/2 flex flex-col bg-[var(--brand-bg)] border-b md:border-b-0 md:border-r border-gray-800">
        
        {/* Main Image */}
        <div className="w-full h-[40vh] md:h-[60vh] relative flex items-center justify-center p-4 md:p-8">
          <img
            src={main}
            className="w-full h-full object-contain drop-shadow-md rounded-lg"
            alt="Product view"
          />
        </div>

        {/* Thumbnails (Shows only if multiple images exist) */}
        {product.images.length > 1 && (
          <div className="flex gap-3 justify-center overflow-x-auto p-4 bg-black/20 backdrop-blur-sm border-t border-gray-800">
            {product.images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                onClick={() => setMain(img)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  main === img
                    ? "border-[var(--event-primary)] scale-105 shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        )}

      </div>

      {/* RIGHT SIDE: Details & Order Button */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 lg:p-10 max-h-[50vh] md:max-h-none overflow-y-auto">
        
        <div className="mb-6 pr-8">
          <span className="inline-block px-3 py-1 bg-gray-800 text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-widest rounded-md mb-3">
            {titlePrefix}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--event-primary)] tracking-tight">
            {Number(product.price).toLocaleString()} ETB
          </h2>
        </div>

        <div className="flex-1 mb-8">
          <h3 className="text-sm font-bold text-gray-200 mb-2">Package Includes:</h3>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed whitespace-pre-wrap">
            {product.description[lang] || product.description.en || product.description.am}
          </p>
        </div>

        {/* Order Action Button */}
        <div className="mt-auto pt-6 border-t border-gray-800">
          <button
            onClick={onOrder}
            disabled={isOrdering}
            className={`w-full py-3.5 md:py-4 text-sm md:text-base font-extrabold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
              isOrdering
                ? "bg-amber-500 text-white"
                : "bg-[var(--event-primary)] text-[var(--text-on-gold)] hover:opacity-95"
            }`}
          >
            {isOrdering ? successText : orderText}
          </button>
        </div>

      </div>
    </>
  );
}