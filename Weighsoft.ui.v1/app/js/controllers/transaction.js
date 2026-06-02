'use strict';

angular
    .module('xenon.controllers')
    .controller('TransactionCtrl', function ($scope, $rootScope, $state, Restangular, $Functions, $navigation, DTOptionsBuilder) {
        var GROUP_BY_TOTAL = 1;
        var GROUP_BY_COMPANY = 2;
        var GROUP_BY_SITE = 3;
        var GROUP_BY_WEIGHINGTYPE = 4;
        var GROUP_BY_WORKSTATION = 5;
        var GROUP_BY_WEIGHBRIDGE = 6;
        var GROUP_BY_PRODUCT = 7;
        var GROUP_BY_SITE_AND_PRODUCT = 8;

        var emptyRecord = {
            transaction: '-',
            site: '-',
            settings: '-',
            RegNumber: '-',
            product: '-',
            FirstWeight: 0,
            SecondWeight: 0,
            TotalNumber: '-',
            created_at: '-',
            updated_at: '-'
        };
        $scope.date = {
            startDate: null,
            endDate: null,
        };

        var initialData = [];
        var filterData = [];

        var vm = this;

        vm.Site = {};
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

        vm.weighingData = [];
        vm.groupList = [
            { value: GROUP_BY_TOTAL, name: 'Total' },
            { value: GROUP_BY_SITE, name: 'Site' },
            { value: GROUP_BY_WEIGHINGTYPE, name: 'WeighingType' },
            { value: GROUP_BY_PRODUCT, name: 'Product' },
            { value: GROUP_BY_SITE_AND_PRODUCT, name: 'Site/Product' },
        ];

        vm.dtOptions = DTOptionsBuilder.newOptions().withButtons(['csv', 'colvis']);
        vm.dtColumnDefs = [
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 4 },
            { "visible": false, "targets": 5 },
            { "visible": false, "targets": 6 },
            { "visible": false, "targets": 7 },
            { "visible": false, "targets": 9 },
            { "visible": false, "targets": 10 },
            { "visible": false, "targets": 11 }
        ];
        vm.initialize = function () {
            $navigation.clear();
            var navInfo = $navigation.get();
            $Functions.Users().then(function (user) {
                var params = {
                    company_id: user.company_id ? user.company_id : navInfo.company_id,
                    site_id: user.site_id ? user.site_id : navInfo.site_id,
                    workstation_id: user.workstations_id ? user.workstations_id : navInfo.workstation_id,
                    weighbridge_id: vm.weighbridge_id ? vm.weighbridge_id : navInfo.weighbridge_id,
                }
                $Functions.BusinessPartner().then(function (BusinessPartner) {
                    vm.BusinessPartner = BusinessPartner;
                    Restangular.all('weighingheaders').getList(params).then(function (data) {
                        initialData = data;
                        initialData.forEach(dat => {
                            dat.TotalWeight = Math.abs(dat.FirstWeight - dat.SecondWeight);
                            dat.FirstWeight = Math.round(dat.FirstWeight, 0);
                            dat.SecondWeight = Math.round(dat.SecondWeight, 0);
                            if (dat.businesspartner_id !== null && vm.BusinessPartner.findIndex(bus => bus.value == dat.businesspartner_id) != -1)
                                dat.BusinessPartner = vm.BusinessPartner.find(bus => bus.value == dat.businesspartner_id).name;
                        });
                        vm.weighingData = initialData;
                        filterData = initialData;
                        $rootScope.Loaded("Single Site on TransactionCtrl");
                    });
                });
            });
        }

        vm.filterData = function () {
            if (vm.selectedGroup)
            {
                filterData = _.filter(initialData, function (data) {

                    return moment(data.updated_at).isBetween($scope.date.startDate, $scope.date.endDate);
                });
                vm.weighingData = filterData;
                vm.filterGroup(vm.selectedGroup);
            } else
            {
                filterData = _.filter(initialData, function (data) {
                    return moment(data.updated_at).isBetween($scope.date.startDate, $scope.date.endDate);
                });
                vm.weighingData = filterData;
            }
        }

        vm.filterGroup = function (group_id) {
            switch (group_id)
            {
                case GROUP_BY_TOTAL:
                    vm.weighingData = filterData;
                    break;
                case GROUP_BY_COMPANY:
                case GROUP_BY_SITE:
                case GROUP_BY_WEIGHINGTYPE:
                case GROUP_BY_WORKSTATION:
                case GROUP_BY_WEIGHBRIDGE:
                case GROUP_BY_PRODUCT:
                case GROUP_BY_SITE_AND_PRODUCT:
                    groupByLocation(group_id);
                    break;
            }
        };

        function groupByLocation(level) {
            var groupedRecords = _.groupBy(filterData, function (record) {
                if (level === GROUP_BY_COMPANY)
                {
                    return record.company_id;
                } else if (level === GROUP_BY_SITE)
                {
                    return record.company_id + ':' + record.site_id;
                } else if (level === GROUP_BY_WEIGHINGTYPE)
                {
                    return record.settings_id;
                } else if (level === GROUP_BY_WORKSTATION)
                {
                    return record.company_id + ':' + record.site_id + ':' + record.workstation_id;
                } else if (level === GROUP_BY_WEIGHBRIDGE)
                {
                    return record.company_id + ':' + record.site_id + ':' + record.workstation_id + ':' + record.weighbridge_id;
                } else if (level === GROUP_BY_PRODUCT)
                {
                    return record.company_id + ':' + record.product_id;
                } else if (level === GROUP_BY_SITE_AND_PRODUCT)
                {
                    return record.site_id + ':' + record.product_id;
                }
            });
            var summedRecords = [];
            _.forEach(groupedRecords, function (childRecords, companyId) {
                var totalFirstWeight = _.reduce(childRecords, function (sum, record) {
                    var weight = record.FirstWeight ? parseInt(record.FirstWeight) : 0;
                    return sum + weight;
                }, 0);

                var totalSecondWeight = _.reduce(childRecords, function (sum, record) {
                    var weight = record.SecondWeight ? parseInt(record.SecondWeight) : 0;
                    return sum + weight;
                }, 0);

                var summedData = {
                    company: childRecords[0].company,
                    FirstWeight: totalFirstWeight,
                    SecondWeight: totalSecondWeight,
                    TotalNumber: _.size(childRecords),
                };

                if (level === GROUP_BY_SITE)
                {
                    summedData.site = childRecords[0].site;
                }

                if (level === GROUP_BY_WEIGHINGTYPE)
                {
                    summedData.settings = childRecords[0].settings;
                }

                if (level === GROUP_BY_WORKSTATION)
                {
                    summedData.site = childRecords[0].site;
                    summedData.settings = childRecords[0].settings;
                    summedData.workstation = childRecords[0].workstation;
                }

                if (level === GROUP_BY_WEIGHBRIDGE)
                {
                    summedData.site = childRecords[0].site;
                    summedData.settings = childRecords[0].settings;
                    summedData.workstation = childRecords[0].workstation;
                    summedData.weighbridge = childRecords[0].weighbridge;
                }

                if (level === GROUP_BY_PRODUCT)
                {
                    summedData.product = childRecords[0].product;
                }

                if (level === GROUP_BY_SITE_AND_PRODUCT)
                {
                    summedData.site = childRecords[0].site;
                    summedData.product = childRecords[0].product;
                }

                summedRecords.push(_.assign({}, emptyRecord, summedData));
            });

            vm.weighingData = summedRecords;
        }

        vm.clear = function () {
            $scope.date = {
                startDate: null,
                endDate: null,
            };
            filterData = initialData;
            vm.weighingData = filterData;
        }
    });
