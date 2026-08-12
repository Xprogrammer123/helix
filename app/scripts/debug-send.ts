import { getAuth } from "../lib/radon";

async function main() {
  try {
    const r = await getAuth().emailCode.sendCode({
      email: "fawassaka862@gmail.com",
    });
    console.log("OK", r);
  } catch (e: unknown) {
    const err = e as {
      code?: string;
      message?: string;
      sendCause?: unknown;
      cause?: unknown;
    };
    console.error("CODE", err?.code);
    console.error("MSG", err?.message);
    console.error("CAUSE", err?.sendCause ?? err?.cause);
    console.error(e);
  }
}

main();
