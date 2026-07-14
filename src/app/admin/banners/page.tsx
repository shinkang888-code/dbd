// filepath: src/app/admin/banners/page.tsx
import { AdminShell } from "@/components/admin/admin-shell";
import { BannersPanel } from "@/components/admin/banners-panel";

export const metadata = { title: "Admin · Banners" };

export default function AdminBannersPage() {
  return (
    <AdminShell>
      <BannersPanel />
    </AdminShell>
  );
}
