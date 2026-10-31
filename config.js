/**
 * DropMe — Site Configuration
 * All section heights, chapter ranges, frame counts, frame paths,
 * callout positions, city coordinates, car rates, and booking parameters live here.
 */

window.DROPME_CONFIG = window.NOCTIS_CONFIG = {
  // Brand & Currencies
  brand: "DropMe",
  adminEmail: "harishjadi3@gmail.com",
  currency: "₹",
  baseFee: 1200, // Flat base reservation fee in INR
  roadFactor: 1.25, // Multiplier for real driving distance vs haversine
  averageSpeed: 60, // km/h for trip duration estimates

  // Section Heights (driven by CSS or inline style overrides)
  sectionHeights: {
    hero: "600vh",
    howItWorks: "160vh",
    safety: "400vh",
    fleet: "100vh",
    book: "100vh"
  },

  // Scrollytelling Frames
  frames: {
    hero: {
      count: 448,
      desktopPath: "assets/frames/hero/frame_%04d.webp",
      mobilePath: "assets/frames/hero-mobile/frame_%04d.webp"
    },
    safety: {
      count: 400,
      desktopPath: "assets/frames/safety/frame_%04d.webp",
      mobilePath: "assets/frames/safety-mobile/frame_%04d.webp"
    }
  },

  // Hero Section Chapters (ranges in scroll progress 0.0 -> 1.0)
  heroChapters: [
    {
      id: "intro",
      range: [0.0, 0.14],
      title: "DropMe",
      subtitle: "The city is asleep.",
      hint: "SCROLL TO WAKE IT",
      showScrollHint: true
    },
    {
      id: "destination",
      range: [0.22, 0.40],
      title: "Where do you need to be?",
      subtitle: "Silent dispatch across the blackout grid."
    },
    {
      id: "presence",
      range: [0.50, 0.68],
      title: "We bring the car.",
      subtitle: "And the light."
    },
    {
      id: "arrival",
      range: [0.80, 1.00],
      displayTitle: "GT-E",
      meta: "AVAILABLE NOW · FROM ₹ 28 / KM · 4 SEATS",
      actions: [
        { label: "Book this ride", href: "#book", primary: true },
        { label: "See the fleet", href: "#fleet", primary: false }
      ]
    }
  ],

  // Hero HUD telemetry configs
  heroHud: {
    speedMax: 118, // KM/H
    distanceMax: 4.2, // KM
    fadeToBlackStart: 0.95 // Start fading canvas to solid black at 95% scroll
  },

  // Safety Section Chapters
  safetyChapters: [
    {
      id: "solid",
      range: [0.0, 0.30],
      step: "01",
      title: "SOLID",
      body: "Every DropMe is inspected, cleaned and checked before every ride."
    },
    {
      id: "structure",
      range: [0.35, 0.65],
      step: "02",
      title: "STRUCTURE",
      body: "A high-strength safety cage, crumple zones and a sealed battery frame."
    },
    {
      id: "awareness",
      range: [0.70, 1.00],
      step: "03",
      title: "AWARENESS",
      body: "360° sensors watch the road so the driver doesn't have to guess."
    }
  ],

  // Safety Section Callouts (active after progress 0.40)
  // Coordinates are percentage values [x%, y%] relative to the canvas/stage
  safetyCallouts: {
    startProgress: 0.40,
    items: [
      {
        id: "cage",
        label: "CAGE",
        text: "Ultra-high-strength steel safety cage",
        structurePos: { dotX: 52, dotY: 42, labelX: 28, labelY: 26 },
        sensorPos:    { dotX: 50, dotY: 42, labelX: 26, labelY: 24 }
      },
      {
        id: "airbags",
        label: "AIRBAGS",
        text: "Nine airbags, front, side, curtain, knee",
        structurePos: { dotX: 44, dotY: 52, labelX: 20, labelY: 62 },
        sensorPos:    { dotX: 42, dotY: 50, labelX: 18, labelY: 64 }
      },
      {
        id: "sensors",
        label: "SENSORS",
        text: "360° radar, camera and lidar",
        structurePos: { dotX: 84, dotY: 54, labelX: 76, labelY: 34 },
        sensorPos:    { dotX: 84, dotY: 52, labelX: 76, labelY: 30 }
      },
      {
        id: "braking",
        label: "BRAKING",
        text: "Automatic emergency braking",
        structurePos: { dotX: 73, dotY: 68, labelX: 76, labelY: 78 },
        sensorPos:    { dotX: 74, dotY: 67, labelX: 76, labelY: 78 }
      }
    ]
  },

  // Fleet Catalog
  fleet: [
    {
      id: "gt-e",
      num: "01",
      name: "GT-E",
      tagline: "The grand tourer.",
      seats: 4,
      range: "640 km",
      rate: 28,
      image: "assets/cars/gt-e.webp",
      swatches: ["#1e2229", "#eceae4", "#090a0d", "#3f444e"],
      activeSwatch: 0
    },
    {
      id: "s",
      num: "02",
      name: "S",
      tagline: "Four doors, no compromise.",
      seats: 5,
      range: "600 km",
      rate: 24,
      image: "assets/cars/s.webp",
      swatches: ["#eceae4", "#090a0d", "#1c2838", "#42454e"],
      activeSwatch: 0
    },
    {
      id: "x",
      num: "03",
      name: "X",
      tagline: "Higher, never heavier.",
      seats: 5,
      range: "560 km",
      rate: 26,
      image: "assets/cars/x.webp",
      swatches: ["#14223d", "#090a0d", "#eceae4", "#2d333b"],
      activeSwatch: 0
    },
    {
      id: "r",
      num: "04",
      name: "R",
      tagline: "Built for the track.",
      seats: 2,
      range: "420 km",
      rate: 40,
      image: "assets/cars/r.webp",
      swatches: ["#090a0d", "#b31e17", "#3a3f47", "#eceae4"],
      activeSwatch: 0
    },
    {
      id: "one",
      num: "05",
      name: "ONE",
      tagline: "The future, early.",
      seats: 2,
      range: "450 km",
      rate: 65,
      image: "assets/cars/one.webp",
      swatches: ["#c2c7ce", "#090a0d", "#1f2937", "#e2e8f0"],
      activeSwatch: 0
    }
  ],

  // Cities List for Ride Booking (Coordinates: [latitude, longitude])
  cities: [
    { name: "Mumbai", coords: [19.0760, 72.8777] },
    { name: "Pune", coords: [18.5204, 73.8567] },
    { name: "Bengaluru", coords: [12.9716, 77.5946] },
    { name: "Hyderabad", coords: [17.3850, 78.4867] },
    { name: "New Delhi", coords: [28.6139, 77.2090] },
    { name: "Gurugram", coords: [28.4595, 77.0266] },
    { name: "Chennai", coords: [13.0827, 80.2707] },
    { name: "Ahmedabad", coords: [23.0225, 72.5714] },
    { name: "Goa", coords: [15.2993, 74.1240] },
    { name: "Jaipur", coords: [26.9124, 75.7873] },
    { name: "Chandigarh", coords: [30.7333, 76.7794] },
    { name: "Kolkata", coords: [22.5726, 88.3639] }
  ]
};
