angular.module('Smg')
    .factory('dialogHelper', ['createDialog',
        function(createDialog) {
            return {
                loadDialog: function(title, labelSuccess, labelCancle, content, success) {
                    createDialog({
                        id: 'simpleDialog',
                        template: '<div class="row-fluid">' +
                            ' <h4>' + content + '</h4>' +
                            ' <div>',
                        title: title,
                        backdrop: true,
                        success: {
                            label: labelSuccess,
                            fn: success
                        },
                        cancel: {
                            label: labelCancle,
                            fn: null
                        },
                        css: {
                            top: '100px',
                            left: '0%',
                            margin: '0 auto'
                        }
                    })
                },
                showError: function(content) {
                    if (content != '' && content != undefined)
                        this.loadDialog('Thông báo', 'Đồng ý', '', content, null);
                }
            }
        }
    ]);