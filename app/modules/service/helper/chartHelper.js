'use strict';

angular.module('Smg')
    .factory('chartHelper',
        function() {
            return {
                buildLineChartForFunnel: function(values, columnNames, valueSuffix, unit, updateTableEvent, totalRows, conversationRate) {
                    var chartData = {
                        chart: {
                            type: 'column',
                            renderTo: 'container',
                            events: {
                                load: function() {
                                    var ren = this.renderer;

                                    for (var i = 0; i < totalRows.length; i++) {
                                        // (x, y) start position, d is radius of 45 degree rotated square
                                        //TODO: Refine the drawing algorithm for better positioning
                                        var x = this.plotLeft + (i + 1) * this.plotSizeX / this.pointCount - 30;
                                        var y = 215; // 210
                                        var d = 29;
                                        var fontSize = 10;

                                        // draw a rotated square
                                        ren.path(['M', x, y, 'L', x + d, y + d, x + 2 * d, y, x + d, y - d, 'Z'])
                                            .attr({
                                                'stroke-width': 2,
                                                stroke: 'silver'
                                            })
                                            .add();

                                        ren.label(totalRows[i].rateBetweenTwoStep, x + 8, y - 9)
                                        // x + 8, y - 10 for centering the label
                                        .css({
                                            fontWeight: 'bold'
                                        })
                                            .add();
                                    }
                                    if (conversationRate != '') {
                                        ren.label("Conversation Rate: " + conversationRate, this.plotSizeX - 100, 10)
                                        // x + 8, y - 10 for centering the label
                                        .css({
                                            fontWeight: 'bold'
                                        })
                                            .add();
                                    }

                                }
                            }
                        },
                        title: {
                            text: 'Funnel ',
                            x: -20 //center
                        },
                        subtitle: {
                            text: 'Source: infory.vn',
                            x: -20
                        },
                        xAxis: {
                            categories: columnNames
                        },
                        yAxis: {
                            title: {
                                text: unit
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        tooltip: {
                            valueSuffix: ' ' + valueSuffix
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0
                        },
                    };

                    chartData.plotOptions = {
                        series: {
                            cursor: 'pointer',
                            point: {
                                events: {
                                    click: function() {
                                        if (this.x != 0) {
                                            for (var i = 0; i < this.series.data.length; i++) {
                                                this.series.data[i].update({
                                                    color: '#2f7ed8'
                                                }, true, false);
                                            }
                                            this.update({
                                                color: '#f00'
                                            }, true, false)
                                            updateTableEvent(this.x);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    chartData.series = [{
                        name: ' ',
                        data: values
                    }];

                    return chartData;
                },
                buildLineChartForHome: function(data, event) {
                    var chartData = {
                        chart: {
                            type: 'line'
                        },
                        title: {
                            text: event,
                            x: -20 //center
                        },
                        subtitle: {
                            text: 'Source: infory.vn',
                            x: -20
                        },
                        xAxis: {
                            categories: data.time
                        },
                        yAxis: {
                            title: {
                                text: 'turn '
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        tooltip: {
                            valueSuffix: ' turn'
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0
                        },

                    };

                    if (data.time == undefined) {
                        chartData.xAxis.categories = data.groups;
                        chartData.series = [];
                        chartData.series.push({
                            name: 'user',
                            data: data.values
                        })
                    } else {

                        if (data.groups == undefined) {
                            chartData.series = [{
                                name: event,
                                data: data.values
                            }];
                        } else {
                            chartData.series = [];
                            for (var i = 0; i < data.groups.length; i++) {
                                chartData.series.push({
                                    name: data.groups[i],
                                    data: data.values[i]
                                })
                            }
                        }
                    }

                    return chartData;
                },
                buildLineChart: function(data, event) {
                    var chartData = {
                        chart: {
                            type: 'line'
                        },
                        title: {
                            text: event + ' count over time',
                            x: -20 //center
                        },
                        subtitle: {
                            text: 'Source: infory.vn',
                            x: -20
                        },
                        xAxis: {
                            categories: data.time
                        },
                        yAxis: {
                            title: {
                                text: 'turn '
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        tooltip: {
                            valueSuffix: ' turn'
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0
                        }
                    };

                    if (data.time == undefined) {
                        chartData.xAxis.categories = data.groups;
                        chartData.series = [];
                        chartData.series.push({
                            name: 'user',
                            data: data.values
                        })
                    } else {

                        if (data.groups == undefined) {
                            chartData.series = [{
                                name: event,
                                data: data.values
                            }];
                        } else {
                            chartData.series = [];
                            for (var i = 0; i < data.groups.length; i++) {
                                chartData.series.push({
                                    name: data.groups[i],
                                    data: data.values[i]
                                })
                            }
                        }
                    }

                    return chartData;
                },
                buildPieChartForHome: function(data, event) {
                    if (data.groups == undefined)
                        return '';

                    var chartData = {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false
                        },
                        title: {
                            text: event,
                        },
                        tooltip: {
                            pointFormat: '{<b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    color: '#000000',
                                    connectorColor: '#000000',
                                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                                }
                            }
                        },
                        series: [{
                            name: 'Value',
                            type: 'pie',
                            data: []
                        }]
                    };
                    if (data.time != undefined) {
                        for (var i = 0; i < data.groups.length; i++) {
                            var sum = 0;
                            for (var j = 0; j < data.values[i].length; j++)
                                sum += data.values[i][j];

                            chartData.series[0].data.push({
                                name: data.groups[i],
                                y: sum
                            });
                        }
                    } else {
                        for (var i = 0; i < data.groups.length; i++) {
                            chartData.series[0].data.push({
                                name: data.groups[i],
                                y: data.values[i]
                            });
                        }
                    }
                    return chartData;

                },
                buildPieChart: function(data, event) {
                    if (data.groups == undefined)
                        return '';

                    var chartData = {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false
                        },
                        title: {
                            text: event + ' count over time',
                        },
                        tooltip: {
                            pointFormat: '{<b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    color: '#000000',
                                    connectorColor: '#000000',
                                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                                }
                            }
                        },
                        series: [{
                            name: 'Value',
                            type: 'pie',
                            data: []
                        }]
                    };
                    if (data.time != undefined) {
                        for (var i = 0; i < data.groups.length; i++) {
                            var sum = 0;
                            for (var j = 0; j < data.values[i].length; j++)
                                sum += data.values[i][j];

                            chartData.series[0].data.push({
                                name: data.groups[i],
                                y: sum
                            });
                        }
                    } else {
                        for (var i = 0; i < data.groups.length; i++) {
                            chartData.series[0].data.push({
                                name: data.groups[i],
                                y: data.values[i]
                            });
                        }
                    }
                    return chartData;

                },
                buildColumnChart: function(data, event) {
                    if (data.groups == undefined)
                        return '';

                    var chartData = {
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: event + ' count over time',
                        },
                        subtitle: {
                            text: 'Source: infory.vn',
                        },
                        xAxis: {
                            categories: data.time
                        },
                        yAxis: {
                            min: 0
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y:.1f} người dùng</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: []
                    };

                    if (data.time != undefined) {
                        for (var i = 0; i < data.groups.length; i++) {
                            chartData.series.push({
                                name: data.groups[i],
                                data: data.values[i]
                            })
                        }
                    } else {
                        chartData.xAxis.categories = data.groups;
                        chartData.series = [{
                            name: event,
                            data: data.values
                        }];
                    }
                    return chartData;
                }
            }
        }
);
