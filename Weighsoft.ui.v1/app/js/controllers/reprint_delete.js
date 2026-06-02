"use strict";
angular.module("xenon.controllers").controller("ReprintDeleteCtrl", function ($scope, $rootScope, $state, $stateParams, $window, Restangular, $q, $navigation, $Functions, $Exceptions) {
    var vm = this;
    // Expose controller to template as System
    $scope.System = vm;
    var routeName = "weighingheaders";
    
    vm.Single = {};
    vm.deleteReason = "";
    vm.ScannedUser = null;
    // Default to 'No' and hydrate from Site configuration
    vm.FingerPrintVerify = "No";
    vm.userprofile = [];
    
    vm.HeaderSingle = {
        company_id: $stateParams.company_id,
        site_id: $stateParams.site_id,
        workstation_id: $stateParams.workstation_id
    };
    
    $rootScope.FingerFeedback = "";
    
    vm.load = function () {
        if (!$stateParams.id) {
            $state.go('app.reprint_list');
            return;
        }
        
        // Ensure navigation context for downstream helper functions
        $navigation.clear();
        $navigation.Company($stateParams.company_id);
        $navigation.Site($stateParams.site_id);
        $navigation.Workstation($stateParams.workstation_id);

        // Load the transaction data
        var Service = Restangular.one(routeName, $stateParams.id);
        Service.customGET("", vm.HeaderSingle).then(
            function (data) {
                vm.Single = data;
                vm.ScannedUser = null;
                $rootScope.FingerFeedback = "";

                // Determine fingerprint requirement from Site configuration
                $Functions.Site().then(
                    function (siteList) {
                        var site = null;
                        // siteList entries usually expose either `value` or `id`
                        site = siteList.find(function (s) { return s.value == vm.HeaderSingle.site_id || s.id == vm.HeaderSingle.site_id; });
                        if (site && typeof site.finger_active !== "undefined") {
                            // Normalize to "Yes" / "No"
                            vm.FingerPrintVerify = (site.finger_active === true || site.finger_active === 'Yes') ? 'Yes' : 'No';
                        } else {
                            vm.FingerPrintVerify = "No"; // safe default
                        }

                        // Load users for fingerprint verification only when required
                        if (vm.FingerPrintVerify === 'Yes') {
                            vm.Functions.Users().then(
                                function () {
                                    $rootScope.Loaded("Transaction loaded for delete confirmation");
                                },
                                function (response) {
                                    $rootScope.Error(response);
                                }
                            );
                        } else {
                            $rootScope.Loaded("Transaction loaded for delete confirmation (fingerprint not required)");
                        }
                    },
                    function () {
                        // If site lookup fails, proceed without fingerprint
                        vm.FingerPrintVerify = "No";
                        $rootScope.Loaded("Transaction loaded for delete confirmation (fingerprint not required)");
                    }
                );
            },
            function (response) {
                $rootScope.Error(response);
                $state.go('app.reprint_list');
            }
        );
    };
    
    vm.Functions = {
        Users: function () {
            var deferred = $q.defer();
            Restangular.all("userprofile")
                .getList($navigation.get())
                .then(
                    function (data) {
                        // Fetch the role information
                        Restangular.one("usertype", data.role_id)
                            .get()
                            .then(
                                function (role) {
                                    // Combine the role data with the user data
                                    data.role = role; // Add the role data to the user data object
                                }
                            );
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
                        
                        // Set up fingerprint watcher
                        vm.finger = $scope.$watch(
                            function () {
                                return $rootScope.FingerFeedback;
                            },
                            function (current, original) {
                                if (current !== original && $rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(";") === -1) {
                                    vm.userprofile.forEach(function (user) {
                                        if (user.fingerprint.indexOf(";") == -1) {
                                            if (user.fingerprint.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length)) {
                                                vm.ScannedUser = user.firstname + " " + user.lastname;
                                                swal("Success", "Fingerprint Match: " + user.firstname + " " + user.lastname, "success");
                                            }
                                        } else {
                                            var fingerprints = user.fingerprint.split(";");
                                            fingerprints.forEach(function (current_value) {
                                                if (current_value.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length)) {
                                                    vm.ScannedUser = user.firstname + " " + user.lastname;
                                                    swal("Success", "Fingerprint Match: " + user.firstname + " " + user.lastname, "success");
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        );
                        deferred.resolve({ data: { message: "userprofile success!" } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        }
    };
    
    vm.Fingerprint = function () {
        $rootScope.FingerFeedback = "StartVerification";
        vm.Functions.Users().then(
            function (value) {
                $rootScope.Loaded("Fingerprint verification started");
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };
    
    vm.confirmDelete = function () {
        if (!vm.deleteReason) {
            swal("Delete Transaction", "Please add a reason to delete.", "error");
            return;
        }
        
        if (vm.FingerPrintVerify === 'Yes' && (vm.ScannedUser === null || vm.ScannedUser === '')) {
            swal("Delete Transaction", "Please scan your fingerprint to authorize this deletion.", "error");
            return;
        }
        
        var currentTime = new Date();
        vm.Single.deleted_at = currentTime;
        vm.Single.reason = vm.deleteReason;
        // Use Restangular endpoint, not vm.Single (which is a plain object)
        var siteId = vm.HeaderSingle.site_id || vm.Single.site_id;
        var workstationId = vm.HeaderSingle.workstation_id || vm.Single.workstation_id;
        Restangular.one(routeName, vm.Single.id)
            .customPOST(
                {
                    reason: vm.deleteReason,
                    site_id: siteId,
                    workstation_id: workstationId,
                },
                "delete",
                {},
                {}
            ).then(
            function () {
                // SweetAlert v1 does not return a promise; use callback form
                swal({
                    title: "Success",
                    text: "Transaction deleted successfully.",
                    type: "success"
                }, function () {
                    $state.go('app.reprint_list');
                });
                
                // Log the exception
                $Functions.Users().then(function (user) {
                    vm.exception = {
                        code: "TRANSACTION DELETED",
                        description: "Transaction " + vm.Single.transaction + " deleted by " + user.firstname + " " + user.lastname,
                        jsondata: JSON.stringify({
                            transaction_id: vm.Single.transaction,
                            user_id: user.id,
                        }),
                        comment: vm.deleteReason,
                        weighbridge_id: vm.Single.weighbridge_id,
                        workstation_id: vm.Single.workstation_id,
                        company_id: vm.Single.company_id,
                        site_id: vm.Single.site_id,
                    };
                    $Exceptions.set(vm.exception).then(function () {
                        console.log("Exception logged successfully");
                    });
                });
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };
    
    vm.cancelDelete = function ($event) {
        if ($event && typeof $event.preventDefault === "function") {
            $event.preventDefault();
        }
        if ($event && typeof $event.stopPropagation === "function") {
            $event.stopPropagation();
        }

        var getType = {};
        if (getType.toString.call(vm.finger) === "[object Function]") {
            vm.finger();
        }

        // Go back to the previous screen when available.
        if ($window && $window.history && $window.history.length > 1) {
            $window.history.back();
            return;
        }

        $state.go('app.reprint_list');
    };
    
    // Clean up watchers when leaving the controller
    $scope.$on('$destroy', function() {
        if (vm.finger && typeof vm.finger === 'function') {
            vm.finger();
        }
    });
});
