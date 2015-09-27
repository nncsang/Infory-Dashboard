angular.module('home')

.controller('HomeCtrl', ['$scope', '$http', '$location', '$routeParams', 'remoteFactory', 'dataFactory', 'Auth', 'brandRemote', 'chartHelper', 'serviceHelper', 'eventRemote', 'compareHelper', 'homeFactory', 'dialogHelper',

    function($scope, $http, $location, $routeParams, remoteFactory, dataFactory, Auth, brandRemote, chartHelper, serviceHelper, eventRemote, compareHelper, homeFactory, dialogHelper) {
        /** Global variables **/
        var events = remoteFactory.meta_events,
            intervalDate = serviceHelper.getIntervalDate(),
            fields = [null, null, null, null];

        /** Scope variables **/
        $scope.brandId = $routeParams.brandId;
        $scope.dataChart = [{}, {}, {}];
        $scope.time_units = [{
            name: 'day',
            name_display: 'Day'
        }, {
            name: 'week',
            name_display: 'Week'
        }, {
            name: 'month',
            name_display: 'Month'
        }];
        $scope.data = [{
            dateDropDownInput: intervalDate.date_beg,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
        }, {
            dateDropDownInput: intervalDate.date_end,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
        }, {
            dateDropDownInput: intervalDate.date_beg,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
        }, {
            dateDropDownInput: intervalDate.date_end,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
        }, {
            dateDropDownInput: intervalDate.date_beg,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
        }, {
            dateDropDownInput: intervalDate.date_end,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
        }, {
            dateDropDownInput: intervalDate.date_beg,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
        }, {
            dateDropDownInput: intervalDate.date_end,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
        }];

        $scope.hideLoading = [false, false, false, false];

        /** Logic **/
        if ($scope.brandId != null) {
            dataFactory.updateBrandSideBar($scope.brandId);
            dataFactory.getBrand($scope.brandId, function(data) {
                $scope.brand = data;
            }, function() {})
        }

        $scope.updateTimeUnit = function(time_unit, id) {
            fields[id].time_unit = time_unit.name;
            updateChart(fields[id], id);
        };

        $scope.updateEventBookmark = function(isNeedUpdateEvent) {
            if (isNeedUpdateEvent)
                updateEvent();

            if ($scope.eventBookmark == null)
                return;

            fields[3] = {
                brand_id: $scope.brandId,
                event: $scope.eventBookmark.event,
                filter: $scope.eventBookmark.filter,
                time_unit: $scope.time_unit_4.name
            };

            if ($scope.eventBookmark.compare_by != undefined && $scope.eventBookmark.compare_by != '') {
                var object = JSON.parse($scope.eventBookmark.compare_by);
                for (var o in object)
                    $scope.compareUnit = getCompareTo({
                        name: object[o].property
                    });
            }

            var compareToObject = null;
            if ($scope.eventBookmark.compare_by != undefined && $scope.compareUnit.name_display != 'select property') {
                compareToObject = compareHelper.buildCompareToString($scope.compareUnit);
            }

            if (compareToObject != null) {
                fields[3].compare_by = JSON.stringify(compareToObject);
            }

            updateChart(fields[3], 3);
        }

        $scope.updateHome = function(brandId) {
            $scope.brandId = brandId;
            brandRemote.getHome({
                    brand_id: brandId
                }, function(data) {

                    var oldData = homeFactory.getHomeData(brandId);
                    if (oldData == null) {
                        $scope.brandInfo = data;
                        $scope.time_unit_1 = $scope.time_units[0];
                        $scope.time_unit_2 = $scope.time_units[0];
                        $scope.time_unit_3 = $scope.time_units[0];
                        $scope.time_unit_4 = $scope.time_units[0];

                        fields[0] = {
                            brand_id: $scope.brandId,
                            time_unit: $scope.time_unit_1.name,
                            date_beg: $scope.data[0].dateDropDownInput,
                            date_end: $scope.data[1].dateDropDownInput
                        };

                        fields[1] = {
                            brand_id: $scope.brandId,
                            time_unit: $scope.time_unit_2.name,
                            date_beg: $scope.data[2].dateDropDownInput,
                            date_end: $scope.data[3].dateDropDownInput
                        };


                        // fields[2] = {
                        //     brand_id: $scope.brandId,
                        //     time_unit: $scope.time_unit_3.name,
                        //     date_beg: $scope.data[4].dateDropDownInput,
                        //     date_end: $scope.data[5].dateDropDownInput
                        // };

                        updateChart(fields[0], 0);
                        updateChart(fields[1], 1);
                        //updateChart(fields[2], 2);

                        dataFactory.getBookmarks(brandId, function(data) {
                                $scope.eventBookmarks = data.bookmarks.event_bookmarks;
                                if ($scope.eventBookmarks.length > 0) {
                                    if (data.bookmarks.event_bookmarks[0].id != -1)
                                        $scope.eventBookmark = data.bookmarks.event_bookmarks[0];
                                    else
                                        $scope.eventBookmark = data.bookmarks.event_bookmarks[1];
                                    $scope.isHasBookmark = true;
                                } else {
                                    $scope.eventBookmark = null;
                                    $scope.isHasBookmark = false;
                                }

                                $scope.updateEventBookmark(true);
                                saveInfor();
                            },
                            function() {});

                    } else {
                        $scope.hideLoading = [true, true, true, true];
                        fields = oldData.fields;
                        $scope.dataChart = oldData.data_chart;
                        $scope.eventBookmarks = oldData.event_bookmarks;
                        $scope.eventBookmark = oldData.event_bookmark;
                        $scope.data = oldData.data;
                        $scope.brandInfo = oldData.brandInfo;

                        $scope.time_unit_1 = getTimeUnit(oldData.time_unit_1);
                        $scope.time_unit_2 = getTimeUnit(oldData.time_unit_2);
                        $scope.time_unit_3 = getTimeUnit(oldData.time_unit_3);
                        $scope.time_unit_4 = getTimeUnit(oldData.time_unit_4);

                        updateEvent();
                        if (oldData.compare_unit != null)
                            $scope.compareUnit = getCompareTo(oldData.compare_unit);

                        $scope.isHasBookmark = oldData.is_has_bookmark;
                    }

                },
                function() {});
        };

        function updateEvent() {
            if ($scope.eventBookmark == null)
                return;
            for (var i = 0; i < events.length; i++) {
                if (events[i].name == $scope.eventBookmark.event) {
                    $scope.event = events[i];
                    $scope.compareUnit = $scope.event.compare_properties[0];
                    break;
                }
            }
        }

        function getTimeUnit(old) {
            for (var i = 0; i < $scope.time_units.length; i++)
                if ($scope.time_units[i].name == old.name)
                    return $scope.time_units[i];
        }

        function getCompareTo(old) {
            for (var i = 0; i < $scope.event.compare_properties.length; i++)
                if ($scope.event.compare_properties[i].name == old.name)
                    return $scope.event.compare_properties[i];
        }

        function updateChart(field, id) {
            field.date_beg = $scope.data[id * 2].dateDisplay;
            field.date_end = $scope.data[id * 2 + 1].dateDisplay;
            $scope.hideLoading[id] = false;

            switch (id) {
                case 0:
                    brandRemote.getCostChart(field, function(data) {
                        $scope.hideLoading[id] = true;
                        if (data.error == undefined)
                            $scope.dataChart[id] = chartHelper.buildLineChartForHome(data, 'Service');
                        else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                    break;
                case 1:
                    brandRemote.getDevelopmentChart(field, function(data) {
                        $scope.hideLoading[id] = true;
                        if (data.error == undefined)
                            $scope.dataChart[id] = chartHelper.buildLineChartForHome(data, "User's activities");
                        else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                    break;
                    // case 2:
                    //     brandRemote.getCostChart(field, function(data) {
                    //         if (data.error == undefined)
                    //             $scope.dataChart[id] = chartHelper.buildLineChart(data, id + 1);
                    //         else
                    //             dialogHelper.showError(data.error.message);
                    //     }, function() {});
                    //     break;
                case 3:
                    eventRemote.count(field, function(data) {
                        $scope.hideLoading[id] = true;
                        if (data.error == undefined) {
                            if ($scope.compareUnit.name_display == 'hour' ||
                                $scope.compareUnit.name_display == 'weekday' ||
                                $scope.compareUnit.name_display == 'month') {
                                $scope.dataChart[id] = chartHelper.buildPieChart(data, getEventNameDisplay(field.event));
                            } else
                                $scope.dataChart[id] = chartHelper.buildLineChart(data, getEventNameDisplay(field.event));
                        } else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                    break;
            }

            saveInfor();
        }

        function getEventNameDisplay(name) {
            for (var i = 0; i < events.length; i++) {
                if (events[i].name == name)
                    return events[i].name_display;
            }
        }

        function saveInfor() {
            homeFactory.setHomeData({
                id: $scope.brandId,
                fields: fields,
                event_bookmarks: $scope.eventBookmarks,
                event_bookmark: $scope.eventBookmark,
                data_chart: $scope.dataChart,
                data: $scope.data,
                time_unit_1: $scope.time_unit_1,
                time_unit_2: $scope.time_unit_2,
                time_unit_3: $scope.time_unit_3,
                time_unit_4: $scope.time_unit_4,
                compare_unit: $scope.compareUnit,
                is_has_bookmark: $scope.isHasBookmark,
                brandInfo: $scope.brandInfo
            });
        }

        $scope.updateBrand = function(brand) {
            $scope.brand = brand;
        }

        dataFactory.setUpdateHomeBrandFunc($scope.updateBrand);
        dataFactory.setUpdateHomeFunc($scope.updateHome);

        $scope.onTimeSetOne = function(newDate, oldDate) {
            $scope.data[0].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[0] != null)
                updateChart(fields[0], 0);
        }

        $scope.onTimeSetTwo = function(newDate, oldDate) {
            $scope.data[1].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[0] != null)
                updateChart(fields[0], 0);
        }

        $scope.onTimeSetThree = function(newDate, oldDate) {
            $scope.data[2].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[1] != null)
                updateChart(fields[1], 1);
        }

        $scope.onTimeSetFour = function(newDate, oldDate) {
            $scope.data[3].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[1] != null)
                updateChart(fields[1], 1);
        }

        $scope.onTimeSetFive = function(newDate, oldDate) {
            $scope.data[4].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[2] != null)
                updateChart(fields[2], 2);
        }

        $scope.onTimeSetSix = function(newDate, oldDate) {
            $scope.data[5].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[2] != null) {
                updateChart(fields[2], 2);
            }
        }

        $scope.onTimeSetSeven = function(newDate, oldDate) {
            $scope.data[6].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[3] != null)
                updateChart(fields[3], 3);
        }

        $scope.onTimeSetEight = function(newDate, oldDate) {
            $scope.data[7].dateDisplay = serviceHelper.normalizeTime(newDate);
            if (fields[3] != null)
                updateChart(fields[3], 3);
        }

    }
])