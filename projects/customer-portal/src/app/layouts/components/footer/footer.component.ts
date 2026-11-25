import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FooterLink {
  label: string;
  url: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  footerSections: FooterSection[] = [];

  ngOnInit(): void {
    this.initFooterData();
  }

  onSubscribe(email: string, event: Event): void {
    event.preventDefault();
    if (email) {
      console.log(`Subscribing ${email} to Asiaporeair newsletter...`);
      // In a real app, this would call a service
      alert(`Thank you for joining our journey. A confirmation has been sent to ${email}.`);
    }
  }

  private initFooterData(): void {
    this.footerSections = [
      {
        title: 'Corporate',
        links: [
          { label: 'About Us', url: '/about' },
          { label: 'Sustainability', url: '/sustainability' },
          { label: 'Media Centre', url: '/media' },
          { label: 'Investor Relations', url: '/investors' },
          { label: 'Tender Notices', url: '/tenders' }
        ]
      },
      {
        title: 'Help & Support',
        links: [
          { label: 'Contact Us', url: '/contact' },
          { label: 'FAQ', url: '/help/faq' },
          { label: 'Feedback', url: '/feedback' },
          { label: 'Special Assistance', url: '/assistance' },
          { label: 'Manage Vouchers', url: '/vouchers' }
        ]
      },
      {
        title: 'Loyalty & Services',
        links: [
          { label: 'Asiaporeair Loyalty', url: '/loyalty' },
          { label: 'Earn Miles', url: '/loyalty/earn' },
          { label: 'Redeem Miles', url: '/loyalty/redeem' },
          { label: 'Partner Benefits', url: '/loyalty/partners' },
          { label: 'Business Travel', url: '/business' }
        ]
      },
      {
        title: 'Destinations',
        links: [
          { label: 'Popular Routes', url: '/destinations/popular' },
          { label: 'Winter Getaways', url: '/destinations/winter' },
          { label: 'Tropical Paradises', url: '/destinations/tropical' },
          { label: 'Cultural Cities', url: '/destinations/culture' },
          { label: 'Travel Information', url: '/travel-info' }
        ]
      }
    ];
  }
}
