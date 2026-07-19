import "dotenv/config";
import { syncSupplier } from "@/lib/sourcing/sync";
import { isCjConfigured } from "@/lib/sourcing/connectors/cjdropshipping";

async function main() {
  console.log("configured", isCjConfigured());
  const r = await syncSupplier("cjdropshipping", { pages: 1 });
  console.log(JSON.stringify(r, null, 2));
  if (r.mode !== "live") {
    console.error("expected live mode");
    process.exit(1);
  }
  if (r.created + r.updated + r.unchanged < 1) {
    console.error("expected products");
    process.exit(1);
  }
  console.log("✅ syncSupplier live OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
