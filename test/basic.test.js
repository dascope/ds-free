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
