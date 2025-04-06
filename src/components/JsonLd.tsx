import { JsonLdContext } from '@/types/jsonld';

interface JsonLdProps {
  data: JsonLdContext;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  );
} 