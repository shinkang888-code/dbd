import { createFileRoute } from "@tanstack/react-router";
import { AdminBoardManager } from "@/components/admin/board-manager";
import { NOTICES } from "@/lib/board";

export const Route = createFileRoute("/admin/notices")({
  component: () => <AdminBoardManager config={NOTICES} />,
});
