/* ===================================
   RESUME BUILDER - FORM PAGE JS
   Form wizard, localStorage, live preview
   =================================== */

// ===================================
// GLOBAL STATE
// ===================================
const APP_STATE = {
    currentStep: 1,
    totalSteps: 7,
    selectedTheme: localStorage.getItem('selectedTheme') || 'corporate',
    formData: {
        personal: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            portfolio: '',
            github: '',
            photo: ''
        },
        summary: '',
        education: [],
        experience: [],
        projects: [],
        skills: '',
        certifications: '',
        languages: '',
        hobbies: ''
    }
};

// Item counters for dynamic lists
let educationCounter = 0;
let experienceCounter = 0;
let projectCounter = 0;

// ===================================
// INITIALIZATION
// ===================================
$(document).ready(function() {
    console.log('Form page initialized');
    
    // Load saved data from localStorage
    loadFromLocalStorage();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Render initial preview
    renderPreview();
});

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
    // Form navigation
    $('#nextStepBtn').on('click', nextStep);
    $('#prevStepBtn').on('click', prevStep);
    $('#finishBtn').on('click', finishForm);
    
    // Progress step clicking
    $('.progress-step').on('click', function() {
        const step = parseInt($(this).data('step'));
        if (step <= APP_STATE.currentStep) {
            goToStep(step);
        }
    });
    
    // Dynamic form items
    $('.add-item-btn').on('click', function() {
        const type = $(this).data('type');
        addDynamicItem(type);
    });
    
    // Form input changes - update preview and save
    $(document).on('input change', '.form-input, .form-textarea', function() {
        updateFormData();
        saveToLocalStorage();
        renderPreview();
    });
    
    // Photo upload
    $('#photo').on('change', handlePhotoUpload);
    
    // Mobile preview toggle
    $('#togglePreviewBtn').on('click', toggleMobilePreview);
    $('#closePreviewBtn').on('click', closeMobilePreview);
}

// ===================================
// FORM WIZARD NAVIGATION
// ===================================
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (APP_STATE.currentStep < APP_STATE.totalSteps) {
        APP_STATE.currentStep++;
        updateStepDisplay();
    }
}

function prevStep() {
    if (APP_STATE.currentStep > 1) {
        APP_STATE.currentStep--;
        updateStepDisplay();
    }
}

function goToStep(step) {
    APP_STATE.currentStep = step;
    updateStepDisplay();
}

function updateStepDisplay() {
    $('.form-step').removeClass('active');
    $(`.form-step[data-step="${APP_STATE.currentStep}"]`).addClass('active');
    
    const progressPercent = (APP_STATE.currentStep / APP_STATE.totalSteps) * 100;
    $('#progressFill').css('width', `${progressPercent}%`);
    
    $('.progress-step').each(function() {
        const stepNum = parseInt($(this).data('step'));
        $(this).removeClass('active completed');
        
        if (stepNum === APP_STATE.currentStep) {
            $(this).addClass('active');
        } else if (stepNum < APP_STATE.currentStep) {
            $(this).addClass('completed');
        }
    });
    
    if (APP_STATE.currentStep === 1) {
        $('#prevStepBtn').hide();
    } else {
        $('#prevStepBtn').show();
    }
    
    if (APP_STATE.currentStep === APP_STATE.totalSteps) {
        $('#nextStepBtn').hide();
        $('#finishBtn').show();
    } else {
        $('#nextStepBtn').show();
        $('#finishBtn').hide();
    }
    
    $('.form-content').scrollTop(0);
}

