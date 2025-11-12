import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { TocBrowser } from './toc-browser/toc-browser';
import { RiskBrowser } from './risk-browser/risk-browser';
import { CompanyBrowser } from './company-browser/company-browser';
import { TocViewer } from './components/toc-viewer/toc-viewer';
import { RiskViewer } from './components/risk-viewer/risk-viewer';
import { QaViewer } from './components/qa-viewer/qa-viewer';
import { UploadCsv } from './components/upload-csv/upload-csv';
import { QaBrowser } from './components/qa-browser/qa-browser';
import { ChecklistValidation } from './checklist-validation/checklist-validation';


export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'dashboard', component: Dashboard },
  { path: 'toc-browser', component: TocBrowser },
  { path: 'risk-browser', component: RiskBrowser },
  { path: 'company-browser', component: CompanyBrowser },
  { path: 'toc-viewer/:doc', component: TocViewer },
  { path: 'risk-viewer/:doc', component: RiskViewer },
  { path: 'qa-viewer/:doc', component: QaViewer },
  { path: 'upload-csv', component: UploadCsv },
  { path: 'qa-browser', component: QaBrowser }
];
