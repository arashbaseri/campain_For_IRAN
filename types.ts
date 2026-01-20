
export interface MP {
  id: string;
  name: string;
  email: string;
  subject?: string;
  body?: string;
  constituency?: string;
}

export interface CampaignData {
  title: string;
  globalSubject: string;
  globalBody: string;
  mps: MP[];
}

export type ViewMode = 'builder' | 'follower';
