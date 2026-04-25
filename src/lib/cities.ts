export type DestinationCity = {
  code: string;
  name: string;
  slug: string;
};

export type OriginCity = {
  code: string;
  description: string;
  destinations: DestinationCity[];
  name: string;
  title: string;
};

const bucharestDestinations: DestinationCity[] = [
  { code: "LON", name: "London", slug: "london" },
  { code: "MIL", name: "Milan", slug: "milan" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "MAD", name: "Madrid", slug: "madrid" },
  { code: "ATH", name: "Athens", slug: "athens" },
  { code: "IST", name: "Istanbul", slug: "istanbul" },
  { code: "VIE", name: "Vienna", slug: "vienna" },
  { code: "DXB", name: "Dubai", slug: "dubai" },
];

const londonDestinations: DestinationCity[] = [
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "AMS", name: "Amsterdam", slug: "amsterdam" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "MAD", name: "Madrid", slug: "madrid" },
  { code: "DUB", name: "Dublin", slug: "dublin" },
  { code: "LIS", name: "Lisbon", slug: "lisbon" },
  { code: "BER", name: "Berlin", slug: "berlin" },
  { code: "PRG", name: "Prague", slug: "prague" },
  { code: "NYC", name: "New York", slug: "new-york" },
];

const parisDestinations: DestinationCity[] = [
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "LIS", name: "Lisbon", slug: "lisbon" },
  { code: "ATH", name: "Athens", slug: "athens" },
  { code: "BER", name: "Berlin", slug: "berlin" },
  { code: "AMS", name: "Amsterdam", slug: "amsterdam" },
  { code: "DUB", name: "Dublin", slug: "dublin" },
  { code: "IST", name: "Istanbul", slug: "istanbul" },
  { code: "NCE", name: "Nice", slug: "nice" },
  { code: "RAK", name: "Marrakech", slug: "marrakech" },
];

const berlinDestinations: DestinationCity[] = [
  { code: "LON", name: "London", slug: "london" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "AMS", name: "Amsterdam", slug: "amsterdam" },
  { code: "VIE", name: "Vienna", slug: "vienna" },
  { code: "PRG", name: "Prague", slug: "prague" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "BUD", name: "Budapest", slug: "budapest" },
  { code: "CPH", name: "Copenhagen", slug: "copenhagen" },
  { code: "IST", name: "Istanbul", slug: "istanbul" },
];

const madridDestinations: DestinationCity[] = [
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "LON", name: "London", slug: "london" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "LIS", name: "Lisbon", slug: "lisbon" },
  { code: "ATH", name: "Athens", slug: "athens" },
  { code: "MIL", name: "Milan", slug: "milan" },
  { code: "PMI", name: "Palma de Mallorca", slug: "palma-de-mallorca" },
  { code: "SVQ", name: "Seville", slug: "seville" },
  { code: "TFS", name: "Tenerife", slug: "tenerife" },
];

const romeDestinations: DestinationCity[] = [
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "MAD", name: "Madrid", slug: "madrid" },
  { code: "ATH", name: "Athens", slug: "athens" },
  { code: "LON", name: "London", slug: "london" },
  { code: "MIL", name: "Milan", slug: "milan" },
  { code: "NAP", name: "Naples", slug: "naples" },
  { code: "CTA", name: "Catania", slug: "catania" },
  { code: "PMO", name: "Palermo", slug: "palermo" },
  { code: "DUB", name: "Dublin", slug: "dublin" },
];

const amsterdamDestinations: DestinationCity[] = [
  { code: "LON", name: "London", slug: "london" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "LIS", name: "Lisbon", slug: "lisbon" },
  { code: "BER", name: "Berlin", slug: "berlin" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "PRG", name: "Prague", slug: "prague" },
  { code: "CPH", name: "Copenhagen", slug: "copenhagen" },
  { code: "DUB", name: "Dublin", slug: "dublin" },
  { code: "VIE", name: "Vienna", slug: "vienna" },
];

const viennaDestinations: DestinationCity[] = [
  { code: "LON", name: "London", slug: "london" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "BER", name: "Berlin", slug: "berlin" },
  { code: "PRG", name: "Prague", slug: "prague" },
  { code: "BUD", name: "Budapest", slug: "budapest" },
  { code: "ATH", name: "Athens", slug: "athens" },
  { code: "IST", name: "Istanbul", slug: "istanbul" },
  { code: "ZRH", name: "Zurich", slug: "zurich" },
];

