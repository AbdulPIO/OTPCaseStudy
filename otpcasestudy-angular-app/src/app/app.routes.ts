import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { ScheduleExamComponent } from './components/admin/schedule-exam/schedule-exam.component';
import { UploadQuestionsComponent } from './components/admin/upload-questions/upload-questions.component';
import { ViewCandidatesComponent } from './components/admin/view-candidates/view-candidates.component';
import { DownloadResultsComponent } from './components/admin/download-results/download-results.component';
import { DownloadAbsentCandidatesComponent } from './components/admin/download-absent-candidates/download-absent-candidates.component';

export const routes: Routes = [
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'schedule-exam', component: ScheduleExamComponent },
            { path: 'upload-questions', component: UploadQuestionsComponent },
            { path: 'view-candidates', component: ViewCandidatesComponent },
            { path: 'download-results', component: DownloadResultsComponent },
            { path: 'absent-candidates', component: DownloadAbsentCandidatesComponent },
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
    { path: '**', redirectTo: 'admin/dashboard' }
]; 