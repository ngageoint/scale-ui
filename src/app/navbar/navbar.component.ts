import { ChangeDetectorRef, Component, OnInit } from '@angular/core';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    selectedId = null;

    constructor(private changeDetector: ChangeDetectorRef) { }

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

    onNavigate() {
        // close the subnav
        this.selectedId = null;
    }
}
