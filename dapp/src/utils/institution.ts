export interface InstitutionRequest {
  id: string;
  name: string;
  walletAddress: string;
  contactEmail: string;
  officialWebsite: string;
  institutionType: number;
  createdAt: string;
}
// utils/institution.ts
export type InstitutionList = {
  id: number; 
  name: string;
  officialWebsite: string;
  contactEmail: string;
  institutionType: number; 
  walletAddress: string;
  createdAt: string; 
};
