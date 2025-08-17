const fs = require('fs').promises;
const path = require('path');
const DataProcessor = require('./data-processor');

class DashboardGenerator {
  constructor() {
    this.dataProcessor = new DataProcessor();
    this.publicDir = path.join(__dirname, '../public');
    this.templatesDir = path.join(__dirname, '../templates');
  }

  async generate() {
    console.log('🎨 Generating NBIM dashboard...');
    
    try {
      // Load and process data
      const rawData = await this.dataProcessor.loadData();
      const metrics = this.dataProcessor.calculateMetrics(rawData.acquisitions, rawData.exchangeRates);
      const investmentsTable = this.dataProcessor.processInvestmentsForTable(rawData.acquisitions, rawData.exchangeRates);
      const cashflowData = this.dataProcessor.processCashflowData(rawData.cashflow);

      // Generate dashboard HTML
      const dashboardHtml = await this.generateDashboardHtml({
        metrics,
        investments: investmentsTable,
        cashflow: cashflowData,
        exchangeRates: rawData.exchangeRates,
        lastUpdated: rawData.acquisitions.lastUpdated
      });

      // Save files
      await this.saveDashboard(dashboardHtml);
      await this.saveApiData({
        metrics,
        investments: investmentsTable,
        cashflow: cashflowData.allData,
        exchangeRates: rawData.exchangeRates,
        lastUpdated: rawData.acquisitions.lastUpdated
      });

      console.log('🎉 Dashboard generated successfully!');
      console.log(`📁 Output directory: ${this.publicDir}`);
      
    } catch (error) {
      console.error('❌ Error generating dashboard:', error.message);
      throw error;
    }
  }

  async generateDashboardHtml(data) {
    const templatePath = path.join(this.templatesDir, 'dashboard-template.html');
    
    try {
      const template = await fs.readFile(templatePath, 'utf8');
      
      // Format last updated date
      const lastUpdated = new Date(data.lastUpdated).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      
      // Replace template variables
      return template
        .replace(/{{LAST_UPDATED}}/g, lastUpdated)
        .replace(/{{TOTAL_INVESTMENT}}/g, this.formatCurrencyWithoutUnit(data.metrics.totalInvestmentEur))
        .replace(/{{TOTAL_PROJECTS}}/g, data.metrics.totalProjects.toString())
        .replace(/{{TOTAL_CAPACITY_ALL}}/g, Math.round(data.metrics.totalCapacityAll).toString())
        .replace(/{{TOTAL_CAPACITY}}/g, Math.round(data.metrics.totalCapacityByStake).toString())
        .replace(/{{OFFSHORE_INVESTMENT}}/g, this.formatCurrency(data.metrics.offshoreInvestmentEur))
        .replace(/{{OFFSHORE_CAPACITY_GW}}/g, (data.metrics.offshoreCapacityByStake / 1000).toFixed(1))
        .replace(/{{OFFSHORE_OPERATIONAL_GW}}/g, (data.metrics.offshoreOperationalCapacity / 1000).toFixed(1))
        .replace(/{{OFFSHORE_CAPACITY}}/g, Math.round(data.metrics.offshoreCapacityByStake).toString())
        .replace(/{{OPERATIONAL_PERCENTAGE}}/g, Math.round(data.metrics.operationalPercentage).toString())
        .replace(/{{INVESTMENTS_TABLE}}/g, this.generateInvestmentsTable(data.investments))
        .replace(/{{YEARLY_CHART_DATA}}/g, JSON.stringify(this.prepareYearlyChartData(data.metrics.yearlyInvestments)))
        .replace(/{{TECHNOLOGY_CHART_DATA}}/g, JSON.stringify(this.prepareTechnologyChartData(data.metrics.technologyBreakdown)))
        .replace(/{{GEOGRAPHY_CHART_DATA}}/g, JSON.stringify(this.prepareGeographyChartData(data.metrics.geographyBreakdown)))
        .replace(/{{CASHFLOW_CHART_DATA}}/g, JSON.stringify(this.prepareCashflowChartData(data.cashflow.fullYearData)))
        .replace(/{{EXCHANGE_RATES_DATA}}/g, JSON.stringify(data.exchangeRates));
        
    } catch (error) {
      // If template doesn't exist, create a basic dashboard
      console.log('📝 Template not found, generating basic dashboard...');
      return this.generateBasicDashboard(data);
    }
  }

