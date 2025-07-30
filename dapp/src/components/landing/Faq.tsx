import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
  const faqs = [
    {
      question: "Apa itu Kredensial On-Chain (Soulbound Token)?",
      answer:
        "Soulbound Token (SBT) adalah jenis token digital yang tidak dapat ditransfer, terikat secara permanen ke dompet Anda. Di Nexaverse, SBT digunakan sebagai sertifikat atau bukti pencapaian yang tidak dapat dipalsukan.",
    },
    {
      question: "Mengapa saya harus belajar di Nexaverse?",
      answer:
        "Setiap pencapaian Anda diakui dengan kredensial on-chain. Ini membangun reputasi digital Anda yang dapat diverifikasi oleh siapa pun, di mana pun, membuka peluang karier baru.",
    },
    {
      question: "Bagaimana cara menjadi kreator di Nexaverse?",
      answer:
        "Cukup ajukan verifikasi sebagai entitas. Setelah disetujui, Anda akan mendapatkan akses ke dasbor kreator kami untuk mulai membuat kursus, menerbitkan modul, dan mengelola komunitas siswa Anda.",
    },
    {
      question: "Apakah semua kursus berbayar?",
      answer:
        "Tidak. Setiap kreator memiliki kebebasan untuk menentukan harga kursus mereka sendiri. Pembayaran dilakukan secara langsung dan transparan menggunakan cryptocurrency.",
    },
  ];
  return (
    <section className=" px-4 bg-background">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Menemukan jawaban cepat untuk pertanyaan umum tentang platform kami.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg bg-card px-4"
            >
              <AccordionTrigger className="text-left text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
