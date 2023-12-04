import { downloadExcel } from 'react-export-table-to-excel';

export default function handleDownloadExcel(name: string, header: any, body: any) {
  const opt = name || 'downloadExcel Method';

  downloadExcel({
    fileName: opt,
    sheet: opt,
    tablePayload: {
      header,
      body
    }
  });
}
