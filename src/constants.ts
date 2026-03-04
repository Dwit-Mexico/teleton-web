export const AUTH_API_URL = "https://pixel-dog.guz-studio.dev/api/auth-service"; // "http://localhost:8082";
export const PAYMENT_API_URL =
  "https://pixel-dog.guz-studio.dev/api/payment-service"; // "http://localhost:8081";
export const POST_API_URL = "https://pixel-dog.guz-studio.dev/api/post-service"; // "http://localhost:8080";
export const IMAGE_URL = "https://izeus20.blob.core.windows.net/pixel-dog";
const IMAGE_BASE = import.meta.env.DEV ? "/blob/pixel-dog" : IMAGE_URL;

export const getImageUrl = (pathname: string): string => {
  const isPost = pathname.startsWith("/posts/");
  console.debug(pathname, isPost);
  const renamePathname = isPost ? pathname : pathname.replace(".jpg", ".webp");
  return `${IMAGE_BASE}${renamePathname}`;
};
