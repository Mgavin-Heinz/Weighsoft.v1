'use strict';
angular
    .module('xenon.controllers')
    .controller('UserTypeCtrl', function ($scope, $rootScope, Restangular) {
        $rootScope.Start();
        var vm = this;
        var routeName = 'usertype';
        var ObjectProperties = {
            usertypes: {type: "string", title: "Description", description: ""},
            level: {type: "string", title: "Level", description: "", enum: ['5','4','3','2','1']},
            companies: {type: "string", title: "Companies", description: "", enum: ["true", "false"]},
            sites: {type: "string", title: "Sites", description: "", enum: ["true", "false"]},
            workstations: {type: "string", title: "Workstations", description: "", enum: ["true", "false"]},
            weighbridges: {type: "string", title: "Weighbridges", description: "", enum: ["true", "false"]},
            cameras: {type: "string", title: "Cameras", description: "", enum: ["true", "false"]},
            weigh_types: {type: "string", title: "Weigh Types", description: "", enum: ["true", "false"]},
            weighing: {type: "string", title: "Weighing", description: "", enum: ["true", "false"]},
            verify: {type: "string", title: "Verify", description: "", enum: ["true", "false"]},
            reprint: {type: "string", title: "Reprint", description: "", enum: ["true", "false"]},
            business_partner: {type: "string", title: "Business Partner", description: "", enum: ["true", "false"]},
            products: {type: "string", title: "Products", description: "", enum: ["true", "false"]},
            hauliers: {type: "string", title: "Hauliers", description: "", enum: ["true", "false"]},
            stored_tares: {type: "string", title: "Stored Tares", description: "", enum: ["true", "false"]},
            rfid_vehicle: {type: "string", title: "Rfid Vehicle", description: "", enum: ["true", "false"]},
            axel_types: {type: "string", title: "Axel Types", description: "", enum: ["true", "false"]},
            axel_settings: {type: "string", title: "Axel Settings", description: "", enum: ["true", "false"]},
            transaction_report: {type: "string", title: "Transaction Report", description: "", enum: ["true", "false"]},
            exception_report: {type: "string", title: "Exception Report", description: "", enum: ["true", "false"]},
            users: {type: "string", title: "users", description: "", enum: ["true", "false"]},
            user_types: {type: "string", title: "User Types", description: "", enum: ["true", "false"]},
            delete_transaction_flag: {type: "string", title: "Can Delete Transactions", description: "", enum: ["true", "false"]},
            xero: {type: "string", title: "Xero", description: "", enum: ["true", "false"]}
        };
        var EmptyObject = {
            usertypes: "",
            companies: "false",
            sites: "false",
            workstations: "false",
            cameras: "false",
            weigh_types: "false",
            weighing: "false",
            verify: "false",
            reprint: "false",
            business_partner: "false",
            products: "false",
            hauliers: "false",
            stored_tares: "false",
            rfid_vehicle: "false",
            axel_types: "false",
            axel_settings: "false",
            transaction_report: "false",
            exception_report: "false",
            users: "false",
            user_types: "false",
            delete_transaction_flag:"false",
            xero: "false",
            actiontype: "New"
        };
        vm.load = function () {
            vm.hasData = false;
            vm.FormDisplay = false;
            vm.Single = {};
            vm.schema = {
                type: "object",
                properties: ObjectProperties
            };
            vm.baseData = Restangular.all(routeName);
            vm.LoadData = function () {
                vm.baseData.getList().then(function (data) {
                    vm.formData = data;
                    vm.hasData = (data.length > 0);
                    vm.Single = null;
                    vm.FormDisplay = false;
                    $rootScope.Loaded();
                }, function (response) {
                    $rootScope.Error(response);
                });
            };
            vm.LoadData();
            vm.Single = null;
            vm.addForm = function () {
                vm.FormDisplay = true;
                vm.Single = JSON.parse(JSON.stringify(EmptyObject));
            };
            vm.save = function (data) {
                $scope.$broadcast('schemaFormValidate');
                $rootScope.Start();
                if (data.$valid) {
                    if (vm.Single.actiontype !== null && vm.Single.actiontype === "New") {
                        vm.baseData.post(vm.Single).then(function () {
                            vm.LoadData();
                        }, function (response) {
                            $rootScope.Error(response);
                        });
                    } else {
                        vm.Single.save().then(function () {
                            vm.LoadData();
                        }, function (response) {
                            $rootScope.Error(response);
                        });
                    }
                }
            };
            vm.cancel = function () {
                vm.FormDisplay = false;
            };
            vm.editForm = function (data) {
                $rootScope.Start();
                Restangular.one(routeName, data.id).get().then(function (dat) {
                    vm.Single = dat;
                    vm.FormDisplay = true;
                    $rootScope.Loaded();
                }, function (response) {
                    $rootScope.Error(response);
                });
            };
            vm.delete = function (data) {
                vm.FormDisplay = false;
                if (!window.confirm("Are you sure?")) {
                    return;
                }
                $rootScope.Start();
                Restangular.one(routeName, data.id).get().then(function (dat) {
                    dat.remove().then(function () {
                        vm.LoadData();
                    }, function (response) {
                        $rootScope.Error(response);
                    });
                });
            };
            vm.form = [
                "usertypes",
                "level",
                {
                    key: "companies",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "sites",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "workstations",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "weighbridges",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "cameras",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "weigh_types",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "weighing",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "verify",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "reprint",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "business_partner",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "products",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "hauliers",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "stored_tares",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "rfid_vehicle",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "axel_types",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "axel_settings",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "transaction_report",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "exception_report",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "users",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "user_types",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "delete_transaction_flag",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "xero",
                    type: "radiobuttons",
                    htmlClass: "col-xs-6 col-md-3",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    type: "template",
                    template: "<div class='clearfix'></div>"
                },
                {
                    type: "section",
                    htmlClass: "row",
                    items: [
                        {
                            type: 'submit',
                            icon: 'glyphicon glyphicon-save',
                            htmlClass: "col-xs-6 col-md-4",
                            style: 'btn-black',
                            title: 'Save'
                        },
                        {
                            type: 'button',
                            icon: 'glyphicon glyphicon-icon-exclamation-sign',
                            htmlClass: "col-xs-7 col-md-7",
                            style: 'btn-danger pull-right',
                            title: 'Cancel',
                            onClick: function () {
                                vm.cancel();
                            }
                        }
                    ]
                }
            ];
        };
    });
