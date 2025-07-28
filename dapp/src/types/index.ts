import type { 
  CredentialTemplate, 
  CourseModule as PrismaModule, 
  VerifiedEntity as PrismaVerifiedEntity, 
  Pricing as PrismaPricing, 
  Enrollment as PrismaEnrollment,
  EligibilityRecord as PrismaEligibilityRecord,
  CourseStatus
} from "@prisma/client";

// FIX: Menggunakan 'type' alias untuk menghindari error linter pada interface kosong.
export type CourseModule = PrismaModule;
export type Pricing = PrismaPricing;
export type VerifiedEntity = PrismaVerifiedEntity;
export type EligibilityRecord = PrismaEligibilityRecord;

// --- Tipe Data Gabungan (Composite Types) ---

export interface TemplateWithStats extends CredentialTemplate {
  _count: {
    eligibilityList: number;
    issuedCredentials: number;
    enrollments: number;
  };
  modules: CourseModule[];
  creator: Pick<VerifiedEntity, 'name' | 'bio'>;
  pricing: Pricing | null;
  // FIX: Menambahkan properti status yang hilang
  status: CourseStatus;
}

export interface EnrollmentWithCourse extends PrismaEnrollment {
  course: CredentialTemplate;
}

export interface ClaimableRecord extends PrismaEligibilityRecord {
  template: TemplateWithStats;
}
