"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Opening blessing before the doors: every auspicious beginning starts with Shree Ganesh.
 * Frame 1: brass Ganesh idol with "॥ श्री गणेशाय नमः ॥"
 * Frame 2: Mithila-painted Ganesh with the Vakratunda shloka
 * Advances on its own; a tap moves on sooner; Skip jumps to the doors.
 */
const FRAMES = [
  { id: "idol", ms: 3400 },
  { id: "mithila", ms: 4600 },
] as const;

export default function GaneshIntro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const reduceMotion = useReducedMotion();

  const next = useCallback(() => {
    setI((n) => {
      if (n + 1 >= FRAMES.length) {
        onDone();
        return n;
      }
      return n + 1;
    });
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(next, FRAMES[i].ms);
    return () => clearTimeout(t);
  }, [i, next]);

  return (
    <section
      className="relative h-svh min-h-[640px] w-full cursor-pointer overflow-hidden bg-night select-none"
      onClick={next}
      aria-label="Blessing of Shree Ganesh. Tap to continue."
    >
      <AnimatePresence mode="sync">
        {i === 0 && (
          <motion.div
            key="idol"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            <motion.div
              className="absolute inset-0"
              initial={reduceMotion ? false : { scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 4, ease: "easeOut" }}
            >
              <Image src="/images/ganesh-idol.jpg" alt="Brass idol of Lord Ganesh with marigolds and diyas" fill priority sizes="480px" className="object-cover" />
            </motion.div>
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,11,16,.75)_0%,rgba(27,11,16,0)_26%,rgba(27,11,16,0)_70%,rgba(27,11,16,.85)_100%)]" />
            <motion.div
              className="absolute inset-x-6 top-16 flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <p lang="sa" className="font-deva text-[30px] leading-snug text-gold-light">
                ॥ श्री गणेशाय नमः ॥
              </p>
            </motion.div>
            <motion.p
              className="absolute inset-x-6 bottom-20 text-center text-xs uppercase tracking-[3px] text-cream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Shree Ganeshaya Namah
            </motion.p>
          </motion.div>
        )}

        {i === 1 && (
          <motion.div
            key="mithila"
            className="absolute inset-0 bg-ivory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="flex h-full flex-col">
              <div className="relative min-h-0 flex-1">
                <Image src="/images/ganesh-mithila.jpg" alt="Mithila painting of Lord Ganesh on a lotus" fill sizes="480px" className="object-contain object-top" />
              </div>
              <motion.div
                className="flex flex-col items-center gap-2 px-6 pt-3 pb-16 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p lang="sa" className="font-deva text-[18px] leading-relaxed text-sindoor">
                  वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।
                  <br />
                  निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
                </p>
                <p className="text-xs text-quiet">May every step of this celebration be free of obstacles.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* progress */}
      <div aria-hidden="true" className="absolute inset-x-6 top-5 flex gap-1.5">
        {FRAMES.map((f, n) => (
          <span key={f.id} className={`h-[3px] flex-1 overflow-hidden rounded-full ${i === 1 ? "bg-maroon/15" : "bg-white/25"}`}>
            {n < i && <span className={`block h-full w-full ${i === 1 ? "bg-sindoor" : "bg-gold-light"}`} />}
            {n === i && (
              <motion.span
                key={`bar-${i}`}
                className={`block h-full ${i === 1 ? "bg-sindoor" : "bg-gold-light"}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: f.ms / 1000, ease: "linear" }}
              />
            )}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        className={`absolute right-3 bottom-4 rounded-full px-4 py-3 text-sm underline-offset-4 hover:underline ${i === 1 ? "text-quiet" : "text-cream/90"}`}
      >
        Skip
      </button>
    </section>
  );
}
