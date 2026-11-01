import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت | OnSupp",
  description: "ورود به بخش مدیریت سایت OnSupp",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
