"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendFeedbackEmail, FeedbackFormValues } from "../app/contact/actions";
import { CheckCircle2Icon } from "lucide-react";
import { GradientText } from "./ui/shadcn-io/gradient-text";

const feedbackFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  rating: z
    .number()
    .min(1, {
      message: "Please select a rating.",
    })
    .max(5, {
      message: "Rating must be between 1 and 5.",
    }),
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
});

const FeedbackInput = () => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<number[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      feedback: "",
    },
  });

  // Load feedback submissions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("feedbackSubmissions");
    if (saved) {
      const submissions = JSON.parse(saved);
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const recentSubmissions = submissions.filter(
        (timestamp: number) => timestamp > oneHourAgo
      );

      if (recentSubmissions.length !== submissions.length) {
        localStorage.setItem(
          "feedbackSubmissions",
          JSON.stringify(recentSubmissions)
        );
      }
      setFeedbackSubmissions(recentSubmissions);
    }
  }, []);

  // Load name and email from Clerk user
  useEffect(() => {
    if (user?.id) {
      form.setValue("name", user.firstName || "");
      form.setValue("email", user.emailAddresses?.[0]?.emailAddress || "");
    }
    form.setFocus("feedback");
  }, [user?.id, form]);

  const checkRateLimit = () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentSubmissions = feedbackSubmissions.filter(
      (timestamp) => timestamp > oneHourAgo
    );
    return recentSubmissions.length < 3;
  };

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (rating: number) => void;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform duration-75 cursor-pointer"
          >
            <Star
              className={`w-6 h-6 ${star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const saveSubmissions = (submissions: number[]) => {
    localStorage.setItem("feedbackSubmissions", JSON.stringify(submissions));
    setFeedbackSubmissions(submissions);
  };

  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    if (!checkRateLimit()) {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const recentSubmissions = feedbackSubmissions.filter(
        (timestamp) => timestamp > oneHourAgo
      );

      if (recentSubmissions.length > 0) {
        const oldestSubmission = Math.min(...recentSubmissions);
        const resetTime = oldestSubmission + 60 * 60 * 1000;
        const timeUntilReset = formatDistanceToNow(resetTime, {
          addSuffix: true,
        });

        toast.error(`Rate limit reached. Try again ${timeUntilReset}.`, {
          position: "top-center",
        });
      } else {
        toast.error(
          "You've reached the maximum of 3 feedback submissions per hour. Please try again later.",
          {
            position: "top-center",
          }
        );
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendFeedbackEmail(values as FeedbackFormValues);

      if (result.success) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        const newSubmissions = [...feedbackSubmissions, Date.now()];
        saveSubmissions(newSubmissions);

        if (user?.id) {
          form.setValue("name", user.firstName || "");
          form.setValue("email", user.emailAddresses?.[0]?.emailAddress || "");
        }

        form.setValue("rating", 0);
        form.setValue("feedback", "");

        form.setFocus("feedback");
      } else {
        toast.error("Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {(() => {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const recentSubmissions = feedbackSubmissions.filter(
          (timestamp) => timestamp > oneHourAgo
        );

        if (recentSubmissions.length === 0) return null;

        const remaining = 3 - recentSubmissions.length;

        if (remaining > 0) {
          return (
            <div className="text-sm text-muted-foreground text-center">
              {remaining} feedback submission{remaining === 1 ? "" : "s"}{" "}
              remaining this hour
            </div>
          );
        }

        return null;
      })()}

      {!checkRateLimit() ? (
        <div className="text-sm text-muted-foreground text-center pb-8 pt-6">
          You&apos;ve reached the maximum of 3 feedback submissions per hour.
          Please try again later.
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-primary">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={user?.firstName || "Your name"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        user?.emailAddresses?.[0]?.emailAddress ||
                        "your.email@example.com"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRating value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please share your thoughts, suggestions, or any issues you've encountered..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Success message */}
            {showSuccessMessage && (
              <div className="flex items-center justify-center gap-2 bg-background p-4 rounded-sm border border-border">
                <CheckCircle2Icon className="!size-12 text-green-500 dark:text-green-400 !mr-1.5" />
                <GradientText
                  className="font-bold"
                  text="Thank you for your feedback! We appreciate you taking the time to share your thoughts."
                  neon
                  gradient="linear-gradient(90deg, #00ff00 0%, #00ffff 25%, #ff00ff 50%, #00ffff 75%, #00ff00 100%)"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !checkRateLimit()}
            >
              {isSubmitting
                ? "Sending..."
                : !checkRateLimit()
                  ? (() => {
                    const now = Date.now();
                    const oneHourAgo = now - 60 * 60 * 1000;
                    const recentSubmissions = feedbackSubmissions.filter(
                      (timestamp) => timestamp > oneHourAgo
                    );

                    if (recentSubmissions.length > 0) {
                      const oldestSubmission = Math.min(...recentSubmissions);
                      const resetTime = oldestSubmission + 60 * 60 * 1000;
                      const timeUntilReset = formatDistanceToNow(resetTime, {
                        addSuffix: true,
                      });
                      return `Rate limit reached. Try again ${timeUntilReset}`;
                    }

                    return "Rate limit reached";
                  })()
                  : "Send Feedback"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default FeedbackInput;
