const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Contenu minimal pour un PDF valide
      doc.font('Helvetica');
      doc.text('Facture', { align: 'center' });
      doc.moveDown();
      
      // Vos données
      doc.text(`Rendez-vous: ${invoiceData.rendezvousId}`);
      doc.moveDown();
      
      invoiceData.services.forEach(service => {
        doc.text(`${service.serviceId.nom} - ${service.serviceId.prixFinal} Ariary`);
      });
      
      doc.text(`Total: ${invoiceData.totals.final}€`, { align: 'right' });
      
      doc.end();
    } catch (err) {
      reject(new Error(`Erreur génération PDF: ${err.message}`));
    }
  });
}
module.exports = { generateInvoicePDF };