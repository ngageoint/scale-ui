import { JobLoadChart } from './jobload.chart';


const testApiData = {
    count: 2,
    next: null,
    previous: null,
    results: [{
        pending_count: 24,
        queued_count: 73,
        running_count: 76,
        time: '2017-07-31T00:00:00.000Z'
    }, {
        pending_count: 24,
        queued_count: 73,
        running_count: 76,
        time: '2017-07-31T01:00:00.000Z'
    }]
};

describe('Dashboard - JobLoad Chart', () => {

    it('should convertApiData', () => {
        const results = JobLoadChart.convertApiData(testApiData);
        expect(results.labels).not.toBeNull();
        expect(results.datasets.length).toBe(3);
        expect(results.datasets[0].data.length).toBe(2);
    });

});
