angular
  .module("xenon.controllers")
  .controller("ContractEditCtrl", function ($rootScope, $Functions, Restangular, $state, $stateParams) {
    var vm = this;

    vm.BusinessPartners = [];
    vm.Products = [];
    vm.Directions = ["Receive", "Dispatch"];

    vm.selected_product;
    var productsList = [];
    var businessPartnerList = [];
    var contractList = [];
    vm.selected_businessPartner;
    vm.ShowLink = false;
    vm.contractInfo = {
      name: "",
      businesspartner_id: 0,
      expiry_date: "",
      direction: "Receive",
      amount: "",
      price: "",
      product_id: 0,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      company_id: 0,
      site_id: 0,
      stockpile_nr: "",
      destination: ""
    };

    var getLookupData = function () {
      $rootScope.Start();
      var LookupBusinessPartner = $Functions.BusinessPartner();
      var LookupProduct = $Functions.Product();
      var LookupContracts = $Functions.Contracts();
      var LookupSites = $Functions.Site();
      Promise.all([LookupBusinessPartner, LookupProduct, LookupContracts, LookupSites]).then(
        function (values) {
          vm.BusinessPartners = values[0];
          businessPartnerList = values[0];
          vm.Products = values[1];
          productsList = values[1];
          contractList = values[2];
          vm.Site = (Array.isArray(values[3]) && values[3].length > 0) ? values[3][0] : null;
          if ($stateParams.contract_id && $stateParams.contract_id.length > 0)
            loadContract();
          $rootScope.Loaded();
        },
        function (response) {
          $rootScope.Error(response);
        });
    };

    var loadContract = function () {
      $rootScope.Start();
      Restangular.one("contract", $stateParams.contract_id).get().then(function (contractInfo) {
        vm.contractInfo = contractInfo;
        //$Functions.BusinessPartner().then(function (businessPartners) {
        vm.selected_businessPartner = businessPartnerList.find((business) => business.value == contractInfo.businesspartner_id);
        //});
        //$Functions.Product().then(function (products) {
        vm.selected_product = productsList.find((product) => product.value == contractInfo.product_id);
        //});
        vm.Oldercontract = contractList.filter(contract => contract.value != contractInfo.id &&
          contract.businesspartner_id == contractInfo.businesspartner_id &&
          contract.product_id == contractInfo.product_id);
        vm.selected_oldercontract = contractList.find((contract) => contract.value == contractInfo.linked_contact_id);
        vm.isEditing = true;

        if (vm.Oldercontract.length > 0)
          vm.ShowLink = true;
        else
          vm.ShowLink = false;
        $rootScope.Loaded();
      }, function (response) {
        $rootScope.Error(response);
      });
    }
    vm.SelectionChanged = function () {
      if (vm.selected_businessPartner != null && vm.selected_product != null)
        vm.Oldercontract = contractList.filter(contract => contract.value != $stateParams.contract_id &&
          contract.businesspartner_id == vm.selected_businessPartner.id &&
          contract.product_id == vm.selected_product.id);
      else {
        vm.selected_oldercontract = null;
        vm.Oldercontract = [];
      }
      if (vm.Oldercontract.length > 0)
        vm.ShowLink = true;
      else
        vm.ShowLink = false;
    }

    vm.saveForm = function (data) {
      // Validate the mandatory input fileds to create a contract
      if (!isContractFormValid()) return false;

      // Update the selected product and business partner to the contract
      vm.contractInfo.businesspartner_id = vm.selected_businessPartner.id;
      vm.contractInfo.businesspartner = vm.selected_businessPartner.name;
      vm.contractInfo.product_id = vm.selected_product.id;
      vm.contractInfo.product = vm.selected_product.name;
      if (vm.selected_oldercontract != null) {
        vm.contractInfo.linked_contact_id = vm.selected_oldercontract.value;
      }
      $rootScope.Start();
      if (typeof vm.contractInfo.id === "undefined") {
        vm.contractInfo.company_id = $rootScope.Params.company_id;
        vm.contractInfo.site_id = $rootScope.Params.site_id;
        Restangular.all("contract")
          .post(vm.contractInfo)
          .then(
            function () {
              goToContractList();
            },
            function (response) {
              $rootScope.Error(response);
            }
          );
      } else {
        vm.contractInfo.save().then(
          function () {
            goToContractList();
          },
          function (response) {
            $rootScope.Error(response);
          }
        );
      }
    };

    vm.cancelEdit = function () {
      goToContractList();
    };

    // A contract should have a name, expiry date, amount
    // a product. Without this contract will be invalid hence
    // we should not alllow it to be submitted
    var isContractFormValid = function () {
      return (
        vm.contractInfo.name.length !== 0 &&
        vm.contractInfo.expiry_date.length !== 0 &&
        vm.contractInfo.amount.length !== 0 &&
        vm.selected_businessPartner.id.length !== 0 &&
        vm.selected_product.id.length !== 0 &&
        vm.contractInfo.price.length !== 0
      );
    };

    function goToContractList() {
      $state.go('app.contract.list', {
        id: $rootScope.Params.site_id
      });
    }

    getLookupData();
  });