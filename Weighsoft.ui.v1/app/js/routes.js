
var env = {};
if (window)
{
    Object.assign(env, window.__env);
}

var app = angular.module('xenon-app');

app.config(function ($stateProvider, $urlRouterProvider, ASSETS, $authProvider, RestangularProvider) {
    var base = __env.base;
    $authProvider.loginUrl = base + '/api/authenticate';
    //$rootScope.baseUrl = base + '/api';
    RestangularProvider.setBaseUrl(base + '/api');
    RestangularProvider.setResponseExtractor(function (response) {
        return response;
    });

    $urlRouterProvider.otherwise('/login');

    $stateProvider.
        state('app', {
            abstract: true,
            url: '/app',
            templateUrl: appHelper.templatePath('layout/app-body'),
            controller: function ($rootScope) {
                $rootScope.isLoginPage = false;
                $rootScope.isLightLoginPage = false;
                $rootScope.isLockScreenPage = false;
                $rootScope.isMainPage = true;

            },
        }).
        state('app.dashboard-main', {
            url: '/dashboard-main',
            templateUrl: appHelper.templatePath('dashboards/admin'),
            controller: "MainDashboard as System",
            resolve: {
                resources: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.charts.dxGlobalize,
                        ASSETS.extra.toastr,
                    ]);
                },
                dxCharts: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.charts.dxCharts,
                    ]);
                },
            }
        }).
        state('login', {
            url: '/login',
            templateUrl: appHelper.templatePath('login'),
            controller: 'LoginCtrl as auth',
            resolve: {
                resources: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.forms.jQueryValidate,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('logout', {
            url: '/admin/logout',
            controller: 'LogoutCtrl',
        }).
        state('app.users', {
            url: '/users',
            templateUrl: appHelper.templatePath('users/list'),
            controller: 'UserCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr
                    ]);
                },
            }
        }).
        state('app.usertype', {
            url: '/usertype',
            templateUrl: appHelper.templatePath('usertypes/list'),
            controller: 'UserTypeCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.company', {
            url: '/company',
            templateUrl: appHelper.templatePath('companies/list'),
            controller: 'CompaniesCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.companies', {
            url: '/companies',
            templateUrl: appHelper.templatePath('companies/main'),
            controller: 'CompanyCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.company_create', {
            url: '/companies/create',
            templateUrl: appHelper.templatePath('companies/company_create'),
            controller: 'CompanyCreateCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.company_manage', {
            url: '/companies/manage',
            templateUrl: appHelper.templatePath('companies/company_edit'),
            controller: 'CompanyManageCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.site', {
            url: '/site',
            templateUrl: appHelper.templatePath('sites/list'),
            controller: 'SiteCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.sites', {
            url: '/sites',
            templateUrl: appHelper.templatePath('sites/main'),
            controller: 'SitesCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.site_manage', {
            url: '/sites/manage',
            templateUrl: appHelper.templatePath('companies/site_edit'),
            controller: 'SiteManageCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.site_create', {
            url: '/sites/create',
            templateUrl: appHelper.templatePath('companies/site_create'),
            controller: 'SiteCreateCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.workstations', {
            url: '/workstations',
            templateUrl: appHelper.templatePath('workstations/list'),
            controller: 'WorkStationsCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.point_create', {
            url: '/sites/point/create',
            templateUrl: appHelper.templatePath('companies/point_create'),
            controller: 'PointCreateCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.point_update', {
            url: '/sites/point/update',
            templateUrl: appHelper.templatePath('companies/point_update'),
            controller: 'PointUpdateCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.weighbridges', {
            url: '/weighbridges',
            templateUrl: appHelper.templatePath('weighbridges/list'),
            controller: 'WeighbridgeCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.weighbridge_setup', {
            url: '/weighbridge_setup',
            templateUrl: appHelper.templatePath('weighbridge_setup/list'),
            controller: 'WeighbridgeSetupCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.cameras', {
            url: '/cameras',
            templateUrl: appHelper.templatePath('cameras/list'),
            controller: 'CameraCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.camera_create', {
            url: '/sites/point/weighbridge/camera/create',
            templateUrl: appHelper.templatePath('companies/camera_create'),
            controller: 'CameraCreateCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.camera_update', {
            url: '/sites/point/weighbridge/camera/update',
            templateUrl: appHelper.templatePath('companies/camera_update'),
            controller: 'CameraUpdateCtrl',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.businesspartners', {
            url: '/businesspartners',
            templateUrl: appHelper.templatePath('businesspartners/list'),
            controller: 'BusinessPartnersCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.hauliers', {
            url: '/hauliers',
            templateUrl: appHelper.templatePath('hauliers/list'),
            controller: 'HauliersCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.rfidvehicles', {
            url: '/rfidvehicles',
            templateUrl: appHelper.templatePath('rfid_vehicles/list'),
            controller: 'RFIDVehiclesCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.products', {
            url: '/products',
            templateUrl: appHelper.templatePath('products/list'),
            controller: 'ProductsCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        // state('app.grades', {
        //     url: '/grades',
        //     templateUrl: appHelper.templatePath('grades/list'),
        //     controller: 'GradesCtrl as System',
        //     resolve: {
        //         deps: function ($ocLazyLoad) {
        //             return $ocLazyLoad.load([
        //                 ASSETS.tables.datatables,
        //                 ASSETS.extra.toastr,
        //             ]);
        //         },
        //     }
        // }).
        state('app.weigh_update', {
            url: '/weigh/update',
            templateUrl: appHelper.templatePath('weighing/update'),
            controller: 'WeighingUpdateCtrl as System',
            params: {
                company_id: '',
                id: '',
                site_id: '',
                workstation_id: '',
                shared_workstation: '',
                company: '',
                site: '',
                workstation: '',
                FingerPrintVerify : '',
                SiteDecimals : '',
                SiteMeasure_type : '',
                SiteDeduct_flow : ''
            },
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        // state('app.weigh_verify', {
        //     url: '/weigh/verify',
        //     templateUrl: appHelper.templatePath('weighing/verify'),
        //     controller: 'WeighingVerifyCtrl as System',
        //     resolve: {
        //         deps: function ($ocLazyLoad) {
        //             return $ocLazyLoad.load([
        //                 ASSETS.tables.datatables,
        //                 ASSETS.extra.toastr,
        //             ]);
        //         },
        //     }
        // }).
        state('app.weigh_create', {
            url: '/weigh/create',
            templateUrl: appHelper.templatePath('weighing/create'),
            controller: 'WeighingCreateCtrl as System',
            params: {
                company_id: '',
                site_id: '',
                workstation_id: '',
                company: '',
                site: '',
                workstation: '',
                FingerPrintVerify : '',
                SiteDecimals : '',
                SiteMeasure_type : '',
                SiteDeduct_flow : ''
            },
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.weighing', {
            url: '/weighing',
            templateUrl: appHelper.templatePath('weighing/site'),
            controller: 'WeighingCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.reprint', {
            url: '/reprint',
            redirectTo: 'app.reprint_list'
        }).
        state('app.reprint_list', {
            url: '/reprint_list',
            templateUrl: appHelper.templatePath('weighing/reprint_list'),
            controller: 'ReprintListCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.reprint_delete', {
            url: '/reprint/delete/:id?company_id&site_id&workstation_id',
            templateUrl: appHelper.templatePath('weighing/reprint_delete'),
            controller: 'ReprintDeleteCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.reprint_edit', {
            url: '/reprint/edit/:id?company_id&site_id&workstation_id',
            templateUrl: appHelper.templatePath('weighing/reprint_edit'),
            controller: 'ReprintEditCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.reprint_print', {
            url: '/reprint/print/:id?company_id&site_id&workstation_id',
            templateUrl: appHelper.templatePath('weighing/reprint_print'),
            controller: 'ReprintPrintCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.verify', {
            url: '/verify',
            templateUrl: appHelper.templatePath('weighing/verify'),
            controller: 'VerifyCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.settings', {
            url: '/settings',
            templateUrl: appHelper.templatePath('settings/list'),
            controller: 'SettingsCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.axelsettings', {
            url: '/axelsettings',
            templateUrl: appHelper.templatePath('settings/axle'),
            controller: 'AxelSettingsCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.transactions', {
            url: '/transactions',
            templateUrl: appHelper.templatePath('transaction/list'),
            controller: 'TransactionCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.exceptions', {
            url: '/exceptions',
            templateUrl: appHelper.templatePath('exceptions/reporting'),
            controller: 'ReportingCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.pallets', {
            url: '/pallets',
            templateUrl: appHelper.templatePath('pallet/pallet'),
            controller: 'PalletsCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.pallets.list', {
            url: '/list/:id',
            templateUrl: appHelper.templatePath('pallet/list'),
            controller: 'PalletListCtrl as System'
        }).
        state('app.pallets.edit', {
            url: '/edit/:pallet_id',
            templateUrl: appHelper.templatePath('pallet/edit'),
            controller: 'PalletEditCtrl as System'
        }).
        state('app.tares', {
            url: '/tares',
            templateUrl: appHelper.templatePath('tare/tare'),
            controller: 'TaresCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.tares.list', {
            url: '/list/:id',
            templateUrl: appHelper.templatePath('tare/list'),
            controller: 'TareListCtrl as System'
        }).
        state('app.tares.edit', {
            url: '/edit/:id',
            templateUrl: appHelper.templatePath('tare/edit'),
            controller: 'TareEditCtrl as System'
        }).
        state('app.xero', {
            url: '/xero',
            templateUrl: appHelper.templatePath('xero/list'),
            controller: 'XeroCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.contract', {
            url: '/contract',
            templateUrl: appHelper.templatePath('contract/contract'),
            controller: 'ContractsCtrl as System',
            resolve: {
                deps: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ASSETS.tables.datatables,
                        ASSETS.extra.toastr,
                    ]);
                },
            }
        }).
        state('app.contract.list', {
            url: '/list/:id',
            templateUrl: appHelper.templatePath('contract/list'),
            controller: 'ContractListCtrl as System'
        }).
        state('app.contract.edit', {
            url: '/edit/:contract_id',
            templateUrl: appHelper.templatePath('contract/edit'),
            controller: 'ContractEditCtrl as System'
        }).
        state('app.contract.transactions', {
            url: '/:contract_id/transactions',
            templateUrl: appHelper.templatePath('contract/transactions'),
            controller: 'ContractTransactionsCtrl as System'
        });
});
