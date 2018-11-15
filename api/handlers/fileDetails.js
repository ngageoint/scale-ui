const _ = require('lodash');
const moment = require('moment');

module.exports = function (request) {
    return {
        id: 2,
        workspace: {
            id: 2,
            name: "Products"
        },
        file_name: "my_file2.png",
        media_type: "image/png",
        file_size: 50,
        is_deleted: false,
        url: "http://host.com/file/path/my_file2.png",
        created: "1970-01-01T00:00:00Z",
        deleted: null,
        data_started: "1970-01-01T00:00:00Z",
        data_ended: null,
        geometry: null,
        center_point: null,
        meta_data: null,
        countries: [],
        last_modified: "1970-01-01T00:00:00Z",
        file_path: "path/to/the/file.png",
        source_started: "1970-01-01T00:00:00Z",
        source_ended: "1970-01-02T00:00:00Z",
        source_sensor_class: "classA",
        source_sensor: "1",
        source_collection: "12345",
        source_task: "my-task",
        job: {
            id: 4
        },
        job_exe: {
            id: 4
        },
        job_output: "output_name_1",
        job_type: {
            id: 4,
            name: "png-filter",
            version: "1.0.0",
            title: "PNG Filter",
            description: "Filters PNG images into a new PNG image",
            revision_num: 1,
            icon_code: "f0ac"
        },
        recipe: {
            id: 60
        },
        recipe_node: "kml-footprint",
        recipe_type: {
            id: 6,
            name: "my-recipe",
            title: "My Recipe",
            description: "Processes some data",
            revision_num: 1
        },
        batch: {
            id: 15,
            title: "My Batch",
            description: "My batch of recipes",
            created: "1970-01-01T00:00:00Z"
        },
        is_superseded: true,
        superseded: "1970-01-01T00:00:00Z"
    };
};
