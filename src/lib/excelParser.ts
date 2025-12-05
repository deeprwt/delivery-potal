import * as XLSX from "xlsx";
import { OrderData } from "./orderService";

// Define the expected Excel row type
interface ExcelOrderRow {
  orderNumber?: string | number;
  customerName?: string;
  customerPhone?: string | number;
  secondaryPhone?: string | number;
  address?: string;
  pincode?: string | number;
  amountToCollect?: number | string;
  productName?: string;
}

export const parseExcel = async (file: File): Promise<OrderData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const binaryStr = e.target?.result;
      if (!binaryStr) return reject("Failed to read file");

      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Strictly typed array
      const data: ExcelOrderRow[] = XLSX.utils.sheet_to_json<ExcelOrderRow>(sheet);

      const orders: OrderData[] = data.map(row => ({
        orderNumber: String(row.orderNumber || ""),
        customerName: row.customerName || "",
        customerPhone: String(row.customerPhone || ""),
        secondaryPhone: String(row.secondaryPhone || ""),
        address: row.address || "",
        pincode: String(row.pincode || ""),
        amountToCollect: Number(row.amountToCollect || 0),
        productName: row.productName || "",

        status: "pending",

        pod: {
          photos: [],
          notes: "",
          time: null,
          location: null,
        },

        riderId: "",
        riderName: "",
        riderPhone: "",
      }));

      resolve(orders);
    };

    reader.onerror = reject;

    reader.readAsBinaryString(file);
  });
};
