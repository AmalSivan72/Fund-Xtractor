import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toc-browser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toc-browser.html',
  styleUrl: './toc-browser.css'
})
export class TocBrowser implements OnInit {
  entries: any[] = [];
  filteredEntries: any[] = [];
  selectedCompany: string = '';
  selectedDoc: string = '';
  selectedTOC: any[] = [];
  searchQuery: string = '';

  ngOnInit(): void {
    fetch('http://localhost:5000/get_all_dhrps')
      .then(res => res.json())
      .then(data => {
        this.entries = data;
        this.filteredEntries = data;
      })
      .catch(() => alert('Failed to load DHRP entries.'));
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
    this.selectedTOC = [];

    fetch(`http://localhost:5000/get_toc/${entry.pdf_filename}`)
      .then(res => res.json())
      .then(data => {
        if (data.toc) {
          this.selectedTOC = data.toc;
        } else {
          alert('TOC not found.');
        }
      })
      .catch(() => alert('Error loading TOC.'));
  }
}
