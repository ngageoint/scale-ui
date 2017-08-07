import * as moment from 'moment';


export class JobLoadChart {

    public static options = {
        elements: {
            line: {
                borderWidth: 1
            },
            point: {
                radius: 1,
                hitRadius: 1,
                hoverRadius: 4
            }
        },
        legend: {
            position: 'bottom'
        },
        scales: {
            xAxes: [{
                display: false
            }]
        }
    }

    public static convertApiData(data) {
        const results = data.results;
        const labels = [];
        const pending = [];
        const queue = [];
        const running = [];

        results.forEach(result => {
            const tIn = result['time'];
            const t = moment(tIn).format('YYYY-MM-DD HH:mm');
            labels.push(t);
            pending.push(result['pending_count']);
            queue.push(result['queue_count']);
            running.push(result['running_count']);
        });

        const out = {
            labels: labels,
            datasets: [{
                label: 'Running',
                data: running,
                fill: false,
                borderColor: '#ADB229'
            }, {
                label: 'Pending',
                data: pending,
                fill: false,
                borderColor: '#48ACFF'
            }, {
                label: 'Queue',
                data: queue,
                fill: false,
                borderColor: '#FF6761'
            }]
        };
        return out;
    }

}
