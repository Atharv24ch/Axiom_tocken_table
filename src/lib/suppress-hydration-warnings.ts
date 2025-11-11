/**
 * Suppresses hydration warnings caused by browser extensions
 * that inject attributes like bis_skin_checked="1" (Avast, etc.)
 */
export function suppressBrowserExtensionHydrationWarnings() {
  if (typeof window === 'undefined') return;
  
  // Only run in development
  if (process.env.NODE_ENV !== 'development') return;

  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    // Check if this is a hydration warning about bis_skin_checked
    const errorMessage = args[0]?.toString() || '';
    
    if (
      errorMessage.includes('Hydration') ||
      errorMessage.includes('hydration') ||
      errorMessage.includes('hydrated')
    ) {
      const fullMessage = args.join(' ');
      
      // Suppress if it mentions bis_skin_checked or other browser extension attributes
      if (
        fullMessage.includes('bis_skin_checked') ||
        fullMessage.includes('browser extension')
      ) {
        // Don't log this error
        return;
      }
    }
    
    // Call the original console.error for other errors
    originalError.apply(console, args);
  };
}
