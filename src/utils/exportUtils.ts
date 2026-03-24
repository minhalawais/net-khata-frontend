/**
 * Utility function to export an array of JSON objects to a downloadable CSV file.
 * Automatically handles extracting keys as headers and formatting values.
 * 
 * @param {any[]} data - The array of objects to export.
 * @param {string} filename - The desired name for the downloaded file (without .csv extension).
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.warn("No data provided for export.");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format the rows
  const csvRows = [];
  
  // 1. Add header row
  csvRows.push(headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','));

  // 2. Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = String(row[header] ?? "").replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Combine into a single CSV string with UTF-8 BOM
  const csvString = '\\uFEFF' + csvRows.join('\\n');

  // Create a blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
