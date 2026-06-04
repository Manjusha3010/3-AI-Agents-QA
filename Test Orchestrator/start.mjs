/**
 * Windows: starts Uvicorn in a NEW console that stays open (closing this window won't kill the server).
 * Other OS: server runs in this terminal (Ctrl+C to stop).
 *
 * npm start   |   START.bat   |   npm start -- --foreground  (Windows: old single-window mode)
 */
import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as http from "node:http";
import * as net from "node:net";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const webDir = path.join(root, "web");
const serverDir = path.join(root, "server");
const errorLog = path.join(root, "start-error.log");
const winRunnerPath = path.join(serverDir, "_run_server_window.cmd");

const isWin = process.platform === "win32";
const pyExe = isWin
  ? path.join(serverDir, ".venv", "Scripts", "python.exe")
  : path.join(serverDir, ".venv", "bin", "python");

const foregroundWin = isWin && process.argv.includes("--foreground");

let PORT = Number(process.env.PORT || 8000);
let URL = `http://127.0.0.1:${PORT}`;

function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(errorLog, line);
  } catch {
    /* ignore */
  }
  console.error(msg);
}

function runNpm(args, cwd) {
  const r = spawnSync("npm", args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) {
    logError(`npm ${args.join(" ")} failed with exit ${r.status}`);
    process.exit(r.status ?? 1);
  }
}

function runPy(args, cwd = serverDir) {
  if (!fs.existsSync(pyExe)) {
    logError(`Python venv not found at: ${pyExe}`);
    process.exit(1);
  }
  const r = spawnSync(pyExe, args, {
    cwd,
    stdio: "inherit",
    shell: false,
    windowsHide: true,
  });
  if (r.status !== 0) {
    logError(`python ${args.join(" ")} failed with exit ${r.status}`);
    process.exit(r.status ?? 1);
  }
}

function pickPythonForVenvCreate() {
  if (isWin) {
    const py3 = spawnSync("py", ["-3", "--version"], { shell: true, encoding: "utf8" });
    if (py3.status === 0) return { cmd: "py", args: ["-3"] };
  }
  const python = spawnSync("python", ["--version"], { shell: true, encoding: "utf8" });
  if (python.status === 0) return { cmd: "python", args: [] };
  logError("Python not found. Install from https://www.python.org and add to PATH.");
  process.exit(1);
}

function createVenv() {
  console.log("\n>>> Creating Python venv + installing packages (first time, may take a few minutes)...\n");
  const py = pickPythonForVenvCreate();
  const r = spawnSync(py.cmd, [...py.args, "-m", "venv", ".venv"], {
    cwd: serverDir,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0 || !fs.existsSync(pyExe)) {
    logError("Failed to create .venv under server/");
    process.exit(1);
  }
  runPy(["-m", "pip", "install", "--upgrade", "pip"]);
  runPy(["-m", "pip", "install", "-r", "requirements.txt"]);
}

function venvHealthy() {
  if (!fs.existsSync(pyExe)) return false;
  const r = spawnSync(pyExe, ["-c", "import uvicorn, fastapi"], {
    cwd: serverDir,
    shell: false,
    encoding: "utf8",
    windowsHide: true,
  });
  return r.status === 0;
}

function ensureVenv() {
  if (!venvHealthy()) {
    if (fs.existsSync(path.join(serverDir, ".venv"))) {
      console.log("\n>>> Venv exists but packages missing — installing requirements...\n");
    } else {
      createVenv();
      return;
    }
    runPy(["-m", "pip", "install", "-r", "requirements.txt"]);
    if (!venvHealthy()) {
      logError("Still cannot import uvicorn. Delete server\\.venv folder and run again.");
      process.exit(1);
    }
  }
}

function ensureWebBuilt() {
  if (!fs.existsSync(path.join(webDir, "package.json"))) {
    logError(`Web folder not found: ${webDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(path.join(webDir, "node_modules"))) {
    console.log("\n>>> npm install (web)...\n");
    runNpm(["install"], webDir);
  }
  console.log("\n>>> npm run build (web)...\n");
  runNpm(["run", "build"], webDir);
  const indexHtml = path.join(webDir, "dist", "index.html");
  if (!fs.existsSync(indexHtml)) {
    logError(`Build did not produce: ${indexHtml}`);
    process.exit(1);
  }
}

function portFree(p) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(p, "0.0.0.0");
  });
}

async function pickPort() {
  let p = PORT;
  for (let i = 0; i < 20; i++) {
    if (await portFree(p)) return p;
    console.log(`\n>>> Port ${p} is busy, trying ${p + 1}...\n`);
    p += 1;
  }
  logError("No free port found between 8000 and 8020.");
  process.exit(1);
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 90_000;
    const tryOnce = () => {
      if (Date.now() > deadline) {
        reject(new Error("Server did not respond in 90s. See start-error.log."));
        return;
      }
      const req = http.get(`${URL}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
          return;
        }
        setTimeout(tryOnce, 400);
      });
      req.on("error", () => setTimeout(tryOnce, 400));
    };
    tryOnce();
  });
}

