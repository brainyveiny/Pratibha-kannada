import { redirect } from 'next/navigation';

interface ResourcesPageProps {
  searchParams: Promise<{ q?: string; class?: string; category?: string; cat?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams;
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.class) search.set('class', params.class);
  if (params.category || params.cat) search.set('cat', params.category || params.cat || '');

  const qs = search.toString();
  redirect(qs ? `/dashboard?${qs}` : '/dashboard');
}
