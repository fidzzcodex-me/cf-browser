# cf-browser

Browser automation utility for web testing and data extraction.

## Install

```bash
npm install cf-browser
```

Requires Chromium. Set `PUPPETEER_EXECUTABLE_PATH` or pass `executablePath`.

```bash
apt-get install -y chromium
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Usage

```js
const { process } = require('cf-browser');

const result = await process('https://example.com', {
  headless: false,
  executablePath: '/usr/bin/chromium'
});

console.log(result.completed);
console.log(result.data);
console.log(result.session);

await result.browser.close();
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `executablePath` | string | env `PUPPETEER_EXECUTABLE_PATH` | Chromium binary |
| `headless` | boolean | `true` | Headless mode |
| `runtimeMode` | string | `addBinding` | Runtime strategy |
| `utilityWorld` | string | `util` | Isolated world |
| `sourceMask` | string | `app.js` | Source mask |
| `debug` | boolean | `false` | Debug logs |
| `userAgent` | string | Chrome default | Custom UA |
| `viewport` | object | `{ width: 1280, height: 720 }` | Viewport |
| `timeout` | number | `60000` | Timeout ms |
| `waitAfter` | number | `3000` | Post-nav wait |
| `autoClose` | boolean | `false` | Auto close |
| `args` | array | `[]` | Extra args |

## CLI

```bash
npx cf-browser https://example.com
```

## Docker

```bash
docker pull ghcr.io/fidzzcodex-me/cf-browser:latest
docker run --rm ghcr.io/fidzzcodex-me/cf-browser https://example.com
```

## License

MIT