import PaymentSuccessContent from './PaymentSuccessContent';

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  return <PaymentSuccessContent searchParams={resolvedSearchParams} />;
}
