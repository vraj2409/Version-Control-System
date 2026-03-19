const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  S3Client, PutObjectCommand,
  ListObjectsV2Command, GetObjectCommand
} = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.BUCKET_NAME;

// ── Helper to fetch commits from S3 prefix ───────────────────────
async function fetchCommitsFromS3(prefix) {
  const commits = [];
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    });

    const data = await s3.send(listCommand);
    const objects = data.Contents || [];
    console.log(`S3 prefix: ${prefix} → ${objects.length} objects`);

    const commitMap = {};
    for (const obj of objects) {
      const parts = obj.Key.split('/');
      if (parts.length >= 5) {
        const commitId = parts[3];
        const filename = parts[4];
        if (!commitId || !filename) continue;
        if (!commitMap[commitId]) {
          commitMap[commitId] = { files: [], jsonKey: null };
        }
        if (filename === 'commit.json') {
          commitMap[commitId].jsonKey = obj.Key;
        } else {
          commitMap[commitId].files.push(filename);
        }
      }
    }

    for (const [commitId, data] of Object.entries(commitMap)) {
      if (data.jsonKey) {
        try {
          const response = await s3.send(new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: data.jsonKey,
          }));
          const chunks = [];
          for await (const chunk of response.Body) chunks.push(chunk);
          const commitJson = JSON.parse(Buffer.concat(chunks).toString());
          commits.push({
            id: commitId,
            message: commitJson.message || 'No message',
            date: commitJson.date || new Date().toISOString(),
            files: data.files,
            source: 's3',
          });
        } catch {
          commits.push({
            id: commitId,
            message: 'Commit',
            date: new Date().toISOString(),
            files: data.files,
            source: 's3',
          });
        }
      }
    }
  } catch (err) {
    console.error('S3 fetch error:', err.message);
  }
  return commits;
}

// ── Get commits — owner only ─────────────────────────────────────
async function getCommits(req, res) {
  const { repoId } = req.params;
  const requestingUserId = req.user?.id;

  try {
    const Repository = require('../models/repoModel');
    const repo = await Repository.findById(repoId);

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Only owner can see commits
    if (repo.owner?.toString() !== requestingUserId?.toString()) {
      return res.status(403).json({
        message: 'Access denied. Only the repository owner can view commit history.'
      });
    }

    const ownerId = repo.owner.toString();
    console.log(`Fetching commits — repo: ${repoId}, owner: ${ownerId}`);

    let commits = [];

    if (S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
      const prefix = `${ownerId}/${repoId}/commits/`;
      commits = await fetchCommitsFromS3(prefix);
      console.log(`Found ${commits.length} commits in S3`);

      // ── Sync all files from S3 commits to MongoDB ────────────
      if (commits.length > 0) {
        try {
          // Collect all unique files across all commits
          const allFiles = new Set();
          for (const commit of commits) {
            for (const file of (commit.files || [])) {
              allFiles.add(file);
            }
          }

          const uniqueFiles = Array.from(allFiles);
          console.log(`Syncing ${uniqueFiles.length} unique files to MongoDB:`, uniqueFiles);

          // Update repo content in MongoDB
          let changed = false;
          for (const filename of uniqueFiles) {
            if (!repo.content.includes(filename)) {
              repo.content.push(filename);
              changed = true;
            }
          }

          if (changed) {
            await repo.save();
            console.log(`MongoDB synced — ${repo.content.length} files tracked`);
          } else {
            console.log('MongoDB already up to date');
          }
        } catch (syncErr) {
          console.error('MongoDB sync error:', syncErr.message);
        }
      }
    }

    commits.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(commits);

  } catch (err) {
    console.error('Error getting commits:', err);
    res.status(500).json({ message: 'Error fetching commits' });
  }
}

// ── Commit files from UI upload ──────────────────────────────────
async function commitFiles(req, res) {
  const { message, repoId } = req.body;
  const files = req.files;
  const userId = req.user?.id;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files provided' });
  }
  if (!message) {
    return res.status(400).json({ message: 'Commit message is required' });
  }

  try {
    const repoPath = path.resolve(process.cwd(), '.myvcs');
    const stagingPath = path.join(repoPath, 'staging');
    const commitsPath = path.join(repoPath, 'commits');

    await fs.mkdir(stagingPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });

    const stagedFiles = [];
    for (const file of files) {
      await fs.writeFile(path.join(stagingPath, file.originalname), file.buffer);
      stagedFiles.push(file.originalname);
    }

    const commitID = uuidv4();
    const commitDir = path.join(commitsPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    for (const filename of stagedFiles) {
      await fs.copyFile(
        path.join(stagingPath, filename),
        path.join(commitDir, filename)
      );
    }

    const commitData = {
      message,
      date: new Date().toISOString(),
      repoId,
      userId,
      files: stagedFiles,
    };

    await fs.writeFile(
      path.join(commitDir, 'commit.json'),
      JSON.stringify(commitData, null, 2)
    );

    // Push to S3
    const s3Results = { success: [], failed: [] };

    if (S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && userId && repoId) {
      const allFiles = [...stagedFiles, 'commit.json'];
      for (const filename of allFiles) {
        try {
          const fileContent = await fs.readFile(path.join(commitDir, filename));
          const key = `${userId}/${repoId}/commits/${commitID}/${filename}`;
          await s3.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: fileContent,
          }));
          s3Results.success.push(filename);
          console.log(`S3 uploaded: ${key}`);
        } catch (s3Err) {
          s3Results.failed.push(filename);
          console.error(`S3 failed for ${filename}:`, s3Err.message);
        }
      }
    }

    // Update MongoDB — files tracked
    if (repoId) {
      try {
        const Repository = require('../models/repoModel');
        const repo = await Repository.findById(repoId);
        if (repo) {
          for (const filename of stagedFiles) {
            if (!repo.content.includes(filename)) {
              repo.content.push(filename);
            }
          }
          repo.description = message;
          await repo.save();
          console.log(`MongoDB updated — ${repo.content.length} files tracked`);
        }
      } catch (e) {
        console.log('MongoDB update skipped:', e.message);
      }
    }

    res.status(201).json({
      message: 'Files committed and pushed to S3 successfully',
      commitID,
      files: stagedFiles,
      s3: {
        pushed: s3Results.success.length,
        failed: s3Results.failed.length,
        path: `${userId}/${repoId}/commits/${commitID}/`,
      },
    });

  } catch (err) {
    console.error('Error committing files:', err);
    res.status(500).json({ message: 'Error creating commit: ' + err.message });
  }
}

module.exports = { commitFiles, getCommits };