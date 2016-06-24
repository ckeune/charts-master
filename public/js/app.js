'use strict';

angular.module('generator', ['perfect', 'csvMagic']);
angular.module('generator').run();


(function () {
    'use strict';

    angular.module('csvMagic', []);

    var magic = ''+
        '<div class="csv-magic flex-row">'+
            '<div>'+
                '<input type="file" id="fileinput">'+
                '<a href="" ng-click="update()" class="button">Update graph</a>'+
            '</div>'+
            '<div>'+
                '<a id="downloadblank" class="button">Download blank</a>'+
            '</div>'+
        '</div>';

    angular.module('csvMagic').directive('csvMagic', [function () {
        return {
            replace: true,
            scope: {
                question: '=',
                answers: '='
            },
            template: magic,
            controller: ['$scope', function ($s) {
                var self = this;

                this.init = function (element) {
                    self.input = element[0].querySelector('#fileinput');
                    self.input.onchange = function () {
                        self.update();
                    };

                    var blankA = element[0].querySelector('#downloadblank');
                    createBlank(blankA);
                };

                var createBlank = function (element) {
                    var header = [
                        ['Question', ''],
                        ['Answer', 'Control rate', 'Exposed rate', 'Significance color', 'Min lift', 'Absolute lift', 'Max lift']
                    ];
                    var csvContent = 'data:text/csv;charset=utf-8,';
                    header.forEach(function (row, index) {
                        csvContent += index < header.length ? (row.join(',') + '\n') : row.join(',');
                    });
                    var encoded = encodeURI(csvContent);
                    element.setAttribute('href', encoded);
                    element.setAttribute('download', 'blank_charts.csv');
                };

                this.update = function () {
                    if (!(self.input.files.length)) return false;
                    var file = self.input.files[0];

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = reader.result.split(/\r?\n/);
                        console.log('Init', data);
                        data = data.filter(function (row) { return row.length; }).map(function (row) {
                            return row.split(',');
                        });
                        console.log('Split', data);
                        var converted = convertToAnswers(data);
                        $s.question = converted[0];
                        $s.answers = converted[1];
                    };
                    reader.readAsText(file);
                };

                var convertToAnswers = function (data) {
                    var question = data.shift();
                    data.shift();
                    return [question[1], data.map(function (row) {
                        return {
                            copy: row[0],
                            control: row[1],
                            exposed: row[2],
                            color: row[3],
                            range: [row[4], row[5], row[6]]
                        };
                    })];
                };
            }],
            link: function ($s, element, attrs, ctrl) {
                ctrl.init(element);

                $s.update = ctrl.update;
            }
        };
    }]);
})();

(function () {
    angular.module('errorRange', []);
    var errorRange = ''+
    '<figure class="essrange flex-row">'+
        '<div class="essrange__min" display="{{low}}%" style="flex: 0 1 {{minWidth}}%"></div>'+
        '<div class="essrange__bar"></div>'+
        '<div class="essrange__max" display="{{high}}%" style="flex: 0 1 {{maxWidth}}%"></div>'+
        '<div ng-class="{\'show-label\': showCircleLabel}" class="essrange__val" display="{{val}}%" style="left: calc({{valPos}}% - .5rem)"></div>'+
    '</figure>';
    angular.module('errorRange').directive('essRange', [function () {
        return {
            scope: {
                min: '=',
                max: '=',
                high: '=',
                low: '=',
                val: '=',
                showCircleLabel: '='
            },
            template: errorRange,
            link: function ($s, element, attrs) {
                $s.$watch('min+max+high+low+val', function () {
                    var range = $s.max - $s.min;
                    $s.minWidth = (($s.low - $s.min) / range) * 100;
                    $s.maxWidth = (($s.max - $s.high) / range) * 100;
                    $s.valPos = (($s.val - $s.min) / range) * 100;
                });
            }
        }
    }]);
}());

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

(function () {
    'use strict';

    var progress = ''+
        '<span class="progress-container">'+
            '<span class="progress-value"></span>'+
        '</span>';

    angular.module('perfect').directive('cprogress', [function () {
        return {
            scope: {
                max: '=',
                value: '='
            },
            template: progress,
            link: function ($s, element, attrs) {
                var valEl =  element[0].querySelector('.progress-value');
                $s.$watch('max+value', function () {
                    valEl.style.width = (($s.value / $s.max) * 100)+'%';
                });
            }
        };
    }]);
})();
