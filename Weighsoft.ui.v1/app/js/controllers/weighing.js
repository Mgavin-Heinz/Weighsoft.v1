"use strict";

angular
    .module("xenon.controllers")
    .controller("WeighingCtrl", function ($scope, $state, $rootScope, Restangular, $q, $navigation, $modal, $interval, $filter, $nodeRed, $http, $Functions, $Exceptions) {
        const vm = this;
        const routeName = "weighingheaders";

        $scope.showweighings = function (weighings) {
            return weighings.status == "OPEN" || weighings.status == "VERIFY";
        };

        vm.Companies = [];
        vm.Sites = [];
        vm.Workstations = [];
        vm.User;
        vm.UserLevel;
        vm.HeaderSingle = {
            company_id: null,
            site_id: null,
            workstation_id: null,
        };
        function setDefaultData() {
            
            vm.ReportData = {
                Hauliers: null,
                BusinessPartners: null,
                Products: null,
                Settings: null,
                Pallets: null,
                Tares: null,
                Pallet: null,
                palletName: null,
                amount: null,
            };
            vm.Site = {};
            vm.Workstation = {};
            vm.exception = {
                code: "Transaction Deleted",
                description: "",
                jsondata: "",
                comment: "",
                weighbridge_id: "",
                workstation_id: "",
                site_id: "",
                company_id: "",
            };
        }
        vm.Weighbridges = [];
        vm.FormDisplay = false;
        vm.Single = {};
        setDefaultData();
        let selectedWeighingId = null;

        vm.baseData = Restangular.all(routeName);
        
        // ✅ FIX: Initialize $rootScope.Params to prevent undefined errors (consistent with reprint_list.js)
        if (!$rootScope.Params) {
            $rootScope.Params = {
                company_id: null,
                site_id: null,
                workstation_id: null
            };
        }

        vm.addForm = function () {
            // ✅ FIX: Ensure $rootScope.Params are preserved before navigation (consistent with reprint_list.js)
            if (!$rootScope.Params) {
                $rootScope.Params = {};
            }
            $rootScope.Params.company_id = vm.HeaderSingle.company_id;
            $rootScope.Params.site_id = vm.HeaderSingle.site_id;
            $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
            
            console.log("Navigating to weigh_create with preserved state:", $rootScope.Params);
            
            $state.go("app.weigh_create", {
                company_id: vm.HeaderSingle.company_id,
                site_id: vm.HeaderSingle.site_id,
                workstation_id: vm.HeaderSingle.workstation_id,
                company: vm.ReportData.Company.registered_name,
                site: vm.Site.name,
                workstation: vm.Workstation.name,
                FingerPrintVerify: vm.FingerPrintVerify,
                SiteDecimals: vm.Site.decimals,
                SiteMeasure_type: vm.Site.measure_type,
                SiteDeduct_flow: vm.Site.deduct_flow
            });
        };

        const GetCompanies = function () {
            $Functions.Company(vm.User.company_id).then(function (companyList) {
                vm.Companies = companyList;
                if ($rootScope.Params.company_id !== null)
                {
                    vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                    $navigation.Company(vm.HeaderSingle.company_id);
                    vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
                    GetSites();
                } else
                {
                    $rootScope.Loaded("Single Site on WeighingCtrl");
                }
            });
        };
        const GetSites = function () {
            $Functions.Site().then(
                function (siteList) {
                    if (vm.HeaderSingle.site_id === null)
                    {
                        vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                    }
                    vm.Sites = siteList;
                    let site = vm.Sites.find((site) => site.value == vm.HeaderSingle.site_id);
                    if (site == undefined && vm.Sites.length == 1)
                    {
                        site = vm.Sites[0];
                        $rootScope.Params.site_id = site.value;
                        vm.HeaderSingle.site_id = site.value;
                    }

                    if (site)
                    {
                        vm.FingerPrintVerify = site.finger_active;
                        vm.Site.decimals = site.decimals;
                        vm.Site.measure_type = site.measure_type;
                        vm.Site.deduct_flow = site.deduct_flow;
                        vm.Site.name = site.name;
                        vm.Site.shared_workstation = site.shared_workstation;
                    }

                    $navigation.Site(vm.HeaderSingle.site_id);

                    if (vm.Sites.length === 1)
                    {
                        vm.HeaderSingle.site_id = vm.Sites[0].value;
                        $rootScope.Params.site_id = vm.Sites[0].value;
                    }

                    if (vm.Sites.length === 1 || $rootScope.Params.site_id !== null)
                    {
                        if (vm.Site.shared_workstation === 'Yes')
                        {
                            LoadData();
                        }
                        GetWorkstations();
                    }

                    $rootScope.Loaded("Single Site on WeighingCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        };

        const GetWorkstations = function () {
            $Functions.Workstation().then(
                function (workstationList) {
                    if (vm.HeaderSingle.workstation_id === null)
                        {
                            vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                        }

                    vm.Workstations = workstationList;
                    let workstation = vm.Workstations.find((workstation) => workstation.value == vm.HeaderSingle.workstation_id);
                    if (workstation == undefined && vm.Workstations.length == 1)
                    {
                        workstation = vm.Workstations[0];
                        $rootScope.Params.workstation_id = workstation.value;
                        vm.HeaderSingle.workstation_id = workstation.value;
                    }

                    if (workstation)
                        {
                            vm.Workstation.name = workstation.name;
                        }
                
                    $navigation.Workstation(vm.HeaderSingle.workstation_id);

                    if (vm.Workstations.length === 1)
                    {
                            vm.HeaderSingle.workstation_id = vm.Workstations[0].value;
                            $rootScope.Params.workstation_id = vm.Workstations[0].value;
                            vm.Workstation.name = vm.Workstations[0].name;
                    }
                    if (vm.Site.shared_workstation !== 'Yes')
                    {
                        LoadData();
                    }
                    $rootScope.Loaded("Single Workstation on WeighingCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        };

        vm.SelectOnChange = function (type) {
            // ✅ FIX: Initialize $rootScope.Params if undefined (consistent with reprint_list.js)
            if (!$rootScope.Params) {
                $rootScope.Params = {
                    company_id: null,
                    site_id: null,
                    workstation_id: null
                };
            }
            
            console.log("Weighing SelectOnChange triggered:", {
                type: type,
                currentSelection: vm.HeaderSingle[type + "_id"],
                beforeChange: {
                    company: vm.HeaderSingle.company_id,
                    site: vm.HeaderSingle.site_id,
                    workstation: vm.HeaderSingle.workstation_id
                }
            });
            
            switch (type)
            {
                case "company":
                    // ✅ FIX: Update $rootScope.Params when user changes company
                    if (vm.HeaderSingle.company_id) {
                        $rootScope.Params.company_id = vm.HeaderSingle.company_id;
                        $rootScope.Params.site_id = null; // Reset dependent selections
                        $rootScope.Params.workstation_id = null;
                        
                        $navigation.Company(vm.HeaderSingle.company_id);
                        
                        // Update ReportData.Company for consistency
                        if ($rootScope.MasterData) {
                            vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === vm.HeaderSingle.company_id);
                        }
                        
                        GetSites();
                    } else {
                        console.warn("Weighing: Company selection is null/undefined");
                    }
                    break;
                    
                case "site":
                    // ✅ FIX: Update $rootScope.Params when user changes site
                    if (vm.HeaderSingle.site_id) {
                        $rootScope.Params.site_id = vm.HeaderSingle.site_id;
                        $rootScope.Params.workstation_id = null; // Reset dependent selection
                        
                        GetSites();
                    } else {
                        console.warn("Weighing: Site selection is null/undefined");
                    }
                    break;
                    
                case "workstation":
                    // ✅ FIX: Update $rootScope.Params when user changes workstation
                    if (vm.HeaderSingle.workstation_id) {
                        $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
                        
                        GetWorkstations();
                    } else {
                        console.warn("Weighing: Workstation selection is null/undefined");
                    }
                    break;
            }
            
            console.log("Weighing SelectOnChange completed:", {
                type: type,
                afterChange: {
                    company: vm.HeaderSingle.company_id,
                    site: vm.HeaderSingle.site_id,
                    workstation: vm.HeaderSingle.workstation_id
                },
                rootScopeParams: $rootScope.Params
            });
        };

        vm.load = function () {
            $navigation.clear();
            //var navInfo = $navigation.get();
            $Functions.Users().then(function () {
                vm.getData("company");
            });
        };

        vm.editForm = function (data) {
            // ✅ FIX: Ensure $rootScope.Params are preserved before navigation (consistent with reprint_list.js)
            if (!$rootScope.Params) {
                $rootScope.Params = {};
            }
            const useCurrentContext = vm.Site.shared_workstation === 'Yes';
            const targetCompanyId = useCurrentContext
                ? vm.HeaderSingle.company_id
                : (data && data.company_id != null ? data.company_id : vm.HeaderSingle.company_id);
            const targetSiteId = useCurrentContext
                ? vm.HeaderSingle.site_id
                : (data && data.site_id != null ? data.site_id : vm.HeaderSingle.site_id);
            const targetWorkstationId = useCurrentContext
                ? vm.HeaderSingle.workstation_id
                : (data && data.workstation_id != null ? data.workstation_id : vm.HeaderSingle.workstation_id);

            const targetCompanyName = useCurrentContext
                ? ((vm.ReportData.Company && vm.ReportData.Company.registered_name) || vm.HeaderSingle.company || "")
                : ((data && data.company) || (vm.ReportData.Company && vm.ReportData.Company.registered_name) || vm.HeaderSingle.company || "");
            const targetSiteName = useCurrentContext
                ? (vm.Site.name || vm.HeaderSingle.site || "")
                : ((data && data.site) || vm.Site.name || vm.HeaderSingle.site || "");
            const targetWorkstationName = useCurrentContext
                ? (vm.Workstation.name || vm.HeaderSingle.workstation || "")
                : ((data && data.workstation) || vm.Workstation.name || vm.HeaderSingle.workstation || "");

            $rootScope.Params.company_id = targetCompanyId;
            $rootScope.Params.site_id = targetSiteId;
            $rootScope.Params.workstation_id = targetWorkstationId;
            
            console.log("Navigating to weigh_update with preserved state:", $rootScope.Params);
            
            $state.go("app.weigh_update", {
                id: data.id,
                company_id: targetCompanyId,
                site_id: targetSiteId,
                workstation_id: targetWorkstationId,
                shared_workstation: vm.Site.shared_workstation,
                company: targetCompanyName,
                site: targetSiteName,
                workstation: targetWorkstationName,
                FingerPrintVerify: vm.FingerPrintVerify,
                SiteDecimals: vm.Site.decimals,
                SiteMeasure_type: vm.Site.measure_type,
                SiteDeduct_flow: vm.Site.deduct_flow
            });
        };

        function LoadData(cancel) {
            $rootScope.Start("vm.LoadData in WeighingCtrl");
            if (cancel)
            {
                $rootScope.Loaded("vm.LoadData in WeighingCtrl");
            } else
                vm.baseData.getList(vm.HeaderSingle).then(
                    function (data) {
                        //vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                        data.forEach((d) => {
                            d.index = data.indexOf(d);
                        });
                        vm.formData = data;
                        $rootScope.Loaded("vm.LoadData in WeighingCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            vm.FormDisplay = false;
        }

        vm.Functions = {
            Users: function () {
                const deferred = $q.defer();
                Restangular.all("userprofile")
                    .withHttpConfig({ cache: true })
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            vm.userprofile = [];
                            $rootScope.FingerFeedback = "";
                            data.forEach(function (mapData) {
                                vm.userprofile.push({
                                    fingerprint: mapData.fingerprint,
                                    id: mapData.firstname,
                                    firstname: mapData.firstname,
                                    lastname: mapData.lastname,
                                });
                                $rootScope.FingerFeedback = $rootScope.FingerFeedback + mapData.fingerprint + ";";
                            });
                            //$EMSOservice.Run();
                            const getType = {};


                            deferred.resolve({ data: { message: "userprofile success!" } });
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
                return deferred.promise;
            },
        };

        vm.deleteForm = function (data) {
            selectedWeighingId = data.id;
            vm.deleteFormDisplay = true;
            vm.ScannedUser = null;
            $rootScope.FingerFeedback = "StartVerification";
            vm.Functions.Users().then(
                function () {
                    $rootScope.Loaded("Single grade on WeighingCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
            Restangular.one(routeName, data.id).withHttpConfig({ cache: true })
                .customGET("", vm.HeaderSingle)
                .then(
                    function (dat) {
                        vm.ReadOnly = true;
                        vm.Single = dat;
                        $rootScope.Loaded("Complete");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        };

        vm.delete = function (data) {
            if (!vm.deleteReason)
            {
                swal("Delete Weighing", "Please add a reason to delete.", "error");
                return;
            }
            const currentTime = new Date();
            vm.Single.deleted_at = currentTime;
            vm.Single.reason = vm.deleteReason;
            vm.Single.customPOST(
                {
                    reason: vm.deleteReason,
                },
                "delete",
                {},
                {}
            ).then(
                function () {
                    vm.deleteFormDisplay = false;
                    vm.deleteReason = "";
                    LoadData();
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );

            $Functions.Users().then(function (user) {
                vm.exception = {
                    code: "TRANSACTION DELETED",
                    description: "Transaction " + vm.Single.transaction + " deleted by " + user.firstname + " " + user.lastname,
                    jsondata: JSON.stringify({
                        transaction_id: vm.Single.transaction,
                        user_id: user.id,
                    }),
                    comment: vm.Single.reason,
                    weighbridge_id: vm.Single.weighbridge_id,
                    workstation_id: vm.Single.workstation_id,
                    company_id: vm.Single.company_id,
                    site_id: vm.Single.site_id,
                };
                $Exceptions.set(vm.exception).then(function () {
                    console.log("success");
                });
            });
    };

        vm.cancel = function () {
            vm.deleteFormDisplay = false;
            vm.deleteReason = "";
            vm.ScannedUser = null;
            $rootScope.FingerFeedback = "";
            selectedWeighingId = null;
        };

        vm.initialize = function () {
            $navigation.clear();

            $Functions.Users().then(function (user) {
                vm.User = user;
                vm.UserLevel = user.role.id;
                // $Functions.UserRole(role_id).then(function (role) {
                //     vm.UserLevel = role.level;
                //     console.log('VM.USERLevel', vm.UserLevel);
                // }).catch(function (error) {
                //     console.error('Error fetching user role:', error);
                // });
        
                GetCompanies();

                $rootScope.AxelDisplay = "hidden";
                //LoadData();
                }).catch(function (error) {
                    console.error('Error fetching user:', error);
                });
            };
    });
