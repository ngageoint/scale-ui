import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-healthbar',
    templateUrl: './healthbar.component.html',
    styleUrls: ['./healthbar.component.scss']
})
export class HealthbarComponent implements OnInit {

    @Input() percentage: number;
    constructor() {
    }

    ngOnInit() {
    }

    getBarWidth() {
        if (this.percentage) {
            return `${100 - this.percentage}%`;
        }
        return '100%';
    }
}
