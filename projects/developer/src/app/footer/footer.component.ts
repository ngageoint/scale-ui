import { Component, OnInit } from '@angular/core';
import { version } from '../../../../../package.json';

import { environment } from '../../environments/environment';
import { VersionService } from '../common/services/version.service';

@Component({
    selector: 'dev-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
    documentation = environment.documentation;
    uiVersion = version;
    apiVersion: string;

    constructor(
        private versionService: VersionService,
    ) {}

    ngOnInit() {
        this.versionService.getVersion().subscribe((result: any) => {
            this.apiVersion = result.version;
        });
    }
}
