import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/primeng';
import { version } from '../../../../../package.json';
import { MessageService } from 'primeng/components/common/messageservice';

import { environment } from '../../environments/environment';
import { DataService } from '../common/services/data.service';
import { VersionService } from '../common/services/version.service';
import { ProfileService } from '../common/services/profile.service';

@Component({
    selector: 'dev-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit, OnChanges {
    @Input() isAuthenticated: boolean;
    @ViewChild('profileOp') profileOp: OverlayPanel;
    @ViewChild('profile') profile: any;
    @ViewChild('user') usernameEl: any;
    env = environment;
    documentation = environment.documentation;
    uiVersion = version;
    apiVersion: string;
    userProfile: any;
    username: string;
    password: string;

    constructor(
        private messageService: MessageService,
        private dataService: DataService,
        private versionService: VersionService,
        private profileService: ProfileService
    ) {}

    login() {
        this.profileService.login({ username: this.username, password: this.password }).subscribe(data => {
            console.log(data);
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Authentication Error', detail: err.statusText, life: 10000 });
        });
    }

    handleKeyPress(event) {
        if (event.code === 'Enter' && this.username && this.password) {
            this.login();
        }
    }

    handleOnProfileShow() {
        if (!this.isAuthenticated && environment.authSchemeType === 'form') {
            setTimeout(() => {
                this.usernameEl.nativeElement.focus();
            }, 50);
        }
    }

    onProfileClick(event) {
        this.profileOp.toggle(event);
    }

    ngOnInit() {
        this.versionService.getVersion().subscribe((result: any) => {
            this.apiVersion = result.version;
        });
        this.userProfile = this.dataService.getUserProfile();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.isAuthenticated && changes.isAuthenticated.currentValue === false) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            this.profileOp.show(event, this.profile.nativeElement);
        }
    }
}
