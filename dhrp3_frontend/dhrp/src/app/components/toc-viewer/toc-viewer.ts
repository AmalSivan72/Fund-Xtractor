import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toc-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toc-viewer.html',
  styleUrl: './toc-viewer.css'
})
export class TocViewer implements OnInit {
  toc: any[] = [];
  docName: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.docName = this.route.snapshot.paramMap.get('doc') || '';
    fetch(`http://localhost:5000/get_toc/${this.docName}`)
      .then(res => res.json())
      .then(data => this.toc = data.toc)
      .catch(() => alert('Failed to load TOC.'));
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
