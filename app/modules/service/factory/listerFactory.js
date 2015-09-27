angular.module('smg.services')
    .factory('listerFactory', ['$http',
        function($http) {
            var listerData = null;

            return {
                setData: function(newData) {
                    listerData = newData;
                },
                getData: function() {
                    return listerData;
                }
            }
        }
    ])