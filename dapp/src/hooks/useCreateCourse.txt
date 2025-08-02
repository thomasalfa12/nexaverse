"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseEventLogs, type Log, parseEther } from "viem";
import { contracts } from "@/lib/contracts";
import { prepareTemplateMetadataAction } from "@/lib/server/actions/prepareTemplateMetadataAction";
import { saveCourseAction } from "@/lib/server/actions/saveCourseAction";

type CreateCourseArgs = {
  title: string;
  description: string;
  image: File;
  price: number;
  category: string;
};

type DecodedLog = Log & {
  args: { courseContract?: `0x${string}` }
}

export function useCreateCourse({ onSuccess }: { onSuccess: () => void }) {
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const createCourse = async (values: CreateCourseArgs) => {
    if (!userAddress || !publicClient) {
      toast.error("Dompet tidak terhubung atau jaringan tidak siap.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Mempersiapkan metadata kursus...");

    try {
      // LANGKAH 1: Persiapan Metadata
      const symbol = `NEXA-${(values.title.substring(0, 4)).toUpperCase()}`;
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('image', values.image);
      formData.append('symbol', symbol);

      const metadataResult = await prepareTemplateMetadataAction(formData);
      if (!metadataResult.success || !metadataResult.metadataURI || !metadataResult.imageUrl) {
        throw new Error(metadataResult.error || "Gagal menyiapkan metadata.");
      }
      const { metadataURI, imageUrl } = metadataResult;

      // LANGKAH 2: Deploy Kontrak Kursus
      toast.loading("Menunggu persetujuan untuk deploy kursus...", { id: toastId });
      
      const deployTxHash = await writeContractAsync({
        address: contracts.courseFactory.address,
        abi: contracts.courseFactory.abi,
        functionName: 'createCourse',
        args: [
          values.title,
          symbol,
          parseEther(values.price.toString()),
          "0x0000000000000000000000000000000000000000",
          metadataURI
        ],
      });

      // LANGKAH 3: Tunggu Konfirmasi & Simpan ke DB
      toast.loading("Men-deploy kursus... Menunggu konfirmasi on-chain.", { id: toastId });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: deployTxHash });
      if (receipt.status === 'reverted') throw new Error("Transaksi deployment kursus gagal.");

      const logs = parseEventLogs({ abi: contracts.courseFactory.abi, logs: receipt.logs, eventName: 'CourseCreated' });
      const newContractAddress = (logs[0] as DecodedLog).args.courseContract;
      if (!newContractAddress) throw new Error("Gagal mendapatkan alamat kontrak kursus baru.");
      
      toast.loading("Menyimpan detail kursus ke database...", { id: toastId });
      
      const saveResult = await saveCourseAction({
          title: values.title,
          description: values.description,
          imageUrl: imageUrl,
          contractAddress: newContractAddress,
          price: values.price,
          category: values.category
      });

      if (!saveResult.success) throw new Error(saveResult.error || "Gagal menyimpan kursus.");
      
      toast.success("Kursus berhasil dibuat!", { id: toastId });
      onSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message.split('\n')[0] : "Terjadi kesalahan.";
      toast.error("Proses Gagal", { id: toastId, description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return { createCourse, isLoading };
}