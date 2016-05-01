(function ($) {
    'use strict';

    if (!CubicBezier.supports())
        return;

    $(function () {

        // 分离出CSS样式名、ID、jQuery选择符，解耦合
        var classError = 'error';

        var idCanvasContainer = 'canvas-container';
        var idX1 = 'x1';
        var idY1 = 'y1';
        var idX2 = 'x2';
        var idY2 = 'y2';
        var idDuration = 'duration';
        var idPreview = 'preview';
        var idCode = 'code';
        var idPreviewBar = 'preview-bar';
        var idCodeBox = 'code-box';

        var queryCanvasContainer = '#' + idCanvasContainer;
        var queryX1 = '#' + idX1;
        var queryY1 = '#' + idY1;
        var queryX2 = '#' + idX2;
        var queryY2 = '#' + idY2;
        var queryDuration = '#' + idDuration;
        var queryPreview = '#' + idPreview;
        var queryCode = '#' + idCode;
        var queryPreviewBar = '#' + idPreviewBar;
        var queryCodeBox = '#' + idCodeBox;

        // 覆盖CubicBezier默认样式
        CubicBezier.defaultStyle.bezierColor = '#f1c40f';
        CubicBezier.defaultStyle.baselineColor = 'rgba(255,255,255,0.2)';
        CubicBezier.defaultStyle.controlLineShadowColor = 'rgba(255,255,255,0.2)';

        // 检查控制点的坐标
        function ensureRange(min, max, value) {
            if (isNaN(value))
                return NaN;
            else if (/^ *$/.test(value))
                return NaN;
            else if (value < min)
                return NaN;
            else if (value > max)
                return NaN;

            return parseFloat(value);
        }

        // 检查时长
        function ensureDuration(value) {
            value = value.trim().toLowerCase();

            if (!/^\d+(.\d+)*(ms|s)$/.test(value))
                return 0;
            return value;
        }

        var $cubicBezier = $(queryCanvasContainer).children();
        $cubicBezier.data('object', new CubicBezier($cubicBezier.get(0))) // 绑定到元素中以避免内存泄露
            .on('mouseenter', function () {
                $(this).data('object').controls(true);
            })
            .on('mouseleave', function () {
                // 鼠标移出时隐藏控制点
                var cubicBezier = $(this).data('object');
                if (!cubicBezier.adjusting())
                    cubicBezier.controls(false);
            })
            .on('adjust', function () {
                var cubicBezier = $(this).data('object');
                var coordinates = cubicBezier.coordinates();

                $(queryX1).val((coordinates.x1 / cubicBezier.width()).toFixed(2));
                $(queryY1).val((coordinates.y1 / cubicBezier.height()).toFixed(2));
                $(queryX2).val((coordinates.x2 / cubicBezier.width()).toFixed(2));
                $(queryY2).val((coordinates.y2 / cubicBezier.height()).toFixed(2));
            });

        $(queryX1 + ',' + queryY1 + ',' + queryX2 + ',' + queryY2).on('focus', function () {
                $(this).removeClass(classError);

                var cubicBezier = $(queryCanvasContainer).children().data('object');
                cubicBezier.controls(true);
            })
            .on('blur', function () {
                var cubicBezier = $(queryCanvasContainer).children().data('object');
                cubicBezier.controls(false);
            })
            .on('keyup', function () {
                var cubicBezier = $(queryCanvasContainer).children().data('object');
                var ensureRange0_1 = ensureRange.bind(undefined, 0, 1);
                var x1 = ensureRange0_1($(queryX1).val());
                var y1 = ensureRange0_1($(queryY1).val());
                var x2 = ensureRange0_1($(queryX2).val());
                var y2 = ensureRange0_1($(queryY2).val());

                // 更新CubicBezier
                if (!(isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)))
                    cubicBezier.coordinates({
                        x1: x1 * cubicBezier.width(),
                        y1: y1 * cubicBezier.height(),
                        x2: x2 * cubicBezier.width(),
                        y2: y2 * cubicBezier.height()
                    });
            });

        $(queryDuration).on('focus', function () {
            $(this).removeClass(classError);
        });

        $(queryPreview + ',' + queryCode).on('click', function () {
            var $x1 = $(queryX1);
            var $y1 = $(queryY1);
            var $x2 = $(queryX2);
            var $y2 = $(queryY2);

            var ensureRange0_1 = ensureRange.bind(undefined, 0, 1);
            var x1 = ensureRange0_1($x1.val());
            var y1 = ensureRange0_1($y1.val());
            var x2 = ensureRange0_1($x2.val());
            var y2 = ensureRange0_1($y2.val());

            if (isNaN(x1))
                $x1.addClass(classError);
            else
                $x1.removeClass(classError);
            if (isNaN(y1))
                $y1.addClass(classError);
            else
                $y1.removeClass(classError);
            if (isNaN(x2))
                $x2.addClass(classError);
            else
                $x2.removeClass(classError);
            if (isNaN(y2))
                $y2.addClass(classError);
            else
                $y2.removeClass(classError);

            if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2))
                return;

            var $duration = $(queryDuration);
            var duration = ensureDuration($duration.val());
            if (duration == 0) {
                $duration.addClass(classError);
                return;
            }

            var cubic_bezier = 'cubic-bezier(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')';
            if ($(this).is(queryPreview)) {
                var $previewBar = $(queryPreviewBar);
                $previewBar.removeAttr('style');

                setTimeout(function () {
                    $previewBar.css('transition-timing-function', cubic_bezier)
                        .css('transition-duration', duration)
                        .css('width', '100%');
                }, 10);
            } else if ($(this).is(queryCode)) {
                var transitionStyle = '';
                transitionStyle += '* {\n';
                transitionStyle += '    -webkit-transition: all ' + duration + ' ' + cubic_bezier + ';\n';
                transitionStyle += '    -moz-transition: all ' + duration + ' ' + cubic_bezier + ';\n';
                transitionStyle += '    transition: all ' + duration + ' ' + cubic_bezier + ';\n';
                transitionStyle += '}\n';

                $(queryCodeBox).css('display', 'block').children().text(transitionStyle);
                $('html,body').animate({scrollTop: $(queryCodeBox).offset().top});
            }
        });
    });
}(jQuery));
