const fs = require('fs');
const { test } = require('node:test');
const assert = require('node:assert');

test('index.html exists', () => {
  assert.ok(fs.existsSync('index.html'));
});

test('html includes script.min.js reference', async () => {
  const content = fs.readFileSync('index.html', 'utf8');
  assert.ok(content.includes('script.min.js'));
});

test('html includes style.min.css reference', async () => {
  const content = fs.readFileSync('index.html', 'utf8');
  assert.ok(content.includes('style.min.css'));
});

test('html includes ph.min.js reference', async () => {
  const content = fs.readFileSync('index.html', 'utf8');
  assert.ok(content.includes('ph.min.js'));
});

test('script.min.js exports startVideoCall function', async () => {
  const scriptContent = fs.readFileSync('script.min.js', 'utf8');
  assert.match(scriptContent, /function startVideoCall\(/);
});

test('script.min.js exports generateRoomLink function', async () => {
  const scriptContent = fs.readFileSync('script.min.js', 'utf8');
  assert.match(scriptContent, /async function generateRoomLink\(/);
});
