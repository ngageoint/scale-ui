import { Component, OnInit } from '@angular/core';

import { VersionService } from './../common/services/version.service';

@Component({
  selector: 'dev-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  version: string;

  constructor(
    private versionService: VersionService,
  ) {}

  ngOnInit() {
    this.versionService.getVersion().subscribe((result: any) => {
      this.version = result.version;
    });
  }
}
