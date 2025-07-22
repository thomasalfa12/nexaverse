"use client";

import { useState, useMemo } from "react";
// SINKRONISASI: Mengimpor tipe `VerifiedEntity` yang benar dari Prisma
import type { VerifiedEntity } from "@prisma/client";

// Recharts & Lucide Icons
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
  TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  data: VerifiedEntity[]; // SINKRONISASI: Menggunakan tipe data yang benar
};

// SINKRONISASI: typeMap ini sekarang selaras dengan enum `EntityType` di ISBTRegistry.sol
const typeMap: Record<number, string> = {
  1: "Institusi",
  2: "Kreator",
  3: "Komunitas",
  4: "DAO",
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

// Komponen Tooltip Kustom (sudah bagus, tidak berubah)
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label || payload[0].name}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function InstitutionStats({ data }: Props) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("30d");

  const stats = useMemo(() => {
    const now = new Date();
    const totalEntities = data.length;

    const statsByType = data.reduce((acc, entity) => {
      // SINKRONISASI: Menggunakan `entity.entityType`
      const typeName = typeMap[entity.entityType] ?? "Tidak Dikenal";
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const donutChartData = Object.entries(statsByType).map(([name, value]) => ({
      name,
      value,
    }));

    const dateLimit = new Date();
    dateLimit.setDate(now.getDate() - (timeRange === "7d" ? 7 : 30));

    const registrationsByDate = data
      // SINKRONISASI: Menggunakan `entity.registrationDate`
      .filter(
        (entity) =>
          entity.registeredAt && new Date(entity.registeredAt) > dateLimit
      )
      .reduce((acc, entity) => {
        // SINKRONISASI: Menggunakan `entity.registrationDate`
        const date = new Date(entity.registeredAt!).toLocaleDateString("en-CA");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const areaChartData = Array.from(
      { length: timeRange === "7d" ? 7 : 30 },
      (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = d.toLocaleDateString("en-CA");
        return {
          date: d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          total: registrationsByDate[dateKey] || 0,
        };
      }
    ).reverse();

    return { totalEntities, donutChartData, areaChartData };
  }, [data, timeRange]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Tren Pendaftaran Baru
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "7d" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("7d")}
            >
              7 Hari
            </Button>
            <Button
              variant={timeRange === "30d" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("30d")}
            >
              30 Hari
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            +{stats.areaChartData.reduce((sum, d) => sum + d.total, 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total pendaftaran dalam {timeRange === "7d" ? "7" : "30"} hari
            terakhir
          </p>
          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.areaChartData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Komposisi Entitas
          </CardTitle>
          <CardDescription>
            Total: {stats.totalEntities} entitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={stats.donutChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {stats.donutChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
