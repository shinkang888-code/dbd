// filepath: src/app/admin/cafe24/page.tsx
import { AdminShell } from "@/components/admin/admin-shell";
import { Cafe24Panel } from "@/components/admin/cafe24-panel";

export const metadata = { title: "Admin · Cafe24" };

export default function AdminCafe24Page() {
  return (
    <AdminShell>
      <Cafe24Panel />
    </AdminShell>
  );
}
