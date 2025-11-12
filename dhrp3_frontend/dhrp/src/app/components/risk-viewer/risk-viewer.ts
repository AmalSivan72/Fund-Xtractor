import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RiskItem {
  Risk: string;
  Severity?: string;
  Impact?: string;
  Mitigation?: string;
  Gaps?: string;
  [key: string]: string | undefined;
}

@Component({
  selector: 'app-risk-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-viewer.html',
  styleUrl: './risk-viewer.css'
})
export class RiskViewer implements OnInit {
  Object = Object;
  docName: string = '';
  riskText: string = '';
  summaryBullets: { [group: string]: { [category: string]: RiskItem[] } } = {};
  searchTerm: string = '';
  loading: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.docName = this.route.snapshot.paramMap.get('doc') || '';
    fetch(`http://localhost:5000/risk/${this.docName}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.riskText = this.stripMarkdown(data.risk_text);
          this.summaryBullets = data.summary_bullets;
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

  goBack(): void {
    this.router.navigate(['/']);
  }

  matchesSearch(category: string): boolean {
    return category.toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  stripMarkdown(markdown: string): string {
    return markdown
      .replace(/!\[(.*?)\]\(.*?\)/g, '$1')         // images → alt text
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')          // links → label
      .replace(/[#*_`~>-]/g, '')                   // symbols
      .replace(/\n+/g, ' ')                        // collapse newlines
      .replace(/\s{2,}/g, ' ')                     // extra spaces
      .trim();
  }
}
