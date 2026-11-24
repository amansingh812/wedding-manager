import Image from "next/image";

export default function InviteNotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col items-center justify-center gap-5 bg-ivory px-8 text-center">
      <Image src="/images/kalash.webp" alt="" width={88} height={88} />
      <h1 className="font-display text-4xl text-maroon">This invitation link isn&apos;t valid</h1>
      <p className="text-base leading-relaxed text-muted">
        Please check the link you received on WhatsApp, or ask the family to send it again.
      </p>
    </main>
  );
}
