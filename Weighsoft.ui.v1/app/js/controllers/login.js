'use strict';
angular
        .module('xenon.controllers')
        .controller('LoginCtrl', function($scope, $rootScope, $navigation, $auth, $state, Restangular){
            $rootScope.isLoginPage = true;
            $rootScope.isLightLoginPage = false;
            $rootScope.isLockScreenPage = false;
            $rootScope.isMainPage = false;

            var vm = this;

            $rootScope.Loaded();
            if($state.user_info){
                $rootScope.authenticated = true;
                /*$rootScope.company_id = $state.user_info.company_id;
                 $rootScope.site_id = $state.user_info.site_id;
                 $rootScope.workstation_id = $state.user_info.workstations_id;*/
                $navigation.set($state.user_info);
                Restangular.setDefaultRequestParams({token: $state.user_info.token});
                toastr.success('You are now logged in', 'Success');
                if($state.user_info.permission.weighing === 'true'){
                    $state.go('app.weighing');
                }else{
                    $state.go('app.verify');
                }
            }

            vm.login = function(){
                toastr.info('Sending Login Info', 'Info');
                public_vars.$pageLoadingOverlay.removeClass('loaded');
                var credentials = {
                    email: vm.email,
                    password: vm.password
                };

                // Use Satellizer's $auth service to login
                $auth.login(credentials).then(function(data){
                    MyLocalStorage.setItem('user_info', data.data);
                    $state.user_info = MyLocalStorage.getItem('user_info');
                    /*$rootScope.company_id = $state.user_info.company_id;
                     $rootScope.site_id = $state.user_info.site_id;
                     $rootScope.workstation_id = $state.user_info.workstations_id;*/
                    $navigation.set($state.user_info);
                    $rootScope.authenticated = true;
                    $rootScope.token = data.data.token;
                    Restangular.setDefaultRequestParams({token: data.data.token});
                    toastr.success('You are now logged in', 'Success');
                    if($state.user_info.permission.weighing === 'true'){
                        $state.go('app.weighing');
                    }else{
                        $state.go('app.verify');
                    }
                    public_vars.$pageLoadingOverlay.addClass('loaded');
                }, function(responce){
                    toastr.error(responce.data.error, responce.statusText);
                    public_vars.$pageLoadingOverlay.addClass('loaded');
                });
            };
        });
