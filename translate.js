/**
 * Created by ilvar on 11.05.14.
 */


var bltApp = angular.module('bltApp', ['ngSanitize']);

bltApp.controller('TranslateController', ['$scope', function TranslateController($scope) {
    $scope.source_url = JSON.parse(localStorage['source_url'] || '""');
    $scope.source_text = JSON.parse(localStorage['source_text'] || '""');
    $scope.source_pieces = JSON.parse(localStorage['source_pieces'] || "[]");
    $scope.result_pieces = JSON.parse(localStorage['result_pieces'] || "[]");

    $scope.result_format = $scope.result_format || 'preview';

    $scope.updateSource = function() {
        var have_title = false;
        if ($scope.source_text) {
            $scope.source_pieces = _.filter($scope.source_text.split('\n'), function (p) {
                return p;
            });
            $scope.result_pieces = _.map($scope.source_pieces, function (p) {
                if (p.length < 100) {
                    if (!have_title ) {
                        have_title = true;
                        return '#';
                    }
                    return '##'
                }
                return '';
            })

            localStorage['source_url'] = JSON.stringify($scope.source_url);
            localStorage['source_text'] = JSON.stringify($scope.source_text);
            localStorage['source_pieces'] = JSON.stringify($scope.source_pieces);
            localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        }
    };

    $scope.$watch('result_format', function(newValue) {
        localStorage['result_format'] = newValue;
    });

    $scope.$watchCollection('result_pieces', function(newValue) {
        localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        var result_pieces = _.filter($scope.result_pieces, function(p) { return p; });

        $scope.result_markdown = _.map(result_pieces, function(p, i) {
            return p;
        }).join('\n\n');
        $scope.result_html = Markdown($scope.result_markdown);
    });
}]);