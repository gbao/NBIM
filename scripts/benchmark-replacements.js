const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../templates/dashboard-template.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Dummy data to simulate the real replacements
const dummyData = {
  lastUpdated: '12 Oct 2023, 14:00',
  totalInvestment: '500.5',
  totalProjects: '42',
  totalCapacityAll: '1234',
  totalCapacity: '5678',
  avgDeployment: '123.45',
  offshoreInvestment: '300.2',
  offshorePercentage: '60',
  offshoreOperationalPercentage: '50',
  offshoreCapacityGw: '5',
  offshoreOperationalGw: '2',
  offshoreCapacity: '5000',
  operationalPercentage: '70',
  totalNewInvestments: '100.0',
  totalInterestReceipts: '20.0',
  totalReceiptsDividends: '30.0',
  totalDevelopmentAssets: '10.0',
  totalLoanRepayments: '50.0',
  investmentsTable: '<table><tr><td>Mock Table</td></tr></table>'.repeat(10),
  yearlyChartData: JSON.stringify({ labels: ['2021', '2022'], datasets: [{ data: [100, 200] }] }),
  technologyChartData: JSON.stringify({ labels: ['Tech A', 'Tech B'], datasets: [{ data: [50, 50] }] }),
  geographyChartData: JSON.stringify({ labels: ['Geo A', 'Geo B'], datasets: [{ data: [60, 40] }] }),
  cashflowChartData: JSON.stringify({ chartData: {}, allData: [], allDataNOK: [] }),
  offshoreBubbleChartData: JSON.stringify({ datasets: [] }),
  exchangeRatesData: JSON.stringify({ rates: { NOK_EUR: { '2021': 10.5 } } })
};

function oldMethod(tmpl, data) {
  return tmpl
    .replace(/{{LAST_UPDATED}}/g, data.lastUpdated)
    .replace(/{{TOTAL_INVESTMENT}}/g, data.totalInvestment)
    .replace(/{{TOTAL_PROJECTS}}/g, data.totalProjects)
    .replace(/{{TOTAL_CAPACITY_ALL}}/g, data.totalCapacityAll)
    .replace(/{{TOTAL_CAPACITY}}/g, data.totalCapacity)
    .replace(/{{AVG_DEPLOYMENT}}/g, data.avgDeployment)
    .replace(/{{OFFSHORE_INVESTMENT}}/g, data.offshoreInvestment)
    .replace(/{{OFFSHORE_PERCENTAGE}}/g, data.offshorePercentage)
    .replace(/{{OFFSHORE_OPERATIONAL_PERCENTAGE}}/g, data.offshoreOperationalPercentage)
    .replace(/{{OFFSHORE_CAPACITY_GW}}/g, data.offshoreCapacityGw)
    .replace(/{{OFFSHORE_OPERATIONAL_GW}}/g, data.offshoreOperationalGw)
    .replace(/{{OFFSHORE_CAPACITY}}/g, data.offshoreCapacity)
    .replace(/{{OPERATIONAL_PERCENTAGE}}/g, data.operationalPercentage)
    .replace(/{{TOTAL_NEW_INVESTMENTS}}/g, data.totalNewInvestments)
    .replace(/{{TOTAL_INTEREST_RECEIPTS}}/g, data.totalInterestReceipts)
    .replace(/{{TOTAL_RECEIPTS_DIVIDENDS}}/g, data.totalReceiptsDividends)
    .replace(/{{TOTAL_DEVELOPMENT_ASSETS}}/g, data.totalDevelopmentAssets)
    .replace(/{{TOTAL_LOAN_REPAYMENTS}}/g, data.totalLoanRepayments)
    .replace(/{{INVESTMENTS_TABLE}}/g, data.investmentsTable)
    .replace(/{{YEARLY_CHART_DATA}}/g, data.yearlyChartData)
    .replace(/{{TECHNOLOGY_CHART_DATA}}/g, data.technologyChartData)
    .replace(/{{GEOGRAPHY_CHART_DATA}}/g, data.geographyChartData)
    .replace(/{{CASHFLOW_CHART_DATA}}/g, data.cashflowChartData)
    .replace(/{{OFFSHORE_BUBBLE_CHART_DATA}}/g, data.offshoreBubbleChartData)
    .replace(/{{EXCHANGE_RATES_DATA}}/g, data.exchangeRatesData);
}

