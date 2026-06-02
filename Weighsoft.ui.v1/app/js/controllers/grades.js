'use strict';
angular
        .module('xenon.controllers')
        .controller('GradesCtrl', function($scope, $rootScope, $navigation, $Functions, $http, $state, $modal, Restangular, $q, DTOptionsBuilder){
            $rootScope.Start();
            var vm = this;
            var routeName = 'grade';
            var ObjectProperties = {
                company_id: {
                    type: "string", title: "Company", description: ""
                },
                code: {type: "string", title: "Grades Code", description: ""},
                name: {type: "string", title: "Grades Name", description: ""}
            };
            var EmptyObject = {company_id: "", code: "", name: "", actiontype: "New"};
            vm.dtOptions = DTOptionsBuilder.newOptions().withButtons(['csv', 'colvis']);
            vm.load = function(){
                vm.hasData = false;
                vm.FormDisplay = false;
                vm.Single = {};
                vm.Companies = [];
                vm.HeaderSingle = {
                    company_id: null,
                };
                vm.schema = {
                    type: "object",
                    properties: ObjectProperties
                };

                vm.getData = function(type){
                    switch(type){
                        case "company":
                            $Functions.Company().then(function(companyList){
                                vm.Companies = companyList;
                            });
                            break;
                        case "site":
                            $navigation.Company(vm.HeaderSingle.company_id);
                            $Functions.Site().then(function(siteList){
                                vm.Sites = siteList;
                                if(vm.Sites.length == 1){
                                    vm.HeaderSingle.site_id = vm.Sites[0].value;
                                    vm.getData('Grades');
                                }
                                $rootScope.Loaded("Single Site on GradesCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                            break;
                        case 'Grades':
                            $navigation.Site(vm.HeaderSingle.site_id);
                            $Functions.Grades().then(function(Grades){
                                vm.formData = Grades;
                                vm.hasData = (Grades.length > 0);
                                $rootScope.Loaded("Single Site on GradesCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                            break;
                    }
                }
                vm.baseData = Restangular.all(routeName);
                vm.LoadData = function(){

                    $navigation.clear();
                    if(vm.HeaderSingle.company_id !== null){
                        vm.getData('Grades');
                    }
                    $navigation.clear();
                    vm.Single = null;
                    vm.FormDisplay = false;
                    $rootScope.Loaded();

                };
                $navigation.clear();
                $Functions.Users().then(function(user){
                    vm.User = user;
                    vm.getData('company');
                    if($rootScope.Params.company_id !== null)
                        vm.getData('site');
                    vm.LoadData();
                });
                vm.Single = null;
                vm.addForm = function(){
                    if(!vm.HeaderSingle.company_id){
                        return;
                    }

                    vm.FormDisplay = true;

                    EmptyObject.company_id = parseInt(vm.HeaderSingle.company_id);
                    vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                };
                vm.save = function(data){
                    $rootScope.Start();
                    if(!data.$valid){
                        return;
                    }
                    if(vm.Single.actiontype !== null && vm.Single.actiontype === "New"){
                        vm.baseData.post(vm.Single).then(function(){
                            vm.LoadData();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    }else{
                        vm.Single.save().then(function(){
                            vm.LoadData();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    }
                };
                vm.cancel = function(){
                    vm.FormDisplay = false;
                };
                vm.editForm = function(data){
                    $rootScope.Start();

                    Restangular.one(routeName, data.id).get().then(function(dat){
                        vm.Single = dat;
                        vm.FormDisplay = true;
                        $rootScope.Loaded();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                vm.delete = function(data){
                    if(window.confirm("Are you sure?")){
                        $rootScope.Start();
                        Restangular.one(routeName, data.id).get().then(function(dat){
                            dat.remove().then(function(){
                                vm.LoadData();
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        });
                    }
                    vm.FormDisplay = false;
                };

                vm.changeCompanyID = function(){
                    $navigation.Company(vm.HeaderSingle.company_id);
                    vm.LoadData();
                };

                vm.form = [
                    "code",
                    "name",
                    {
                        "type": "section",
                        "htmlClass": "row",
                        "items": [
                            {type: 'submit', icon: 'glyphicon glyphicon-save', "htmlClass": "col-xs-6", style: 'btn-black', title: 'Save'},
                            {type: 'button', icon: 'glyphicon glyphicon-icon-exclamation-sign', "htmlClass": "col-xs-6", style: 'btn-danger pull-right', title: 'Cancel', onClick: function(){
                                    vm.cancel();
                                }}
                        ]
                    }
                ];
            };
        });
