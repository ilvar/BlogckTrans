/**
 * Created by ilvar on 11.05.14.
 */
var bltApp = angular.module('bltApp', ['ngSanitize']);

bltApp.controller('TranslateController', ['$scope', '$http', function TranslateController($scope, $http) {
    $scope.project_list = JSON.parse(localStorage['project_list'] || '[]');
    $scope.project_name = JSON.parse(localStorage['project_name'] || '""');
    $scope.source_url = JSON.parse(localStorage['source_url'] || '""');
    $scope.source_text = JSON.parse(localStorage['source_text'] || '""');
    $scope.source_pieces = JSON.parse(localStorage['source_pieces'] || "[]");
    $scope.result_pieces = JSON.parse(localStorage['result_pieces'] || "[]");

    $scope.yandex_key = localStorage['yandex_key'] || '';
    $scope.result_format = localStorage['result_format'] || 'preview';

    $scope.project = _.findWhere($scope.project_list, {name: $scope.project_name});

    $scope.loadSource = function() {
        $http.get('/read/?url=' + $scope.source_url).success(function(data) {
            if (data.article) {
                $scope.source_text = '';
                if (data.title) {
                    if (!$scope.project.name || $scope.project.name == 'Project') {
                        $scope.project.name = data.title;
                    }
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
                    if (!have_title && !$scope.project.name) {
                        $scope.project.name = p.substr(1);
                    }
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
            });

            $scope.saveData();
        }
    };

    $scope.saveData = function() {
        localStorage['source_text'] = JSON.stringify($scope.source_text);
        localStorage['source_url'] = JSON.stringify($scope.source_url);
        localStorage['source_pieces'] = JSON.stringify($scope.source_pieces);
        localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        localStorage['project_name'] = JSON.stringify($scope.project_name);
        localStorage['project_list'] = JSON.stringify($scope.project_list);
    };

    $scope.newProject = function() {
        $scope.source_url = '';
        $scope.source_text = '';
        $scope.project_name = 'Project';
        $scope.source_pieces = [];
        $scope.result_pieces = [];
        $scope.project = null;
    };

    $scope.saveProject = function() {
        var project_in_list = false;
        if (!$scope.project) {
            $scope.project = _.findWhere($scope.project_list, {name: $scope.project_name});
            project_in_list = $scope.project;
        }
        if (!$scope.project) {
            $scope.project = {
                name: $scope.project_name || 'Project',
                source_text: $scope.source_text,
                source_pieces: $scope.source_pieces,
                result_pieces: $scope.result_pieces
            }
        } else {
            $scope.project.name = $scope.project_name || 'Project';
            $scope.project.source_text = $scope.source_text;
            $scope.project.source_pieces = $scope.source_pieces;
            $scope.project.result_pieces = $scope.result_pieces;
            $scope.project.project_name = $scope.project_name;
        }
        if (!project_in_list) {
            $scope.project_list.push($scope.project);
        }
    }

    $scope.deleteProject = function() {
        if ($scope.project) {
            $scope.project_list = _.without($scope.project_list, $scope.project);
            $scope.newProject();
        }
    }

    $scope.loadProject = function(newValue) {
        $scope.project_name = $scope.project.name;
        $scope.source_url = $scope.project.source_url;
        $scope.source_text = $scope.project.source_text;
        $scope.source_pieces = $scope.project.source_pieces;
        $scope.result_pieces = $scope.project.result_pieces;
    };

    $scope.$watchCollection('project_list', function(newValue) {
        $scope.saveData();
    });

    $scope.$watchCollection('result_pieces', function(newValue) {
        localStorage['result_pieces'] = JSON.stringify($scope.result_pieces);
        $scope.result_markdown = _.filter($scope.result_pieces, function(p) { return p; }).join('\n\n');
        $scope.result_html = Markdown($scope.result_markdown);
        $scope.saveData();
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
