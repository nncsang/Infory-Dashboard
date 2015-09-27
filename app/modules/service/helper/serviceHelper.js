angular.module('Smg')
    .factory('serviceHelper',
        function() {
            var currentDate = new Date();
            var endDate = new Date(new Date().setTime(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000));
            return {
                normalizeTime: function(newDate) {
                    var d = newDate.getDate();
                    var m = newDate.getMonth() + 1;
                    var y = newDate.getFullYear();
                    return '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
                },

                normalizeTimeWithMinute: function(newDate) {
                    var d = newDate.getDate();
                    var m = newDate.getMonth() + 1;
                    var y = newDate.getFullYear();
                    var h = newDate.getHours();
                    var min = newDate.getMinutes();
                    return '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y + '   ' + (h <= 9 ? '0' + h : h) + ':' + (min <= 9 ? '0' + min : min);
                },

                getIntervalDate: function() {
                    return {
                        date_end: currentDate,
                        date_beg: endDate
                    };
                },

                capitaliseFirstLetter: function(string)
                {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }
            }
        }
);