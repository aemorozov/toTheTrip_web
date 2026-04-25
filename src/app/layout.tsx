import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteFooter from "../components/SiteFooter/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://toTheTrip.app"),
  title: {
    default: "toTheTrip",
    template: "%s | toTheTrip",
  },
  description:
    "Find the cheapest flights from your city in one click. Explore real flight deals, cheap destinations, and the lowest airline ticket prices in one place.",
  keywords: [
    "cheap flights",
    "flight deals",
    "cheap flights from city",
    "one way flights",
    "round trip flights",
    "weekend trips",
    "route details",
    "airfare comparison",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://toTheTrip.app",
    siteName: "toTheTrip",
    title: "toTheTrip",
    description:
      "Find the cheapest flights from your city in one click. Explore real flight deals, cheap destinations, and the lowest airline ticket prices in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "toTheTrip",
    description:
      "Compare cheap flights, route ideas, and low fares from your city in one place.",
  },
  verification: {
    google: "Kkvm8DeaYZamlTQNL14u8XH-P4-EsxrgiWbCvHDFnx8",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
