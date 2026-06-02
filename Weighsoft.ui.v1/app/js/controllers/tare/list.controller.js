angular
  .module("xenon.controllers")
  .controller("TareListCtrl", function(
    $rootScope,
    $Functions,
    $state,
    $stateParams,
    Restangular
  ) {
    var vm = this;

    vm.loadTares = function() {
        if($stateParams.id){
            $rootScope.Start();
            $Functions.Tares().then(
              function(data) {
                vm.tareList = data;
                $rootScope.Loaded();
              },
              function(response) {
                $rootScope.Error(response);
              }
            );
        }
        else{
            vm.tareList = [];
        }
    };

    vm.showEditForm = function(tare) {
        $state.go('app.tares.edit', { id: tare.value});
    };
    vm.showTransactions = function(tare) {
      $state.go("app.tares.transactions", { id: tare.value });
    };

    vm.deleteWeighbridge = function(tare) {
        vm.isEditing = false;
        if (!confirm("Are you sure you want to delete the tare?")) {
          return;
        }
  
        $rootScope.Start();
        Restangular.one("tares", tare.value)
        .remove().then(
          function() {
            vm.loadTares();
          },
          function(response) {
            $rootScope.Error(response);
          }
        );
          
      };

    vm.loadTares();
  });
