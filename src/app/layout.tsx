import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation/Navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://toTheTrip.app"),
  title: {
    default: "toTheTrip",
    template: "%s | toTheTrip",
  },
  description:
    "Find the cheapest flights from your city in one click. Explore real flight deals, cheap destinations, and the lowest airline ticket prices in one place.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <Navigation />
        </header>
        {children}
      </body>
    </html>
  );
}
