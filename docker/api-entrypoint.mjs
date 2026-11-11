import { execFileSync } from "node:child_process";
import { chownSync, mkdirSync } from "node:fs";

const uid = Number(
  execFileSync("id", ["-u", "node"], { encoding: "utf8" }).trim(),
);
const gid = Number(
  execFileSync("id", ["-g", "node"], { encoding: "utf8" }).trim(),
);

mkdirSync("/data", { recursive: true });
chownSync("/data", uid, gid);
process.setgid(gid);
process.setuid(uid);

await import("/app/dist/server/node-build.mjs");
