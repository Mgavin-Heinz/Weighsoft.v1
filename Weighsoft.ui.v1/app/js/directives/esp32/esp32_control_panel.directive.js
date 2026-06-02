'use strict';

angular.module('xenon.directives')
    .directive('esp32ControlPanel', Esp32ControlPanel);

function Esp32ControlPanel() {
    return {
        restrict: 'E',
        templateUrl: appHelper.templatePath('directives/esp32_control_panel'),
        controller: Esp32ControlPanelController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {}
    };
}

function Esp32ControlPanelController($scope, $rootScope, $esp32Control, Restangular) {
    const ctrl = this;
    
    console.log('[ESP32 Control Panel] Directive initialized');
    
    ctrl.workstation = null;
    ctrl.loading = false;
    ctrl.isCollapsed = false; // Add collapse state
    ctrl.showAdvanced = false; // Advanced controls toggle
    ctrl.esp32Status = {
        incomingBoom: null,
        exitingBoom: null,
        incomingRedLight: null,
        incomingGreenLight: null,
        exitingRedLight: null,
        exitingGreenLight: null
    };

    // Toggle collapse/expand
    ctrl.toggleCollapse = function() {
        ctrl.isCollapsed = !ctrl.isCollapsed;
    };

    // Toggle advanced controls visibility
    ctrl.toggleAdvanced = function() {
        ctrl.showAdvanced = !ctrl.showAdvanced;
    };

    // Watch for workstation changes and auto-load
    $scope.$watch(function() {
        return $rootScope.Params && $rootScope.Params.workstation_id;
    }, function(newWorkstationId) {
        console.log('[ESP32 Control Panel] Workstation ID changed:', newWorkstationId);
        console.log('[ESP32 Control Panel] $rootScope.Params:', $rootScope.Params);
        
        if (newWorkstationId) {
            ctrl.loadWorkstation(newWorkstationId);
        } else {
            ctrl.workstation = null;
        }
    });

    ctrl.loadWorkstation = function(workstationId) {
        if (!workstationId) {
            console.log('[ESP32 Control Panel] loadWorkstation called with empty ID');
            ctrl.workstation = null;
            return;
        }

        console.log('[ESP32 Control Panel] Loading workstation:', workstationId);
        ctrl.loading = true;
        Restangular.one('workstation', workstationId).get().then(
            function(workstation) {
                ctrl.workstation = workstation;
                ctrl.loading = false;
            },
            function(error) {
                console.error('Error loading workstation:', error);
                ctrl.workstation = null;
                ctrl.loading = false;
            }
        );
    };

    ctrl.hasWorkstation = function() {
        return ctrl.workstation !== null;
    };

    /**
     * A device (boom or light) is fully configured only when both IP (non-empty after trim) and relay (1-8) are valid.
     */
    function isDeviceConfigured(ip, relay) {
        var trimmedIp = typeof ip === 'string' ? ip.trim() : '';
        var r = parseInt(relay, 10);
        return trimmedIp !== '' && (r >= 1 && r <= 8);
    }

    ctrl.controlIncomingBoom = function(action) {
        if (!ctrl.workstation || !isDeviceConfigured(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay)) {
            toastr.error('Incoming boom not fully configured for this workstation (set both IP and relay 1-8)');
            return;
        }
        
        $rootScope.Start();
        const state = (action !== 'open'); // Boom works in reverse: ON=closed, OFF=open
        $esp32Control.controlRelay(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay, state)
            .then(function() {
                ctrl.esp32Status.incomingBoom = action;
                $rootScope.Loaded();
                toastr.success('Incoming boom ' + action + ' command sent successfully');
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    ctrl.controlExitingBoom = function(action) {
        if (!ctrl.workstation || !isDeviceConfigured(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay)) {
            toastr.error('Exiting boom not fully configured for this workstation (set both IP and relay 1-8)');
            return;
        }
        
        $rootScope.Start();
        const state = (action !== 'open'); // Boom works in reverse: ON=closed, OFF=open
        $esp32Control.controlRelay(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay, state)
            .then(function() {
                ctrl.esp32Status.exitingBoom = action;
                $rootScope.Loaded();
                toastr.success('Exiting boom ' + action + ' command sent successfully');
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    ctrl.controlIncomingRedLight = function(state) {
        if (!ctrl.workstation || !isDeviceConfigured(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay)) {
            toastr.error('Incoming red light not fully configured for this workstation (set both IP and relay 1-8)');
            return;
        }
        $rootScope.Start();
        const on = (state === 'on');
        $esp32Control.controlRelay(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay, on)
            .then(function() {
                ctrl.esp32Status.incomingRedLight = state;
                $rootScope.Loaded();
                toastr.success('Incoming red light turned ' + state);
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    ctrl.controlIncomingGreenLight = function(state) {
        if (!ctrl.workstation || !isDeviceConfigured(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay)) {
            toastr.error('Incoming green light not fully configured for this workstation (set both IP and relay 1-8)');
            return;
        }
        $rootScope.Start();
        const on = (state === 'on');
        $esp32Control.controlRelay(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay, on)
            .then(function() {
                ctrl.esp32Status.incomingGreenLight = state;
                $rootScope.Loaded();
                toastr.success('Incoming green light turned ' + state);
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    ctrl.controlExitingRedLight = function(state) {
        if (!ctrl.workstation || !isDeviceConfigured(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay)) {
            toastr.error('Exiting red light not fully configured for this workstation (set both IP and relay 1-8)');
            return;
        }
        $rootScope.Start();
        const on = (state === 'on');
        $esp32Control.controlRelay(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay, on)
            .then(function() {
                ctrl.esp32Status.exitingRedLight = state;
                $rootScope.Loaded();
                toastr.success('Exiting red light turned ' + state);
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    ctrl.controlExitingGreenLight = function(state) {
        if (!ctrl.workstation || !isDeviceConfigured(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay)) {
            toastr.error('Exiting green light not fully configured for this workstation (set both IP and relay 1-8)');
            return;
        }
        $rootScope.Start();
        const on = (state === 'on');
        $esp32Control.controlRelay(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay, on)
            .then(function() {
                ctrl.esp32Status.exitingGreenLight = state;
                $rootScope.Loaded();
                toastr.success('Exiting green light turned ' + state);
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    ctrl.hasAnyControls = function() {
        if (!ctrl.workstation) return false;
        return isDeviceConfigured(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay) ||
               isDeviceConfigured(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay) ||
               isDeviceConfigured(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay) ||
               isDeviceConfigured(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay) ||
               isDeviceConfigured(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay) ||
               isDeviceConfigured(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay);
    };

    // Check if incoming controls are configured (boom or lights) - at least one device fully configured
    ctrl.hasIncomingControls = function() {
        if (!ctrl.workstation) return false;
        return isDeviceConfigured(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay) ||
               isDeviceConfigured(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay) ||
               isDeviceConfigured(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay);
    };

    // Check if exiting controls are configured (boom or lights) - at least one device fully configured
    ctrl.hasExitingControls = function() {
        if (!ctrl.workstation) return false;
        return isDeviceConfigured(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay) ||
               isDeviceConfigured(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay) ||
               isDeviceConfigured(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay);
    };

    // ============================================
    // COMBINED SEQUENCE FUNCTIONS
    // ============================================

    /**
     * Open Incoming - Allow vehicle to enter
     * Sequence: Red Light OFF → Green Light ON → Boom Open
     */
    ctrl.openIncoming = function() {
        if (!ctrl.workstation) {
            toastr.error('No workstation configured');
            return;
        }
        if (!ctrl.hasIncomingControls()) {
            toastr.warning('No incoming devices (boom/lights) are fully configured. Set both IP and relay (1-8) for at least one device.');
            return;
        }

        $rootScope.Start();
        var promises = [];

        // Step 1: Turn Red Light OFF (if configured)
        if (isDeviceConfigured(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay)) {
            promises.push(
                $esp32Control.controlRelay(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay, false)
                    .then(function() {
                        ctrl.esp32Status.incomingRedLight = 'off';
                    })
            );
        }

        Promise.all(promises)
            .then(function() {
                // Step 2: Turn Green Light ON (if configured)
                if (isDeviceConfigured(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay, true)
                        .then(function() {
                            ctrl.esp32Status.incomingGreenLight = 'on';
                        });
                }
            })
            .then(function() {
                // Step 3: Open Boom (if configured) - Boom works in reverse: OFF=open
                if (isDeviceConfigured(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay, false)
                        .then(function() {
                            ctrl.esp32Status.incomingBoom = 'open';
                        });
                }
            })
            .then(function() {
                $rootScope.Loaded();
                toastr.success('Incoming opened - Vehicle may proceed');
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    /**
     * Close Incoming - Block vehicle entry
     * Sequence: Green Light OFF → Red Light ON → Boom Close
     */
    ctrl.closeIncoming = function() {
        if (!ctrl.workstation) {
            toastr.error('No workstation configured');
            return;
        }
        if (!ctrl.hasIncomingControls()) {
            toastr.warning('No incoming devices (boom/lights) are fully configured. Set both IP and relay (1-8) for at least one device.');
            return;
        }

        $rootScope.Start();
        var promises = [];

        // Step 1: Turn Green Light OFF (if configured)
        if (isDeviceConfigured(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay)) {
            promises.push(
                $esp32Control.controlRelay(ctrl.workstation.incoming_green_light_ip, ctrl.workstation.incoming_green_light_relay, false)
                    .then(function() {
                        ctrl.esp32Status.incomingGreenLight = 'off';
                    })
            );
        }

        Promise.all(promises)
            .then(function() {
                // Step 2: Turn Red Light ON (if configured)
                if (isDeviceConfigured(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.incoming_red_light_ip, ctrl.workstation.incoming_red_light_relay, true)
                        .then(function() {
                            ctrl.esp32Status.incomingRedLight = 'on';
                        });
                }
            })
            .then(function() {
                // Step 3: Close Boom (if configured) - Boom works in reverse: ON=closed
                if (isDeviceConfigured(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.incoming_boom_ip, ctrl.workstation.incoming_boom_relay, true)
                        .then(function() {
                            ctrl.esp32Status.incomingBoom = 'close';
                        });
                }
            })
            .then(function() {
                $rootScope.Loaded();
                toastr.success('Incoming closed - Entry blocked');
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    /**
     * Open Exiting - Allow vehicle to exit
     * Sequence: Red Light OFF → Green Light ON → Boom Open
     */
    ctrl.openExiting = function() {
        if (!ctrl.workstation) {
            toastr.error('No workstation configured');
            return;
        }
        if (!ctrl.hasExitingControls()) {
            toastr.warning('No exiting devices (boom/lights) are fully configured. Set both IP and relay (1-8) for at least one device.');
            return;
        }

        $rootScope.Start();
        var promises = [];

        // Step 1: Turn Red Light OFF (if configured)
        if (isDeviceConfigured(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay)) {
            promises.push(
                $esp32Control.controlRelay(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay, false)
                    .then(function() {
                        ctrl.esp32Status.exitingRedLight = 'off';
                    })
            );
        }

        Promise.all(promises)
            .then(function() {
                // Step 2: Turn Green Light ON (if configured)
                if (isDeviceConfigured(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay, true)
                        .then(function() {
                            ctrl.esp32Status.exitingGreenLight = 'on';
                        });
                }
            })
            .then(function() {
                // Step 3: Open Boom (if configured) - Boom works in reverse: OFF=open
                if (isDeviceConfigured(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay, false)
                        .then(function() {
                            ctrl.esp32Status.exitingBoom = 'open';
                        });
                }
            })
            .then(function() {
                $rootScope.Loaded();
                toastr.success('Exiting opened - Vehicle may proceed');
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };

    /**
     * Close Exiting - Block vehicle exit
     * Sequence: Green Light OFF → Red Light ON → Boom Close
     */
    ctrl.closeExiting = function() {
        if (!ctrl.workstation) {
            toastr.error('No workstation configured');
            return;
        }
        if (!ctrl.hasExitingControls()) {
            toastr.warning('No exiting devices (boom/lights) are fully configured. Set both IP and relay (1-8) for at least one device.');
            return;
        }

        $rootScope.Start();
        var promises = [];

        // Step 1: Turn Green Light OFF (if configured)
        if (isDeviceConfigured(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay)) {
            promises.push(
                $esp32Control.controlRelay(ctrl.workstation.exiting_green_light_ip, ctrl.workstation.exiting_green_light_relay, false)
                    .then(function() {
                        ctrl.esp32Status.exitingGreenLight = 'off';
                    })
            );
        }

        Promise.all(promises)
            .then(function() {
                // Step 2: Turn Red Light ON (if configured)
                if (isDeviceConfigured(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.exiting_red_light_ip, ctrl.workstation.exiting_red_light_relay, true)
                        .then(function() {
                            ctrl.esp32Status.exitingRedLight = 'on';
                        });
                }
            })
            .then(function() {
                // Step 3: Close Boom (if configured) - Boom works in reverse: ON=closed
                if (isDeviceConfigured(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay)) {
                    return $esp32Control.controlRelay(ctrl.workstation.exiting_boom_ip, ctrl.workstation.exiting_boom_relay, true)
                        .then(function() {
                            ctrl.esp32Status.exitingBoom = 'close';
                        });
                }
            })
            .then(function() {
                $rootScope.Loaded();
                toastr.success('Exiting closed - Exit blocked');
            })
            .catch(function(error) {
                $rootScope.Error(error);
            });
    };
}

Esp32ControlPanelController.$inject = ['$scope', '$rootScope', '$esp32Control', 'Restangular'];

