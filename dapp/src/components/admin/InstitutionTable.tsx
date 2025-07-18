"use client";

import { type InstitutionList } from "@/utils/institution";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  data: InstitutionList[];
};

export default function InstitutionTable({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        Belum ada institusi yang terdaftar.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Wallet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((inst, i) => (
            <TableRow key={inst.walletAddress}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{inst.name}</TableCell>
              <TableCell>{inst.institutionType}</TableCell>
              <TableCell>{inst.contactEmail}</TableCell>
              <TableCell>
                <a
                  href={inst.officialWebsite}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inst.officialWebsite}
                </a>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {inst.walletAddress}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
