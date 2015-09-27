'use strict';

angular.module('Smg')
    .factory('filterHelper',
        function() {
            return {
                buildQuery: function(subfilters) {
                    var type = "AND";
                    if (subfilters.length > 1)
                        type = subfilters[1].getValue().operator;

                    var query = null;
                    var elements = null;

                    if (type == 'AND' && subfilters.length > 0) {
                        query = {
                            and: []
                        };
                        elements = query.and;
                    } else if (type == 'OR' && subfilters.length > 0){
                        query = {
                            or: []
                        };
                        elements = query.or;
                    }


                    for (var i = 0; i < subfilters.length; i++) {
                        var pre_query = subfilters[i].getValue();
                        if (pre_query == null || pre_query == undefined)
                            return null;
                        if (pre_query.paremeters.firstInput != 0 && pre_query.paremeters.firstInput == '')
                            continue;
                        switch (pre_query.meta) {
                            case 'is':

                                if (pre_query.paremeters.firstInput == 'male')
                                    pre_query.paremeters.firstInput = 'male';

                                if (pre_query.paremeters.firstInput == 'female')
                                    pre_query.paremeters.firstInput = 'female';

                                elements.push({
                                    is: {
                                        property: pre_query.property.name,
                                        value: pre_query.paremeters.firstInput
                                    }
                                })
                                break;
                                ///
                            case 'has':
                                elements.push({
                                    has: {
                                        property: pre_query.property.name,
                                        value: pre_query.paremeters.firstInput
                                    }
                                })
                                break;
                            case 'larger than':
                                elements.push({
                                    larger_than: {
                                        property: pre_query.property.name,
                                        value: parseInt(pre_query.paremeters.firstInput)
                                    }
                                })
                                break;
                            case 'smaller than':
                                elements.push({
                                    smaller_than: {
                                        property: pre_query.property.name,
                                        value: parseInt(pre_query.paremeters.firstInput)
                                    }
                                })
                                break;
                            case 'between':
                                elements.push({
                                    between: {
                                        property: pre_query.property.name,
                                        beg_value: parseInt(pre_query.paremeters.firstInput),
                                        end_value: parseInt(pre_query.paremeters.secondInput),
                                    }
                                })
                                break;
                            case 'larger than or equal':
                                elements.push({
                                    larger_than_or_equal: {
                                        property: pre_query.property.name,
                                        value: parseInt(pre_query.paremeters.firstInput)
                                    }
                                })
                                break;
                            case 'smaller than or equal':
                                elements.push({
                                    smaller_than_or_equal: {
                                        property: pre_query.property.name,
                                        value: parseInt(pre_query.paremeters.firstInput)
                                    }
                                })
                                break;
                            case 'equal':
                                elements.push({
                                    equal: {
                                        property: pre_query.property.name,
                                        value: parseInt(pre_query.paremeters.firstInput)
                                    }
                                })
                                break;
                                ///
                            case 'cách đây':

                            case 'before':
                                elements.push({
                                    before_date: {
                                        property: pre_query.property.name,
                                        value: pre_query.paremeters.firstInput
                                    }
                                })
                                break;
                            case 'after':
                                elements.push({
                                    after_date: {
                                        property: pre_query.property.name,
                                        value: pre_query.paremeters.firstInput
                                    }
                                })
                                break;
                            case 'between dates':
                                elements.push({
                                    between_dates: {
                                        property: pre_query.property.name,
                                        beg_date: pre_query.paremeters.firstInput,
                                        end_date: pre_query.paremeters.secondInput
                                    }
                                })
                                break;
                        }
                    }

                    return query;
                }
            }
        }
);