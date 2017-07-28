import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {

    @Input() sectionId: string
    @Input() onNavigate: Function
    constructor() { }

    ngOnInit() {
    }

    getSectionStyles(section) {
        let className = "subnav hidden";
        if (section === this.sectionId) {
            className = "subnav";
        }
        //console.log(`Subnav ${section} is "${className}" for sectionId ${this.sectionId}`);
        return className;
    }

    navigate() {
        // call passed in (navbar) onNavigate method
        this.onNavigate();
    }
}
