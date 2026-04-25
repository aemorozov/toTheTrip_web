"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cities } from "../../lib/cities";

type FooterLinkItem = {
  href: string;
  label: string;
};

function buildHomeLinks(): FooterLinkItem[] {
  return Object.entries(cities).map(([slug, city]) => ({
    href: `/flights/from/${slug}`,
    label: `Cheap flights from ${city.name}`,
  }));
}

function buildCityLinks(citySlug: string): FooterLinkItem[] {
  const city = cities[citySlug as keyof typeof cities];

  if (!city) {
    return buildHomeLinks();
  }

  return city.destinations.map((destination) => ({
    href: `/flights/from/${citySlug}/to/${destination.slug}`,
    label: `${city.name} to ${destination.name}`,
  }));
}

export default function SiteFooter() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isCityPage = segments[0] === "flights" && segments[1] === "from";
  const citySlug = isCityPage ? segments[2] : null;
  const footerTitle = citySlug
    ? `Popular routes from ${cities[citySlug as keyof typeof cities]?.name || "this city"}`
    : "Popular departure cities";
  const links = citySlug ? buildCityLinks(citySlug) : buildHomeLinks();

  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterTop">
          <div className="siteFooterBrandBlock">
            <p className="siteFooterBrand">toTheTrip.app</p>
            <p className="siteFooterCopy">
              Compare cheap flights and route ideas in one place.
            </p>
          </div>
          <div className="siteFooterNav">
            <p className="siteFooterHeading">{footerTitle}</p>
            <div className="siteFooterLinks" role="navigation" aria-label={footerTitle}>
              {links.slice(0, 10).map((link) => (
                <Link key={link.href} href={link.href} className="siteFooterLink">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
