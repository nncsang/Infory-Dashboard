angular.module('smgDirectives', ['ui.date'])
    .directive('smgFilter', function($compile, $document) {

        return {
            restrict: "A",
            templateUrl: 'common/template/filter.html',
            scope: {
                oldsubfilters: '=',
                subfilters: "=",
                metas: "=",
                events: "=",
                metadata: "=",
                event: "=",
                visibility: "="
            },
            controller: function($scope) {
                if ($scope.oldsubfilters != null && $scope.oldsubfilters != undefined && $scope.oldsubfilters.length != 0) {
                    $scope.olddata = $scope.oldsubfilters;
                }

                $scope.subfilters = [];

                $scope.$watch('oldsubfilters', function() {
                    if ($scope.oldsubfilters != null && $scope.oldsubfilters != undefined && $scope.oldsubfilters.length > 0 && $scope.oldsubfilters[0] != undefined && $scope.oldsubfilters[0].event != undefined) {
                        $scope.olddata = $scope.oldsubfilters;
                        var old = $scope.subfilters;

                        for (var i = 1; i < old.length; i++) {
                            var id = old[i].getValue().id;
                            var name1 = '.special_' + id;
                            var name2 = '.row_' + id;

                            $(name1).remove();
                            $(name2).remove();
                        }

                        $scope.subfilters = [];
                        $scope.subfilters.push(old[0]);
                    }
                })

                var num = 0;

                this.addFilter = function(scope) {
                    $scope.subfilters.push(scope);
                }

                this.removeFilter = function(id) {
                    for (var i = $scope.subfilters.length - 1; i >= 0; i--) {
                        if ($scope.subfilters[i].getValue().id == id) {
                            $scope.subfilters.splice(i, 1);
                            return;
                        }
                    }
                }
            }
        };
    })
    .directive('subfilter', function($compile) {
        var qc = 1,
            _meta, _prop
            _operator = "AND";

        return {
            restrict: 'A',
            templateUrl: 'common/template/subfilter.html',
            scope: {
                metas: "=",
                events: "=",
                event: "=",
                metadata: "=",
                olddata: "=",
                visibility: "="

            },
            link: function(scope, element, attr, ctrl) {

                scope.dataString = [];
                scope.addCondition = function(data) {
                    $actionGroup = element.find(".action_group");
                    $queryGroup = element.find(".query_builder");

                    var oldDataString = ' olddata=' + '"null" ';
                    if (data != null) {
                        scope.dataString.push(JSON.stringify(data));
                        var index = scope.dataString.length - 1;
                        index = '[' + index + ']';

                        oldDataString = ' olddata="{{dataString' + index + '}}" ';
                    }

                    if (data != null && data != undefined)
                        qc = data.id;

                    _prop = "property" + qc,
                    _meta = "meta" + qc;

                    scope.qc = qc;
                    scope.operator = _operator;

                    var action_op = $compile('<select ng-model="operator" class="action clearfix row_' + qc + '"> ' + '<option>AND</option>' + '<option>OR</option>' + '</select>    ')(scope);

                    // $compile('<div class="btn-group pull-right action clearfix row_'+qc+'"><button class="glow left active">AND </button><button class="glow right">OR</button></div>')(scope);

                    var action_nor = $compile('<span class="btn-flat white action action_child clearfix  row_' + qc + '">{{operator}}</span>')(scope);

                    var query_row = $compile('<div query-record operator="operator" class="special_' + qc + '" id="' + qc + '" events="events" metas="metas" event="event"' + oldDataString + 'metadata="metadata" class="row_' + qc + '" data=".row_' + qc + '"></div>')(scope);

                    if (element.find(".action").length > 0) {
                        $actionGroup.append(action_nor);
                    } else {
                        $actionGroup.append(action_op);
                    }
                    $queryGroup.append(query_row);

                    scope.$watch('operator', function(newOperator, oldOperator) {
                        _operator = newOperator;
                        element.find('.action_child').text(newOperator);
                    });

                    qc++;
                }

                scope.$watch('olddata', function(newValue, oldValue) {
                    if (scope.olddata != undefined && scope.olddata.length != 0 && scope.olddata.event == undefined) {
                        update();
                    }
                });

                //update();

                function update() {
                    if (scope.olddata != undefined && scope.olddata.length != 0) {
                        scope.firstData = JSON.stringify(scope.olddata[0]);
                        for (var i = 1; i < scope.olddata.length; i++) {
                            scope.addCondition(scope.olddata[i]);
                        }
                    } else {
                        scope.firstData = null;
                    }
                }
            }
        };
    })
    .directive('queryRecord', ['serviceHelper',

        function(serviceHelper) {
            return {
                require: '^smgFilter',
                restrict: 'A',
                scope: {
                    operator: "=",
                    metas: "=",
                    events: "=",
                    event: "=",
                    metadata: "=",
                    id: "@",
                    olddata: "@"
                },
                templateUrl: 'common/template/query_record.html',
                link: function(scope, element, attr, ctrl) {
                    var intervalDate = serviceHelper.getIntervalDate();
                    var count = 0;
                    var isNeedClearData = true;

                    scope.data = [{
                        dateDropDownInput: intervalDate.date_beg,
                        dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
                    }, {
                        dateDropDownInput: intervalDate.date_end,
                        dateDisplay: serviceHelper.normalizeTime(intervalDate.date_end)
                    }];

                    scope.paremeters = {
                        firstInput: '',
                        secondInput: ''
                    }

                    scope.$watch('olddata', function() {
                        update();
                    });

                    function update() {
                        if (scope.olddata == 'null' || scope.olddata == '[]' || scope.olddata == null || scope.olddata == '') {
                            scope.property = scope.event.properties[0];
                            if (scope.property.name_display == 'choose a property')
                                return;
                            scope.meta = scope.metas[scope.property.type].operators_display[0];
                            if (scope.metas[scope.property.type].operators_ui_controller[scope.metas[scope.property.type].operators_display.indexOf(scope.meta)] == 'dropdown')
                                scope.paremeters.firstInput = scope.metadata[scope.property.available_values][0];
                        } else {
                            var olddata = JSON.parse(scope.olddata);
                            var event = olddata.event;
                            var property = olddata.property;
                            var paremeters = olddata.paremeters;
                            var meta = olddata.meta;
                            var data = olddata.data;
                            var paremeters = olddata.paremeters;
                            var operator = olddata.operator;
                            var id = olddata.id;

                            isNeedClearData = false;

                            if (event != 'profile') {
                                for (var i = 0; i < scope.events.length; i++)
                                    if (scope.events[i].name == event) {
                                        scope.event = scope.events[i];
                                        break;
                                    }
                            }

                            for (var i = 0; i < scope.event.properties.length; i++) {
                                if (scope.event.properties[i].name == property.name) {
                                    scope.property = scope.event.properties[i];
                                    break;
                                }
                            }

                            for (var i = 0; i < scope.metas[scope.property.type].operators_display.length; i++)
                                if (scope.metas[scope.property.type].operators_display[i] == meta) {
                                    scope.meta = scope.metas[scope.property.type].operators_display[i];
                                    break;
                                }

                            scope.data = data;
                            scope.paremeters = paremeters;
                            scope.operator = operator;
                            scope.id = id;
                        }
                    }

                    update();

                    scope.$watch('event', function(newValue, oldValue) {
                        if (scope.olddata != undefined && scope.olddata != null && count++ == 0)
                            return;

                        if (newValue.name != oldValue.name)
                            scope.property = scope.event.properties[0];

                        scope.updateFields();
                    });

                    scope.$watch('property', function() {
                        scope.updateFields();
                    });

                    scope.updateFields = function() {
                        if (scope.olddata != undefined && scope.olddata != null && count++ == 1)
                            return;

                        //scope.property = scope.event.properties[0];
                        if (scope.property.name_display == 'choose a property')
                            return;

                        scope.meta = scope.metas[scope.property.type].operators_display[0];
                        if (isNeedClearData) {
                            scope.paremeters = {
                                firstInput: '',
                                secondInput: ''
                            }

                        } else
                            isNeedClearData = true;

                        if (scope.metas[scope.property.type].operators_ui_controller[scope.metas[scope.property.type].operators_display.indexOf(scope.meta)] == 'dropdown')
                            scope.paremeters.firstInput = scope.metadata[scope.property.available_values][0];

                    }

                    scope.onTimeSetOne = function(newDate, oldDate) {
                        scope.paremeters.firstInput = '';
                        scope.data[0].dateDisplay = serviceHelper.normalizeTime(newDate);
                    }

                    scope.onTimeSetTwo = function(newDate, oldDate) {
                        scope.paremeters.secondInput = '';
                        scope.data[1].dateDisplay = serviceHelper.normalizeTime(newDate);
                    }

                    scope.removeCondition = function($event) {
                        // rowId = $($event.target).parent().parent().attr("data");
                        // element.parents().find(rowId).remove();
                        // ctrl.removeFilter(scope.id);

                        var id = scope.id;
                        if (id == 0)
                            return;
                        var name1 = '.special_' + id;
                        var name2 = '.row_' + id;

                        $(name1).remove();
                        $(name2).remove();

                        ctrl.removeFilter(scope.id);
                    }

                    scope.getValue = function() {
                        if (scope.property.name_display == 'choose a property')
                            return;

                        switch (scope.metas[scope.property.type].operators_ui_controller[scope.metas[scope.property.type].operators_display.indexOf(scope.meta)]) {
                            case 'date picker':
                                scope.paremeters.firstInput = scope.data[0].dateDropDownInput;
                                scope.paremeters.secondInput = '';
                                break;
                            case 'two date picker':
                                scope.paremeters.firstInput = scope.data[0].dateDropDownInput;
                                scope.paremeters.secondInput = scope.data[1].dateDropDownInput;
                                break;
                        }

                        return {
                            id: scope.id,
                            property: scope.property,
                            meta: scope.meta,
                            paremeters: scope.paremeters,
                            data: scope.data,
                            operator: scope.operator,
                            event: scope.event.name
                        };
                    }
                    ctrl.addFilter(scope);
                }
            };
        }
    ])