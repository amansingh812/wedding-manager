/* eslint-disable @next/next/no-img-element -- tiny decorative sprites, no need for next/image */

const PETALS = [
  { left: "10%", size: 18, duration: 11, delay: -3 },
  { left: "34%", size: 14, duration: 15, delay: -9 },
  { left: "58%", size: 20, duration: 13, delay: -5 },
  { left: "82%", size: 16, duration: 17, delay: -12 },
];

export default function Petals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((p) => (
        <img
          key={p.left}
          src="/images/marigold.webp"
          alt=""
          className="petal opacity-85"
          style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}
