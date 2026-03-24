import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'Net Khata — ISP Management & Billing Platform';
const DEFAULT_DESCRIPTION =
  "Pakistan's leading ISP management platform. Automate billing, manage customers, track collections, generate invoices, and monitor network operations.";
const BASE_URL = 'https://netkhata.com.pk';

/**
 * SEOHead — reusable per-page SEO component.
 *
 * Usage:
 *   <SEOHead title="Customer Management" />
 *   <SEOHead title="Invoice #1234" description="View invoice details" noIndex />
 *
 * - `title`       → rendered as "title | Net Khata"
 * - `description` → meta description override
 * - `canonical`   → path override (default: current path)
 * - `noIndex`     → adds noindex,nofollow for private pages
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | Net Khata` : DEFAULT_TITLE;
  const canonicalUrl = canonical
    ? `${BASE_URL}${canonical}`
    : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
    </Helmet>
  );
};

export default SEOHead;
