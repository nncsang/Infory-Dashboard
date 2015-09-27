angular.module('promotion')

.controller('PromotionStep4Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userRemote', 'serviceHelper', 'promotionRemote', 'promotionFactory', 'serviceHelper', 'dialogHelper',

    function($scope, $routeParams, $location, remoteFactory, dataFactory, userRemote, serviceHelper, promotionRemote, promotionFactory, serviceHelper, dialogHelper) {

        /** Global variables **/
        var brandId = $routeParams.brandId,
            dataStep3 = promotionFactory.getData(2, brandId),
            dataStep2 = promotionFactory.getData(1, brandId),
            mode = promotionFactory.getMode();

        /** Scope variables **/
        $scope.orderPromotions = [{
            name: '',
            name_display: 'All'
        }, {
            name: 'news',
            name_display: 'News'
        }, {
            name: 'voucher',
            name_display: 'Voucher'
        }];

        $scope.hideLoading = false;

        $scope.totalItems = 0;
        $scope.dataInCurrentPage = [];
        $scope.filteredUsers = [];
        $scope.itemsPerPage = 10;
        $scope.boundaryLinks = false;
        $scope.maxSize = 10;
        $scope.currentPage = 1;
        $scope.searchText = '';

        /** Logic **/
        $scope.pageChanged = function(page) {
            $scope.currentPage = page;
            $scope.dataInCurrentPage = $scope.promotionList.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
        }

        function resetPagination(array, page) {
            $scope.currentPage = page;
            $scope.totalItems = array.length;
            $scope.dataInCurrentPage = array.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
        }

        dataFactory.getBrand(brandId, function(data) {
            $scope.brand = data;

        }, function() {});

        $scope.goToStep1 = function() {
            promotionFactory.setData(0, null);
            promotionFactory.setData(1, null);
            promotionFactory.setData(2, null);
            promotionFactory.setMode('create');

            $location.path('/brand/promotion/step1/' + brandId);
        }

        $scope.editPromotion = function(promotion_id) {
            promotionRemote.get({
                promotion_id: promotion_id
            }, function(data) {
                if (data.error == undefined) {
                    pushInfoToStep1(data);
                    pushInfoToStep2(data);
                    pushInfoToStep3(data);

                    promotionFactory.setMode('update');
                    promotionFactory.setPromotionId(promotion_id);

                    $location.path('/brand/promotion/step1/' + brandId);
                } else {
                    dialogHelper.showError(data.error.message);
                }
            }, function() {})
        }

        if (dataStep3 == null) {
            listPromotion();
            return;
        } else {
            var shops_apply = [];

            for (var i = 0; i < dataStep2.selectedShops.length; i++) {
                if (dataStep2.selectedShops[i] == true) {
                    shops_apply.push(dataStep2.shops[i].id);
                }
            }

            var fields = {
                name: dataStep2.name,
                brand_id: brandId,
                shops_apply: JSON.stringify(shops_apply),
                date_beg: serviceHelper.normalizeTime(dataStep2.date_beg.dateDropDownInput),
                date_end: serviceHelper.normalizeTime(dataStep2.date_end.dateDropDownInput),
                type: dataStep3.promotionType.name,
                requirement: ''
            }

            switch (dataStep3.promotionType.name) {
                case 'news':
                    fields.title = dataStep3.title;
                    fields.description = dataStep3.content;
                    fields.cover = dataStep3.fileAvatar;
                    break;
                case 'voucher':
                    var vouchers = [];

                    for (var i = 0; i < dataStep3.presentDescriptions.length; i++) {
                        var description = dataStep3.presentDescriptions[i];
                        if (description.noLimitedChecked == true)
                            description.amount = 0;

                        var available_days = [];

                        if (description.allChecked == true)
                            available_day = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
                        else {
                            if (description.monChecked == true)
                                available_days.push("mon");
                            if (description.tueChecked == true)
                                available_days.push("tue");
                            if (description.wedChecked == true)
                                available_days.push("wed");
                            if (description.thuChecked == true)
                                available_days.push("thu");
                            if (description.friChecked == true)
                                available_days.push("fri");
                            if (description.satChecked == true)
                                available_days.push("sat");
                            if (description.sunChecked == true)
                                available_days.push("sun");
                        }

                        var voucher = {
                            description: description.description,
                            total: description.amount,
                            voucher_number: (i + 1).toString(),
                            requirement: description.target,
                            available_time: '0:00-23:59',
                            available_days: available_days,
                        }

                        if (description.voucherId != undefined)
                            voucher.id = description.voucherId;

                        vouchers.push(voucher);
                    }

                    fields.vouchers = JSON.stringify(vouchers);
                    break;
                case 'score':
                    break;
            }


            switch (mode) {
                case 'create':
                    var fd = new FormData();
                    for (var o in fields)
                        fd.append(o, fields[o]);

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', remoteFactory.getBaseUrl() + 'promotion/create' + remoteFactory.getTailUrl(), true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4) {
                            var respone = JSON.parse(xhr.responseText);
                            if (respone.error == undefined) {
                                dialogHelper.showError('Create event successfully');
                            } else
                                dialogHelper.showError('Unexpected error: ' + respone.error.message);

                            listPromotion();
                        }
                    }
                    xhr.send(fd);

                    /**
                    promotionRemote.create(fields, function(data) {
                        if (data.error != undefined)
                            dialogHelper.showError('Quá trình tạo chiến dịch có lỗi: ' + data.error.message);
                        else
                            dialogHelper.showError('Tạo chiến dịch thành công');
                        listPromotion();

                    }, function() {});
                    **/

                    break;
                case 'update':
                    fields.promotion_id = promotionFactory.getPromotionId();

                    var fd = new FormData();
                    for (var o in fields)
                        fd.append(o, fields[o]);

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', remoteFactory.getBaseUrl() + 'promotion/update' + remoteFactory.getTailUrl(), true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4) {
                            var respone = JSON.parse(xhr.responseText);
                            if (respone.error == undefined) {
                                dialogHelper.showError('Event is updated');
                            } else
                                dialogHelper.showError('Unexpected error: ' + respone.error.message);

                            listPromotion();
                        }
                    }
                    xhr.send(fd);

                    /**
                    promotionRemote.update(fields, function(data) {
                        if (data.error != undefined)
                            dialogHelper.showError('Quá trình cập nhật chiến dịch có lỗi: ' + data.error.message);
                        else
                            dialogHelper.showError('Đã cập nhật thông tin chiến dịch');

                        listPromotion();

                    }, function() {});
                    **/

                    break;
            }

            function listPromotion() {
                $scope.statusTypes = [{
                    name: '',
                    name_display: 'Status'
                }, {
                    name: 'running',
                    name_display: 'Running'
                }, {
                    name: 'stopped',
                    name_display: 'Stopped'
                }, {
                    name: 'waiting',
                    name_display: 'Waiting'
                }];

                $scope.statusType = $scope.statusTypes[0];

                $scope.changeStatus = function(id) {
                    var status = $scope.promotionListFull[id].status;
                    var nextStatus = '';
                    switch (status) {
                        case 'running':
                            $scope.promotionListFull[id].statusClass = 'btn-flat inverse';
                            $scope.promotionListFull[id].status = 'stopped';
                            $scope.promotionListFull[id].statusName = 'Stopped';
                            nextStatus = 'stopped';
                            break;
                        case 'waiting':
                            return;
                        case 'stopped':
                            $scope.promotionListFull[id].statusClass = 'btn-flat success';
                            $scope.promotionListFull[id].status = 'running';
                            $scope.promotionListFull[id].statusName = 'Running';
                            nextStatus = 'running';
                            break;
                    }

                    promotionRemote.update({
                        promotion_id: $scope.promotionListFull[id].id,
                        status: nextStatus
                    }, function(data) {

                        if (data.error == undefined) {

                        } else {
                            dialogHelper.showError(data.error.message);
                            $scope.promotionListFull[id].status = status;
                            if ($scope.promotionListFull[id].status == 'running') {
                                $scope.promotionListFull[id].statusClass = 'btn-flat success';
                                $scope.promotionListFull[id].statusName = 'Running';
                            } else {
                                $scope.promotionListFull[id].statusClass = 'btn-flat inverse';
                                $scope.promotionListFull[id].statusName = 'Stopped';
                            }
                        }
                    }, function() {});
                }

                $scope.sortPromotionList = function() {
                    $scope.promotionList = [];
                    switch ($scope.orderPromotion.name) {
                        case '':
                            $scope.promotionList = $scope.promotionListFull;
                            break;

                        default:
                            sortByType($scope.orderPromotion.name);
                    }

                    resetPagination($scope.promotionList, 1);
                }


                function sortByType(type) {
                    if (type == '') {
                        $scope.promotionList = $scope.promotionListFull;
                    } else
                        for (var i = 0; i < $scope.promotionListFull.length; i++) {
                            if ($scope.promotionListFull[i].type == type)
                                $scope.promotionList.push($scope.promotionListFull[i]);
                        }
                }

                $scope.sortPromotionListByStatus = function() {
                    var status = $scope.statusType.name;
                    if ($scope.statusType.name == '')
                        $scope.promotionList = $scope.promotionListFull;
                    else
                        $scope.promotionList = [];

                    for (var i = 0; i < $scope.promotionListFull.length; i++) {
                        if ($scope.promotionListFull[i].status == status)
                            $scope.promotionList.push($scope.promotionListFull[i]);
                    }

                    resetPagination($scope.promotionList, 1);
                }

                var fields = '["id, "type", "name", "status"]';
                $scope.hideLoading = false;
                promotionRemote.list({
                    brand_id: brandId,
                    fields: fields
                }, function(data) {
                    $scope.hideLoading = true;
                    if (data.error == undefined) {
                        for (var i = 0; i < data.length; i++) {
                            switch (data[i].type) {
                                case 'voucher':
                                    data[i].typeDisplay = 'Voucher';
                                    break;
                                case 'news':
                                    data[i].typeDisplay = 'News';
                                    break;
                                case 'score':
                                    data[i].typeDisplay = 'Score';
                                    break;
                            }

                            data[i].stt = (i % 2 == 0) ? 'even' : 'odd';
                            data[i].index = i;

                            switch (data[i].status) {
                                case 'running':
                                    data[i].statusClass = 'btn-flat success';
                                    data[i].statusName = 'Running';
                                    break;
                                case 'waiting':
                                    data[i].statusClass = 'btn-flat gray';
                                    data[i].statusName = 'Waiting';
                                    break;
                                case 'stopped':
                                    data[i].statusClass = 'btn-flat inverse';
                                    data[i].statusName = 'Stopped';
                                    break;
                            }
                            data[i].time = serviceHelper.normalizeTimeWithMinute(new Date(data[i].date_beg.split("-").join("/"))) + " to " + serviceHelper.normalizeTimeWithMinute(new Date(data[i].date_end.split("-").join("/")));
                        }

                        $scope.promotionList = data;
                        $scope.promotionListFull = data;
                        resetPagination($scope.promotionList, 1);
                    } else {
                        $scope.promotionList = [];
                        $scope.promotionListFull = [];
                        dialogHelper.showError(data.error.message);
                    }
                }, function() {});
            }
        }

        for (var i = 0; i < 3; i++)
            promotionFactory.setData(i, {
                brand_id: -1
            });


        function pushInfoToStep1(data) {

            var promotionType = {
                name: data.type
            };
            switch (data.type) {
                case 'news':
                    promotionType.name_display = 'News';
                    break;
                case 'voucher':
                    promotionType.name_display = 'Voucher';
                    break;
            }

            promotionFactory.setData(0, {
                promotionType: promotionType,
                brand_id: brandId
            });
        }

        function pushInfoToStep2(data) {
            var date_beg = new Date(data.date_beg.split("-").join("/"));
            var date_end = new Date(data.date_end.split("-").join("/"));

            promotionFactory.setData(1, {
                name: data.name,
                shops_apply: data.shops_apply,
                selectedShops: null,
                date_beg: {
                    dateDropDownInput: date_beg,
                    dateDisplay: serviceHelper.normalizeTime(date_beg),
                },
                date_end: {
                    dateDropDownInput: date_end,
                    dateDisplay: serviceHelper.normalizeTime(date_end),
                },
                brand_id: brandId
            });
        }

        function pushInfoToStep3(data) {
            var promotionType = {
                name: data.type
            };

            switch (data.type) {
                case 'news':
                    promotionType.name_display = 'News';
                    promotionFactory.setData(2, {
                        validation: [false, false, false],
                        isCanGoNext: true,
                        promotionType: promotionType,
                        content: data.content,
                        title: data.title,
                        content: data.description,
                        brand_id: brandId,
                        fileAvatar: data.cover,
                        cover: data.cover
                    });
                    break;
                case 'voucher':
                    var presentDescriptions = [];
                    var autoNum = 0;
                    var indexInArray = [];

                    for (var i = 0; i < 1000; i++) {
                        indexInArray.push(-1);
                    }

                    for (var i = 0; i < data.vouchers.length; i++) {
                        indexInArray[i] = i;

                        var presentDescription = {
                            id: autoNum,
                            stt: autoNum,
                            description: data.vouchers[i].description,
                            amount: data.vouchers[i].total,
                            noLimitedChecked: false,
                            target: data.vouchers[i].requirement,
                            monChecked: false,
                            tueChecked: false,
                            wedChecked: false,
                            thuChecked: false,
                            friChecked: false,
                            satChecked: false,
                            sunChecked: false,
                            allChecked: false,
                            validation: [false, false, false, false, false],
                            isOK: true,
                            voucherId: data.vouchers[i].id
                        };

                        autoNum++;

                        if (presentDescription.amount == 0)
                            presentDescription.noLimitedChecked = true;

                        for (var j = 0; j < data.vouchers[i].available_days.length; j++) {
                            switch (data.vouchers[i].available_days[j]) {

                                case 'mon':
                                    presentDescription.monChecked = true;
                                    break;
                                case 'tue':
                                    presentDescription.tueChecked = true;
                                    break;
                                case 'wed':
                                    presentDescription.wedChecked = true;
                                    break;
                                case 'thu':
                                    presentDescription.thuChecked = true;
                                    break;
                                case 'fri':
                                    presentDescription.friChecked = true;
                                    break;
                                case 'sat':
                                    presentDescription.satChecked = true;
                                    break;
                                case 'sun':
                                    presentDescription.sunChecked = true;
                                    break;
                            }
                        }

                        if (data.vouchers[i].available_days.length == 7) {
                            presentDescription.allChecked = true;
                            presentDescription.monChecked = true;
                            presentDescription.tueChecked = true;
                            presentDescription.wedChecked = true;
                            presentDescription.thuChecked = true;
                            presentDescription.friChecked = true;
                            presentDescription.satChecked = true;
                            presentDescription.sunChecked = true;
                        }

                        presentDescriptions.push(presentDescription);
                    }


                    promotionType.name_display = 'Voucher';

                    promotionFactory.setData(2, {
                        isCanGoNext: true,
                        promotionType: promotionType,
                        autoNum: autoNum,
                        indexInArray: indexInArray,
                        presentDescriptions: presentDescriptions,
                        brand_id: brandId
                    });
                    break;
            }
        }
    }

])