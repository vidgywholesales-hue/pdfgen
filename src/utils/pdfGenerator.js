import jsPDF from 'jspdf';

export const generateDealsPDF = async (products) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const brandColor = [180, 56, 50]; // #B43832
  const textColor = [9, 9, 11]; // Zinc 950
  const textMuted = [113, 113, 122]; // Zinc 500

  const getImageDimensions = (base64) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = base64;
    });
  };

  // --- ELEGANT COVER PAGE ---
  doc.setFillColor(255, 255, 255); // Pure white background
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Delicate outer border
  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');

  // Removed redundant "VIDGY" text from the top since the logo provides the branding.

  // Fetch and draw logo image asynchronously
  try {
    const imgData = await fetch('/Untitled-1.png')
      .then(res => res.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

    const dims = await getImageDimensions(imgData);
    const maxLogoWidth = 120;
    const maxLogoHeight = 100;

    const scale = Math.min(maxLogoWidth / dims.width, maxLogoHeight / dims.height);
    const finalW = dims.width * scale;
    const finalH = dims.height * scale;

    // Centered vertically as the hero image
    doc.addImage(imgData, 'PNG', (pageWidth / 2) - (finalW / 2), 90, finalW, finalH);
  } catch (err) {
    console.error('Could not load logo image:', err);
  }

  // Contact Info (Bottom)
  const footerY = 225; // Raised slightly to accommodate larger sizes

  const contactText = 'CONTACT DIRECTLY';
  const contactSpacing = 2;
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const contactW = doc.getTextWidth(contactText) + ((contactText.length - 1) * contactSpacing);
  const contactX = (pageWidth / 2) - (contactW / 2);
  doc.text(contactText, contactX, footerY, { align: 'left', charSpace: contactSpacing });

  // Phone numbers as clickable button pills
  const bulkText = 'Bulk: +91 7096513044';
  const looseText = 'Loose: +91 9016459076';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);

  const pillPadding = 16; // padding for premium look
  const pillW_bulk = doc.getTextWidth(bulkText) + pillPadding;
  const pillW_loose = doc.getTextWidth(looseText) + pillPadding;
  const pillH = 10;
  const gap = 8;
  const totalW = pillW_bulk + gap + pillW_loose;

  const startX = (pageWidth / 2) - (totalW / 2);
  const pillY = footerY + 6;

  doc.setDrawColor(228, 228, 231); // Zinc-200 border
  doc.setFillColor(250, 250, 250); // Very light gray background
  doc.setLineWidth(0.3);

  // Draw Bulk Pill Button
  doc.setFillColor(250, 250, 250); // Explicitly set background color
  doc.roundedRect(startX, pillY, pillW_bulk, pillH, 5, 5, 'FD');
  doc.setTextColor(...textColor);
  doc.text(bulkText, startX + (pillW_bulk / 2), pillY + 6.8, { align: 'center' });
  doc.link(startX, pillY, pillW_bulk, pillH, { url: 'tel:+917096513044' }); // Click to call

  // Draw Loose Pill Button
  const looseX = startX + pillW_bulk + gap;
  doc.setFillColor(250, 250, 250); // Re-apply background color (setTextColor overrides it internally in jsPDF)
  doc.roundedRect(looseX, pillY, pillW_loose, pillH, 5, 5, 'FD');
  doc.setTextColor(...textColor);
  doc.text(looseText, looseX + (pillW_loose / 2), pillY + 6.8, { align: 'center' });
  doc.link(looseX, pillY, pillW_loose, pillH, { url: 'tel:+919016459076' }); // Click to call

  // Address
  doc.setTextColor(...textMuted);
  doc.setFontSize(12);
  doc.text('Dom no:-12-13, Chhaganbhai ni vadi, nr.hare krushna farm', pageWidth / 2, footerY + 22, { align: 'center' });
  doc.text('Dabholi, Katargam, Surat 394004', pageWidth / 2, footerY + 29, { align: 'center' });

  // Impressive Google Maps Button
  const mapLinkText = 'VIEW ON GOOGLE MAPS';
  const charSpacing = 1.5; // Premium letter spacing

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  const textBaseW = doc.getTextWidth(mapLinkText);
  const visualTextW = textBaseW + ((mapLinkText.length - 1) * charSpacing);

  const btnW = visualTextW + 40; // 20 padding on left and right
  const btnH = 16;
  const btnX = (pageWidth / 2) - (btnW / 2);
  const btnY = footerY + 38;

  // Draw Button Shape
  doc.setFillColor(...brandColor);
  doc.roundedRect(btnX, btnY, btnW, btnH, 4, 4, 'F');

  // Draw Text Inside (Bypassing jsPDF align center bug)
  const textX = (pageWidth / 2) - (visualTextW / 2);
  doc.setTextColor(255, 255, 255);
  doc.text(mapLinkText, textX, btnY + 10.2, { align: 'left', charSpace: charSpacing });

  // Make the entire button clickable
  doc.link(btnX, btnY, btnW, btnH, { url: 'https://maps.app.goo.gl/owLzs9nPkBkU32Fz9?g_st=iw' });

  // --- PRODUCT PAGES ---
  if (products.length > 0) {
    const itemsPerPage = 12;
    const columns = 3;
    const rows = 4;

    // Grid settings
    const marginX = 8;  // Reduced side spacing
    const marginY = 22; // Slightly reduced top spacing
    const usableWidth = pageWidth - (marginX * 2);
    const usableHeight = pageHeight - marginY - 24; // Increased bottom space to prevent overlap

    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;

    let currentPage = 1;
    let currentItem = 0;

    doc.addPage();
    drawPageHeaderFooter(doc, pageWidth, pageHeight, currentPage);

    for (let index = 0; index < products.length; index++) {
      const product = products[index];

      // Add new page if we exceed 12 items
      if (index > 0 && index % itemsPerPage === 0) {
        doc.addPage();
        currentPage++;
        currentItem = 0;
        drawPageHeaderFooter(doc, pageWidth, pageHeight, currentPage);
      }

      const col = currentItem % columns;
      const row = Math.floor(currentItem / columns);

      // Gap between items
      const gap = 4; // Tighter gap for larger cards
      const x = marginX + (col * cellWidth) + (gap / 2);
      const y = marginY + (row * cellHeight) + (gap / 2);

      const cardW = cellWidth - gap;
      const cardH = cellHeight - gap;

      // Draw elegant, perfect card with Brand Color Background
      doc.setFillColor(...brandColor);
      doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F'); // Red full background

      const textStageHeight = 18;
      const imgAreaH = cardH - textStageHeight;

      // Draw white image stage on top
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, cardW, imgAreaH, 3, 3, 'F'); // White top with rounded corners

      // Fill the bottom curve of the white image stage to make a sharp transition
      doc.rect(x, y + imgAreaH - 3, cardW, 3, 'F');

      // Subtle outer border to finish the card
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S');

      const imgPadding = 2; // Tiny padding inside the perfect card
      const imgWidth = cardW - (imgPadding * 2);
      const imgHeight = imgAreaH - (imgPadding * 2);

      if (product.image && product.image.startsWith('data:image/')) {
        try {
          const dims = await getImageDimensions(product.image);
          const scale = Math.min(imgWidth / dims.width, imgHeight / dims.height);
          const finalW = dims.width * scale;
          const finalH = dims.height * scale;

          const finalX = x + imgPadding + (imgWidth - finalW) / 2;
          const finalY = y + imgPadding + (imgHeight - finalH) / 2;

          const formatStr = product.image.substring(product.image.indexOf('/') + 1, product.image.indexOf(';')).toUpperCase();
          doc.addImage(product.image, formatStr, finalX, finalY, finalW, finalH);
        } catch (e) {
          console.error("Failed to add image to PDF:", e);
        }
      }

      // Add Sequential Number Badge in Top-Left Corner
      const badgeRadius = 4.5;
      const badgeX = x + badgeRadius + 2;
      const badgeY = y + badgeRadius + 2;
      
      doc.setFillColor(...brandColor);
      doc.circle(badgeX, badgeY, badgeRadius, 'F');
      
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.circle(badgeX, badgeY, badgeRadius, 'S');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}`, badgeX, badgeY, { align: 'center', baseline: 'middle' });

      // Text underneath (Centered vertically in the red space)
      const textY = y + imgAreaH + 10.5;
      const centerX = x + (cardW / 2);

      // Product Name
      doc.setTextColor(255, 255, 255); // White text on red background
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');

      const nameToUse = product.customName || '';
      const nameLines = doc.splitTextToSize(nameToUse, cardW - 4);
      const safeName = nameLines.length > 0 ? (nameLines.length > 1 ? nameLines[0].substring(0, 18) + '...' : nameLines[0]) : '';
      doc.text(safeName, centerX, textY, { align: 'center' });

      currentItem++;
    }
    
    // --- PRICE LIST PAGE ---
    doc.addPage();
    currentPage++;
    drawPageHeaderFooter(doc, pageWidth, pageHeight, currentPage);

    doc.setTextColor(...brandColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILS & PRICE LIST', pageWidth / 2, 28, { align: 'center', charSpace: 1 });

    let listY = 38; // Starting Y position for the list
    const leftMargin = 15;
    const numWidth = 15;
    const detailsWidth = 120;
    const priceWidth = 45;
    const lineHeight = 10;
    
    // Table Header
    doc.setFillColor(...brandColor);
    doc.rect(leftMargin, listY, pageWidth - leftMargin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NO.', leftMargin + 5, listY + 7);
    doc.text('DETAILS', leftMargin + numWidth + 5, listY + 7);
    doc.text('PRICE', leftMargin + numWidth + detailsWidth + 5, listY + 7);
    
    listY += 10;
    
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      
      // Check if we need a new page for the list
      if (listY > pageHeight - 30) {
        doc.addPage();
        currentPage++;
        drawPageHeaderFooter(doc, pageWidth, pageHeight, currentPage);
        listY = 30; // reset Y
      }
      
      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(leftMargin, listY, pageWidth - leftMargin * 2, lineHeight, 'F');
      }

      // Number
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}`, leftMargin + 5, listY + 6.5);
      
      // Details (Name and Pack of)
      doc.setFont('helvetica', 'normal');
      let detailsText = product.customName || '';
      if (product.customPackOf && product.customPackOf > 1) {
        detailsText += ` (Pack of ${product.customPackOf})`;
      }
      const nameLines = doc.splitTextToSize(detailsText, detailsWidth - 10);
      const safeName = nameLines.length > 0 ? nameLines[0].substring(0, 60) : '';
      doc.text(safeName, leftMargin + numWidth + 5, listY + 6.5);
      
      // Price
      const priceStr = parseFloat(product.customPrice) > 0
        ? `Rs. ${parseFloat(product.customPrice).toFixed(2)}`
        : 'OUT OF STOCK';
      
      doc.setFont('helvetica', 'bold');
      doc.text(priceStr, leftMargin + numWidth + detailsWidth + 5, listY + 6.5);

      // Draw bottom border for row
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.1);
      doc.line(leftMargin, listY + lineHeight, pageWidth - leftMargin, listY + lineHeight);
      
      listY += lineHeight;
    }
  }

  doc.save('vidgy-catalog.pdf');
};

function drawPageHeaderFooter(doc, pageWidth, pageHeight, pageNumber) {
  const brandColor = [180, 56, 50];
  const textColor = [9, 9, 11];

  // Modern clean header text
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titleText = 'VIDGY';
  doc.text(titleText, 15, 15);
  
  // Add beautiful brand-colored underline to the header title
  const titleW = doc.getTextWidth(titleText);
  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.6);
  doc.line(15, 17, 15 + titleW, 17);

  // Minimalist Footer Numbering
  doc.setTextColor(...brandColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`PAGE ${pageNumber}`, pageWidth / 2, pageHeight - 12, { align: 'center', charSpace: 1 });
}
