import "dotenv/config";

const endpoint = process.env.APPWRITE_ENDPOINT!.replace(/\/$/, "");
const project = process.env.APPWRITE_PROJECT_ID!;
const key = process.env.APPWRITE_API_KEY!;
const dbId = process.env.APPWRITE_DB_ID!;

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": project,
  "X-Appwrite-Key": key,
};

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${endpoint}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    /* keep text */
  }
  if (!res.ok) {
    console.error(method, path, res.status, data);
    throw new Error(`${method} ${path} failed: ${res.status}`);
  }
  return data;
}

async function createStringAttr(
  collectionId: string,
  key: string,
  size: number,
  required = false
) {
  try {
    await api("POST", `/databases/${dbId}/collections/${collectionId}/attributes/string`, {
      key,
      size,
      required,
    });
    console.log(`  + string ${key}`);
  } catch (e) {
    console.log(`  ~ string ${key} (may already exist)`);
  }
}

async function createIntegerAttr(collectionId: string, key: string, required = false) {
  try {
    await api("POST", `/databases/${dbId}/collections/${collectionId}/attributes/integer`, {
      key,
      required,
    });
    console.log(`  + integer ${key}`);
  } catch {
    console.log(`  ~ integer ${key} (may already exist)`);
  }
}

async function createCollection(id: string, name: string) {
  try {
    await api("POST", `/databases/${dbId}/collections`, {
      collectionId: id,
      name,
      permissions: [
        'read("any")',
        'create("any")',
        'update("any")',
        'delete("any")',
      ],
    });
    console.log(`created collection ${id}`);
  } catch {
    console.log(`collection ${id} may already exist`);
  }
}

async function main() {
  console.log("DB", dbId);

  await createCollection("users", "Users");
  await createStringAttr("users", "radon_user_id", 64);
  await createStringAttr("users", "email", 255);
  await createStringAttr("users", "username", 64, true);
  await createStringAttr("users", "token", 64);
  await createStringAttr("users", "name", 255);
  await createStringAttr("users", "plan", 32);
  await createStringAttr("users", "plan_expires_at", 64);
  await createStringAttr("users", "paystack_customer_code", 128);
  await createStringAttr("users", "paystack_subscription_code", 128);
  await createStringAttr("users", "github_id", 64);

  await createCollection("tunnels", "Tunnels");
  await createStringAttr("tunnels", "name", 128, true);
  await createStringAttr("tunnels", "user_id", 64, true);
  await createStringAttr("tunnels", "password_hash", 255);

  await createCollection("requests", "Requests");
  await createStringAttr("requests", "tunnel_name", 128, true);
  await createStringAttr("requests", "method", 16, true);
  await createStringAttr("requests", "path", 2048, true);
  await createIntegerAttr("requests", "status", true);
  await createIntegerAttr("requests", "duration_ms", true);
  await createStringAttr("requests", "timestamp", 64, true);

  console.log("Waiting for attributes to become available...");
  await new Promise((r) => setTimeout(r, 5000));
  console.log("Done. Re-try the dashboard.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
