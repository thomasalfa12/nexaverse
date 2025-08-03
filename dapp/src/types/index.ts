import type {
  Course as PrismaCourse,
  CourseModule as PrismaModule,
  VerifiedEntity as PrismaVerifiedEntity,
  Pricing as PrismaPricing,
  Enrollment as PrismaEnrollment,
  EligibilityRecord as PrismaEligibilityRecord,
  Credential as PrismaCredential,
  ModuleText,
  ModuleLiveSession,
  ModuleAssignment,
  ModuleQuiz,
} from "@prisma/client";

// --- Tipe Data untuk Pengalaman Belajar ---
export type FullModuleData = PrismaModule & {
  textContent: ModuleText | null;
  liveSession: ModuleLiveSession | null;
  assignment: ModuleAssignment | null;
  quiz: ModuleQuiz | null;
};
export type FullCourseData = PrismaCourse & {
  creator: Pick<PrismaVerifiedEntity, "name" | "bio">;
  pricing: PrismaPricing | null;
  modules: FullModuleData[];
};

// --- Tipe Data untuk Dasbor & Komponen Lain ---
export type CourseModule = PrismaModule;
export type Pricing = PrismaPricing;
export type VerifiedEntity = PrismaVerifiedEntity;

export type CourseWithStats = PrismaCourse & {
  _count: {
    enrollments?: number;
  };
  creator: Pick<VerifiedEntity, "name">;
  pricing: Pricing | null;
  // FIX: Ambil semua field yang dibutuhkan oleh CourseCurriculum
  modules: Pick<PrismaModule, 'id' | 'title' | 'type' | 'stepNumber'>[];
};

export interface EnrollmentWithCourse extends PrismaEnrollment {
  course: PrismaCourse;
}
export interface ClaimableRecord extends PrismaEligibilityRecord {
  credential: PrismaCredential & {
    creator: Pick<VerifiedEntity, "name">;
  };
}
