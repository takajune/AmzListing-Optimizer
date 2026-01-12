
export interface AmazonListing {
  title: string;
  bullets: string[];
  description: string;
  searchTerms: string;
}

export interface AppState {
  image: string | null;
  mimeType: string | null;
  listing: AmazonListing | null;
  isLoading: boolean;
  error: string | null;
}
