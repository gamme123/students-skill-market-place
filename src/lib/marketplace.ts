import { supabase } from "@/integrations/supabase/client";
import { categories, featuredServices, type Service } from "@/data/services";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type ServiceRow = Tables<"services">;
type ProfileRow = Tables<"profiles">;
type ReviewRow = Tables<"reviews">;

export interface MarketplaceProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  university: string;
  avatarUrl: string | null;
}

export interface MarketplaceReview {
  id: string;
  reviewerName: string;
  reviewerInitials: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MarketplaceService extends Service {
  userId?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface MarketplaceServiceDraftInput {
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryDays: number;
  tags: string[];
  imageUrl?: string;
}

const formatInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "SS";

const formatRelativeDate = (value: string) => {
  const then = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const day = 1000 * 60 * 60 * 24;
  const week = day * 7;
  const month = day * 30;

  if (diffMs < day) return "Today";
  if (diffMs < week) return `${Math.max(1, Math.floor(diffMs / day))} day${diffMs >= day * 2 ? "s" : ""} ago`;
  if (diffMs < month) return `${Math.max(1, Math.floor(diffMs / week))} week${diffMs >= week * 2 ? "s" : ""} ago`;
  return `${Math.max(1, Math.floor(diffMs / month))} month${diffMs >= month * 2 ? "s" : ""} ago`;
};

const categoryCounts = new Map(categories.map((category) => [category.name, category.count]));

const fallbackProfile = (service: Service): MarketplaceProfile => ({
  id: service.id,
  userId: `fallback-${service.id}`,
  displayName: service.sellerName,
  bio: `Helping students with ${service.category.toLowerCase()} projects and coursework.`,
  university: service.sellerUniversity,
  avatarUrl: null,
});

const mapFallbackService = (service: Service): MarketplaceService => ({
  ...service,
  userId: `fallback-${service.id}`,
});

export const getFallbackServices = () => featuredServices.map(mapFallbackService);

export const getFeaturedFallbackServices = (limit = 6) => getFallbackServices().slice(0, limit);

export const getCategoryCount = (name: string) => categoryCounts.get(name) ?? 0;

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

const getProfilesByUserId = async (userIds: string[]) => {
  if (!userIds.length) return new Map<string, ProfileRow>();

  const { data, error } = await supabase.from("profiles").select("*").in("user_id", userIds);
  if (error) throw error;

  return new Map((data ?? []).map((profile) => [profile.user_id, profile]));
};

const getReviewsByServiceId = async (serviceIds: string[]) => {
  if (!serviceIds.length) return new Map<string, ReviewRow[]>();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).reduce((map, review) => {
    const list = map.get(review.service_id) ?? [];
    list.push(review);
    map.set(review.service_id, list);
    return map;
  }, new Map<string, ReviewRow[]>());
};

const toMarketplaceProfile = (profile: ProfileRow | undefined, fallback: Service): MarketplaceProfile => ({
  id: profile?.id ?? fallback.id,
  userId: profile?.user_id ?? `fallback-${fallback.id}`,
  displayName: profile?.display_name?.trim() || fallback.sellerName,
  bio: profile?.bio?.trim() || `Helping students with ${fallback.category.toLowerCase()} projects and coursework.`,
  university: profile?.university?.trim() || fallback.sellerUniversity,
  avatarUrl: profile?.avatar_url ?? null,
});

const toMarketplaceService = (
  service: ServiceRow,
  profile: ProfileRow | undefined,
  reviews: ReviewRow[] | undefined,
): MarketplaceService => {
  const rating = reviews?.length
    ? Number((reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1))
    : 5;

  const displayName = profile?.display_name?.trim() || "Student Seller";

  return {
    id: service.id,
    userId: service.user_id,
    title: service.title,
    description: service.description,
    category: service.category,
    price: Number(service.price),
    rating,
    reviewCount: reviews?.length ?? 0,
    sellerName: displayName,
    sellerAvatar: formatInitials(displayName),
    sellerUniversity: profile?.university?.trim() || "Student community",
    image: service.image_url ?? "",
    deliveryDays: service.delivery_days,
    tags: service.tags ?? [],
    createdAt: service.created_at,
    isActive: service.is_active,
  };
};

export const fetchMarketplaceServices = async () => {
  if (!isSupabaseConfigured) {
    return getFallbackServices();
  }

  try {
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!services?.length) return getFallbackServices();

    const userIds = [...new Set(services.map((service) => service.user_id))];
    const serviceIds = services.map((service) => service.id);
    const [profilesByUserId, reviewsByServiceId] = await Promise.all([
      getProfilesByUserId(userIds),
      getReviewsByServiceId(serviceIds),
    ]);

    return services.map((service) =>
      toMarketplaceService(service, profilesByUserId.get(service.user_id), reviewsByServiceId.get(service.id)),
    );
  } catch (error) {
    console.error("Failed to fetch Supabase services", error);
    return getFallbackServices();
  }
};

