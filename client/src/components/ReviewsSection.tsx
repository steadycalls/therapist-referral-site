import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, ThumbsUp, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ReviewsSectionProps {
  therapistId: number;
  therapistName: string;
}

export function ReviewsSection({ therapistId, therapistName }: ReviewsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  const { data: reviews, isLoading: reviewsLoading, refetch: refetchReviews } = 
    trpc.therapists.reviews.useQuery({ therapistId });

  const { data: aiSummary, isLoading: summaryLoading, refetch: refetchSummary } = 
    trpc.aiReview.getReviewSummary.useQuery({ therapistId });

  const submitReviewMutation = trpc.therapists.submitReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setIsDialogOpen(false);
      setRating(0);
      setReviewText("");
      setReviewerName("");
      refetchReviews();
      refetchSummary();
    },
    onError: (error: any) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    if (!reviewerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    submitReviewMutation.mutate({
      therapistId,
      rating,
      reviewText: reviewText.trim(),
      reviewerName: reviewerName.trim(),
    });
  };

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const ratingDistribution = reviews?.reduce((acc: Record<number, number>, review: any) => {
    const r = review.rating || 0;
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ratings & Reviews</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review for {therapistName}</DialogTitle>
                  <DialogDescription>
                    Share your experience to help others make informed decisions.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Your Rating</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (hoverRating || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reviewer-name">Your Name</Label>
                    <input
                      id="reviewer-name"
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="John D."
                    />
                  </div>

                  <div>
                    <Label htmlFor="review-text">Your Review</Label>
                    <Textarea
                      id="review-text"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitReviewMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending}
                  >
                    {submitReviewMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Right: Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = reviews.length > 0 
                    ? (count / reviews.length) * 100 
                    : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-12">{star} star</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No reviews yet. Be the first to review {therapistName}!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Generated Summary */}
      {aiSummary && aiSummary.summary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary of Reviews
              {aiSummary.cached && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Cached
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {aiSummary.summary}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  This summary was generated by AI based on {aiSummary.reviewCount} reviews.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Reviews</h3>
          {reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{review.reviewerName}</div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= (review.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{review.reviewText}</p>
                {review.helpfulCount && review.helpfulCount > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpfulCount} found this helpful</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
