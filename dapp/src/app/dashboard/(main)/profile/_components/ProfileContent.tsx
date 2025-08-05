// File: app/dashboard/(main)/profile/_components/ProfileContent.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrolledCourseCard } from "./EnrolledCourseCard";
import { SbtCard } from "./SbtCard";
import type { EnrollmentWithCourse, SbtWithIssuer } from "../page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Search } from "lucide-react";
import type { ElementType } from "react";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonLink,
}: {
  icon: ElementType;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) => (
  // FIX: Menggunakan warna dari tema
  <Card className="text-center py-16 px-8 mt-6 bg-transparent border-2 border-dashed">
    <div className="flex flex-col items-center max-w-sm mx-auto">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Button asChild>
        <a href={buttonLink}>
          <Search className="w-4 h-4 mr-2" />
          {buttonText}
        </a>
      </Button>
    </div>
  </Card>
);

interface ProfileContentProps {
  enrollments: EnrollmentWithCourse[];
  credentials: SbtWithIssuer[];
}

export function ProfileContent({
  enrollments,
  credentials,
}: ProfileContentProps) {
  const containerVariants: Variants = {
    /* ... (tidak berubah) */
  };
  const itemVariants: Variants = {
    /* ... (tidak berubah) */
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Tabs defaultValue="courses" className="w-full">
        {/* FIX: Tab menggunakan warna tema */}
        <TabsList className="bg-transparent p-0 border-b rounded-none justify-start h-auto">
          <TabsTrigger
            value="courses"
            className="bg-transparent text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none relative"
          >
            Kursus
            <motion.div
              layoutId="underline"
              className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
            />
          </TabsTrigger>
          <TabsTrigger
            value="credentials"
            className="bg-transparent text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none"
          >
            Kredensial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {enrollments.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {enrollments.map((enrollment) => (
                <motion.div key={enrollment.id} variants={itemVariants}>
                  <EnrolledCourseCard enrollment={enrollment} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Anda Belum Terdaftar di Kursus Apapun"
              description="Jelajahi katalog kursus kami dan mulailah perjalanan belajar Anda hari ini!"
              buttonText="Jelajahi Kursus"
              buttonLink="/courses"
            />
          )}
        </TabsContent>

        <TabsContent value="credentials" className="mt-6">
          {credentials.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {credentials.map((sbt) => (
                <motion.div key={sbt.id} variants={itemVariants}>
                  <SbtCard sbt={sbt} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={Award}
              title="Belum Ada Kredensial untuk Dipamerkan"
              description="Selesaikan kursus untuk mendapatkan kredensial dan buktikan keahlian Anda."
              buttonText="Pelajari Kredensial"
              buttonLink="/credentials-info"
            />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
