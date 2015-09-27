angular.module('smgDirectives')
    .directive('editor', ['brandRemote',

        function(brandRemote) {
            return {
                restrict: 'A',
                scope: {
                    id: "@",
                    data: "=",
                    title: "@",
                    type: "@",
                    success: "&"
                },
                templateUrl: 'common/template/editor.html',
                link: function(scope, element, attr, ctrl) {
                    scope.showEditor = false;
                    scope.originalData = scope.data;
                    scope.change = function() {
                        if (scope.data.length <= 0) {
                            scope.data = scope.originalData;
                        } else {
                            var fields = null;
                            switch (scope.type) {
                                case 'brandName':
                                    fields = {
                                        brand_id: scope.id,
                                        name: scope.data
                                    };
                                    break;
                            }

                            brandRemote.update(fields, function(data) {
                                if (data.error == undefined) {
                                    scope.showEditor = false;
                                    scope.originalData = scope.data;
                                    scope.data = scope.data;
                                    scope.success({
                                        newVal: scope.data
                                    });
                                } else {
                                    scope.showEditor = false;
                                    scope.data = scope.originalData;
                                }
                            }, function() {

                            });
                        }
                    }
                }
            };
        }
    ])