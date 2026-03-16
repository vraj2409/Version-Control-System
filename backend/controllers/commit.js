const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const http = require("http");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".myvcs");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    // ── Read repoId from config ──────────────────────────────────
    let repoId = null;
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(repoPath, "config.json"), "utf-8")
      );
      repoId = config.repoId || null;
    } catch {
      console.log("No config found, skipping MongoDB update.");
    }

    // ── Create commit locally ────────────────────────────────────
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString() })
    );

    console.log(`Commit ${commitID} created with message: ${message}`);

    // ── Update MongoDB repo ──────────────────────────────────────
    if (repoId) {
      const trackedFiles = files
        .filter(f => f !== "commit.json")
        .join(", ");

      const bodyData = JSON.stringify({
        content: trackedFiles,
        description: message,
      });

      // FIX — use URL encoded path
      const requestPath = encodeURI(`/api/repo/update/${repoId}`);

      const options = {
        hostname: "localhost",
        port: 5000,
        path: requestPath,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyData),
        },
      };

      await new Promise((resolve) => {
        const req = http.request(options, (res) => {
          let data = "";
          res.on("data", chunk => data += chunk);
          res.on("end", () => {
            if (res.statusCode === 200) {
              console.log("Repository updated in MongoDB ✓");
            } else {
              console.log("MongoDB update failed:", data);
            }
            resolve();
          });
        });
        req.on("error", (e) => {
          console.log("Could not reach backend:", e.message);
          resolve();
        });
        req.write(bodyData);
        req.end();
      });
    }

  } catch (err) {
    console.error("Error committing files:", err);
  }
}

module.exports = { commitRepo };