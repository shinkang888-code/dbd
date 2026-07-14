import { createFileRoute } from "@tanstack/react-router";
import { AdminBoardManager } from "@/components/admin/board-manager";
import { GALLERY } from "@/lib/board";

export const Route = createFileRoute("/admin/gallery")({
  component: () => <AdminBoardManager config={GALLERY} />,
});
