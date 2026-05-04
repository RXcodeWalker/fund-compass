import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "aethelgard-feedback-v1";

export interface FeedbackEntry {
  id: string;
  type: "confusing" | "missing" | "like" | "general";
  text: string;
  page: string;
  createdAt: number;
}

export interface RatingEntry {
  id: string;
  action: string;
  useful: boolean | null;
  followUp: string;
  createdAt: number;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  userUpvoted: boolean;
  createdAt: number;
}

export interface EarlyAccessEntry {
  email: string;
  createdAt: number;
}

export type UserIntent = "compare" | "learn" | "track" | null;

interface FeedbackCtx {
  feedback: FeedbackEntry[];
  submitFeedback: (type: FeedbackEntry["type"], text: string) => void;

  ratings: RatingEntry[];
  submitRating: (action: string, useful: boolean, followUp?: string) => void;
  hasRated: (action: string) => boolean;

  featureRequests: FeatureRequest[];
  submitFeatureRequest: (title: string, description: string) => void;
  toggleUpvote: (id: string) => void;

  earlyAccessEmails: EarlyAccessEntry[];
  submitEarlyAccess: (email: string) => boolean;
  hasEarlyAccess: boolean;

  userIntent: UserIntent;
  setUserIntent: (intent: UserIntent) => void;

  // Mock analytics
  analytics: {
    mostUsedFeatures: { name: string; count: number }[];
    mostViewedFunds: { id: string; name: string; views: number }[];
    feedbackThemes: { theme: string; count: number }[];
    totalFeedback: number;
    totalRatings: number;
    avgUseful: number;
  };
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const mockFeatureRequests: FeatureRequest[] = [
  {
    id: "fr1",
    title: "Export portfolio to PDF",
    description: "Allow downloading a portfolio summary as a formatted PDF document.",
    upvotes: 24,
    userUpvoted: false,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "fr2",
    title: "Historical fund performance charts",
    description: "Show year-by-year performance for each fund instead of just expected ranges.",
    upvotes: 18,
    userUpvoted: false,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "fr3",
    title: "Dark mode",
    description: "Add a dark theme option for the entire platform.",
    upvotes: 12,
    userUpvoted: false,
    createdAt: Date.now() - 86400000 * 1,
  },
];

const mockAnalytics = {
  mostUsedFeatures: [
    { name: "Fund comparison", count: 342 },
    { name: "Portfolio tracking", count: 287 },
    { name: "Fund filtering", count: 256 },
    { name: "Recommendation quiz", count: 198 },
    { name: "Insights viewing", count: 167 },
  ],
  mostViewedFunds: [
    { id: "alpha-vc-1", name: "Alpha Venture Capital Fund I", views: 89 },
    { id: "meridian-pe-1", name: "Meridian Private Equity Partners II", views: 76 },
    { id: "summit-re-1", name: "Summit Real Estate Partners III", views: 64 },
    { id: "pinnacle-pe-1", name: "Pinnacle Growth Equity Fund I", views: 58 },
    { id: "cedar-pd-1", name: "Cedar Private Debt Fund I", views: 51 },
  ],
  feedbackThemes: [
    { theme: "Want more funds", count: 14 },
    { theme: "Comparison is useful", count: 11 },
    { theme: "Want export", count: 9 },
    { theme: "Trust scores are helpful", count: 7 },
    { theme: "Want mobile app", count: 5 },
  ],
};

const Ctx = createContext<FeedbackCtx | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.feedback ?? [];
    } catch {
      return [];
    }
  });

  const [ratings, setRatings] = useState<RatingEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.ratings ?? [];
    } catch {
      return [];
    }
  });

  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>(() => {
    if (typeof window === "undefined") return mockFeatureRequests;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return mockFeatureRequests;
      const data = JSON.parse(raw);
      return data.featureRequests ?? mockFeatureRequests;
    } catch {
      return mockFeatureRequests;
    }
  });

  const [earlyAccessEmails, setEarlyAccessEmails] = useState<EarlyAccessEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.earlyAccessEmails ?? [];
    } catch {
      return [];
    }
  });

  const [userIntent, setUserIntentState] = useState<UserIntent>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.userIntent ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...existing,
          feedback,
          ratings,
          featureRequests,
          earlyAccessEmails,
          userIntent,
        })
      );
    } catch {
      /* ignore */
    }
  }, [feedback, ratings, featureRequests, earlyAccessEmails, userIntent]);

  const submitFeedback = useCallback((type: FeedbackEntry["type"], text: string) => {
    setFeedback((prev) => [
      ...prev,
      {
        id: generateId(),
        type,
        text,
        page: window.location.pathname,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const submitRating = useCallback((action: string, useful: boolean, followUp = "") => {
    setRatings((prev) => [
      ...prev,
      {
        id: generateId(),
        action,
        useful,
        followUp,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const hasRated = useCallback(
    (action: string) => ratings.some((r) => r.action === action),
    [ratings]
  );

  const submitFeatureRequest = useCallback((title: string, description: string) => {
    setFeatureRequests((prev) => [
      ...prev,
      {
        id: generateId(),
        title,
        description,
        upvotes: 1,
        userUpvoted: true,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const toggleUpvote = useCallback((id: string) => {
    setFeatureRequests((prev) =>
      prev.map((fr) => {
        if (fr.id !== id) return fr;
        return {
          ...fr,
          userUpvoted: !fr.userUpvoted,
          upvotes: fr.userUpvoted ? fr.upvotes - 1 : fr.upvotes + 1,
        };
      })
    );
  }, []);

  const submitEarlyAccess = useCallback((email: string): boolean => {
    const exists = earlyAccessEmails.some((e) => e.email === email);
    if (exists) return false;
    setEarlyAccessEmails((prev) => [...prev, { email, createdAt: Date.now() }]);
    return true;
  }, [earlyAccessEmails]);

  const hasEarlyAccess = earlyAccessEmails.length > 0;

  const setUserIntent = useCallback((intent: UserIntent) => {
    setUserIntentState(intent);
  }, []);

  const analytics = useMemo(() => {
    const usefulRatings = ratings.filter((r) => r.useful === true).length;
    const totalRatings = ratings.filter((r) => r.useful !== null).length;
    return {
      ...mockAnalytics,
      totalFeedback: feedback.length,
      totalRatings: ratings.length,
      avgUseful: totalRatings > 0 ? Math.round((usefulRatings / totalRatings) * 100) : 0,
    };
  }, [feedback, ratings]);

  const value = useMemo<FeedbackCtx>(
    () => ({
      feedback,
      submitFeedback,
      ratings,
      submitRating,
      hasRated,
      featureRequests,
      submitFeatureRequest,
      toggleUpvote,
      earlyAccessEmails,
      submitEarlyAccess,
      hasEarlyAccess,
      userIntent,
      setUserIntent,
      analytics,
    }),
    [
      feedback,
      submitFeedback,
      ratings,
      submitRating,
      hasRated,
      featureRequests,
      submitFeatureRequest,
      toggleUpvote,
      earlyAccessEmails,
      submitEarlyAccess,
      hasEarlyAccess,
      userIntent,
      setUserIntent,
      analytics,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFeedback() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeedback must be used inside FeedbackProvider");
  return ctx;
}
