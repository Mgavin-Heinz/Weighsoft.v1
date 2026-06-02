'use strict';

if(window){
    Object.assign(env, window.__env);
}

angular
        .module('xenon.controllers')
        .controller('MainCtrl', function($scope, $rootScope, $layout, $layoutToggles, $pageLoadingBar, Fullscreen, $state, $interval, Restangular){
            $rootScope.isLoginPage = false;
            $rootScope.isLightLoginPage = false;
            $rootScope.isLockScreenPage = false;
            $rootScope.isMainPage = true;
            $rootScope.clock = "loading clock..."; // initialise the time variable
            $rootScope.phpClock = "loading clock..."; // initialise the time variable
            $rootScope.tickInterval = 1000; //ms
            $rootScope.phpTickInterval = 60000; //ms
            $state.user_info = MyLocalStorage.getItem('user_info');
            $state.SystemLogout = function(){
                $rootScope.isLoginPage = false;
                $rootScope.isLightLoginPage = false;
                $rootScope.authenticated = false;
                $state.user_info = null;
                MyLocalStorage.clear();
                $rootScope.isLockScreenPage = true;
                $rootScope.isMainPage = false;
                $state.go('login', {});
            };
            if($state.user_info){
                $rootScope.user_info = $state.user_info;
            }
            $rootScope.tick = function(){
                $rootScope.clock = Date.now();
            };
            $rootScope.phpTick = function(){
                Restangular.all('timeAndDate').post(Date.now()).then(function(phpTime){
                    $rootScope.phpClock = phpTime;
                }, function(response){
                    console.log(response);
                });
            };
            $rootScope.refreshToken = function(){
                Restangular.one('refresh').get().then(function(token){
                    $rootScope.authenticated = true;
                    $rootScope.token = token.token;
                    Restangular.setDefaultRequestParams({token: token.token});
                    $state.user_info.token = token.token;
                    MyLocalStorage.setItem('user_info', $state.user_info);
                }, function(response){
                    //
                });
            };
            // Start the timer
            $interval($rootScope.tick, $rootScope.tickInterval);
            $interval($rootScope.phpTick, $rootScope.phpTickInterval);
            $rootScope.layoutOptions = {
                logo: __env.logo,
                horizontalMenu: {
                    isVisible: false,
                    isFixed: true,
                    minimal: false,
                    clickToExpand: false,
                    isMenuOpenMobile: false
                },
                sidebar: {
                    isVisible: true,
                    showLogoArea: true,
                    isCollapsed: false,
                    toggleOthers: true,
                    isFixed: true,
                    isRight: false,
                    isMenuOpenMobile: false,
                    userProfile: true
                },
                chat: {
                    isOpen: false,
                },
                settingsPane: {
                    isOpen: false,
                    useAnimation: true
                },
                container: {
                    isBoxed: false
                },
                skins: {
                    sidebarMenu: 'concrete',
                    horizontalMenu: 'concrete',
                    userInfoNavbar: ''
                },
                pageTitles: true,
                userInfoNavVisible: true,
                Toaster: "No"
            };
            $layout.saveCookies();
            $layout.loadOptionsFromCookies(); // remove this line if you don't want to support cookies that remember layout changes

            $scope.updatePsScrollbars = function(){
                var $scrollbars = jQuery(".ps-scrollbar:visible");
                $scrollbars.each(function(i, el){
                    if(typeof jQuery(el).data('perfectScrollbar') == 'undefined'){
                        jQuery(el).perfectScrollbar();
                    }else{
                        jQuery(el).perfectScrollbar('update');
                    }
                })
            };
            // Define Public Vars
            public_vars.$body = jQuery("body");
            // Init Layout Toggles
            $layoutToggles.initToggles();
            // Other methods
            $scope.setFocusOnSearchField = function(){
                public_vars.$body.find('.search-form input[name="s"]').focus();
                setTimeout(function(){
                    public_vars.$body.find('.search-form input[name="s"]').focus()
                }, 100);
            };
            // Watch changes to replace checkboxes
            $scope.$watch(function(){
                cbr_replace();
            });
            // Watch sidebar status to remove the psScrollbar
            $rootScope.$watch('layoutOptions.sidebar.isCollapsed', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                if(newValue == true){
                    public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('destroy')
                }else{
                    public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar({wheelPropagation: public_vars.wheelPropagation});
                }
            });
            // Page Loading Progress (remove/comment this line to disable it)
            $pageLoadingBar.init();
            $scope.showLoadingBar = showLoadingBar;
            $scope.hideLoadingBar = hideLoadingBar;
            // Set Scroll to 0 When page is changed
            $rootScope.$on('$stateChangeStart', function(event, toState){
                var obj = {
                    pos: jQuery(window).scrollTop()
                };
                TweenLite.to(obj, .25, {
                    pos: 0,
                    ease: Power4.easeOut,
                    onUpdate: function(){
                        $(window).scrollTop(obj.pos);
                    }
                });
            });

            $scope.reloadSite = function(){
                window.location.reload(true);
            }
            
            $scope.openEsp32Control = function(){
                $rootScope.$broadcast('esp32:openControlPanel', $rootScope.Params.workstation_id);
            }
            // Full screen feature added in v1.3 removed
            // $scope.helpme = function(){
            //     var getUrl = window.location;
            //     var baseUrl = getUrl.protocol + "//" + getUrl.host + "/weighsoft/TeamViewerQS.exe";
            //     var win = window.open(baseUrl, '_blank');
            // }
            // // Full screen feature added in v1.3
            // $scope.download = function(){
            //     var getUrl = window.location;
            //     var baseUrl = getUrl.protocol + "//" + getUrl.host + "/weighsoft/EMSOScannerSetup.exe";
            //     var win = window.open(baseUrl, '_blank');
            // }
            // Full screen feature added in v1.3
            $scope.isFullscreenSupported = Fullscreen.isSupported();
            $scope.isFullscreen = Fullscreen.isEnabled() ? true : false;
            $scope.goFullscreen = function(){
                if(Fullscreen.isEnabled()){
                    Fullscreen.cancel();
                }else{
                    Fullscreen.all();
                }
                $scope.isFullscreen = Fullscreen.isEnabled() ? true : false;
            }
            if($state.user_info === null){
                $state.SystemLogout();
            }
        });
