angular.module('engagement')
    .controller('FunnelStep1Ctrl', ['$scope', '$routeParams', '$location', 'dataFactory', 'remoteFactory', '$modal', 'filterHelper', 'funnelRemote', 'chartHelper', 'serviceHelper', 'funnelFactory', 'bookmarkRemote', 'dialogHelper',
        function($scope, $routeParams, $location, dataFactory, remoteFactory, $modal, filterHelper, funnelRemote, chartHelper, serviceHelper, funnelFactory, bookmarkRemote, dialogHelper) {

            /** Global variables **/
            var brandId = $routeParams.brandId;
            dataFactory.updateBrandSideBar(brandId),
            intervalDate = serviceHelper.getIntervalDate();

            /** Scope variables **/
            $scope.data = [{
                dateDropDownInput: intervalDate.date_beg,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
            }, {
                dateDropDownInput: intervalDate.date_end,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
            }];


            $scope.nameOfChainOfBehaviours = '';
            $scope.isVisibleFilter = false;

            dataFactory.getMetaData(brandId, function(data) {
                $scope.metadata = data.meta_lists;
                $scope.metas = data.meta_property_types;
                $scope.events = data.meta_events;
                $scope.subfilters = null;

                $scope.behaviours = [{
                    id: 0,
                    metas: $scope.metas,
                    event: $scope.events[0],
                    events: $scope.events,
                    metadata: $scope.metadata,
                    subfilters: null,
                    oldsubfilters: []
                }];

                $scope.isVisibleFilter = true;
                run();
            }, function() {});

            function run() {
                var fields = {
                    brand_id: brandId,
                    date_beg: $scope.data[0].dateDisplay,
                    date_end: $scope.data[1].dateDisplay,
                    by: 'turn',
                    funnel: ''
                };

                $scope.validation = true;
                $scope.updateValidate = function() {
                    if ($scope.nameOfChainOfBehaviours == undefined || $scope.nameOfChainOfBehaviours == '')
                        $scope.validation = true;
                    else
                        $scope.validation = false;

                }

                //var oldData = funnelFactory.getData(0, brandId);
                var oldData = null;
                if (oldData != null) {
                    fields = oldData.fields;
                    $scope.nameOfChainOfBehaviours = oldData.nameOfChainOfBehaviours;
                    $scope.behaviours = oldData.behaviours;

                    for (var i = 0; i < $scope.behaviours.length; i++) {
                        $scope.behaviours[i].oldsubfilters = oldData.saveSubfilters[i];
                    }

                    $scope.validation = oldData.validation;
                }

                $scope.addBehaviour = function() {
                    var tempBehaviour = {
                        id: 0,
                        metas: $scope.metas,
                        events: $scope.events,
                        metadata: $scope.metadata,
                        subfilters: null,
                        oldsubfilters: [],
                        event: $scope.events[0]
                    };

                    tempBehaviour.id = $scope.behaviours.length;
                    $scope.behaviours.push(tempBehaviour);
                }

                $scope.bookmark = function() {

                    fields = {
                        bookmark_name: $scope.nameOfChainOfBehaviours,
                        brand_id: brandId,
                        time_unit: 'day',
                        funnel: []
                    }

                    for (var i = 0; i < $scope.behaviours.length; i++) {
                        fields.funnel.push({
                            filter: filterHelper.buildQuery($scope.behaviours[i].subfilters),
                            event: $scope.behaviours[i].subfilters[0].event.name
                        });
                    }

                    fields.funnel = JSON.stringify(fields.funnel);

                    bookmarkRemote.funnelCreate(fields, function(data) {
                        if (data.error == undefined)
                            dialogHelper.showError('Lưu hành vi người dùng thành công');
                        else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                }

                $scope.funnel = function() {
                    fields.funnel = [];
                    fields.date_beg = $scope.data[0].dateDisplay;
                    fields.date_end = $scope.data[1].dateDisplay;
                    fields.by = 'turn';
                    columnNames = [];

                    for (var i = 0; i < $scope.behaviours.length; i++) {
                        fields.funnel.push({
                            filter: filterHelper.buildQuery($scope.behaviours[i].subfilters),
                            event: $scope.behaviours[i].subfilters[0].event.name
                        });

                        columnNames.push($scope.behaviours[i].subfilters[0].event.name_display);
                    }

                    fields.funnel = JSON.stringify(fields.funnel);
                    var saveSubfilters = [];
                    for (var i = 0; i < $scope.behaviours.length; i++) {
                        saveSubfilters.push(saveFilter($scope.behaviours[i].subfilters));
                    }

                    funnelFactory.setData(0, {
                        brand_id: brandId,
                        fields: fields,
                        saveSubfilters: saveSubfilters,
                        nameOfChainOfBehaviours: $scope.nameOfChainOfBehaviours,
                        behaviours: $scope.behaviours,
                        validation: $scope.validation
                    });

                    $location.path('/funnel/step2/' + brandId);

                }

                function saveFilter(subfilters) {
                    var saveSubfilters = [];
                    var size = subfilters.length;

                    for (var i = 0; i < size; i++) {
                        saveSubfilters.push(subfilters[i].getValue());
                    }

                    return saveSubfilters;
                }
            }
        }
    ])