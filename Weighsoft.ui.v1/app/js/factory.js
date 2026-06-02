"use strict";

let idIndex = 0;

function makeId(int) {
    var text = "";
    var possible = "%&*";

    for (var i = 0; i < int; i++)
    {
        idIndex = (idIndex + 1) % 3;
        text += possible.charAt(idIndex);
    }

    return text;
}
angular
    .module("xenon.factory", [])
    .factory("$layoutToggles", function ($rootScope, $layout) {
        return {
            initToggles: function () {
                // Sidebar Toggle
                $rootScope.sidebarToggle = function () {
                    $layout.setOptions("sidebar.isCollapsed", !$rootScope.layoutOptions.sidebar.isCollapsed);
                };

                // Settings Pane
                $rootScope.settingsPaneToggle = function () {
                    var use_animation = $rootScope.layoutOptions.settingsPane.useAnimation && !isxs();

                    var scroll = {
                        top: jQuery(document).scrollTop(),
                        toTop: 0,
                    };

                    if (public_vars.$body.hasClass("settings-pane-open"))
                    {
                        scroll.toTop = scroll.top;
                    }

                    TweenMax.to(scroll, use_animation ? 0.1 : 0, {
                        top: scroll.toTop,
                        roundProps: ["top"],
                        ease: scroll.toTop < 10 ? null : Sine.easeOut,
                        onUpdate: function () {
                            jQuery(window).scrollTop(scroll.top);
                        },
                        onComplete: function () {
                            if (use_animation)
                            {
                                // With Animation
                                public_vars.$settingsPaneIn.addClass("with-animation");

                                // Opening
                                if (!public_vars.$settingsPane.is(":visible"))
                                {
                                    public_vars.$body.addClass("settings-pane-open");

                                    var height = public_vars.$settingsPane.outerHeight(true);

                                    public_vars.$settingsPane.css({
                                        height: 0,
                                    });

                                    TweenMax.to(public_vars.$settingsPane, 0.25, {
                                        css: {
                                            height: height,
                                        },
                                        ease: Circ.easeInOut,
                                        onComplete: function () {
                                            public_vars.$settingsPane.css({ height: "" });
                                        },
                                    });

                                    public_vars.$settingsPaneIn.addClass("visible");
                                } else
                                {
                                    // Closing
                                    public_vars.$settingsPaneIn.addClass("closing");

                                    TweenMax.to(public_vars.$settingsPane, 0.25, {
                                        css: {
                                            height: 0,
                                        },
                                        delay: 0.15,
                                        ease: Power1.easeInOut,
                                        onComplete: function () {
                                            public_vars.$body.removeClass("settings-pane-open");
                                            public_vars.$settingsPane.css({ height: "" });
                                            public_vars.$settingsPaneIn.removeClass("closing visible");
                                        },
                                    });
                                }
                            } else
                            {
                                // Without Animation
                                public_vars.$body.toggleClass("settings-pane-open");
                                public_vars.$settingsPaneIn.removeClass("visible");
                                public_vars.$settingsPaneIn.removeClass("with-animation");

                                $layout.setOptions("settingsPane.isOpen", !$rootScope.layoutOptions.settingsPane.isOpen);
                            }
                        },
                    });
                };

                // Chat Toggle
                $rootScope.chatToggle = function () {
                    $layout.setOptions("chat.isOpen", !$rootScope.layoutOptions.chat.isOpen);
                };

                // Mobile Menu Toggle
                $rootScope.mobileMenuToggle = function () {
                    $layout.setOptions("sidebar.isMenuOpenMobile", !$rootScope.layoutOptions.sidebar.isMenuOpenMobile);
                    $layout.setOptions("horizontalMenu.isMenuOpenMobile", !$rootScope.layoutOptions.horizontalMenu.isMenuOpenMobile);
                };

                // Mobile User Info Navbar Toggle
                $rootScope.mobileUserInfoToggle = function () {
                    $layout.setOptions("userInfoNavVisible", !$rootScope.layoutOptions.userInfoNavVisible);
                };
            },
        };
    })
    .factory("$pageLoadingBar", function ($rootScope, $window) {
        return {
            init: function () {
                var pl = this;

                $window.showLoadingBar = this.showLoadingBar;
                $window.hideLoadingBar = this.hideLoadingBar;

                $rootScope.$on("$stateChangeStart", function () {
                    pl.showLoadingBar({
                        pct: 95,
                        delay: 1.1,
                        resetOnEnd: false,
                    });
                    jQuery("body .page-container .main-content").addClass("is-loading");
                });

                $rootScope.$on("$stateChangeSuccess", function () {
                    pl.showLoadingBar({
                        pct: 100,
                        delay: 0.65,
                        resetOnEnd: true,
                    });
                    jQuery("body .page-container .main-content").removeClass("is-loading");
                });
            },
            showLoadingBar: function (options) {
                var defaults = {
                    pct: 0,
                    delay: 1.3,
                    wait: 0,
                    before: function () { },
                    finish: function () { },
                    resetOnEnd: true,
                },
                    pl = this;

                if (typeof options == "object")
                {
                    defaults = jQuery.extend(defaults, options);
                } else if (typeof options == "number")
                {
                    defaults.pct = options;
                }

                if (defaults.pct > 100)
                {
                    defaults.pct = 100;
                } else if (defaults.pct < 0)
                {
                    defaults.pct = 0;
                }

                var $ = jQuery,
                    $loading_bar = $(".xenon-loading-bar");

                if ($loading_bar.length == 0)
                {
                    $loading_bar = $('<div class="xenon-loading-bar progress-is-hidden"><span data-pct="0"></span></div>');
                    public_vars.$body.append($loading_bar);
                }

                var $pct = $loading_bar.find("span"),
                    current_pct = $pct.data("pct"),
                    is_regress = current_pct > defaults.pct;

                defaults.before(current_pct);

                TweenMax.to($pct, defaults.delay, {
                    css: {
                        width: defaults.pct + "%",
                    },
                    delay: defaults.wait,
                    ease: is_regress ? Expo.easeOut : Expo.easeIn,
                    onStart: function () {
                        $loading_bar.removeClass("progress-is-hidden");
                    },
                    onComplete: function () {
                        var pct = $pct.data("pct");
                        if (pct == 100 && defaults.resetOnEnd)
                        {
                            hideLoadingBar();
                        }
                        defaults.finish(pct);
                    },
                    onUpdate: function () {
                        $pct.data("pct", parseInt($pct.get(0).style.width, 10));
                    },
                });
            },
            hideLoadingBar: function () {
                var $ = jQuery,
                    $loading_bar = $(".xenon-loading-bar"),
                    $pct = $loading_bar.find("span");

                $loading_bar.addClass("progress-is-hidden");
                $pct.width(0).data("pct", 0);
            },
        };
    })
    .factory("$layout", function ($rootScope, $cookies, $cookieStore) {
        return {
            propsToCache: [
                "horizontalMenu.isVisible",
                "horizontalMenu.isFixed",
                "horizontalMenu.minimal",
                "horizontalMenu.clickToExpand",
                "sidebar.isVisible",
                "sidebar.isCollapsed",
                "sidebar.toggleOthers",
                "sidebar.isFixed",
                "sidebar.isRight",
                "sidebar.userProfile",
                "chat.isOpen",
                "container.isBoxed",
                "skins.sidebarMenu",
                "skins.horizontalMenu",
                "skins.userInfoNavbar",
            ],
            setOptions: function (options, the_value) {
                if (typeof options == "string" && typeof the_value != "undefined")
                {
                    options = this.pathToObject(options, the_value);
                }
                jQuery.extend(true, $rootScope.layoutOptions, options);
                this.saveCookies();
            },
            saveCookies: function () {
                var cookie_entries = this.iterateObject($rootScope.layoutOptions, "", {});
                angular.forEach(cookie_entries, function (value, prop) {
                    $cookies[prop] = value;
                });
            },
            resetCookies: function () {
                var cookie_entries = this.iterateObject($rootScope.layoutOptions, "", {});
                angular.forEach(cookie_entries, function (value, prop) {
                    $cookieStore.remove(prop);
                });
            },
            loadOptionsFromCookies: function () {
                var dis = this,
                    cookie_entries = dis.iterateObject($rootScope.layoutOptions, "", {}),
                    loaded_props = {};

                angular.forEach(cookie_entries, function (value, prop) {
                    var cookie_val = $cookies[prop];
                    if (typeof cookie_val != "undefined")
                    {
                        jQuery.extend(true, loaded_props, dis.pathToObject(prop, cookie_val));
                    }
                });
                jQuery.extend($rootScope.layoutOptions, loaded_props);
            },
            is: function (prop, value) {
                return this.get(prop) == value;
            },
            get: function (prop) {
                var cookieval = $cookies[prop];
                if (cookieval && cookieval.match(/^true|false|[0-9.]+$/))
                {
                    cookieval = eval(cookieval);
                }
                if (!cookieval)
                {
                    cookieval = this.getFromPath(prop, $rootScope.layoutOptions);
                }
                return cookieval;
            },
            getFromPath: function (path, lo) {
                var val = "",
                    current_path,
                    paths = path.split(".");

                angular.forEach(paths, function (path_id, i) {
                    var is_last = paths.length - 1 == i;

                    if (!current_path)
                    {
                        current_path = lo[path_id];
                    } else
                    {
                        current_path = current_path[path_id];
                    }

                    if (is_last)
                    {
                        val = current_path;
                    }
                });
                return val;
            },
            pathToObject: function (obj_path, the_value) {
                var new_obj = {},
                    curr_obj = null,
                    last_key;

                if (obj_path)
                {
                    var paths = obj_path.split("."),
                        depth = paths.length - 1,
                        array_scls = "";

                    angular.forEach(paths, function (path_id, i) {
                        var is_last = paths.length - 1 == i;

                        array_scls += "['" + path_id + "']";

                        if (is_last)
                        {
                            if (typeof the_value == "string" && !the_value.toString().match(/^true|false|[0-9.]+$/))
                            {
                                the_value = '"' + the_value + '"';
                            }
                            eval("new_obj" + array_scls + " = " + the_value + ";");
                        } else
                        {
                            eval("new_obj" + array_scls + " = {};");
                        }
                    });
                }

                return new_obj;
            },
            iterateObject: function (objects, append, arr) {
                var dis = this;

                angular.forEach(objects, function (obj, key) {
                    if (typeof obj == "object")
                    {
                        return dis.iterateObject(obj, append + key + ".", arr);
                    } else if (typeof obj != "undefined")
                    {
                        arr[append + key] = obj;
                    }
                });

                // Filter Caching Objects
                angular.forEach(arr, function (value, prop) {
                    if (!inArray(prop, dis.propsToCache))
                    {
                        delete arr[prop];
                    }
                });

                function inArray(needle, haystack) {
                    var length = haystack.length;
                    for (var i = 0; i < length; i++)
                    {
                        if (haystack[i] == needle)
                        {
                            return true;
                        }
                    }
                    return false;
                }
                return arr;
            },
        };
    })
    .factory("$localvars", function ($rootScope) {
        return {
            set: function (data) {
                $rootScope.localvars = data;
            },
            get: function () {
                return $rootScope.localvars;
            },
        };
    })
    .factory("$navigation", function ($rootScope) {
        function set(data) {
            $rootScope.Params = data;
            localStorage.setItem("location", JSON.stringify($rootScope.Params));
        }
        function get() {
            //FIX this
            //$rootScope.Params.fingerprint = "";
            return $rootScope.Params;
        }

        function clear(force) {
            force = typeof force !== "undefined" ? force : false;
            var persist =
                localStorage.getItem("location") === null || localStorage.getItem("location") === "undefined" || localStorage.getItem("location") === undefined
                    ? null
                    : JSON.parse(localStorage.getItem("location"));

            if (force)
            {
                $rootScope.Params = { company_id: null, site_id: null, workstation_id: null, weighbridge_id: null };
                localStorage.setItem("location", JSON.stringify($rootScope.Param));
            } else if (persist === null)
            {
                $rootScope.Params =
                    typeof $rootScope.Params !== "undefined"
                        ? $rootScope.Params
                        : {
                            company_id: null,
                            site_id: null,
                            workstation_id: null,
                            weighbridge_id: null,
                        };
            } else
            {
                $rootScope.Params = persist;
            }
        }

        function company(data) {
            $rootScope.Params.company_id = data;
            localStorage.setItem("location", JSON.stringify($rootScope.Params));
        }

        function site(data) {
            $rootScope.Params.site_id = data;
            localStorage.setItem("location", JSON.stringify($rootScope.Params));
        }

        function workstation(data) {
            $rootScope.Params.workstation_id = data;
            localStorage.setItem("location", JSON.stringify($rootScope.Params));
        }

        function weighbridge(data) {
            $rootScope.Params.weighbridge_id = data;
            localStorage.setItem("location", JSON.stringify($rootScope.Params));
        }

        return {
            set: set,
            get: get,
            clear: clear,
            Company: company,
            Site: site,
            Workstation: workstation,
            Weighbridge: weighbridge,
        };
    })
    //Can be Deleted if not used
    .factory("$EMSOservice", [
        "$q",
        "$rootScope",
        "$interval",
        function ($q, $rootScope, $interval) {
            var Service = {};
            function buildScaleSocketUrl(path) {
                var wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
                return wsProtocol + path + ":3000/ws/emso";
            }
            Service.ws = null;
            Service.Core = null;
            Service.ScaleIP = "127.0.0.1";
            Service.DisplayIP = "127.0.0.1";
            Service.FingerIP = "127.0.0.1";
            Service.data = {
                type: null,
                status: null,
                fingerprint: ["", "", ""],
            };
            Service.SendMessage = function (message) {
                console.log("SEND:" + message);
                try
                {
                    Service.ws.send(message);
                } catch (error)
                {
                    console.error(error);
                }
            };
            Service.Reader = null;
            Service.ReaderStatus = null;
            Service.Run = function (txtobject) {
                Service.data.obj = txtobject;
                if (Service.ws != null)
                {
                    Service.SendMessage("M005");
                }
                //Service.CreateService(Service.FingerIP, "P001:");
                Service.CreateService(Service.FingerIP, "A001:");
                $rootScope.ScaleCommand = "A001:";

                $rootScope.F0 = "gear";
                $rootScope.F1 = "gear";
                $rootScope.F2 = "gear";
                return this;
            };
            Service.WighingSetup = function (ip) {
                Service.ScaleIP = ip;
                Service.CreateService(ip, "A003:");
                Service.CreateDisplayService(ip, "R003:");
                $rootScope.ScaleCommand = "A003:";
                return this;
            };
            Service.WighingStop = function (txtobject) {
                Service.dispose();
                Service.CreateService(Service.ScaleIP, "A005:");
                return this;
            };
            Service.WighingRun = function (txtobject, ip, displayip, port, displayport, baudrate, displaybaudrate, parity, displayparity, stopbit, displaystopbit, databit, displaydatabit) {
                Service.ScaleIP = ip;
                Service.DisplayIP = displayip;
                $rootScope.S001 = 0;
                $rootScope.S002 = 0;
                Service.data.obj = txtobject;
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "CreateService \n";
                //Service.CreateService(ip, "P001:");
                //$rootScope.ScaleCommand = "A004:{" + port + "," + baudrate + "," + parity + "," + stopbit + "," + databit + "}";
                Service.CreateService(Service.ScaleIP, "A004:" + port + "," + baudrate + "," + parity + "," + stopbit + "," + databit);
                Service.CreateDisplayService(Service.DisplayIP, "R004:" + displayport + "," + displaybaudrate + "," + displayparity + "," + displaystopbit + "," + displaydatabit);
                //Service.CreateService(ip, "A004:{" + port + "," + baudrate + "," + parity + "," + stopbit + "," + databit + "}");
                if (Service.ws.readyState == Service.ws.OPEN)
                {
                    $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.ws.OPEN \n";
                }
                $rootScope.WeighFeedback3 = [];
                return this;
            };
            Service.dispose = function (txtobject) {
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service Dispose \n";
                if (Service.ws != null)
                {
                    Service.SendMessage("A005:" + txtobject);
                    Service.SendMessage("M005:");
                    $rootScope.WeighFeedback = $rootScope.WeighFeedback + "M005,A005 \n";
                    Service.ws.onclose = function () { };
                    Service.ws.close();
                }
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Closed \n";
                Service.data.status = "Closed";
            };
            Service.StartRegistration = function () {
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "M001 \n";
                Service.SendMessage("M001:");
                Service.data.type = "StratedRegistration";
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "StratedRegistration \n";
                Service.data.message = "true";
            };
            Service.EndScanner = function () {
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "A002 \n";
                Service.SendMessage("A002:");
                Service.data.type = "EndScenner";
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "EndScenner \n";
                Service.data.message = "true";
            };
            Service.DoVerification = function (obj) {
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "M007 \n";
                Service.SendMessage("M007:");
                Service.data.type = "DoVerificationRegistration";
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "DoVerificationRegistration \n";
                Service.data.message = "true";
            };
            Service.StartVerification = function (obj) {
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "M006 \n";
                Service.SendMessage("M006:" + JSON.stringify(obj));
                Service.data.type = "VerificationRegistration";
                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "VerificationRegistration \n";
                Service.data.message = "true";
            };
            $rootScope.F0 = "exclamation";
            $rootScope.F1 = "exclamation";
            $rootScope.F2 = "exclamation";
            Service.DetermineResult = function (message) {
                console.log('MESSAGE',message);
                if (message !== "")
                {
                    if ($rootScope.WeighFeedback3 !== undefined)
                    {
                        $rootScope.WeighFeedback3.unshift(message);
                        if ($rootScope.WeighFeedback3.length > 10)
                        {
                            $rootScope.WeighFeedback3.pop();
                        }
                        $rootScope.WeighFeedback2 = $rootScope.WeighFeedback3.join("\n");
                    }
                    if (message.substring(0, 4) != "S002" && message.substring(0, 4) != "S001" && message.substring(0, 4) != "I006" && message.substring(0, 4) != "I004")
                    {
                        $rootScope.WeighFeedback = $rootScope.WeighFeedback + "DetermineResult " + message + "\n";
                    } else
                    {
                        if (message.substring(0, 4) == "S002")
                        {
                            var find = "S002 " + $rootScope.S002;
                            var n = $rootScope.WeighFeedback.indexOf(find);
                            $rootScope.S002 = $rootScope.S002 + 1;
                            if (n > 0)
                            {
                                $rootScope.WeighFeedback = $rootScope.WeighFeedback.replace(find, "S002 " + $rootScope.S002);
                            } else
                            {
                                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "S002 " + $rootScope.S002 + "\n";
                            }
                        } else
                        {
                            var find = "S001 " + $rootScope.S001;
                            var n = $rootScope.WeighFeedback.indexOf(find);
                            $rootScope.S001 = $rootScope.S001 + 1;
                            if (n > 0)
                            {
                                $rootScope.WeighFeedback = $rootScope.WeighFeedback.replace(find, "S001 " + $rootScope.S001);
                            } else
                            {
                                $rootScope.WeighFeedback = $rootScope.WeighFeedback + "S001 " + $rootScope.S001 + "\n";
                            }
                        }
                    }
                    Service.data.message = message.substring(0, 4);
                    switch (message.substring(0, 4))
                    {
                        case "P002":
                            //Service.SendMessage($rootScope.ScaleCommand);
                            break;
                        case "P004":
                            Service.data.type = "Error";
                            Service.data.message = "Scanner Not Connected";
                            break;
                        case "E001":
                            Service.data.type = "Error";
                            Service.data.message = "Scanner Not Connected";
                            break;
                        case "E002":
                            Service.data.type = "Error";
                            Service.data.message = "Scanner Not Connected";
                            break;
                        case "S002":
                            var result = "";
                            if (message.length > 4) result = message.substring(5);
                            Service.data.message = "Result : " + result;

                            if (
                                result.indexOf($rootScope.weight_sep.substring(0, 1)) == -1 &&
                                result.indexOf($rootScope.weight_sep.substring(1, 2)) == -1 &&
                                result.indexOf($rootScope.weight_sep.substring(2, 3)) == -1
                            )
                            {
                                $rootScope.WeightHolder = $rootScope.WeightHolder + result;
                            } else
                            {
                                $rootScope.Weight = $rootScope.WeightHolder;
                                $rootScope.WeightHolder = makeId(1) + result;
                                // console.log("Scalestring : " + $rootScope.Weight);
                            }

                            $rootScope.$digest();
                            break;
                        case "W001":
                            var result = "";
                            if (message.length > 6) result = message.substring(5).trim();
                            Service.data.message = "Result : " + result;
                            // $rootScope.AvailablePorts = result.substr(1,result.length-2).split(',');

                            $rootScope.AvailablePorts = JSON.parse(result);
                            //console.log($rootScope.AvailablePorts);
                            break;
                        case "R001":
                            var result = "";
                            if (message.length > 6) result = message.substring(5).trim();
                            Service.data.message = "Result : " + result;
                            if (result == "True")
                            {
                                Service.data.message = "Scanner is Connected";
                                Service.data.type = "Waiting";
                                if ($rootScope.FingerFeedback == "StartRegistration")
                                {
                                    Service.StartRegistration();
                                } else
                                {
                                    Service.StartVerification($rootScope.FingerFeedback);
                                }
                            }
                            if (result == "False")
                            {
                                Service.data.message = "Scanner Could not Connect";
                                Service.data.status = "Error";
                                Service.data.type = "Waiting";
                            }
                            break;
                        case "R002":
                            var result = "";
                            if (message.length > 6) result = message.substring(5);
                            if (result == "True")
                            {
                                Service.data.status = "Error";
                                Service.data.message = "Scanner is Dis-Connected";
                            }
                            if (result == "False")
                            {
                                Service.data.message = "Scanner is still Connected";
                            }
                            break;
                        case "R003":
                            var result = "";
                            if (message.length > 6) result = message.substring(5);
                            if (result.trim() == "True")
                            {
                                Service.data.type = "Reading";
                                Service.SendMessage("M002:");
                                Service.data.message = "Waiting For FingerPrints";
                            } else if (result.trim() == "False")
                            {
                                Service.data.status = "Error";
                                Service.data.message = "Could Not Start Registration For FingerPrints";
                            }
                            break;
                        case "I001":
                            var result = "";
                            if (message.length > 6) result = message.substring(5);
                            var array = result.split(",");
                            Service.data.message = "Fingerprint Reported : " + array[0];
                            if (array[0] !== "1")
                            {
                                Service.data.type = "FingerPrintImage";
                                Service.data.Index = parseInt(array[0]);
                                Service.data.Image = array[1];
                                Service.SendMessage("M002:");
                                Service.data.message = "Waiting For FingerPrints";
                            } else
                            {
                                Service.data.type = "FingerPrintImage";
                                Service.data.Index = parseInt(array[0]);
                                Service.data.Image = array[1];
                                Service.SendMessage("M003:");
                                Service.data.message = "Waiting For Template";
                            }
                            eval("$rootScope.F" + array[0] + " = 'check';");
                            $rootScope.fingerimg = "data:image/pgm;base64," + Service.data.Image;
                            Service.data.fingerprint[Service.data.Index] = Service.data.Image;
                            break;
                        case "I002":
                            var result = "";
                            if (message.length > 6) result = message.substring(5);
                            Service.data.message = "Fingerprint Template : " + result;
                            Service.data.type = "FingerPrintTemplate";
                            $rootScope.Template = result;
                            //RegistrationCompleted
                            Service.SendMessage("M004:");
                            Service.data.type = "RegistrationCompleted";
                            Service.EndScanner();
                            break;
                        case "I005":
                            var result = "";
                            if (message.length > 6) result = message.substring(5);
                            Service.data.message = "Fingerprint Template : " + result;
                            Service.data.type = "FingerPrintTemplate";
                            $rootScope.FingerFeedback = "Scanner_FingerPrintMisMatch";
                            swal("Oops...", "Finger Print MisMatch.", "error");
                            $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Scanner_FingerPrintMisMatch \n";
                            Service.data.type = "Scanner_FingerPrintMisMatch";
                            $rootScope.Error("Fingerprint Mismatch");
                            //Service.EndScanner();
                            break;
                        case "I004":
                            var result = "";
                            if (message.length > 6) result = message.substring(5);
                            Service.data.message = "Fingerprint Template : " + result;
                            Service.data.type = "FingerPrintTemplate";
                            $rootScope.FingerFeedback = result;
                            $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Scanner_FingerPrintMatch\n";
                            Service.SendMessage("M004:");
                            Service.data.type = "Scanner_FingerPrintMatch";
                            $rootScope.Message("Fingerprint Match");
                            Service.EndScanner();
                            break;
                    }
                }
                var newline = String.fromCharCode(13, 10);
                $rootScope.FingerServ += Service.data.type + newline;
            };

            Service.CreateService = function (path, command) {
                Service.data.type = "CreateService";
                try
                {
                    if (Service.data.status !== "Open")
                    {
                        $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.data.status !== 'Open' \n";
                        //FIX : Switch back to 3000
                        Service.ws = new WebSocket(buildScaleSocketUrl(path));
                        Service.ws.onopen = function () {
                            Service.data.status = "Open";
                            Service.SendMessage(command);
                        };
                        Service.ws.onclose = function (event) {
                            Service.data.status = "Closed";
                            Service.data.reason = "";
                            if (event.code == 1000) Service.data.reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                            else if (event.code == 1001) Service.data.reason = 'An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
                            else if (event.code == 1002) Service.data.reason = "An endpoint is terminating the connection due to a protocol error";
                            else if (event.code == 1003)
                                Service.data.reason =
                                    "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                            else if (event.code == 1004) Service.data.reason = "Reserved. The specific meaning might be defined in the future.";
                            else if (event.code == 1005) Service.data.reason = "No status code was actually present.";
                            else if (event.code == 1006) Service.data.reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                            else if (event.code == 1007)
                                Service.data.reason =
                                    "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                            else if (event.code == 1008)
                                Service.data.reason =
                                    'An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
                            else if (event.code == 1009) Service.data.reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                            else if (event.code == 1010)
                                // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                                Service.data.reason =
                                    "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " +
                                    event.reason;
                            else if (event.code == 1011)
                                Service.data.reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                            else if (event.code == 1015)
                                Service.data.reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                            else Service.data.reason = "Unknown reason";
                        };
                        Service.ws.onerror = function (event) {
                            Service.data.status = "Error";
                            Service.data.reason = event;
                        };
                        // On WebSocket message, process the incoming weight data
                        Service.ws.onmessage = function (message) {
                            console.log("RECEIVE: " + message.data);
                            
                            // Parse and update weight data
                            const receivedData = message.data.trim(); // Trim unnecessary whitespaces
                            $rootScope.weighbridgeWeight = parseFloat(receivedData);
                            $rootScope.weighbridgeData = receivedData;

                            // Call DetermineResult to process the weight further
                            Service.DetermineResult(receivedData);
                        };
                    } else
                    {
                        $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.ws.send " + command + "\n";
                        Service.SendMessage(command);
                    }
                } catch (err)
                {
                    $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.ws.send Error " + err.message + "\n";
                    Service.data.status = "Error";
                    Service.data.reason = err.message;
                }
            };
            Service.CreateDisplayService = function (path, command) {
                Service.data.type = "CreateDisplayService";
                try
                {
                    if (Service.data.status !== "Open")
                    {
                        $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.data.status !== 'Open' \n";
                        //FIX : Switch back to 3000
                        Service.ws = new WebSocket(buildScaleSocketUrl(path));
                        Service.ws.onopen = function () {
                            Service.data.status = "Open";
                            Service.SendMessage(command);
                        };
                        Service.ws.onclose = function (event) {
                            Service.data.status = "Closed";
                            Service.data.reason = "";
                            if (event.code == 1000) Service.data.reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                            else if (event.code == 1001) Service.data.reason = 'An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
                            else if (event.code == 1002) Service.data.reason = "An endpoint is terminating the connection due to a protocol error";
                            else if (event.code == 1003)
                                Service.data.reason =
                                    "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                            else if (event.code == 1004) Service.data.reason = "Reserved. The specific meaning might be defined in the future.";
                            else if (event.code == 1005) Service.data.reason = "No status code was actually present.";
                            else if (event.code == 1006) Service.data.reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                            else if (event.code == 1007)
                                Service.data.reason =
                                    "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                            else if (event.code == 1008)
                                Service.data.reason =
                                    'An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
                            else if (event.code == 1009) Service.data.reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                            else if (event.code == 1010)
                                // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                                Service.data.reason =
                                    "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " +
                                    event.reason;
                            else if (event.code == 1011)
                                Service.data.reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                            else if (event.code == 1015)
                                Service.data.reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                            else Service.data.reason = "Unknown reason";
                        };
                        Service.ws.onerror = function (event) {
                            Service.data.status = "Error";
                            Service.data.reason = event;
                        };
                        // On WebSocket message, process the incoming weight data
                        Service.ws.onmessage = function (message) {
                            console.log("RECEIVE: " + message.data);
                        };
                    } else
                    {
                        $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.ws.send " + command + "\n";
                        Service.SendMessage(command);
                    }
                } catch (err)
                {
                    $rootScope.WeighFeedback = $rootScope.WeighFeedback + "Service.ws.send Error " + err.message + "\n";
                    Service.data.status = "Error";
                    Service.data.reason = err.message;
                }
            };
            return Service;
        },
    ])
    .factory("ScaleEndpointResolver", function ($rootScope) {
        function normalizeScaleEndpoint(endpoint) {
            if (!endpoint) {
                return "";
            }
            return endpoint.toString().trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
        }

        function getContextValue(context, key) {
            if (!context) {
                return null;
            }
            if (context[key] !== undefined && context[key] !== null && context[key] !== "") {
                return context[key];
            }
            var header = context.HeaderSingle || context.header;
            if (header && header[key] !== undefined && header[key] !== null && header[key] !== "") {
                return header[key];
            }
            return null;
        }

        function getWorkstationScaleEndpoint(context) {
            if (!$rootScope.MasterData || !$rootScope.Params) {
                return null;
            }

            var companyId = getContextValue(context, "company_id") || $rootScope.Params.company_id;
            var siteId = getContextValue(context, "site_id") || $rootScope.Params.site_id;
            var workstationId = getContextValue(context, "workstation_id") || $rootScope.Params.workstation_id;

            if (!companyId || !siteId || !workstationId) {
                return null;
            }

            var company = $rootScope.MasterData.find(function (item) {
                return item && item.id == companyId;
            });
            if (!company || !company.sites) {
                return null;
            }

            var site = company.sites.find(function (item) {
                return item && item.id == siteId;
            });
            if (!site || !site.workstations) {
                return null;
            }

            var workstation = site.workstations.find(function (item) {
                return item && item.id == workstationId;
            });
            if (!workstation || !workstation.scale_endpoint) {
                return null;
            }

            return workstation.scale_endpoint;
        }

        function getScaleBases(context) {
            var endpoint = normalizeScaleEndpoint(getWorkstationScaleEndpoint(context)) || normalizeScaleEndpoint(window.__env.scale);
            var wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
            return {
                endpoint: endpoint,
                httpBase: window.location.protocol + "//" + endpoint,
                wsBase: wsProtocol + endpoint
            };
        }

        return {
            normalizeScaleEndpoint: normalizeScaleEndpoint,
            getWorkstationScaleEndpoint: getWorkstationScaleEndpoint,
            getScaleBases: getScaleBases
        };
    })
    .factory("$nodeRed", function ($http, ScaleEndpointResolver) {
        var Service = {};
        Service.StopScale = function (record, context) {
            var bases = ScaleEndpointResolver.getScaleBases(context);
            return $http.post(bases.httpBase + '/scale', {
                record: record,
                enabled: false
            });
        };
        Service.StartScale = function (record, port, context) {
            var bases = ScaleEndpointResolver.getScaleBases(context);
            return $http.post(bases.httpBase + '/scale', {
                record: record,
                enabled: true,
                port: port
            });
        };
        Service.ResetWeighing = function (record, port, context) {
            Service.StopScale(record, context);
            Service.StartScale(record, port, context);
        };
        Service.GetData = function (context) {
            var bases = ScaleEndpointResolver.getScaleBases(context);
            return new WebSocket(bases.wsBase + "/ws/emso");
        };
        Service.GetScaleSocket = function (context) {
            return Service.GetData(context);
        };
        Service.GetSyncSocket = function (context) {
            var bases = ScaleEndpointResolver.getScaleBases(context);
            return new WebSocket(bases.wsBase + "/ws/syncin");
        };
        return Service;
    })
    //Can be Deleted if not used
    .factory("$weighservice", [
        "$q",
        "$rootScope",
        "$interval",
        function ($q, $rootScope, $interval) {
            // We return this object to anything injecting our service
            var Service = {};
            // Keep all pending requests here until they get responses
            var callbacks = {};
            // Create a unique callback ID to map requests to responses
            var currentCallbackId = 0;

            // Create our websocket object with the address to the websocket
            Service.ws = [];
            Service.status = [];
            Service.OpenStation = [];
            function sendRequest(request, station) {
                var defer = $q.defer();
                var callbackId = getCallbackId();
                callbacks[callbackId] = {
                    time: new Date(),
                    cb: defer,
                };
                request.callback_id = callbackId;
                if (Service.ws[station].readyState === 1)
                {
                    Service.ws[station].send(JSON.stringify(request));
                }
                return defer.promise;
            }
            function listener(data) {
                var messageObj = data;
                // If an object exists with callback_id in our callbacks object, resolve it
                if (callbacks.hasOwnProperty(messageObj.callback_id))
                {
                    $rootScope.$apply(callbacks[messageObj.callback_id].cb.resolve(messageObj));
                    delete callbacks[messageObj.callbackID];
                }
            }
            // This creates a new callback ID for a request
            function getCallbackId() {
                currentCallbackId += 1;
                if (currentCallbackId > 10000)
                {
                    currentCallbackId = 0;
                }
                return currentCallbackId;
            }
            // Define a "getter" for getting customer data
            Service.GetInfo = function (ReqStatus, ReqComm, station) {
                var PortData = {
                    Type: "Weighing",
                    Status: ReqStatus,
                    Errors: "",
                    Message: ReqComm.port_num + "," + ReqComm.baud_rate + "," + ReqComm.parity + "," + ReqComm.stop_bits + "," + ReqComm.data_bits,
                };
                // Storing in a variable for clarity on what sendRequest returns
                return sendRequest(PortData, station);
            };
            Service.Data = [];
            Service.stationState = function (weight) {
                if (Service.isNumeric(weight))
                {
                    return "danger";
                }
                if (weight === "Open Port" || weight === "Closed")
                {
                    return "primary";
                }
                return "gray";
            };
            Service.isNumeric = function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            };
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                Service.killAll();
            });

            Service.Run = function (station, WBdata, Object) {
                Service.Data[station] = $interval(function () {
                    var RegEx = new RegExp(WBdata.weight_reg);
                    if ((Service.status[station] === null || Service.status[station] === undefined) && Service.OpenStation.indexOf(station) === -1)
                    {
                        Service.OpenStation.push(station);
                        Service.CreateService(WBdata.header, station);
                    } else if (Service.status[station] === "Open")
                    {
                        Service.GetInfo("OpenPort", WBdata, station).then(function (data) {
                            Service.status[station] = "Connected";
                            Object.weight = data.Message;
                        });
                    } else if (Service.status[station] === "Connected")
                    {
                        Service.GetInfo("ReadPort", WBdata, station).then(function (data) {
                            var temp = null;
                            if (data.Message.match(RegEx) !== null && data.Message.match(RegEx) !== undefined)
                            {
                                temp = data.Message.match(RegEx)[0];
                            }
                            if (temp === null)
                            {
                                Object.weight = data.Message;
                            } else
                            {
                                var pow = parseInt(WBdata.decimal_places) || 0;
                                Object.weight = parseInt(temp) / Math.pow(10, pow);
                            }
                        });
                    } else
                    {
                        Object.weight = Service.status[station];
                    }
                    Object.type = Service.stationState(Object.weight);
                }, 500);
            };
            Service.killAll = function () {
                Service.OpenStation.forEach(function (station) {
                    Service.kill(station);
                });
            };
            Service.kill = function (station) {
                Service.ws[station].close;
                $interval.cancel(Service.Data[station]);
                Service.Data[station] = undefined;
                Service.status[station] = null;
                if (Service.OpenStation.indexOf(station) !== -1)
                {
                    Service.OpenStation.splice(Service.OpenStation.indexOf(station), 1);
                }
            };
            Service.dispose = function (station) {
                Service.ws[station].close;
                Service.status[station] = "Closed";
                Service.kill(station);
            };
            Service.CreateService = function (path, station) {
                try
                {
                    Service.ws[station] = new WebSocket("ws://" + path + "/");
                    Service.ws[station].onopen = function () {
                        Service.status[station] = "Open";
                    };

                    Service.ws[station].onclose = function (event) {
                        var reason;
                        if (event.code == 1000) reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                        else if (event.code == 1001) reason = 'An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
                        else if (event.code == 1002) reason = "An endpoint is terminating the connection due to a protocol error";
                        else if (event.code == 1003)
                            reason =
                                "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                        else if (event.code == 1004) reason = "Reserved. The specific meaning might be defined in the future.";
                        else if (event.code == 1005) reason = "No status code was actually present.";
                        else if (event.code == 1006) reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                        else if (event.code == 1007)
                            reason =
                                "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                        else if (event.code == 1008)
                            reason =
                                'An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
                        else if (event.code == 1009) reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                        else if (event.code == 1010)
                            // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                            reason =
                                "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " +
                                event.reason;
                        else if (event.code == 1011) reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                        else if (event.code == 1015) reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                        else reason = "Unknown reason";

                        Service.status[station] = "No Connection"; //"The connection was closed for reason: " + reason;
                    };
                    Service.ws[station].onerror = function (event) {
                        Service.status[station] = "There was an error with your websocket.";
                    };
                    Service.ws[station].onmessage = function (message) {
                        listener(JSON.parse(message.data));
                    };
                } catch (err)
                {
                    Service.status[station] = err.message;
                }
            };
            return Service;
        },
    ])
    .factory("$Exceptions", function ($rootScope, $navigation, Restangular, $q) {
        function set(data) {
            var deferred = $q.defer();
            Restangular.all("exceptions")
                .post(data)
                .then(
                    function () {
                        deferred.resolve({ data: { message: "Exceptions Success!" } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        }
        function get() {
            var deferred = $q.defer();
            Restangular.all("exceptions")
                .getList($navigation.get())
                .then(
                    function (data) {
                        deferred.resolve(data);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        }
        return {
            set: set,
            get: get,
        };
    })
    .factory("$ErrorLog", function ($rootScope, $navigation, Restangular, $q) {
        function set(data) {
            var deferred = $q.defer();
            Restangular.all("errorlog")
                .post(data)
                .then(
                    function () {
                        deferred.resolve({ data: { message: "Exceptions Success!" } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        }
        function get() {
            var deferred = $q.defer();
            Restangular.all("errorlog")
                .getList($navigation.get())
                .then(
                    function (data) {
                        deferred.resolve({ data: { message: "Errorlog Success!", data: data } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        }

        return {
            set: set,
            get: get,
        };
    })
    .factory("$Names", function ($rootScope) {
        return {
            Company: function (company_id) {
                var comp_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                return $rootScope.MasterData[comp_pos].registered_name + " (" + $rootScope.MasterData[comp_pos].code + ")";
            },
            Site: function (company_id, site_id) {
                var comp_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                var site_pos = $rootScope.MasterData[comp_pos].sites.findIndex((x) => x.id == site_id);
                return $rootScope.MasterData[comp_pos].sites[site_pos].site_name + " (" + $rootScope.MasterData[comp_pos].sites[site_pos].site_type + ")";
            },
            SiteH: function (company_id, site_id) {
                var comp_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                var site_pos = $rootScope.MasterData[comp_pos].sites.findIndex((x) => x.id == site_id);
                if (site_pos == null || site_pos == undefined || site_pos == -1) return "";
                return $rootScope.MasterData[comp_pos].sites[site_pos].custom_header_text;
            },
            SiteF: function (company_id, site_id) {
                var comp_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                var site_pos = $rootScope.MasterData[comp_pos].sites.findIndex((x) => x.id == site_id);
                if (site_pos == null || site_pos == undefined || site_pos == -1) return "";
                return $rootScope.MasterData[comp_pos].sites[site_pos].custom_footer_text;
            },
        };
    })
    .factory("$Functions", function ($rootScope, $navigation, Restangular, $q, $Names) {
        var FunctionsObj = {};
        FunctionsObj.Company = function (company_id) {
            var deferred = $q.defer();
            if (company_id === null || company_id === undefined)
            {
                setTimeout(function () {
                    var returndata = [];
                    if ($rootScope.MasterData != undefined)
                    {
                        $rootScope.MasterData.forEach(function (mapData) {
                            returndata.push({
                                value: mapData.id,
                                name: mapData.registered_name + " (" + mapData.code + ")",
                            });
                        });
                    }
                    deferred.resolve(returndata);
                }, 100);
                //                        var returndata = [];
                //                        Restangular.all('company').getList($navigation.get()).then(function(data){
                //                            $rootScope.MasterData = data;
                //                            data.forEach(function(mapData){
                //                                returndata.push({
                //                                    value: mapData.id,
                //                                    name: mapData.registered_name + ' (' + mapData.code + ')'
                //                                });
                //                            });
                //                            deferred.resolve(returndata);
                //                        }, function(response){
                //                            deferred.reject({
                //                                data: {
                //                                    message: response
                //                                },
                //                            });
                //                        });
            } else
            {
                //                        Restangular.one('company', company_id).get().then(function(company){
                //                            deferred.resolve(company);
                //                        });
                setTimeout(function () {
                    var company_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                    if (company_pos != -1) deferred.resolve($rootScope.MasterData[company_pos]);
                    else deferred.resolve("");
                }, 100);
            }
            return deferred.promise;
        };
        FunctionsObj.Site = function (site_id, company_id) {
            var deferred = $q.defer();
            if (!site_id)
            {
                setTimeout(function () {
                    if ($rootScope.MasterData != undefined)
                    {
                        var company_pos = $rootScope.MasterData.findIndex((x) => x.id == $rootScope.Params.company_id);
                        const returndata = [];
                        if (company_pos != -1) {
                            $rootScope.MasterData[company_pos].sites.forEach(function (mapData) {
                                if (mapData.site_active == 'Yes') {  // Check if site_active is 'Yes'
                                    returndata.push({
                                        value: mapData.id,
                                        name: mapData.site_name + " (" + mapData.site_type + ")",
                                        finger_active: mapData.finger_active,
                                        override_silo: mapData.override_silo,
                                        shared_workstation: mapData.shared_workstation,
                                        measure_type: mapData.measure_type,
                                        deduct_flow: mapData.deduct_flow,
                                        decimals: mapData.decimals
                                    });
                                }
                            });
                        }
                        deferred.resolve(returndata);
                    } else
                    {
                        const returndata = [];
                        deferred.resolve(returndata);
                    }
                }, 100);
            } else
            {
                setTimeout(function () {
                    var company_pos = $rootScope.MasterData.findIndex((x) => x.id == $rootScope.Params.company_id);
                    var site_pos = $rootScope.MasterData[company_pos].sites.findIndex((x) => x.id == site_id);
                    if (company_pos != -1 && site_pos != -1) deferred.resolve($rootScope.MasterData[company_pos].sites[site_pos].site_name);
                    else deferred.resolve("");
                }, 100);
                //                        Restangular.one('site', site_id).get().then(function(site){
                //                            deferred.resolve(site.site_name);
                //                        });
            }

            return deferred.promise;
        };
        FunctionsObj.Workstation = function (workstation_id) {
            var deferred = $q.defer();
            if (!workstation_id)
            {
                //                        Restangular.all('workstation').getList($navigation.get()).then(function(data){
                //                            var returndata = [];
                //                            data.forEach(function(mapData){
                //                                returndata.push({
                //                                    value: mapData.id,
                //                                    name: mapData.workstation_name + ' (' + mapData.workstation_type + ')',
                //                                    company: mapData.company_id,
                //                                    site: mapData.site_id,
                //                                    updated_at: mapData.updated_at,
                //                                    workstation_type: mapData.workstation_type,
                //                                });
                //                            });
                //                            deferred.resolve(returndata);
                //                        }, function(response){
                //                            deferred.reject({data: {message: response}});
                //                        });
                setTimeout(function () {
                    if ($rootScope.MasterData != undefined)
                    {
                        var company_pos = $rootScope.MasterData.findIndex((x) => x.id == $rootScope.Params.company_id);
                        var site_pos = $rootScope.MasterData[company_pos].sites.findIndex((x) => x.id == $rootScope.Params.site_id);
                        var returndata = [];
                        if (company_pos != -1 && site_pos != -1)
                            $rootScope.MasterData[company_pos].sites[site_pos].workstations.forEach(function (mapData) {
                                if (mapData.workstation_active == 'true') {  // Check if workstation_active is 'Yes'
                                returndata.push({
                                    value: mapData.id,
                                    name: mapData.workstation_name + " (" + mapData.workstation_type + ")",
                                    company: $Names.Company(mapData.company_id),
                                    site: $Names.Site(mapData.company_id, mapData.site_id),
                                    updated_at: mapData.updated_at,
                                    workstation_type: mapData.workstation_type,
                                });
                            }
                        });
                        deferred.resolve(returndata);
                    } else
                    {
                        var returndata = [];
                        deferred.resolve(returndata);
                    }
                }, 100);
            } else
            {
                //                        Restangular.one('workstation', workstation_id).get().then(function(workstation){
                //                            deferred.resolve(workstation.workstation_name);
                //                        });
                setTimeout(function () {
                    var company_pos = $rootScope.MasterData.findIndex((x) => x.id == $rootScope.Params.company_id);
                    var site_pos = $rootScope.MasterData[company_pos].sites.findIndex((x) => x.id == $rootScope.Params.site_id);
                    var workstation_pos = $rootScope.MasterData[company_pos].sites[site_pos].workstations.findIndex((x) => x.id == workstation_id);
                    if (company_pos != -1 && site_pos != -1 && workstation_pos != -1)
                        deferred.resolve($rootScope.MasterData[company_pos].sites[site_pos].workstations[workstation_pos].workstation_name);
                    else deferred.resolve("");
                }, 100);
            }

            return deferred.promise;
        };

        // this is for the weighing screen specifically
        FunctionsObj.WorkstationList = function (workstation_id) {
            var deferred = $q.defer();
            if (!workstation_id)
            {
                setTimeout(function () {
                    if ($rootScope.MasterData != undefined)
                    {
                        var company_pos = $rootScope.MasterData.findIndex((x) => x.id == $rootScope.Params.company_id);
                        var site_pos = $rootScope.MasterData[company_pos].sites.findIndex((x) => x.id == $rootScope.Params.site_id);
                        var returndata = [];
                        if (company_pos != -1 && site_pos != -1)
                            $rootScope.MasterData[company_pos].sites[site_pos].workstations.forEach(function (mapData) {
                                returndata.push({
                                    value: mapData.id,
                                    name: mapData.workstation_name + " (" + mapData.workstation_type + ")",
                                    company: $Names.Company(mapData.company_id),
                                    site: $Names.Site(mapData.company_id, mapData.site_id),
                                    updated_at: mapData.updated_at,
                                    workstation_type: mapData.workstation_type,
                                });
                        });
                        deferred.resolve(returndata);
                    } else
                    {
                        var returndata = [];
                        deferred.resolve(returndata);
                    }
                }, 100);
            } else
            {
                setTimeout(function () {
                    var company_pos = $rootScope.MasterData.findIndex((x) => x.id == $rootScope.Params.company_id);
                    var site_pos = $rootScope.MasterData[company_pos].sites.findIndex((x) => x.id == $rootScope.Params.site_id);
                    var workstation_pos = $rootScope.MasterData[company_pos].sites[site_pos].workstations.findIndex((x) => x.id == workstation_id);
                    if (company_pos != -1 && site_pos != -1 && workstation_pos != -1)
                        deferred.resolve($rootScope.MasterData[company_pos].sites[site_pos].workstations[workstation_pos].workstation_name);
                    else deferred.resolve("");
                }, 100);
            }

            return deferred.promise;
        };
        FunctionsObj.Settings = function (companyId, siteId, weighingTypeId) {
            var deferred = $q.defer();
            var param;
            if (typeof companyId !== "undefined" && typeof siteId !== "undefined" && typeof workstationId !== "undefined")
            {
                param = {
                    company_id: companyId,
                    site_id: siteId,
                    settings_id: weighingTypeId,
                };
            } else
            {
                param = $navigation.get();
            }
            Restangular.all("settings")
                .getList($navigation.get())
                .then(
                    function (data) {
                        var returndata = data[0];
                        returndata.forEach((ret) => {
                            ret.custom_header_text = $Names.SiteH($rootScope.Params.company_id, $rootScope.Params.site_id);
                        });
                        returndata.forEach((ret) => {
                            ret.custom_footer_text = $Names.SiteF($rootScope.Params.company_id, $rootScope.Params.site_id);
                        });
                        deferred.resolve(returndata);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.WeighSettings = function () {
            var deferred = $q.defer();
            Restangular.all("weighingAdd")
                .customGET("", $navigation.get())
                .then(
                    function (data) {
                        deferred.resolve(data.data);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.weighingLoad = function (selected_settings) {
            var deferred = $q.defer();
            let queryString = $navigation.get();
            if (selected_settings) queryString.settingId = selected_settings;
            Restangular.all("weighingLoad")
                .customGET("", queryString)
                .then(
                    function (data) {
                            data.data.Setting.custom_header_text = $Names.SiteH($rootScope.Params.company_id, $rootScope.Params.site_id);
                            data.data.Setting.custom_footer_text = $Names.SiteF($rootScope.Params.company_id, $rootScope.Params.site_id);
                        deferred.resolve(data.data);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.secondWeightLoad = function (HeaderId) {
            var deferred = $q.defer();
            let queryString = $navigation.get();
            queryString.weighId = HeaderId;
            if (HeaderId) queryString.weighId = HeaderId;
            Restangular.all("secondWeightLoad")
                .customGET("", queryString)
                .then(
                    function (data) {
                        data.data.Setting.custom_header_text = $Names.SiteH($rootScope.Params.company_id, $rootScope.Params.site_id);
                            data.data.Setting.custom_footer_text = $Names.SiteF($rootScope.Params.company_id, $rootScope.Params.site_id);
                        deferred.resolve(data.data);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.Weighbridges = function (company_id, site_id, workstation_id) {
            var deferred = $q.defer();
            var returndata = [];
            if (!workstation_id)
            {
                Restangular.all("weighbridge")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            data.forEach(function (mapData) {
                                returndata.push({
                                    value: mapData.id,
                                    name: mapData.name,
                                    company: mapData.company,
                                    updated_at: mapData.updated_at,
                                    workstation: mapData.workstation,
                                    weighing_transaction_flag: mapData.weighing_transaction_flag,
                                });
                            });
                            deferred.resolve(returndata);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            } else
            {
                $rootScope.Params.workstation_id = workstation_id;
                Restangular.all("weighbridge")
                    .getList($rootScope.Params)
                    .then(
                        function (weighbridges) {
                            weighbridges.forEach(function (weighbridge) {
                                returndata.push({
                                    value: weighbridge.id,
                                    name: weighbridge.name,
                                });
                            });
                            deferred.resolve(returndata);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            }

            return deferred.promise;
        };
        FunctionsObj.Haulier = function (haulier_id) {
            var deferred = $q.defer();
            var Hauliers = [];
            if (!haulier_id)
            {
                Restangular.all("haulier")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            data.forEach(function (mapData) {
                                Hauliers.push({
                                    id: mapData.id,
                                    value: mapData.id,
                                    name: mapData.name + " (" + mapData.code + ")",
                                    name_only: mapData.name,
                                    report: mapData.name + " (" + mapData.code + ")",
                                    updated_at: mapData.updated_at,
                                    code: mapData.code,
                                });
                            });
                            deferred.resolve(Hauliers);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            } else
            {
                Restangular.one("haulier", haulier_id)
                    .get()
                    .then(
                        function (haulier) {
                            Hauliers = haulier;
                            deferred.resolve(Hauliers);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            }
            return deferred.promise;
        };
        FunctionsObj.BusinessPartner = function (bp_id) {
            var deferred = $q.defer();
            var BusinessPartner = [];
            if (!bp_id)
            {
                Restangular.all("businesspartner")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            data.forEach(function (mapData) {
                                BusinessPartner.push({
                                    id: mapData.id,
                                    value: mapData.id,
                                    name: mapData.name + " (" + mapData.code + ")",
                                    name_only: mapData.name,
                                    report: mapData.name + " (" + mapData.code + ")",
                                    updated_at: mapData.updated_at,
                                    code: mapData.code,
                                    street: mapData.street,
                                    suburb: mapData.suburb,
                                    city: mapData.city,
                                    postal_code: mapData.postal_code,
                                    vat_nr: mapData.vat_nr,
                                });
                            });
                            deferred.resolve(BusinessPartner);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            } else
            {
                Restangular.one("businesspartner", bp_id)
                    .get()
                    .then(
                        function (businesspartner) {
                            BusinessPartner = businesspartner;
                            deferred.resolve(BusinessPartner);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            }
            return deferred.promise;
        };
        FunctionsObj.Product = function (product_id) {
            var deferred = $q.defer();
            var returndata = [];
            if (!product_id)
            {
                Restangular.all("product")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            data.forEach(function (mapData) {
                                returndata.push({
                                    id: mapData.id,
                                    value: mapData.id,
                                    name: mapData.name + "(" + mapData.code + ")",
                                    name_only: mapData.name,
                                    report: mapData.name + "(" + mapData.code + ")", //mapData.code + '<br>' + mapData.name + '<br>',
                                    updated_at: mapData.updated_at,
                                    code: mapData.code,
                                    purchase_price: mapData.purchase_price,
                                    sale_price: mapData.sale_price,
                                    vat: mapData.vat,
                                    grades_enabled: mapData.grades_enabled,
                                    grades: mapData.grades,
                                });
                            });
                            deferred.resolve(returndata);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            } else
            {
                Restangular.one("product", product_id)
                    .get()
                    .then(
                        function (product) {
                            returndata = product;
                            deferred.resolve(returndata);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            }

            return deferred.promise;
        };
        // FunctionsObj.Grades = function (grade_id) {
        //     var deferred = $q.defer();
        //     var returndata = [];
        //     if (!grade_id)
        //     {
        //         Restangular.all("grades")
        //             .getList($navigation.get())
        //             .then(
        //                 function (data) {
        //                     data.forEach(function (mapData) {
        //                         returndata.push({
        //                             id: mapData.id,
        //                             value: mapData.id,
        //                             name: mapData.name + "(" + mapData.code + ")",
        //                             name_only: mapData.name,
        //                             report: mapData.name + "(" + mapData.code + ")", //mapData.code + '<br>' + mapData.name + '<br>',
        //                             updated_at: mapData.updated_at,
        //                             code: mapData.code,
        //                         });
        //                     });
        //                     deferred.resolve(returndata);
        //                 },
        //                 function (response) {
        //                     deferred.reject({ data: { message: response } });
        //                 }
        //             );
        //     } else
        //     {
        //         Restangular.one("grades", grade_id)
        //             .get()
        //             .then(
        //                 function (grades) {
        //                     returndata = grades;
        //                     deferred.resolve(returndata);
        //                 },
        //                 function (response) {
        //                     deferred.reject({ data: { message: response } });
        //                 }
        //             );
        //     }

        //     return deferred.promise;
        // };
        FunctionsObj.Reporting = function (report_id) {
            var deferred = $q.defer();
            if (!report_id)
            {
                Restangular.all("reporting")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            deferred.resolve(data);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            } else
            {
                Restangular.one("reporting", report_id)
                    .get()
                    .then(
                        function (product) {
                            deferred.resolve(product);
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
            }

            return deferred.promise;
        };
        FunctionsObj.Users = function () {
            var deferred = $q.defer();
            $rootScope.Start();
        
            Restangular.one("userprofile", $navigation.get().id)
                .get()
                .then(
                    function (data) {
                        $rootScope.MasterData = data.companies;
        
                        // Fetch the role information
                        Restangular.one("usertype", data.role_id)
                            .get()
                            .then(
                                function (role) {
                                    // Combine the role data with the user data
                                    data.role = role;  // Add the role data to the user data object
        
                                    // Resolve with the combined data
                                    deferred.resolve(data);
                                },
                                function (response) {
                                    // Handle error in fetching the role
                                    deferred.reject({ data: { message: response } });
                                }
                            );
                    },
                    function (response) {
                        // Handle error in fetching the user profile
                        deferred.reject({ data: { message: response } });
                    }
                );
        
            return deferred.promise;
        };
        // FunctionsObj.UserRole = function (role_id) {
        //     var deferred = $q.defer();
        //     var returndata = [];
        //     Restangular.one("usertype", role_id)
        //             .get()
        //             .then(
        //                 function (role) {
        //                     returndata = role;
        //                     console.log('FUNCTION ROLE',role);
        //                     deferred.resolve(returndata);
        //                 },
        //                 function (response) {
        //                     deferred.reject({ data: { message: response } });
        //                 }
        //             );
        //             return deferred.promise;
        // };
        FunctionsObj.Camera = function (companyId, siteId, workstationId, camera_id) {
            var deferred = $q.defer();
            var param;

            if (typeof companyId !== "undefined" && typeof siteId !== "undefined" && typeof workstationId !== "undefined")
            {
                param = {
                    company_id: companyId,
                    site_id: siteId,
                    workstation_id: workstationId,
                };
            } else
            {
                param = $navigation.get();
            }
            Restangular.all("camera")
                .getList(param)
                .then(
                    function (data) {
                        var returnData = [];
                        data.forEach(function (cameraData) {
                            returnData.push({
                                id: cameraData.id,
                                name: cameraData.name,
                                ip_address: cameraData.ip_address,
                                site: cameraData.site_name,
                                company: cameraData.company_name, //company_id,
                                updated_at: cameraData.updated_at,
                            });
                    });
                        deferred.resolve(returnData);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );

            return deferred.promise;
        };
        FunctionsObj.UserType = function () {
            var deferred = $q.defer();
            var returnData = [];
            Restangular.all("usertype")
                .getList()
                .then(
                    function (data) {
                        data.forEach(function (mapData) {
                            returnData.push({
                                value: mapData.id,
                                name: mapData.usertypes,
                            });
                        });
                        deferred.resolve(returnData);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.Contracts = function () {
            var deferred = $q.defer();
            var returndata = [];
            Restangular.all("contract")
                .getList($navigation.get())
                .then(
                    function (data) {
                        data.forEach(function (mapData) {
                            returndata.push({
                                value: mapData.id,
                                name: mapData.name,
                                businesspartner_id: mapData.businesspartner_id,
                                businesspartner: mapData.businesspartner,
                                expiry_date: mapData.expiry_date,
                                direction: mapData.direction,
                                amount: mapData.amount,
                                product_id: mapData.product_id,
                                product: mapData.product,
                                updated_at: mapData.updated_at,
                                created_at: mapData.created_at,
                                deleted_at: mapData.deleted_at,
                                company: mapData.company,
                                site_id: mapData.site_id,
                                has_transaction: mapData.has_transaction,
                                price: mapData.price,
                                linked_contact_id: mapData.linked_contact_id,
                                stockpile_nr: mapData.stockpile_nr,
                                destination: mapData.destination,
                            });
                        });
                        deferred.resolve(returndata);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.Pallets = function () {
            var deferred = $q.defer();
            var returndata = [];
            Restangular.all("pallets")
                .getList($navigation.get())
                .then(
                    function (data) {
                        data.forEach(function (mapData) {
                            returndata.push({
                                value: mapData.pallet_id,
                                pallet_name: mapData.pallet_name,
                                amount: mapData.amount,
                                updated_at: mapData.updated_at,
                                created_at: mapData.created_at,
                                deleted_at: mapData.deleted_at,
                                company: mapData.company_id,
                                site_id: mapData.site_id,
                            });
                        });
                        deferred.resolve(returndata);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.Tares = function () {
            var deferred = $q.defer();
            var returndata = [];
            Restangular.all("tares")
                .getList($navigation.get())
                .then(
                    function (data) {
                        data.forEach(function (mapData) {
                            returndata.push({
                                value: mapData.id,
                                registration_no: mapData.registration_no,
                                weight: mapData.weight,
                                expiry_date: mapData.expiry_date,
                                updated_at: mapData.updated_at,
                                created_at: mapData.created_at,
                                company: mapData.company_id,
                                site_id: mapData.site_id,
                            });
                        });
                        deferred.resolve(returndata);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };
        FunctionsObj.RFIDVehicle = function () {
            var deferred = $q.defer();
            var returndata = [];
            Restangular.all("rfidvehicle")
                .getList($navigation.get())
                .then(
                    function (data) {
                        data.forEach(function (mapData) {
                            returndata.push({
                                id: mapData.id,
                                value: mapData.id,
                                registration_number: mapData.registration_number,
                                rfid: mapData.rfid,
                                haulier_id: mapData.haulier_id,
                                haulier_name: mapData.haulier_name,
                                company_id: mapData.company_id,
                                company_name: mapData.company_name,
                                site_id: mapData.site_id,
                                site_name: mapData.site_name,
                                updated_at: mapData.updated_at,
                                created_at: mapData.created_at,
                            });
                        });
                        deferred.resolve(returndata);
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        };

        return FunctionsObj;
    })
    .factory("$SharedWeighingFunctions", function ($rootScope) {
        return {
            GetDefaultData: function (vm) {
                
                return vm;
            },
            SetModuleFunctions: function (vm) {
                
                return vm;
            },
            SiteH: function (company_id, site_id) {
                var comp_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                var site_pos = $rootScope.MasterData[comp_pos].sites.findIndex((x) => x.id == site_id);
                if (site_pos == null || site_pos == undefined || site_pos == -1) return "";
                return $rootScope.MasterData[comp_pos].sites[site_pos].custom_header_text;
            },
            SiteF: function (company_id, site_id) {
                var comp_pos = $rootScope.MasterData.findIndex((x) => x.id == company_id);
                var site_pos = $rootScope.MasterData[comp_pos].sites.findIndex((x) => x.id == site_id);
                if (site_pos == null || site_pos == undefined || site_pos == -1) return "";
                return $rootScope.MasterData[comp_pos].sites[site_pos].custom_footer_text;
            },
        };
    });
