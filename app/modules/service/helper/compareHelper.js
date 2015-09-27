angular.module('Smg')
    .factory('compareHelper',
        function() {
            return {
                buildCompareToString: function(compareUnit) {
                    var query = {};

                    switch (compareUnit.type) {
                        case 'time':
                            query = {
                                time: {
                                    property: compareUnit.name,
                                    unit: compareUnit.unit
                                }
                            }
                            break;
                        case 'group':
                            query = {
                                group: {
                                    property: compareUnit.name
                                }
                            }
                            break;
                        case 'multiple_group':
                            query = {
                                multiple_group: {
                                    property: compareUnit.name
                                }
                            }
                            break;
                        case 'number':
                            query = {
                                number: {
                                    property: compareUnit.name,
                                    min_diff: compareUnit.min_diff
                                }
                            }
                            break;
                    }
                    return query;
                }
            }
        }
);