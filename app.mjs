export const tickets = [
  { id: 1, day: '2026-08-01', channel: 'Chat', resolved: true, score: 5 },
  { id: 2, day: '2026-08-03', channel: 'E-mail', resolved: false, score: 3 },
  { id: 3, day: '2026-08-09', channel: 'Chat', resolved: true, score: 4 },
  { id: 4, day: '2026-08-12', channel: 'Formulário', resolved: true, score: 4 },
];

const channels = ['Todos', 'Chat', 'E-mail', 'Formulário'];

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'sim';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function normalizeTicket(ticket) {
  return {
    ...ticket,
    score: Number(ticket.score),
    resolved: toBoolean(ticket.resolved),
  };
}

export function calculateMetrics(rows) {
  const normalized = rows.map(normalizeTicket);
  const total = normalized.length;
  const resolved = normalized.filter((row) => row.resolved).length;
  const average = total
    ? Number((normalized.reduce((sum, row) => sum + row.score, 0) / total).toFixed(1))
    : 0;

  return {
    total,
    resolved,
    open: total - resolved,
    average,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
  };
}

export function filterByChannel(rows, channel) {
  return channel === 'Todos' ? rows : rows.filter((row) => row.channel === channel);
}

export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function hasInvalidDateRange(startDate, endDate) {
  if (startDate && !isValidIsoDate(startDate)) return true;
  if (endDate && !isValidIsoDate(endDate)) return true;
  return Boolean(startDate && endDate && startDate > endDate);
}

export function filterByDateRange(rows, startDate = '', endDate = '') {
  if (hasInvalidDateRange(startDate, endDate)) return [];
  return rows.filter((row) => {
    const day = row.day;
    return (!startDate || day >= startDate) && (!endDate || day <= endDate);
  });
}

export function filterTickets(rows, filters = {}) {
  const { channel = 'Todos', startDate = '', endDate = '' } = filters;
  return filterByDateRange(filterByChannel(rows, channel), startDate, endDate).map(normalizeTicket);
}

