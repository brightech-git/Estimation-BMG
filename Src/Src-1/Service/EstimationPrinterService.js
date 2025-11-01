import TcpSocket from "react-native-tcp-socket";
import { Alert } from "react-native";
import axios from "axios";
import { FONTS, PRINTER_COMMANDS } from "../Utills/Themedata";
import { usePrinterService } from "../Service/IpServices"; // Import the printer service

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("en-GB");
};

export const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const mergeItems = (items) => {
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

// Helper function to format text with styling
const formatStyledLine = (
  leftText,
  rightText,
  style = FONTS.NORMAL,
  totalWidth = 40
) => {
  const left = leftText || "";
  const right = rightText || "";

  let line = style + left;

  if (right) {
    const spacesNeeded = totalWidth - left.length - right.length;
    const spaces = spacesNeeded > 0 ? " ".repeat(spacesNeeded) : " ";
    line += spaces + right;
  }

  return line + FONTS.NORMAL + "\n";
};

// Fetch estimation data
export const fetchEstimationData = async (estBatchNo, username, apiBaseUrl) => {
  console.log('🔍 fetchEstimationData called with:', { estBatchNo, apiBaseUrl });
  
  if (!estBatchNo) {
    Alert.alert("Error", "No Estimation No found for printing.");
    return null;
  }

  if (!apiBaseUrl) {
    Alert.alert("Error", "No API base URL configured.");
    return null;
  }

  try {
    const api = axios.create({ 
      baseURL: apiBaseUrl,
      timeout: 30000, // 30 second timeout
    });

    console.log('📡 Making API call to:', `${apiBaseUrl}/printDetails/${estBatchNo}`);
    
    const response = await api.get(`/printDetails/${estBatchNo}`);
    console.log('✅ API Response received:', response.status);
    
    const itemsRaw = Array.isArray(response.data) ? response.data : [];
    console.log('📊 Items raw data length:', itemsRaw.length);
    
    if (!itemsRaw.length) {
      Alert.alert("Error", "No data found for this Estimation.");
      return null;
    }

    const items = mergeItems(itemsRaw);
    const sample = items[0];
    console.log('📋 Sample item:', sample);

    // Fetch offer via POST
    let offer = { discount: 0, netwt: 0, board_rate: 0 };
    try {
      console.log('📡 Fetching offer data...');
      const offerRes = await api.post("/offer", null, {
        params: { tagno: sample.tagno },
      });
      offer = offerRes.data || offer;
      console.log('✅ Offer data:', offer);
    } catch (err) {
      console.warn("Failed to fetch offer:", err);
    }

    // Fetch today rates
    let goldRate = 0, silverRate = 0;
    try {
      console.log('📡 Fetching today rates...');
      const rateRes = await api.get("/todayrate");
      goldRate = rateRes.data?.GOLDRATE || 0;
      silverRate = rateRes.data?.SILVERRATE || 0;
      console.log('✅ Rates - Gold:', goldRate, 'Silver:', silverRate);
    } catch (rateError) {
      console.warn("Failed to fetch rates, using sample rates:", rateError);
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
        const taxId = (tax.tax_id || "").toUpperCase();
        if (taxId === "CG") cgstAmount += tax.tax_amount || 0;
        else if (taxId === "SG") sgstAmount += tax.tax_amount || 0;
      });
    });

    const grandTotal = baseAmount + cgstAmount + sgstAmount;

    console.log('💰 Totals:', { totalpcs, totalGrossWeight, baseAmount, cgstAmount, sgstAmount, grandTotal });

    // Fetch stones for each item
    const fetchStonesForItem = async (itemid, tagno) => {
      try {
        console.log(`📡 Fetching stones for ITEMID=${itemid} TAGNO=${tagno}`);
        const res = await api.get("/stnInputs", { 
          params: { itemid, tagno },
          timeout: 15000 
        });
        const stones = Array.isArray(res.data) ? res.data : [];
        console.log(`✅ Found ${stones.length} stones for item`);
        return stones;
      } catch (err) {
        console.warn(`Failed to fetch stones for ITEMID=${itemid} TAGNO=${tagno}`, err);
        return [];
      }
    };

    // Build items with stones
    console.log('🔄 Building items with stones...');
    const itemsWithStones = await Promise.all(
      items.map(async (item) => {
        const stones = await fetchStonesForItem(item.itemid, item.tagno);
        return { ...item, stones };
      })
    );

    const result = {
      items,
      sample,
      goldRate,
      silverRate,
      totalpcs,
      totalGrossWeight,
      baseAmount,
      cgstAmount,
      sgstAmount,
      grandTotal,
      offer,
      itemsWithStones,
    };

    console.log('✅ Successfully built slip data');
    return result;

  } catch (error) {
    console.error("❌ Fetch error details:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    let errorMessage = "Failed to fetch estimation data.";
    
    if (error.code === 'NETWORK_ERROR') {
      errorMessage = "Network error: Please check your internet connection and try again.";
    } else if (error.response) {
      // Server responded with error status
      errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from server. Please try again.";
    }
    
    Alert.alert("Error", errorMessage);
    return null;
  }
};

