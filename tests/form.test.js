const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('form submission', () => {
  test('calls fetch with expected payload and updates DOM', async () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/?name=Alice&relationship=friend'
    });

    const { window } = dom;

    window.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ answer: 'Hello' })
      })
    );

    await new Promise(resolve => {
      if (window.document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });

    window.document.getElementById('question').value = 'How are you?';

    window.document
      .getElementById('questionForm')
      .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    await Promise.resolve();
    await Promise.resolve();

    expect(window.fetch).toHaveBeenCalledWith('https://tvujbackend.glitch.me/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', relationship: 'friend', question: 'How are you?' })
    });

    expect(window.document.getElementById('answer').textContent).toBe('Hello');
  });
});
