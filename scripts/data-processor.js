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
    // Return 0 if no cost provided
    if (!cost || cost === 0) return 0;
    
    // Already in EUR, return as-is
    if (currency === 'EUR') return cost;
    
    if (currency === 'GBP') {
      const gbpToNok = exchangeRates.rates.GBP_NOK[year];
      const eurToNok = exchangeRates.rates.NOK_EUR[year]; // This is EUR/NOK rate
      
      if (!gbpToNok || !eurToNok) {
        console.warn(`Missing exchange rate for ${currency} in ${year}, using original value`);
        return cost; // Return original if no rate available
      }
      
      // Convert GBP to NOK, then NOK to EUR
      const nokValue = cost * gbpToNok;
      const eurValue = nokValue / eurToNok;
      return eurValue;
    }
    
    if (currency === 'NOK') {
      const eurToNok = exchangeRates.rates.NOK_EUR[year]; // This is EUR/NOK rate
      
      if (!eurToNok) {
        console.warn(`Missing EUR/NOK exchange rate for ${year}, using original value`);
        return cost; // Return original if no rate available
      }
      
      const eurValue = cost / eurToNok;
      return eurValue;
    }
    
    // Unknown currency, warn and return original
    console.warn(`Unknown currency: ${currency}, using original value`);
    return cost;
  }

  calculateMetrics(acquisitions, exchangeRates) {
    let totalInvestmentEur = 0;
    let totalCapacityByStake = 0;
    let totalCapacityAll = 0;
    let offshoreInvestmentEur = 0;
    let offshoreCapacityByStake = 0;
    let offshoreOperationalCapacity = 0;
    const yearlyInvestments = {};
    const technologyBreakdown = {};
    const geographyBreakdown = {};
    const statusBreakdown = { operational: 0, development: 0, construction: 0 };

    acquisitions.investments.forEach((investment, index) => {
      const costInEur = this.convertToEur(
        investment.acquisitionCost,
        investment.originalCurrency,
        investment.acquisitionYear,
        exchangeRates
      );

      totalInvestmentEur += costInEur;

      // Track total capacity (sum of all projects)
      if (investment.totalCapacity) {
        totalCapacityAll += investment.totalCapacity;
      }

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
        
        // Check if offshore wind is operational
        const status = investment.currentStatus?.toLowerCase() || 'unknown';
        if (status.includes('operational') && capacityByStake > 0) {
          offshoreOperationalCapacity += capacityByStake;
        }
      }
    });

    const avgInvestmentPerYear = totalInvestmentEur / Object.keys(yearlyInvestments).length;
    const operationalPercentage = (statusBreakdown.operational / totalInvestmentEur) * 100;
    const offshorePercentageOfTotal = totalInvestmentEur > 0 ? (offshoreInvestmentEur / totalInvestmentEur) * 100 : 0;
    const offshoreOperationalPercentage = offshoreCapacityByStake > 0 ? (offshoreOperationalCapacity / offshoreCapacityByStake) * 100 : 0;

    console.log(`\n📊 FINAL CALCULATION SUMMARY:`);
    console.log(`💰 Total Investment (EUR): €${totalInvestmentEur.toFixed(2)}M`);
    console.log(`🏗️ Total Projects: ${acquisitions.investments.length}`);
    console.log(`⚡ Total Capacity: ${totalCapacityByStake.toFixed(2)} MW`);
    console.log(`🌊 Offshore Investment: €${offshoreInvestmentEur.toFixed(2)}M`);
    console.log(`🌊 Offshore % of Total: ${offshorePercentageOfTotal.toFixed(1)}%`);
    console.log(`⚡ Offshore Operational: ${offshoreOperationalCapacity.toFixed(2)} MW (${offshoreOperationalPercentage.toFixed(1)}% of offshore capacity)`);
    console.log(`🎯 Operational %: ${operationalPercentage.toFixed(1)}%`);

    return {
      totalInvestmentEur,
      totalCapacityByStake,
      totalCapacityAll,
      offshoreInvestmentEur,
      offshoreCapacityByStake,
      offshoreOperationalCapacity,
      offshorePercentageOfTotal,
      offshoreOperationalPercentage,
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

  processCashflowData(cashflow, exchangeRates) {
    console.log('🔄 Processing cashflow data: Step 1 - Calculate 2H, Step 2 - Convert to EUR...');
    
    // Step 1: Group data by year and calculate 2H periods (in NOK)
    const yearGroups = {};
    cashflow.cashflows.forEach(cf => {
      if (!yearGroups[cf.year]) {
        yearGroups[cf.year] = {};
      }
      yearGroups[cf.year][cf.period] = cf;
    });

    const nokDataWithH2 = [];
    const fullYearData = [];
    
    // Step 1: Calculate 2H periods in NOK
    Object.entries(yearGroups).forEach(([year, periods]) => {
      console.log(`📅 Processing ${year}: Calculating 2H periods in NOK...`);
      
      // Add 1H data as-is
      if (periods['1H']) {
        nokDataWithH2.push(periods['1H']);
      }
      
      // Calculate 2H = Full Year - 1H (in NOK)
      if (periods['1H'] && periods['Full year']) {
        const h1Data = periods['1H'];
        const fullData = periods['Full year'];
        
        const h2Data = {
          year: parseInt(year),
          period: '2H',
          receipts_interest: fullData.receipts_interest - h1Data.receipts_interest,
          receipts_dividends: fullData.receipts_dividends - h1Data.receipts_dividends,
          receipts_interest_div_total: fullData.receipts_interest_div_total - h1Data.receipts_interest_div_total,
          payments_new_investments: fullData.payments_new_investments - h1Data.payments_new_investments,
          payments_development_assets: fullData.payments_development_assets - h1Data.payments_development_assets,
          receipts_from_ongoing_ops: fullData.receipts_from_ongoing_ops - h1Data.receipts_from_ongoing_ops,
          net_cf_to_from_investments: fullData.net_cf_to_from_investments - h1Data.net_cf_to_from_investments,
          net_cf_unlisted_infra: fullData.net_cf_unlisted_infra - h1Data.net_cf_unlisted_infra,
          cash_flow_from_ongoing_ops: fullData.cash_flow_from_ongoing_ops - h1Data.cash_flow_from_ongoing_ops
        };
        
        nokDataWithH2.push(h2Data);
        fullYearData.push(fullData);
        
        console.log(`  ✅ ${year}: Added 1H, calculated 2H, kept Full Year`);
      } else if (periods['1H']) {
        console.log(`  ⚠️ ${year}: Only 1H data available, no Full Year for 2H calculation`);
      }
    });
    
    // Step 2: Convert all data from NOK to EUR
    console.log('💱 Step 2: Converting all cashflow data from NOK to EUR...');
    
    const convertToEur = (amount, year) => {
      if (!amount || amount === 0) return 0;
      const nokToEur = exchangeRates.rates.NOK_EUR[year];
      if (!nokToEur) {
        console.warn(`⚠️ Missing exchange rate for ${year}`);
        return amount; // Return NOK value if no rate available
      }
      return Math.round(amount / nokToEur * 100) / 100; // Round to 2 decimal places
    };
    
    // Convert all 1H and 2H data to EUR
    const eurData = nokDataWithH2.map(cf => {
      const nokToEur = exchangeRates.rates.NOK_EUR[cf.year];
      return {
        year: cf.year,
        period: cf.period,
        currency: 'EUR',
        originalCurrency: 'NOK',
        exchangeRate: nokToEur,
        receipts_interest: convertToEur(cf.receipts_interest, cf.year),
        receipts_dividends: convertToEur(cf.receipts_dividends, cf.year),
        receipts_interest_div_total: convertToEur(cf.receipts_interest_div_total, cf.year),
        payments_new_investments: convertToEur(cf.payments_new_investments, cf.year),
        payments_development_assets: convertToEur(cf.payments_development_assets, cf.year),
        receipts_from_ongoing_ops: convertToEur(cf.receipts_from_ongoing_ops, cf.year),
        net_cf_to_from_investments: convertToEur(cf.net_cf_to_from_investments, cf.year),
        net_cf_unlisted_infra: convertToEur(cf.net_cf_unlisted_infra, cf.year),
        cash_flow_from_ongoing_ops: convertToEur(cf.cash_flow_from_ongoing_ops, cf.year)
      };
    });
    
    // Convert full year data to EUR for charts
    const eurFullYearData = fullYearData.map(cf => {
      const nokToEur = exchangeRates.rates.NOK_EUR[cf.year];
      return {
        year: cf.year,
        period: 'Full year',
        currency: 'EUR',
        originalCurrency: 'NOK',
        exchangeRate: nokToEur,
        receipts_interest: convertToEur(cf.receipts_interest, cf.year),
        receipts_dividends: convertToEur(cf.receipts_dividends, cf.year),
        receipts_interest_div_total: convertToEur(cf.receipts_interest_div_total, cf.year),
        payments_new_investments: convertToEur(cf.payments_new_investments, cf.year),
        payments_development_assets: convertToEur(cf.payments_development_assets, cf.year),
        receipts_from_ongoing_ops: convertToEur(cf.receipts_from_ongoing_ops, cf.year),
        net_cf_to_from_investments: convertToEur(cf.net_cf_to_from_investments, cf.year),
        net_cf_unlisted_infra: convertToEur(cf.net_cf_unlisted_infra, cf.year),
        cash_flow_from_ongoing_ops: convertToEur(cf.cash_flow_from_ongoing_ops, cf.year)
      };
    });
    
    console.log(`📊 Cashflow processing complete:`);
    console.log(`   💰 ${eurData.length} periods (1H + 2H) converted to EUR`);
    console.log(`   📈 ${eurFullYearData.length} full year periods for charts`);
    
    return {
      fullYearData: eurFullYearData, // For charts (Full Year data in EUR)
      allData: eurData // All 1H and 2H periods in EUR
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