function newMethod(tmpl, data) {
  const replacements = {
    '{{LAST_UPDATED}}': data.lastUpdated,
    '{{TOTAL_INVESTMENT}}': data.totalInvestment,
    '{{TOTAL_PROJECTS}}': data.totalProjects,
    '{{TOTAL_CAPACITY_ALL}}': data.totalCapacityAll,
    '{{TOTAL_CAPACITY}}': data.totalCapacity,
    '{{AVG_DEPLOYMENT}}': data.avgDeployment,
    '{{OFFSHORE_INVESTMENT}}': data.offshoreInvestment,
    '{{OFFSHORE_PERCENTAGE}}': data.offshorePercentage,
    '{{OFFSHORE_OPERATIONAL_PERCENTAGE}}': data.offshoreOperationalPercentage,
    '{{OFFSHORE_CAPACITY_GW}}': data.offshoreCapacityGw,
    '{{OFFSHORE_OPERATIONAL_GW}}': data.offshoreOperationalGw,
    '{{OFFSHORE_CAPACITY}}': data.offshoreCapacity,
    '{{OPERATIONAL_PERCENTAGE}}': data.operationalPercentage,
    '{{TOTAL_NEW_INVESTMENTS}}': data.totalNewInvestments,
    '{{TOTAL_INTEREST_RECEIPTS}}': data.totalInterestReceipts,
    '{{TOTAL_RECEIPTS_DIVIDENDS}}': data.totalReceiptsDividends,
    '{{TOTAL_DEVELOPMENT_ASSETS}}': data.totalDevelopmentAssets,
    '{{TOTAL_LOAN_REPAYMENTS}}': data.totalLoanRepayments,
    '{{INVESTMENTS_TABLE}}': data.investmentsTable,
    '{{YEARLY_CHART_DATA}}': data.yearlyChartData,
    '{{TECHNOLOGY_CHART_DATA}}': data.technologyChartData,
    '{{GEOGRAPHY_CHART_DATA}}': data.geographyChartData,
    '{{CASHFLOW_CHART_DATA}}': data.cashflowChartData,
    '{{OFFSHORE_BUBBLE_CHART_DATA}}': data.offshoreBubbleChartData,
    '{{EXCHANGE_RATES_DATA}}': data.exchangeRatesData
  };

  return tmpl.replace(/{{[A-Z_]+}}/g, (match) => {
    return replacements[match] !== undefined ? replacements[match] : match;
  });
}

const ITERATIONS = 2000;

console.log(`Running benchmark with ${ITERATIONS} iterations...`);

// Warmup
oldMethod(template, dummyData);
newMethod(template, dummyData);

// Measure Old
console.time('Old Method (Chained .replace)');
for (let i = 0; i < ITERATIONS; i++) {
  oldMethod(template, dummyData);
}
console.timeEnd('Old Method (Chained .replace)');

// Measure New
console.time('New Method (Single regex)');
for (let i = 0; i < ITERATIONS; i++) {
  newMethod(template, dummyData);
}
console.timeEnd('New Method (Single regex)');

// Verify correctness
const r1 = oldMethod(template, dummyData);
const r2 = newMethod(template, dummyData);

if (r1 === r2) {
  console.log('✅ Correctness verified: Both methods produce identical output.');
} else {
  console.error('❌ Mismatch! Outputs differ.');
  // Find differences
  for(let i=0; i<r1.length; i++) {
    if(r1[i] !== r2[i]) {
      console.log(`Diff at index ${i}: '${r1.substring(i, i+20)}' vs '${r2.substring(i, i+20)}'`);
      break;
    }
  }
}
