import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'dev-candy-bar',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class CandyBarComponent implements OnInit, OnChanges {
    @Input() dataArr: any;
    @Input() dataFields: any;
    chartData: any = [];
    chartDataTooltip: any = '';
    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges(changes) {
        this.chartData = [];
        this.chartDataTooltip = '';
        changes.dataArr.currentValue = _.reverse(_.sortBy(changes.dataArr.currentValue, 'percentage'));
        _.forEach(changes.dataArr.currentValue, data => {
            const sum = _.sum(_.map(this.chartData, 'percentage'));
            data.value = data.percentage + sum;
            this.chartData.push(data);
            const icon = `<span class="${data.key}-text"><i class="fa fa-square"></i></span>`;
            this.chartDataTooltip = this.chartDataTooltip === '' ? `${icon} ${_.capitalize(data.key)}: ${changes.dataFields.currentValue[data.field]}` : `${this.chartDataTooltip}<br />${icon} ${_.capitalize(data.key)}: ${changes.dataFields.currentValue[data.field]}`; // tslint:disable-line:max-line-length
        });
        this.chartData = _.reverse(_.sortBy(this.chartData, 'value'));
    }
}
