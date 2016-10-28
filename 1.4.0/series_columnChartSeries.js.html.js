tui.util.defineNamespace("fedoc.content", {});
fedoc.content["series_columnChartSeries.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Column chart series component.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar Series = require('./series'),\n    BarTypeSeriesBase = require('./barTypeSeriesBase'),\n    chartConst = require('../const'),\n    predicate = require('../helpers/predicate'),\n    renderUtil = require('../helpers/renderUtil'),\n    calculator = require('../helpers/calculator');\n\nvar ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {\n    /**\n     * Column chart series component.\n     * @constructs ColumnChartSeries\n     * @extends Series\n     * @param {object} params parameters\n     *      @param {object} params.model series model\n     *      @param {object} params.options series options\n     *      @param {object} params.theme series theme\n     */\n    init: function() {\n        Series.apply(this, arguments);\n    },\n\n    /**\n     * Make start end tops.\n     * @param {number} endTop end top\n     * @param {number} endHeight end height\n     * @param {number} value value\n     * @param {boolean} isMinus whether minus or not\n     * @returns {{startTop: number, endTop: number}} start end tops\n     * @private\n     */\n    _makeStartEndTops: function(endTop, endHeight, value) {\n        var startTop;\n\n        if (value &lt; 0) {\n            startTop = endTop;\n        } else {\n            startTop = endTop;\n            endTop -= endHeight;\n        }\n\n        return {\n            startTop: startTop,\n            endTop: endTop\n        };\n    },\n\n    /**\n     * Make bound of column chart.\n     * @param {object} params parameters\n     *      @param {{left: number, width: number}} params.baseBound base bound\n     *      @param {number} params.startTop start top\n     *      @param {number} params.endTop end top\n     *      @param {number} params.endHeight end height\n     * @returns {{\n     *      start: {left: number, top: number, width: number, height: number},\n     *      end: {left: number, top: number, width: number, height: number}\n     * }} column chart bound\n     * @private\n     */\n    _makeColumnChartBound: function(params) {\n        return {\n            start: tui.util.extend({\n                top: params.startTop,\n                height: 0\n            }, params.baseBound),\n            end: tui.util.extend({\n                top: params.endTop,\n                height: params.endHeight\n            }, params.baseBound)\n        };\n    },\n\n    /**\n     * Make normal column chart bound.\n     * @param {{\n     *      dimension: {width: number, height: number},\n     *      groupValues: array.&lt;array.&lt;number>>,\n     *      groupSize: number, barSize: number, step: number,\n     *      distanceToMin: number, isMinus: boolean\n     * }} baseInfo base info\n     * @param {number} value value\n     * @param {number} paddingLeft padding left\n     * @param {number} index index\n     * @returns {{\n     *      start: {left: number, top: number, width: number, height: number},\n     *      end: {left: number, top: number, width: number, height: number}\n     * }} column chart bound\n     * @private\n     */\n    _makeNormalColumnChartBound: function(baseInfo, value, paddingLeft, index) {\n        var endHeight, endTop, startEndTops, bound;\n\n        endHeight = Math.abs(value * baseInfo.dimension.height);\n        endTop = (baseInfo.isMinus ? 0 : (baseInfo.distance.toMax || baseInfo.dimension.height)) + chartConst.SERIES_EXPAND_SIZE;\n        startEndTops = this._makeStartEndTops(endTop, endHeight, value);\n        bound = this._makeColumnChartBound(tui.util.extend({\n            baseBound: {\n                left: paddingLeft + (baseInfo.step * index) + chartConst.SERIES_EXPAND_SIZE,\n                width: baseInfo.barSize\n            },\n            endHeight: endHeight\n        }, startEndTops));\n\n        return bound;\n    },\n\n    /**\n     * Make bounds of normal column chart.\n     * @param {{width: number, height:number}} dimension column chart dimension\n     * @returns {array.&lt;array.&lt;object>>} bounds\n     * @private\n     */\n    _makeNormalColumnChartBounds: function(dimension) {\n        var baseInfo = this._makeBaseInfoForNormalChartBounds(dimension, 'height', 'width'),\n            bounds = this._makeNormalBounds(baseInfo, tui.util.bind(this._makeNormalColumnChartBound, this));\n\n        return bounds;\n    },\n\n    /**\n     * Make bounds of stacked column chart.\n     * @param {{width: number, height:number}} dimension column chart dimension\n     * @returns {array.&lt;array.&lt;object>>} bounds\n     * @private\n     */\n    _makeStackedColumnChartBounds: function(dimension) {\n        var that = this,\n            baseInfo = this._makeBaseInfoForStackedChartBounds(dimension, 'height'),\n            bounds = this._makeStackedBounds(dimension, baseInfo, function(baseBound, endSize, endPosition) {\n                return that._makeColumnChartBound({\n                    baseBound: baseBound,\n                    startTop: baseInfo.distance.toMax + chartConst.SERIES_EXPAND_SIZE,\n                    endTop: baseInfo.distance.toMax - endSize - endPosition,\n                    endHeight: endSize\n                });\n            });\n\n        return bounds;\n    },\n\n    /**\n     * Make bounds of column chart.\n     * @param {{width: number, height:number}} dimension column chart dimension\n     * @returns {array.&lt;array.&lt;object>>} bounds\n     * @private\n     */\n    _makeBounds: function(dimension) {\n        var bounds;\n\n        if (predicate.isValidStackedOption(this.options.stacked)) {\n            bounds = this._makeStackedColumnChartBounds(dimension);\n        } else {\n            bounds = this._makeNormalColumnChartBounds(dimension);\n        }\n\n        return bounds;\n    },\n\n    /**\n     * Make series rendering position\n     * @param {obeject} params parameters\n     *      @param {number} params.value value\n     *      @param {{left: number, top: number, width:number, width:number, height: number}} params.bound bound\n     *      @param {string} params.formattedValue formatted value\n     *      @param {number} params.labelHeight label height\n     * @returns {{left: number, top: number}} rendering position\n     */\n    makeSeriesRenderingPosition: function(params) {\n        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),\n            bound = params.bound,\n            top = bound.top,\n            left = bound.left + (bound.width - labelWidth) / 2;\n\n        if (params.value >= 0) {\n            top -= params.labelHeight + chartConst.SERIES_LABEL_PADDING;\n        } else {\n            top += bound.height + chartConst.SERIES_LABEL_PADDING;\n        }\n\n        return {\n            left: left,\n            top: top\n        };\n    },\n\n    /**\n     * Calculate sum label left position.\n     * @param {{left: number, top: number}} bound bound\n     * @param {string} formattedSum formatted sum.\n     * @returns {number} left position value\n     * @private\n     */\n    _calculateSumLabelLeftPosition: function(bound, formattedSum) {\n        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);\n        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);\n    },\n\n    /**\n     * Make plus sum label html.\n     * @param {array.&lt;number>} values values\n     * @param {{left: number, top: number}} bound bound\n     * @param {number} labelHeight label height\n     * @returns {string} plus sum label html\n     * @private\n     */\n    _makePlusSumLabelHtml: function(values, bound, labelHeight) {\n        var sum, formattedSum,\n            html = '';\n\n        if (bound) {\n            sum = calculator.sumPlusValues(values);\n            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());\n            html = this._makeSeriesLabelHtml({\n                left: this._calculateSumLabelLeftPosition(bound, formattedSum),\n                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING\n            }, formattedSum, -1, -1);\n        }\n\n        return html;\n    },\n\n    /**\n     * Make minus sum label html.\n     * @param {array.&lt;number>} values values\n     * @param {{left: number, top: number}} bound bound\n     * @returns {string} plus minus label html\n     * @private\n     */\n    _makeMinusSumLabelHtml: function(values, bound) {\n        var sum, formattedSum,\n            html = '';\n\n        if (bound) {\n            sum = calculator.sumMinusValues(values);\n            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());\n            html = this._makeSeriesLabelHtml({\n                left: this._calculateSumLabelLeftPosition(bound, formattedSum),\n                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING\n            }, formattedSum, -1, -1);\n        }\n\n        return html;\n    }\n});\n\nBarTypeSeriesBase.mixin(ColumnChartSeries);\n\nmodule.exports = ColumnChartSeries;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"