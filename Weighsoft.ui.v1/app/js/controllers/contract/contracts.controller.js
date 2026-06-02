"use strict";
angular
  .module("xenon.controllers")
  .controller("ContractsCtrl", function (
    $scope,
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
    if (MyLocalStorage.getItem("user_info").business_partner == "false")
    {
      $scope.businessPartner = false;
    } else
    {
      $scope.businessPartner = true;
    }

    var vm = this;
    var routeName = "contract";

    vm.isEditing = false;

    vm.companyList = [];
    vm.siteList = [];
    vm.contractList = [];
    vm.User = [];
    vm.Site = {};
    vm.HeaderSingle = {
      company_id: null,
      site_id: null
    };

    function loadContracts() {
      $state.go("app.contract.list", { id: vm.HeaderSingle.site_id });
    }

    vm.showAddForm = function () {
      $state.go('app.contract.edit', { contract_id: null });
    };


    vm.changeFilter = function (type) {
      switch (type)
      {
        case "company":
          $navigation.Company(vm.HeaderSingle.company_id);
          $navigation.Site(null);
          $Functions.Site().then(
            function (siteList) {
              vm.siteList = siteList;
              if (vm.siteList.length == 1)
              {
                vm.HeaderSingle.site_id = vm.siteList[0].value;
                loadContracts();
              }
              $rootScope.Loaded("Single Site on ContractsCtrl");
            },
            function (response) {
              $rootScope.Error(response);
            }
          );
          break;
        case "site":
          $navigation.Site(vm.HeaderSingle.site_id);
          loadContracts();
          break;
      }
    };

    vm.getData = function (type) {
      switch (type)
      {
        case "company":
          $Functions.Company().then(function (companyList) {
            vm.HeaderSingle.company_id = $rootScope.Params.company_id;
            vm.companyList = companyList;
          });
          break;
        case "site":
          $Functions.Site().then(
            function (siteList) {
              vm.HeaderSingle.site_id = $rootScope.Params.site_id;
              vm.siteList = siteList;
              loadContracts();
              $rootScope.Loaded("Single Site on ContractsCtrl");
            },
            function (response) {
              $rootScope.Error(response);
            }
          );
          break;
      }
    };

    vm.initialize = function () {
      $navigation.clear();
      $Functions.Users().then(function (user) {
        vm.getData("company");
        if ($rootScope.Params.company_id !== null)
        {
          vm.getData("site");
        }
        $rootScope.Loaded();
        $rootScope.AxelDisplay = "hidden";
      });
    };
  });
