import type { Metadata } from "next";
import { LogoLab } from "@/components/logo-lab";

export const metadata: Metadata = {
  title: "Logo Animation Lab",
  robots: { index: false, follow: false },
};

export default function LogoLabPage() {
  return <LogoLab />;
}
