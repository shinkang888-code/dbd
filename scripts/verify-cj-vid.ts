import "dotenv/config";
import { cjConnector } from "@/lib/sourcing/connectors/cjdropshipping";

async function main() {
  const p = await cjConnector.getProduct("2607190735121608100");
  console.log(
    JSON.stringify(
      {
        id: p?.externalId,
        defaultVid: p?.sellerInfo?.defaultVid,
        variants: (p?.optionSchema as { variants?: unknown[] } | undefined)?.variants?.length,
        price: p?.price,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
