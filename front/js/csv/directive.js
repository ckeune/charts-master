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