export function buildDailySeries(rows) {
  const series = new Map();
  rows.map(normalizeTicket).forEach((row) => {
    const current = series.get(row.day) ?? { day: row.day, total: 0, resolved: 0 };
    current.total += 1;
    current.resolved += Number(row.resolved);
    series.set(row.day, current);
  });
  return [...series.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function createCsv(rows) {
  const header = ['id', 'data', 'canal', 'status', 'nota'];
  const lines = rows.map((row) => {
    const ticket = normalizeTicket(row);
    return [ticket.id, ticket.day, ticket.channel, ticket.resolved ? 'Resolvido' : 'Em aberto', ticket.score]
      .map(escapeCsv)
      .join(',');
  });
  return `${header.join(',')}\n${lines.join('\n')}\n`;
}

function renderChart(series) {
  if (!series.length) {
    return '<p class="empty">Não há registros para montar a série deste filtro.</p>';
  }

  const peak = Math.max(...series.map((item) => item.total), 1);
  const columns = series
    .map((item) => {
      const height = Math.max(12, Math.round((item.total / peak) * 100));
      const label = escapeHtml(item.day.slice(5).replace('-', '/'));
      return `<li class="chart-column"><span class="chart-value">${item.total}</span><span class="chart-bar" style="height:${height}%" aria-hidden="true"></span><span class="chart-label">${label}</span></li>`;
    })
    .join('');

  return `<ol class="chart" role="img" aria-label="Registros por dia no período selecionado">${columns}</ol>`;
}

function downloadCsv(rows) {
  const blob = new Blob([createCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'insights-atendimento-ficticios.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function mount(root) {
  let filters = { channel: 'Todos', startDate: '', endDate: '' };
  let exportFeedback = '';

  const render = () => {
    const invalidRange = hasInvalidDateRange(filters.startDate, filters.endDate);
    const visible = invalidRange ? [] : filterTickets(tickets, filters);
    const metrics = calculateMetrics(visible);
    const series = buildDailySeries(visible);
    const options = channels
      .map((item) => `<option value="${item}" ${item === filters.channel ? 'selected' : ''}>${item}</option>`)
      .join('');

    root.innerHTML = `<section class="hero"><article class="hero-card"><p class="eyebrow">Dados fictícios</p><h1>Indicadores que mostram de onde veio cada cálculo.</h1><p class="lede">Dashboard local com métricas revisáveis, filtros de período e exportação de dados de demonstração. Nenhuma conversa real é processada, enviada ou armazenada.</p></article><aside class="hero-card"><p class="eyebrow">Governança</p><h2>Origem, filtro e cálculo explícitos</h2><p class="muted">A visualização é montada somente com registros fictícios mantidos nesta página.</p></aside></section><section class="card stack" aria-labelledby="filters-title"><div><p class="eyebrow">Consulta local</p><h2 id="filters-title">Filtrar registros</h2></div><div class="row"><label class="field">Canal<select id="channel" aria-label="Filtrar por canal">${options}</select></label><label class="field">Data inicial<input id="start-date" type="date" value="${escapeHtml(filters.startDate)}"></label><label class="field">Data final<input id="end-date" type="date" value="${escapeHtml(filters.endDate)}"></label><button class="button secondary" id="clear-filters" type="button">Limpar filtros</button><button class="button" id="export-csv" type="button" ${visible.length ? '' : 'disabled'}>Exportar CSV</button></div>${invalidRange ? '<p class="result error" role="alert">Informe um período válido: a data inicial não pode ser posterior à final.</p>' : ''}${exportFeedback ? `<p class="result" role="status">${exportFeedback}</p>` : ''}</section><section class="metrics" style="margin:18px 0"><div class="metric"><b>${metrics.total}</b> registros</div><div class="metric"><b>${metrics.resolved}</b> resolvidos</div><div class="metric"><b>${metrics.open}</b> em aberto</div><div class="metric"><b>${metrics.average}</b> nota média</div><div class="metric"><b>${metrics.resolutionRate}%</b> resolução</div><div class="metric"><b>100%</b> fictício</div></section><section class="grid two"><article class="card"><p class="eyebrow">Série diária</p><h2>Volume por dia</h2>${renderChart(series)}</article><article class="card"><p class="eyebrow">Leitura do filtro</p><h2>Como interpretar</h2><p class="muted">Os totais e a taxa de resolução são recalculados no navegador sempre que um filtro é alterado. A exportação contém apenas os registros fictícios visíveis.</p></article></section><section class="card" style="margin-top:18px"><p class="eyebrow">Auditoria local</p><h2>Registros visíveis</h2><div class="list">${visible.length ? visible.map((ticket) => `<div class="item"><b>#${escapeHtml(ticket.id)} · ${escapeHtml(ticket.channel)}</b><br><span class="muted">${escapeHtml(ticket.day)} · ${ticket.resolved ? 'Resolvido' : 'Em aberto'} · nota ${escapeHtml(ticket.score)}</span></div>`).join('') : '<p class="empty">Nenhum registro corresponde aos filtros atuais.</p>'}</div></section>`;

    root.querySelector('#channel').addEventListener('change', (event) => {
      filters = { ...filters, channel: event.target.value };
      exportFeedback = '';
      render();
    });
    root.querySelector('#start-date').addEventListener('change', (event) => {
      filters = { ...filters, startDate: event.target.value };
      exportFeedback = '';
      render();
    });
    root.querySelector('#end-date').addEventListener('change', (event) => {
      filters = { ...filters, endDate: event.target.value };
      exportFeedback = '';
      render();
    });
    root.querySelector('#clear-filters').addEventListener('click', () => {
      filters = { channel: 'Todos', startDate: '', endDate: '' };
      exportFeedback = '';
      render();
    });
    root.querySelector('#export-csv').addEventListener('click', () => {
      downloadCsv(visible);
      exportFeedback = 'Arquivo CSV com os registros fictícios visíveis preparado para download.';
      render();
    });
  };

  render();
}
