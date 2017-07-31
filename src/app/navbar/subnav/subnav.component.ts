import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {

    @Input() sectionId: string;
    @Input() onNavigate: Function;
    constructor() { }

    ngOnInit() {
    }

    getSectionStyles(section) {
        if (section === this.sectionId) {
            return 'subnav'; // show it
        }
        return 'subnav hidden'; // hide it
    }

    getSubnavStyles() {
        if (this.sectionId) {
            return 'subnav-ctr';
        }
        return 'subnav-ctr hidden';
    }

    navigate() {
        // call passed in (navbar) onNavigate method
        this.onNavigate();
    }
}
