/* ==========================================================
   MIXCERTIFICATE 2.0 - DYNAMIC INTERACTIVE LOGIC (app.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ------------------------------------------------------
    const state = {
        currentTheme: 'dark',
        zoomScale: 1.0,
        isCsvLoaded: false,
        activeTemplateId: 'modern-corporate',
        csvRecordCount: 0,
        csvFileName: '',
        dashboardCounters: {
            totalIssued: 48150,
            verifications: 24198
        }
    };

    // ------------------------------------------------------
    // 2. DOM ELEMENTS CACHE
    // ------------------------------------------------------
    const UI = {
        toastContainer: document.getElementById('toast-container'),
        loginScreen: document.getElementById('login-screen'),
        appWorkspace: document.getElementById('app-workspace'),
        authForm: document.getElementById('auth-form'),
        btnLoginSubmit: document.getElementById('btn-login-submit'),
        sidebarMenuItems: document.querySelectorAll('.menu-item'),
        currentViewTitle: document.getElementById('current-view-title'),
        workspaceSections: document.querySelectorAll('.workspace-section'),
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),
        btnLogout: document.getElementById('btn-logout'),
        btnQuickCreate: document.getElementById('btn-quick-create'),
        
        // Mobile Navigation Elements
        mobileMenuTrigger: document.getElementById('mobile-menu-trigger'),
        mobileMenuClose: document.getElementById('mobile-menu-close'),
        sidebar: document.querySelector('.sidebar'),

        // Dashboard View Counters
        statIssuedCounter: document.getElementById('stat-issued-counter'),
        statVerifiedCounter: document.getElementById('stat-verified-counter'),

        // Certificate Creator Form Controls
        fieldCertTitle: document.getElementById('field-cert-title'),
        fieldRecipient: document.getElementById('field-recipient'),
        fieldDescription: document.getElementById('field-description'),
        fieldDate: document.getElementById('field-date'),
        inputBorderStyle: document.getElementById('input-border-style'),
        colorDots: document.querySelectorAll('.color-dot'),
        toggleQrCode: document.getElementById('toggle-qr-code'),
        toggleWatermark: document.getElementById('toggle-watermark'),
        fieldWatermarkText: document.getElementById('field-watermark-text'),
        watermarkTextRow: document.getElementById('watermark-text-row'),
        
        // Canvas Live Elements
        liveCanvas: document.getElementById('live-certificate-canvas'),
        canvasWatermark: document.getElementById('canvas-watermark'),
        canvasHeaderTitle: document.getElementById('canvas-header-title'),
        canvasRecipientName: document.getElementById('canvas-recipient-name'),
        canvasDescription: document.getElementById('canvas-description'),
        canvasDate: document.getElementById('canvas-date'),
        canvasQrWrapper: document.getElementById('canvas-qr-wrapper'),
        canvasVerifIdLabel: document.getElementById('canvas-verif-id-label'),
        canvasViewport: document.getElementById('canvas-viewport'),

        // Zoom & Canvas Top Actions
        btnZoomIn: document.getElementById('btn-zoom-in'),
        btnZoomOut: document.getElementById('btn-zoom-out'),
        zoomPercent: document.getElementById('zoom-percent'),
        btnPreviewEmail: document.getElementById('btn-preview-email'),
        btnExportOptions: document.getElementById('btn-export-options'),

        // Modals
        modalExport: document.getElementById('modal-export'),
        btnCloseExportModal: document.getElementById('btn-close-export-modal'),
        btnDownloadPdf: document.getElementById('btn-download-pdf'),
        btnDownloadPng: document.getElementById('btn-download-png'),

        modalBulkProgress: document.getElementById('modal-bulk-progress'),
        bulkProgressBar: document.getElementById('bulk-progress-bar'),
        bulkProgressPercent: document.getElementById('bulk-progress-percent'),
        bulkProgressTitle: document.getElementById('bulk-progress-title'),
        bulkStatSent: document.getElementById('bulk-stat-sent'),
        bulkStatTotal: document.getElementById('bulk-stat-total'),
        bulkStatFailures: document.getElementById('bulk-stat-failures'),

        // CSV Bulk Section
        csvDragDrop: document.getElementById('csv-drag-drop'),
        btnMockCsvSelect: document.getElementById('btn-mock-csv-select'),
        csvStatusCard: document.getElementById('csv-status-card'),
        csvFileNameLabel: document.getElementById('csv-file-name'),
        csvFileDetailsLabel: document.getElementById('csv-file-details'),
        btnRemoveCsv: document.getElementById('btn-remove-csv'),

        // Templates Selection
        templateFilterPills: document.getElementById('template-filter-pills'),
        templateCardGrid: document.getElementById('template-card-grid')
    };

    // ------------------------------------------------------
    // 3. TOAST SYSTEM
    // ------------------------------------------------------
    const showToast = (title, message, type = 'primary', duration = 4000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === 'warning') {
            iconSvg = `<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else if (type === 'danger') {
            iconSvg = `<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconSvg = `<svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>`;
        }

        toast.innerHTML = `
            ${iconSvg}
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        UI.toastContainer.appendChild(toast);

        // Remove toast on click
        toast.addEventListener('click', () => toast.remove());

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeIn 0.2s reverse forwards';
                setTimeout(() => toast.remove(), 200);
            }
        }, duration);
    };

    // ------------------------------------------------------
    // 4. ANIMATION COUNTERS (COUNT UP)
    // ------------------------------------------------------
    const animateCounters = () => {
        const duration = 1200; // ms
        const steps = 60;
        const stepTime = duration / steps;
        
        let step = 0;
        const targetIssued = state.dashboardCounters.totalIssued;
        const targetVerified = state.dashboardCounters.verifications;

        const timer = setInterval(() => {
            step++;
            const currentIssued = Math.floor((targetIssued / steps) * step);
            const currentVerified = Math.floor((targetVerified / steps) * step);

            UI.statIssuedCounter.textContent = currentIssued.toLocaleString();
            UI.statVerifiedCounter.textContent = currentVerified.toLocaleString();

            if (step >= steps) {
                clearInterval(timer);
                UI.statIssuedCounter.textContent = targetIssued.toLocaleString();
                UI.statVerifiedCounter.textContent = targetVerified.toLocaleString();
            }
        }, stepTime);
    };

    // ------------------------------------------------------
    // 5. THEME SWITCHER
    // ------------------------------------------------------
    const setTheme = (theme) => {
        state.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'light') {
            UI.themeIcon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            `;
            showToast('Appearance Mode Updated', 'Switched to clean Soft Light theme.', 'primary');
        } else {
            UI.themeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            `;
            showToast('Appearance Mode Updated', 'Switched to modern High-Contrast Dark theme.', 'primary');
        }
    };

    UI.themeToggle.addEventListener('click', () => {
        const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    // ------------------------------------------------------
    // 6. ROUTER NAVIGATION
    // ------------------------------------------------------
    const navigateTo = (targetSectionId) => {
        // Toggle Sidebar Active Menu
        UI.sidebarMenuItems.forEach(item => {
            if (item.getAttribute('data-target') === targetSectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all section layouts, show target section
        UI.workspaceSections.forEach(section => {
            if (section.id === targetSectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update Title Bar Text
        let viewTitle = 'Platform Workspace';
        if (targetSectionId === 'dashboard-view') {
            viewTitle = 'Analytics Dashboard';
            animateCounters();
        } else if (targetSectionId === 'templates-view') {
            viewTitle = 'Template Selection Panel';
        } else if (targetSectionId === 'editor-view') {
            viewTitle = 'Certificate Studio Editor';
        }
        UI.currentViewTitle.textContent = viewTitle;

        // Auto Close Mobile Sidebar Drawer if active
        UI.sidebar.classList.remove('active');
    };

    // Sidebar navigation click handlers
    UI.sidebarMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            navigateTo(target);
        });
    });

    // Header Quick Create button
    UI.btnQuickCreate.addEventListener('click', () => {
        navigateTo('editor-view');
        showToast('New Campaign Initiated', 'Customize your blank certificate in the studio.', 'success');
    });

    // Mobile Sidebar Toggles
    UI.mobileMenuTrigger.addEventListener('click', () => {
        UI.sidebar.classList.add('active');
    });
    UI.mobileMenuClose.addEventListener('click', () => {
        UI.sidebar.classList.remove('active');
    });

    // ------------------------------------------------------
    // 7. SECURE AUTHENTICATION FLOW (LOGIN & LOGOUT)
    // ------------------------------------------------------
    // Password visibility toggle
    const passwordToggleBtn = document.querySelector('.password-toggle-btn');
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('pass-eye-icon');

    passwordToggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        if (isPassword) {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    });

    // Sign-in processing simulation
    UI.authForm.addEventListener('submit', () => {
        const email = document.getElementById('login-email').value;
        UI.btnLoginSubmit.classList.add('disabled');
        UI.btnLoginSubmit.querySelector('span').textContent = 'Authenticating Organization...';
        
        // Premium login validation delays
        setTimeout(() => {
            UI.loginScreen.classList.remove('active');
            UI.appWorkspace.classList.add('active');
            
            showToast('Authorization Successful', `Welcome back, Nikitha Reddy. System environment is ready.`, 'success');
            animateCounters();
            
            // Restore button text
            UI.btnLoginSubmit.classList.remove('disabled');
            UI.btnLoginSubmit.querySelector('span').textContent = 'Sign In to Platform';
        }, 1200);
    });

    // Logout processing
    UI.btnLogout.addEventListener('click', () => {
        showToast('Terminating Session', 'Clearing credentials cache securely...', 'warning');
        
        setTimeout(() => {
            UI.appWorkspace.classList.remove('active');
            UI.loginScreen.classList.add('active');
            showToast('Session Terminated', 'You have logged out of the MixCertificate workspace.', 'success');
        }, 800);
    });

    // ------------------------------------------------------
    // 8. DYNAMIC STUDIO EDITOR LIVE BINDING
    // ------------------------------------------------------
    
    // Live Input Event Listeners
    UI.fieldCertTitle.addEventListener('input', (e) => {
        UI.canvasHeaderTitle.textContent = e.target.value.toUpperCase();
    });

    UI.fieldRecipient.addEventListener('input', (e) => {
        UI.canvasRecipientName.textContent = e.target.value;
    });

    UI.fieldDescription.addEventListener('input', (e) => {
        UI.canvasDescription.textContent = e.target.value;
    });

    UI.fieldDate.addEventListener('input', (e) => {
        UI.canvasDate.textContent = e.target.value;
    });

    // Border Switch Handler
    UI.inputBorderStyle.addEventListener('change', (e) => {
        // Clear all border styles
        UI.liveCanvas.classList.remove('border-double', 'border-geometric', 'border-thin', 'border-none');
        // Add selected
        UI.liveCanvas.classList.add(e.target.value);
        showToast('Border Layout Modified', `Applied ${e.target.options[e.target.selectedIndex].text} border.`, 'primary');
    });

    // Theme Color Picker Handler
    UI.colorDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            // Remove active state
            UI.colorDots.forEach(d => d.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            
            const colorCode = e.target.getAttribute('data-color');
            
            // Clear prior canvas classes
            UI.liveCanvas.classList.remove(
                'theme-color-indigo', 'theme-color-emerald', 
                'theme-color-amber', 'theme-color-rose', 'theme-color-dark'
            );

            // Add class representing theme selection
            if (colorCode === '#6366f1') UI.liveCanvas.classList.add('theme-color-indigo');
            if (colorCode === '#10b981') UI.liveCanvas.classList.add('theme-color-emerald');
            if (colorCode === '#d97706') UI.liveCanvas.classList.add('theme-color-amber');
            if (colorCode === '#be185d') UI.liveCanvas.classList.add('theme-color-rose');
            if (colorCode === '#0f172a') UI.liveCanvas.classList.add('theme-color-dark');

            // Recalculate colors inside canvas preview dynamically
            UI.liveCanvas.style.setProperty('--accent-rgb', hexToRgb(colorCode));

            showToast('Accent Color Updated', `Applied dynamic canvas theme styling.`, 'success');
        });
    });

    // Helper to calculate HSL/RGB from HEX
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16)
            : "99,102,241";
    }

    // QR Code Toggle
    UI.toggleQrCode.addEventListener('change', (e) => {
        if (e.target.checked) {
            UI.canvasQrWrapper.classList.remove('hidden');
        } else {
            UI.canvasQrWrapper.classList.add('hidden');
        }
    });

    // Watermark Overlay Toggle
    UI.toggleWatermark.addEventListener('change', (e) => {
        if (e.target.checked) {
            UI.canvasWatermark.classList.add('active');
            UI.watermarkTextRow.classList.remove('hidden');
        } else {
            UI.canvasWatermark.classList.remove('active');
            UI.watermarkTextRow.classList.add('hidden');
        }
    });

    UI.fieldWatermarkText.addEventListener('input', (e) => {
        UI.canvasWatermark.textContent = e.target.value.toUpperCase();
    });

    // Logo & Signature upload boxes trigger click alerts
    document.getElementById('stub-logo-upload').addEventListener('click', () => {
        showToast('Asset Import Triggered', 'Select standard transparent PNG / SVG logo to display at the header.', 'primary');
    });
    document.getElementById('stub-sig-upload').addEventListener('click', () => {
        showToast('Asset Import Triggered', 'Select official signature PNG transparent graphic.', 'primary');
    });

    // ------------------------------------------------------
    // 9. ZOOM & PREVIEW CANVAS OPTIONS
    // ------------------------------------------------------
    UI.btnZoomIn.addEventListener('click', () => {
        if (state.zoomScale < 1.3) {
            state.zoomScale += 0.1;
            updateZoom();
        }
    });
    UI.btnZoomOut.addEventListener('click', () => {
        if (state.zoomScale > 0.7) {
            state.zoomScale -= 0.1;
            updateZoom();
        }
    });

    const updateZoom = () => {
        UI.zoomPercent.textContent = `${Math.round(state.zoomScale * 100)}%`;
        UI.liveCanvas.style.transform = `scale(${state.zoomScale})`;
    };

    // ------------------------------------------------------
    // 10. TEMPLATES GALLERY INTERACTIVE PICKER
    // ------------------------------------------------------
    
    // Filter template cards
    const filterPills = UI.templateFilterPills.querySelectorAll('.pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            filterPills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.getAttribute('data-filter');
            const cards = UI.templateCardGrid.querySelectorAll('.template-card');
            
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Select template action
    const selectTemplateBtns = document.querySelectorAll('.btn-select-template');
    selectTemplateBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const templateId = e.target.getAttribute('data-template');
            state.activeTemplateId = templateId;
            
            // Set fields based on selections
            if (templateId === 'classic-academic') {
                UI.fieldCertTitle.value = "CERTIFICATE OF MASTER DEGREE";
                UI.fieldRecipient.value = "Alasdair Sterling";
                UI.fieldDescription.value = "Having successfully demonstrated advanced scientific research criteria and completed the thesis defense in Cyber-Physical Architecture Systems with distinguished honors.";
                UI.fieldDate.value = "June 12, 2026";
                UI.inputBorderStyle.value = "border-double";
                
                // Trigger active color change manually
                UI.colorDots.forEach(d => {
                    if (d.getAttribute('data-color') === '#be185d') d.click();
                });
            } else if (templateId === 'modern-corporate') {
                UI.fieldCertTitle.value = "CERTIFICATE OF EXCELLENCE";
                UI.fieldRecipient.value = "Olivia Vance";
                UI.fieldDescription.value = "For exceptionally mastering the Artificial Intelligence Deep Learning 60-Hour Certification Course, demonstrating exceptional competence in neural architectures.";
                UI.fieldDate.value = "May 18, 2026";
                UI.inputBorderStyle.value = "border-geometric";
                UI.colorDots.forEach(d => {
                    if (d.getAttribute('data-color') === '#6366f1') d.click();
                });
            } else if (templateId === 'creative-appreciation') {
                UI.fieldCertTitle.value = "HONORARY COMMENDATION OF MERIT";
                UI.fieldRecipient.value = "Elowen Brooks";
                UI.fieldDescription.value = "For inspiring contribution to community open-source graphics, delivering stunning illustration assets and assisting worldwide students during global design workshops.";
                UI.fieldDate.value = "April 08, 2026";
                UI.inputBorderStyle.value = "border-none";
                UI.colorDots.forEach(d => {
                    if (d.getAttribute('data-color') === '#d97706') d.click();
                });
            } else if (templateId === 'tech-minimalist') {
                UI.fieldCertTitle.value = "CERTIFICATE OF COMPLETION";
                UI.fieldRecipient.value = "Kaelen Chen";
                UI.fieldDescription.value = "For scoring 100% in the Advanced Rust Memory Safety and Compiler Optimizations module, completing all verified code reviews.";
                UI.fieldDate.value = "May 02, 2026";
                UI.inputBorderStyle.value = "border-thin";
                UI.colorDots.forEach(d => {
                    if (d.getAttribute('data-color') === '#0f172a') d.click();
                });
            }

            // Sync form variables manually with previews
            UI.canvasHeaderTitle.textContent = UI.fieldCertTitle.value.toUpperCase();
            UI.canvasRecipientName.textContent = UI.fieldRecipient.value;
            UI.canvasDescription.textContent = UI.fieldDescription.value;
            UI.canvasDate.textContent = UI.fieldDate.value;
            UI.inputBorderStyle.dispatchEvent(new Event('change'));

            navigateTo('editor-view');
            showToast('Template Imported Successfully', `Ready to edit "${e.target.parentNode.querySelector('h4').textContent}" design.`, 'success');
        });
    });

    // ------------------------------------------------------
    // 11. CSV FILE UPLOADER & BULK QUEUE ACTIONS
    // ------------------------------------------------------
    
    // Simulate select CSV
    UI.btnMockCsvSelect.addEventListener('click', () => {
        simulateCsvLoad('recipients_list_2026.csv', 124);
    });

    // Handle HTML5 Drag over animations
    UI.csvDragDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        UI.csvDragDrop.style.borderColor = 'var(--color-primary)';
        UI.csvDragDrop.style.backgroundColor = 'var(--color-glass-overlay)';
    });

    UI.csvDragDrop.addEventListener('dragleave', () => {
        UI.csvDragDrop.style.borderColor = 'var(--color-success)';
        UI.csvDragDrop.style.backgroundColor = 'rgba(16, 185, 129, 0.02)';
    });

    UI.csvDragDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        UI.csvDragDrop.style.borderColor = 'var(--color-success)';
        UI.csvDragDrop.style.backgroundColor = 'rgba(16, 185, 129, 0.02)';
        
        simulateCsvLoad('hacker_summit_roster.csv', 485);
    });

    const simulateCsvLoad = (filename, count) => {
        state.isCsvLoaded = true;
        state.csvFileName = filename;
        state.csvRecordCount = count;

        UI.csvDragDrop.classList.add('hidden');
        UI.csvStatusCard.classList.remove('hidden');

        UI.csvFileNameLabel.textContent = filename;
        UI.csvFileDetailsLabel.textContent = `${count} verified records found successfully.`;

        showToast('Bulk Recipient List Loaded', `Parsed ${count} emails from ${filename} queue.`, 'success');

        // Dynamically add a temporary "Sending..." preview element to Dashboard campaign list to show absolute fidelity!
        const tableBody = document.querySelector('.data-table tbody');
        const newRow = document.createElement('tr');
        newRow.id = 'temp-campaign-row';
        newRow.innerHTML = `
            <td>
                <div class="campaign-cell">
                    <span class="campaign-title">CSV: ${filename.replace('.csv', '')}</span>
                    <span class="campaign-meta">Custom Template • Loaded in queue</span>
                </div>
            </td>
            <td>${count}</td>
            <td><span class="badge status-warning">Ready</span></td>
            <td>
                <div class="prog-wrapper">
                    <span class="prog-label" id="dashboard-campaign-prog">0%</span>
                    <div class="progress-bar-container"><div class="progress-fill status-warning" id="dashboard-campaign-bar" style="width: 0%"></div></div>
                </div>
            </td>
        `;
        tableBody.insertBefore(newRow, tableBody.firstChild);
    };

    // Remove CSV
    UI.btnRemoveCsv.addEventListener('click', () => {
        state.isCsvLoaded = false;
        state.csvFileName = '';
        state.csvRecordCount = 0;

        UI.csvStatusCard.classList.add('hidden');
        UI.csvDragDrop.classList.remove('hidden');

        showToast('CSV Queue Cleared', 'Returned to standard single certificate view.', 'warning');

        // Delete temporary row
        const tempRow = document.getElementById('temp-campaign-row');
        if (tempRow) tempRow.remove();
    });

    // ------------------------------------------------------
    // 12. EMAIL BULK SIMULATOR (RADIAL LOADING PROGRESS)
    // ------------------------------------------------------
    UI.btnPreviewEmail.addEventListener('click', () => {
        if (!state.isCsvLoaded) {
            showToast(
                'Distribution Blocked', 
                'Please upload a recipient list CSV first to trigger bulk email campaigns.', 
                'danger'
            );
            return;
        }

        // Trigger simulator modal
        UI.modalBulkProgress.classList.add('active');
        UI.bulkStatTotal.textContent = state.csvRecordCount;
        UI.bulkStatSent.textContent = '0';
        UI.bulkStatFailures.textContent = '0';
        UI.bulkProgressBar.style.width = '0%';
        UI.bulkProgressPercent.textContent = '0%';
        UI.bulkProgressTitle.textContent = 'Securing signature coordinates and hashing nodes...';

        let progress = 0;
        const total = state.csvRecordCount;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                UI.bulkProgressBar.style.width = '100%';
                UI.bulkProgressPercent.textContent = '100%';
                UI.bulkStatSent.textContent = total;
                UI.bulkProgressTitle.textContent = 'Finalizing verification API entries...';

                setTimeout(() => {
                    UI.modalBulkProgress.classList.remove('active');
                    showToast(
                        'Bulk Delivery Complete', 
                        `Successfully signed, generated, and delivered ${total} certificates securely to recipient inboxes.`, 
                        'success'
                    );

                    // Update Dashboard Stats Counters!
                    state.dashboardCounters.totalIssued += total;
                    state.dashboardCounters.verifications += Math.floor(total * 0.4);
                    animateCounters();

                    // Update Dashboard Campaign Row State!
                    const dashboardProg = document.getElementById('dashboard-campaign-prog');
                    const dashboardBar = document.getElementById('dashboard-campaign-bar');
                    const tempRow = document.getElementById('temp-campaign-row');
                    if (dashboardProg && dashboardBar && tempRow) {
                        dashboardProg.textContent = '100%';
                        dashboardBar.style.width = '100%';
                        dashboardBar.classList.remove('status-warning');
                        dashboardBar.classList.add('status-success');
                        
                        const badge = tempRow.querySelector('.badge');
                        badge.className = 'badge status-success';
                        badge.textContent = 'Completed';
                    }

                }, 1000);
            } else {
                UI.bulkProgressBar.style.width = `${progress}%`;
                UI.bulkProgressPercent.textContent = `${progress}%`;
                
                const sentCount = Math.floor((total / 100) * progress);
                UI.bulkStatSent.textContent = sentCount;

                if (progress < 30) {
                    UI.bulkProgressTitle.textContent = `Generating high-res graphics layouts (${sentCount}/${total})...`;
                } else if (progress < 70) {
                    UI.bulkProgressTitle.textContent = `Signing keys and compiling Dynamic QR Codes (${sentCount}/${total})...`;
                } else {
                    UI.bulkProgressTitle.textContent = `Sending secure TLS emails to recipients (${sentCount}/${total})...`;
                }
            }
        }, 150);
    });

    // ------------------------------------------------------
    // 13. EXPORT MODAL FLOW
    // ------------------------------------------------------
    UI.btnExportOptions.addEventListener('click', () => {
        UI.modalExport.classList.add('active');
    });

    UI.btnCloseExportModal.addEventListener('click', () => {
        UI.modalExport.classList.remove('active');
    });

    // Modal background click closes
    UI.modalExport.addEventListener('click', (e) => {
        if (e.target === UI.modalExport) {
            UI.modalExport.classList.remove('active');
        }
    });

    // PNG Download simulator
    UI.btnDownloadPng.addEventListener('click', () => {
        UI.modalExport.classList.remove('active');
        showToast('Exporting High-Res PNG', 'Compressing layout coordinates and exporting lossless PNG image...', 'primary');
        
        setTimeout(() => {
            showToast('PNG Download Completed', `Saved certificate for "${UI.fieldRecipient.value}" as image graphic successfully.`, 'success');
        }, 1500);
    });

    // PDF Download simulator
    UI.btnDownloadPdf.addEventListener('click', () => {
        UI.modalExport.classList.remove('active');
        showToast('Exporting Premium PDF', 'Generating vector coordinates and compiling print-ready PDF document...', 'primary');
        
        setTimeout(() => {
            showToast('PDF Export Completed', `Saved print-ready PDF layout for "${UI.fieldRecipient.value}" successfully.`, 'success');
        }, 1800);
    });

    // ------------------------------------------------------
    // 14. SVG INTERACTIVE VELOCITY CHART TOOLTIP
    // ------------------------------------------------------
    const chartPoints = document.querySelectorAll('.chart-point');
    const chartTooltip = document.getElementById('chart-tooltip');

    chartPoints.forEach(point => {
        point.addEventListener('mouseenter', (e) => {
            const val = e.target.getAttribute('data-value');
            const month = e.target.getAttribute('data-month');
            
            // Get coordinates relative to SVG scroller parent
            const rect = e.target.getBoundingClientRect();
            const parentRect = e.target.closest('.chart-content').getBoundingClientRect();
            
            const x = rect.left - parentRect.left + rect.width / 2;
            const y = rect.top - parentRect.top;

            chartTooltip.innerHTML = `<strong>${month}</strong>: ${val} Issued`;
            chartTooltip.style.left = `${x}px`;
            chartTooltip.style.top = `${y}px`;
            chartTooltip.style.opacity = '1';
        });

        point.addEventListener('mouseleave', () => {
            chartTooltip.style.opacity = '0';
        });
    });

    // ------------------------------------------------------
    // 15. INITIALIZATION RUNS
    // ------------------------------------------------------
    // Set default theme variables
    setTheme('dark');

});
