'use strict';
angular
        .module('xenon.controllers')
        .controller('ModalInstanceCtrl', function($scope, $rootScope, Restangular, $q){
            $scope.greeting = 'Hola!';
            $scope.selectchange = function(){
                vm.Weight = [0, 0, 0, 0, 0, 0];
                vm.WeightSave();
            };
            var vm = this;
            vm.Single = {};
            vm.AxelSetupsListener = $scope.$watch(function(){
                return $rootScope.WeightInt;
            }, function(current, original){
                $rootScope.AxelClass = "bg-success";
                if($rootScope.AxelSetups.Selected == null){
                    return;
                }
                if(($rootScope.AxelSetups.Selected.steering_max < $scope.Weight1) ||
                        ($rootScope.AxelSetups.Selected.axel_1_max < $scope.Weight2) ||
                        ($rootScope.AxelSetups.Selected.axel_2_max < $scope.Weight3) ||
                        ($rootScope.AxelSetups.Selected.axel_3_max < $scope.Weight4) ||
                        ($rootScope.AxelSetups.Selected.axel_4_max < $scope.Weight5) ||
                        ($rootScope.AxelSetups.Selected.vehicle_max < $scope.TotalWeight)){
                    $rootScope.AxelClass = "bg-danger";

                }
            });
            vm.WeightSave = function(){
                vm.Weight[vm.Weight.lastIndexOf(1) + 1] = 1;

                var data = {
                    Weight1: $scope.Weight1,
                    Weight2: $scope.Weight2,
                    Weight3: $scope.Weight3,
                    Weight4: $scope.Weight4,
                    Weight5: $scope.Weight5,
                    Weight6: $scope.Weight6,
                    TotalWeight: $scope.TotalWeight
                };
                $rootScope.$broadcast('axleWeighingEvent', data);
                var getType = {};
                if(getType.toString.call(vm.listener) === '[object Function]'){
                    vm.listener();
                }
                if((!$scope.Weight1 || $scope.Weight1 == 0) && $rootScope.AxelSetups.Selected.steering_max != '')
                    vm.listener = $scope.$watch(function(){
                        return $rootScope.WeightInt;
                    }, function(current, original){
                        $scope.Weight1 = current;
                        $scope.TotalWeight = current;
                    });
                else if((!$scope.Weight2 || $scope.Weight2 == 0) && $rootScope.AxelSetups.Selected.axel_1_max != '')
                    vm.listener = $scope.$watch(function(){
                        return $rootScope.WeightInt;
                    }, function(current, original){
                        if($rootScope.AxelSetups.FirstWeighType === 'On_Cumulative' || $rootScope.AxelSetups.SecondWeighType === 'On_Cumulative') {
                            $scope.Weight2 = current;
                            $scope.TotalWeight = $scope.Weight1 + $scope.Weight2;
                        
                        } else {
                            $scope.Weight2 = current - $scope.Weight1;
                            $scope.TotalWeight = current;
                        }
                    });
                else if((!$scope.Weight3 || $scope.Weight3 == 0) && $rootScope.AxelSetups.Selected.axel_2_max != '')
                    vm.listener = $scope.$watch(function(){
                        return $rootScope.WeightInt;
                    }, function(current, original){
                        if ($rootScope.AxelSetups.FirstWeighType === 'On_Cumulative' || $rootScope.AxelSetups.SecondWeighType === 'On_Cumulative') {
                            $scope.Weight3 = current;
                            $scope.TotalWeight = $scope.Weight1 + $scope.Weight2 + $scope.Weight3;                        
                        } else {
                            $scope.Weight3 = current - $scope.Weight1 - $scope.Weight2;
                            $scope.TotalWeight = current;
                        }
                    });
                else if((!$scope.Weight4 || $scope.Weight4 == 0) && $rootScope.AxelSetups.Selected.axel_3_max != '')
                    vm.listener = $scope.$watch(function(){
                        return $rootScope.WeightInt;
                    }, function(current, original){
                        if ($rootScope.AxelSetups.FirstWeighType === 'On_Cumulative' || $rootScope.AxelSetups.SecondWeighType === 'On_Cumulative') {
                            $scope.Weight4 = current;
                            $scope.TotalWeight = $scope.Weight1 + $scope.Weight2 + $scope.Weight3 + $scope.Weight4;
                        } else {
                            $scope.Weight4 = current - $scope.Weight1 - $scope.Weight2 - $scope.Weight3;
                            $scope.TotalWeight = current;
                        }
                    });
                else if((!$rootScope.Weight5 || $rootScope.Weight5 == 0) && $rootScope.AxelSetups.Selected.axel_4_max != '')
                    vm.listener = $scope.$watch(function(){
                        return $rootScope.WeightInt;
                    }, function(current, original){
                        if ($rootScope.AxelSetups.FirstWeighType === 'On_Cumulative' || $rootScope.AxelSetups.SecondWeighType === 'On_Cumulative') {
                            $scope.Weight5 = current;
                            $scope.TotalWeight = $scope.Weight1 + $scope.Weight2 + $scope.Weight3 + $scope.Weight4 + $scope.Weight5;
                        } else {
                            $scope.Weight5 = current - $scope.Weight1 - $scope.Weight2 - $scope.Weight3 - $scope.Weight4;
                            $scope.TotalWeight = current;
                        }
                    });

            }
        });
