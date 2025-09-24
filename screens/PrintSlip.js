import axios from 'axios';
import { Alert } from 'react-native';
import * as Print from 'expo-print';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString('en-GB');
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const mergeItems = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = `${item.itemid}-${item.tagno}`;
    if (!map.has(key)) {
      map.set(key, { ...item, taxes: [...(item.taxes || [])] });
    } else {
      const existing = map.get(key);
      existing.pcs += item.pcs || 0;
      existing.netwt += item.netwt || 0;
      existing.grswt += item.grswt || 0;
      existing.amount += item.amount || 0;
      (item.taxes || []).forEach((tax) => {
        const idx = existing.taxes.findIndex((t) => t.tax_id === tax.tax_id);
        if (idx >= 0) existing.taxes[idx].tax_amount += tax.tax_amount || 0;
        else existing.taxes.push({ ...tax });
      });
    }
  });
  return Array.from(map.values());
};

export const PrintSlip = async (estBatchNo, username) => {
  if (!estBatchNo) {
    Alert.alert('Error', 'No Estimation No found for printing.');
    return;
  }

  const api = axios.create({ baseURL: 'https://est.bmgjewellers.com/api/v1' });

  try {
    const response = await api.get(`/printDetails/${estBatchNo}`);
    const itemsRaw = Array.isArray(response.data) ? response.data : [];
    if (!itemsRaw.length) {
      Alert.alert('Error', 'No data found for this Estimation.');
      return;
    }

    const items = mergeItems(itemsRaw);
    const sample = items[0];

    // Fetch offer via POST
    let offer = { discount: 0, netwt: 0, board_rate: 0 };
    try {
      const offerRes = await api.post('/offer', null, { params: { tagno: sample.tagno } });
      offer = offerRes.data || offer;
    } catch (err) {
      console.warn('Failed to fetch offer:', err);
    }

    // Fetch today rates
    let goldRate = 0, silverRate = 0;
    try {
      const rateRes = await api.get('/todayrate');
      goldRate = rateRes.data?.GOLDRATE || 0;
      silverRate = rateRes.data?.SILVERRATE || 0;
    } catch {
      goldRate = sample.goldrate || 0;
      silverRate = sample.silverrate || 0;
    }

    const totalpcs = items.reduce((sum, i) => sum + (i.pcs || 0), 0);
    const totalGrossWeight = items.reduce((sum, i) => sum + (i.grswt || 0), 0);
    const baseAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);

    let cgstAmount = 0;
    let sgstAmount = 0;
    items.forEach((item) => {
      (item.taxes || []).forEach((tax) => {
        const taxId = (tax.tax_id || '').toUpperCase();
        if (taxId === 'CG') cgstAmount += tax.tax_amount || 0;
        else if (taxId === 'SG') sgstAmount += tax.tax_amount || 0;
      });
    });

    const grandTotal = baseAmount + cgstAmount + sgstAmount;

    const fetchStonesForItem = async (itemid, tagno) => {
      try {
        const res = await api.get('/stnInputs', { params: { itemid, tagno } });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn(`Failed to fetch stones for ITEMID=${itemid} TAGNO=${tagno}`, err);
        return [];
      }
    };

    // Build item rows
    const itemRowsArr = await Promise.all(items.map(async (item, idx) => {
      const itemName = (item.itemname || '').toUpperCase();
      const itemNumber = idx + 1;
      const stones = await fetchStonesForItem(item.itemid, item.tagno);
      // console.log(`Fetched stones for ITEMID=${item.amount} TAGNO=${item.tagno}:`, stones);
      const rows = [];

      // Main item row
      rows.push(`
        <tr>
          <td colspan="4"><b>${itemNumber} ${itemName} (${item.pcs} Pcs) [${item.itemid}-${item.tagno}]</b></td>
        </tr>
        <tr>
  <td width="40%">Rate</td>
  <td width="20%" align="right">${(item.grswt || 0).toFixed(3)}</td>
  <td width="20%" align="right">${item.wastper && item.wastper > 0 ? item.wastper.toFixed(1) : ''}</td>
  <td width="20%" align="right">${(item.amount || 0).toFixed(0)}</td>
</tr>

      `);

      // Net weight row if different
      if (item.grswt !== item.netwt) {
        rows.push(`
          <tr>
            <td colspan="4"><b>Netwt:</b> ${(item.netwt || 0).toFixed(3)}</td>
          </tr>
        `);
      }

      // Stones
      stones.forEach(stone => {
        rows.push(`
          <tr>
            <td>STUDDED</td>
            <td align="right">${stone.stnwt?.toFixed(3) || 0}${stone.stoneunit || ''}</td>
            <td align="right"></td>
            <td align="right">${stone.stnamt?.toFixed(0) || 0}</td>
          </tr>
        `);
      });

      // MC row if exists
      if (item.mcgrm) {
        rows.push(`
          <tr>
            <td>MC:</td>
            <td align="right"></td>
            <td align="right"></td>
            <td align="right">${item.mcgrm?.toFixed(0)}</td>
          </tr>
        `);
      }

      // Subitem names
      stones.forEach(stone => {
        rows.push(`
          <tr>
            <td colspan="4">${item.subitemname?.toUpperCase() || ''}</td>
          </tr>
        `);
      });

      return rows.join('');
    }));

    const itemRows = itemRowsArr.join('');

    const offerWeight = offer.netwt || 0;
    const offerBoardRate = offer.board_rate || 0;
    const offerDiscount = offerWeight * offerBoardRate;
    const final_amount = baseAmount - offerDiscount;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-size:12px; line-height:1.3; margin:5mm; font-family: 'Times New Roman', serif; }
