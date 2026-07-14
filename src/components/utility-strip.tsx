export function UtilityStrip() {
  return (
    <div className="flex h-8 items-center justify-center gap-2 bg-ink text-[12px] font-medium text-white">
      <span aria-hidden>🇺🇸</span>
      <span>
        Free shipping to the U.S. over <span className="price font-bold">$49</span>
      </span>
      <span className="text-white/40">·</span>
      <span className="text-white/70">관세 포함 가격 표시</span>
    </div>
  );
}
