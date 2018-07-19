import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'dev-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {

    @Input() sectionId: string;
    @Output() navigateEvent: EventEmitter<any> = new EventEmitter();
    constructor() { }

    ngOnInit() {
    }

    getSectionStyles(section) {
        if (section === this.sectionId) {
            return `${section} subnav`; // show it
        }
        return `${section} subnav hidden`; // hide it
    }

    getSubnavStyles() {
        if (this.sectionId) {
            return 'subnav-ctr';
        }
        return 'subnav-ctr hidden';
    }

    navigate() {
        this.navigateEvent.emit();
    }

    onSearch() {
        this.navigate();
    }
}
