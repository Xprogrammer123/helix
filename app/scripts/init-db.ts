import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const { getAuth } = await import("../lib/radon");

await getAuth().init();
console.log("Radon tables ready");
