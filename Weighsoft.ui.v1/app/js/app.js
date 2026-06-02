    'use strict';

    $('body').prepend($('<div>hello</div>').css({
        clip: 'rect(1px, 1px, 1px, 1px)',
        'font-family': 'Lato',
        position: 'absolute',
    }));

    var MyLocalStorage = {
        getItem: function(key){
            return JSON.parse(localStorage.getItem(key));
        },
        setItem: function(key, object){
            localStorage.setItem(key, JSON.stringify(object));
            return MyLocalStorage.getItem(key);
        },
        clear: function(){
            localStorage.clear();
        }
    };

    var app = angular.module('xenon-app', [
        'ngCookies',
        'ui.router',
        'ui.bootstrap',
        'oc.lazyLoad',
        'xenon.controllers',
        'xenon.directives',
        'xenon.factory',
        'xenon.services',
        'FBAngular',
        'satellizer',
        'restangular',
        'datatables',
        'datatables.bootstrap',
        'datatables.buttons',
        'schemaForm',
        'ngWebSocket',
        'textAngular',
        'ui.select',
        'daterangepicker',
        'angular-cron-jobs',
        'angularFileUpload'
    ]);

    app.run(function(){
        public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');
        jQuery(window).load(function(){
            public_vars.$pageLoadingOverlay.addClass('loaded');
        });
    });

    app.run(function($rootScope, $state, Restangular, $location){
        $state.user_info = MyLocalStorage.getItem('user_info');
        if($state.user_info){
            $rootScope.authenticated = true;
            $rootScope.token = $state.user_info.token;
            Restangular.setDefaultRequestParams({token: $state.user_info.token});
        }

        function logout(){
            MyLocalStorage.clear('user_info');
            $state.user_info = MyLocalStorage.getItem('user_info');
            $state.transitionTo('login');
        }

        Restangular.setErrorInterceptor(function(response){
            if(response.status === 401){
                logout();
                return false;
            }else if(response.status === 400){
                if(response.data && response.data.error === 'token_invalid'){
                    logout();
                    return false;
                }
            }
            return true;
        });

        $rootScope.Start = function(Flow){
            toastr.options = {
                "positionClass": "toast-bottom-left hidden-print",
                "toastClass": "drop-shaddow",
            }
            public_vars.$pageLoadingOverlay.removeClass('loaded');
            if($rootScope.layoutOptions.Toaster === "Yes")
                toastr.info('Loading Data - ' + Flow, 'Info');
        };

        $rootScope.Loaded = function(Flow){
            if($rootScope.layoutOptions.Toaster === "Yes")
                toastr.success('Data Loaded - ' + Flow, 'Info');
            public_vars.$pageLoadingOverlay.addClass('loaded');
        };

        $rootScope.Message = function(response, type){
            if($rootScope.layoutOptions.Toaster === "Yes")
                switch(type){
                    case "Info":
                        toastr.info(response, 'Success');
                        break;
                    case "Success":
                        toastr.success(response, 'Success');
                        break;
                    default:
                        toastr.info(response, 'Success');
                        break;
                }
        };

        $rootScope.Error = function(response){
            public_vars.$pageLoadingOverlay.addClass('loaded');
            var data = response && response.data;
            var message = typeof data === "string" ? data : undefined;
            if(message === undefined && data && typeof data === "object"){
                message = data.error || data.message || data.errors;
            }
            if(message === undefined && data && data.message && typeof data.message === "object"){
                var msg = data.message;
                message = (msg.data && msg.data.message) || msg.data || msg.message;
            }
            if(message === undefined){
                message = (data && typeof data === "object") ? (data.error || data.message || JSON.stringify(data)) : (response || "Request failed");
            }
            if(typeof message === "object"){
                message = message.message || message.error || JSON.stringify(message);
            }
            message = message != null ? String(message) : "Request failed";
            if($rootScope.layoutOptions.Toaster === "Yes"){
                toastr.error(message, 'Failed');
            }
            if(message.indexOf("Token") > -1 || message.indexOf("token") > -1){
                $state.SystemLogout();
            }
        };

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            var normalRoutes = ['login'];
            var restrictedRoutes = [];
            var loginInfo = MyLocalStorage.getItem('user_info');
            if(!loginInfo && $.inArray(toState.name, normalRoutes) == -1){
                event.preventDefault();
                $state.transitionTo('login');
            }
            var segment_str = toState.url;
            var segment_array = segment_str.split('/');
            var last_segment = segment_array[segment_array.length - 1];
            var shortUrl = segment_str.substring(0, segment_str.lastIndexOf("/"));
            var res0 = shortUrl.substring(1);
            var res = res0.split('/')[0];
            if(loginInfo && last_segment == 'edit' && fromState.name == ''){
                event.preventDefault();
                $state.transitionTo('app.' + res);
            }

            if(loginInfo && last_segment == 'manage' && fromState.name == ''){
                event.preventDefault();
                $state.transitionTo('app.' + res);
            }

            if(loginInfo && last_segment == 'update' && fromState.name == ''){
                event.preventDefault();
                $state.transitionTo('app.' + res);
            }
        });
    });
