import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createCheckoutSession,
  createPortalSession,
  fetchCurrentUser,
  fetchSubscription,
  type SubscriptionRecord,
  extractErrorMessage
} from "../api";
import { SUBSCRIPTION_PLANS } from "@vivaform/shared";
import type { AuthUser, SubscriptionPlan } from "@vivaform/shared";
import { ThemeToggle } from "../components/theme-toggle";
import { useUserStore } from "../store/user-store";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

const describeStatus = (record: SubscriptionRecord | null | undefined) => {
  if (!record) {
    return "Free access";
  }

  const status = record.status ?? "";

  if (["active", "trialing"].includes(status)) {
    return "Active";
  }

  if (["past_due", "unpaid"].includes(status)) {
    return "Payment required";
  }

  return "Inactive";
};

export const SettingsPage = () => {
  const tokens = useUserStore((state) => state.tokens);
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);

  const {
    data: profileData,
    isLoading: isProfileLoading
  } = useQuery<AuthUser>({
    queryKey: ["profile", "current"],
    queryFn: fetchCurrentUser,
    enabled: Boolean(tokens)
  });

  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    refetch: refetchSubscription
  } = useQuery<SubscriptionRecord | null>({
    queryKey: ["subscription", "current"],
    queryFn: fetchSubscription,
    enabled: Boolean(tokens),
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
  }, [profileData, setProfile]);

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (session) => {
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      toast.error("We could not open checkout. Please try again later.");
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const portalMutation = useMutation({
    mutationFn: createPortalSession,
    onSuccess: (session) => {
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      toast.error("We could not open the billing portal. Please try again later.");
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const isPremium = (profile?.tier ?? profileData?.tier) === "PREMIUM";

  const nextBilling = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;

  const handleCheckout = (plan: SubscriptionPlan) => {
    const origin = window.location.origin;
    checkoutMutation.mutate({
      plan,
      successUrl: `${origin}/app/settings?checkout=success`,
      cancelUrl: `${origin}/app/settings`
    });
  };

  const handlePortal = () => {
    const origin = window.location.origin;
    portalMutation.mutate({
      returnUrl: `${origin}/app/settings`
    });
  };

  const statusLabel = useMemo(() => describeStatus(subscription), [subscription]);

  return (
    <div className="grid w-full gap-6">
      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Update your profile, theme, and VivaForm+ subscription.</p>
          </div>
          <ThemeToggle />
        </header>
      </section>

      <section className="grid gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h2>
          <div className="mt-4 space-y-2 text-sm">
            {isProfileLoading ? (
              <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
            ) : (
              <>
                <div className="rounded-2xl bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold">{profileData?.email ?? profile?.email}</p>
                </div>
                <div className="rounded-2xl bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-semibold">{profileData?.name ?? profile?.name ?? "—"}</p>
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Subscription</h2>
          <div className="mt-4 space-y-3 text-sm">
            {isSubscriptionLoading ? (
              <div className="h-20 animate-pulse rounded-2xl bg-muted/40" />
            ) : (
              <>
                <div className="rounded-2xl bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold">{statusLabel}</p>
                </div>
                {nextBilling ? (
                  <div className="rounded-2xl bg-muted/20 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Next billing</p>
                    <p className="font-semibold">{nextBilling}</p>
                  </div>
                ) : null}
              </>
            )}
            {isPremium ? (
              <button
                type="button"
                onClick={handlePortal}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={portalMutation.isPending}
              >
                {portalMutation.isPending ? "Opening billing portal…" : "Manage subscription"}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Pick a plan to activate VivaForm+.</p>
                <div className="grid gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <button
                      key={plan.plan}
                      type="button"
                      onClick={() => handleCheckout(plan.plan as SubscriptionPlan)}
                      className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm font-semibold transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={checkoutMutation.isPending}
                    >
                      <span>
                        {plan.title}
                        <span className="block text-xs font-normal text-muted-foreground">{plan.description}</span>
                      </span>
                      <span>{plan.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => refetchSubscription()}
              className="w-full rounded-full border border-border px-6 py-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubscriptionLoading}
            >
              Refresh status
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Coming soon</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Goal, height, and weight editing directly from the web app.</li>
          <li>Advanced reminders for meals and hydration.</li>
          <li>Preference controls for the meal planner inside your account.</li>
        </ul>
      </section>
    </div>
  );
};