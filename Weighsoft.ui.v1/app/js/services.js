"use strict";

angular
  .module("xenon.services", [])
  .service("$menuItems", function () {
    this.menuItems = [];

    var $menuItemsRef = this;

    var menuItemObj = {
      parent: null,
      title: "",
      link: "", // starting with "./" will refer to parent link concatenation
      state: "", // will be generated from link automatically where "/" (forward slashes) are replaced with "."
      icon: "",
      isActive: false,
      label: null,
      menuItems: [],
      setLabel: function (label, color, hideWhenCollapsed) {
        if (typeof hideWhenCollapsed == "undefined") {
          hideWhenCollapsed = true;
        }
        this.label = {
          text: label,
          classname: color,
          collapsedHide: hideWhenCollapsed,
        };
        return this;
      },
      addItem: function (title, link, icon) {
        var parent = this,
          item = angular.extend(angular.copy(menuItemObj), {
            parent: parent,
            title: title,
            link: link,
            icon: icon,
          });

        if (item.link) {
          if (item.link.match(/^\./)) {
            item.link = parent.link + item.link.substring(1, link.length);
          }

          if (item.link.match(/^-/)) {
            item.link = parent.link + "-" + item.link.substring(2, link.length);
          }

          item.state = $menuItemsRef.toStatePath(item.link);
        }

        this.menuItems.push(item);
        return item;
      },
    };

    this.addItem = function (title, link, icon) {
      var item = angular.extend(angular.copy(menuItemObj), {
        title: title,
        link: link,
        state: this.toStatePath(link),
        icon: icon,
      });
      this.menuItems.push(item);
      return item;
    };

    this.getAll = function () {
      return this.menuItems;
    };

    this.prepareSidebarMenu = function (permissions) {
      var vm = this;
      vm.Setup = this.addItem("Setup", "", "linecons-params");

      if (permissions.companies === "true") {
        vm.Setup.addItem("Companies", "/app/company", "fa-cc");
      }
      if (permissions.sites === "true") {
        vm.Setup.addItem("Sites", "/app/site", "fa-sitemap");
      }
      if (permissions.workstations === "true") {
        vm.Setup.addItem("Work Stations", "/app/workstations", "linecons-pencil");
      }
      if (permissions.weighbridges === "true") {
        vm.Setup.addItem("Weighbridges", "/app/weighbridges", "fa-cube");
      }
      if (permissions.weighbridges === "true") {
        vm.Setup.addItem("Weighbridge Setup", "/app/weighbridge_setup", "fa-cube");
      }
      if (permissions.cameras === "true") {
        vm.Setup.addItem("Cameras", "/app/cameras", "linecons-camera");
      }
      if (permissions.weigh_types === "true") {
        vm.Setup.addItem("Weigh Types", "/app/settings", "fa-dashboard");
      }

      vm.Weighing = this.addItem("Weighing", "", "linecons-desktop");
      if (permissions.weighing === "true") {
        vm.Weighing.addItem("Weighing", "/app/weighing", "fa-edit");
      }
      // if (permissions.weighing === "true") {
      //   vm.Weighing.addItem("Weighing Create", "/app/weigh/create", "linecons-pencil");
      // }
      // if (permissions.weighing === "true") {
      //   vm.Weighing.addItem("Weighing Update", "/app/weighing/update", "fa-edit");
      // }
      if (permissions.verify === "true") {
        vm.Weighing.addItem("Verify", "/app/verify", "fa-check-square-o");
      }
      if (permissions.reprint === "true") {
        vm.Weighing.addItem("Reprint", "/app/reprint_list", "fa-print");
      }

      vm.Operations = this.addItem("Operations", "", "linecons-cog");

      // To add contract link in side menu bar
      vm.Contracts = vm.Operations.addItem("Contracts", "/app/contract", "linecons-note");
      vm.Pallets = vm.Operations.addItem("Pallets", "/app/pallets", "linecons-note");
      vm.Tares = vm.Operations.addItem("Tares", "/app/tares", "linecons-note");
      vm.MasterData = vm.Operations.addItem("Master Data", "", "linecons-note");
      if (permissions.business_partner === "true") vm.MasterData.addItem("Business Partners", "/app/businesspartners", "linecons-database");
      if (permissions.products === "true") vm.MasterData.addItem("Products", "/app/products", "linecons-food");
      // if (permissions.products === "true") vm.MasterData.addItem("Grades", "/app/grades", "linecons-food");
      if (permissions.hauliers === "true") vm.MasterData.addItem("Hauliers", "/app/hauliers", "linecons-truck");
      // if(permissions.stored_tares === 'true')
      //     vm.MasterData.addItem('Stored Tares', '/app/storedtares', 'linecons-cloud');
      if (permissions.rfid_vehicle === "true") vm.MasterData.addItem("RFID Vehicles", "/app/rfidvehicles", "linecons-wallet");
      if (permissions.axel_settings === "true") vm.MasterData.addItem("Axel Settings", "/app/axelsettings", "linecons-params");

      vm.Reports = vm.Operations.addItem("Reports", "", "fa-area-chart");
      if (permissions.transaction_report === "true") vm.Reports.addItem("Reporting Centre", "/app/exceptions", "fa-warning");
      if (permissions.exception_report === "true") vm.Reports.addItem("Transaction", "/app/transactions", "fa-stack-overflow");

      if (!permissions || !permissions.xero || permissions.xero === "true" || permissions.xero === true) {
        vm.Xero = vm.Operations.addItem("Xero", "/app/xero", "fa-cloud");
      }

      vm.UserSettings = vm.Operations.addItem("User Settings", "", "fa-user");
      if (permissions.users === "true") vm.UserSettings.addItem("Users", "/app/users", "linecons-user");
      if (permissions.user_types === "true") vm.UserSettings.addItem("User Types", "/app/usertype", "linecons-thumbs-up");
      return vm;
    };

    this.prepareHorizontalMenu = function () {
      return this;
    };

    this.instantiate = function () {
      return angular.copy(this);
    };

    this.toStatePath = function (path) {
      return path.replace(/\//g, ".").replace(/^\./, "");
    };

    this.setActive = function (path) {
      this.iterateCheck(this.menuItems, this.toStatePath(path));
    };

    this.setActiveParent = function (item) {
      item.isActive = true;
      item.isOpen = true;
      if (item.parent) {
        this.setActiveParent(item.parent);
      }
    };

    this.iterateCheck = function (menuItems, currentState) {
      angular.forEach(menuItems, function (item) {
        if (item.state == currentState) {
          item.isActive = true;
          if (item.parent != null) {
            $menuItemsRef.setActiveParent(item.parent);
          }
        } else {
          item.isActive = false;
          item.isOpen = false;
          if (item.menuItems.length) {
            $menuItemsRef.iterateCheck(item.menuItems, currentState);
          }
        }
      });
    };
  })
  .service("$weightModifiers", function () {
    this.calculateMoisture = function (totalWeight, moisturePercentage, prescribedMoisture) {
      const moistureCoefficient = 100 - (100 - moisturePercentage) / (100 - prescribedMoisture);
      return totalWeight * moistureCoefficient;
    };
  })
  .service("$esp32Control", function (Restangular) {
    /**
     * Control ESP32 relay devices via backend proxy
     * 
     * This service proxies requests through the Weighsoft backend to avoid CORS issues.
     * The backend forwards requests to ESP32 devices and provides better logging.
     * 
     * API: POST /api/esp32/relay
     * Format: { "ip": "192.168.1.100", "relay_number": 1, "state": true }
     * 
     * Boom Semantics:
     *   - true (ON)  = Boom Open
     *   - false (OFF) = Boom Closed
     * 
     * Light Semantics (each red/green is a separate relay):
     *   - true (ON)  = Light On
     *   - false (OFF) = Light Off
     *   Incoming/Exiting Red and Green lights each have their own relay.
     */
    
    /**
     * Control a specific relay on an ESP32 device
     * @param {string} ip - ESP32 device IP address
     * @param {number} relayNumber - Relay number (1-8)
     * @param {boolean} state - Relay state (true=ON, false=OFF)
     * @returns {Promise}
     */
    this.controlRelay = function (ip, relayNumber, state) {
      console.log('[ESP32 Control] controlRelay called', { ip: ip, relayNumber: relayNumber, state: state });
      
      var trimmedIp = typeof ip === 'string' ? ip.trim() : '';
      if (!trimmedIp) {
        console.error('[ESP32 Control] Missing or empty IP address');
        return Promise.reject({ error: 'IP address and relay number are required' });
      }
      
      var r = parseInt(relayNumber, 10);
      if (!(r >= 1 && r <= 8)) {
        console.error('[ESP32 Control] Invalid relay number (must be 1-8):', relayNumber);
        return Promise.reject({ error: 'Relay number must be 1-8' });
      }
      
      var payload = {
        ip: trimmedIp,
        relay_number: r,
        state: state
      };
      
      console.log('[ESP32 Control] Sending request to backend:', payload);
      
      // Use Restangular.all().customPOST() pattern matching other nested routes
      return Restangular.all('esp32').customPOST(payload, 'relay').then(function(response) {
        console.log('[ESP32 Control] Success response:', response);
        return response;
      }).catch(function(error) {
        console.error('[ESP32 Control] Error response:', error);
        throw error;
      });
    };
    
    /**
     * Get current state of all relays from an ESP32 device
     * @param {string} ip - ESP32 device IP address
     * @returns {Promise}
     */
    this.getRelayStates = function (ip) {
      console.log('[ESP32 Control] getRelayStates called', { ip: ip });
      
      var trimmedIp = typeof ip === 'string' ? ip.trim() : '';
      if (!trimmedIp) {
        console.error('[ESP32 Control] Missing or empty IP address');
        return Promise.reject({ error: 'IP address is required' });
      }
      
      // Use Restangular.all().customGET() pattern matching other nested routes  
      return Restangular.all('esp32').customGET('relay', { ip: trimmedIp }).then(function(response) {
        console.log('[ESP32 Control] Get states success:', response);
        return response.data;
      }).catch(function(error) {
        console.error('[ESP32 Control] Get states error:', error);
        throw error;
      });
    };
  });
