const fs = require('fs').promises;
const path = require('path');
const https = require('http'); // use https in production

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

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.token) {
            resolve({ token: parsed.token, userId: parsed.user?._id || parsed.userId });
          } else {
            reject(new Error(parsed.message || 'Login failed'));
          }
        } catch {
          reject(new Error('Invalid response from server'));
        }
      });
    });

    req.on('error', () => reject(new Error('Cannot connect to backend. Is the server running?')));
    req.write(body);
    req.end();
  });
}

async function initRepo(repoId) {
  const repoPath = path.resolve(process.cwd(), '.myvcs');
  const commitsPath = path.join(repoPath, 'commits');

  try {
    // ── Prompt user for credentials ────────────────────────────
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = (question) => new Promise(resolve => rl.question(question, resolve));

    console.log('\n── VersaCore Init ──────────────────────────────');
    console.log('Login to verify ownership and save your session.\n');

    const email    = await ask('Email    : ');
    const password = await ask('Password : ');
    rl.close();

    console.log('\nAuthenticating...');

    let token, userId;
    try {
      ({ token, userId } = await loginAndGetToken(email.trim(), password.trim()));
      console.log('Login successful ✓');
    } catch (err) {
      console.error(`Login failed: ${err.message}`);
      console.log('Initializing without auth (MongoDB sync disabled).');
      token = '';
      userId = '';
    }

    // ── Create .myvcs structure ────────────────────────────────
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });

    await fs.writeFile(
      path.join(repoPath, 'config.json'),
      JSON.stringify({
        Bucket: process.env.BUCKET_NAME || '',
        repoId: repoId || '',
        userId: userId || '',
        token: token || '',
      }, null, 2)
    );

    console.log('Initialized VCS repository.');
    if (repoId)  console.log(`Linked to repository : ${repoId}`);
    if (!repoId) console.log('No repoId — run: myvcs init <repoId>');

  } catch (error) {
    console.error('Error initializing repository:', error.message);
  }
}

module.exports = { initRepo };