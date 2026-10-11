let modulePromise;
let portraitPromise;
export function loadAbout() {
  if (!modulePromise)
    modulePromise = import("./components/About.jsx").catch((error) => {
      modulePromise = null;
      throw error;
    });
  return modulePromise;
}
export function prepareAbout() {
  if (!portraitPromise)
    portraitPromise = new Promise((resolve) => {
      const image = new Image();
      const timer = setTimeout(resolve, 1500);
      image.onload = image.onerror = () => {
        clearTimeout(timer);
        resolve();
      };
      image.src = "/optimized/about-fashion-v12.webp";
    });
  return Promise.all([loadAbout(), portraitPromise]);
}
