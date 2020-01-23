module.exports = function(request) {
    var payload = {
        "id": 1,
        "title": request.payload.title,
        "description": request.payload.description,
        "created": new Date().toISOString(),
        "definition": request.payload.definition,
        "members": request.payload.data,
    };
    if (request.payload.files) {
        payload.files = request.payload.files
    }
    return payload;
}
