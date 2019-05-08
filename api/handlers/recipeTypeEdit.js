module.exports = function (request) {
    console.log(request.payload);
    // recipe type edit returns 204 no content
    return {};
};
