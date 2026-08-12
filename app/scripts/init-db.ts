import { getAuth } from "../lib/radon";

await getAuth().init();
console.log("Radon tables ready");
