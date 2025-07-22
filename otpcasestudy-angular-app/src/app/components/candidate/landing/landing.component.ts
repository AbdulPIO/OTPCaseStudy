import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
  constructor(private router: Router) {}

  openRegistrationDialog() {
    this.router.navigate(['/registration']);
  }
} 