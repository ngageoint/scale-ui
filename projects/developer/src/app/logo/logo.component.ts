import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';

import { environment } from '../../environments/environment';

@Component({
  selector: 'dev-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
    public logoImage: SafeUrl;
    public logoImageCss: SafeStyle;

    constructor(private sanitizer: DomSanitizer) {
        if (environment.logoImage) {
            // if a data uri is given, trust the content and use that instead of the default svg
            this.logoImage = this.sanitizer.bypassSecurityTrustUrl(environment.logoImage);
        }
        if (environment.logoImageCss) {
            this.logoImageCss = this.sanitizer.bypassSecurityTrustStyle(environment.logoImageCss);
        }
    }

    ngOnInit() {
    }

}
