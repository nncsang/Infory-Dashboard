angular.module('smg.services')
    .factory('userNotifyFactory', ['$http',
        function($http) {
            var data = [null, null, null, null];
            var userList = [];
            var mode = 'create';
            var messageId = -1;

            return {
                setData: function(id, newData) {
                    data[id] = newData;
                },
                getData: function(id, brandId) {
                    if (data[id] != null && data[id].brand_id == brandId)
                        return data[id];
                    else
                        return null;
                },
                setCurrentResultUserFilter: function(list) {
                    userList = list;
                },
                getCurrentResultUserFilter: function() {
                    return userList;
                },
                setMode: function(value) {
                    mode = value;
                },
                getMode: function() {
                    return mode;
                },
                setMessageId: function(value) {
                    messageId = value;
                },
                getMessageId: function() {
                    return messageId;
                }
            }
        }
    ])