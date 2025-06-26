const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('form submission', () => {
  test('submitting the form sends fetch and updates answer', async () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      url: 'https://example.com/?name=John&relationship=friend'
    });
    const { window } = dom;

    const fetchMock = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ answer: '42' })
      })
    );
    window.fetch = fetchMock;
    global.fetch = fetchMock;

    const form = window.document.getElementById('questionForm');
    window.document.getElementById('question').value = 'What is meaning of life?';

    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    // wait for promises to resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const expectedPayload = {
      name: 'John',
      relationship: 'friend',
      question: 'What is meaning of life?'
    };
    expect(fetchMock).toHaveBeenCalledWith(
      'https://tvujbackend.glitch.me/ask',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedPayload)
      })
    );
    expect(window.document.getElementById('answer').textContent).toBe('42');
  });
});
