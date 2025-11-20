"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function PricingPage({
  onStartFree,
  showStartFreeButton = false,
  isLoggedInAndHasCredits,
  setShowInputForm,
}: {
  onStartFree?: () => void;
  showStartFreeButton?: boolean;
  isLoggedInAndHasCredits?: boolean;
  setShowInputForm?: (show: boolean) => void;
} = {}) {
  const { user } = useUser();

  const getButtonForPlan = (plan: (typeof plans)[0]) => {
    const isFreePlan = plan.name === "Free";
    const isLoggedIn = !!user;

    if (isFreePlan && isLoggedInAndHasCredits) {
      return (
        <Button
          onClick={() => setShowInputForm?.(true)}
          className="cursor-pointer"
        >
          {plan.buttonText}
        </Button>
      );
    }

    if (isFreePlan) {
      return isLoggedIn ? (
        <Button
          className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          onClick={() => setShowInputForm?.(true)}
        >
          {plan.buttonText}
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            {plan.buttonText}
          </Button>
        </SignInButton>
      );
    }

    // For Pro and Enterprise plans
    return isLoggedIn ? (
      <Button
        onClick={() => setShowInputForm?.(false)}
        className="cursor-pointer"
      >
        {plan.buttonText}
      </Button>
    ) : (
      <SignInButton mode="modal">
        <Button className="cursor-pointer">{plan.buttonText}</Button>
      </SignInButton>
    );
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      credits: 5,
      description: "Perfect for trying out Jungian insights",
      features: [
        "5 credits per month",
        "Basic psychological analysis",
        "Text responses only",
        "Community support",
      ],
      popular: false,
      buttonText: isLoggedInAndHasCredits ? "Go to App" : "Get Started Free",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      credits: 500,
      description: "For regular users who want more insights",
      features: [
        "500 credits per month",
        "Advanced psychological analysis",
        "Detailed explanations",
        "Priority support",
        "Export to PDF",
      ],
      popular: true,
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "/month",
      credits: 10000,
      description: "For teams and heavy users",
      features: [
        "10,000 credits per month",
        "All Pro features",
        "Custom integrations",
        "Dedicated support",
        "Advanced analytics",
        "Team management",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4" id="pricing">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-4 mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl"
          >
            <Sparkles className="h-8 w-8 text-indigo-600/50 dark:text-indigo-600/70" />
            Simple, Transparent Pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground"
          >
            Choose the plan that fits your journey of self-discovery. No hidden
            fees, no surprises—just clear value at every step.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "scale-105 border-2 border-primary shadow-2xl"
                  : "border shadow-lg"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform bg-gradient-to-r from-indigo-500 to-purple-500">
                  Most Popular
                </Badge>
              )}

              <CardHeader
                className={`text-center ${plan.popular ? "pt-10" : ""}`}
              >
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {plan.credits}
                  </div>
                  <div className="text-muted-foreground">credits per month</div>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center"
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {getButtonForPlan(plan)}
                </motion.div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* FAQ Section */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens if I exceed my limit?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="">
                  You&apos;ll be prompted to upgrade or purchase additional
                  credits. No surprise charges - you control your spending.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I change plans anytime?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="">
                  Absolutely! Upgrade or downgrade at any time. Changes take
                  effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="">
                  Yes, all data is encrypted and stored securely. We never share
                  personal information with third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Do unused credits roll over?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="">Currently not, but they will in the future.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="mb-4">Ready to start your Jungian journey?</p>
          {showStartFreeButton && (
            <>
              {onStartFree ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Pricing component: Start Free button clicked");
                    onStartFree();
                  }}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Start Free Now
                </Button>
              ) : user ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Link href="/jungify">Start Free Now</Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  asChild
                >
                  <SignInButton mode="modal">Start Free Now</SignInButton>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
