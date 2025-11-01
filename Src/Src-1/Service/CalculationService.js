export const calculationService = {
  parseValue: (value) => {
    if (!value || value === 'null') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  },

  calculateGrossAmount: (row) => {
    const netWt = calculationService.parseValue(row.NETWT);
    const wastage = calculationService.parseValue(row.Wastage);
    const rate = calculationService.parseValue(row.Rate);
    const mc = calculationService.parseValue(row.MC);
    const stoneAmt = calculationService.parseValue(row.StoneAmount);
    const miscAmt = calculationService.parseValue(row.MiscAmount);
    return (netWt + wastage) * rate + mc + stoneAmt + miscAmt;
  },

  calculateGST: (row) => {
    const gross = calculationService.calculateGrossAmount(row);
    let gstPer = parseFloat(row.GSTPer);
    if (isNaN(gstPer)) gstPer = 0;
    return (gross * gstPer) / 100;
  },

  calculateGrandTotal: (row) => {
    return calculationService.calculateGrossAmount(row) + calculationService.calculateGST(row);
  },

  calculateTotals: (tableData) => {
    const sum = (key) => tableData.reduce((acc, curr) => acc + calculationService.parseValue(curr[key]), 0);
    const totalGross = tableData.reduce((acc, row) => acc + calculationService.calculateGrossAmount(row), 0);
    const totalGST = tableData.reduce((acc, row) => acc + calculationService.calculateGST(row), 0);
    const totalGrand = tableData.reduce((acc, row) => acc + calculationService.calculateGrandTotal(row), 0);

    return {
      pcs: sum('PCS'),
      grswt: sum('GRSWT').toFixed(2),
      netwt: sum('NETWT').toFixed(2),
      rate: sum('Rate').toFixed(2),
      wastage: sum('Wastage').toFixed(2),
      mc: sum('MC').toFixed(2),
      stoneAmount: sum('StoneAmount').toFixed(2),
      miscAmount: sum('MiscAmount').toFixed(2),
      gross: totalGross.toFixed(2),
      gst: totalGST.toFixed(2),
      grandTotal: totalGrand.toFixed(2)
    };
  }
};