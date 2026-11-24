import Image from "next/image";

/** End of the ceremonies page: Mithila-painted Ganesh with the Vakratunda shloka. */
export default function ClosingBlessing() {
  return (
    <section aria-label="Blessing" className="mt-6 flex flex-col items-center gap-3 px-2 text-center">
      <div className="relative w-[78%] overflow-hidden rounded-[18px] shadow-[0_10px_30px_rgba(58,10,12,.12)]">
        <Image
          src="/images/ganesh-mithila.jpg"
          alt="Mithila painting of Lord Ganesh on a lotus"
          width={900}
          height={1600}
          sizes="(max-width: 480px) 78vw, 360px"
          className="h-auto w-full"
        />
      </div>
      <p lang="sa" className="font-deva text-[17px] leading-relaxed text-sindoor">
        वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।
        <br />
        निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
      </p>
      <p className="text-xs text-quiet">May every step of this celebration be free of obstacles.</p>
    </section>
  );
}
