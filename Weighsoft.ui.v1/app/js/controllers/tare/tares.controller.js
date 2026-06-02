"use strict";
angular
  .module("xenon.controllers")
  .controller("TaresCtrl", function(
    $scope,
    $stateParams,
    $rootScope,
    $navigation,
    $http,
    $state,
    $modal,
    Restangular,
    $q,
    $EMSOservice,
    $Functions
  ) {
    $rootScope.Start();
    if (MyLocalStorage.getItem("user_info").business_partner == "false") {
      $scope.businessPartner = false;
    } else {
      $scope.businessPartner = true;
    }

    var vm = this;
    var routeName = "tares";

    vm.isEditing = false;

    vm.companyList = [];
    vm.siteList = [];
    vm.workstationList = [];
    vm.palletList = [];
    vm.User = [];

    vm.HeaderSingle = {
      company_id: $stateParams.company_id,
      site_id: $stateParams.site_id,
      workstation_id: $stateParams.workstation_id,
      company: $stateParams.company,
      site: $stateParams.site,
      workstation: $stateParams.workstation
  };

    function loadTares() {
      $state.go("app.tares.list", { id: vm.HeaderSingle.site_id });
    }

    vm.showAddForm = function() {
      $state.go('app.tares.edit', { id: null});
    };


    vm.changeFilter = function(type) {
      switch (type) {
        case "company":
          $navigation.Company(vm.HeaderSingle.company_id);
          $Functions.Site().then(
            function(siteList) {
              vm.siteList = siteList;
              if (vm.siteList.length === 1) {
                vm.HeaderSingle.site_id = vm.siteList.value;
                $navigation.Site(vm.HeaderSingle.site_id);
                loadTares();
              }
              $rootScope.Loaded("Single Site on TaresCtrl");
            },
            function(response) {
              $rootScope.Error(response);
            }
          );
          
        case "site":
          $navigation.Site(vm.HeaderSingle.site_id);
          $Functions.Workstation().then(
            function (workstationList) {
              vm.workstationList = workstationList;
              if (vm.workstationList.length === 1) {
                vm.HeaderSingle.workstation_id = vm.workstationList.value;
                $navigation.Workstation(vm.HeaderSingle.workstation_id);
                loadTares();
              }
                $rootScope.Loaded("Single Workstation on TaresCtrl");
            },
            function(response) {
              $rootScope.Error(response);
            }
          );
          loadTares();
          break;
        case "workstation":
          $navigation.Workstation(vm.HeaderSingle.workstation_id);
          loadTares();
          break;
      }
    };

    vm.getData = function(type) {
      switch (type) {
        case "company":
          $Functions.Company().then(function(companyList) {
            vm.HeaderSingle.company_id = $rootScope.Params.company_id;
            vm.companyList = companyList;
          });
          break;
        case "site":
          $Functions.Site().then(
            function(siteList) {
              vm.HeaderSingle.site_id = $rootScope.Params.site_id;
              vm.siteList = siteList;
              vm.getData("workstation");
              loadTares();
              $rootScope.Loaded("Single Site on TaresCtrl");
            },
            function(response) {
              $rootScope.Error(response);
            }
          );
          break;
          case "workstation":
            $Functions.Workstation().then(
                function (workstationList) {
                  console.log('WORKSTATION',$rootScope.Params.workstation_id);
                  vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                  vm.workstationList = workstationList;
                    $rootScope.Loaded("Single Workstation on TaresCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
            break;
      }
    };

    vm.initialize = function() {
      $navigation.clear();
      $Functions.Users().then(function(user) {
        vm.getData("company");
        if ($rootScope.Params.company_id !== null) {
          vm.getData("site");
        }
        $rootScope.Loaded();
        $rootScope.AxelDisplay = "hidden";
      });
    };
  });
