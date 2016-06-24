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
