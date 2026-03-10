import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0B1120] text-white",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -inset-[10px] opacity-100 will-change-transform animate-aurora", // Để opacity 100% cho màu lên đầm và nét
            "[background-image:var(--sharp-gradient)]",
            "[background-size:300%_200%]",
            "[background-position:50%_50%,50%_50%]",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_50%_50%,black_80%,transparent_100%)]", // Mở rộng vùng mask để không bị đen viền
          )}
          style={{
            // Tui đã đổi toàn bộ màu Neon thành tông Xám Đen - Xanh Đêm (Tone-sur-tone với Sidebar và Thẻ)
            "--sharp-gradient":
              "repeating-linear-gradient(110deg, #0B1120 0% 15%, #0F1626 15% 30%, #151D2F 30% 45%, #10182A 45% 60%)",
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full h-full">{children}</div>
    </main>
  );
};
