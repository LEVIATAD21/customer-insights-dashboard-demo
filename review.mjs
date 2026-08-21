import assert from 'node:assert/strict';
import fs from 'node:fs';

for (const file of ['README.md', 'index.html', 'styles.css', 'app.mjs', 'main.mjs', 'tests.mjs', 'review.mjs', 'package.json']) {
  assert.ok(fs.existsSync(file), `Arquivo obrigatório ausente: ${file}`);
}

const readme = fs.readFileSync('README.md', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.mjs', 'utf8');

assert.match(readme, /Demo de portfólio independente/);
assert.match(html, /Demo independente de portfólio/);
assert.ok(!fs.existsSync('.env'), 'Arquivos .env não devem ser versionados.');
assert.ok(!fs.existsSync('.env.local'), 'Arquivos .env.local não devem ser versionados.');
assert.doesNotMatch(app, /\b(?:eval|Function)\s*\(/, 'A demo não deve executar código dinâmico.');
assert.doesNotMatch(app, /\b(?:fetch|XMLHttpRequest|WebSocket)\b/, 'A demo não deve fazer requisições externas.');

console.log('customer-insights-dashboard-demo: revisão estática aprovada');