// Function to get active printer from API
const getActivePrinter = async () => {
  try {
    console.log('🖨️ Fetching active printer from API...');
    const printerService = usePrinterService();
    const printers = await printerService.getAllPrinters();
    
    // Find the active printer
    const activePrinter = printers?.find(printer => printer.active === true);
    
    if (!activePrinter) {
      throw new Error("No active printer found. Please set a current printer in Printer Settings.");
    }
    
    console.log('✅ Active printer found:', {
      name: activePrinter.name,
      ip: activePrinter.ip_address,
      port: activePrinter.port
    });
    
    return activePrinter;
  } catch (error) {
    console.error('❌ Error getting active printer:', error);
    throw new Error(error.message || "Failed to get printer configuration");
  }
};

// Print estimation to printer - UPDATED to use active printer from API
export const printEstimationToPrinter = async (slipData, currentPrinter = null) => {
  try {
    console.log('🖨️ Starting print process...');
    
    // Get active printer - either from parameter or from API
    let activePrinter = currentPrinter;
    
    if (!activePrinter) {
      activePrinter = await getActivePrinter();
    }
    
    // Check if we have a current printer selected
    if (!activePrinter) {
      throw new Error("No current printer selected");
    }

    const options = {
      port: activePrinter.port || 9100,
      host: activePrinter.ip_address, // Use ip_address from API
      reuseAddress: true,
      timeout: 10000,
    };

    console.log(`🖨️ Printing to: ${activePrinter.ip_address}:${activePrinter.port}`);

    const {
      items,
      sample,
      goldRate,
      silverRate,
      totalpcs,
      totalGrossWeight,
      baseAmount,
      cgstAmount,
      sgstAmount,
      grandTotal,
      offer,
      itemsWithStones,
    } = slipData;

    return new Promise((resolve, reject) => {
      const client = TcpSocket.createConnection(options, () => {
        console.log("✅ Connected to printer:", activePrinter.ip_address);

        const offerWeight = offer.netwt || 0;
        const offerBoardRate = offer.board_rate || 0;
        const offerDiscount = offerWeight * offerBoardRate;

        // Build the print content with styling
        let printContent = "";

        // Initialize printer
        printContent += PRINTER_COMMANDS.INIT;

        // Header Section with styling
        printContent += FONTS.ALIGN_CENTER;
        printContent += FONTS.BOLD_ON + FONTS.DOUBLE_HEIGHT;
        printContent += "ESTIMATION SLIP\n";
        printContent += FONTS.BOLD_OFF + FONTS.NORMAL;

        printContent += formatStyledLine(
          "NAME :",
          "_____________________________",
          FONTS.BOLD_ON
        );
        printContent += "\n";
        printContent += formatStyledLine(
          "MOBILE :",
          "_____________________________",
          FONTS.BOLD_ON
        );
        printContent += "\n";
        printContent += "-----------------------------------------\n";

        // Estimation Info
        printContent += formatStyledLine(
          "ESTIMATION SLIP",
          `Est.No: ${sample?.tranno || ""} - ${sample?.company_id || "SFH"}`,
          FONTS.BOLD_ON
        );
        printContent += formatStyledLine(
          `Date: ${formatDate(sample?.trandate)}`,
          `Gold: ${goldRate.toFixed(0)}/Gm`
        );
        printContent += formatStyledLine(
          `Time: ${getCurrentTime()}`,
          `Silver: ${silverRate.toFixed(2)}/Gm`
        );
        printContent += "-----------------------------------------\n";

        // Table Header with bold
        printContent += formatStyledLine(
          "Description",
          "Weight    V.A    Amount",
          FONTS.BOLD_ON
        );
        printContent += "-----------------------------------------\n";

        // Items List - formatted to match preview
        itemsWithStones.forEach((item, idx) => {
          const itemName = (item.itemname || "").toUpperCase();
          const itemNumber = idx + 1;
          const stones = item.stones || [];

          // Main item row with bold
          printContent += formatStyledLine(
            `${itemNumber} ${itemName} (${item.pcs} Pcs) [${item.itemid}-${item.tagno}]`,
            "",
            FONTS.BOLD_ON
          );

          printContent += formatStyledLine(
            "Rate",
            `${(item.grswt || 0).toFixed(3)}    ${
              item.wastper && item.wastper > 0 ? item.wastper.toFixed(1) : ""
            }    ${(item.amount || 0).toFixed(0)}`
          );

          // Net weight if different
          if (item.grswt !== item.netwt) {
            printContent += formatStyledLine(
              "Netwt:",
              `${(item.netwt || 0).toFixed(3)}`
            );
          }

          // Stones
          stones.forEach((stone) => {
            printContent += formatStyledLine(
              "STUDDED",
              `${stone.stnwt?.toFixed(3) || "0.000"}${
                stone.stoneunit || ""
              }        ${stone.stnamt?.toFixed(0) || "0"}`
            );
          });

          // MC if exists
          if (item.mcgrm) {
            printContent += formatStyledLine("MC:", `${item.mcgrm?.toFixed(0)}`);
          }

          // Subitem names
          stones.forEach((stone) => {
            if (item.subitemname) {
              printContent += formatStyledLine(
                item.subitemname?.toUpperCase() || "",
                ""
              );
            }
          });
        });

        // Totals Section
        printContent += "-----------------------------------------\n";
        printContent += formatStyledLine(
          `Tot.Pcs: ${totalpcs}`,
          `${totalGrossWeight.toFixed(3)}        ${baseAmount.toFixed(0)}`,
          FONTS.BOLD_ON
        );

        if (offerDiscount > 0) {
          printContent += formatStyledLine(
            `Offer (${offerWeight.toFixed(3)} * ${offerBoardRate})`,
            `${offerDiscount.toFixed(1)}`
          );
        }

        printContent += formatStyledLine(
          "CGST (1.5%)",
          `${cgstAmount.toFixed(0)}`
        );
        printContent += formatStyledLine(
          "SGST (1.5%)",
          `${sgstAmount.toFixed(0)}`
        );
        printContent += "-----------------------------------------\n";

        // Grand Total with large font
        printContent += FONTS.BOLD_ON + FONTS.DOUBLE_HEIGHT;
        printContent += formatStyledLine(
          "Sales TOTAL:",
          `${grandTotal.toFixed(0)}`
        );
        printContent += FONTS.NORMAL;

        printContent += "-----------------------------------------\n";

        // Footer
        printContent += formatStyledLine(
          "[BMG]",
          `Est.No: ${sample?.tranno || ""}`,
          FONTS.BOLD_ON
        );

        // Feed some lines and cut
        printContent += PRINTER_COMMANDS.FEED_LINES(3);
        printContent += PRINTER_COMMANDS.CUT;

        printContent += "\n\n";

        // Write data with error handling
        try {
          client.write(printContent, "binary", (error) => {
            if (error) {
              console.log("❌ Write error:", error);
              reject(error);
              return;
            }

            // Wait a bit before closing to ensure data is sent
            setTimeout(() => {
              client.destroy();
              console.log("✅ Print completed successfully");
              resolve();
            }, 500);
          });
        } catch (error) {
          console.log("❌ Write exception:", error);
          client.destroy();
          reject(error);
        }
      });

      client.on("error", (error) => {
        console.log("❌ Printer connection error:", error);
        client.destroy();
        reject(error);
      });

      client.on("close", () => {
        console.log("🔌 Connection closed");
      });

      client.on("timeout", () => {
        console.log("⏰ Connection timeout");
        client.destroy();
        reject(new Error("Connection timeout"));
      });
    });
  } catch (error) {
    console.error("❌ Print setup error:", error);
    throw error;
  }
};

// Export all functions
export default {
  formatDate,
  getCurrentTime,
  mergeItems,
  fetchEstimationData,
  printEstimationToPrinter,
  getActivePrinter
};