function openBrowser() {
  const u = URL;
  if (isWin) {
    spawnSync("cmd", ["/c", "start", "", u], { shell: true, stdio: "ignore" });
  } else if (process.platform === "darwin") {
    spawnSync("open", [u], { stdio: "ignore" });
  } else {
    spawnSync("xdg-open", [u], { stdio: "ignore" });
  }
}

/** Windows: separate console so closing START.bat does not kill Uvicorn */
function launchServerInNewWindowsConsole() {
  const bat = [
    "@echo off",
    "title KEEP OPEN - Test Orchestrator (server)",
    `cd /d "${serverDir}"`,
    `"${pyExe}" -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}`,
    "echo.",
    "echo Server stopped. Press a key to close.",
    "pause >nul",
  ].join("\r\n");
  fs.writeFileSync(winRunnerPath, bat, "utf8");

  const child = spawn("cmd.exe", ["/c", "start", "cmd", "/k", winRunnerPath], {
    cwd: root,
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });
  child.unref();
}

async function main() {
  fs.writeFileSync(errorLog, `--- run ${new Date().toISOString()} ---\n`);

  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║  Test Orchestrator                                 ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log(`\nProject folder:\n  ${root}\n`);

  ensureWebBuilt();
  ensureVenv();

  PORT = await pickPort();
  URL = `http://127.0.0.1:${PORT}`;

  console.log(`\n>>> Starting server on ${URL} ...\n`);

  if (isWin && !foregroundWin) {
    launchServerInNewWindowsConsole();
    try {
      await waitForServer();
      openBrowser();
      console.log("\n┌─────────────────────────────────────────────────────────┐");
      console.log("│  ANOTHER WINDOW OPENED: black box titled                │");
      console.log("│  \"KEEP OPEN - Test Orchestrator (server)\"               │");
      console.log("│                                                         │");
      console.log("│  Leave THAT window open while you use the app.          │");
      console.log("│  You MAY close this window — the server stays running.  │");
      console.log("│  To stop the app: close the server window or run        │");
      console.log("│  STOP-SERVER.bat                                        │");
      console.log("└─────────────────────────────────────────────────────────┘\n");
    } catch (e) {
      logError(e.message || String(e));
      process.exit(1);
    }
    process.exit(0);
  }

  const child = spawn(
    pyExe,
    ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", String(PORT)],
    {
      cwd: serverDir,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
      env: { ...process.env },
    },
  );

  let opened = false;
  waitForServer()
    .then(() => {
      if (!opened) {
        opened = true;
        console.log(`\n>>> OK — opening browser: ${URL}\n`);
        openBrowser();
        console.log(">>> Leave this window OPEN while you use the app.");
        console.log(">>> Press Ctrl+C here to stop the server.\n");
      }
    })
    .catch((e) => {
      logError(e.message || String(e));
    });

  child.on("error", (err) => {
    logError(`spawn failed: ${err.message}`);
    process.exit(1);
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      logError(`Server process exited with code ${code}`);
    }
    process.exit(code ?? 0);
  });

  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
}

main().catch((e) => {
  logError(String(e?.stack || e));
  process.exit(1);
});
