module.exports = function (request) {
    console.log(request)
    return require('../data/recipe-types-rev.json');
};
