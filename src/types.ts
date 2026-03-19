export type ModerationStatus =
  | "pending"
  | "approved"
  | "under_review"
  | "rejected";

export interface Post {
  id: string;
  description: string;
  pathname: string;
  userID: string;
  amountDonated: number;
  moderationStatus: ModerationStatus;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T | null;
  next_cursor: string | null;
  has_more: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  };
}

export interface Donation {
  id: string;
  userID: string;
  amountCents: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  stripeSessionID: string;
  postID?: string;
  imageUploaded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationResponse {
  sessionID: string;
  checkoutURL: string;
}
