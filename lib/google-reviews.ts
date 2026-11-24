/**
 * Live Google reviews for the HomeUP Google Business Profile.
 *
 * Reads GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID from the server environment
 * and calls Google Places API (New). The response is cached for 24 hours.
 * Returns null on any missing config, Google error or network failure so the
 * page can simply hide the panel. Never throws.
 */

const CACHE_SECONDS = 86400;
const MAX_REVIEWS = 5;

export type GoogleReview = {
  authorName: string;
  authorUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  reviewUrl: string | null;
};

export type GoogleReviewsData = {
  rating: number;
  totalReviews: number;
  profileUrl: string;
  writeReviewUrl: string;
  reviews: GoogleReview[];
};

type PlacesLocalizedText = { text?: string; languageCode?: string };

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: PlacesLocalizedText;
  originalText?: PlacesLocalizedText;
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

function toReview(review: PlacesReview): GoogleReview | null {
  const text = review.originalText?.text ?? review.text?.text ?? "";
  const authorName = review.authorAttribution?.displayName ?? "";
  if (!authorName || typeof review.rating !== "number") return null;

  return {
    authorName,
    authorUrl: review.authorAttribution?.uri ?? null,
    authorPhotoUrl: review.authorAttribution?.photoUri ?? null,
    rating: review.rating,
    text,
    relativeTime: review.relativePublishTimeDescription ?? "",
    reviewUrl: review.googleMapsUri ?? null,
  };
}

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: CACHE_SECONDS },
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as PlacesResponse;
    if (typeof data.rating !== "number" || typeof data.userRatingCount !== "number") {
      return null;
    }

    const reviews = (data.reviews ?? [])
      .map(toReview)
      .filter((r): r is GoogleReview => r !== null)
      .slice(0, MAX_REVIEWS);

    return {
      rating: data.rating,
      totalReviews: data.userRatingCount,
      profileUrl:
        data.googleMapsUri ??
        `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`,
      writeReviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
      reviews,
    };
  } catch {
    return null;
  }
}
