(function () {
    var global = typeof window !== 'undefined' ? window :
        typeof root !== 'undefined' ? root : this;

    global.FilePicker = (function () {
        var filePicker = {};

        filePicker.Open = function (options, ok, cancel) {
            window.open("/Media", "", "left = 0, top = 0, height = 600, width = 945, status = yes, toolbar = no, menubar = no, location = yes, resizable = yes");

            function listener(event) {
                if (event.origin !== "https://localhost:44300")
                    return

                var data = JSON.parse(event.data);
                if (data.action === "result")
                    ok(data);
                else if (data.action === "cancel")
                    cancel(data);

                //unwire events
                if (window.removeEventListener) {
                    removeEventListener("message", listener, false);
                }
                else {
                    detachEvent("onmessage", listener);
                }
            }
            if (window.addEventListener) {
                addEventListener("message", listener, false);
            }
            else {
                attachEvent("onmessage", listener);
            }
        };

        filePicker.Cancel = function () {
            alert("here");
        };

        return filePicker;
    }());
})();