const _ = require('lodash');
const moment = require('moment');
const status = require('../data/status.json');

module.exports = function () {
    var statusData = _.clone(status);
    var getRandom = function (min, max) {
        return Math.floor(Math.random() * (max - min) + 1) + min;
    };
    var stateValues = [{
        name: 'READY',
        title: 'Ready',
        description: 'Scheduler is ready to run new jobs.'
    }, {
        name: 'PAUSED',
        title: 'Paused',
        description: 'Scheduler is paused.'
    }];
    var totalWarnings = getRandom(0, 5);
    var schedulerWarnings = [];
    // var stateValue = stateValues[Math.floor(Math.random() * (stateValues.length))];
    var stateValue = stateValues[0];
    if (totalWarnings > 0) {
        for (var i = 0; i < totalWarnings; i++) {
            schedulerWarnings.push({
                name: 'warning-' + i,
                title: 'Warning ' + i,
                description: 'This is test warning number ' + i,
                started: moment.utc().subtract(getRandom(1, 15), 'm').toISOString(),
                last_updated: moment.utc().subtract(getRandom(5, 50), 's').toISOString()
            });
        }
    }
    var memTotal = getRandom(100000, 500000);
    var memRunningPercent = getRandom(0, 100);
    var memRemainder = 100 - memRunningPercent;
    var memFreePercent = parseFloat((memRemainder * 0.3).toFixed(1));
    var memOfferedPercent = parseFloat((memRemainder * 0.3).toFixed(1));
    var memUnavailablePercent = parseFloat((memRemainder * 0.4).toFixed(1));
    var gpuTotal = getRandom(2, 20);
    var gpuRunningPercent = getRandom(0, 100);
    var gpuRemainder = 100 - gpuRunningPercent;
    var gpuFreePercent = parseFloat((gpuRemainder * 0.3).toFixed(1));
    var gpuOfferedPercent = parseFloat((gpuRemainder * 0.3).toFixed(1));
    var gpuUnavailablePercent = parseFloat((gpuRemainder * 0.4).toFixed(1));
    var diskTotal = getRandom(100000, 999999);
    var diskRunningPercent = getRandom(0, 100);
    var diskRemainder = 100 - diskRunningPercent;
    var diskFreePercent = parseFloat((diskRemainder * 0.3).toFixed(1));
    var diskOfferedPercent = parseFloat((diskRemainder * 0.3).toFixed(1));
    var diskUnavailablePercent = parseFloat((diskRemainder * 0.4).toFixed(1));
    var cpuTotal = getRandom(5, 50);
    var cpuRunningPercent = getRandom(0, 100);
    var cpuRemainder = 100 - cpuRunningPercent;
    var cpuFreePercent = parseFloat((cpuRemainder * 0.3).toFixed(1));
    var cpuOfferedPercent = parseFloat((cpuRemainder * 0.3).toFixed(1));
    var cpuUnavailablePercent = parseFloat((cpuRemainder * 0.4).toFixed(1));
    statusData.timestamp = moment.utc().toISOString();
    statusData.scheduler.state = stateValue;
    statusData.scheduler.warnings = schedulerWarnings;
    statusData.resources = {
        mem: {
            offered: parseFloat((memTotal * (memOfferedPercent / 100)).toFixed(1)),
            total: memTotal,
            running: parseFloat((memTotal * (memRunningPercent / 100)).toFixed(1)),
            free: parseFloat((memTotal * (memFreePercent / 100)).toFixed(1)),
            unavailable: parseFloat((memTotal * (memUnavailablePercent / 100)).toFixed(1))
        },
        gpus: {
            offered: parseFloat((gpuTotal * (gpuOfferedPercent / 100)).toFixed(1)),
            total: gpuTotal,
            running: parseFloat((gpuTotal * (gpuRunningPercent / 100)).toFixed(1)),
            free: parseFloat((gpuTotal * (gpuFreePercent / 100)).toFixed(1)),
            unavailable: parseFloat((gpuTotal * (gpuUnavailablePercent / 100)).toFixed(1))
        },
        disk: {
            offered: parseFloat((diskTotal * (diskOfferedPercent / 100)).toFixed(1)),
            total: diskTotal,
            running: parseFloat((diskTotal * (diskRunningPercent / 100)).toFixed(1)),
            free: parseFloat((diskTotal * (diskFreePercent / 100)).toFixed(1)),
            unavailable: parseFloat((diskTotal * (diskUnavailablePercent / 100)).toFixed(1)),
        },
        cpus: {
            offered: parseFloat((cpuTotal * (cpuOfferedPercent / 100)).toFixed(1)),
            total: cpuTotal,
            running: parseFloat((cpuTotal * (cpuRunningPercent / 100)).toFixed(1)),
            free: parseFloat((cpuTotal * (cpuFreePercent / 100)).toFixed(1)),
            unavailable: parseFloat((cpuTotal * (cpuUnavailablePercent / 100)).toFixed(1)),
        }
    };

    return statusData;
};
