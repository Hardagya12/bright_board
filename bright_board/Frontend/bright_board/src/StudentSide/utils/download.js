import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export const downloadPDF = (results) => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Subject', 'Marks Obtained', 'Total Marks', 'Grade']],
    body: results.map(result => [
      result.name,
      result.marksObtained,
      result.totalMarks,
      result.grade,
    ]),
  });
  doc.save('results.pdf');
};

export const downloadCSV = (results) => {
  const csvContent = 'data:text/csv;charset=utf-8,\n' +
    'Subject,Marks Obtained,Total Marks,Grade\n' +
    results.map(result => `${result.name},${result.marksObtained},${result.totalMarks},${result.grade}`).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'results.csv');
};