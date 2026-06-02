var app = angular.module("xenon-app");

app
  .filter("propsFilter", function () {
    return function (items, props) {
      if (!angular.isArray(items)) {
        // Let the output be the input untouched
        return items;
      }

      var out = [];
      items.forEach(function (item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          if (item[prop].toString().toLowerCase().indexOf(props[prop].toLowerCase()) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
      return out;
    };
  })
  .filter("makePositive", function () {
    return function (num) {
      return Math.abs(num);
    };
  })
  .filter("commaspliter", function () {
    return function (input) {
      return input.split(",");
    };
  })
  .filter("commatojson", function () {
    return function (input) {
      return input.split(",").map((x) => ({key:x,value:x}));
    };
  });

