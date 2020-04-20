const _ = require("lodash");
const moment = require("moment");

module.exports = function(request) {
    var params = request.query;
    var data = {
        count: 500,
        next: null,
        previous: null,
        results: []
    };
    var start = params.modified_started
        ? moment.utc(params.modified_started)
        : moment.utc().subtract(1, "d");
    var stop = params.modified_ended
        ? moment.utc(params.modified_ended)
        : moment.utc();

    var countriesList = [["TCY", "TCT"], ["ABC"]];
    var mediaTypesList = [
        "application/vnd.google-earth.kml+xml",
        "application/vnd.google-earth.kml",
        "application/vnd.google-earth.xml"
    ];
    for (var i = 0; i < 500; i++) {
        var date = moment
            .utc(start.valueOf() + _.random(stop.valueOf() - start.valueOf()))
            .toISOString();
        var id = i + 1;
        var randomCountries = _.sampleSize(
            ["BCA", "CBA", "ACB"],
            [(n = _.random(1, 3))]
        );
        var country = _.sample([...countriesList, randomCountries]);
        var mediaType = _.sample(mediaTypesList);
        var data_started = moment
            .utc()
            .subtract(Math.max(_.random(30), 2), "d");
        var data_ended = data_started.add(10, "h");

        var createdDate = data_ended.add(1, "d").toISOString();
        var recipe_types = [
            {
                id: 6,
                name: "my-recipe",
                title: "My Recipe",
                description: "Processes some data",
                revision_num: 1
            },
            {
                id: 1,
                name: "my-other-recipe",
                title: "My Other Recipe",
                description: "Processes some other data",
                revision_num: 123
            },
            null
        ];
        data.results.push({
            id: id,
            workspace: {
                id: 2,
                name: "Products"
            },
            file_name: "file-" + id + ".kml",
            media_type: mediaType,
            file_size: 100,
            is_deleted: false,
            url: "http://host.com/file/path/my_file.kml",
            created: createdDate,
            deleted: null,
            data_started: data_started,
            data_ended: data_ended,
            geometry: null,
            center_point: null,
            countries: country,
            last_modified: moment
                .utc(date)
                .add(5, "m")
                .toISOString(),
            file_path: "",
            source_started: date,
            source_ended: moment
                .utc(date)
                .add(30, "s")
                .toISOString(),
            source_sensor: 1,
            source_collection: 12345,
            source_task: "my-task",
            job: {
                id: Math.floor(Math.random() * (12 - 1 + 1)) + 1
            },
            job_exe: {
                id: 49
            },
            job_output: "output_file",
            job_type: {
                id: 1,
                name: "landsat8-parse",
                version: "1.0.0",
                title: "Landsat 8 Parse",
                description:
                    "The Landsat 8 satellite images the entire Earth every 16 days in an 8-day offset from Landsat 7. Data collected by the instruments onboard the satellite are available to download at no charge from GloVis, EarthExplorer, or via the LandsatLook Viewer within 24 hours of reception. Landsat 8 carries two instruments: The Operational Land Imager (OLI) sensor includes refined heritage bands, along with three new bands: a deep blue band for coastal/aerosol studies, a shortwave infrared band for cirrus detection*, and a Quality Assessment band. The Thermal Infrared Sensor (TIRS) provides two thermal bands. These sensors both provide improved signal-to-noise (SNR) radiometric performance quantized over a 12-bit dynamic range. (This translates into 4096 potential grey levels in an image compared with only 256 grey levels in previous 8-bit instruments.) Improved signal to noise performance enable better characterization of land cover state and condition. Products are delivered as 16-bit images (scaled to 55,000 grey levels).",
                revision_num: 1,
                icon_code: "f090"
            },
            recipe: {
                id: 60
            },
            recipe_node: "landsat8",
            recipe_type: _.sample(recipe_types),
            batch: {
                id: 15,
                title: "My Batch",
                description: "My batch of recipes",
                created: date
            },
            is_superseded: false,
            superseded: null
        });
    }

    if (_.keys(params).length > 0) {
        if (params.data_started && params.data_ended) {
            data.results = data.results.filter(result => {
                return (
                    moment
                        .utc(result.data_started)
                        .isSameOrAfter(moment.utc(params.data_started)) &&
                    moment
                        .utc(result.data_ended)
                        .isSameOrBefore(moment.utc(params.data_ended))
                );
            });
        }

        if (params.created_started && params.created_ended) {
            data.results = data.results.filter(result => {
                return (
                    moment
                        .utc(result.created)
                        .isSameOrAfter(moment.utc(params.created_started)) &&
                    moment
                        .utc(result.created)
                        .isSameOrBefore(moment.utc(params.created_ended))
                );
            });
        }

        if (params.order) {
            if (_.startsWith(params.order, "-")) {
                data.results = _.orderBy(
                    data.results,
                    [_.trimStart(params.order, "-")],
                    ["desc"]
                );
            } else {
                data.results = _.orderBy(data.results, [params.order], ["asc"]);
            }
        }

        if (params.job_type_id) {
            data.results = _.filter(data.results, function(r) {
                if (Array.isArray(params.job_type_id)) {
                    return _.includes(
                        params.job_type_id,
                        r.job_type.id.toString()
                    );
                }
                return r.job_type.id === parseInt(params.job_type_id);
            });
        }
        if (params.job_id) {
            data.results = _.filter(data.results, function(r) {
                if (Array.isArray(params.job_id)) {
                    return _.includes(params.job_id, r.job.id.toString());
                }
                return r.job.id === parseInt(params.job_id);
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size && data.count > params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    return data;
};
