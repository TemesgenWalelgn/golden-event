export const siteConfig = {
  // 1. BRAND NAMES
  name: {
    en: "GOLDEN Events",
    am: "GOLDEN Events",
    om: "GOLDEN Events",
  },
  tagline: {
    en: "Beautiful decorations and custom surprise packages for your special moments",
    am: "የሚያምሩ የዲኮር ስራዎች እና የስጦታ ፓኬጆች ለልዩ ቀናቶችዎ",
    om: "decoraa miidhagoo fi qophii kennaa addaa guyyoota keessaniif",
  },
  about: {
    en: "GOLDEN Events - Brighten your love with a gift, and make your event memorable with beautiful decor.",
    am: "GOLDEN Events - ፍቅሮን በስጦታ እና ፕሮግራሞትን በሚያምር የዲኮር ስራ ያድምቁ።",
    om: "GOLDEN Events - Jaalala keessan kennaadhaan, sagantaa keessanis hojii faaya baredaadhaan miidhagsaa.",
  },

  // 2. ASSETS & UPLOADS
  logoUrl: "https://res.cloudinary.com/dmp2grjb1/image/upload/v1789756986/golden_event_logo-removebg-preview_fwhrqq.png",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "golden_event",
  storagePrefix: "golden_event",

  // 3. CONTACT & SOCIAL MEDIA
  telegramUsername: "Golden_surprise",
  telegramChannel: "https://t.me/goldenstorediredawa",
  tiktokUrl: "https://tiktok.com/goldensurpriseanddecor",
  instagramUrl: "https://instagram.com/goldensurpriseanddecor",
  phoneDisplay: "+251 978 727 648",
  phoneRaw: "+251978727648",

  // 4. LOCATION
  locationName: {
    en: "GOLDEN Events, Dire Dawa, Ethiopia",
    am: "GOLDEN Events, ድሬዳዋ, ኢትዮጵያ",
    om: "GOLDEN Events, Dire Dawa, Itoophiyaa",
  },
  mapSearchQuery: "GOLDEN+events+diredawa",

  // ==========================================
  // WHITE-LABEL CONFIGURATION (TABS & TRANSLATIONS)
  // ==========================================

  // 5. TABS (The main categories)
  tabs: [
    { 
      id: "surprise", 
      prefix: "PKG", 
      galleryTitle: "Surprise Package",
      defaultSubs: ["all", "men", "women", "children", "father", "mother", "new born"] 
    },
    { 
      id: "decor", 
      prefix: "DCR", 
      galleryTitle: "Event Decor",
      defaultSubs: ["all", "wedding", "shimigilina", "birthday", "anniversery", "graduation"] 
    },
    { 
      id: "goldenstore", 
      prefix: "GLD", 
      galleryTitle: "Golden Store",
      defaultSubs: ["all", "mens", "womans"] 
    }
  ],

  // 6. FULL TRANSLATION DICTIONARY
  translations: {
    am: {
      collectionTitle: "የአማራጮቻችንን ይመልከቱ",
      orderButton: "አሁኑኑ ይዘዙ",
      orderSuccess: "ትዕዛዝ ተልኳል! ✅",
      footerContact: "እኛን ለማግኘት",
      footerRights: "መብቱ በህግ የተጠበቀ ነው።",
      tabs: { surprise: "የሰርፕራይዝ ጥቅል", decor: "ዲኮር", goldenstore: "ጎልደን ገበያ" },
      subs: {
        decor: { all: "ሁሉም", wedding: "ሰርግ", shimigilina: "ሽምግልና", birthday: "ልደት", anniversery: "አንቨርሰሪ በዓል", graduation: "ምረቃ" },
        goldenstore: { all: "ሁሉም", mens: "ለወንድ", womans: "ለሴት" },
        surprise: { all: "ሁሉም", men: "ለወንዶች", women: "ለሴቶች", children: "ለህፃናት", father: "ለአባት", mother: "ለእናት", "new born": "ለአራስ" }
      },
      orderPhrases: {
        surprise: "ዌብሳይታችሁ ላይ ካየሁት አስገራሚ ፓኬጅ ውስጥ ይሄንን ማዘዝ እፈልጋለው",
        decor: "ዌብሳይታችሁ ላይ ካየሁት የዲኮር ስራ ውስጥ ይሄንን ማዘዝ እፈልጋለው",
        goldenstore: "ዌብሳይታችሁ ላይ ካየሁት የጎልደን ገበያ እቃ ውስጥ ይሄንን ማዘዝ እፈልጋለው",
        default: "ዌብሳይታችሁ ላይ ካየሁት ፓኬጅ ውስጥ ይሄንን ማዘዝ እፈልጋለው"
      },
      callToAction: "አመሰግናለው"
    },

    en: {
      collectionTitle: "Our Collection",
      orderButton: "Order Now",
      orderSuccess: "Order Sent! ✅",
      footerContact: "Contact Us",
      footerRights: "All rights reserved.",
      tabs: { surprise: "Surprise pkg", decor: "Decor", goldenstore: "Golden Store" },
      subs: {
        decor: { all: "All", wedding: "For Wedding", shimigilina: "For Engagement", birthday: "For Birthday", anniversery: "For Anniversary", graduation: "For Graduation" },
        goldenstore: { all: "All", mens: "For men", womans: "For woman" },
        surprise: { all: "All", men: "For Men", women: "For Women", children: "For Children", father: "For Father", mother: "For Mother", "new born": "New Born" }
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
      collectionTitle: "Walitti Qabama Keenya",
      orderButton: "Ajajaa",
      orderSuccess: "Ajajni Ergame! ✅",
      footerContact: "Nu Quunnamaa",
      footerRights: "Mirgi hunduu eegamaadha.",
      tabs: { surprise: "surprisee", decor: "decoraa", goldenstore: "ጎልደን ገበያ" },
      subs: {
        decor: { all: "Hunda", wedding: "Guyyaa Gaa'elaa", shimigilina: "Kadhannaa", birthday: "Guyyaa Dhalootaa", anniversery: "Ayyaana Waggaa", graduation: "Eebbifa" },
        goldenstore: { all: "Hunda", mens: "Dhiira", womans: "Dubara" },
        surprise: { all: "Hunda", men: "Dhiira", women: "Dubara", children: "Ijoollee", father: "Abbaa", mother: "Haadha", "new born": "Mucaa Haarawa" }
      },
      orderPhrases: {
        surprise: "Marsariitii keessan irraa paakajeetii dinqisiisaa kana ajajuu barbaada:",
        decor: "Marsariitii keessan irraa decoraa kana ajajuu barbaada:",
        goldenstore: "Akkam jirtu, marsariitii keessanirraa goldenstore irraa kana ajajuun barbaada:",
        default: "Marsariitii keessan irraa kana ajajuu barbaada:"
      },
      callToAction: "Galatoomaa"
    }
  }
};