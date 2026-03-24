const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".myvcs");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    // Read config
    let repoId = null;
    let userId = null;
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(repoPath, "config.json"), "utf-8")
      );
      repoId = config.repoId || null;
      userId = config.userId || null;
    } catch {
      console.log("No config found.");
    }

    // Create commit
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    const nonJsonFiles = files.filter(f => f !== 'commit.json');

    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({
        message,
        date: new Date().toISOString(),
        repoId,
        userId,
        files: nonJsonFiles,
      }, null, 2)
    );

    console.log(`Commit ${commitID} created with message: ${message}`);

    // ── Update MongoDB files tracked via HTTP ────────────────
    if (repoId) {
      try {
        const http = require("http");
        const body = JSON.stringify({
          content: nonJsonFiles[0] || '',
          description: message,
        });

        // Update each file in content array
        for (const filename of nonJsonFiles) {
          const updateBody = JSON.stringify({
            content: filename,
            description: message,
          });

          const options = {
            hostname: "localhost",
            port: 5000,
            path: encodeURI(`/api/repo/update/${repoId}`),
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(updateBody),
            },
          };

          await new Promise((resolve) => {
            const req = http.request(options, (res) => {
              let data = "";
              res.on("data", chunk => data += chunk);
              res.on("end", () => {
                if (res.statusCode === 200) {
                  console.log(`MongoDB: added ${filename} to files tracked`);
                }
                resolve();
              });
            });
            req.on("error", () => resolve());
            req.write(updateBody);
            req.end();
          });
        }
      } catch (e) {
        console.log("MongoDB update skipped:", e.message);
      }
    }

    // ── Clear staging folder after commit ────────────────────
    const stagedFiles = await fs.readdir(stagedPath);
    for (const file of stagedFiles) {
      await fs.unlink(path.join(stagedPath, file));
    }
    console.log("Staging folder cleared after commit");

  } catch (err) {
    console.error("Error committing files:", err);
  }
}

module.exports = { commitRepo };