// ===================================
// FORM VALIDATION
// ===================================
function validateCurrentStep() {
    let isValid = true;
    let errorMessage = '';
    
    switch(APP_STATE.currentStep) {
        case 1:
            if (!$('#fullName').val().trim()) {
                errorMessage = 'Please enter your full name';
                isValid = false;
            } else if (!$('#email').val().trim()) {
                errorMessage = 'Please enter your email';
                isValid = false;
            } else if (!$('#phone').val().trim()) {
                errorMessage = 'Please enter your phone number';
                isValid = false;
            }
            break;
            
        case 2:
            if (!$('#summary').val().trim()) {
                errorMessage = 'Please enter a professional summary';
                isValid = false;
            }
            break;
            
        case 6:
            if (!$('#skills').val().trim()) {
                errorMessage = 'Please enter at least one skill';
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        alert(errorMessage);
    }
    
    return isValid;
}

// ===================================
// DYNAMIC FORM ITEMS
// ===================================
function addDynamicItem(type) {
    let html = '';
    let counter = 0;
    let listId = '';
    
    switch(type) {
        case 'education':
            counter = ++educationCounter;
            listId = 'educationList';
            html = createEducationForm(counter);
            break;
            
        case 'experience':
            counter = ++experienceCounter;
            listId = 'experienceList';
            html = createExperienceForm(counter);
            break;
            
        case 'project':
            counter = ++projectCounter;
            listId = 'projectsList';
            html = createProjectForm(counter);
            break;
    }
    
    $(`#${listId}`).append(html);
    
    $(`#${listId}`).find('.remove-item-btn').last().on('click', function() {
        $(this).closest('.dynamic-item').remove();
        updateFormData();
        saveToLocalStorage();
        renderPreview();
    });
}

function createEducationForm(id) {
    return `
        <div class="dynamic-item" data-id="${id}">
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Education #${id}</span>
                <button type="button" class="remove-item-btn">Remove</button>
            </div>
            <div class="form-group">
                <label>Degree / Certificate</label>
                <input type="text" class="form-input education-degree" placeholder="e.g., Bachelor of Science in Computer Science">
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="form-input education-institution" placeholder="e.g., University Name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="text" class="form-input education-start" placeholder="e.g., Aug 2018">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="text" class="form-input education-end" placeholder="e.g., May 2022 or Present">
                </div>
            </div>
            <div class="form-group">
                <label>Description (Optional)</label>
                <textarea class="form-textarea education-description" rows="3" placeholder="GPA, achievements, relevant coursework..."></textarea>
            </div>
        </div>
    `;
}

function createExperienceForm(id) {
    return `
        <div class="dynamic-item" data-id="${id}">
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Experience #${id}</span>
                <button type="button" class="remove-item-btn">Remove</button>
            </div>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="form-input experience-title" placeholder="e.g., Software Engineer">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="form-input experience-company" placeholder="e.g., Tech Company Inc.">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="text" class="form-input experience-start" placeholder="e.g., Jan 2020">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="text" class="form-input experience-end" placeholder="e.g., Dec 2022 or Present">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-textarea experience-description" rows="4" placeholder="Describe your responsibilities and achievements..."></textarea>
            </div>
        </div>
    `;
}

function createProjectForm(id) {
    return `
        <div class="dynamic-item" data-id="${id}">
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Project #${id}</span>
                <button type="button" class="remove-item-btn">Remove</button>
            </div>
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" class="form-input project-name" placeholder="e.g., E-commerce Platform">
            </div>
            <div class="form-group">
                <label>Technologies Used</label>
                <input type="text" class="form-input project-tech" placeholder="e.g., React, Node.js, MongoDB">
            </div>
            <div class="form-group">
                <label>Project Link (Optional)</label>
                <input type="url" class="form-input project-link" placeholder="https://github.com/username/project">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-textarea project-description" rows="3" placeholder="Describe the project, your role, and outcomes..."></textarea>
            </div>
        </div>
    `;
}

// ===================================
// FORM DATA MANAGEMENT
// ===================================
function updateFormData() {
    APP_STATE.formData.personal = {
        fullName: $('#fullName').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        location: $('#location').val(),
        linkedin: $('#linkedin').val(),
        portfolio: $('#portfolio').val(),
        github: $('#github').val(),
        photo: APP_STATE.formData.personal.photo
    };
    
    APP_STATE.formData.summary = $('#summary').val();
    
    APP_STATE.formData.education = [];
    $('#educationList .dynamic-item').each(function() {
        APP_STATE.formData.education.push({
            degree: $(this).find('.education-degree').val(),
            institution: $(this).find('.education-institution').val(),
            startDate: $(this).find('.education-start').val(),
            endDate: $(this).find('.education-end').val(),
            description: $(this).find('.education-description').val()
        });
    });
    
    APP_STATE.formData.experience = [];
    $('#experienceList .dynamic-item').each(function() {
        APP_STATE.formData.experience.push({
            title: $(this).find('.experience-title').val(),
            company: $(this).find('.experience-company').val(),
            startDate: $(this).find('.experience-start').val(),
            endDate: $(this).find('.experience-end').val(),
            description: $(this).find('.experience-description').val()
        });
    });
    
    APP_STATE.formData.projects = [];
    $('#projectsList .dynamic-item').each(function() {
        APP_STATE.formData.projects.push({
            name: $(this).find('.project-name').val(),
            technologies: $(this).find('.project-tech').val(),
            link: $(this).find('.project-link').val(),
            description: $(this).find('.project-description').val()
        });
    });
    
    APP_STATE.formData.skills = $('#skills').val();
    APP_STATE.formData.certifications = $('#certifications').val();
    APP_STATE.formData.languages = $('#languages').val();
    APP_STATE.formData.hobbies = $('#hobbies').val();
}

// ===================================
// PHOTO UPLOAD
// ===================================
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            APP_STATE.formData.personal.photo = event.target.result;
            saveToLocalStorage();
            renderPreview();
        };
        reader.readAsDataURL(file);
    }
}

