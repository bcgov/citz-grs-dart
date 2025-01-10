import * as XLSX from "xlsx";

export const parseXlsxFileList = (
  fileList: File | null | undefined
): Promise<{ accession: string; application: string } | null> => {
  return new Promise((resolve, reject) => {
    if (fileList) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const data = new Uint8Array(event.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            if (sheet) {
              // Access specific cells
              const accessionCell = sheet.B3?.v; // B3 cell value
              const applicationCell = sheet.B4?.v; // B4 cell value

              if (accessionCell && applicationCell) {
                resolve({
                  accession: accessionCell.toString(),
                  application: applicationCell.toString(),
                });
              } else {
                resolve(null); // One or both cells are empty
              }
            } else {
              reject(new Error("Sheet not found in the Excel file."));
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file."));
      };

      reader.readAsArrayBuffer(fileList);
    } else {
      resolve(null);
    }
  });
};
