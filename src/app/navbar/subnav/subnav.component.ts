import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {

    @Input() sectionId: string;
    @Output() onNavigate = new EventEmitter();
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
        this.onNavigate.emit();
    }
}
