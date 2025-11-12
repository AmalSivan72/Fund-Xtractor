import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
 
 
interface RiskItem {
  Risk: string;
  Severity?: string;
  Impact?: string;
  Mitigation?: string;
  Gaps?: string;
  [key: string]: string | undefined;
}
 
@Component({
  selector: 'app-risk-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-browser.html',
  styleUrl: './risk-browser.css'
})
export class RiskBrowser implements OnInit {
  entries: any[] = [];
  filteredEntries: any[] = [];
  selectedCompany: string = '';
  selectedDoc: string = '';
  riskText: string = '';
  riskHtml: string = '';
  summaryBullets: { [group: string]: { [category: string]: RiskItem[] } } = {};
  searchQuery: string = '';
  searchTerm: string = '';
  loading: boolean = false;
  Object = Object;
 
  ngOnInit(): void {
    fetch('http://127.0.0.1:5000/get_all_dhrps')
      .then(res => res.json())
      .then(data => {
        this.entries = data;
        this.filteredEntries = data;
      })
      .catch(() => alert('Failed to load entries.'));
  }
 
  search(query: string) {
    this.searchQuery = query.toLowerCase();
    this.filteredEntries = this.entries.filter(e =>
      e.company.toLowerCase().includes(this.searchQuery)
    );
  }
 
  select(entry: any) {
    this.selectedCompany = entry.company;
    this.selectedDoc = entry.pdf_filename;
    this.riskText = '';
    this.riskHtml = '';
    this.summaryBullets = {};
    this.loading = true;
 
    fetch(`http://localhost:5000/risk/${entry.pdf_filename}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.riskText = data.risk_text || '';
          this.riskHtml = marked.parse(this.riskText) as string; // ✅ Force TypeScript to treat it as string// ✅ always returns string // ✅ Markdown conversion
          this.summaryBullets = data.summary_bullets || {};
        } else {
          alert(data.message);
        }
        this.loading = false;
      })
      .catch(() => {
        alert('Failed to load risk summary.');
        this.loading = false;
      });
  }
 
  get hasRiskText(): boolean {
    return (this.riskText || '').trim().length > 0;
  }
 
 
 
  /*matchesSearch(category: string): boolean {
    return category.toLowerCase().includes(this.searchTerm.toLowerCase());
  }*/
}