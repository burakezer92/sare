export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  approved: boolean;
}

export interface CreateWishPayload {
  name: string;
  message: string;
  createdAt: string;
  approved: boolean;
}

export interface Proposal {
  id: string;
  accepted: boolean;
  acceptedAt: string | null;
  answer: string;
  brideMessage?: string;
}

export interface AcceptProposalPayload {
  accepted: boolean;
  acceptedAt: string;
  brideMessage?: string;
  answer: string;
}
