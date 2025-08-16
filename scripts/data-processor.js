const fs = require('fs').promises;
const path = require('path');

class DataProcessor {
  constructor() {
    this.jsonDir = path.join(__dirname, '../data/json');
  }

  async loadData() {
    try {
      const [acquisitions, cashflow, exchangeRates] = await Promise.all([
        this.loadJSON('acquisitions.json'),
        this.loadJSON('cashflow.json'),
        this.loadJSON('exchange-rates.json')
      ]);

      return { acquisitions, cashflow, exchangeRates };
    } catch (error) {
      console.error('Error loading JSON data:', error);
      throw error;
    }
  }

  async loadJSON(filename) {
    const filePath = path.join(this.jsonDir, filename);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error.message);
      throw new Error(`Failed to load ${filename}. Make sure Excel files have been converted to JSON first.`);
    }
  }

  convertToEur(cost, currency, year, exchangeRates) {
    if (!cost || currency === 'EUR') return cost || 0;
    
    if (currency === 'GBP') {
      const gbpToNok = exchangeRates.rates.GBP_NOK[year];
      const eurToNok = exchangeRates.rates.NOK_EUR[year]; // This is EUR/NOK rate
      
      if (!gbpToNok || !eurToNok) {
        console.warn(`Missing exchange rate for ${currency} in ${year}, using original value`);
        return cost;
      }
      
      // Convert GBP to NOK, then NOK to EUR
      const nokValue = cost * gbpToNok;
      return nokValue / eurToNok; // Divide by EUR/NOK to get EUR
    }
    
    if (currency === 'NOK') {
      const eurToNok = exchangeRates.rates.NOK_EUR[year]; // This is EUR/NOK rate
      
      if (!eurToNok) {
        console.warn(`Missing EUR/NOK exchange rate for ${year}, using original value`);
        return cost;
      }
      
      return cost / eurToNok; // Divide NOK by EUR/NOK rate to get EUR
    }
    
    return cost;
  }

  calculateMetrics(acquisitions, exchangeRates) {
    let totalInvestmentEur = 0;
    let totalCapacityByStake = 0;
    let offshoreInvestmentEur = 0;
    let offshoreCapacityByStake = 0;
    const yearlyInvestments = {};
    const technologyBreakdown = {};
    const geographyBreakdown = {};
    const statusBreakdown = { operational: 0, development: 0, construction: 0 };

    acquisitions.investments.forEach(investment => {
      const costInEur = this.convertToEur(
        investment.acquisitionCost,
        investment.originalCurrency,
        investment.acquisitionYear,
        exchangeRates
      );

      totalInvestmentEur += costInEur;

      // Track yearly investments
      if (!yearlyInvestments[investment.acquisitionYear]) {
        yearlyInvestments[investment.acquisitionYear] = 0;
      }
      yearlyInvestments[investment.acquisitionYear] += costInEur;

      // Track technology breakdown
      const tech = investment.technology || 'Unknown';
      if (!technologyBreakdown[tech]) {
        technologyBreakdown[tech] = { value: 0, count: 0, capacity: 0 };
      }
      technologyBreakdown[tech].value += costInEur;
      technologyBreakdown[tech].count += 1;

      // Track geography breakdown
      const geo = investment.geography || 'Unknown';
      if (!geographyBreakdown[geo]) {
        geographyBreakdown[geo] = { value: 0, count: 0 };
      }
      geographyBreakdown[geo].value += costInEur;
      geographyBreakdown[geo].count += 1;

      // Track status breakdown
      const status = investment.currentStatus?.toLowerCase() || 'unknown';
      if (status.includes('operational')) {
        statusBreakdown.operational += costInEur;
      } else if (status.includes('development')) {
        statusBreakdown.development += costInEur;
      } else if (status.includes('construction')) {
        statusBreakdown.construction += costInEur;
      }

      // Calculate capacity by stake - use direct value if available, otherwise calculate
      let capacityByStake = 0;
      if (investment.capacityByStake) {
        // Use the direct "Capacity by NBIM stake" column value
        capacityByStake = investment.capacityByStake;
      } else if (investment.stake && investment.totalCapacity) {
        // Calculate if not provided directly
        capacityByStake = (investment.totalCapacity * investment.stake) / 100;
      }
      
      if (capacityByStake > 0) {
        totalCapacityByStake += capacityByStake;
        technologyBreakdown[tech].capacity += capacityByStake;

        if (tech.toLowerCase().includes('offshore wind')) {
          offshoreCapacityByStake += capacityByStake;
        }
      }

      // Offshore wind specific calculations
      if (tech.toLowerCase().includes('offshore wind')) {
        offshoreInvestmentEur += costInEur;
      }
    });

    const avgInvestmentPerYear = totalInvestmentEur / Object.keys(yearlyInvestments).length;
    const operationalPercentage = (statusBreakdown.operational / totalInvestmentEur) * 100;

    return {
      totalInvestmentEur,
      totalCapacityByStake,
      offshoreInvestmentEur,
      offshoreCapacityByStake,
      avgInvestmentPerYear,
      yearlyInvestments,
      technologyBreakdown,
      geographyBreakdown,
      statusBreakdown,
      operationalPercentage,
      totalProjects: acquisitions.investments.length
    };
  }

  processInvestmentsForTable(acquisitions, exchangeRates) {
    return acquisitions.investments.map(investment => {
      const costInEur = this.convertToEur(
        investment.acquisitionCost,
        investment.originalCurrency,
        investment.acquisitionYear,
        exchangeRates
      );

      // Use direct capacity by stake if available, otherwise calculate
      const nbimCapacity = investment.capacityByStake || 
        (investment.stake && investment.totalCapacity ? (investment.totalCapacity * investment.stake) / 100 : null);

      return {
        ...investment,
        acquisitionCostEur: costInEur,
        nbimCapacity
      };
    });
  }

  processCashflowData(cashflow) {
    // Filter for full year data only for charts
    const fullYearData = cashflow.cashflows.filter(cf => 
      cf.period && cf.period.toLowerCase().includes('full')
    );
    
    return {
      fullYearData,
      allData: cashflow.cashflows
    };
  }

  async saveProcessedData(data) {
    const outputPath = path.join(__dirname, '../public/api/data.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log('💾 Processed data saved to:', outputPath);
  }
}

module.exports = DataProcessor;