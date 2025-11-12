import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';

@Component({
  selector: 'app-qa-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qa-browser.html',
  styleUrls: ['./qa-browser.css']
})
export class QaBrowser implements OnInit {
  entries: any[] = [];
  filteredEntries: any[] = [];
  selectedCompany: string = '';
  selectedDoc: string = '';
  filename: string = '';
  rows: any[] = [];
  columns: string[] = [];
  searchQuery: string = '';
  searchTerm: string = '';
  loading: boolean = false;
  activeRow: any = null;
  Object = Object;

  ngOnInit(): void {
    this.loadCompanyList();
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  loadCompanyList(): void {
    fetch('http://localhost:5000/get_all_dhrps')
      .then(res => res.json())
      .then(data => {
        this.entries = data;
        this.filteredEntries = data;
      })
      .catch(() => alert('Failed to load company list.'));
  }

  search(query: string): void {
    this.searchQuery = query.toLowerCase();
    this.filteredEntries = this.entries.filter(e =>
      e.company.toLowerCase().includes(this.searchQuery)
    );
  }

  async select(entry: any): Promise<void> {
    this.selectedCompany = entry.company;
    this.selectedDoc = entry.pdf_filename;
    this.filename = this.selectedDoc.replace('.pdf', '_analysis.csv');
    this.rows = [];
    this.columns = [];
    this.loading = true;

    const url = `http://localhost:5000/view_csv/${this.filename}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.rows)) {
        this.columns = Array.isArray(data.columns) ? data.columns : [];
        this.rows = await Promise.all(
          data.rows.map(async (row: Record<string, any>) => {
            const answer = row['Answer'] || '';
            const html = await marked.parse(answer);
            return { ...row, AnswerHtml: html };
          })
        );
      } else {
        alert(data.message || 'Unexpected CSV format.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to load Q/A data.');
    }
    this.loading = false;
  }

  get filteredRows(): any[] {
    const term = this.searchTerm.toLowerCase();
    return this.rows.filter(row =>
      this.columns.some(col =>
        String(row[col] || '').toLowerCase().includes(term)
      )
    );
  }

  openPanel(row: any): void {
    this.activeRow = row;
  }

  closePanel(): void {
    this.activeRow = null;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.activeRow) {
      this.closePanel();
    }
  }
  downloadCSV(): void { const downloadUrl = `http://localhost:5000/download/${this.filename}`; window.open(downloadUrl, '_blank'); }
}
