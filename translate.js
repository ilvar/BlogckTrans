/**
 * Created by ilvar on 11.05.14.
 */


function TranslateController($scope) {
    $scope.source_url = JSON.parse(localStorage['source_url'] || '""');
    $scope.source_text = JSON.parse(localStorage['source_text'] || '""');
    $scope.source_pieces = JSON.parse(localStorage['source_pieces'] || "[]");
    $scope.result_pieces = JSON.parse(localStorage['result_pieces'] || "[]");

    $scope.updateSource = function() {
        if ($scope.source_text) {
            $scope.source_pieces = _.filter($scope.source_text.split('\n'), function (p) {
                return p;
            });
            $scope.result_pieces = _.map($scope.source_pieces, function () {
                return '';
            })

            localStorage['source_url'] = JSON.stringify($scope.source_url);
            localStorage['source_text'] = JSON.stringify($scope.source_text);
            localStorage['source_pieces'] = JSON.stringify($scope.source_pieces);
            localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        }
    };

    $scope.$watchCollection('result_pieces', function(newValue) {
        localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        var result_pieces = _.filter($scope.result_pieces, function(p) { return p; });

        $scope.result_markdown = _.map(result_pieces, function(p, i) {
            if ($scope.source_pieces[i].length > 100) {
                return p;
            } else {
                return '## ' + p;
            }
        }).join('\n\n');
        $scope.result_html = Markdown($scope.result_markdown);
    });
}