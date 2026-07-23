import type {
  AcceptProposalPayload,
  CreateWishPayload,
  Proposal,
  Wish,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_MOCK_API_URL?.replace(/\/$/, "");

function getApiUrl(resource: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_MOCK_API_URL bulunamadı. Proje kökündeki .env dosyasını kontrol edin.",
    );
  }

  return `${API_BASE_URL}/${resource}`;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `API isteği başarısız: ${response.status} ${response.statusText}${
        responseText ? ` - ${responseText}` : ""
      }`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getWishes(): Promise<Wish[]> {
  const wishes = await request<Wish[]>(getApiUrl("wishes"));

  return wishes
    .filter((wish) => wish.approved !== false)
    .sort(
      (firstWish, secondWish) =>
        new Date(secondWish.createdAt).getTime() -
        new Date(firstWish.createdAt).getTime(),
    );
}

export async function createWish(payload: CreateWishPayload): Promise<Wish> {
  return request<Wish>(getApiUrl("wishes"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

let proposalInitializationPromise: Promise<Proposal> | null = null;

async function getOrCreateProposal(): Promise<Proposal> {
  const proposals = await request<Proposal[]>(getApiUrl("proposal"));

  if (proposals.length > 0) {
    return proposals[0];
  }

  return request<Proposal>(getApiUrl("proposal"), {
    method: "POST",
    body: JSON.stringify({
      accepted: false,
      acceptedAt: null,
      answer: "",
    }),
  });
}

export function getProposal(): Promise<Proposal> {
  if (!proposalInitializationPromise) {
    proposalInitializationPromise = getOrCreateProposal().catch((error) => {
      proposalInitializationPromise = null;
      throw error;
    });
  }

  return proposalInitializationPromise;
}

export async function acceptProposal(
  proposalId: string,
  payload: AcceptProposalPayload,
): Promise<Proposal> {
  return request<Proposal>(getApiUrl(`proposal/${proposalId}`), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
