const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');

class ExcelToJsonConverter {
  constructor() {
    this.excelDir = path.join(__dirname, '../data/excel');
    this.jsonDir = path.join(__dirname, '../data/json');
  }

  async convertAcquisitions() {
    console.log('📊 Converting NBIM_Acquisitions.xlsx...');
    
    try {
      const fileBuffer = await fs.readFile(path.join(this.excelDir, 'NBIM_Acquisitions.xlsx'));
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new Error('No data found in acquisitions Excel file');
      }


      const acquisitions = {
        lastUpdated: new Date().toISOString(),
        metadata: {
          totalProjects: data.length,
          dataSource: "NBIM Investment Records - Excel Import",
          currency: "Mixed (EUR/GBP converted to EUR)",
          excelFile: "NBIM_Acquisitions.xlsx"
        },
        investments: data.map((row, index) => {
          // Handle different possible column names - updated for new Excel structure
          const projectName = row['Project Name'] || row['Project'] || row['Name'] || `Project ${index + 1}`;
          
          
          const cost = this.parseNumber(
            row['Acquisition Cost\n(million)'] || 
            row['Acquisition Cost\r\n(million)'] ||
            row['Acquisition Cost (million)'] || 
            row['Acquisition Cost'] || 
            row['Cost'] || 
            row['Investment']
          );
          const currency = row['Currency'] || row['Curr'] || 'EUR';
          const stake = this.parseStakePercentage(row['Stake %'] || row['Stake'] || row['Ownership']);
          const capacity = this.parseNumber(row['Total Capacity (MW)'] || row['Total Capacity MW'] || row['Capacity'] || row['MW']);
          const capacityByStake = this.parseNumber(row['Capacity by NBIM stake'] || row['NBIM Capacity'] || row['Stake Capacity']);
          const year = parseInt(row['Acquisition Year'] || row['Year'] || new Date().getFullYear());
          
          return {
            id: this.generateId(projectName),
            name: projectName,
            acquisitionCost: cost,
            originalCurrency: currency,
            stake: stake,
            totalCapacity: capacity,
            capacityByStake: capacityByStake,
            acquisitionYear: year,
            acquisitionMonth: row['Acquisition Month'] || row['Month'] || 'Unknown',
            acquisitionStatus: row['Acquisition Status'] || row['Acq Status'] || 'Unknown',
            currentStatus: row['Current Status'] || row['Status'] || 'Unknown',
            technology: row['Technology'] || row['Tech'] || 'Unknown',
            geography: row['Geography'] || row['Country'] || row['Location'] || 'Unknown',
            operator: row['Operator'] || row['Developer'] || 'Unknown'
          };
        })
      };

      await this.saveJson('acquisitions.json', acquisitions);
      console.log(`✅ Converted ${data.length} investments from Excel`);
      return acquisitions;

    } catch (error) {
      console.error('❌ Error converting acquisitions:', error.message);
      throw error;
    }
  }

  async convertCashflow() {
    console.log('💰 Converting NBIM_Cashflow.xlsx...');
    
    try {
      const fileBuffer = await fs.readFile(path.join(this.excelDir, 'NBIM_Cashflow.xlsx'));
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new Error('No data found in cashflow Excel file');
      }

      const cashflow = {
        lastUpdated: new Date().toISOString(),
        metadata: {
          source: "NBIM Unlisted Infrastructure Reports - Excel Import",
          currency: "NOK millions",
          description: "Cash flow data for unlisted renewable infrastructure investments",
          excelFile: "NBIM_Cashflow.xlsx"
        },
        cashflows: data.map(row => ({
          year: parseInt(row['Year'] || new Date().getFullYear()),
          period: row['Period'] || row['Half'] || 'Full year',
          receipts_interest: this.parseNumber(row['Receipts_Interest'] || row['Receipts Interest'] || row['Interest'] || 0),
          receipts_dividends: this.parseNumber(row['Receipts_Dividends'] || row['Receipts Dividends'] || row['Dividends'] || 0),
          receipts_interest_div_total: this.parseNumber(row['Receipts Total'] || row['Total Receipts'] || 0),
          payments_new_investments: this.parseNumber(row['New_Investments'] || row['New Investments'] || row['Payments New'] || 0),
          payments_development_assets: this.parseNumber(row['Development_Assets'] || row['Development Assets'] || row['Development'] || 0),
          receipts_from_ongoing_ops: this.parseNumber(row['Repayments_loan'] || row['Loan Repayment'] || row['Ongoing Operations'] || row['Operations'] || 0),
          net_cf_to_from_investments: this.parseNumber(row['Net_Investment CF'] || row['Net Investment CF'] || row['Net Investments'] || 0),
          net_cf_unlisted_infra: this.parseNumber(row['Net_CF'] || row['Net Unlisted CF'] || row['Net CF'] || 0),
          cash_flow_from_ongoing_ops: this.parseNumber(row['CF_Ongoing_Ops'] || row['Operational CF'] || row['Operations CF'] || 0)
        }))
      };

      await this.saveJson('cashflow.json', cashflow);
      console.log(`✅ Converted ${data.length} cashflow entries from Excel`);
      return cashflow;

    } catch (error) {
      console.error('❌ Error converting cashflow:', error.message);
      throw error;
    }
  }

  async convertExchangeRates() {
    console.log('💱 Converting NBIM_ExchangeRates.xlsx...');
    
    try {
      const fileBuffer = await fs.readFile(path.join(this.excelDir, 'NBIM_ExchangeRates.xlsx'));
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new Error('No data found in exchange rates Excel file');
      }

      const rates = {
        lastUpdated: new Date().toISOString(),
        metadata: {
          source: "NBIM Financial Statements - Excel Import",
          baseCurrency: "NOK",
          description: "Exchange rate assumptions used for portfolio calculations",
          excelFile: "NBIM_ExchangeRates.xlsx"
        },
        rates: {
          NOK_EUR: {},
          GBP_NOK: {}
        },
        notes: {
          NOK_EUR: "Euro per Norwegian Kroner (EUR/NOK rate)",
          GBP_NOK: "British Pounds to Norwegian Kroner"
        }
      };

      data.forEach(row => {
        const year = (row['Year'] || '').toString();
        if (year) {
          rates.rates.NOK_EUR[year] = this.parseNumber(row['EUR/NOK'] || row['NOK per EUR'] || row['NOK/EUR']) || null;
          rates.rates.GBP_NOK[year] = this.parseNumber(row['GBP/NOK'] || row['GBP to NOK']) || null;
        }
      });

      await this.saveJson('exchange-rates.json', rates);
      console.log(`✅ Converted ${data.length} exchange rate years from Excel`);
      return rates;

    } catch (error) {
      console.error('❌ Error converting exchange rates:', error.message);
      throw error;
    }
  }

  parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    // Handle numbers with commas, spaces, and other formatting
    const cleanValue = value.toString().replace(/[,%\s"]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? null : num;
  }

  parseStakePercentage(value) {
    if (value === null || value === undefined || value === '') return null;
    // Handle percentage values like "50%" or "16.60%"
    const cleanValue = value.toString().replace(/[,%\s]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? null : num;
  }

  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  async saveJson(filename, data) {
    await fs.mkdir(this.jsonDir, { recursive: true });
    const filepath = path.join(this.jsonDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved: ${filename}`);
  }

  async convertAll() {
    try {
      console.log('🔄 Starting Excel to JSON conversion...');
      
      await Promise.all([
        this.convertAcquisitions(),
        this.convertCashflow(),
        this.convertExchangeRates()
      ]);
      
      console.log('🎉 All Excel files converted successfully!');
      console.log('📁 JSON files saved to: data/json/');
      
    } catch (error) {
      console.error('❌ Error during conversion:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const converter = new ExcelToJsonConverter();
  converter.convertAll();
}

module.exports = ExcelToJsonConverter;