const pragueDestinations: DestinationCity[] = [
  { code: "LON", name: "London", slug: "london" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "AMS", name: "Amsterdam", slug: "amsterdam" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "BCN", name: "Barcelona", slug: "barcelona" },
  { code: "VIE", name: "Vienna", slug: "vienna" },
  { code: "BUD", name: "Budapest", slug: "budapest" },
  { code: "CPH", name: "Copenhagen", slug: "copenhagen" },
  { code: "MIL", name: "Milan", slug: "milan" },
  { code: "DUB", name: "Dublin", slug: "dublin" },
];

const istanbulDestinations: DestinationCity[] = [
  { code: "LON", name: "London", slug: "london" },
  { code: "PAR", name: "Paris", slug: "paris" },
  { code: "ROM", name: "Rome", slug: "rome" },
  { code: "ATH", name: "Athens", slug: "athens" },
  { code: "DXB", name: "Dubai", slug: "dubai" },
  { code: "BER", name: "Berlin", slug: "berlin" },
  { code: "AMS", name: "Amsterdam", slug: "amsterdam" },
  { code: "LCA", name: "Larnaca", slug: "larnaca" },
  { code: "TBS", name: "Tbilisi", slug: "tbilisi" },
  { code: "DOH", name: "Doha", slug: "doha" },
];

export const cities: Record<string, OriginCity> = {
  bucharest: {
    code: "BUH",
    name: "Bucharest",
    title: "Cheap Flights from Bucharest | toTheTrip.app",
    description:
      "Compare cheap flights from Bucharest, including low fares, one-way and round-trip options, and destination ideas across Europe and beyond.",
    destinations: bucharestDestinations,
  },
  london: {
    code: "LON",
    name: "London",
    title: "Cheap Flights from London | toTheTrip.app",
    description:
      "Find cheap flights from London, compare airline fares, and explore one-way, round-trip, and city-break route ideas.",
    destinations: londonDestinations,
  },
  paris: {
    code: "PAR",
    name: "Paris",
    title: "Cheap Flights from Paris | toTheTrip.app",
    description:
      "Browse cheap flights from Paris and compare low fares, flexible dates, and destination ideas for short and long trips.",
    destinations: parisDestinations,
  },
  berlin: {
    code: "BER",
    name: "Berlin",
    title: "Cheap Flights from Berlin | toTheTrip.app",
    description:
      "Discover cheap flights from Berlin with route ideas, airline comparisons, and current low fares for one-way and round-trip travel.",
    destinations: berlinDestinations,
  },
  madrid: {
    code: "MAD",
    name: "Madrid",
    title: "Cheap Flights from Madrid | toTheTrip.app",
    description:
      "Compare cheap flights from Madrid and find low-cost airline deals, weekend flights, and destination ideas from Spain.",
    destinations: madridDestinations,
  },
  rome: {
    code: "ROM",
    name: "Rome",
    title: "Cheap Flights from Rome | toTheTrip.app",
    description:
      "Find cheap flights from Rome, explore round-trip and one-way routes, and compare the best fares by destination.",
    destinations: romeDestinations,
  },
  amsterdam: {
    code: "AMS",
    name: "Amsterdam",
    title: "Cheap Flights from Amsterdam | toTheTrip.app",
    description:
      "Compare cheap flights from Amsterdam with live route ideas, airline options, and low fares for popular destinations.",
    destinations: amsterdamDestinations,
  },
  vienna: {
    code: "VIE",
    name: "Vienna",
    title: "Cheap Flights from Vienna | toTheTrip.app",
    description:
      "Search cheap flights from Vienna and compare low fares, route details, and destination ideas for flexible travel planning.",
    destinations: viennaDestinations,
  },
  prague: {
    code: "PRG",
    name: "Prague",
    title: "Cheap Flights from Prague | toTheTrip.app",
    description:
      "Explore cheap flights from Prague, compare one-way and round-trip fares, and discover the best route ideas from the Czech Republic.",
    destinations: pragueDestinations,
  },
  istanbul: {
    code: "IST",
    name: "Istanbul",
    title: "Cheap Flights from Istanbul | toTheTrip.app",
    description:
      "Find cheap flights from Istanbul and compare airline prices, low fares, and destination options for Europe and beyond.",
    destinations: istanbulDestinations,
  },
};
