const fs = require('fs').promises;
const path = require('path');

class DataValidator {
  constructor() {
    this.jsonDir = path.join(__dirname, '../data/json');
    this.errors = [];
    this.warnings = [];
  }

  async validateAll() {
    console.log('🔍 Starting data validation...');
    
    try {
      // ⚡ Bolt: Execute validations in parallel to improve performance
      // Each validation is independent and I/O bound
      await Promise.all([
        this.validateAcquisitions(),
        this.validateCashflow(),
        this.validateExchangeRates()
      ]);
      
      this.printResults();
      
      if (this.errors.length > 0) {
        throw new Error(`Validation failed with ${this.errors.length} errors`);
      }
      
      console.log('✅ All data validation passed!');
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  async validateAcquisitions() {
    console.log('📊 Validating acquisitions data...');
    
    try {
      const data = await this.loadJSON('acquisitions.json');
      
      if (!data.investments || !Array.isArray(data.investments)) {
        this.errors.push('Acquisitions: investments array is missing or invalid');
        return;
      }

      if (data.investments.length === 0) {
        this.errors.push('Acquisitions: No investments found');
        return;
      }

      data.investments.forEach((investment, index) => {
        const prefix = `Acquisitions[${index}]`;
        
        if (!investment.name) {
          this.errors.push(`${prefix}: Missing project name`);
        }
        
        if (!investment.acquisitionCost || investment.acquisitionCost <= 0) {
          this.warnings.push(`${prefix}: Invalid or missing acquisition cost`);
        }
        
        if (!investment.originalCurrency) {
          this.warnings.push(`${prefix}: Missing currency information`);
        }
        
        if (!investment.acquisitionYear || investment.acquisitionYear < 2000 || investment.acquisitionYear > new Date().getFullYear() + 5) {
          this.warnings.push(`${prefix}: Invalid acquisition year`);
        }
        
        if (investment.stake && (investment.stake < 0 || investment.stake > 100)) {
          this.warnings.push(`${prefix}: Invalid stake percentage`);
        }
      });

      console.log(`✅ Acquisitions: ${data.investments.length} investments validated`);
      
    } catch (error) {
      this.errors.push(`Acquisitions validation error: ${error.message}`);
    }
  }

  async validateCashflow() {
    console.log('💰 Validating cashflow data...');
    
    try {
      const data = await this.loadJSON('cashflow.json');
      
      if (!data.cashflows || !Array.isArray(data.cashflows)) {
        this.errors.push('Cashflow: cashflows array is missing or invalid');
        return;
      }

      if (data.cashflows.length === 0) {
        this.warnings.push('Cashflow: No cashflow data found');
        return;
      }

      const years = new Set();
      data.cashflows.forEach((cf, index) => {
        const prefix = `Cashflow[${index}]`;
        
        if (!cf.year || cf.year < 2000 || cf.year > new Date().getFullYear() + 5) {
          this.warnings.push(`${prefix}: Invalid year`);
        }
        
        years.add(cf.year);
        
        if (!cf.period) {
          this.warnings.push(`${prefix}: Missing period information`);
        }
      });

      console.log(`✅ Cashflow: ${data.cashflows.length} entries validated across ${years.size} years`);
      
    } catch (error) {
      this.errors.push(`Cashflow validation error: ${error.message}`);
    }
  }

  async validateExchangeRates() {
    console.log('💱 Validating exchange rates data...');
    
    try {
      const data = await this.loadJSON('exchange-rates.json');
      
      if (!data.rates) {
        this.errors.push('Exchange rates: rates object is missing');
        return;
      }

      const nokEurYears = Object.keys(data.rates.NOK_EUR || {});
      const gbpNokYears = Object.keys(data.rates.GBP_NOK || {});

      if (nokEurYears.length === 0) {
        this.warnings.push('Exchange rates: No NOK/EUR rates found');
      }

      if (gbpNokYears.length === 0) {
        this.warnings.push('Exchange rates: No GBP/NOK rates found');
      }

      // Validate rate values
      [...nokEurYears, ...gbpNokYears].forEach(year => {
        if (data.rates.NOK_EUR[year] && (data.rates.NOK_EUR[year] <= 0 || data.rates.NOK_EUR[year] > 50)) {
          this.warnings.push(`Exchange rates: Suspicious NOK/EUR rate for ${year}: ${data.rates.NOK_EUR[year]}`);
        }
        
        if (data.rates.GBP_NOK[year] && (data.rates.GBP_NOK[year] <= 0 || data.rates.GBP_NOK[year] > 50)) {
          this.warnings.push(`Exchange rates: Suspicious GBP/NOK rate for ${year}: ${data.rates.GBP_NOK[year]}`);
        }
      });

      console.log(`✅ Exchange rates: ${nokEurYears.length} NOK/EUR and ${gbpNokYears.length} GBP/NOK rates validated`);
      
    } catch (error) {
      this.errors.push(`Exchange rates validation error: ${error.message}`);
    }
  }

  async loadJSON(filename) {
    const filePath = path.join(this.jsonDir, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new DataValidator();
  validator.validateAll();
}

module.exports = DataValidator;