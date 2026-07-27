import http from "http";
import { exec } from "child_process";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GITHUB_CALLBACK_URL, CLI_CALLBACK_PORT } from './config.js';

const CONFIG_DIR = path.join(os.homedir(), '.helix');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Ov23liEonC5diAqFoF71";

function saveConfig(data: { token: string; username: string }) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

export function loadConfig(): { token: string; username: string } | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function login(): Promise<{ token: string; username: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "", `http://127.0.0.1:${CLI_CALLBACK_PORT}`);
      const token = url.searchParams.get("token");
      const username = url.searchParams.get("username");
      if (!token) return;

      res.end("Logged in! You can close this tab.");
      server.close();

      const data = { token, username: username ?? "" };
      saveConfig(data);
      resolve(data);
    });

    server.listen(CLI_CALLBACK_PORT, () => {
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}&scope=read:user&state=cli`;
      const opener =
        process.platform === "win32"
          ? 'start ""'
          : process.platform === "darwin"
          ? "open"
          : "xdg-open";
      exec(`${opener} "${authUrl}"`);
      console.log("Opening browser to log in with GitHub...");
    });
  });
}