// ===================================
// LOCAL STORAGE
// ===================================
function saveToLocalStorage() {
    try {
        localStorage.setItem('resumeBuilderData', JSON.stringify(APP_STATE));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('resumeBuilderData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            Object.assign(APP_STATE, parsed);
            restoreFormValues();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

function restoreFormValues() {
    $('#fullName').val(APP_STATE.formData.personal.fullName);
    $('#email').val(APP_STATE.formData.personal.email);
    $('#phone').val(APP_STATE.formData.personal.phone);
    $('#location').val(APP_STATE.formData.personal.location);
    $('#linkedin').val(APP_STATE.formData.personal.linkedin);
    $('#portfolio').val(APP_STATE.formData.personal.portfolio);
    $('#github').val(APP_STATE.formData.personal.github);
    
    $('#summary').val(APP_STATE.formData.summary);
    
    APP_STATE.formData.education.forEach((edu, index) => {
        addDynamicItem('education');
        const $item = $('#educationList .dynamic-item').last();
        $item.find('.education-degree').val(edu.degree);
        $item.find('.education-institution').val(edu.institution);
        $item.find('.education-start').val(edu.startDate);
        $item.find('.education-end').val(edu.endDate);
        $item.find('.education-description').val(edu.description);
    });
    
    APP_STATE.formData.experience.forEach((exp, index) => {
        addDynamicItem('experience');
        const $item = $('#experienceList .dynamic-item').last();
        $item.find('.experience-title').val(exp.title);
        $item.find('.experience-company').val(exp.company);
        $item.find('.experience-start').val(exp.startDate);
        $item.find('.experience-end').val(exp.endDate);
        $item.find('.experience-description').val(exp.description);
    });
    
    APP_STATE.formData.projects.forEach((proj, index) => {
        addDynamicItem('project');
        const $item = $('#projectsList .dynamic-item').last();
        $item.find('.project-name').val(proj.name);
        $item.find('.project-tech').val(proj.technologies);
        $item.find('.project-link').val(proj.link);
        $item.find('.project-description').val(proj.description);
    });
    
    $('#skills').val(APP_STATE.formData.skills);
    $('#certifications').val(APP_STATE.formData.certifications);
    $('#languages').val(APP_STATE.formData.languages);
    $('#hobbies').val(APP_STATE.formData.hobbies);
}

// ===================================
// RESUME PREVIEW RENDERING
// ===================================
function renderPreview() {
    const theme = APP_STATE.selectedTheme;
    const html = generateResumeHTML(theme);
    
    $('#resumePreview').html(html);
}

function generateResumeHTML(theme) {
    const data = APP_STATE.formData;
    
    // Different layouts for different themes
    if (theme === 'modern') {
        return generateModernTheme(data);
    } else if (theme === 'academic') {
        return generateAcademicTheme(data);
    } else {
        return generateCorporateTheme(data);
    }
}

function generateCorporateTheme(data) {
    const skills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const certs = data.certifications ? data.certifications.split('\n').filter(s => s.trim()) : [];
    const langs = data.languages ? data.languages.split('\n').filter(s => s.trim()) : [];
    
    return `
        <div class="resume corporate">
            <div class="resume-header">
                ${data.personal.photo ? `<img src="${data.personal.photo}" alt="Profile Photo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">` : ''}
                <h1 class="resume-name">${data.personal.fullName || 'Your Name'}</h1>
                <div class="resume-contact">
                    ${data.personal.email ? `<span class="resume-contact-item"><i class="fas fa-envelope"></i> ${data.personal.email}</span>` : ''}
                    ${data.personal.phone ? `<span class="resume-contact-item"><i class="fas fa-phone"></i> ${data.personal.phone}</span>` : ''}
                    ${data.personal.location ? `<span class="resume-contact-item"><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</span>` : ''}
                    ${data.personal.linkedin ? `<span class="resume-contact-item"><i class="fab fa-linkedin"></i> LinkedIn</span>` : ''}
                    ${data.personal.portfolio ? `<span class="resume-contact-item"><i class="fas fa-globe"></i> Portfolio</span>` : ''}
                    ${data.personal.github ? `<span class="resume-contact-item"><i class="fab fa-github"></i> GitHub</span>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Professional Summary</h2>
                <p>${data.summary}</p>
            </div>
            ` : ''}
            
            ${data.experience.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Work Experience</h2>
                ${data.experience.map(exp => `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div>
                                <div class="resume-item-title">${exp.title}</div>
                                <div class="resume-item-subtitle">${exp.company}</div>
                            </div>
                            <div class="resume-item-date">${exp.startDate} - ${exp.endDate}</div>
                        </div>
                        ${exp.description ? `<div class="resume-item-description">${exp.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${data.education.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Education</h2>
                ${data.education.map(edu => `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div>
                                <div class="resume-item-title">${edu.degree}</div>
                                <div class="resume-item-subtitle">${edu.institution}</div>
                            </div>
                            <div class="resume-item-date">${edu.startDate} - ${edu.endDate}</div>
                        </div>
                        ${edu.description ? `<div class="resume-item-description">${edu.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${data.projects.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Projects</h2>
                ${data.projects.map(proj => `
                    <div class="resume-item">
                        <div class="resume-item-title">${proj.name}</div>
                        ${proj.technologies ? `<div class="resume-item-subtitle">${proj.technologies}</div>` : ''}
                        ${proj.description ? `<div class="resume-item-description">${proj.description}</div>` : ''}
                        ${proj.link ? `<div style="margin-top: 0.5rem;"><a href="${proj.link}" style="color: #3498db;">View Project</a></div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${skills.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Skills</h2>
                <div class="resume-skills">
                    ${skills.map(skill => `<span class="resume-skill">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${certs.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Certifications</h2>
                <ul>
                    ${certs.map(cert => `<li>${cert}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${langs.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Languages</h2>
                <ul>
                    ${langs.map(lang => `<li>${lang}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${data.hobbies ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Hobbies & Interests</h2>
                <p>${data.hobbies}</p>
            </div>
            ` : ''}
        </div>
    `;
}

function generateModernTheme(data) {
    const skills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const certs = data.certifications ? data.certifications.split('\n').filter(s => s.trim()) : [];
    const langs = data.languages ? data.languages.split('\n').filter(s => s.trim()) : [];
    
    return `
        <div class="resume modern">
            <div class="resume-sidebar">
                ${data.personal.photo ? `<img src="${data.personal.photo}" alt="Profile Photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 1.5rem;">` : ''}
                
                <div class="resume-section">
                    <h2 class="resume-section-title">Contact</h2>
                    ${data.personal.email ? `<div class="resume-contact-item" style="margin-bottom: 0.5rem;"><i class="fas fa-envelope"></i> ${data.personal.email}</div>` : ''}
                    ${data.personal.phone ? `<div class="resume-contact-item" style="margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> ${data.personal.phone}</div>` : ''}
                    ${data.personal.location ? `<div class="resume-contact-item" style="margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</div>` : ''}
                </div>
                
                ${skills.length > 0 ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">Skills</h2>
                    <div class="resume-skills">
                        ${skills.map(skill => `<span class="resume-skill">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${langs.length > 0 ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">Languages</h2>
                    <ul style="padding-left: 1.25rem;">
                        ${langs.map(lang => `<li style="margin-bottom: 0.5rem;">${lang}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            
            <div class="resume-main">
                <h1 class="resume-name">${data.personal.fullName || 'Your Name'}</h1>
                
                ${data.summary ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">About Me</h2>
                    <p>${data.summary}</p>
                </div>
                ` : ''}
                
                ${data.experience.length > 0 ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">Experience</h2>
                    ${data.experience.map(exp => `
                        <div class="resume-item">
                            <div class="resume-item-header">
                                <div>
                                    <div class="resume-item-title">${exp.title}</div>
                                    <div class="resume-item-subtitle">${exp.company}</div>
                                </div>
                                <div class="resume-item-date">${exp.startDate} - ${exp.endDate}</div>
                            </div>
                            ${exp.description ? `<div class="resume-item-description">${exp.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">Education</h2>
                    ${data.education.map(edu => `
                        <div class="resume-item">
                            <div class="resume-item-header">
                                <div>
                                    <div class="resume-item-title">${edu.degree}</div>
                                    <div class="resume-item-subtitle">${edu.institution}</div>
                                </div>
                                <div class="resume-item-date">${edu.startDate} - ${edu.endDate}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.projects.length > 0 ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">Projects</h2>
                    ${data.projects.map(proj => `
                        <div class="resume-item">
                            <div class="resume-item-title">${proj.name}</div>
                            ${proj.technologies ? `<div class="resume-item-subtitle">${proj.technologies}</div>` : ''}
                            ${proj.description ? `<div class="resume-item-description">${proj.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${certs.length > 0 ? `
                <div class="resume-section">
                    <h2 class="resume-section-title">Certifications</h2>
                    <ul style="padding-left: 1.25rem;">
                        ${certs.map(cert => `<li style="margin-bottom: 0.5rem;">${cert}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateAcademicTheme(data) {
    const skills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const certs = data.certifications ? data.certifications.split('\n').filter(s => s.trim()) : [];
    const langs = data.languages ? data.languages.split('\n').filter(s => s.trim()) : [];
    
    return `
        <div class="resume academic">
            <div class="resume-header">
                <h1 class="resume-name">${data.personal.fullName || 'Your Name'}</h1>
                <div class="resume-contact">
                    ${data.personal.email ? `<span class="resume-contact-item">${data.personal.email}</span>` : ''}
                    ${data.personal.phone ? `<span class="resume-contact-item">${data.personal.phone}</span>` : ''}
                    ${data.personal.location ? `<span class="resume-contact-item">${data.personal.location}</span>` : ''}
                </div>
            </div>
            
            ${data.summary ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Objective</h2>
                <p>${data.summary}</p>
            </div>
            ` : ''}
            
            ${data.education.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Education</h2>
                ${data.education.map(edu => `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div>
                                <div class="resume-item-title">${edu.degree}</div>
                                <div class="resume-item-subtitle">${edu.institution}</div>
                            </div>
                            <div class="resume-item-date">${edu.startDate} - ${edu.endDate}</div>
                        </div>
                        ${edu.description ? `<div class="resume-item-description">${edu.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${data.experience.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Experience</h2>
                ${data.experience.map(exp => `
                    <div class="resume-item">
                        <div class="resume-item-header">
                            <div>
                                <div class="resume-item-title">${exp.title}</div>
                                <div class="resume-item-subtitle">${exp.company}</div>
                            </div>
                            <div class="resume-item-date">${exp.startDate} - ${exp.endDate}</div>
                        </div>
                        ${exp.description ? `<div class="resume-item-description">${exp.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${data.projects.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Research & Projects</h2>
                ${data.projects.map(proj => `
                    <div class="resume-item">
                        <div class="resume-item-title">${proj.name}</div>
                        ${proj.description ? `<div class="resume-item-description">${proj.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${skills.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Skills & Competencies</h2>
                <div class="resume-skills">
                    ${skills.map(skill => `<span class="resume-skill">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${certs.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Certifications</h2>
                <ul style="padding-left: 1.5rem;">
                    ${certs.map(cert => `<li>${cert}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${langs.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Languages</h2>
                <p>${langs.join(' • ')}</p>
            </div>
            ` : ''}
        </div>
    `;
}

// ===================================
// MOBILE PREVIEW TOGGLE
// ===================================
function toggleMobilePreview() {
    $('#previewSection').toggleClass('mobile-active');
    const isActive = $('#previewSection').hasClass('mobile-active');
    $('#togglePreviewBtn').html(isActive ? '<i class="fas fa-eye-slash"></i> Hide Preview' : '<i class="fas fa-eye"></i> Show Preview');
}

function closeMobilePreview() {
    $('#previewSection').removeClass('mobile-active');
    $('#togglePreviewBtn').html('<i class="fas fa-eye"></i> Show Preview');
}

// ===================================
// FINISH FORM
// ===================================
function finishForm() {
    if (!validateCurrentStep()) {
        return;
    }
    
    updateFormData();
    saveToLocalStorage();
    window.location.href = 'preview.html';
}
