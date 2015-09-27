angular.module('engagement')

.controller('SegmentationCtrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'filterHelper', 'eventRemote', 'chartHelper', 'compareHelper', 'serviceHelper', 'bookmarkRemote', 'homeFactory', 'segmentationFactory', 'dataFactory', 'queryHelper', 'dialogHelper',

    function($scope, $routeParams, $location, remoteFactory, filterHelper, eventRemote, chartHelper, compareHelper, serviceHelper, bookmarkRemote, homeFactory, segmentationFactory, dataFactory, queryHelper, dialogHelper) {

        /** Global variables **/
        var brandId = $routeParams.brandId,
            intervalDate = serviceHelper.getIntervalDate(),
            fields = null,
            oldData = segmentationFactory.getData(brandId),
            bounds = [],
            isNeedFitMap = true;


        /** Scope variables **/
        $scope.hideLoading = true;
        $scope.mapInstance = null;
        $scope.isVisibleFilter = false;
        $scope.oldsubfilters = [];

        angular.extend($scope, {
            map: {
                center: {
                    latitude: 10.758721, // default value, just for initial purpose
                    longitude: 106.691930
                },
                draggable: true,
                zoom: 12,
                control: {},
                events: {
                    tilesloaded: function(map) {
                        $scope.$apply(function() {
                            $scope.mapInstance = map;
                            if (bounds.length != 0 && isNeedFitMap) {
                                $scope.map.control.getGMap().fitBounds(bounds);
                                isNeedFitMap = false;
                            }
                        });
                    }
                }
            }
        });

        dataFactory.getMetaData(brandId, function(data) {
            $scope.metadata = data.meta_lists;
            $scope.metas = data.meta_property_types;
            $scope.events = data.meta_events;
            $scope.subfilters = [];
            $scope.oldsubfilters = [];
            $scope.isVisibleFilter = true;
            run();
        }, function() {});

        function run() {
            $scope.markers = [];

            $scope.chartTypes = [{
                display_name: "Line",
                id: 0
            }, {
                display_name: "Pie",
                id: 1
            }, {
                display_name: "Bar",
                id: 2
            }, {
                display_name: "Map",
                id: 3
            }];

            $scope.chartTypeSubs = [{
                display_name: "Line",
                id: 0
            }, {
                display_name: "Map",
                id: 3
            }];

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

            $scope.hideTypeChart = true;
            $scope.chartData = [{}, {}, {}];

            $scope.data = [{
                dateDropDownInput: intervalDate.date_beg,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
            }, {
                dateDropDownInput: intervalDate.date_end,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
            }];

            /** Logic **/

            dataFactory.updateBrandSideBar(brandId);

            $scope.changeChartId = function(obj) {
                if (obj != null) {
                    $scope.chartId = obj.id;
                    saveInfor();
                }
            }

            if (oldData != null) {
                $scope.markers = oldData.markers;
                bounds = oldData.bounds;

                for (var i = 0; i < $scope.chartTypes.length; i++)
                    if ($scope.chartTypes[i].id == oldData.chartType.id) {
                        $scope.chartType = $scope.chartTypes[i];
                        break;
                    }

                for (var i = 0; i < $scope.chartTypeSubs.length; i++)
                    if ($scope.chartTypeSubs[i].id == oldData.chartTypeSub.id) {
                        $scope.chartTypeSub = $scope.chartTypeSubs[i];
                        break;
                    }

                for (var i = 0; i < $scope.time_units.length; i++)
                    if ($scope.time_units[i].name == oldData.time_unit.name) {
                        $scope.time_unit = $scope.time_units[i];
                        break;
                    }

                $scope.event = oldData.event;

                for (var i = 0; i < $scope.event.compare_properties.length; i++)
                    if ($scope.event.compare_properties[i].name == oldData.compareUnit.name) {
                        $scope.compareUnit = $scope.event.compare_properties[i];
                        break;
                    }


                $scope.chartId = oldData.chartId;


                $scope.time_unit = getTimeUnit(oldData.time_unit.name);
                $scope.compareUnit = getCompareTo(oldData.compareUnit);

                $scope.hideTypeChart = oldData.hideTypeChart;
                $scope.chartData = oldData.chartData;
                $scope.data = oldData.data;

                $scope.oldsubfilters = oldData.oldsubfilters;

                fields = oldData.fields;

                $scope.eventBookmark = oldData.eventBookmark;
                $scope.eventBookmarks = oldData.eventBookmarks;
                $scope.isHasBookmark = oldData.isHasBookmark;
            } else {
                $scope.time_unit = $scope.time_units[0];
                $scope.chartType = $scope.chartTypes[0];
                $scope.chartTypeSub = $scope.chartTypeSubs[0];
                $scope.chartId = 0;

                $scope.event = $scope.events[0];
                $scope.compareUnit = $scope.event.compare_properties[0];

                dataFactory.getBookmarks(brandId, function(data) {
                        data.bookmarks.event_bookmarks.unshift({
                            bookmark_name: 'Choose a saved bookmark',
                            id: -1
                        });

                        $scope.eventBookmarks = data.bookmarks.event_bookmarks;
                        $scope.eventBookmark = data.bookmarks.event_bookmarks[0];

                        saveInfor();

                    },
                    function() {});
            }

            $scope.changeEventBookmark = function(id) {
                $('.z-dropdown').removeClass('open');
                for (var i = 0; i < $scope.eventBookmarks.length; i++) {
                    if ($scope.eventBookmarks[i].id == id) {

                        $scope.eventBookmark = $scope.eventBookmarks[i];

                        for (var j = 0; j < $scope.events.length; j++) {
                            if ($scope.events[i] == $scope.eventBookmark.event) {
                                $scope.event = $scope.events[i];
                                break;
                            }
                        }

                        if ($scope.eventBookmark.compare_by != undefined) {
                            var object = JSON.parse($scope.eventBookmark.compare_by);
                            for (var o in object)
                                $scope.compareUnit = getCompareTo({
                                    name: object[o].property,

                                });
                        }

                        $scope.time_unit = getTimeUnit($scope.eventBookmark.time_unit);
                        $scope.oldsubfilters = queryHelper.decode($scope.eventBookmark);

                        saveInfor();
                        return;
                    }
                }
            }

            function getTimeUnit(old) {
                for (var i = 0; i < $scope.time_units.length; i++)
                    if ($scope.time_units[i].name == old)
                        return $scope.time_units[i];
            }

            function getCompareTo(old) {
                for (var i = 0; i < $scope.event.compare_properties.length; i++)
                    if ($scope.event.compare_properties[i].name == old.name)
                        return $scope.event.compare_properties[i];
            }

            function saveInfor() {
                var saveSubfilters = [];
                var size = $scope.subfilters.length;

                for (var i = 0; i < size; i++) {
                    saveSubfilters.push($scope.subfilters[i].getValue());
                }

                segmentationFactory.setData({
                    brand_id: brandId,
                    chartType: $scope.chartType,
                    time_unit: $scope.time_unit,
                    hideTypeChart: $scope.hideTypeChart,
                    chartData: $scope.chartData,
                    data: $scope.data,
                    fields: fields,
                    compareUnit: $scope.compareUnit,
                    event: $scope.event,
                    oldsubfilters: saveSubfilters,
                    eventBookmark: $scope.eventBookmark,
                    eventBookmarks: $scope.eventBookmarks,
                    isHasBookmark: $scope.isHasBookmark,
                    time_unit: $scope.time_unit,
                    compareUnit: $scope.compareUnit,
                    markers: $scope.markers,
                    chartId: $scope.chartId,
                    chartTypeSub: $scope.chartTypeSub,
                    bounds: bounds
                })
            }

            $scope.updateDateEvent = function() {
                var id = $scope.eventBookmark.id;
                if (id != -1) {
                    buildQuery();
                    var pare = {
                        bookmark_id: id,
                        bookmark_name: $scope.eventBookmark.bookmark_name,
                        event: fields.event,
                        filter: fields.filter,
                        time_unit: fields.time_unit
                    };

                    if (fields.compare_by != undefined)
                        pare.compare_by = fields.compare_by;

                    bookmarkRemote.eventUpdate(pare, function(data) {
                        if (data.error == undefined) {
                            for (var i = 0; i < $scope.eventBookmarks.length; i++)
                                if ($scope.eventBookmarks[i].id == id) {
                                    var bookmark = {
                                        bookmark_name: $scope.eventBookmark.bookmark_name,
                                        id: id,
                                        brand_id: brandId,
                                        event: fields.event,
                                        filter: fields.filter,
                                        compare_by: fields.compare_by,
                                        time_unit: fields.time_unit
                                    }

                                    $scope.eventBookmarks[i] = bookmark;
                                    $scope.eventBookmark = $scope.eventBookmarks[i];
                                    dataFactory.setEventBookmarks(brandId, $scope.eventBookmarks);

                                    saveInfor();
                                    return;
                                }
                        } else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                }

            }

            $scope.createEvent = function(name) {
                if (name == '')
                    return;

                buildQuery();
                fields.bookmark_name = name;

                bookmarkRemote.eventCreate(fields, function(data) {
                    if (data.error == undefined) {
                        var bookmark = {
                            bookmark_name: name,
                            id: data.bookmark_id,
                            brand_id: brandId,
                            event: fields.event,
                            filter: fields.filter,
                            compare_by: fields.compare_by,
                            time_unit: fields.time_unit
                        }

                        $scope.eventBookmarks.push(bookmark);
                        $scope.changeEventBookmark(bookmark.id);

                        dataFactory.setEventBookmarks(brandId, $scope.eventBookmarks);
                        homeFactory.addEventBookmark(brandId, fields);
                        saveInfor();
                    } else
                        dialogHelper.showError(data.error.message);

                }, function() {});
            }

            function buildQuery() {

                var query = filterHelper.buildQuery($scope.subfilters);
                fields = {
                    brand_id: brandId,
                    event: $scope.event.name,
                    filter: JSON.stringify(query),
                    time_unit: $scope.time_unit.name,
                    date_beg: $scope.data[0].dateDisplay,
                    date_end: $scope.data[1].dateDisplay
                };

                var compareToObject = null;
                if ($scope.compareUnit.name_display != 'none') {
                    compareToObject = compareHelper.buildCompareToString($scope.compareUnit);
                    fields.compare_by = JSON.stringify(compareToObject);
                    $scope.hideTypeChart = false;
                } else {
                    $scope.hideTypeChart = true;
                    $scope.chartType = $scope.chartTypes[0];
                    $scope.changeChartId($scope.chartType);
                }
            }

            $scope.getResult = function() {
                buildQuery();
                updateChart(fields);
            }

            $scope.updateChart = function() {
                if (fields != null) {
                    fields.time_unit = $scope.time_unit.name;
                    updateChart(fields);
                }
            }

            function updateChart(fields) {
                $scope.hideLoading = false;

                var fieldsForMap = {
                    brand_id: fields.brand_id,
                    event: fields.event,
                    date_beg: fields.date_beg,
                    date_end: fields.date_end
                };

                if (fields.filter == null)
                    fieldsForMap.filter = null;
                else
                    fieldsForMap.filter = fields.filter;

                isNeedFitMap = true;
                eventRemote.getDistributionMap(fieldsForMap, function(data) {
                    if (data.error == undefined) {
                        $scope.markers = [];

                        bounds = new google.maps.LatLngBounds();
                        for (var i = 0; i < data.points.length; i++) {
                            var marker = {
                                coords: {
                                    latitude: data.points[i][0], // default value, just for initial purpose
                                    longitude: data.points[i][1]
                                },
                                options: {
                                    draggable: false,
                                },
                                icon: "vendor/theme/img/iconpinmap.png"

                            };

                            $scope.markers.push(marker);
                            bounds.extend(new google.maps.LatLng($scope.markers[i].coords.latitude, $scope.markers[i].coords.longitude));
                        }

                        if ($scope.mapInstance != null)
                            $scope.mapInstance.fitBounds(bounds);

                        saveInfor();
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});

                eventRemote.count(fields, function(data) {
                    $scope.hideLoading = true;
                    if (data.error == undefined) {

                        if ($scope.compareUnit.name == 'hour' ||
                            $scope.compareUnit.name == 'weekday' ||
                            $scope.compareUnit.name == 'month') {
                            $scope.chartType = $scope.chartTypes[1];
                            $scope.changeChartId($scope.chartType);
                        } else {
                            $scope.chartType = $scope.chartTypes[0];
                            $scope.chartTypeSub = $scope.chartTypeSubs[0];
                            $scope.changeChartId($scope.chartType);
                        }

                        $scope.chartData[0] = chartHelper.buildLineChart(data, $scope.event.name_display);
                        $scope.chartData[1] = chartHelper.buildPieChart(data, $scope.event.name_display);
                        $scope.chartData[2] = chartHelper.buildColumnChart(data, $scope.event.name_display);

                        saveInfor();
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});
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

            $scope.updateEvent = function() {
                $scope.compareUnit = $scope.event.compare_properties[0];
            }

            if (oldData == null) {
                buildQuery();
                fields.filter = null;
                updateChart(fields);
            }
        }
    }
])
    .config(function($routeProvider) {
        var access = routingConfig.accessLevels;
        $routeProvider
            .when('/segmentation/:brandId', {
                templateUrl: 'modules/engagement/template/segmentation/segmentation.html',
                controller: 'SegmentationCtrl',
                access: access.user
            })
            .when('/funnel/step1/:brandId', {
                templateUrl: 'modules/engagement/template/funnel/funnel_step_1.html',
                controller: 'FunnelStep1Ctrl',
                access: access.user
            })
            .when('/funnel/step2/:brandId', {
                templateUrl: 'modules/engagement/template/funnel/funnel_step_2.html',
                controller: 'FunnelStep2Ctrl',
                access: access.user
            })
    });