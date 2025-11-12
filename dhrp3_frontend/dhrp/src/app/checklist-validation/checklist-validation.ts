import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';

// ✅ Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checklist-validation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './checklist-validation.html',
  styleUrl: './checklist-validation.css'
})
export class ChecklistValidation implements OnInit {
  filename: string = '';
  rows: any[] = [];
  columns: string[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  activeItemId: number | null = null;
  dhrpEntries: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const doc = this.route.snapshot.paramMap.get('doc') || '';
    if (doc) {
      this.filename = doc.endsWith('.pdf') ? doc.replace('.pdf', '_analysis.csv') : doc;
      this.loadChecklist(this.filename);
    } else {
      this.loading = false;
    }

    this.loadDhrpIndex();
  }

  loadChecklist(filename: string): void {
    this.filename = filename;
    this.activeItemId = null;
    this.loading = true;
    this.rows = [];
    this.columns = [];

    const url = `http://localhost:5000/view_csv/${filename}`;
    fetch(url)
      .then(res => res.json())
      .then(async data => {
        if (data.success && Array.isArray(data.rows)) {
          this.columns = Array.isArray(data.columns) ? data.columns : [];
          this.rows = await Promise.all(
            data.rows.map(async (row: Record<string, any>, index: number) => {
              const answer = row['Answer'] || '';
              const html = marked.parse(answer) as string;
              return { ...row, AnswerHtml: html, id: index + 1, status: 'pending' };
            })
          );
        } else {
          alert(data.message || 'Unexpected CSV format.');
        }
        this.loading = false;
      })
      .catch(err => {
        console.error('Fetch error:', err);
        alert('Failed to load Q/A data.');
        this.loading = false;
      });
  }

  onDhrpSelect(filename: string): void {
    this.loadChecklist(filename);
  }

  loadDhrpIndex(): void {
    const url = 'http://localhost:5000/get_every_dhrps';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.dhrpEntries = Array.isArray(data) ? data : [];
        console.log('✅ DHRP index loaded:', this.dhrpEntries.length);
      })
      .catch(err => {
        console.error('❌ Failed to load DHRP index:', err);
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  get filteredRows(): any[] {
    const term = this.searchTerm.toLowerCase();
    return this.rows.filter(row =>
      this.columns.some(col =>
        String(row[col] || '').toLowerCase().includes(term)
      )
    );
  }

  downloadCSV(): void {
    const downloadUrl = `http://localhost:5000/download/${this.filename}`;
    window.open(downloadUrl, '_blank');
  }

  selectItem(id: number): void {
    this.activeItemId = id;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'compliant': return 'check_circle';
      case 'partial': return 'warning';
      case 'non-compliant': return 'cancel';
      case 'not-applicable': return 'do_not_disturb';
      default: return 'pending';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'compliant': return 'success';
      case 'partial': return 'warning';
      case 'non-compliant': return 'error';
      case 'not-applicable': return 'disabled';
      default: return 'pending';
    }
  }
}
