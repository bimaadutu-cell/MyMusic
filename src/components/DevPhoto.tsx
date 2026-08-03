"use client";

const DEV_FALLBACK = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#04101f'/><circle cx='200' cy='200' r='150' fill='none' stroke='#2f8bff' stroke-width='10' opacity='0.6'/><text x='50%' y='57%' font-family='Arial, sans-serif' font-size='150' font-weight='bold' font-style='italic' fill='#3f9bff' text-anchor='middle'>BZ</text><text x='50%' y='86%' font-family='Arial, sans-serif' font-size='34' font-weight='bold' fill='#e8f2ff' text-anchor='middle' letter-spacing='4'>BIMZOFFICIAL</text></svg>`,
)}`;

export function DevPhoto() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/images/developer-bimzofficial.png"
      onError={(event) => {
        event.currentTarget.src = DEV_FALLBACK;
      }}
      width={900}
      height={900}
      alt="Logo developer BimzOfficial"
      className="aspect-square w-full rounded-3xl object-cover shadow-[0_0_70px_rgba(47,139,255,0.25)]"
    />
  );
}
