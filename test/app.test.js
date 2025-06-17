const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert');
const { test } = require('node:test');

class ClassList {
  constructor() {
    this.classes = new Set();
  }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  contains(c) { return this.classes.has(c); }
}

function createElement(props = {}) {
  return Object.assign({
    style: {},
    classList: new ClassList(),
    children: [],
    appendChild(child) { this.children.push(child); child.parent = this; },
    remove() { if (this.parent) { const i = this.parent.children.indexOf(this); if (i >= 0) this.parent.children.splice(i, 1); } },
    addEventListener(event, fn) { this[`on${event}`] = fn; },
    dispatchEvent(event, arg) { if (this[`on${event}`]) this[`on${event}`](arg); },
    textContent: '',
    value: '',
    checked: false,
    disabled: false,
    href: '',
    innerHTML: ''
  }, props);
}

function loadScript(custom = {}) {
  const elements = custom.elements || {};
  const ids = [
    'name',
    'startError',
    'e2eeToggle',
    'e2eeToggleGenerate',
    'generateError',
    'generateForm',
    'generatedBox',
    'generatedLink',
    'copyLinkButton',
    'scheduleForm',
    'scheduleEmailError',
    'scheduleConsentError',
    'scheduleError',
    'waitingEmail',
    'marketingConsent',
    'scheduleThankYou',
  ];
  for (const id of ids) {
    if (!elements[id]) elements[id] = createElement();
  }
  const queries = custom.queries || {};
  const lists = custom.lists || {};

  const document = {
    body: createElement(),
    createElement: () => createElement(),
    getElementById(id) { return elements[id]; },
    querySelector(sel) { return queries[sel]; },
    querySelectorAll(sel) { return lists[sel] || []; },
    title: ''
  };

  const context = {
    console,
    window: { open: () => ({ location: {} }) },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    document
  };

  context.fetch = async () => ({ json: async () => ({}) });

  vm.createContext(context);
  const script = fs.readFileSync('script.min.js', 'utf8');
  vm.runInContext(script, context);

  return { context, elements, queries, lists };
}

// startVideoCall validation when no name
test('startVideoCall shows error when name is missing', async () => {
  const { context, elements } = loadScript({
    elements: {
      name: { value: '' },
      startError: createElement(),
      e2eeToggle: { checked: false }
    }
  });

  let called = false;
  context.fetch = async () => { called = true; return { json: async () => ({}) }; };

  await context.startVideoCall();

  assert.strictEqual(elements.startError.textContent, 'Please enter your name.');
  assert.strictEqual(elements.startError.style.display, 'block');
  assert.strictEqual(called, false);
});

// startVideoCall success path
test('startVideoCall creates room and navigates to join URL', async () => {
  const newTab = { location: {} };
  const { context, elements } = loadScript({
    elements: {
      name: { value: 'Alice' },
      startError: createElement(),
      e2eeToggle: { checked: true }
    }
  });
  context.window.open = () => newTab;

  const calls = [];
  context.fetch = async (url) => {
    calls.push(url);
    if (url.endsWith('/rooms')) {
      return { json: async () => ({ room_url: 'ROOM', friendly_url: 'FRIEND' }) };
    }
    return { json: async () => ({ token: 'TOK' }) };
  };

  await context.startVideoCall();

  assert.strictEqual(calls.length, 2);
  assert.strictEqual(newTab.location.href, 'ROOM?token=TOK');
});

// generateRoomLink should update DOM with generated link
test('generateRoomLink fetches room link and updates DOM', async () => {
  const btn = createElement({ textContent: 'Generate Link' });
  const { context, elements, queries } = loadScript({
    elements: {
      e2eeToggleGenerate: { checked: false },
      generateError: createElement(),
      generateForm: createElement(),
      generatedBox: createElement(),
      generatedLink: createElement(),
      copyLinkButton: createElement()
    },
    queries: {
      '#generateForm button': btn
    }
  });

  context.fetch = async () => ({ json: async () => ({ room_url: 'ROOM_URL' }) });

  await context.generateRoomLink();

  assert.strictEqual(elements.generateForm.style.display, 'none');
  assert.strictEqual(elements.generatedBox.style.display, 'block');
  assert.strictEqual(elements.generatedLink.href, 'ROOM_URL');
  assert.strictEqual(elements.generatedLink.textContent, 'ROOM_URL');
  assert.strictEqual(btn.disabled, false);
});

 
