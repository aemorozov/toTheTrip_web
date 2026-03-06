import type { Metadata } from "next";

const siteUrl = "https://tothetrip.app";

export const homeMetadata: Metadata = {
  title: "Cheap Flights from Your City - Compare Best Airfare Deals",
  description:
    "Find the cheapest flights from your city in one click. Explore real flight deals, cheap destinations, and the lowest airline ticket prices in one place.",
  keywords: [
    "cheap flights",
    "cheap flights from my city",
    "best flight deals",
    "airfare comparison",
    "one way flights",
    "round trip flights",
    "weekend trips",
    "flight search",
    "budget travel flights",
    "low cost airlines",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Cheap Flights from Your City - ToTheTrip",
    description:
      "Discover the cheapest flights from your city, compare routes instantly, and find the best airfare deals for one-way, round-trip, and weekend trips.",
    siteName: "ToTheTrip",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheapest Flights from Your City in One Click",
    description:
      "Compare the lowest fares and discover trending destinations from your city with ToTheTrip.",
  },
  category: "travel",
};

export const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToTheTrip",
    url: siteUrl,
    description:
      "ToTheTrip helps users compare cheap flights from their city and discover the best airfare deals.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/flights/from/{city}`,
      "query-input": "required name=city",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ToTheTrip",
    url: siteUrl,
    sameAs: ["https://tothetrip.app"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How can I find cheap flights from my city?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use ToTheTrip to compare destinations and fare types from your departure city. You can review one-way, round-trip, and weekend options in one place.",
        },
      },
      {
        "@type": "Question",
        name: "Does ToTheTrip show round-trip and one-way deals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. ToTheTrip organizes routes by trip type so you can quickly compare one-way flights, round trips, and short weekend escapes.",
        },
      },
      {
        "@type": "Question",
        name: "How often are prices refreshed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Flight data is refreshed regularly to help you discover current prices and new destination opportunities from your city.",
        },
      },
    ],
  },
];
