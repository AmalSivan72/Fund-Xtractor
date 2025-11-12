import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
 
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  sidebarVisible = false;
 
  constructor(private router: Router) {}
 
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    document.body.style.overflow = this.sidebarVisible ? 'hidden' : 'auto';
  }
 
  navigateTo(role: 'admin' | 'user') {
    this.sidebarVisible = false;
    document.body.style.overflow = 'auto';
    if (role === 'admin') {
      this.router.navigate(['/upload-csv']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}