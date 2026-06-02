angular
  .module("xenon.controllers")
  .controller("PalletEditCtrl", function ($rootScope, $Functions, Restangular, $state, $stateParams) {
    var vm = this;

    vm.BusinessPartners = [];
    vm.Products = [];
    vm.Directions = ["Receive", "Dispatch"];

    vm.selected_product;
    var productsList = [];
    var businessPartnerList = [];
    var palletList = [];
    vm.selected_businessPartner;
    vm.ShowLink = false;
    vm.palletInfo = {
      pallet_name: "",
      amount: "",
      // updated_at: "",
      // created_at: "",
      // deleted_at: null,
      company_id: 0,
      site_id: 0
    };

    var getLookupData = function () {
      $rootScope.Start();
      var LookupPallets = $Functions.Pallets();
      Promise.all([LookupPallets]).then(
        function (values) {
          console.log('--->>',values);
          palletList = values[0];
          if ($stateParams.pallet_id && $stateParams.pallet_id.length > 0)
            loadPallet();
          $rootScope.Loaded();
        },
        function (response) {
          $rootScope.Error(response);
        });
    };

    var loadPallet = function () {
      $rootScope.Start();
      Restangular.one("pallets", $stateParams.pallet_id).get().then(function (palletInfo) {
        vm.palletInfo = palletInfo;
        vm.isEditing = true;
        $rootScope.Loaded();
      }, function (response) {
        $rootScope.Error(response);
      });
    }
   
    vm.saveForm = function (data) {

      // Validate the mandatory input fileds to create a pallet
      if (!isPalletFormValid()) return false;

      $rootScope.Start();
      if (typeof vm.palletInfo.pallet_id === "undefined") {

        console.log('excecuting 1')
        vm.palletInfo.company_id = $rootScope.Params.company_id;
        vm.palletInfo.site_id = $rootScope.Params.site_id;
        Restangular.all("pallets")
          .post(vm.palletInfo)
          .then(
            function () {
              goToPalletList();
            },
            function (response) {
              $rootScope.Error(response);
            }
          );
      } else {
        Restangular.one('pallets', $stateParams.pallet_id).customPUT(vm.palletInfo)
        .then(
          function () {
            goToPalletList();
          },
          function (response) {
            $rootScope.Error(response);
          }
        );
      }
    };

    vm.cancelEdit = function () {
      goToPalletList();
    };

    // A pallet should have a name, expiry date, amount
    // a product. Without this pallet will be invalid hence
    // we should not alllow it to be submitted
    var isPalletFormValid = function () {
      return (
        vm.palletInfo.pallet_name.length !== 0 &&
        vm.palletInfo.amount.length !== 0
      );
    };

    function goToPalletList() {
      $state.go('app.pallets.list', {
        id: $rootScope.Params.site_id
      });
    }

    getLookupData();
  });