import type {
  Course as PrismaCourse,
  CourseModule as PrismaModule,
  VerifiedEntity as PrismaVerifiedEntity,
  Pricing as PrismaPricing,
  Enrollment as PrismaEnrollment,
  EligibilityRecord as PrismaEligibilityRecord,
   Submission as PrismaSubmission, // 
  Credential as PrismaCredential,
  ModuleText,
  ModuleLiveSession,
  ModuleAssignment,
  ModuleQuiz,
   ModuleVideo, //
} from "@prisma/client";

// --- Tipe Data untuk Pengalaman Belajar ---
export type FullModuleData = PrismaModule & {
  textContent: ModuleText | null;
  videoContent: ModuleVideo | null; // <-- Tambahkan ini
  liveSession: ModuleLiveSession | null;
  assignment: ModuleAssignment | null;
  quiz: ModuleQuiz | null;
  submissions: PrismaSubmission[]; // <-- Tambahkan data submission
};

export type FullCourseLearningData = PrismaCourse & {
  creator: Pick<PrismaVerifiedEntity, "name">; // Bio tidak perlu di halaman belajar
  modules: FullModuleData[];
  enrollment: PrismaEnrollment; // <-- Sertakan data pendaftaran
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
