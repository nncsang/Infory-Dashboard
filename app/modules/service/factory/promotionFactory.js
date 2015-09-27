angular.module('smg.services')
    .factory('promotionFactory', ['$http',
        function($http) {
            var data = [null, null, null, null];
            var mode = 'create'
            var promotionId = -1;

            return {
                setData: function(id, newData) {
                    data[id] = newData;
                },
                getData: function(id, brandId) {
                    if (data[id] != null && data[id].brand_id == brandId)
                        return data[id];
                    return null;
                },
                setMode: function(value) {
                    mode = value;
                },
                getMode: function() {
                    return mode;
                },
                setPromotionId: function(value) {
                    promotionId = value;
                },
                getPromotionId: function() {
                    return promotionId;
                }
            }
        }
    ])