import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    selectedId = null;

    constructor() { }

    ngOnInit() {
    }

    selectNavItem(event, itemId) {
        event.stopPropagation();
        if (this.selectedId === itemId) {
            // close it
            this.selectedId = null;
        }
        else {
            this.selectedId = itemId;
        }
    }
}
