(function () {
    'use strict';
    angular.module('perfect', ['errorRange']);
    var perfect = ''+
        '<figure class="perfect flex-col">'+
            '<div class="perfect__header flex-row">'+
                '<div class="perfect__header--question"><span ng-show="data.question">Q:</span> {{data.question}}</div>'+
                '<div class="perfect__header--relative" ng-if="showRelativeLift">Relative lift</div>'+
                '<div class="perfect__header--observed" ng-class="{wider: !showRelativeLift}">Absolute lift</div>'+
                '<div class="perfect__header--range" ng-class="{wider: !showRelativeLift}">Lift range</div>'+
            '</div>'+
            '<div class="perfect__answer flex-row align-middle" ng-repeat="answer in data.answers">'+
                '<div class="perfect__answer--copy">{{answer.copy}}</div>'+
                '<div class="perfect__answer--split">'+
                    '<div>'+
                        '<cprogress class="control" max="maxPercent" value="answer.control"></cprogress>'+
                        '<label style="left: {{(answer.control / maxPercent) * 100}}%">{{answer.control | number:barDec}}%</label>'+
                    '</div>'+
                    '<div>'+
                        '<cprogress class="exposed" max="maxPercent" value="answer.exposed"></cprogress>'+
                        '<label style="left: {{(answer.exposed / maxPercent) * 100}}%">{{answer.exposed | number:barDec}}%</label>'+
                    '</div>'+
                '</div>'+
                '<div class="perfect__answer--relative {{answer.color}}" ng-if="showRelativeLift">{{((answer.exposed / answer.control) - 1) * 100.0 | number:relativeDec | pn}}%</div>'+
                '<div class="perfect__answer--observed {{answer.color}}" ng-class="{wider: !showRelativeLift}">{{answer.exposed - answer.control | number:observedDec | pn}}%</div>'+
                '<div class="perfect__answer--range" ng-class="{wider: !showRelativeLift}">'+
                    '<ess-range min="minRange" max="maxRange" high="answer.range[2]" low="answer.range[0]" val="answer.range[1]" class="{{answer.color}}" show-circle-label="showCircleLabel"></ess-range>'+
                '</div>'+
            '</div>'+
        '</figure>';
    angular.module('perfect').directive('perfect', [function () {
        return {
            scope: {
                data: '=',
                barDec: '=',
                observedDec: '=',
                relativeDec: '=',
                showCircleLabel: '=',
                showRelativeLift: '='
            },
            template: perfect,
            link: function ($s, element, attrs) {
                $s.$watch('data', function () {
                    var _mr = $s.data.answers.reduce(function (r, c) {
                        return (parseFloat(c.range[2]) > r) ? parseFloat(c.range[2]) : r;
                    }, -100);
                    $s.maxRange = _mr + (_mr * 0.1);
                    $s.minRange = $s.data.answers.reduce(function (r, c) {
                        return (parseFloat(c.range[0]) < r) ? parseFloat(c.range[0]) : r;
                    }, 100);

                    $s.maxPercent = $s.data.answers.reduce(function (r, c) {
                        if (c.control > r) r = parseFloat(c.control);
                        if (c.exposed > r) r = parseFloat(c.exposed);
                        return r;
                    }, -100);

                    if ($s.maxPercent > 10) {
                        $s.maxPercent += 10;
                    } else if ($s.maxPercent > 1) {
                        $s.maxPercent += 1;
                    } else if ($s.maxPercent > 0.1) {
                        $s.maxPercent += 0.1;
                        $s.barDec = 1;
                    } else if ($s.maxPercent > 0.01) {
                        $s.maxPercent += 0.01;
                        $s.barDec = 2;
                    } else if ($s.maxPercent > 0.001) {
                        $s.maxPercent += 0.001;
                        $s.barDec = 3;
                    } else if ($s.maxPercent > 0.0001) {
                        $s.maxPercent += 0.0001;
                        $s.barDec = 4;
                    } else if ($s.maxPercent > 0.00001) {
                        $s.maxPercent += 0.00001;
                        $s.barDec = 5;
                    } else if ($s.maxPercent > 0.000001) {
                        $s.maxPercent += 0.000001;
                        $s.barDec = 6;
                    } else if ($s.maxPercent > 0.0000001) {
                        $s.maxPercent += 0.0000001;
                        $s.barDec = 7;
                    }
                }, true);
            }
        }
    }]);

    angular.module('perfect').filter('pn', function () {
        return function (num) {
            return (num > 0) ? '+' + num : num;
        }
    });

    angular.module('perfect').controller('perfect', ['$scope', function ($s) {

        $s.render = renderer;

        $s.width = 100;
        $s.theme = '';
        $s.barDec = 1;
        $s.observedDec = 1;
        $s.relativeDec = 1;
        $s.showCircleLabel = true;
        $s.showRelative = true;
        $s.maxPercentage = 100;
        $s.data = {
            question: '',
            answers: []
        };
    }]);

    function renderer(title) {
        console.log(title);
        var a = document.createElement("a");
        document.body.appendChild(a);

        domtoimage.toBlob(document.querySelector('#render-me')).then(function (blob) {
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = title+'.png';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }
}());
