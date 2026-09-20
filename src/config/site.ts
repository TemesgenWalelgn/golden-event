export const siteConfig = {
  // Brand Names in 3 Languages
  name: {
    en: "GOLDEN Events",
    am: "ጎልደን ኤቨንት",
    om: "GOLDEN Events",
  },
  tagline: {
    en: "Beautiful decorations and custom surprise packages for your special moments",
    am: " የሚያምሩ የዲኮር ስራዎች እና የስጦታ ፓኬጆች ለልዩ ቀናቶችዎ",
    om: "decoraa miidhagoo fi qophii kennaa addaa guyyoota keessaniif",
  },
  about: {
    en: "GOLDEN Events - Brighten your love with a gift, and make your event memorable with beautiful decor.",
    am: "ጎልደን ኤቨንት - ፍቅሮን በስጦታ እና ፕሮግራሞትን በሚያምር የዲኮር ስራ ያድምቁ።",
    om: "GOLDEN Events - Jaalala keessan kennaadhaan, sagantaa keessanis hojii faaya baredaadhaan miidhagsaa.",
  },

  // Assets
  logoUrl: "https://res.cloudinary.com/dmp2grjb1/image/upload/v1789756986/golden_event_logo-removebg-preview_fwhrqq.png",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "golden-event",

  // Contact & Social Media
  telegramUsername: "Golden_surprise",
  telegramChannel: "https://t.me/@Golden_surprise",
  tiktokUrl: "https://tiktok.com/@goldenstorediredawa",
  instagramUrl: "https://instagram.com/goldensurpriseanddecor",
  phoneDisplay: "+251 978 727 648",
  phoneRaw: "+251978727648",

  // Store Location & Maps Search Query
  locationName: {
    en: " GOLDEN Events, diredawa, Ethiopia",
    am: "ጎልደን ኤቨንት, ድሬዳዋ, ኢትዮጵያ",
    om: "GOLDEN Events, diredawa, Itoophiyaa",
  },
  mapSearchQuery: "GOLDEN+events+diredawa",
};