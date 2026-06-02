'use strict';
angular
        .module('xenon.controllers')
        .controller('UserCtrl', function($scope, $EMSOservice, $rootScope, Restangular, $Functions, $navigation){
            $rootScope.Start();
            if(MyLocalStorage.getItem('user_info').business_partner == 'false'){
                $scope.businessPartner = false;
            }else{
                $scope.businessPartner = true;
            }

            var vm = this;
            var routeName = 'userprofile';
            var EmptyObject = {
                role_id: "",
                company_id: "",
                site_id: "",
                workstations_id: "",
                firstname: "",
                lastname: "",
                email: "",
                contact_num: "",
                fingerprint: "",
                password: "",
                actiontype: "New"
            };

            vm.load = function(){
                $navigation.clear();
                vm.hasData = false;
                vm.FormDisplay = false;
                vm.Single = {};
                vm.UserTypes = [];
                vm.Companies = [];
                vm.Sites = [];
                vm.Workstation = [];
                var wobj;
                vm.baseData = Restangular.all(routeName);
                vm.LoadData = function(){
                    vm.baseData.getList().then(function(data){
                        vm.formData = data;
                        vm.hasData = (data.length > 0);
                        vm.Single = null;
                        vm.FormDisplay = false;
                        $rootScope.Loaded();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                $navigation.clear();
                $Functions.Users().then(function(user){
                    vm.User = user;
                    //vm.Functions.Single('company');

                    //$rootScope.AxelDisplay = "hidden";
                    vm.LoadData();
                });
                vm.Single = null;
                vm.addForm = function(){
                    vm.FormDisplay = true;
                    vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                    $Functions.UserType().then(function(userTypes){
                        vm.UserTypes = userTypes;
                    });
                    $Functions.Company().then(function(companies){
                        vm.Companies = companies;
                    });
                    $rootScope.Template = vm.Single.fingerprint;
                    $rootScope.F0 = 'exclamation';
                    $rootScope.F1 = 'exclamation';
                    $rootScope.F2 = 'exclamation';
                    $rootScope.FingerServ = '';
                    $rootScope.fingerimg = '';
                    wobj = $scope.$watch(function(){
                        return $rootScope.Template;
                    }, function(){
                        vm.Single.fingerprint = $rootScope.Template;
                    }, true);
                    setTimeout(function(){
                        if($('select[name="company_id"]')){
                            $('select[name="company_id"]').val(getCookie('company'));
                        }
                    }, 1000);
                };

                vm.Fingerprint = function(){
                    $rootScope.FingerFeedback = "StartRegistration";
                    $EMSOservice.Run(vm.FingerServ);
                }
                vm.clearfingerprint = function(){
                    vm.Single.fingerprint = "";
                }
                vm.filterChange = function(type){
                    if(type === 'company'){
                        vm.Sites = [];
                        $navigation.Company(vm.Single.company_id);
                        $Functions.Site().then(function(siteList){
                            vm.Sites = siteList;
                        });
                    }else if(type === 'site'){
                        vm.workstation = [];
                        $navigation.Site(vm.Single.site_id);
                        $Functions.Workstation().then(function(workstations){
                            vm.Workstations = workstations;
                        });
                    }
                }

                vm.save = function(data){
                    $('.page-loading-overlay').show();
                    $rootScope.Start();
                    wobj();
                    if(vm.Single.actiontype !== null && vm.Single.actiontype === "New"){
                        vm.baseData.post(vm.Single).then(function(){
                            vm.LoadData();
                        }, function(response){
                            var errorMsg = '';
                            for(var key in response['data']){
                                if(response['data'].hasOwnProperty(key)){
                                    errorMsg += response['data'][key] + '<br/>';
                                }
                            }
                            toastr.error(errorMsg, 'error');
                            $('.page-loading-overlay').hide();
                            $rootScope.Error(response);
                        });
                    }else{
                        vm.Single.save().then(function(){
                            vm.LoadData();
                        }, function(response){
                            var errorMsg = '';
                            for(var key in response['data']){
                                if(response['data'].hasOwnProperty(key)){
                                    errorMsg += response['data'][key] + '<br/>';
                                }
                            }
                            toastr.error(errorMsg, 'error');
                            $('.page-loading-overlay').hide();
                            $rootScope.Error(response);
                        });
                    }
                };

                vm.cancel = function(){
                    vm.FormDisplay = false;
                };

                vm.editForm = function(data){
                    $rootScope.Start();
                    $Functions.UserType().then(function(userTypes){
                        vm.UserTypes = userTypes;
                    });
                    $Functions.Company().then(function(companies){
                        vm.Companies = companies;
                    });
                    $Functions.Site().then(function(sites){
                        vm.Sites = sites;
                    });
                    $Functions.Workstation().then(function(workstations){
                        vm.Workstations = workstations;
                    });
                    Restangular.one(routeName, data.id).get().then(function(dat){
                        vm.Single = dat;
                        vm.FormDisplay = true;
                        $rootScope.Template = vm.Single.fingerprint;
                        $rootScope.F0 = 'exclamation';
                        $rootScope.F1 = 'exclamation';
                        $rootScope.F2 = 'exclamation';
                        $rootScope.FingerServ = "";
                        $rootScope.fingerimg = "";
                        wobj = $scope.$watch(function(){
                            return $rootScope.Template;
                        }, function(){
                            vm.Single.fingerprint = $rootScope.Template;
                        }, true);
                        $rootScope.Loaded();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                vm.delete = function(data){
                    vm.FormDisplay = false;
                    if(!window.confirm('Are you sure?')){
                        return;
                    }
                    $rootScope.Start();
                    Restangular.one(routeName, data.id).get().then(function(dat){
                        dat.remove().then(function(){
                            vm.LoadData();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    });
                };
            };
        });
