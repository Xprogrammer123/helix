import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { RELAY_HTTP } from "./config.js";

const CONFIG_DIR = path.join(os.homedir(), ".helix");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

function saveConfig(data: { token: string; username: string }) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

export function loadConfig(): { token: string; username: string } | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function login(): Promise<{ token: string; username: string }> {
  console.log(`[client] relay ${RELAY_HTTP}`);
  const email = await prompt("Email: ");
  if (!email) throw new Error("Email is required");

  const sendRes = await fetch(`${RELAY_HTTP}/api/auth/cli/send-code`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!sendRes.ok) {
    const body = await sendRes.text().catch(() => "");
    const hint =
      sendRes.status === 404
        ? ` Relay at ${RELAY_HTTP} may not be running the latest Helix code.`
        : "";
    throw new Error(
      `Failed to send verification code (HTTP ${sendRes.status}).${hint}${
        body ? ` ${body.slice(0, 120)}` : ""
      }`
    );
  }

  console.log("Check your inbox for a 6-digit code.");
  const code = await prompt("Code: ");
  if (!code) throw new Error("Code is required");

  const verifyRes = await fetch(`${RELAY_HTTP}/api/auth/cli/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (!verifyRes.ok) {
    throw new Error("Invalid or expired code");
  }

  const data = (await verifyRes.json()) as { token: string; username: string };
  saveConfig(data);
  return data;
}
