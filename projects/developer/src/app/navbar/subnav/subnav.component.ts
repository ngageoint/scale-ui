import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
    selector: 'dev-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {

    @Input() sectionId: string;
    @Output() navigateEvent: EventEmitter<any> = new EventEmitter();
    isMobile: boolean;
    constructor(public breakpointObserver: BreakpointObserver) { }

    ngOnInit() {
        this.breakpointObserver.observe(['(min-width: 1150px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });
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
