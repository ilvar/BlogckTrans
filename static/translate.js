/**
 * Created by ilvar on 11.05.14.
 */
var bltApp = angular.module('bltApp', ['ngSanitize']);

bltApp.controller('TranslateController', ['$scope', '$http', function TranslateController($scope, $http) {
    $scope.source_url = JSON.parse(localStorage['source_url'] || '""');
    $scope.source_text = JSON.parse(localStorage['source_text'] || '""');
    $scope.source_pieces = JSON.parse(localStorage['source_pieces'] || "[]");
    $scope.result_pieces = JSON.parse(localStorage['result_pieces'] || "[]");

    $scope.yandex_key = localStorage['yandex_key'] || '';
    $scope.result_format = localStorage['result_format'] || 'preview';

    $scope.loadSource = function() {
        $http.get('/read/?url=' + $scope.source_url).success(function(data) {
            if (data.article) {
                $scope.source_text = '';
                if (data.title) {
                    $scope.source_text += '# ' + data.title + '\n\n';
                }
                if (data.image && data.image.src) {
                    $scope.source_text += '![](' + data.image.src + ')\n\n';
                }
                $scope.source_text += data.article;
                _.each(data.movies, function(m) {
                    if (m.src) {
                        var iframe = '<iframe src="' + m.src + '" width=' + m.width + ' height=' + m.height + '></iframe>';
                        $scope.source_text += iframe + '\n\n';
                    }
                });
            }
        });
    };

    $scope.updateSource = function() {
        var have_title = false;
        if ($scope.source_text) {
            $scope.source_pieces = _.filter($scope.source_text.split('\n'), function (p) {
                return p;
            });
            $scope.result_pieces = _.map($scope.source_pieces, function (p) {
                if (p[0] == '#') {
                    have_title = true;
                    return '# ';
                }
                if (p[0] == '!' || p[0] == '[' || p[0] == '<') {
                    return p;
                }
                if (p.length < 100) {
                    if (!have_title ) {
                        have_title = true;
                        return '# ';
                    }
                    return '## '
                }
                return '';
            })

            localStorage['source_text'] = JSON.stringify($scope.source_text);
            localStorage['source_pieces'] = JSON.stringify($scope.source_pieces);
            localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        }
    };

    $scope.$watch('source_url', function(newValue) {
        if (newValue) {
            localStorage['source_url'] = JSON.stringify(newValue);
        }
    });

    $scope.$watchCollection('result_pieces', function(newValue) {
        localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        $scope.result_markdown = _.filter($scope.result_pieces, function(p) { return p; }).join('\n\n');
        $scope.result_html = Markdown($scope.result_markdown);
    });

    $scope.$watch('result_format', function(newValue) {
        localStorage['result_format'] = newValue;
    });

    $scope.$watch('yandex_key', function(newValue) {
        localStorage['yandex_key'] = newValue;
    });

    $scope.translateYandex = function($index) {
        var src = $scope.source_pieces[$index];
        var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=' + $scope.yandex_key;
        url += '&text=' + src + '&lang=en-ru';
        $http.get(url).success(function(result) {
            if (result.code == 200) {
                $scope.result_pieces[$index] += result.text[0];
            } else {
                alert('Translation error');
            }
        }).error(function(){
            alert('Translation error');
        });
    }
}]);
