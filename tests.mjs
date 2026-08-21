import assert from 'node:assert/strict';
import {
  buildDailySeries,
  calculateMetrics,
  createCsv,
  filterByDateRange,
  filterTickets,
  hasInvalidDateRange,
  isValidIsoDate,
  normalizeTicket,
  tickets,
} from './app.mjs';

assert.deepEqual(normalizeTicket({ score: '4', resolved: 1 }), { score: 4, resolved: true });
assert.deepEqual(calculateMetrics(tickets), { total: 4, resolved: 3, open: 1, average: 4, resolutionRate: 75 });
assert.equal(filterTickets(tickets, { channel: 'Chat' }).length, 2);
assert.equal(filterByDateRange(tickets, '2026-08-02', '2026-08-10').length, 2);
assert.equal(hasInvalidDateRange('2026-08-12', '2026-08-01'), true);
assert.equal(isValidIsoDate('2026-02-30'), false);
assert.deepEqual(buildDailySeries(tickets)[0], { day: '2026-08-01', total: 1, resolved: 1 });
assert.match(createCsv([{ id: 9, day: '2026-08-20', channel: 'E-mail "VIP"', resolved: false, score: 3 }]), /"E-mail ""VIP"""/);

console.log('customer-insights-dashboard-demo: testes aprovados');
