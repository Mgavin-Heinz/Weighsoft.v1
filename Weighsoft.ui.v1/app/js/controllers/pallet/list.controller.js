angular
  .module("xenon.controllers")
  .controller("PalletListCtrl", function(
    $rootScope,
    $Functions,
    $state,
    $stateParams,
    Restangular
  ) {
    var vm = this;

    vm.loadPallets = function() {
      console.log($stateParams)
        if($stateParams.id){
            $rootScope.Start();
            $Functions.Pallets().then(
              function(data) {
                console.log('-->>', data)
                vm.palletList = data;
                $rootScope.Loaded();
              },
              function(response) {
                $rootScope.Error(response);
              }
            );
        }
        else{
            vm.palletList = [];
        }
        console.log(vm.palletList)
    };

    vm.showEditForm = function(pallet) {
        $state.go('app.pallets.edit', { pallet_id: pallet.value});
    };
    vm.showTransactions = function(pallet) {
      $state.go("app.pallets.transactions", { pallet_id: pallet.value });
    };

    vm.deleteWeighbridge = function(pallet) {
        vm.isEditing = false;
        if (!confirm("Are you sure you want to delete the pallet?")) {
          return;
        }
  
        $rootScope.Start();
        Restangular.one("pallets", pallet.value)
        .remove().then(
          function() {
            vm.loadPallets();
          },
          function(response) {
            $rootScope.Error(response);
          }
        );
          
      };

    vm.loadPallets();
  });
