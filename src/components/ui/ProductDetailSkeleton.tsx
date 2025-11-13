export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 pt-16 md:pt-20 pb-20 md:pb-6 animate-pulse">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-2 sm:pt-3 pb-4 sm:pb-6">
        {/* Back Button & Breadcrumb Skeleton */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          {/* Back Button - Mobile only */}
          <div className="md:hidden w-8 h-8 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-12 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
            <span className="text-neutral-300 dark:text-neutral-600">›</span>
            <div className="h-4 w-20 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Back Button - Desktop only */}
        <div className="hidden md:block mb-3 sm:mb-4">
          <div className="h-5 w-24 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
        </div>

        {/* Product Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Product Images */}
          <div className="lg:col-span-1 xl:col-span-4 space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-200 dark:bg-dark-800 rounded-xl animate-pulse" />
            
            {/* Thumbnail Images - Desktop only */}
            <div className="hidden md:grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Middle Column - Product Details */}
          <div className="lg:col-span-1 xl:col-span-5 space-y-4 sm:space-y-5">
            {/* Category Badge */}
            <div className="h-6 w-32 bg-neutral-200 dark:bg-dark-800 rounded-full animate-pulse" />

            {/* Product Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
            </div>

            {/* Rating */}
            <div className="h-5 w-40 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />

            {/* Price */}
            <div className="space-y-2">
              <div className="h-10 w-48 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
              <div className="h-5 w-32 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
            </div>

            {/* Stock */}
            <div className="h-5 w-36 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />

            {/* Divider */}
            <div className="h-px bg-neutral-200 dark:bg-dark-800" />

            {/* Variants */}
            <div className="space-y-3">
              <div className="h-5 w-20 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-12 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-5 w-20 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-10 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-3">
              <div className="flex gap-4 border-b border-neutral-200 dark:border-dark-700">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-neutral-200 dark:bg-dark-800 rounded-t animate-pulse" />
                ))}
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 w-full bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                ))}
                <div className="h-4 w-2/3 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Controls - Desktop only */}
          <div className="hidden md:block xl:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-4 p-5 bg-neutral-50 dark:bg-dark-900 rounded-xl border border-neutral-200 dark:border-dark-700">
              {/* Quantity */}
              <div className="space-y-2">
                <div className="h-5 w-20 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                <div className="h-12 w-full bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <div className="h-12 w-full bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                <div className="h-12 w-full bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-200 dark:bg-dark-700" />

              {/* Share & Wishlist */}
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                <div className="flex-1 h-10 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="mt-8 space-y-4">
          <div className="h-7 w-32 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-neutral-50 dark:bg-dark-900 rounded-lg border border-neutral-200 dark:border-dark-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-24 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-neutral-200 dark:bg-dark-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar - Mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-900 border-t border-neutral-200 dark:border-dark-700 px-4 py-3 z-40">
        <div className="flex items-center gap-3">
          <div className="w-28 h-10 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
          <div className="flex-shrink-0 w-12 h-12 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
          <div className="flex-1 h-12 bg-neutral-200 dark:bg-dark-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
