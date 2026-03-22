const fs = require('fs').promises;
const path = require('path');
const http = require('http');

async function loginAndGetToken(email, password) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.token) {
            // ── Read userId from correct field ─────────────
            const userId =
              parsed.userId?.toString() ||
              parsed.user?._id?.toString() ||
              '';
            resolve({ token: parsed.token, userId });
          } else {
            reject(new Error(parsed.message || 'Login failed'));
          }
        } catch {
          reject(new Error('Invalid response from server'));
        }
      });
    });

    req.on('error', () =>
      reject(new Error('Cannot connect to backend. Is the server running?'))
    );
    req.write(body);
    req.end();
  });
}

async function initRepo(repoId) {
  const repoPath = path.resolve(process.cwd(), '.myvcs');
  const commitsPath = path.join(repoPath, 'commits');
  const stagingPath = path.join(repoPath, 'staging');

  try {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = (q) => new Promise(resolve => rl.question(q, resolve));

    console.log('\n── VersaCore Init ──────────────────────────────');
    console.log('Login to verify ownership and save your session.\n');

    const email    = await ask('Email    : ');
    const password = await ask('Password : ');
    rl.close();

    console.log('\nAuthenticating...');

    let token  = '';
    let userId = '';

    try {
      ({ token, userId } = await loginAndGetToken(
        email.trim(),
        password.trim()
      ));
      console.log(`Login successful ✓`);
      console.log(`User ID  : ${userId}`);
    } catch (err) {
      console.error(`\nLogin failed: ${err.message}`);
      console.error('Please check your email and password.');
      console.error('Make sure the backend server is running.\n');
      process.exit(1);  // ← stop here, don't save broken config
    }

    // ── Create .myvcs folder structure ──────────────────
    await fs.mkdir(repoPath,    { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });

    // ── Save config.json ────────────────────────────────
    await fs.writeFile(
      path.join(repoPath, 'config.json'),
      JSON.stringify({
        Bucket: process.env.BUCKET_NAME || '',
        repoId: repoId || '',
        userId: userId,
        token:  token,
      }, null, 2)
    );

    console.log('\nInitialized VCS repository.');
    if (repoId) console.log(`Repository : ${repoId}`);
    console.log('─────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('Error initializing repository:', error.message);
  }
}

module.exports = { initRepo };