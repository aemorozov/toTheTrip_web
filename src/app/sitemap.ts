import type { MetadataRoute } from "next";
import { cities } from "../lib/cities";

const siteUrl = "https://toTheTrip.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = Object.entries(cities).map(
    ([citySlug]) => ({
      url: `${siteUrl}/flights/from/${citySlug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }),
  );

  const destinationPages: MetadataRoute.Sitemap = Object.entries(cities).flatMap(
    ([citySlug, city]) =>
      city.destinations.map((destination) => ({
        url: `${siteUrl}/flights/from/${citySlug}/to/${destination.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
  );

  return [...staticPages, ...cityPages, ...destinationPages];
}
