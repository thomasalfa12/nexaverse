import { PieChart, Pie, Cell, Legend } from "recharts";
import { InstitutionRequest } from "@/utils/institution";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const typeMap = [
  "Universitas",
  "Sekolah",
  "Pemerintah",
  "Perusahaan",
  "Lainnya",
];

export default function InstitutionStats({
  data,
}: {
  data: InstitutionRequest[];
}) {
  const stats = typeMap
    .map((label, i) => ({
      name: label,
      value: data.filter((d) => d.institutionType === i + 1).length,
    }))
    .filter((d) => d.value > 0);

  return (
    <div>
      <div className="flex justify-center">
        <PieChart width={360} height={280}>
          <Pie
            data={stats}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
            dataKey="value"
          >
            {stats.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}
