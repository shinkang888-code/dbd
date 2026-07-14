import { createFileRoute } from "@tanstack/react-router";
import { AdminBoardManager } from "@/components/admin/board-manager";
import { RESOURCES } from "@/lib/board";

export const Route = createFileRoute("/admin/resources")({
  component: () => <AdminBoardManager config={RESOURCES} />,
});
