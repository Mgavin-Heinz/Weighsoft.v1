'use strict';

angular
    .module('xenon.controllers')
    .controller('ExceptionCtrl', function ($scope, $rootScope, $state, Restangular, $Functions, $navigation, DTOptionsBuilder, $Exceptions) {
        var GROUP_BY_TOTAL = 1;
        var GROUP_BY_CODE = 2;

        var emptyRecord = {
            id: '-',
            code: '-',
            descrption: '-',
            comment: '-',
            created_at: '-',
            TotalNumber: '-',
        };
        $scope.date = {
            startDate: null,
            endDate: null ,
        };

        var initialData = [];
        var filterData = [];

        var vm = this;
        vm.selectedGroup;
        vm.options = {
            locale: {
                separator: '  :  '
            },
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            eventHandlers: {
                'apply.daterangepicker': function (event, picker) {
                    vm.filterData();
                },
            }
        }

        vm.exceptionData = [];
        vm.groupList = [
            {value: GROUP_BY_TOTAL, name: 'Total'},
            {value: GROUP_BY_CODE, name: 'Code'},
        ];

        vm.dtOptions = DTOptionsBuilder.newOptions().withButtons(['csv']);

        vm.initialize = function () {
            $navigation.clear();
            var navInfo = $navigation.get();
            $Functions.Users().then(function (user) {
                var params = {
                    company_id: user.company_id ? user.company_id : navInfo.company_id,
                    site_id : user.site_id ? user.site_id : navInfo.site_id,
                    workstation_id : user.workstations_id ? user.workstations_id : navInfo.workstation_id,
                    weighbridge_id: vm.weighbridge_id ? vm.weighbridge_id : navInfo.weighbridge_id,
                }
                $Exceptions.get().then(function (exceptions) {
                    initialData = exceptions;
                    vm.exceptionData = initialData;
                    filterData = initialData;
                });
            });
            $rootScope.Loaded("Single Site on ExceptionCtrl");
        }

        vm.filterData = function () {
            if(vm.selectedGroup) {
                filterData = _.filter(initialData, function (data) {

                    return moment(data.updated_at).isBetween($scope.date.startDate, $scope.date.endDate);
                });
                vm.exceptionData = filterData;
                vm.filterGroup(vm.selectedGroup);
            } else {
                filterData = _.filter(initialData, function (data) {
                    return moment(data.updated_at).isBetween($scope.date.startDate, $scope.date.endDate);
                });
                vm.exceptionData = filterData;
            }
        }

        vm.filterGroup = function (group_id) {
            switch (group_id) {
                case GROUP_BY_TOTAL:
                    vm.exceptionData = filterData;
                    break;
                case GROUP_BY_CODE:
                    groupByLocation(group_id);
                    break;
            }
        };

        function groupByLocation(level) {
            var groupedRecords = _.groupBy(filterData, function (record) {
                if (level === GROUP_BY_CODE) {
                    return record.code;
                }
            });
            var summedRecords = [];
            _.forEach(groupedRecords, function (childRecords, companyId) {
                var summedData = {
                    code: childRecords[0].code,
                    TotalNumber: _.size(childRecords),
                };
                summedRecords.push(_.assign({}, emptyRecord, summedData));
            });

            vm.exceptionData = summedRecords;
        }

        vm.clear = function () {
            $scope.date = {
                startDate: null,
                endDate: null,
            };
            filterData = initialData;
            vm.exceptionData = filterData;
        }
    });
