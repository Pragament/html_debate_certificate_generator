document.addEventListener("DOMContentLoaded", () => {
  // Polyfill for structuredClone if needed
  if (!window.structuredClone) {
    window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
  }

  // DOM Element References
  const ui = {
    // Inputs
    schoolName: document.getElementById("schoolName"),
    eventName: document.getElementById("eventName"),
    highlightAttributes: document.getElementById("highlightAttributes"),
    logoUpload: document.getElementById("logoUpload"),
    qrToggle: document.getElementById("qrToggle"),
    qrText: document.getElementById("qrText"),
    // Dynamic Highlight Form
    addHighlightForm: document.getElementById("addHighlightForm"),
    newHighlightText: document.getElementById("newHighlightText"),
    newHighlightAttributes: document.getElementById("newHighlightAttributes"),
    // Buttons
    saveHighlightBtn: document.getElementById("saveHighlightBtn"),
    cancelHighlightBtn: document.getElementById("cancelHighlightBtn"),
    uploadLogoBtn: document.getElementById("uploadLogoBtn"),
    generatePdfBtn: document.getElementById("generatePdf"),
    printCertificateBtn: document.getElementById("printCertificate"),
    shareCertificateBtn: document.getElementById("shareCertificate"),
    // Containers
    certificate: document.getElementById("certificate"),
    logoPreview: document.getElementById("logoPreview"),
    qrOptions: document.getElementById("qrOptions"),
    highlightOptions: document.getElementById("highlightOptions"),
    borderColorOptions: document.getElementById("borderColorOptions"),
    shapeColorOptions: document.getElementById("shapeColorOptions"),
    subtitleColorOptions: document.getElementById("subtitleColorOptions"),
  };
  
  // Application State
  let state = {
    schoolName: "DELHI SECONDARY SCHOOL",
    eventName: "Annual Inter-School Debate Championship",
    highlight: {
      id: 1,
      text: "Presentation Skills",
      attributes: "VOICE | CONFIDENCE | EYE CONTACT | BODY LANGUAGE",
    },
    logoSrc: "https://i.ibb.co/bF03NC6/logo-removebg-preview.png",
    qr: { enabled: true, text: "" },
    // START: UPDATED CODE
    // Set a new default color scheme
    colors: { border: "#2c3e50", shape: "#D4AF37", subtitle: "#7f8c8d" },
    availableHighlights: [
      { id: 1, text: "Presentation Skills", attributes: "VOICE | CONFIDENCE | EYE CONTACT | BODY LANGUAGE" },
      { id: 2, text: "Teamwork", attributes: "COLLABORATION | SUPPORT | RELIABILITY" },
      { id: 3, text: "Leadership", attributes: "INITIATIVE | GUIDANCE | MOTIVATION" },
      { id: 4, text: "Communication", attributes: "CLARITY | PERSUASION | LISTENING" },
      { id: 5, text: "Problem Solving", attributes: "ANALYTICAL SKILLS | CREATIVITY | RESOURCEFULNESS" },
    ],
    // Added more cohesive color palettes
    availableColors: {
      border: [
        "#2c3e50", // Midnight Blue
        "#800000", // Maroon
        "#004d40", // Dark Teal
        "#D4AF37", // Classic Gold
        "#343a40", // Dark Charcoal
        "#8B4513", // SaddleBrown
      ],
      shape: [
        "#D4AF37", // Classic Gold (pairs with blues, maroons)
        "#e67e22", // Burnt Orange (pairs with teals, charcoals)
        "#1abc9c", // Vibrant Turquoise
        "#c09f80", // Muted Bronze (pairs with greens, blues)
        "#3498db", // Bright Blue
        "#990000", // Crimson Red
      ],
      subtitle: [
        "#7f8c8d", // Greyish Cyan
        "#95a5a6", // Light Grey
        "#bdc3c7", // Lighter Grey
        "#848482", // Warm Grey
        "#d35400", // Pumpkin Orange
        "#5d6d7e", // Slate Grey
      ],
    },
    // END: UPDATED CODE
  };

  function updateQrCodeLink() {
    const shareData = {
      schoolName: state.schoolName,
      eventName: state.eventName,
      highlight: state.highlight,
      colors: state.colors,
      logoSrc: state.logoSrc,
    };
    if (shareData.logoSrc.startsWith('data:image')) {
      shareData.logoSrc = "https://i.ibb.co/bF03NC6/logo-removebg-preview.png";
    }
    const encodedData = btoa(JSON.stringify(shareData));
    const shareableLink = `${window.location.origin}${window.location.pathname}?cert=${encodedData}`;
    state.qr.text = shareableLink;
    ui.qrText.value = shareableLink;
  }

  function loadCertificateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const certData = params.get('cert');
    if (certData) {
      try {
        const decodedData = JSON.parse(atob(certData));
        Object.assign(state, decodedData);
        document.getElementById('left-panel').style.display = 'none';
        document.querySelector('.container').style.gridTemplateColumns = '1fr';
      } catch (error) {
        console.error("Failed to load certificate from URL:", error);
      }
    }
  }

  function renderApp() {
    updateQrCodeLink();
    renderCertificatePreview();
    renderHighlightOptions();
    renderColorOptions();
    ui.schoolName.value = state.schoolName;
    ui.eventName.value = state.eventName;
    ui.highlightAttributes.value = state.highlight.attributes;
    ui.logoPreview.src = state.logoSrc;
    ui.qrOptions.classList.toggle('hidden', !state.qr.enabled);
  }

  function renderCertificatePreview() {
    const { schoolName, eventName, highlight, logoSrc, qr, colors } = state;
    ui.certificate.style.setProperty("--cert-border-color", colors.border);
    ui.certificate.style.setProperty("--cert-shape-color", colors.shape);
    ui.certificate.style.setProperty("--cert-subtitle-color", colors.subtitle);
    const eventText = `For Participation in the ${eventName} and demonstrating:`;
    const concludingText = `For demonstrating exceptional skills in ${eventName} and contributing to the success of your team.`;
    ui.certificate.innerHTML = `
        <div class="cert-border"></div>
        <div class="cert-content">
            <div class="cert-header"><img src="${logoSrc}" class="cert-logo" alt="School Logo"><div class="cert-school-name">${schoolName}</div></div>
            <div class="cert-body">
                <h1 class="cert-title">CERTIFICATE</h1>
                <h2 class="cert-subtitle">OF ACHIEVEMENT</h2>
                <p class="cert-event-name">${eventText}</p>
                <div class="cert-highlight-script">${highlight.text}</div>
                <p class="cert-highlight-attrs">${highlight.attributes}</p>
                <p class="cert-concluding-message">${concludingText}</p>
            </div>
            <div class="cert-footer">
                <div class="cert-signature-area"><div class="signature-line"></div><p>School Principal</p></div>
                ${qr.enabled ? `<div class="cert-qr-area"><div class="cert-qr-code" id="certQrCode"></div><p>Scan the QR to download digitally.</p></div>` : '<div class="cert-qr-area"></div>'}
            </div>
        </div>`;
    if (qr.enabled && qr.text) {
      const qrCodeEl = document.getElementById("certQrCode");
      qrCodeEl.innerHTML = '';
      new QRCode(qrCodeEl, { text: qr.text, width: 100, height: 100 });
    }
  }

  function renderHighlightOptions() {
    ui.highlightOptions.innerHTML = state.availableHighlights.map(h =>
        `<button class="highlight-option ${h.id === state.highlight.id ? "active" : ""}" data-id="${h.id}">${h.text}</button>`
      ).join("") + '<button class="highlight-option add-new" id="addNewHighlightBtn">+ Add New</button>';
  }

  function renderColorOptions() {
    ui.borderColorOptions.innerHTML = state.availableColors.border.map(c => `<div class="color-option ${c === state.colors.border ? "active" : ""}" style="background-color:${c}" data-color="${c}"></div>`).join("");
    ui.shapeColorOptions.innerHTML = state.availableColors.shape.map(c => `<div class="color-option ${c === state.colors.shape ? "active" : ""}" style="background-color:${c}" data-color="${c}"></div>`).join("");
    ui.subtitleColorOptions.innerHTML = state.availableColors.subtitle.map(c => `<div class="color-option ${c === state.colors.subtitle ? "active" : ""}" style="background-color:${c}" data-color="${c}"></div>`).join("");
  }

  function handleInputChange(e) {
    const { id, value, checked } = e.target;
    switch (id) {
      case "schoolName": state.schoolName = value; break;
      case "eventName": state.eventName = value; break;
      case "highlightAttributes": state.highlight.attributes = value; break;
      case "qrToggle": state.qr.enabled = checked; break;
    }
    renderApp();
  }

  function handlePanelClick(e) {
    const target = e.target;
    if (target.matches(".highlight-option") && target.dataset.id) {
      const selectedId = parseInt(target.dataset.id);
      state.highlight = structuredClone(state.availableHighlights.find(h => h.id === selectedId));
      renderApp();
    }
    if (target.matches("#addNewHighlightBtn")) {
      ui.addHighlightForm.classList.remove('hidden');
    }
    if (target.matches(".color-option")) {
      const color = target.dataset.color;
      const parentId = target.parentElement.id;
      if (parentId === "borderColorOptions") state.colors.border = color;
      if (parentId === "shapeColorOptions") state.colors.shape = color;
      if (parentId === "subtitleColorOptions") state.colors.subtitle = color;
      renderApp();
    }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        state.logoSrc = event.target.result;
        renderApp();
      };
      reader.readAsDataURL(file);
    }
  }
  
  function saveNewHighlight() {
    const text = ui.newHighlightText.value.trim();
    const attributes = ui.newHighlightAttributes.value.trim();
    if (!text) { alert("Please fill in the highlight text."); return; }
    const newId = Date.now();
    const newHighlight = { id: newId, text, attributes };
    state.availableHighlights.push(newHighlight);
    state.highlight = structuredClone(newHighlight);
    ui.addHighlightForm.classList.add('hidden');
    ui.newHighlightText.value = '';
    ui.newHighlightAttributes.value = '';
    renderApp();
  }

  async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas(ui.certificate, { scale: 3, backgroundColor: null, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${state.schoolName}_Certificate.pdf`);
  }

  // Event Listeners
  document.getElementById("left-panel").addEventListener("input", handleInputChange);
  document.getElementById("left-panel").addEventListener("click", handlePanelClick);
  ui.logoUpload.addEventListener("change", handleLogoUpload);
  ui.uploadLogoBtn.addEventListener("click", () => ui.logoUpload.click());
  ui.cancelHighlightBtn.addEventListener("click", () => ui.addHighlightForm.classList.add('hidden'));
  ui.saveHighlightBtn.addEventListener("click", saveNewHighlight);
  ui.generatePdfBtn.addEventListener("click", generatePDF);
  ui.printCertificateBtn.addEventListener("click", () => window.print());
  ui.shareCertificateBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(state.qr.text).then(() => alert("Certificate link copied to clipboard!"), () => alert("Failed to copy link."));
  });

  // Initial setup
  loadCertificateFromUrl();
  renderApp();
});