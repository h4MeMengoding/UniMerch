import Link from 'next/link';

export default async function PaymentFailedPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-950">
      <div className="bg-red-100 dark:bg-red-900/30 p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4">Pembayaran Gagal</h1>
        <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
          Mohon maaf, pembayaran Anda gagal diproses.
        </p>
        {resolvedSearchParams.order && (
          <p className="mb-4 text-neutral-600 dark:text-neutral-400">
            Nomor Pesanan: <span className="font-semibold">{resolvedSearchParams.order}</span>
          </p>
        )}
        <Link href="/user/dashboard" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
