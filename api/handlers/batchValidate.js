module.exports = function (request) {
    var errors = [];
    if (!request.payload.recipe_type_id){
        errors.push({
            "name": "NO_RECIPES",
            "description": "Batch definition must result in creating at least one recipe"
        });
    }

    if(!request.payload.definition.dataset) {
        errors.push({
            "name": "NO_RECIPES",
            "description": "Batch definition must result in creating at least one recipe"
        });
    }

    var is_valid = true;

    if(errors.length) {
        is_valid = false;
    }

    var payload = {
        "recipe_type": {
            "id": request.payload.recipe_type_id ? request.payload.recipe_type_id : null,
            "name": "scale-count",
            "title": "Scale Count",
            "description": "Runs the Scale Count job. This recipe type can be useful for testing Scale's log outputs.",
            "revision_num": 1
        },
        "is_valid": is_valid,
        "recipes_estimated": 6,
        "errors": errors,
        "warnings": [{"name": "Test Warning", "description": "Test Warning!"}]
    };

    return payload;
};
