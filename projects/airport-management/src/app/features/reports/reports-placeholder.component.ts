import { Component, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'app-reports-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p"><div class="p__i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div><h2>Analytics & Reports</h2><p class="p__s">Operational analytics, KPIs, and performance reports.</p></div>`,
  styles: [`:host{display:block}.p{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:48px}.p__i{width:56px;height:56px;border-radius:14px;background:rgba(182,143,36,.08);display:flex;align-items:center;justify-content:center;margin-bottom:20px;svg{width:28px;height:28px;color:#B68F24}}.p h2{font-family:'Montserrat',sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:var(--aoms-text-primary);margin-bottom:6px}.p__s{font-size:13px;color:var(--aoms-text-secondary);max-width:400px}`],
})
export class ReportsPlaceholderComponent {}
