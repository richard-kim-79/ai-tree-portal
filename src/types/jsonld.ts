export interface JsonLdContext {
  '@context': string | Record<string, string>;
}

export interface BlogPostingJsonLd extends JsonLdContext {
  '@type': 'BlogPosting';
  '@id': string;
  headline: string;
  datePublished: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  keywords: string[];
  articleSection?: string;
  description?: string;
  text: string;
  url: string;
}

export interface WebPageJsonLd extends JsonLdContext {
  '@type': 'WebPage';
  '@id': string;
  name: string;
  description?: string;
  url: string;
  isPartOf: {
    '@type': 'WebSite';
    '@id': string;
    name: string;
    url: string;
  };
}

export interface BreadcrumbListJsonLd extends JsonLdContext {
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    item: {
      '@id': string;
      name: string;
    };
  }[];
} 