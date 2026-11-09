// traced from assets/images/splash-screen.png (1024 px canvas); clips the shine
export const SPLASH_LOGO_PATH =
  "M296 271C282 271 273 280 273 300L270 550C270 680 370 778 512 778C654 778 754 680 754 550L751 300C751 280 742 271 728 271C721 271 715 274 709 279L626 343C608 357 601 372 601 395L599 545C599 600 560 640 512 640C464 640 425 600 425 545L423 395C423 372 416 357 398 343L315 279C309 274 303 271 296 271Z";
export const SPLASH_LOGO_BOX = { x: 270, y: 271, width: 484, height: 507 };

export const SPLASH_SHINE_WIDTH = 220;
export const SPLASH_SHINE_DELAY_MS = 200;
export const SPLASH_SHINE_MS = 900;
export const SPLASH_SHINE_COUNT = 2;
export const SPLASH_SHINE_END_MS =
  SPLASH_SHINE_DELAY_MS + SPLASH_SHINE_MS * SPLASH_SHINE_COUNT;

export const SPLASH_LAND_MS = 700;
// must match expo-splash-screen imageWidth in app.json (the png is a 1024 px canvas)
export const SPLASH_NATIVE_IMAGE_WIDTH = 390;
const NATIVE_SCALE = SPLASH_NATIVE_IMAGE_WIDTH / 1024;
// where the native splash draws the U, in pt: its width and its center's offset below screen center
export const SPLASH_LOGO_WIDTH = SPLASH_LOGO_BOX.width * NATIVE_SCALE;
export const SPLASH_LOGO_OFFSET_Y =
  (SPLASH_LOGO_BOX.y + SPLASH_LOGO_BOX.height / 2 - 512) * NATIVE_SCALE;

// where the blurred U sits in UIPage's backdrop, as fractions of screen width
export const SPLASH_LANDED_WIDTH = 0.484;
export const SPLASH_LANDED_CENTER_Y = 0.42;
