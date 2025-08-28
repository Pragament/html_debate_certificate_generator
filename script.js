// Initialize jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", function () {
  // Get all DOM elements
  const studentNameInput = document.getElementById("studentName");
  const schoolNameInput = document.getElementById("schoolName");
  const debateTopicInput = document.getElementById("debateTopic");
  const dateInput = document.getElementById("date");
  const customMessageInput = document.getElementById("customMessage");
  const highlightOptions = document.querySelectorAll(".highlight-option");
  const colorOptions = document.querySelectorAll(".color-option");
  const logoUploadInput = document.getElementById("logoUpload");
  const uploadLogoBtn = document.getElementById("uploadLogoBtn");
  const logoPreview = document.getElementById("logoPreview");
  const templateOptions = document.querySelectorAll(".template-option");
  const qrToggle = document.getElementById("qrToggle");
  const qrText = document.getElementById("qrText");
  const qrSize = document.getElementById("qrSize");
  const certificateElement = document.getElementById("certificate");
  const generatePdfBtn = document.getElementById("generatePdf");
  const printCertificateBtn = document.getElementById("printCertificate");
  const shareCertificateBtn = document.getElementById("shareCertificate");

  // Form group wrappers for toggling visibility
  const formGroups = {
    studentName: document.getElementById("studentName-group"),
    schoolName: document.getElementById("schoolName-group"),
    debateTopic: document.getElementById("debateTopic-group"),
    date: document.getElementById("date-group"),
    customMessage: document.getElementById("customMessage-group"),
    highlight: document.getElementById("highlight-group"),
  };

  // --- EVENT LISTENERS ---

  [
    studentNameInput,
    schoolNameInput,
    debateTopicInput,
    dateInput,
    customMessageInput,
    qrText,
    qrSize,
  ].forEach((el) => {
    el.addEventListener("input", updateCertificatePreview);
  });
  qrToggle.addEventListener("change", updateCertificatePreview);
  logoUploadInput.addEventListener("change", handleLogoUpload);

  templateOptions.forEach((option) => {
    option.addEventListener("click", function () {
      templateOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");
      toggleFormFields();
      updateCertificatePreview();
    });
  });

  highlightOptions.forEach((option) =>
    option.addEventListener(
      "click",
      handleOptionSelection.bind(null, highlightOptions)
    )
  );
  colorOptions.forEach((option) =>
    option.addEventListener(
      "click",
      handleOptionSelection.bind(
        null,
        document.querySelectorAll(".color-option")
      )
    )
  );

  uploadLogoBtn.addEventListener("click", () => logoUploadInput.click());
  printCertificateBtn.addEventListener("click", () => window.print());
  shareCertificateBtn.addEventListener("click", () =>
    alert("Sharing functionality would be implemented here.")
  );
  generatePdfBtn.addEventListener("click", generatePDF);

  // --- FUNCTIONS ---

  function toggleFormFields() {
    const selectedTemplate = document.querySelector(".template-option.active")
      .dataset.template;
    if (selectedTemplate === "1") {
      // Generic Template
      formGroups.studentName.style.display = "none";
      formGroups.debateTopic.style.display = "none";
      formGroups.date.style.display = "none";
      formGroups.customMessage.style.display = "block";
      formGroups.schoolName.style.display = "block";
      formGroups.highlight.style.display = "block";
    } else {
      // Dynamic Template
      Object.values(formGroups).forEach(
        (group) => (group.style.display = "block")
      );
    }
  }

  function handleOptionSelection(options, event) {
    const parent = event.currentTarget.parentElement;
    parent
      .querySelectorAll(".active")
      .forEach((opt) => opt.classList.remove("active"));
    event.currentTarget.classList.add("active");
    updateCertificatePreview();
  }

  function handleLogoUpload() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        logoPreview.src = e.target.result;
        updateCertificatePreview();
      };
      reader.readAsDataURL(file);
    }
  }

  // Helper to format the highlight description
  function formatHighlightDescription(desc) {
    if (!desc) return "";
    // Removes parentheses and splits by comma, then formats
    return desc
      .replace(/[()]/g, "")
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .join(" | ");
  }

  function updateCertificatePreview() {
    certificateElement.innerHTML = "";
    certificateElement.className = "certificate";

    const selectedTemplate = document.querySelector(".template-option.active")
      .dataset.template;
    const primaryColor =
      document.querySelector(".color-options:first-of-type .active")?.dataset
        .color || "#3f51b5";
    const logoSrc = logoPreview.src;
    const schoolName = schoolNameInput.value;
    const selectedHighlightEl = document.querySelector(
      ".highlight-option.active"
    );
    const highlight = selectedHighlightEl?.dataset.value || "";
    const highlightDesc = selectedHighlightEl?.dataset.description || "";
    const formattedHighlightDesc = formatHighlightDescription(highlightDesc);
    const customMessage = customMessageInput.value;

    let certificateHTML = `<div class="certificate-header">`;
    if (schoolName) {
      certificateHTML += `<img class="certificate-logo" src="${logoSrc}" alt="Logo"><h1 class="certificate-title">${schoolName}</h1>`;
    }
    certificateHTML += `<h1 class="certificate-title script" style="color: ${primaryColor};">Certificate of Achievement</h1></div><div class="certificate-body">`;

    if (selectedTemplate === "1") {
      // Generic Preview
      if (highlight) {
        certificateHTML += `<p class="certificate-text">For Outstanding Achievement in</p>
                                    <div class="certificate-highlight-main" style="color: ${primaryColor};">${highlight}</div>
                                    <div class="certificate-highlight-desc">${formattedHighlightDesc}</div>`;
      }
      if (customMessage) {
        certificateHTML += `<p class="certificate-text" style="margin-top: 20px;">${customMessage}</p>`;
      }
    } else {
      // Dynamic Preview
      const studentName = studentNameInput.value;
      const debateTopic = debateTopicInput.value;
      const date = dateInput.value;

      if (studentName) {
        certificateHTML += `<p class="certificate-text">This certificate is proudly presented to</p>
                                    <h2 style="color: ${primaryColor}; font-family: var(--font-script); font-size: 2.8em; margin: 20px 0;">${studentName}</h2>`;
      }
      if (debateTopic) {
        certificateHTML += `<p class="certificate-text">for participation in the</p><p class="certificate-text"><strong>${debateTopic}</strong></p>`;
      }
      if (customMessage) {
        certificateHTML += `<p class="certificate-text">${customMessage}</p>`;
      }
      if (highlight) {
        certificateHTML += `<div class="certificate-highlight-main" style="color: ${primaryColor};">${highlight}</div>
                                    <div class="certificate-highlight-desc">${formattedHighlightDesc}</div>`;
      }
      if (date) {
        certificateHTML += `<p class="certificate-text">Awarded on this ${date}</p>`;
      }
    }

    certificateHTML += `</div><div class="certificate-signatures"><div class="signature-line"><p>School Principal</p></div></div>`;
    if (qrToggle.checked) {
      certificateHTML += `<div class="certificate-qr" id="certQrCode"></div>`;
    }
    certificateElement.innerHTML = certificateHTML;

    if (qrToggle.checked) {
      const qrPreviewSize = getScaledQrSize(qrSize.value, true);
      new QRCode(document.getElementById("certQrCode"), {
        text: qrText.value,
        width: qrPreviewSize,
        height: qrPreviewSize,
      });
    }
  }

  function generatePDF() {
    const selectedTemplate = document.querySelector(".template-option.active")
      .dataset.template;
    if (selectedTemplate === "1") {
      generateGenericPDF();
    } else {
      generateDynamicPDF();
    }
  }

  function getScaledQrSize(selectedValue, isPreview = false) {
    const baseSizes = isPreview
      ? { 80: 80, 100: 100, 120: 120 }
      : { 80: 100, 100: 125, 120: 150 };
    return baseSizes[selectedValue] || (isPreview ? 100 : 125);
  }

  // --- PDF Generation Functions ---

  function generateGenericPDF() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [1123, 797],
    });
    const schoolName = schoolNameInput.value || "";
    const selectedHighlightEl = document.querySelector(
      ".highlight-option.active"
    );
    const highlight = selectedHighlightEl?.dataset.value || "";
    const highlightDesc = selectedHighlightEl?.dataset.description || "";
    const formattedHighlightDesc = formatHighlightDescription(highlightDesc);
    const customMessage = customMessageInput.value || "";
    const primaryColor =
      document.querySelector(".color-options:first-of-type .active")?.dataset
        .color || "#0d47a1";
    const logoImg = logoPreview.src || "";
    const includeQR = qrToggle.checked;
    const qrCanvas = document.querySelector("#certQrCode canvas");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    drawAttractiveBackground(doc, pageWidth, pageHeight, primaryColor);
    let y = 160;

    if (schoolName) {
      doc.setFont("serif", "bold");
      doc.setFontSize(58); // Increased
      doc.setTextColor("#333333");
      if (logoImg && !logoImg.includes("undefined")) {
        const logoSize = 105; // Increased
        const schoolNameWidth =
          (doc.getStringUnitWidth(schoolName) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        const totalHeaderWidth = logoSize + 30 + schoolNameWidth;
        const startX = (pageWidth - totalHeaderWidth) / 2;
        doc.addImage(
          logoImg,
          "PNG",
          startX,
          y - logoSize / 2 - 10,
          logoSize,
          logoSize
        );
        doc.text(schoolName, startX + logoSize + 30, y);
      } else {
        doc.text(schoolName, pageWidth / 2, y, { align: "center" });
      }
      y += 130;
    }

    doc.setFont("serif", "italic", 700);
    doc.setFontSize(74);
    doc.setTextColor(primaryColor);
    doc.text("Certificate of Achievement", pageWidth / 2, y, {
      align: "center",
    });
    y += 120;

    if (highlight) {
      doc.setFont("serif", "normal");
      doc.setFontSize(30);
      doc.setTextColor("#444444");
      doc.text("For Outstanding Achievement in", pageWidth / 2, y, {
        align: "center",
      });
      y += 65;
      doc.setFont("serif", "bold");
      doc.setFontSize(52);
      doc.setTextColor(primaryColor);
      doc.text(highlight, pageWidth / 2, y, { align: "center" });
      y += 55;
      doc.setFont("serif", "bold");
      doc.setFontSize(24);
      doc.setTextColor("#555555");
      doc.text(formattedHighlightDesc, pageWidth / 2, y, { align: "center" });
      y += 50;
    }

    if (customMessage) {
      doc.setFont("serif", "normal");
      doc.setFontSize(20);
      doc.setTextColor("#666666");
      const splitMsg = doc.splitTextToSize(customMessage, pageWidth - 500);
      doc.text(splitMsg, pageWidth / 2, y, { align: "center" });
    }

    const footerY = pageHeight - 100;
    const sigWidth = 280;
    const sigX = pageWidth / 2 - sigWidth / 2;
    doc.setDrawColor("#555555");
    doc.setLineWidth(1.2);
    doc.line(sigX, footerY, sigX + sigWidth, footerY);
    doc.setFont("serif", "normal");
    doc.setFontSize(18);
    doc.setTextColor("#333333");
    doc.text("School Principal", pageWidth / 2, footerY + 28, {
      align: "center",
    });

    if (includeQR && qrCanvas) {
      const qrImg = qrCanvas.toDataURL("image/png");
      const qrSizeVal = getScaledQrSize(qrSize.value);
      // doc.addImage(
      //   qrImg,
      //   "PNG",
      //   pageWidth - qrSizeVal - 90,
      //   footerY - qrSizeVal / 2,
      //   qrSizeVal,
      //   qrSizeVal
      // );
      // Inside generateGenericPDF and generateDynamicPDF, replace the QR code placement with:
      doc.addImage(
        qrImg,
        "PNG",
        pageWidth - qrSizeVal - 70,
        footerY - qrSizeVal / 2 - 10,
        qrSizeVal,
        qrSizeVal
      );
    }

    doc.save("Generic_Certificate_Attractive.pdf");
  }

  function generateDynamicPDF() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [1123, 797],
    });
    const studentName = studentNameInput.value || "";
    const schoolName = schoolNameInput.value || "";
    const debateTopic = debateTopicInput.value || "";
    const customMessage = customMessageInput.value || "";
    const selectedHighlightEl = document.querySelector(
      ".highlight-option.active"
    );
    const highlight = selectedHighlightEl?.dataset.value || "";
    const highlightDesc = selectedHighlightEl?.dataset.description || "";
    const formattedHighlightDesc = formatHighlightDescription(highlightDesc);
    const primaryColor =
      document.querySelector(".color-options:first-of-type .active")?.dataset
        .color || "#0d47a1";
    const logoImg = logoPreview.src || "";
    const includeQR = qrToggle.checked;
    const qrCanvas = document.querySelector("#certQrCode canvas");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    drawAttractiveBackground(doc, pageWidth, pageHeight, primaryColor);
    let y = 120;

    if (schoolName) {
      doc.setFont("serif", "bold");
      doc.setFontSize(44); // Increased
      doc.setTextColor("#333333");
      if (logoImg && !logoImg.includes("undefined")) {
        const logoSize = 80; // Increased
        const schoolNameWidth =
          (doc.getStringUnitWidth(schoolName) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        const totalHeaderWidth = logoSize + 20 + schoolNameWidth;
        const startX = (pageWidth - totalHeaderWidth) / 2;
        doc.addImage(
          logoImg,
          "PNG",
          startX,
          y - logoSize / 2 - 5,
          logoSize,
          logoSize
        );
        doc.text(schoolName, startX + logoSize + 20, y);
      } else {
        doc.text(schoolName, pageWidth / 2, y, { align: "center" });
      }
      y += 100;
    }

    doc.setFont("serif", "italic", 700);
    doc.setFontSize(52);
    doc.setTextColor(primaryColor);
    doc.text("Certificate of Achievement", pageWidth / 2, y, {
      align: "center",
    });
    y += 80;

    if (studentName) {
      doc.setFont("serif", "normal");
      doc.setFontSize(22);
      doc.setTextColor("#444444");
      doc.text("This certificate is proudly presented to", pageWidth / 2, y, {
        align: "center",
      });
      y += 70;
      doc.setFont("serif", "bold", 700);
      doc.setFontSize(60);
      doc.setTextColor(primaryColor);
      doc.text(studentName, pageWidth / 2, y, { align: "center" });
      y += 80;
    }

    if (debateTopic) {
      doc.setFont("serif", "normal");
      doc.setFontSize(22);
      doc.setTextColor("#444444");
      doc.text("For participation in the", pageWidth / 2, y, {
        align: "center",
      });
      y += 40;
      doc.setFont("serif", "bold");
      doc.setFontSize(28);
      doc.setTextColor("#333333");
      doc.text(debateTopic, pageWidth / 2, y, { align: "center" });
      y += 40;
    }

    if (highlight) {
      doc.setFont("serif", "bold");
      doc.setFontSize(32);
      doc.setTextColor(primaryColor);
      doc.text(highlight, pageWidth / 2, y, { align: "center" });
      y += 30;
      doc.setFont("serif", "bold");
      doc.setFontSize(20);
      doc.setTextColor("#555555");
      doc.text(formattedHighlightDesc, pageWidth / 2, y, { align: "center" });
      y += 40;
    }

    if (customMessage) {
      doc.setFont("serif", "normal");
      doc.setFontSize(18);
      doc.setTextColor("#555555");
      const splitMsg = doc.splitTextToSize(customMessage, pageWidth - 400);
      doc.text(splitMsg, pageWidth / 2, y, { align: "center" });
    }

    const footerY = pageHeight - 100;
    const sigWidth = 240;
    const sigX = pageWidth / 2 - sigWidth / 2;
    doc.setDrawColor("#555555");
    doc.setLineWidth(1);
    doc.line(sigX, footerY, sigX + sigWidth, footerY);
    doc.setFont("serif", "normal");
    doc.setFontSize(16);
    doc.setTextColor("#333333");
    doc.text("School Principal", pageWidth / 2, footerY + 24, {
      align: "center",
    });

    if (includeQR && qrCanvas) {
      const qrImg = qrCanvas.toDataURL("image/png");
      const qrSizeVal = getScaledQrSize(qrSize.value);
      // doc.addImage(qrImg, "PNG", pageWidth - qrSizeVal - 90, footerY - qrSizeVal / 2, qrSizeVal, qrSizeVal);
      const margin = 30;
      const cornerSize = 80;
      const qrPadding = 20; // Extra space from the corner, adjust as needed

      const qrX = pageWidth - margin - cornerSize - qrPadding - qrSizeVal;
      const qrY = pageHeight - margin - cornerSize - qrPadding - qrSizeVal;

      doc.addImage(qrImg, "PNG", qrX, qrY, qrSizeVal, qrSizeVal);
    }

    doc.save("Dynamic_Certificate_Attractive.pdf");
  }

  function drawAttractiveBackground(doc, pageWidth, pageHeight, primaryColor) {
    // Subtle background pattern
    doc.setFillColor("#fcfcfc");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setDrawColor("#f0f0f0");
    doc.setLineWidth(0.5);
    for (let i = 0; i < pageWidth; i += 25) {
      doc.line(i, 0, i, pageHeight);
    }
    for (let i = 0; i < pageHeight; i += 25) {
      doc.line(0, i, pageWidth, i);
    }

    // Decorative corners
    const cornerSize = 80;
    const margin = 30;
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(2.5);
    // Top-left
    doc.line(margin, margin + cornerSize, margin, margin);
    doc.line(margin, margin, margin + cornerSize, margin);
    // Top-right
    doc.line(
      pageWidth - margin,
      margin + cornerSize,
      pageWidth - margin,
      margin
    );
    doc.line(
      pageWidth - margin,
      margin,
      pageWidth - margin - cornerSize,
      margin
    );
    // Bottom-left
    doc.line(
      margin,
      pageHeight - margin - cornerSize,
      margin,
      pageHeight - margin
    );
    doc.line(
      margin,
      pageHeight - margin,
      margin + cornerSize,
      pageHeight - margin
    );
    // Bottom-right
    doc.line(
      pageWidth - margin,
      pageHeight - margin - cornerSize,
      pageWidth - margin,
      pageHeight - margin
    );
    doc.line(
      pageWidth - margin,
      pageHeight - margin,
      pageWidth - margin - cornerSize,
      pageHeight - margin
    );
  }

  // Initial setup
  toggleFormFields();
  updateCertificatePreview();
});
