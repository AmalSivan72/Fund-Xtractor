import { Component, Input, OnInit, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnChanges {
  @Input() newEntry: any;
  entries: any[] = [];
  activeTOC: any[] = [];
  activeDoc: string = '';
  loadingTOC: boolean = false;
  tocReady: boolean = false;
  searchTerm: string = '';

  // Upload modal state
  pdfFile: File | null = null;
  loadingUpload = false;
  maxDate: string = new Date().toISOString().split('T')[0];

  processingStages: { base: string; company: string; stage: string }[] = [];

  // Edit TOC state/results
  editedRows: any[] = [];
  savingEdited = false;
  lastSavedCsvPath: string = '';
  lastSavedJsonPath: string = '';
  lastSavedHierarchy: any = null;

  // TOC file upload state
  tocFile: File | null = null;
  uploadingTocFile = false;

  constructor(private router: Router, private zone: NgZone) {}

  openUploadModal(): void {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
  }

  onFileChange(event: any): void {
    this.pdfFile = event.target.files[0];
  }

  onTocFileChange(event: any): void {
    this.tocFile = event.target.files[0];
  }

  uploadTocFile(): void {
    if (!this.tocFile) {
      alert('❌ Please select a CSV or JSON file to upload.');
      return;
    }
    if (!this.activeDoc) {
      alert('❌ No active document.');
      return;
    }
    const filename = this.tocFile.name.toLowerCase();
    if (!filename.endsWith('.csv') && !filename.endsWith('.json')) {
      alert('❌ Only CSV (.csv) or JSON (.json) files are accepted.');
      return;
    }

    this.uploadingTocFile = true;
    const formData = new FormData();
    formData.append('file', this.tocFile);
    formData.append('doc', this.activeDoc);

    fetch('http://localhost:5000/api/replace_toc_file', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        this.uploadingTocFile = false;
        if (data.success) {
          this.showToast(`✅ ${data.message}`);
          this.lastSavedCsvPath = filename.endsWith('.csv') ? data.path : '';
          this.lastSavedJsonPath = filename.endsWith('.json') ? data.path : '';

          const modalEl = document.getElementById('tocModal');
          const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          setTimeout(() => {
            const entry = this.getEntryByFilename(this.activeDoc);
            if (entry) this.showTOC(entry);
          }, 500);
        } else {
          alert(`❌ ${data.message || 'Failed to upload TOC file'}`);
        }
      })
      .catch(err => {
        this.uploadingTocFile = false;
        console.error('Upload TOC file error', err);
        alert('❌ Error uploading TOC file.');
      });
  }

  onSubmit(form: any): void {
    this.loadingUpload = true;
    const formData = new FormData();
    formData.append('company', form.value.company);
    formData.append('bse_code', form.value.bse_code);
    formData.append('upload_date', form.value.upload_date);
    formData.append('uploader_name', form.value.uploader_name);
    formData.append('promoter', form.value.promoter);
    formData.append('pdf', this.pdfFile as Blob);

    fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        this.loadingUpload = false;
        if (data.success) {
          const modalEl = document.getElementById('uploadModal');
          const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
          modal?.hide();
          form.resetForm();
          this.pdfFile = null;

          // Ensure status shows as New
          this.entries.unshift({
            ...data.entry,
            status: 'New',
            toc_verified: false,
            processing: false
          });

          localStorage.setItem('recentUploadCompany', data.entry.company);
          this.showToast(`✅ ${data.entry.company} uploaded. Click "View TOC" to verify, then "Process" to begin.`);
        } else {
          alert(`❌ Upload failed: ${data.message}`);
        }
      })
      .catch(err => {
        this.loadingUpload = false;
        alert('❌ Upload error.');
        console.error(err);
      });
  }

  ngOnInit(): void {
    this.loadEntries();
    this.startPollingStages();
    const company = localStorage.getItem('recentUploadCompany');
    if (company) {
      setTimeout(() => {
        const toastBody = document.getElementById('uploadToastBody');
        if (toastBody) {
          toastBody.innerText = `✅ ${company} uploaded. Click "View TOC" to verify, then "Process" to begin analysis.`;
          const toast = new (window as any).bootstrap.Toast(document.getElementById('uploadToast'));
          toast.show();
        }
        localStorage.removeItem('recentUploadCompany');
      }, 500);
    }
    document.getElementById('tocModal')?.addEventListener('hidden.bs.modal', () => {
      this.tocReady = false;
      this.lastSavedCsvPath = '';
      this.lastSavedJsonPath = '';
      this.lastSavedHierarchy = null;
      this.editedRows = [];
      this.tocFile = null;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newEntry'] && this.newEntry) {
      this.entries.unshift({ ...this.newEntry, processing: false });
    }
  }

  get filteredEntries(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.entries;
    return this.entries.filter(entry =>
      entry.company?.toLowerCase().includes(term) ||
      entry.bse_code?.toLowerCase().includes(term) ||
      entry.promoter?.toLowerCase().includes(term)
    );
  }

  loadEntries(): void {
    const processingList: string[] = JSON.parse(localStorage.getItem('processingEntries') || '[]');

    fetch('http://localhost:5000/get_all_dhrps')
      .then(res => res.json())
      .then((data: any[]) => {
        this.entries = data.map((e: any) => {
          // Normalize status text
          const status = (e.status || '').toString();
          const isProcessing =
            processingList.includes(e.pdf_filename) &&
            (status === 'Processing') &&
            e.toc_verified === true;
          return { ...e, status, processing: isProcessing };
        });
      })
      .catch(() => alert('Failed to load DHRP entries.'));
  }

  processEntry(entry: any): void {
    if (entry.processing) return;
    if (!entry.toc_verified) {
      alert(`⚠️ Please verify TOC before processing ${entry.company}`);
      return;
    }

    entry.processing = true;
    entry.status = 'Processing'; // optimistic UI

    const base = entry.pdf_filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const processingList: string[] = JSON.parse(localStorage.getItem('processingEntries') || '[]');
    if (!processingList.includes(entry.pdf_filename)) {
      processingList.push(entry.pdf_filename);
      localStorage.setItem('processingEntries', JSON.stringify(processingList));
    }

    fetch(`http://localhost:5000/process/${base}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.showToast(`${entry.company} is being processed in the background.`);
          this.checkUntilActive(entry);
        } else {
          entry.processing = false;
          this.removeFromProcessing(entry.pdf_filename);
          alert(`❌ Processing failed: ${data.message}`);
        }
      })
      .catch(() => {
        entry.processing = false;
        this.removeFromProcessing(entry.pdf_filename);
        alert('❌ Error during processing');
      });
  }

  removeFromProcessing(filename: string): void {
    const list = JSON.parse(localStorage.getItem('processingEntries') || '[]').filter((f: string) => f !== filename);
    localStorage.setItem('processingEntries', JSON.stringify(list));
  }

  checkUntilActive(entry: any): void {
    const check = () => {
      fetch('http://localhost:5000/get_all_dhrps')
        .then(res => res.json())
        .then((data: any[]) => {
          const updated = data.find((e: any) => e.pdf_filename === entry.pdf_filename);
          if (updated && (updated.status === 'Active' || updated.status === 'Completed')) {
            // Back-end uses Active/Completed — show Completed badge in UI
            entry.status = 'Completed';
            entry.processing = false;
            this.removeFromProcessing(entry.pdf_filename);

            const msg = document.getElementById('completionMessage');
            if (msg) msg.textContent = `✅ Processing completed for ${updated.company}`;
            const modal = new (window as any).bootstrap.Modal(document.getElementById('completionModal'));
            modal.show();
            document.getElementById('completionModal')?.addEventListener(
              'hidden.bs.modal',
              () => window.location.reload(),
              { once: true }
            );
          } else {
            setTimeout(check, 30000);
          }
        })
        .catch(() => setTimeout(check, 30000));
    };
    check();
  }

  showToast(message: string): void {
    const toastBody = document.getElementById('uploadToastBody');
    if (toastBody) toastBody.innerText = message;
    const toast = new (window as any).bootstrap.Toast(document.getElementById('uploadToast'));
    toast.show();
  }

  showTOC(entry: any): void {
    const filename = entry.pdf_filename;
    if (entry.status === 'Processing' || entry.status === 'New') {
      this.loadingTOC = true;
      this.tocReady = false;
      fetch(`http://localhost:5000/get_toc/${filename}`)
        .then(res => res.json())
        .then(tocData => {
          if (!tocData || !tocData.toc || tocData.toc.length === 0) {
            this.loadingTOC = false;
            alert('⚠️ TOC is still empty. Please try again in a few seconds.');
            return;
          }
          this.activeTOC = tocData.toc;
          this.activeDoc = filename;
          this.tocReady = true;
          this.loadingTOC = false;
          this.editedRows = this.buildEditableRowsFromActiveTOC();
          const modal = new (window as any).bootstrap.Modal(document.getElementById('tocModal'));
          modal.show();
        })
        .catch(err => {
          this.loadingTOC = false;
          this.tocReady = false;
          console.error('❌ TOC load error:', err);
          alert('TOC is being generated. Please wait a moment and try again.');
        });
    } else if (entry.status === 'Completed' || entry.status === 'Active') {
      this.router.navigate(['/toc-viewer', filename]);
    } else {
      alert(`⚠️ TOC viewer is only available for Processing/New/Active entries.`);
    }
  }

  private buildEditableRowsFromActiveTOC(): any[] {
    const rows: any[] = [];
    let tagI = 1;
    this.activeTOC.forEach((sec: any) => {
      const sectionTitle = sec.title || '';
      const sectionStart = sec.page ?? null;
      const sectionEnd = sec.page ?? null;
      if (!sec.subsections || sec.subsections.length === 0) {
        rows.push({
          'TOC Tag ID': `${tagI}.1`,
          'Section No. (Roman)': '',
          'Section': sectionTitle,
          'Sub-section': sectionTitle,
          'Start Page#': sectionStart,
          'End Page#': sectionEnd
        });
      } else {
        let tagJ = 1;
        sec.subsections.forEach((sub: any) => {
          rows.push({
            'TOC Tag ID': `${tagI}.${tagJ}`,
            'Section No. (Roman)': '',
            'Section': sectionTitle,
            'Sub-section': sub.title || '',
            'Start Page#': sub.page ?? null,
            'End Page#': sub.page ?? null
          });
          tagJ += 1;
        });
      }
      tagI += 1;
    });
    return rows;
  }

  saveEditedTOC(): void {
    if (!this.activeDoc) {
      alert('❌ No active document.');
      return;
    }
    this.savingEdited = true;
    const body = {
      pdfName: this.activeDoc,
      rows: this.editedRows
    };
    fetch('http://localhost:5000/api/save_toc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        this.savingEdited = false;
        if ((data as any).error) {
          alert(`❌ ${data.error}`);
          return;
        }
        this.lastSavedCsvPath = (data as any).csvPath || '';
        this.lastSavedJsonPath = (data as any).jsonPath || '';
        this.lastSavedHierarchy = (data as any).hierarchy || null;
        this.showToast('✅ Edited TOC saved and set as canonical.');
      })
      .catch(err => {
        this.savingEdited = false;
        console.error('api/save_toc error', err);
        alert('❌ Failed to save edited TOC.');
      });
  }

  rebuildFromCsv(entry: any): void {
    if (!entry || !entry.pdf_filename) {
      alert('❌ Invalid entry.');
      return;
    }
    const doc = entry.pdf_filename;
    fetch(`http://localhost:5000/save_toc/${encodeURIComponent(doc)}`)
      .then(res => res.json())
      .then(data => {
        if ((data as any).error) {
          alert(`❌ ${data.error}`);
          return;
        }
        this.lastSavedCsvPath = (data as any).csvPath || '';
        this.lastSavedJsonPath = (data as any).jsonPath || '';
        this.lastSavedHierarchy = (data as any).hierarchy || null;
        this.showToast(`✅ Rebuilt from CSV. JSON updated.`);
        this.tocReady = true;
      })
      .catch(err => {
        console.error('save_toc error', err);
        alert('❌ Failed to rebuild from CSV.');
      });
  }

  acceptTOC(entry: any): void {
    const base = entry.pdf_filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    fetch(`http://localhost:5000/accept_toc/${base}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          entry.toc_verified = true;
          this.activeTOC = [];
          this.activeDoc = '';
          this.tocReady = false;
          alert('✅ TOC accepted. You can now process the document.');
        } else {
          alert(`❌ Failed to accept TOC: ${data.message}`);
        }
      })
      .catch(() => alert('❌ Error accepting TOC'));
  }

  rejectTOC(entry: any): void {
    const base = entry.pdf_filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    fetch(`http://localhost:5000/reject_toc/${base}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.entries = this.entries.filter((e: any) => e.pdf_filename !== entry.pdf_filename);
          this.activeTOC = [];
          this.activeDoc = '';
          this.tocReady = false;
          alert('❌ TOC rejected and entry removed. You can re-verify or re-upload the document.');
        } else {
          alert(`❌ Failed to reject TOC: ${data.message}`);
        }
      })
      .catch(() => alert('❌ Error rejecting TOC'));
  }

  viewRisk(doc: string): void {
    this.router.navigate(['/risk-viewer', doc]);
  }

  viewQA(doc: string): void {
    this.router.navigate(['/qa-viewer', doc]);
  }

  deleteDoc(doc: string): void {
    fetch(`http://localhost:5000/delete/${doc}`, { method: 'POST' })
      .then(() => {
        this.entries = this.entries.filter((e: any) => e.pdf_filename !== doc);
      })
      .catch(() => alert('Delete failed.'));
  }

  getEntryByFilename(filename: string): any {
    return this.entries.find((e: any) => e.pdf_filename === filename);
  }

  getProcessingStage(base: string, company: string): void {
    fetch(`http://localhost:5000/status/${base}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const existing = this.processingStages.find(s => s.base === base);
          if (existing) {
            existing.stage = data.stage;
          } else {
            this.processingStages.push({ base, company, stage: data.stage });
          }

          const entry = this.entries.find(e =>
            e.pdf_filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_') === base
          );
          if (entry && (data.status === 'Active' || data.status === 'Completed')) {
            entry.status = 'Completed';
            entry.processing = false;
            this.removeFromProcessing(entry.pdf_filename);
          }
        }
      })
      .catch(() => { /* silent */ });
  }

  startPollingStages(): void {
    setInterval(() => {
      this.entries
        .filter(e => e.status === 'Processing')
        .forEach(e => {
          const base = e.pdf_filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_');
          this.getProcessingStage(base, e.company);
        });
    }, 5000);
  }

  statusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'new') return 'badge-new';
    if (s === 'processing') return 'badge-processing';
    if (s === 'completed' || s === 'active') return 'badge-completed';
    return 'badge-unknown';
  }
}