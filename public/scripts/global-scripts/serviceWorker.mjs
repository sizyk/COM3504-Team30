export const SW = {
  reg: null,
};

export default function initSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/public/sw.js')
      .then((registration) => {
        SW.reg = registration;
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}
