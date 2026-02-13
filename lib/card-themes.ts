export interface CardTheme {
  bgImage: string;
  cardBorder: string;
  cardBg: string;
  artBg: string;
  artBorder: string;
  artImage?: string;
  titleImage?: string;
  statsBg: string;
  statsBorder: string;
  labelColor: string;
  dotColor: string;
  dotBorder: string;
  headshotBg: string;
  headshotBorder: string;
  fallbackInitialColor: string;
  pattern: "diamonds" | "stars";
  patternFill: string;
  patternStroke: string;
}

const defaultTheme: CardTheme = {
  bgImage: "/images/grass-bg.jpg",
  cardBorder: "#002910",
  cardBg: "#002910",
  artBg: "#DFEAE3",
  artBorder: "#008C44",
  statsBg: "#F8FFFB",
  statsBorder: "#008C44",
  labelColor: "#008C44",
  dotColor: "#008C44",
  dotBorder: "#F8FFFB",
  headshotBg: "#F8FFFB",
  headshotBorder: "#008C44",
  fallbackInitialColor: "#002910",
  pattern: "diamonds",
  patternFill: "#DFEAE3",
  patternStroke: "white",
};

const cardThemes: Record<string, Partial<CardTheme>> = {
  glue: {
    bgImage: "/images/glue-bg.png",
    cardBorder: "#242603",
    cardBg: "#242603",
    artBg: "#EEFF8C",
    artBorder: "#586605",
    artImage: "/images/glue-card-art.png",
    titleImage: "/images/glue-card-title.svg",
    statsBg: "#FDFFF3",
    statsBorder: "#586605",
    labelColor: "#586605",
    dotColor: "#EEFF8C",
    dotBorder: "#EEFF8C",
    headshotBg: "#FDFFF3",
    headshotBorder: "#586605",
    fallbackInitialColor: "#242603",
    pattern: "stars",
    patternFill: "#FFFFFC",
    patternStroke: "none",
  },
  goGoGoer: {
    cardBorder: "#3D0A1A",
    cardBg: "#3D0A1A",
    artBg: "#FFD6E0",
    artBorder: "#D4587A",
    artImage: "/images/goGoGoer-card-art.png",
    titleImage: "/images/goGoGoer-card-title.svg",
    statsBg: "#FFF5F7",
    statsBorder: "#D4587A",
    labelColor: "#D4587A",
    dotColor: "#FFD6E0",
    dotBorder: "#FFD6E0",
    headshotBg: "#FFF5F7",
    headshotBorder: "#D4587A",
    fallbackInitialColor: "#3D0A1A",
    pattern: "diamonds",
    patternFill: "#FFD6E0",
    patternStroke: "white",
  },
  clutch: {
    cardBorder: "#1A2E22",
    cardBg: "#1A2E22",
    artBg: "#DDE8E0",
    artBorder: "#7BA38A",
    artImage: "/images/clutch-card-art.png",
    titleImage: "/images/clutch-card-title.svg",
    statsBg: "#F5FAF7",
    statsBorder: "#7BA38A",
    labelColor: "#7BA38A",
    dotColor: "#DDE8E0",
    dotBorder: "#DDE8E0",
    headshotBg: "#F5FAF7",
    headshotBorder: "#7BA38A",
    fallbackInitialColor: "#1A2E22",
    pattern: "diamonds",
    patternFill: "#DDE8E0",
    patternStroke: "white",
  },
  heart: {
    cardBorder: "#3D0A3D",
    cardBg: "#3D0A3D",
    artBg: "#F5D6F5",
    artBorder: "#C87AC8",
    artImage: "/images/heart-card-art.png",
    titleImage: "/images/heart-card-title.svg",
    statsBg: "#FDF5FD",
    statsBorder: "#C87AC8",
    labelColor: "#C87AC8",
    dotColor: "#F5D6F5",
    dotBorder: "#F5D6F5",
    headshotBg: "#FDF5FD",
    headshotBorder: "#C87AC8",
    fallbackInitialColor: "#3D0A3D",
    pattern: "stars",
    patternFill: "#FDF5FD",
    patternStroke: "none",
  },
  tastemaker: {
    cardBorder: "#1E1A3D",
    cardBg: "#1E1A3D",
    artBg: "#DDD3F2",
    artBorder: "#8B7ABF",
    artImage: "/images/tastemaker-card-art.png",
    titleImage: "/images/tastemaker-card-title.svg",
    statsBg: "#F5F3FD",
    statsBorder: "#8B7ABF",
    labelColor: "#8B7ABF",
    dotColor: "#DDD3F2",
    dotBorder: "#DDD3F2",
    headshotBg: "#F5F3FD",
    headshotBorder: "#8B7ABF",
    fallbackInitialColor: "#1E1A3D",
    pattern: "stars",
    patternFill: "#F5F3FD",
    patternStroke: "none",
  },
  trendsetter: {
    cardBorder: "#1A1A3D",
    cardBg: "#1A1A3D",
    artBg: "#D6D6FF",
    artBorder: "#8B8BCC",
    artImage: "/images/trendsetter-card-art.png",
    titleImage: "/images/trendsetter-card-title.svg",
    statsBg: "#F3F3FF",
    statsBorder: "#8B8BCC",
    labelColor: "#8B8BCC",
    dotColor: "#D6D6FF",
    dotBorder: "#D6D6FF",
    headshotBg: "#F3F3FF",
    headshotBorder: "#8B8BCC",
    fallbackInitialColor: "#1A1A3D",
    pattern: "diamonds",
    patternFill: "#D6D6FF",
    patternStroke: "white",
  },
  vision: {
    cardBorder: "#0A2A3D",
    cardBg: "#0A2A3D",
    artBg: "#CCE8F5",
    artBorder: "#6AAFCC",
    artImage: "/images/vision-card-art.png",
    titleImage: "/images/vision-card-title.svg",
    statsBg: "#F0F8FD",
    statsBorder: "#6AAFCC",
    labelColor: "#6AAFCC",
    dotColor: "#CCE8F5",
    dotBorder: "#CCE8F5",
    headshotBg: "#F0F8FD",
    headshotBorder: "#6AAFCC",
    fallbackInitialColor: "#0A2A3D",
    pattern: "diamonds",
    patternFill: "#CCE8F5",
    patternStroke: "white",
  },
};

export function getCardTheme(archetypeId: string): CardTheme {
  const overrides = cardThemes[archetypeId];
  if (!overrides) return defaultTheme;
  return { ...defaultTheme, ...overrides };
}

export function getCardImages(archetypeId: string, baseUrl: string) {
  const theme = getCardTheme(archetypeId);
  const abs = (path: string) => `${baseUrl}${path}`;

  return {
    cardArt: theme.artImage ? abs(theme.artImage) : null,
    cardTitle: theme.titleImage ? abs(theme.titleImage) : null,
    cardBg: abs(theme.bgImage),
    cardBack: abs("/images/card-back.svg"),
    headerSvg: abs(`/headers/the-${archetypeId}-header.svg`),
    resultsHeaderBg: abs(`/images/results-header-bg-${archetypeId}.png`),
    ogBg: abs(`/images/og-bg-${archetypeId}.jpg`),
  };
}
