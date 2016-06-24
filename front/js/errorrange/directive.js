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
