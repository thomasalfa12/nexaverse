// src/components/admin/InstitutionStats.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Institution = {
  id: number;
  name: string;
};

export default function InstitutionStats({ data }: { data: Institution[] }) {
  const chartData = [
    {
      name: "Institusi Terdaftar",
      total: data.length,
    },
  ];

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistik Institusi</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
