Number.prototype.toLeadZero = function () {
    return this < 10 ? '0' + this : this;
};

Date.prototype.toString = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDay();
    var hr = this.getHours(); // getMonth() is zero-based
    var mi = this.getMinutes();
    var sec = this.getSeconds(); // getMonth() is zero-based

    return [[this.getFullYear(), mm.toLeadZero(), dd.toLeadZero()].join('-'),
        [hr.toLeadZero(), mi.toLeadZero(), sec.toLeadZero()].join(':')].join(' '); // padding
};

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
