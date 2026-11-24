import { Star } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getGoogleReviews, type GoogleReview } from "@/lib/google-reviews";

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  const filled = Math.round(rating);
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={
            i < filled
              ? `${size} fill-amber-400 text-amber-400`
              : `${size} fill-neutral-200 text-neutral-200`
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const initial = review.authorName.charAt(0).toUpperCase();
  const name = review.authorUrl ? (
    <a
      href={review.authorUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-neutral-900 hover:underline"
    >
      {review.authorName}
    </a>
  ) : (
    <span className="font-semibold text-neutral-900">{review.authorName}</span>
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        {review.authorPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.authorPhotoUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-semibold text-neutral-600"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm">{name}</p>
          {review.relativeTime ? (
            <p className="text-xs text-neutral-500">{review.relativeTime}</p>
          ) : null}
        </div>
      </div>

      <Stars rating={review.rating} />

      {review.text ? (
        <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {review.text}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      {review.reviewUrl ? (
        <a
          href={review.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-xs font-medium text-blue-600 hover:underline"
        >
          View on Google
        </a>
      ) : null}
    </article>
  );
}

export async function GoogleReviews() {
  const data = await getGoogleReviews();
  if (!data) return null;

  const countLabel = `${data.totalReviews.toLocaleString("en-SG")} ${
    data.totalReviews === 1 ? "review" : "reviews"
  } on Google`;

  return (
    <section className="section-padding" aria-labelledby="google-reviews-title">
      <div className="container-page">
        <div className="section-header">
          <Eyebrow>Google reviews</Eyebrow>
          <h2 id="google-reviews-title" className="section-title">
            What clients say on Google
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {data.rating.toFixed(1)}
            </span>
            <Stars rating={data.rating} size="h-5 w-5" />
            <a
              href={data.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {countLabel}
            </a>
          </div>
        </div>

        {data.reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((review, i) => (
              <ReviewCard key={`${review.authorName}-${i}`} review={review} />
            ))}
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            See all reviews
          </a>
          <a
            href={data.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Leave a review
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Reviews and rating provided by Google. Updated daily.
        </p>
      </div>
    </section>
  );
}