  generateBasicDashboard(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NBIM Offshore Wind Investment Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2.5rem; font-weight: bold; color: #667eea; }
        .metric-label { color: #666; margin-top: 10px; }
        .chart-container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .chart-wrapper { position: relative; height: 400px; }
        .table-container { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; }
        tr:hover { background: #f8f9fa; }
        .footer { text-align: center; margin-top: 40px; color: #666; }
        @media (max-width: 768px) { .metrics-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌊 NBIM Offshore Wind Investment Dashboard</h1>
            <p>Comprehensive overview of renewable infrastructure investments</p>
            <p>Last updated: ${new Date(data.lastUpdated).toLocaleDateString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">€${this.formatCurrency(data.metrics.totalInvestmentEur)}</div>
                <div class="metric-label">Total Investment</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.metrics.totalProjects}</div>
                <div class="metric-label">Total Projects</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(data.metrics.totalCapacityByStake)} MW</div>
                <div class="metric-label">Total Capacity (by stake)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">€${this.formatCurrency(data.metrics.offshoreInvestmentEur)}</div>
                <div class="metric-label">Offshore Wind Investment</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(data.metrics.offshoreCapacityByStake)} MW</div>
                <div class="metric-label">Offshore Wind Capacity</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(data.metrics.operationalPercentage)}%</div>
                <div class="metric-label">Operational Assets</div>
            </div>
        </div>

        <div class="chart-container">
            <h2>📊 Investment by Year</h2>
            <div class="chart-wrapper">
                <canvas id="yearlyChart"></canvas>
            </div>
        </div>

        <div class="chart-container">
            <h2>🔧 Technology Breakdown</h2>
            <div class="chart-wrapper">
                <canvas id="technologyChart"></canvas>
            </div>
        </div>

        <div class="chart-container">
            <h2>🌍 Geographic Distribution</h2>
            <div class="chart-wrapper">
                <canvas id="geographyChart"></canvas>
            </div>
        </div>

        <div class="chart-container">
            <h2>💰 Cash Flow Analysis</h2>
            <div class="chart-wrapper">
                <canvas id="cashflowChart"></canvas>
            </div>
        </div>

        <div class="table-container">
            <h2 style="padding: 20px;">📋 Investment Details</h2>
            ${this.generateInvestmentsTable(data.investments)}
        </div>

        <div class="footer">
            <p>🤖 Generated from Excel data • Powered by NBIM Dashboard System</p>
        </div>
    </div>

    <script>
        // Chart configurations and data
        const yearlyData = ${JSON.stringify(this.prepareYearlyChartData(data.metrics.yearlyInvestments))};
        const technologyData = ${JSON.stringify(this.prepareTechnologyChartData(data.metrics.technologyBreakdown))};
        const geographyData = ${JSON.stringify(this.prepareGeographyChartData(data.metrics.geographyBreakdown))};
        const cashflowData = ${JSON.stringify(this.prepareCashflowChartData(data.cashflow.fullYearData))};

        // Yearly Investment Chart
        new Chart(document.getElementById('yearlyChart'), {
            type: 'bar',
            data: yearlyData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Investment by Acquisition Year' },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Investment (€M)' } }
                }
            }
        });

        // Technology Breakdown Chart
        new Chart(document.getElementById('technologyChart'), {
            type: 'doughnut',
            data: technologyData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Investment by Technology' }
                }
            }
        });

        // Geography Distribution Chart
        new Chart(document.getElementById('geographyChart'), {
            type: 'bar',
            data: geographyData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Investment by Geography' },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Investment (€M)' } }
                }
            }
        });

        // Cashflow Chart
        new Chart(document.getElementById('cashflowChart'), {
            type: 'line',
            data: cashflowData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Cash Flow Analysis (NOK Millions)' }
                },
                scales: {
                    y: { title: { display: true, text: 'Amount (NOK Millions)' } }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  generateInvestmentsTable(investments) {
    const rows = investments.map(inv => `
      <tr>
        <td>${inv.name}</td>
        <td>€${this.formatNumber(inv.acquisitionCostEur || 0)}M</td>
        <td>${inv.originalCurrency}</td>
        <td>${inv.stake || 'N/A'}%</td>
        <td>${inv.totalCapacity || 'N/A'} MW</td>
        <td>${inv.nbimCapacity ? Math.round(inv.nbimCapacity) + ' MW' : 'N/A'}</td>
        <td>${inv.acquisitionYear}</td>
        <td>${inv.acquisitionMonth || 'Unknown'}</td>
        <td>${inv.technology}</td>
        <td>${inv.geography}</td>
        <td>${inv.operator || 'Unknown'}</td>
        <td>${inv.acquisitionStatus || 'Unknown'}</td>
        <td>${inv.currentStatus}</td>
      </tr>
    `).join('');

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Investment (EUR)</th>
            <th>Original Currency</th>
            <th>Stake</th>
            <th>Total Capacity</th>
            <th>NBIM Capacity</th>
            <th>Year</th>
            <th>Month</th>
            <th>Technology</th>
            <th>Geography</th>
            <th>Operator</th>
            <th>Acquisition Status</th>
            <th>Current Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  prepareYearlyChartData(yearlyInvestments) {
    const years = Object.keys(yearlyInvestments).sort();
    return {
      labels: years,
      datasets: [{
        label: 'Investment (€M)',
        data: years.map(year => Math.round(yearlyInvestments[year])),
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        borderWidth: 1
      }]
    };
  }

  prepareTechnologyChartData(technologyBreakdown) {
    const technologies = Object.keys(technologyBreakdown);
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    
    return {
      labels: technologies,
      datasets: [{
        data: technologies.map(tech => Math.round(technologyBreakdown[tech].value)),
        backgroundColor: colors.slice(0, technologies.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  prepareGeographyChartData(geographyBreakdown) {
    const geographies = Object.keys(geographyBreakdown).sort((a, b) => 
      geographyBreakdown[b].value - geographyBreakdown[a].value
    );
    
    return {
      labels: geographies,
      datasets: [{
        label: 'Investment (€M)',
        data: geographies.map(geo => Math.round(geographyBreakdown[geo].value)),
        backgroundColor: '#764ba2',
        borderColor: '#764ba2',
        borderWidth: 1
      }]
    };
  }

  prepareCashflowChartData(cashflowData) {
    const sortedData = cashflowData.sort((a, b) => a.year - b.year);
    
    return {
      labels: sortedData.map(cf => cf.year.toString()),
      datasets: [
        {
          label: 'New Investments',
          data: sortedData.map(cf => cf.payments_new_investments || 0),
          borderColor: '#f5576c',
          backgroundColor: 'rgba(245, 87, 108, 0.1)',
          fill: false
        },
        {
          label: 'Operational Cash Flow',
          data: sortedData.map(cf => cf.cash_flow_from_ongoing_ops || 0),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: false
        },
        {
          label: 'Receipts Interest',
          data: sortedData.map(cf => cf.receipts_interest || 0),
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          fill: false
        }
      ]
    };
  }

  formatCurrency(amount) {
    return this.formatNumber(amount);
  }

  formatCurrencyWithoutUnit(amount) {
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1);
    }
    return Math.round(amount).toString();
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'B';
    }
    return Math.round(num).toString();
  }

  async saveDashboard(html) {
    await fs.mkdir(this.publicDir, { recursive: true });
    await fs.writeFile(path.join(this.publicDir, 'index.html'), html);
    console.log('💾 Dashboard saved to: public/index.html');
  }

  async saveApiData(data) {
    const apiDir = path.join(this.publicDir, 'api');
    await fs.mkdir(apiDir, { recursive: true });
    await fs.writeFile(path.join(apiDir, 'data.json'), JSON.stringify(data, null, 2));
    console.log('💾 API data saved to: public/api/data.json');
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new DashboardGenerator();
  generator.generate();
}

module.exports = DashboardGenerator;