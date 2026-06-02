angular
  .module("xenon.controllers")
  .controller("ContractListCtrl", function (
    $rootScope,
    $q,
    $Functions,
    $state,
    $stateParams,
    Restangular
  ) {
    var vm = this;
    vm.loadContracts = function () {
      if ($stateParams.id)
      {
        $rootScope.Start();
        $q.all([$Functions.Site(), $Functions.Contracts()]).then(
          function (results) {
            vm.Site = results[0][0];
            vm.contractList = results[1];
            $rootScope.Loaded();
          },
          function (response) {
            $rootScope.Error(response);
          }
        );
      }
      else
      {
        vm.contractList = [];
      }
    };

    vm.showEditForm = function (contract) {
      $state.go('app.contract.edit', { contract_id: contract.value });
    };
    vm.showTransactions = function (contract) {
      $state.go("app.contract.transactions", { contract_id: contract.value });
    };

    vm.deleteWeighbridge = function (contract) {
      vm.isEditing = false;
      if (!confirm("Are you sure you want to delete the contract?"))
      {
        return;
      }

      $rootScope.Start();
      Restangular.one("contract", contract.value)
        .get()
        .then(function (contractInfo) {
          contractInfo.remove().then(
            function () {
              vm.loadContracts();
            },
            function (response) {
              $rootScope.Error(response);
            }
          );
        });
    };

    vm.loadContracts();
  });
