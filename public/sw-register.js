if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service worker registered:', reg);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('New content available, please refresh.');
              } else {
                console.log('Content cached for offline use.');
              }
            }
          });
        });
      })
      .catch(err => {
        console.error('Service worker registration failed:', err);
      });
  });
}
