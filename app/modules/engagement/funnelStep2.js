angular.module('engagement')
    .controller('FunnelStep2Ctrl', ['$scope', '$routeParams',
        '$location', 'dataFactory', 'remoteFactory', '$modal', 'filterHelper', 'funnelRemote', 'chartHelper',
        'serviceHelper', 'funnelFactory', 'bookmarkRemote', 'brandRemote', 'dialogHelper', 'compareHelper',
        function($scope, $routeParams, $location, dataFactory, remoteFactory, $modal, filterHelper,
            funnelRemote, chartHelper, serviceHelper, funnelFactory, bookmarkRemote, brandRemote, dialogHelper,
            compareHelper) {

            /** Global variables **/
            var brandId = $routeParams.brandId,
                intervalDate = serviceHelper.getIntervalDate(),
                step1Data = funnelFactory.getData(0, brandId),
                step2Data = funnelFactory.getData(1, brandId),
                fields = null,
                valueSuffix = 'unit(s)',
                unit = 'Unit',
                pros = {
                    id: brandId,
                    fields: '["funnel_bookmarks"]'
                },
                columnNames = [];


            /** Scope variables **/
            $scope.data = [{
                dateDropDownInput: intervalDate.date_beg,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
            }, {
                dateDropDownInput: intervalDate.date_end,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
            }];


            $scope.hideLoadingTable = true;
            $scope.showTable = false;


            /** Logic **/
            dataFactory.updateBrandSideBar(brandId);

            dataFactory.getMetaData(brandId, function(data) {
                $scope.metadata = data.meta_lists;
                $scope.metas = data.meta_property_types;
                $scope.events = data.meta_events;
                $scope.subfilters = null;
                run();                
            }, function() {});

            function run() {
                $scope.computeBys = [{
                    name: 'turn',
                    name_display: 'turn'
                }, {
                    name: 'customer',
                    name_display: 'customer'
                }],
                $scope.computeBy = $scope.computeBys[0];

                $scope.columnChart = {};
                $scope.hideLoading = false;

                $scope.currentEvents = [];
                $scope.currentEvent = null;
                $scope.currentEventIdx = -1;
                $scope.compareUnitName = "";

                $scope.tables = [];
                $scope.totalRows = [];


                if (step1Data == null) {                    
                    if (step2Data != null) {
                    }
                } else {
                    fields = step1Data.fields;

                    $scope.funnelBookmark = {
                        funnel: step1Data.fields.funnel
                    }                                       
                    updateChart(fields);                    
                }

                brandRemote.get(pros, function(data) {
                    if (data.error == undefined) {
                        data.funnel_bookmarks.unshift({
                            bookmark_name: 'Choose a saved funnel',
                            id: -1
                        });

                        $scope.funnelBookmarks = data.funnel_bookmarks;
                        $scope.funnelBookmark = data.funnel_bookmarks[0];

                        if (step1Data == null) {
                            if ($scope.funnelBookmarks.length >= 2) {
                                $scope.funnelBookmark = data.funnel_bookmarks[1];                                
                                $scope.changeFunnelBookmark($scope.funnelBookmark.id);                                
                            }
                            else
                            {                                                                                       
                                $scope.hideLoading = true;
                                $("#funnelChartData").html("<div style='margin-left:340px;line-height:410px;font-weight:bold'>No data to display</div>");
                            }
                        } else {                            
                            $scope.funnelBookmark.funnel = step1Data.fields.funnel;                            
                            $scope.hideLoading = true;
                        }
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {})
                

                $scope.changeFunnelBookmark = function(id) {
                    $('.z-dropdown').removeClass('open');
                    for (var i = 1; i < $scope.funnelBookmarks.length; i++) {
                        if ($scope.funnelBookmarks[i].id == id) {
                            $scope.funnelBookmark = $scope.funnelBookmarks[i];
                            fields = {
                                brand_id: brandId,
                                date_beg: $scope.data[0].dateDisplay,
                                date_end: $scope.data[1].dateDisplay,
                                by: $scope.computeBy.name,
                                funnel: $scope.funnelBookmark.funnel
                            };
                            updateChart(fields);
                            return;
                        }
                    }
                }

                $scope.updateCompareUnit = function() {
                    var compareToObject = null;

                    if ($scope.compareUnit.name_display != 'select property') {
                        compareToObject = compareHelper.buildCompareToString($scope.compareUnit);
                    }

                    if (compareToObject != null) {
                        $scope.compareUnitName = serviceHelper.capitaliseFirstLetter($scope.compareUnit.name_display);
                        compare_by = JSON.stringify(compareToObject);
                        updateTableData(compare_by, $scope.currentEventIdx);
                    }
                }

                $scope.updateComputeBy = function() {
                    fields.by = $scope.computeBy.name;
                    if ($scope.computeBy.name == 'turn') {
                        valueSuffix = 'turn';
                        unit = 'Turn';
                    } else {
                        valueSuffix = 'User';
                        unit = 'User';
                    }
                    updateChart(fields);
                };


                function updateChart(fields) {

                    $scope.hideLoading = false;
                    if (fields === null) {
                        console.log("Fields is null");
                    }
                    // reset all variable related to current event and table data
                    $scope.currentEvent = null;
                    $scope.currentEventIdx = -1;
                    $scope.tables = [];
                    $scope.compareUnitName = "";
                    $scope.totalRows = [];

                    funnelRemote.get(fields, function(data) {
                        $scope.hideLoading = true;
                        $scope.showTable = true;
                        $scope.currentEvents = [];

                        var filters = JSON.parse(fields.funnel);
                        columnNames = [];

                        // get current chart events
                        for (var i = 0; i < filters.length; i++) {
                            eventObj = getEventObj(filters[i].event);
                            columnNames.push(eventObj.name_display);
                            $scope.currentEvents.push(eventObj);
                        }

                        if (data.error == undefined) {
                            var values = [];
                            for (var i = 0; i < data.length; i++) {
                                values.push(data[i].count);

                                if (i > 0) {
                                    var row = createSingleTableRow("Overall", data, i);
                                    $scope.totalRows.push(row);
                                }
                            }
                            if (data.length >= 2) {
                                $scope.conversationRate = (100 * $scope.totalRows[$scope.totalRows.length - 1].currentStepCount / $scope.totalRows[0].previousStepCount).toFixed(2) + "%";
                            } else {
                                $scope.conversationRate = '';
                            }
                            $scope.columnChart = chartHelper.buildLineChartForFunnel(values, columnNames, valueSuffix, unit, updateTableEvent, $scope.totalRows, $scope.conversationRate);
                        } else
                            dialogHelper.showError(data.error.message);                
                    }, function() {});
                }


                $scope.goToStep1 = function() {
                    $location.path('/funnel/step1/' + brandId);
                }

                $scope.onTimeSetOne = function(newDate, oldDate) {
                    $scope.data[0].dateDisplay = serviceHelper.normalizeTime(newDate);

                    if (fields != null) {
                        fields.date_beg = $scope.data[0].dateDisplay;
                        updateChart(fields);
                    }
                }

                $scope.onTimeSetTwo = function(newDate, oldDate) {
                    $scope.data[1].dateDisplay = serviceHelper.normalizeTime(newDate);
                    if (fields != null) {
                        fields.date_end = $scope.data[1].dateDisplay;
                        updateChart(fields);
                    }
                }

                // Get event object via global events metadata
                function getEventObj(name) {
                    for (var i = 0; i < $scope.events.length; i++) {
                        if ($scope.events[i].name == name)
                            return $scope.events[i];
                    }
                }

                // fields is only provided in case there's table
                function updateTableEvent(eventIdx) {
                    $scope.currentEvent = $scope.currentEvents[eventIdx];
                    $scope.currentEventIdx = eventIdx;
                    $scope.tables = [];

                    // add a summary table when there's no filter is selected
                    for (i = 1; i <= eventIdx; i++) {
                        summaryTable = [];
                        summaryTable.push($scope.totalRows[i - 1]);
                        $scope.tables.push(summaryTable);
                    }

                    // add default compare unit 
                    $scope.compareUnit = $scope.currentEvent.compare_properties[0];
                    $scope.$apply(); // for ng-show working properly
                }

                function formatTimeInterval(timeInterval) {
                    var timeIntervalPattern = /(\d+)\:(\d+)\:(\d+)(.)+/i;

                    var result = timeInterval.match(timeIntervalPattern);
                    if (result[1] > 1)
                        hourStr = result[1] + " hour ";
                    else
                        hourStr = result[1] + " hour ";

                    if (result[2] > 1)
                        minuteStr = result[2] + " minute ";
                    else
                        minuteStr = result[2] + " minute ";

                    if (result[3] > 1)
                        secondStr = result[1] + " second ";
                    else
                        secondStr = result[1] + " second ";

                    formattedStr = hourStr + minuteStr + secondStr;

                    timeInterval = timeInterval.replace(timeIntervalPattern, formattedStr);

                    return timeInterval;
                }

                function createSingleTableRow(groupName, values, j) {
                    var row = [];

                    row.name = groupName;
                    row.previousStepCount = values[j - 1].count;
                    row.currentStepCount = values[j].count;
                    if (values[j].avg_time_from_last_step == null)
                        values[j].avg_time_from_last_step = "00:00:00";

                    row.avgTime = formatTimeInterval(values[j].avg_time_from_last_step);
                    if (values[j - 1].count != 0)
                        row.rateBetweenTwoStep = (100 * values[j].count / values[j - 1].count).toFixed(2) + "%";
                    else
                        row.rateBetweenTwoStep = '0.00%';

                    return row;
                }

                function updateTableData(compareBy, eventIdx) {
                    fields = {
                        brand_id: brandId,
                        date_beg: $scope.data[0].dateDisplay,
                        date_end: $scope.data[1].dateDisplay,
                        by: $scope.computeBy.name,
                        funnel: $scope.funnelBookmark.funnel,
                        compare_by: compareBy
                    };

                    $scope.hideLoadingTable = false;
                    funnelRemote.get(fields, function(data) {
                        $scope.hideLoading = true;
                        $scope.hideLoadingTable = true;

                        if (data.error == undefined) {
                            var values = data.values;
                            var groups = data.groups;
                            var tables = [];

                            // we have (eventIdx - 1) events, each event give us a table
                            for (j = 1; j <= eventIdx; j++) {
                                var table = [];

                                for (i = 0; i < groups.length; i++) {
                                    var row = createSingleTableRow(groups[i], values[i], j);
                                    table.push(row);
                                }

                                // push the total row
                                table.push($scope.totalRows[j - 1]);

                                tables.push(table);
                            }

                            // set table to $scope var
                            $scope.tables = tables;
                        } else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                }
            }
        }
    ])
