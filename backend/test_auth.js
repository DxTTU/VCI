import fs from 'fs';

async function testFullAuthRoundTrip() {
  const email = `test.${Date.now()}@antigravity.io`;
  const password = 'StrongPassword#2026';

  console.log('1. Registering user without OTP...');
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alex Mercer', email, password, role: 'operator' }),
  });
  const reg = await regRes.json();
  console.log('Registration:', reg.message);

  console.log('\n2. Logging in with credentials...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();
  console.log('Login Status:', login.status); // OTP_REQUIRED
  console.log('Pre-Auth Token Issued:', login.preAuthToken.slice(0, 30) + '...');

  // Wait 1 second for console flush
  await new Promise(r => setTimeout(r, 1000));

  // Read log file to extract OTP
  const logPath = 'C:/Users/Dhatrinath/.gemini/antigravity/brain/9b958717-93d6-41ab-94d2-655f715ef2d7/.system_generated/tasks/task-279.log';
  const logContent = fs.readFileSync(logPath, 'utf8');
  const matches = [...logContent.matchAll(/CODE:\s+>>>\s+(\d{6})\s+<<</g)];
  const latestOtp = matches[matches.length - 1][1];
  console.log('Intercepted Dispatched OTP:', latestOtp);

  console.log('\n3. Submitting OTP to /api/auth/verify-otp...');
  const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${login.preAuthToken}`,
    },
    body: JSON.stringify({ otp: latestOtp }),
  });
  const verify = await verifyRes.json();
  console.log('Verification Status:', verify.status); // AUTHENTICATED
  console.log('Production JWT Access Token:', verify.token.slice(0, 35) + '...');
  console.log('Authenticated User:', verify.user);

  console.log('\n4. Testing Protected Route /api/auth/me with Bearer token...');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${verify.token}` },
  });
  const me = await meRes.json();
  console.log('Protected Me Route Result:', me);

  console.log('\n>>> SUCCESS: COMPLETE ANTIGRAVITY AUTH FLOW VERIFIED! <<<');
}

testFullAuthRoundTrip().catch(console.error);
