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
        console.log('Percentage: ' + this.percentage);
    }

    getBarClass() {
        let className = 'healthbar__status ';
        if (this.percentage >= 90) {
            className += 'healthbar__status-error';
        } else if (this.percentage >= 70) {
            className += 'healthbar__status-warn';
        } else {
            className += 'healthbar__status-good';
        }
        return className;
    }

    getBarWidth() {
        return `${this.percentage}%`;
    }
}
