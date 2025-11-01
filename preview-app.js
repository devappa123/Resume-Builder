// Global data
let APP_STATE = null;

// Init preview page
$(document).ready(() => {
  loadFromLocalStorage();
  renderFinalPreview();
  initEvents();
});

// Buttons / Events
function initEvents() {
  $('#editResumeBtn').on('click', () => window.location.href = 'form.html');
  $('#newResumeBtn').on('click', startNewResume);
  $('#downloadPdfBtn').on('click', downloadPDF);
  $('#downloadPngBtn').on('click', downloadPNG);
  $('#downloadDocxBtn').on('click', downloadDOCX);
}

// Load stored resume data
function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('resumeBuilderData');
    if (!data) return alert('No data found') || (window.location.href = 'index.html');
    APP_STATE = JSON.parse(data);
  } catch (e) {
    alert('Error loading data');
    window.location.href = 'index.html';
  }
}

// Show resume preview
function renderFinalPreview() {
  if (!APP_STATE) return;
  const theme = APP_STATE.selectedTheme || 'corporate';
  const html = generateResumeHTML(theme, APP_STATE.formData);
  $('#finalPreview').html(html);
}

// Pick theme
function generateResumeHTML(theme, data) {
  if (theme === 'modern') return generateModernTheme(data);
  if (theme === 'academic') return generateAcademicTheme(data);
  return generateCorporateTheme(data);
}

// Helpers to render small lists
const parseCSV = str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
const parseLines = str => str ? str.split('\n').filter(s => s.trim()) : [];

// ----- THEMES -----
function generateCorporateTheme(d) {
  const skills = parseCSV(d.skills);
  const certs = parseLines(d.certifications);
  const langs = parseLines(d.languages);

  return `
  <div class="resume corporate">
    <div class="resume-header">
      ${d.personal.photo ? `<img src="${d.personal.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:1rem;">` : ''}
      <h1>${d.personal.fullName || 'Your Name'}</h1>
      <div>
        ${d.personal.email ? `<span><i class="fas fa-envelope"></i> ${d.personal.email}</span>` : ''}
        ${d.personal.phone ? `<span><i class="fas fa-phone"></i> ${d.personal.phone}</span>` : ''}
        ${d.personal.location ? `<span><i class="fas fa-map-marker-alt"></i> ${d.personal.location}</span>` : ''}
        ${d.personal.linkedin ? `<span><i class="fab fa-linkedin"></i> LinkedIn</span>` : ''}
        ${d.personal.portfolio ? `<span><i class="fas fa-globe"></i> Portfolio</span>` : ''}
        ${d.personal.github ? `<span><i class="fab fa-github"></i> GitHub</span>` : ''}
      </div>
    </div>

    ${d.summary ? section('Professional Summary', `<p>${d.summary}</p>`) : ''}
    ${blockList(d.experience, 'Work Experience', x => expBlock(x))}
    ${blockList(d.education, 'Education', x => eduBlock(x))}
    ${blockList(d.projects, 'Projects', x => projBlock(x))}
    ${skills.length ? section('Skills', listSkills(skills)) : ''}
    ${certs.length ? section('Certifications', listItems(certs)) : ''}
    ${langs.length ? section('Languages', listItems(langs)) : ''}
    ${d.hobbies ? section('Hobbies & Interests', `<p>${d.hobbies}</p>`) : ''}
  </div>
  `;
}

// Theme 2
function generateModernTheme(d) {
  const skills = parseCSV(d.skills);
  const certs = parseLines(d.certifications);
  const langs = parseLines(d.languages);

  return `
  <div class="resume modern">
    <div class="resume-sidebar">
      ${d.personal.photo ? `<img src="${d.personal.photo}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:1.5rem;">` : ''}
      ${section('Contact', contact(d.personal))}
      ${skills.length ? section('Skills', listSkills(skills)) : ''}
      ${langs.length ? section('Languages', listItems(langs)) : ''}
    </div>

    <div class="resume-main">
      <h1>${d.personal.fullName || 'Your Name'}</h1>
      ${d.summary ? section('About Me', `<p>${d.summary}</p>`) : ''}
      ${blockList(d.experience, 'Experience', x => expBlock(x))}
      ${blockList(d.education, 'Education', x => eduBlock(x))}
      ${blockList(d.projects, 'Projects', x => projBlock(x))}
      ${certs.length ? section('Certifications', listItems(certs)) : ''}
    </div>
  </div>`;
}

