/*!
 * CubicBezier 贝塞尔曲线组件库 by 张荣帆
 */
(function () {
    'use strict';

    // 分离出CSS样式名，解耦合
    var classContainer = 'cb-container';
    var classPoint = 'cb-point';

    // 获取鼠标在元素上的X坐标
    function getOffsetX(pageX, elm, min, max) {
        var offsetLeft = elm.offsetLeft;
        var offsetParent = elm.offsetParent;
        while (offsetParent) {
            offsetLeft += offsetParent.offsetLeft;
            offsetParent = offsetParent.offsetParent;
        }

        offsetLeft = pageX - offsetLeft;
        if (offsetLeft < min)
            return min;
        else if (offsetLeft > max)
            return max;

        return offsetLeft;
    }

    // 获取鼠标在元素上的Y坐标
    function getOffsetY(pageY, elm, min, max) {
        var offsetTop = elm.offsetTop;
        var offsetParent = elm.offsetParent;
        while (offsetParent) {
            offsetTop += offsetParent.offsetTop;
            offsetParent = offsetParent.offsetParent;
        }

        offsetTop = pageY - offsetTop;
        if (offsetTop < min)
            return min;
        else if (offsetTop > max)
            return max;

        return offsetTop;
    }

    /**
     * Canvas绘图所用的默认样式
     * @type {{baselineColor: string, controlLineColor: string, controlLineShadowColor: string, bezierColor: string}}
     */
    CubicBezier.defaultStyle = {
        baselineColor: 'rgba(0, 0, 0, .4)',
        controlLineColor: 'white',
        controlLineShadowColor: 'rgba(0, 0, 0, .6)',
        bezierColor: 'black'
    };

    /**
     * 测试是否支持Canvas
     * @returns {boolean}
     */
    CubicBezier.supports = function () {
        return document.createElement('canvas').toString() == '[object HTMLCanvasElement]';
    };

    // Canvas绘图
    CubicBezier.stroke = function (context, width, height, x1, y1, x2, y2, controlLines, style) {
        context.clearRect(0, 0, width, height);

        if (controlLines) {
            context.restore();
            context.save();
            context.lineWidth = (width + height) / 2 * 0.02;
            context.strokeStyle = style.baselineColor;
            context.beginPath();
            context.moveTo(0, height);
            context.lineTo(width, 0);
            context.stroke();

            context.restore();
            context.save();
            context.strokeStyle = style.controlLineColor;
            context.lineWidth = (width + height) / 2 * 0.01;
            context.shadowColor = style.controlLineShadowColor;
            context.shadowBlur = 5;
            context.beginPath();
            context.moveTo(0, height);
            context.lineTo(x1, y1);
            context.moveTo(width, 0);
            context.lineTo(x2, y2);
            context.stroke();
        }

        context.restore();
        context.save();
        context.lineWidth = (width + height) / 2 * 0.02;
        context.strokeStyle = style.bezierColor;
        context.beginPath();
        context.moveTo(0, height);
        context.bezierCurveTo(x1, y1, x2, y2, width, 0);
        context.stroke();
    };

    /**
     * CubicBezier构造函数
     * @param width
     * @param height
     * @constructor
     */
    function CubicBezier(width, height) {

        var container, canvas, context, point1, point2;
        var x1 = 0, y1 = height, x2 = width, y2 = 0;
        var style = Object.create(CubicBezier.defaultStyle);
        var controlsAttached = false, isAdjusting = false;

        // 控制点MouseDown事件
        function point_mousedown(e) {
            e.preventDefault();

            document_mousemove.point = this;
            document.addEventListener('mousemove', document_mousemove);
            isAdjusting = true;
        }

        // Canvas MouseMove事件，借用document以防止移出边界
        function document_mousemove(e) {
            e.preventDefault();

            var x = getOffsetX(e.pageX, canvas, 0, width);
            var y = getOffsetY(e.pageY, canvas, 0, height);
            if (document_mousemove.point == point1) {
                x1 = x;
                y1 = y;
            } else if (document_mousemove.point == point2) {
                x2 = x;
                y2 = y;
            }

            document_mousemove.point.style.left = x + 'px';
            document_mousemove.point.style.top = y + 'px';
            CubicBezier.stroke(context, width, height, x1, y1, x2, y2, controlsAttached, style);

            // Adjust事件
            try {
                container.dispatchEvent(new Event('adjust'));
            } catch (error) {
                var event = document.createEvent('Event');
                event.initEvent('adjust', true, false);
                container.dispatchEvent(event);
            }
        }

        // Canvas MouseUp事件，借用document以防止移出边界
        function document_mouseup(e) {
            e.preventDefault();

            document.removeEventListener('mousemove', document_mousemove);
            document_mousemove.point = undefined;
            isAdjusting = false;
        }

        // 立即执行函数防止变量污染
        (function () {
            container = document.createElement('div');
            container.className = classContainer;
            container.style.width = width + ((width + height) / 2 * 0.05) + 'px';
            container.style.height = height + ((width + height) / 2 * 0.05) + 'px';

            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;

            point1 = document.createElement('span');
            point1.className = classPoint;
            point1.style.width = (width + height) / 2 * 0.05 + 'px';
            point1.style.height = (width + height) / 2 * 0.05 + 'px';
            point1.style.left = 0;
            point1.style.top = height + 'px';
            point1.style.display = 'none';

            point2 = document.createElement('span');
            point2.className = classPoint;
            point2.style.width = (width + height) / 2 * 0.05 + 'px';
            point2.style.height = (width + height) / 2 * 0.05 + 'px';
            point2.style.left = width + 'px';
            point2.style.top = 0;
            point2.style.display = 'none';

            container.appendChild(canvas);
            container.appendChild(point1);
            container.appendChild(point2);

            CubicBezier.stroke(context, width, height, x1, y1, x2, y2, controlsAttached, style);
        }());

        /**
         * Canvas绘图所用的样式
         * @type {CubicBezier.defaultStyle}
         */
        this.style = style;

        /**
         * 获取宽度
         * @returns {number}
         */
        this.width = function () {
            return width;
        };

        /**
         * 获取高度
         * @returns {number}
         */
        this.height = function () {
            return height;
        };

        /**
         * 获取整个元素
         * @returns {Element}
         */
        this.element = function () {
            return container;
        };

        /**
         * 获取Canvas
         * @returns {Element}
         */
        this.canvas = function () {
            return canvas;
        };

        /**
         * 判断是否正在调整控制点
         * @returns {boolean}
         */
        this.adjusting = function () {
            return isAdjusting;
        };

        /**
         * 强制重绘
         */
        this.reStroke = function () {
            CubicBezier.stroke(context, width, height, x1, y1, x2, y2, controlsAttached, style);
        };

        /**
         * 获取控制点
         * @param value
         * @returns {{x1: number, y1: number, x2: number, y2: number}}
         */
        this.points = function (value) {
            if (value) {
                if (value.x1 !== undefined)
                    x1 = value.x1;
                if (value.y1 !== undefined)
                    y1 = value.y1;
                if (value.x2 !== undefined)
                    x2 = value.x2;
                if (value.y2 !== undefined)
                    y2 = value.y2;

                point1.style.left = x1 + 'px';
                point1.style.top = y1 + 'px';
                point2.style.left = x2 + 'px';
                point2.style.top = y2 + 'px';

                CubicBezier.stroke(context, width, height, x1, y1, x2, y2, controlsAttached, style);
            }

            return {x1: x1, y1: y1, x2: x2, y2: y2};
        };

        /**
         * 获取相对于坐标系的控制点
         * @param value
         * @returns {{x1, y1, x2, y2}|{x1: number, y1: number, x2: number, y2: number}}
         */
        this.coordinates = function (value) {
            if (value) {
                value = Object.create(value);
                value.y1 = height - value.y1;
                value.y2 = height - value.y2;
            }

            var coordinates = this.points(value);
            coordinates.y1 = height - coordinates.y1;
            coordinates.y2 = height - coordinates.y2;

            return coordinates;
        };

        /**
         * 设置是否显示控制点和辅助线
         * @param boolean
         */
        this.controls = function (boolean) {
            if (controlsAttached == boolean)
                return;

            controlsAttached = !controlsAttached;
            if (controlsAttached) {
                point1.style.display = '';
                point1.addEventListener('mousedown', point_mousedown);

                point2.style.display = '';
                point2.addEventListener('mousedown', point_mousedown);

                document.addEventListener('mouseup', document_mouseup);
            } else {
                point1.style.display = 'none';
                point1.removeEventListener('mousedown', point_mousedown);

                point2.style.display = 'none';
                point2.removeEventListener('mousedown', point_mousedown);

                document.removeEventListener('mouseup', document_mouseup);
            }

            CubicBezier.stroke(context, width, height, x1, y1, x2, y2, controlsAttached, style);
        };
    }

    // 导出CubicBezier
    window.CubicBezier = CubicBezier;
}());
