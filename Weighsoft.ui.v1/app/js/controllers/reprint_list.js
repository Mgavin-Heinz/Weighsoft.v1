"use strict";
angular.module("xenon.controllers").controller("ReprintListCtrl", function ($scope, $rootScope, $state, $stateParams, Restangular, $q, $navigation, DTOptionsBuilder, $Functions) {
    if (MyLocalStorage.getItem("user_info").business_partner == "false") {
        $scope.businessPartner = false;
    } else {
        $scope.businessPartner = true;
    }
    
    var vm = this;
    var routeName = "weighingheaders";
    
    vm.HeaderSingle = {
        company_id: null,
        site_id: null,
        workstation_id: null,
        pageSize: 10,
        searchTerm: "",
        pageStart: 0,
        orderByDir: "desc",
        orderByCol: "updated_at"
    };
    
    // ✅ FIX: Initialize ReportData like weighing.js for consistency
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
        Company: null
    };
    
    vm.Companies = [];
    vm.Sites = [];
    vm.Workstations = [];
    vm.formData = [];
    vm.baseData = Restangular.all(routeName);
    
    // ✅ FIX: Initialize $rootScope.Params to prevent undefined errors
    if (!$rootScope.Params) {
        $rootScope.Params = {
            company_id: null,
            site_id: null,
            workstation_id: null
        };
    }
    
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withButtons(["csv", "colvis", "print", "excel"])
        .withOption("aaSorting", [[1, "desc"]]);
    
    vm.Functions = {
        Single: function (type) {
            $rootScope.Start("Single on ReprintListCtrl");
            switch (type) {
                case "company":
                    $Functions.Company(vm.User.company_id).then(function (companyList) {
                        vm.Companies = companyList;
                        
                        // ✅ FIX: Only update if company not already selected
                        if (!vm.HeaderSingle.company_id && $rootScope.Params.company_id !== null) {
                            vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                            $navigation.Company(vm.HeaderSingle.company_id);
                        }
                        
                        // Set ReportData.Company for consistency with weighing.js
                        if (vm.HeaderSingle.company_id && $rootScope.MasterData) {
                            vm.ReportData = vm.ReportData || {};
                            vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === vm.HeaderSingle.company_id);
                        }
                        
                        $rootScope.Loaded("Single Company on ReprintListCtrl");
                    });
                    break;
                case "site":
                    $Functions.Site().then(
                        function (siteList) {
                            vm.Sites = siteList;
                            
                            // ✅ FIX: Only restore if site not already selected
                            if (!vm.HeaderSingle.site_id && $rootScope.Params.site_id !== null) {
                                vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                            }
                            
                            var site = vm.Sites.find(function(s) { return s.value == vm.HeaderSingle.site_id; });
                            vm.SharedWorkstation = (site && site.shared_workstation === 'Yes') ? 'Yes' : 'No';
                            
                            $navigation.Site(vm.HeaderSingle.site_id);
                            
                            // ✅ FIX: Set $rootScope.Params for single site scenario
                            if (vm.Sites.length == 1 && !vm.HeaderSingle.site_id) {
                                vm.HeaderSingle.site_id = vm.Sites[0].value;
                                $rootScope.Params.site_id = vm.Sites[0].value;
                                var singleSite = vm.Sites[0];
                                vm.SharedWorkstation = (singleSite && singleSite.shared_workstation === 'Yes') ? 'Yes' : 'No';
                            }
                            $rootScope.Loaded("Single Site on ReprintListCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "workstation":
                    $Functions.Workstation().then(
                        function (workstationList) {
                            vm.Workstations = workstationList;
                            
                            // ✅ FIX: Only restore if workstation not already selected
                            if (!vm.HeaderSingle.workstation_id && $rootScope.Params.workstation_id !== null) {
                                vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                            }
                            
                            $navigation.Workstation(vm.HeaderSingle.workstation_id);
                            
                            // ✅ FIX: Set $rootScope.Params for single workstation scenario
                            if (vm.Workstations.length == 1 && !vm.HeaderSingle.workstation_id) {
                                vm.HeaderSingle.workstation_id = vm.Workstations[0].value;
                                $rootScope.Params.workstation_id = vm.Workstations[0].value;
                            }
                            $rootScope.Loaded("Single Workstation on ReprintListCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
            }
        }
    };
    
    vm.load = function () {
        // ✅ CRITICAL FIX: Don't clear navigation if we have existing selections
        // This preserves state when returning from reprint/edit screens
        var hasExistingSelections = vm.HeaderSingle.company_id || vm.HeaderSingle.site_id || vm.HeaderSingle.workstation_id;
        
        if (!hasExistingSelections) {
            $navigation.clear();
        }
        
        $Functions.Users().then(function (user) {
            vm.User = user;
            
            // ✅ FIX: Preserve existing selections or restore from $rootScope.Params
            console.log("ReprintList Load - Current State:", {
                existing: {
                    company: vm.HeaderSingle.company_id,
                    site: vm.HeaderSingle.site_id,
                    workstation: vm.HeaderSingle.workstation_id
                },
                rootScope: {
                    company: $rootScope.Params?.company_id,
                    site: $rootScope.Params?.site_id,
                    workstation: $rootScope.Params?.workstation_id
                }
            });
            
            // Company handling
            if (vm.HeaderSingle.company_id) {
                // Preserve existing company selection
                $navigation.Company(vm.HeaderSingle.company_id);
                $rootScope.Params.company_id = vm.HeaderSingle.company_id;
                vm.Functions.Single("company");
            } else if ($rootScope.Params && $rootScope.Params.company_id !== null) {
                // Restore from $rootScope.Params
                vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                $navigation.Company(vm.HeaderSingle.company_id);
                vm.Functions.Single("company");
            } else {
                vm.Functions.Single("company");
            }
            
            // Site handling
            if (vm.HeaderSingle.site_id) {
                // Preserve existing site selection
                $navigation.Site(vm.HeaderSingle.site_id);
                $rootScope.Params.site_id = vm.HeaderSingle.site_id;
                vm.Functions.Single("site");
                vm.Functions.Single("workstation");
            } else if ($rootScope.Params && $rootScope.Params.site_id !== null) {
                // Restore from $rootScope.Params
                vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                $navigation.Site(vm.HeaderSingle.site_id);
                vm.Functions.Single("site");
                vm.Functions.Single("workstation");
            } else {
                vm.Functions.Single("site");
            }
            
            // Workstation handling
            if (vm.HeaderSingle.workstation_id) {
                // Preserve existing workstation selection
                $navigation.Workstation(vm.HeaderSingle.workstation_id);
                $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
            } else if ($rootScope.Params && $rootScope.Params.workstation_id !== null) {
                // Restore from $rootScope.Params
                vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                $navigation.Workstation(vm.HeaderSingle.workstation_id);
            }
            
            vm.workstation_id = vm.HeaderSingle.workstation_id;
            LoadData();
        });
    };
    
    function LoadData() {
        vm.formData = [];
        $Functions.Users().then(function (user) {
            vm.User = user;
            
            // ✅ FIX: Don't clear navigation unnecessarily - preserve persistence
            // Only load company data if not already loaded
            if (!vm.Companies || vm.Companies.length === 0) {
                vm.Functions.Single("company");
            }
            
            $rootScope.Start("vm.LoadData in ReprintListCtrl");
            vm.baseData.getList(vm.HeaderSingle).then(
                function (data) {
                    vm.formData = data;
                    $rootScope.Loaded("vm.LoadData in ReprintListCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        });
    }
    
    vm.SelectOnChange = function (type, e) {
        // ✅ CRITICAL FIX: Initialize $rootScope.Params if undefined
        if (!$rootScope.Params) {
            $rootScope.Params = {
                company_id: null,
                site_id: null,
                workstation_id: null
            };
        }
        
        console.log("SelectOnChange triggered:", {
            type: type,
            currentSelection: vm.HeaderSingle[type + "_id"],
            beforeChange: {
                company: vm.HeaderSingle.company_id,
                site: vm.HeaderSingle.site_id, 
                workstation: vm.HeaderSingle.workstation_id
            }
        });
        
        switch (type) {
            case "company":
                vm.Sites = [];
                vm.Workstations = [];
                vm.formData = [];
                vm.HeaderSingle.site_id = null;
                vm.HeaderSingle.workstation_id = null;
                
                // ✅ FIX: Update $rootScope.Params for persistence with safety checks
                if (vm.HeaderSingle.company_id) {
                    $rootScope.Params.company_id = vm.HeaderSingle.company_id;
                    $rootScope.Params.site_id = null;
                    $rootScope.Params.workstation_id = null;
                    
                    $navigation.clear();
                    $navigation.Company(vm.HeaderSingle.company_id);
                    
                    // Update ReportData.Company for consistency
                    if ($rootScope.MasterData) {
                        vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === vm.HeaderSingle.company_id);
                    }
                    
                    vm.Functions.Single("site");
                    LoadData();
                } else {
                    console.warn("Company selection is null/undefined");
                }
                break;
                
            case "site":
                vm.Workstations = [];
                vm.formData = [];
                vm.HeaderSingle.workstation_id = null;
                
                // ✅ FIX: Update $rootScope.Params for persistence with safety checks
                if (vm.HeaderSingle.site_id) {
                    $rootScope.Params.site_id = vm.HeaderSingle.site_id;
                    $rootScope.Params.workstation_id = null;
                    
                    var site = vm.Sites.find(function(s) { return s.value == vm.HeaderSingle.site_id; });
                    vm.SharedWorkstation = (site && site.shared_workstation === 'Yes') ? 'Yes' : 'No';
                    
                    $navigation.Site(vm.HeaderSingle.site_id);
                    vm.Functions.Single("workstation");
                    LoadData();
                } else {
                    console.warn("Site selection is null/undefined");
                }
                break;
                
            case "workstation":
                vm.formData = [];
                
                // ✅ FIX: Update $rootScope.Params for persistence with safety checks
                if (vm.HeaderSingle.workstation_id) {
                    $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
                    
                    $navigation.Workstation(vm.HeaderSingle.workstation_id);
                    LoadData();
                } else {
                    console.warn("Workstation selection is null/undefined");
                }
                break;
        }
        
        console.log("SelectOnChange completed:", {
            type: type,
            afterChange: {
                company: vm.HeaderSingle.company_id,
                site: vm.HeaderSingle.site_id,
                workstation: vm.HeaderSingle.workstation_id
            },
            rootScopeParams: $rootScope.Params
        });
    };
    
    // Navigation methods for the split screens
    vm.goToPrint = function (data) {
        // ✅ FIX: Ensure $rootScope.Params are preserved before navigation
        if (!$rootScope.Params) {
            $rootScope.Params = {};
        }
        $rootScope.Params.company_id = vm.HeaderSingle.company_id;
        $rootScope.Params.site_id = vm.HeaderSingle.site_id;
        $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
        
        console.log("Navigating to reprint_print with preserved state:", $rootScope.Params);
        
        $state.go('app.reprint_print', { 
            id: data.id,
            company_id: vm.HeaderSingle.company_id,
            site_id: vm.HeaderSingle.site_id,
            workstation_id: vm.HeaderSingle.workstation_id
        });
    };
    
    vm.goToDelete = function (data) {
        // ✅ FIX: Ensure $rootScope.Params are preserved before navigation
        if (!$rootScope.Params) {
            $rootScope.Params = {};
        }
        $rootScope.Params.company_id = vm.HeaderSingle.company_id;
        $rootScope.Params.site_id = vm.HeaderSingle.site_id;
        $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
        
        console.log("Navigating to reprint_delete with preserved state:", $rootScope.Params);
        
        $state.go('app.reprint_delete', { 
            id: data.id,
            company_id: vm.HeaderSingle.company_id,
            site_id: vm.HeaderSingle.site_id,
            workstation_id: vm.HeaderSingle.workstation_id
        });
    };
    
    vm.goToEdit = function (data) {
        // ✅ FIX: Ensure $rootScope.Params are preserved before navigation
        if (!$rootScope.Params) {
            $rootScope.Params = {};
        }
        $rootScope.Params.company_id = vm.HeaderSingle.company_id;
        $rootScope.Params.site_id = vm.HeaderSingle.site_id;
        $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id;
        
        console.log("Navigating to reprint_edit with preserved state:", $rootScope.Params);
        
        $state.go('app.reprint_edit', {
            id: data.id,
            company_id: vm.HeaderSingle.company_id,
            site_id: vm.HeaderSingle.site_id,
            workstation_id: vm.HeaderSingle.workstation_id
        });
    };
    
    // Handle other actions that don't require separate screens
    vm.editForm = function (data) {
        if (!$rootScope.Params) {
            $rootScope.Params = {};
        }
        var targetCompanyId = (data && data.company_id != null) ? data.company_id : vm.HeaderSingle.company_id;
        var targetSiteId = (data && data.site_id != null) ? data.site_id : vm.HeaderSingle.site_id;
        var targetWorkstationId = (data && data.workstation_id != null) ? data.workstation_id : vm.HeaderSingle.workstation_id;
        var targetSharedWorkstation = vm.SharedWorkstation || ((data && data.shared_workstation) ? data.shared_workstation : "No");
        $rootScope.Params.company_id = targetCompanyId;
        $rootScope.Params.site_id = targetSiteId;
        $rootScope.Params.workstation_id = targetWorkstationId;

        if (data.status === 'VERIFY') {
            $state.go('app.verify', { id: data.id });
        } else if (data.status === 'OPEN') {
            $state.go('app.weigh_update', {
                id: data.id,
                company_id: targetCompanyId,
                site_id: targetSiteId,
                workstation_id: targetWorkstationId,
                shared_workstation: targetSharedWorkstation
            });
        }
    };
});