export const fetchMarketplaceServiceById = async (id: string) => {
  const fallback = getFallbackServices().find((service) => service.id === id);

  if (!isSupabaseConfigured) {
    return fallback ?? null;
  }

  try {
    const { data: service, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!service) return fallback ?? null;

    const [profilesByUserId, reviewsByServiceId] = await Promise.all([
      getProfilesByUserId([service.user_id]),
      getReviewsByServiceId([service.id]),
    ]);

    return toMarketplaceService(service, profilesByUserId.get(service.user_id), reviewsByServiceId.get(service.id));
  } catch (error) {
    console.error("Failed to fetch service by id", error);
    return fallback ?? null;
  }
};

export const fetchReviewsForService = async (serviceId: string, fallbackService?: Service) => {
  const fallbackReviews: MarketplaceReview[] = fallbackService
    ? [
        {
          id: `${fallbackService.id}-review-1`,
          reviewerName: "Jordan L.",
          reviewerInitials: "JL",
          rating: 5,
          comment: "Exceeded expectations and delivered early with excellent quality.",
          createdAt: "2 weeks ago",
        },
        {
          id: `${fallbackService.id}-review-2`,
          reviewerName: "Priya K.",
          reviewerInitials: "PK",
          rating: 5,
          comment: "Very professional and easy to work with. I would definitely order again.",
          createdAt: "1 month ago",
        },
        {
          id: `${fallbackService.id}-review-3`,
          reviewerName: "Tom W.",
          reviewerInitials: "TW",
          rating: 4,
          comment: "Strong results overall and very helpful throughout the process.",
          createdAt: "1 month ago",
        },
      ]
    : [];

  if (!isSupabaseConfigured) {
    return fallbackReviews;
  }

  try {
    const reviewsByServiceId = await getReviewsByServiceId([serviceId]);
    const reviews = reviewsByServiceId.get(serviceId) ?? [];
    if (!reviews.length) return fallbackReviews;

    const reviewerIds = [...new Set(reviews.map((review) => review.reviewer_id))];
    const profilesByUserId = await getProfilesByUserId(reviewerIds);

    return reviews.map((review) => {
      const reviewer = profilesByUserId.get(review.reviewer_id);
      const reviewerName = reviewer?.display_name?.trim() || "Student Buyer";

      return {
        id: review.id,
        reviewerName,
        reviewerInitials: formatInitials(reviewerName),
        rating: review.rating,
        comment: review.comment?.trim() || "Great experience working together.",
        createdAt: formatRelativeDate(review.created_at),
      };
    });
  } catch (error) {
    console.error("Failed to fetch service reviews", error);
    return fallbackReviews;
  }
};

export const fetchCurrentUserProfile = async (userId: string | undefined) => {
  if (!userId || !isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name?.trim() || "Student Seller",
      bio: data.bio?.trim() || "Tell other students what you can help with.",
      university: data.university?.trim() || "Add your university",
      avatarUrl: data.avatar_url,
    } satisfies MarketplaceProfile;
  } catch (error) {
    console.error("Failed to fetch current user profile", error);
    return null;
  }
};

export const fetchCurrentUserServices = async (userId: string | undefined) => {
  if (!userId || !isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data?.length) return [];

    const profile = await fetchCurrentUserProfile(userId);
    return data.map((service) => ({
      id: service.id,
      userId: service.user_id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: Number(service.price),
      rating: 5,
      reviewCount: 0,
      sellerName: profile?.displayName || "Student Seller",
      sellerAvatar: formatInitials(profile?.displayName || "Student Seller"),
      sellerUniversity: profile?.university || "Student community",
      image: service.image_url ?? "",
      deliveryDays: service.delivery_days,
      tags: service.tags ?? [],
      createdAt: service.created_at,
      isActive: service.is_active,
    })) satisfies MarketplaceService[];
  } catch (error) {
    console.error("Failed to fetch current user services", error);
    return [];
  }
};

export const createMarketplaceService = async (
  userId: string | undefined,
  input: MarketplaceServiceDraftInput,
) => {
  if (!userId || !isSupabaseConfigured) return null;

  try {
    const payload: TablesInsert<"services"> = {
      user_id: userId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      price: input.price,
      delivery_days: input.deliveryDays,
      tags: input.tags,
      image_url: input.imageUrl?.trim() || null,
      is_active: true,
    };

    const { data, error } = await supabase.from("services").insert(payload).select("*").single();
    if (error) throw error;

    const profile = await fetchCurrentUserProfile(userId);

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      price: Number(data.price),
      rating: 5,
      reviewCount: 0,
      sellerName: profile?.displayName || "Student Seller",
      sellerAvatar: formatInitials(profile?.displayName || "Student Seller"),
      sellerUniversity: profile?.university || "Student community",
      image: data.image_url ?? "",
      deliveryDays: data.delivery_days,
      tags: data.tags ?? [],
      createdAt: data.created_at,
      isActive: data.is_active,
    } satisfies MarketplaceService;
  } catch (error) {
    console.error("Failed to create marketplace service", error);
    return null;
  }
};

export const getFallbackProfileFromService = (serviceId: string) => {
  const fallback = featuredServices.find((service) => service.id === serviceId);
  return fallback ? fallbackProfile(fallback) : null;
};
