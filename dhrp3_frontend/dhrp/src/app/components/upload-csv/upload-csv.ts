import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-csv',
  standalone: true,
  templateUrl: './upload-csv.html',
  styleUrls: ['./upload-csv.css']
})
export class UploadCsv {
  constructor(private router: Router) {}
  selectedFile: File | null = null;
  statusMessage: string = '';
  uploading: boolean = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.statusMessage = '';
    }
  }

  async upload(): Promise<void> {
    if (!this.selectedFile) {
      this.statusMessage = 'Please select a CSV file first.';
      return;
    }

    if (!this.selectedFile.name.endsWith('.csv')) {
      this.statusMessage = 'Only CSV files are allowed.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.uploading = true;
    this.statusMessage = 'Uploading…';

    try {
      const response = await fetch('http://localhost:5000/upload_csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      this.statusMessage = result.message || 'Upload complete.';
    } catch (error) {
      console.error('Upload error:', error);
      this.statusMessage = 'Upload failed. Please try again.';
    }

    this.uploading = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
