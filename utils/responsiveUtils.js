/**
 * Utility functions for responsive UI
 */

// Function to set the correct viewport height on mobile devices
export function setViewportHeight() {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  const vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Also set additional viewport variables for more precise control
  document.documentElement.style.setProperty('--window-height', `${window.innerHeight}px`);
  document.documentElement.style.setProperty('--window-width', `${window.innerWidth}px`);
}

// Function to check if the device is a mobile device
export function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  );
}

// Function to handle scroll position on mobile when virtual keyboard appears
export function handleVirtualKeyboard() {
  if (isMobileDevice()) {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        // Add a small delay to let the keyboard appear
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    });
  }
}

// Function to detect if device is in portrait mode
export function isPortraitMode() {
  return window.innerHeight > window.innerWidth || window.matchMedia('(orientation: portrait)').matches;
}

// Function to determine grid classes based on number of participants
export function getGridClasses(count) {
  const isMobile = isMobileDevice();
  const isPortrait = isPortraitMode();
  
  if (isMobile && isPortrait) {
    // Mobile portrait mode
    return count <= 2 ? 'grid2Mobile' : 
           count <= 4 ? 'grid4Mobile' :
           count <= 6 ? 'grid6Mobile' : 'gridManyMobile';
  } else if (isMobile) {
    // Mobile landscape mode
    return count <= 2 ? 'grid2MobileLandscape' :
           count <= 4 ? 'grid4MobileLandscape' : 
           'gridManyMobileLandscape';
  } else {
    // Desktop layout
    return count === 2 ? 'grid2' :
           count <= 4 ? 'grid4' :
           count <= 9 ? 'grid9' : 'gridMany';
  }
}

// Setup responsive listeners for mobile orientation changes
export function setupResponsiveListeners() {
  setViewportHeight();
  
  window.addEventListener('resize', () => {
    setViewportHeight();
  });
  
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure dimensions are updated
    setTimeout(() => setViewportHeight(), 100);
  });
}
