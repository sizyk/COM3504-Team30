export const SW = {
  reg: null,
};

export default async function initSW() {
  if ('serviceWorker' in navigator) {
    try {
      SW.reg = await navigator.serviceWorker.register('/sw.js');
      if (SW.reg.installing) {
        console.log('Service worker installing');
      } else if (SW.reg.waiting) {
        console.log('Service worker installed');
      } else if (SW.reg.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Service worker failed to register!: ${error}`);
    }
  }
}
