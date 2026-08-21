# Painel de Insights de Atendimento

> **Demo de portfólio independente.** Não representa trabalho contratado, dados de cliente, integração produtiva ou resultado comercial.

Demo estática para explorar um conjunto pequeno de registros explicitamente fictícios. O painel calcula indicadores no navegador, permite recortes por canal e período e gera uma exportação CSV local apenas dos registros que estão visíveis.

## Funcionalidades demonstradas

- Registros fictícios identificados de forma explícita.
- Filtros combinados por canal e intervalo de datas, com validação de período.
- Métricas locais de volume, resolução, pendências, média de nota e taxa de resolução.
- Série diária visual construída sem biblioteca ou chamada externa.
- Exportação CSV segura dos dados filtrados, sem persistência e sem integração remota.

## Executar e revisar

```bash
npm test
npm run review
```

Os testes cobrem normalização, cálculo de indicadores, filtros de período, validação de datas, série diária e escape CSV. A revisão estática confere os arquivos obrigatórios, a identificação de demo, a ausência de arquivos de ambiente, a ausência de execução dinâmica e a ausência de chamadas externas.

## Limites

Dados, contatos e números apresentados pela interface são estritamente ilustrativos. Integrações, pagamento, hospedagem, banco de dados e dados de terceiros exigem escopo e autorização próprios.
