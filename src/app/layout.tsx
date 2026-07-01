import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leadership development assessment - Đánh Giá Tiến Triển Coachee",
  description: "Hệ thống đánh giá sự thay đổi tư duy và năng lực lãnh đạo dành cho Coachee và Coach ngành bảo hiểm nhân thọ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
