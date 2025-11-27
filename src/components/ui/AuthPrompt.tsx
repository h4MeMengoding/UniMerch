'use client';

import Link from 'next/link';

export default function AuthPrompt({
  title = 'Silakan masuk',
  description = 'Anda harus masuk terlebih dahulu untuk melihat halaman ini.',
  buttonText = 'Masuk',
  href = '/login'
}: {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}) {
  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-dark-950 flex items-start justify-center">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-3xl w-full py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{title}</h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">{description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={href}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            {buttonText}
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent dark:border-transparent rounded-lg text-neutral-700 dark:text-neutral-200 bg-transparent hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors w-full sm:w-auto"
          >
            Kembali ke toko
          </Link>
        </div>
      </div>
    </div>
  );
}
