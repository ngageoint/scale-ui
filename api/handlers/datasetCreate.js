module.exports = function(request) {
    if (request.payload.dry_run) {
        return [
            {
                files: {
                    INPUT_FILE: [
                        32143
                    ]
                },
                json: {},
                version: "7"
            },
            {
                files: {
                    INPUT_FILE: [
                        32142
                    ]
                },
                json: {},
                version: "7"
            }
        ];
    }
    var payload = {
        "id": 1,
        "title": request.payload.title,
        "description": request.payload.description,
        "definition": request.payload.definition,
        "created": new Date().toISOString(),
        "members": [],
        "files": []
    };
    var datasetMembers = [];
    var datasetFiles = [];
    for (var i = 0; i < 5; i++) {
        var datasetMemberId = 15624 + i;
        var scaleFileId = 32142 + i;

        var member = {
            id: datasetMemberId,
            created: "2020-02-03T19:34:32.544308Z",
            file_ids: [scaleFileId]
        };
        datasetMembers.push(member)
        var datasetFileId = 15341 + i;
        var file = {
            id: datasetFileId,
            parameter_name: "INPUT_NAME",
            scale_file: {
                id: scaleFileId,
                file_name: `hello${i}.txt`,
                countries: []
            }
        };
        datasetFiles.push(file)
    }

    if (request.payload.data_started && request.payload.data_ended && request.payload.data_template) {
        payload.members = datasetMembers;
        payload.files = datasetFiles;
    }
    return payload;
}
