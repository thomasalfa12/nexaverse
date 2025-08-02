// src/types.ts (Sudah Diperbaiki)

import type {
  Course as PrismaCourse,
  Credential as PrismaCredential,
  CourseModule as PrismaModule,
  VerifiedEntity as PrismaVerifiedEntity,
  Pricing as PrismaPricing,
  Enrollment as PrismaEnrollment,
  EligibilityRecord as PrismaEligibilityRecord,
} from "@prisma/client";

// --- Tipe Data Dasar ---
export type CourseModule = PrismaModule;
export type Pricing = PrismaPricing;
export type VerifiedEntity = PrismaVerifiedEntity;

// --- Tipe Data Gabungan (Composite Types) ---

// FIX: Tipe baru untuk Course dengan relasi yang dibutuhkan oleh komponen.
// Ini menggantikan `TemplateWithStats` yang lama.
export type CourseWithStats = PrismaCourse & {
  _count: {
    enrollments: number;
  };
  creator: Pick<VerifiedEntity, "name" | "bio">;
  pricing: Pricing | null;
  modules: Pick<PrismaModule, 'id'>[];
};

// FIX: Tipe Enrollment yang sekarang berelasi dengan Course, bukan CredentialTemplate.
export interface EnrollmentWithCourse extends PrismaEnrollment {
  course: PrismaCourse;
}

// FIX: Tipe untuk kredensial yang bisa diklaim, sekarang berelasi dengan Credential.
export interface ClaimableRecord extends PrismaEligibilityRecord {
  credential: PrismaCredential & {
    creator: Pick<VerifiedEntity, "name">;
  };
}