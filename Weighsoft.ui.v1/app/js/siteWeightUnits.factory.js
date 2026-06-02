/**
 * Site measure_type (kg, t, mt, g) vs canonical kilograms in DB/API.
 * Backend pricing assumes NettWeight and contract amounts in kg; prices are per metric ton.
 */
(function () {
    "use strict";

    angular.module("xenon.factory").factory("SiteWeightUnits", function () {
        function normalizeMeasureType(measureType) {
            if (measureType == null || measureType === "") {
                return "kg";
            }
            var s = String(measureType).toLowerCase().trim();
            if (s === "t" || s === "mt" || s === "ton" || s === "tons" || s === "tonne" || s === "tonnes") {
                return "t";
            }
            return s;
        }

        /**
         * Convert a mass value from the site's display/input unit to kilograms.
         */
        function siteUnitsToKg(value, measureType) {
            var v = typeof value === "string" ? parseFloat(value) : value;
            if (!isFinite(v)) {
                return 0;
            }
            var m = normalizeMeasureType(measureType);
            if (m === "t" || m === "mt") {
                return v * 1000;
            }
            if (m === "g") {
                return v / 1000;
            }
            return v;
        }

        /**
         * Convert kilograms to the site's display unit.
         */
        function kgToSiteUnits(value, measureType) {
            var v = typeof value === "string" ? parseFloat(value) : value;
            if (!isFinite(v)) {
                return 0;
            }
            var m = normalizeMeasureType(measureType);
            if (m === "t" || m === "mt") {
                return v / 1000;
            }
            if (m === "g") {
                return v * 1000;
            }
            return v;
        }

        /**
         * Net mass in kg for per-ton pricing: exclVat = unitPrice * (kg / 1000).
         * Pass net mass in **site units** (same as First/Second/Nett on screen).
         */
        function netKgForPerTonPricing(netInSiteUnits, measureType) {
            return siteUnitsToKg(netInSiteUnits, measureType);
        }

        /**
         * Round a numeric value to a non-negative decimal count (display / stable values).
         */
        function roundToDecimals(value, decimals) {
            var v = typeof value === "string" ? parseFloat(value) : value;
            if (!isFinite(v)) {
                return 0;
            }
            var d = parseInt(decimals, 10);
            if (!isFinite(d) || d < 0) {
                d = 0;
            }
            if (d > 15) {
                d = 15;
            }
            if (d === 0) {
                return Math.round(v);
            }
            var factor = Math.pow(10, d);
            return Math.round(v * factor) / factor;
        }

        /**
         * Prefer weighbridge decimal_places when set; otherwise site.decimals.
         */
        function displayDecimalsFromWeighbridgeOrSite(weighBridge, site) {
            if (weighBridge != null && weighBridge.decimal_places !== undefined && weighBridge.decimal_places !== null && weighBridge.decimal_places !== "") {
                var wbDec = parseInt(String(weighBridge.decimal_places), 10);
                if (Number.isInteger(wbDec) && wbDec >= 0) {
                    return wbDec;
                }
            }
            var s = site && site.decimals;
            if (s !== undefined && s !== null && s !== "") {
                var sd = typeof s === "number" && s % 1 === 0 ? s : parseInt(String(s), 10);
                if (sd === sd && sd >= 0 && Math.floor(sd) === sd) {
                    return sd;
                }
            }
            return 0;
        }

        /**
         * Scale stream is treated as kilograms; convert to site display units and round.
         */
        function fromScaleKgToSiteDisplay(rawKg, measureType, weighBridge, site) {
            var kg = typeof rawKg === "string" ? parseFloat(rawKg) : rawKg;
            if (!isFinite(kg)) {
                return 0;
            }
            var inSite = kgToSiteUnits(kg, measureType);
            return roundToDecimals(inSite, displayDecimalsFromWeighbridgeOrSite(weighBridge, site));
        }

        /**
         * Scale reading in kg, rounded for tare storage/display in kg.
         */
        function fromScaleKgRoundedKg(rawKg, weighBridge, site) {
            var kg = typeof rawKg === "string" ? parseFloat(rawKg) : rawKg;
            if (!isFinite(kg)) {
                return 0;
            }
            return roundToDecimals(kg, displayDecimalsFromWeighbridgeOrSite(weighBridge, site));
        }

        return {
            normalizeMeasureType: normalizeMeasureType,
            siteUnitsToKg: siteUnitsToKg,
            kgToSiteUnits: kgToSiteUnits,
            netKgForPerTonPricing: netKgForPerTonPricing,
            roundToDecimals: roundToDecimals,
            displayDecimalsFromWeighbridgeOrSite: displayDecimalsFromWeighbridgeOrSite,
            fromScaleKgToSiteDisplay: fromScaleKgToSiteDisplay,
            fromScaleKgRoundedKg: fromScaleKgRoundedKg
        };
    });
})();
