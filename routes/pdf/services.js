const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Configuration des colonnes
      const columns = [
        { label: 'Description', width: 300 },
        { label: 'Prix unitaire', width: 100, align: 'right' },
        { label: 'Total', width: 100, align: 'right' }
      ];
      
      // Position de départ du tableau
      const tableTop = 180;
      const rowHeight = 30;
      const marginLeft = 50;

      // En-tête

    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text('Garage Mada', { align: 'center' })
       .moveDown(0.5); // Espace après le titre principal
        
    doc.font('Helvetica')
       .fontSize(10)
       .text('123 Avenue des Garages, Antananarivo', { align: 'center' })
       .moveDown(0.3); // Espace réduit entre les lignes d'adresse
        
    doc.text('Tél: 032 07 715 64 | Email: garagemada@autocare.mg', { align: 'center' })
       .moveDown(1.5); // Grand espace avant le titre FACTURE
        
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .text('FACTURE', { align: 'center', underline: true })
       .moveDown(1); // Espace après le titre FACTURE

// Bloc informations facture
const infoStartY = doc.y; // Sauvegarde la position Y actuelle
doc.font('Helvetica')
   .fontSize(10)
   .text(`N° Facture: ${invoiceData.rendezvousId || 'N/A'}`, 50, infoStartY)
   .text(`Date: ${new Date().toLocaleDateString()}`, 50, infoStartY + 15)
   .text(`Client: ${invoiceData.clientName || 'Non spécifié'}`, 50, infoStartY + 30)
   .moveDown(2); // Double espace après les infos

      // Dessiner l'en-tête du tableau
      doc.font('Helvetica-Bold');
      let x = marginLeft;
      columns.forEach(column => {
        doc.text(column.label, x, tableTop, { 
          width: column.width,
          align: column.align || 'left'
        });
        x += column.width;
      });

      // Ligne de séparation de l'en-tête
      doc.moveTo(marginLeft, tableTop + 20)
         .lineTo(marginLeft + 500, tableTop + 20)
         .stroke();

      // Contenu du tableau
      doc.font('Helvetica');
      let y = tableTop + rowHeight;
      
      invoiceData.services.forEach(service => {
        x = marginLeft;
        
        // Description
        doc.text(service.serviceId.nom, x, y, {
          width: columns[0].width,
          align: 'left'
        });
        x += columns[0].width;
        
        // Prix unitaire
        doc.text(`${service.serviceId.prixFinal} Ar`, x, y, {
          width: columns[1].width,
          align: 'right'
        });
        x += columns[1].width;
        
        // Total
        doc.text(`${service.serviceId.prixFinal} Ar`, x, y, {
          width: columns[2].width,
          align: 'right'
        });
        
        // Ligne de séparation
        doc.moveTo(marginLeft, y + 20)
           .lineTo(marginLeft + 500, y + 20)
           .stroke();
        
        y += rowHeight;
      });

      // Totaux
      const totalsY = y + 10;
      doc.font('Helvetica-Bold')
         .text('Total HT:', marginLeft + 300, totalsY, { width: 100, align: 'right' })
         .text(`${invoiceData.totals?.initial || 0} Ar`, marginLeft + 400, totalsY, { align: 'right' })

         .text('Reduction:', marginLeft + 300, totalsY + 50, { width: 100, align: 'right' })
         .text(`${invoiceData.totals?.reduction || 0} Ar`, marginLeft + 400, totalsY + 50, { align: 'right' })
         
         .text('Total TTC:', marginLeft + 300, totalsY + 70, { width: 100, align: 'right' })
         .text(`${invoiceData.totals?.final || 0} Ar`, marginLeft + 400, totalsY + 70, { align: 'right' });

      doc.end();
    } catch (err) {
      reject(new Error(`Erreur génération PDF: ${err.message}`));
    }
  });
}
module.exports = { generateInvoicePDF };