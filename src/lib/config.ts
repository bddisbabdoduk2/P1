export const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
export const reviewMode =
  process.env.CONTENT_MODE === "review" ||
  (process.env.NODE_ENV !== "production" && !configured);
export const showReviewImages =
  reviewMode && process.env.SHOW_REVIEW_IMAGES === "true";
export const siteUrl = process.env.SITE_URL || "http://localhost:3000";