// Theme 3
function generateAcademicTheme(d) {
  const skills = parseCSV(d.skills);
  const certs = parseLines(d.certifications);
  const langs = parseLines(d.languages);

  return `
  <div class="resume academic">
    <h1>${d.personal.fullName || 'Your Name'}</h1>
    ${contact(d.personal)}
    ${d.summary ? section('Objective', `<p>${d.summary}</p>`) : ''}
    ${blockList(d.education, 'Education', x => eduBlock(x))}
    ${blockList(d.experience, 'Experience', x => expBlock(x))}
    ${blockList(d.projects, 'Research & Projects', x => projBlock(x))}
    ${skills.length ? section('Skills & Competencies', listSkills(skills)) : ''}
    ${certs.length ? section('Certifications', listItems(certs)) : ''}
    ${langs.length ? section('Languages', `<p>${langs.join(' • ')}</p>`) : ''}
  </div>`;
}

// UI helpers
const section = (title, body) => `<div class="resume-section"><h2>${title}</h2>${body}</div>`;
const listItems = arr => `<ul>${arr.map(i => `<li>${i}</li>`).join('')}</ul>`;
const listSkills = arr => `<div class="resume-skills">${arr.map(s => `<span>${s}</span>`).join('')}</div>`;
const contact = p => [p.email, p.phone, p.location].filter(Boolean).map(i => `<div>${i}</div>`).join('');
const blockList = (arr, title, fn) => arr?.length ? section(title, arr.map(fn).join('')) : '';
const expBlock = x => rowBlock(x.title, x.company, x);
const eduBlock = x => rowBlock(x.degree, x.institution, x);
const projBlock = x => rowBlock(x.name, x.technologies, x, x.link);

// Format blocks
function rowBlock(head, sub, d, link) {
  return `
  <div class="resume-item">
    <div class="resume-item-header">
      <div><div class="resume-item-title">${head}</div><div>${sub || ''}</div></div>
      <div>${d.startDate} - ${d.endDate}</div>
    </div>
    ${d.description ? `<div>${d.description}</div>` : ''}
    ${link ? `<a href="${link}">View Project</a>` : ''}
  </div>`;
}

// New resume
function startNewResume() {
  if (confirm('Start new resume?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

// Loader
const showLoading = () => $('#loadingOverlay').addClass('active');
const hideLoading = () => $('#loadingOverlay').removeClass('active');

// Exports
function downloadPDF() {
  showLoading();
  const el = $('#finalPreview .resume')[0];
  if (!el) return alert('No resume found'), hideLoading();
  html2pdf().set({
    margin: 10,
    filename: `${APP_STATE.formData.personal.fullName || 'resume'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(el).save().then(hideLoading);
}

function downloadPNG() {
  showLoading();
  const el = $('#finalPreview .resume')[0];
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' })
  .then(c => c.toBlob(b => { saveAs(b, 'resume.png'); hideLoading(); }));
}

function downloadDOCX() {
  showLoading();
  try {
    const d = APP_STATE.formData;
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
    const sec = [];

    sec.push(new Paragraph({ text: d.personal.fullName || 'Your Name', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
    const contact = [d.personal.email, d.personal.phone, d.personal.location].filter(Boolean).join(' | ');
    if (contact) sec.push(new Paragraph({ text: contact, alignment: AlignmentType.CENTER }));
    sec.push(new Paragraph({ text: '' }));

    if (d.summary) {
      sec.push(new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_2 }));
      sec.push(new Paragraph({ text: d.summary }), new Paragraph({ text: '' }));
    }

    const addBlock = (title, arr, fn) => {
      if (!arr.length) return;
      sec.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }));
      arr.forEach(fn);
    };

    addBlock('WORK EXPERIENCE', d.experience, x => {
      sec.push(
        new Paragraph({ children: [new TextRun({ text: x.title, bold: true }), new TextRun(` - ${x.company}`)] }),
        new Paragraph(`${x.startDate} - ${x.endDate}`),
        new Paragraph(x.description || ''), new Paragraph('')
      );
    });

    addBlock('EDUCATION', d.education, x => {
      sec.push(
        new Paragraph({ children: [new TextRun({ text: x.degree, bold: true })] }),
        new Paragraph(x.institution),
        new Paragraph(`${x.startDate} - ${x.endDate}`), new Paragraph('')
      );
    });

    addBlock('PROJECTS', d.projects, x => {
      sec.push(
        new Paragraph({ children: [new TextRun({ text: x.name, bold: true })] }),
        new Paragraph(x.technologies || ''),
        new Paragraph(x.description || ''), new Paragraph('')
      );
    });

    if (d.skills) {
      sec.push(new Paragraph({ text: 'SKILLS', heading: HeadingLevel.HEADING_2 }));
      sec.push(new Paragraph(d.skills));
    }

    docx.Packer.toBlob(new Document({ sections: [{ children: sec }] }))
      .then(b => { saveAs(b, 'resume.docx'); hideLoading(); });

  } catch {
    alert('Error creating DOCX');
    hideLoading();
  }
}
