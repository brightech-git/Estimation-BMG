// Src/Services/PrinterService.js
import axios from "axios";
import { useApiBaseUrl } from "../../Config/Config";

// ✅ React Hook to handle all Printer API calls
export const usePrinterService = () => {
  const baseUrl = useApiBaseUrl(); // ← dynamically read from LoginContext
  const API_URL = `${baseUrl}/printers`;

  // ✅ 1. Get All Printers
  const getAllPrinters = async () => {
    const response = await axios.get(`${API_URL}/list`);
    return response.data;
  };

  // ✅ 2. Get Printer By ID
  const getPrinterById = async (id) => {
    const response = await axios.get(`${API_URL}/get`, { params: { id } });
    return response.data;
  };

  // ✅ 3. Create Printer
  const createPrinter = async (printerData) => {
    const response = await axios.post(`${API_URL}/create`, printerData);
    return response.data;
  };

  // ✅ 4. Update Printer
  const updatePrinter = async (printerData) => {
    const response = await axios.put(`${API_URL}/update`, printerData);
    return response.data;
  };

  // ✅ 5. Delete Printer
  const deletePrinter = async (id) => {
    const response = await axios.delete(`${API_URL}/delete`, {
      params: { id },
    });
    return response.data;
  };

  return {
    getAllPrinters,
    getPrinterById,
    createPrinter,
    updatePrinter,
    deletePrinter,
  };
};
