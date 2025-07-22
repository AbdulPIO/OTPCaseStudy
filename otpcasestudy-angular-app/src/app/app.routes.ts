import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { ScheduleExamComponent } from './components/admin/schedule-exam/schedule-exam.component';
import { UploadQuestionsComponent } from './components/admin/upload-questions/upload-questions.component';
import { ViewCandidatesComponent } from './components/admin/view-candidates/view-candidates.component';
import { DownloadResultsComponent } from './components/admin/download-results/download-results.component';
import { AdminAuthGuard } from './guards/admin-auth-guard';
import { LoginGuard } from './guards/login.guard';
import { LandingComponent } from './components/candidate/landing/landing.component';
import { AdminLoginComponent } from './components/candidate/admin-login/admin-login.component';
import { EmailVerificationComponent } from './components/candidate/email-verification/email-verification.component';
import { RegistrationComponent } from './components/candidate/registration/registration.component';
import { ExamWindowComponent } from './components/exam-window/exam-window.component';
import { ExamExitGuard } from './guards/exam-exit.guard';
import { CandidateLoginComponent } from './components/candidate/candidate-login/candidate-login.component';

export const routes: Routes = [
    {
        path: 'admin',
        canActivate: [AdminAuthGuard],
        component: AdminLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'schedule-exam', component: ScheduleExamComponent },
            { path: 'upload-questions', component: UploadQuestionsComponent },
            { path: 'view-candidates', component: ViewCandidatesComponent },
            { path: 'download-results', component: DownloadResultsComponent },
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
    },
    {
        path: 'login',
        canActivate: [LoginGuard],
        loadComponent: () => import('./components/admin/login/login.component').then(m => m.LoginComponent)
    },
    { path: 'landing', component: LandingComponent },
    { path: 'admin-login', component: AdminLoginComponent }, 
    { path: 'verify-email', component: EmailVerificationComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'exam', component: ExamWindowComponent, canDeactivate: [ExamExitGuard] },
    { path: 'candidate-login', component: CandidateLoginComponent },
    { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
    { path: '**', redirectTo: 'landing' }
];  