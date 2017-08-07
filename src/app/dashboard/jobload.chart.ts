


export class JobLoadChart {

    public static convertApiData(data) {
        const results = data.results;
        const labels = [];
        const pending = [];
        const queue = [];
        const running = [];
        results.forEach(result => {
            labels.push(result['time']);
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

    public static options = {
        legend: {
            position: 'bottom'
        }
    }

}