import moment from 'moment'
export default {

    validateJson(obj) {
        for (var key in obj) {
            if (obj[key] === null || obj[key] === "null" || obj[key] == "") {
                console.log("validateJson failed for obj=", obj)
                return false;
            }
        }
        console.log("validateJson successful for obj=", obj)
        return true;
    },
    /***************************************************************************************
     * Utility method: used to generate a subscription ID. 
     * This subscription ID will be sent to ICWS
     ***************************************************************************************/
    generateSubscriptionId(userId) {
        let subscriptionId = userId + "-" + getFormattedTime();
        //Get time format for unique ID
        function getFormattedTime() {
            var today = new Date();
            //return moment(today).format("YYYYMMDDHHmmssSSS");
            return moment(today).format("YYYYMMDDHHmmss");
        }
        return subscriptionId
    },
    generateTabId() {
        let tabId = getFormattedTime();
        //Get time format for unique ID
        function getFormattedTime() {
            var today = new Date();
            //return moment(today).format("YYYYMMDDHHmmssSSS");
            return moment(today).format("DDHHmmssSSS");
        }
        return tabId
    },
    onVisibilityChange(callback) {
        var visible = true;

        if (!callback) {
            throw new Error('no callback given');
        }

        function focused() {
            if (!visible) {
                callback(visible = true);
            }
        }

        function unfocused() {
            if (visible) {
                callback(visible = false);
            }
        }

        // Standards:
        if ('hidden' in document) {
            document.addEventListener('visibilitychange',
                function () { (document.hidden ? unfocused : focused)() });
        }
        if ('mozHidden' in document) {
            document.addEventListener('mozvisibilitychange',
                function () { (document.mozHidden ? unfocused : focused)() });
        }
        if ('webkitHidden' in document) {
            document.addEventListener('webkitvisibilitychange',
                function () { (document.webkitHidden ? unfocused : focused)() });
        }
        if ('msHidden' in document) {
            document.addEventListener('msvisibilitychange',
                function () { (document.msHidden ? unfocused : focused)() });
        }
        // IE 9 and lower:
        if ('onfocusin' in document) {
            document.onfocusin = focused;
            document.onfocusout = unfocused;
        }
        // All others:
        window.onpageshow = window.onfocus = focused;
        window.onpagehide = window.onblur = unfocused;
    }
}