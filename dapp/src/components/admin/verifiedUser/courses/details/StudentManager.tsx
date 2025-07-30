"use client";

import { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Enrollment, Profile } from "@prisma/client";

interface EnrolledStudent extends Enrollment {
  student: Pick<Profile, "name" | "walletAddress">;
}

export function StudentManager({
  courseId,
  isSimpleCredential = false,
}: {
  courseId: string;
  isSimpleCredential?: boolean;
}) {
  const [enrollments, setEnrollments] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // FIX: Menggunakan `courseId` untuk mengambil data siswa
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/courses/${courseId}/enrollments`);
        if (res.ok) {
          setEnrollments(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isSimpleCredential) {
      fetchStudents();
    } else {
      setIsLoading(false);
    }
  }, [courseId, isSimpleCredential]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users /> Manajemen Siswa
        </CardTitle>
        <CardDescription>
          Lihat daftar siswa yang telah terdaftar di kursus Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-8">
            Belum ada siswa yang terdaftar.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {enrollment.student.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {enrollment.student.name || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {enrollment.student.walletAddress}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(enrollment.enrolledAt).toLocaleDateString(
                      "id-ID"
                    )}
                  </TableCell>
                  <TableCell>
                    {enrollment.progress ? `${enrollment.progress}%` : "0%"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
