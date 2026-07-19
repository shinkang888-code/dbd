import "dotenv/config";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

async function main() {
  const auth = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.CJ_API_EMAIL,
      password: process.env.CJ_API_KEY,
    }),
  }).then((r) => r.json());
  const token = auth?.data?.accessToken as string;
  if (!token) {
    console.error("auth fail", auth);
    process.exit(1);
  }

  for (const path of [
    "/product/listV2?page=1&size=3",
    "/product/list?pageNum=1&pageSize=3",
  ]) {
    const json = await fetch(`${BASE}${path}`, {
      headers: { "CJ-Access-Token": token, "Content-Type": "application/json" },
    }).then((r) => r.json());
    console.log("\n===", path, "code=", json?.code, "msg=", json?.message);
    const data = json?.data;
    console.log("data keys", data && typeof data === "object" ? Object.keys(data) : typeof data);
    const list = data?.list ?? data?.content ?? data?.records ?? data;
    const first = Array.isArray(list) ? list[0] : null;
    console.log("listLen", Array.isArray(list) ? list.length : "n/a");
    if (first) {
      console.log("first keys", Object.keys(first));
      console.log(
        "sample",
        JSON.stringify(
          {
            pid: first.pid,
            productId: first.productId,
            id: first.id,
            productNameEn: first.productNameEn,
            productName: first.productName,
            sellPrice: first.sellPrice,
            productSku: first.productSku,
          },
          null,
          2,
        ),
      );
    } else {
      console.log("raw data slice", JSON.stringify(data)?.slice(0, 500));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