table { width:100%; border-collapse: collapse; }
td { padding:2px 1px; vertical-align: top; }
.totals-table td { padding:1px 2px; }
.right-align { text-align:right; }
.divider { border-bottom:1px dashed #000; margin:3px 0; }
b { font-weight:bold; }
</style>
</head>
<body>
<div>
<table>
  <tr><td><b>NAME</b>   : __________________________________</td></tr>
  <tr><td><b>MOBILE</b> : _________________________________</td></tr>
</table>

<div class="divider"></div>

<table>
  <tr>
    <td><b>ESTIMATION SLIP</b></td>
    <td align="right"><b>Est.No :</b> ${sample.tranno || ''} - ${sample.company_id || 'BMG'}</td>
  </tr>
  <tr>
    <td><b>Date :</b> ${formatDate(sample.trandate)}</td>
    <td align="right"><b>Gold :</b> ${goldRate.toFixed(0)}/Gm</td>
  </tr>
  <tr>
    <td><b>Time :</b> ${getCurrentTime()}</td>
    <td align="right"><b>Silver :</b> ${silverRate.toFixed(2)}/Gm</td>
  </tr>
</table>

<div class="divider"></div>

<table>
  <tr>
    <td width="40%"><b>Description</b></td>
    <td width="20%" align="right"><b>Weight</b></td>
    <td width="20%" align="right"><b>V.A</b></td>
    <td width="20%" align="right"><b>Amount</b></td>
  </tr>
</table>

<div class="divider"></div>

<table>
  ${itemRows}
</table>

<div class="divider"></div>

<table class="totals-table">
<tr>
  <td width="40%" ><b>Tot.Pcs : ${totalpcs}</b></td>
  <td width="20%" align="right">${totalGrossWeight.toFixed(3)}</td>
  <td width="20%"></td>
  <td width="20%" align="right">${baseAmount.toFixed(0)}</td>
</tr>

 

  ${offerDiscount > 0 ? `
  <tr>
    <td colspan="3"><b>Offer (${offerWeight.toFixed(3)} * ${offerBoardRate})</b></td>
    <td align="right">${offerDiscount.toFixed(1)}</td>
  </tr>` : ''}

 
  <tr>
    <td align="center" colspan="3"><b>CGST (1.5%)</b></td>
    <td align="right">${cgstAmount.toFixed(0)}</td>
  </tr>
  <tr>
    <td align="center" colspan="3"><b>SGST (1.5%)</b></td>
    <td align="right">${sgstAmount.toFixed(0)}</td>
  </tr>
  <tr><td colspan="4" class="divider"></td></tr>
  <tr>
    <td><b>Sales</b></td>
    <td align="right"><b>TOTAL :</b></td>
    <td align="right"></td>
    <td align="right"><b>${grandTotal.toFixed(0)}</b></td>
  </tr>
</table>

<div class="divider"></div>

<table>
  <tr>
    <td><b>[${username || ''}]</b></td>
    <td align="right"><b>Est.No : ${sample.tranno || ''}</b></td>
  </tr>
</table>

</div>
</body>
</html>
    `;

    await Print.printAsync({ html: htmlContent });

  } catch (error) {
    console.error('Print error:', error);
    Alert.alert('Error', 'Failed to fetch or print slip.');
  }
};
