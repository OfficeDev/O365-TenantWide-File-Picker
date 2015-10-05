(function () {
    var host = "https://localhost:44300";
    angular.module("filePicker", [])
    .controller("searchCtrl", ["$scope", "$http", function ($scope, $http) {
        $scope.items = [];
        $scope.searchTerms = "";
        $scope.waiting = true;
        $scope.activeNav = "OneDrive";
        $scope.breadcrumb = "OneDrive";

        $scope.toggleNav = function (item) {
            $scope.activeNav = item;
            $scope.breadcrumb = item;
        };

        $scope.toggle = function (item) {
            item.selected = !item.selected;
        };

        $scope.search = function () {
            if (event.key === "Enter") {
                $scope.waiting = true;
                doSearch("(" + $scope.searchTerms + " AND (ContentTypeId:0x0101* AND (SecondaryFileExtension=mp4 OR SecondaryFileExtension=png OR SecondaryFileExtension=gif OR SecondaryFileExtension=jpg OR SecondaryFileExtension=jpeg)))");
            }
        };

        $scope.reset = function () {
            $scope.waiting = true;
            doSearch("(ContentTypeId:0x0101* AND (SecondaryFileExtension=mp4 OR SecondaryFileExtension=png OR SecondaryFileExtension=gif OR SecondaryFileExtension=jpg OR SecondaryFileExtension=jpeg))");
        };

        $scope.ok = function () {
            var data = { action: "result", files: [] };
            $($scope.items).each(function (i, e) {
                if (e.selected) {
                    data.files.push(e);
                }
            });
            window.opener.postMessage(JSON.stringify(data), host);
            window.close();
        };

        $scope.cancel = function () {
            window.opener.postMessage(JSON.stringify({ action: "cancel", files: null }), host);
            window.close();
        };

        var doSearch = function (query) {
            $scope.items = [];
            $http.defaults.headers.common["Authorization"] = "Bearer " + auth_details.rootToken;
            $http.defaults.headers.post["accept"] = "application/json;odata=verbose";
            $http.get(auth_details.rootEndpoint + "/search/query?querytext='" + query + "'&trimduplicates=true&rowlimit=50&SelectProperties='Title,Path,Name,SecondaryFileExtension,Filename,Size,SiteTitle,PictureUrl'")
            .success(function (data) {
                $(data.PrimaryQueryResult.RelevantResults.Table.Rows).each(function (i, e) {
                    $scope.items.push(parseRow(e));
                });

                $scope.waiting = false;
            })
            .error(function (err) {
                //TODO
            });
        };

        var parseRow = function (row) {
            var item = { selected: false };
            $(row.Cells).each(function (i, e) {
                if (e.Key === "Filename")
                    item.Filename = e.Value;
                if (e.Key === "Path")
                    item.Path = e.Value;
                if (e.Key === "Size")
                    item.Size = e.Value;
                if (e.Key === "SiteTitle")
                    item.SiteTitle = e.Value;
                else if (e.Key === "SecondaryFileExtension")
                    item.Extension = e.Value;
            });
            return item;
        }

        //perform initial search
        $scope.reset();
    }]);

    $(document).ready(function () {
        //wire up angular to the page
        angular.bootstrap($("#container"), ["filePicker"]);
    });
})();



var fabric = fabric || {};
fabric.Spinner = function (holderElement, spinnerType) {

    var _holderElement = holderElement;
    var _spinnerType = spinnerType || "eight";
    var eightSize = 0.18;
    var sixteenSize = 0.1;
    var circleObjects = [];
    var animationSpeed = 80;
    var interval;
    var spinner;
    var numCircles;
    var offsetSize;

    /**
     * @function start - starts or restarts the animation sequence
     * @memberOf fabric.Spinner
     */
    function start() {
        interval = setInterval(function () {
            var i = circleObjects.length;
            while (i--) {
                _fade(circleObjects[i]);
            }
        }, animationSpeed);
    }

    /**
     * @function stop - stops the animation sequence
     * @memberOf fabric.Spinner
     */
    function stop() {
        clearInterval(interval);
    }

    //private methods

    function _init() {
        if (_spinnerType === "sixteen") {
            offsetSize = sixteenSize;
            numCircles = 16;
        } else {
            offsetSize = eightSize;
            numCircles = 8;
        }
        _createCirclesAndArrange();
        _initializeOpacities();
        start();
    }

    function _initializeOpacities() {
        var i = numCircles, j;
        while (i--) {
            j = circleObjects.length;
            while (j--) {
                _fade(circleObjects[j]);
            }
        }
    }

    function _fade(circleObject) {
        var opacity;
        if (circleObject.j < numCircles) {
            if (Math.floor(circleObject.j / (numCircles / 2))) {
                opacity = _getOpacity(circleObject.element) - 2 / numCircles;
            } else {
                opacity = _getOpacity(circleObject.element) + 2 / numCircles;
            }
        } else {
            circleObject.j = 0;
            opacity = 2 / numCircles;
        }
        _setOpacity(circleObject.element, opacity);
        circleObject.j++;
    }

    function _getOpacity(element) {
        return parseFloat(window.getComputedStyle(element).getPropertyValue("opacity"));
    }

    function _setOpacity(element, opacity) {
        element.style.opacity = opacity;
    }

    function _createCircle() {
        var circle = document.createElement('div');
        var parentWidth = parseInt(window.getComputedStyle(spinner).getPropertyValue("width"), 10);
        circle.className = "ms-Spinner-circle";
        circle.style.width = circle.style.height = parentWidth * offsetSize + "px";
        return circle;
    }

    function _createCirclesAndArrange() {
        spinner = document.createElement("div");
        spinner.className = "ms-Spinner";
        _holderElement.appendChild(spinner);
        var width = spinner.clientWidth;
        var height = spinner.clientHeight;
        var angle = 0;
        var offset = width * offsetSize;
        var step = (2 * Math.PI) / numCircles;
        var i = numCircles;
        var circleObject;
        var radius = (width - offset) * 0.5;
        while (i--) {
            var circle = _createCircle();
            var x = Math.round(width * 0.5 + radius * Math.cos(angle) - circle.clientWidth * 0.5) - offset * 0.5;
            var y = Math.round(height * 0.5 + radius * Math.sin(angle) - circle.clientHeight * 0.5) - offset * 0.5;
            spinner.appendChild(circle);
            circle.style.left = x + 'px';
            circle.style.top = y + 'px';
            angle += step;
            circleObject = { element: circle, j: i };
            circleObjects.push(circleObject);
        }
    }

    _init();

    return {
        start: start,
        stop: stop
    };
};

var spin16 = fabric.Spinner(jQuery("#spinner-16point")[0], "sixteen");
//spin16.start();
//spin16.stop();



// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE in the project root for license information.

/**
 * SearchBox Plugin
 *
 * Adds basic demonstration functionality to .ms-SearchBox components.
 *
 * @param  {jQuery Object}  One or more .ms-SearchBox components
 * @return {jQuery Object}  The same components (allows for chaining)
 */
(function ($) {
    $.fn.SearchBox = function () {

        /** Iterate through each text field provided. */
        return this.each(function () {
            // Set cancel to false
            var cancel = false;

            /** SearchBox focus - hide label and show cancel button */
            $(this).find('.ms-SearchBox-field').on('focus', function () {
                /** Hide the label on focus. */
                $(this).siblings('.ms-SearchBox-label').hide();
                // Show cancel button by adding is-active class
                $(this).parent('.ms-SearchBox').addClass('is-active');
            });


            // If cancel button is selected, change cancel value to true
            $(this).find('.ms-SearchBox-closeButton').on('mousedown', function () {
                cancel = true;
            });

            /** Show the label again when leaving the field. */
            $(this).find('.ms-SearchBox-field').on('blur', function () {

                // If cancel button is selected remove the text and show the label
                if (cancel == true) {
                    $(this).val('');
                    $(this).siblings('.ms-SearchBox-label').show();
                }

                // Remove is-active class - hides cancel button
                $(this).parent('.ms-SearchBox').removeClass('is-active');

                /** Only do this if no text was entered. */
                if ($(this).val().length === 0) {
                    $(this).siblings('.ms-SearchBox-label').show();
                }

                // Reset cancel to false
                cancel = false;
            });


        });

    };
})(jQuery);

if ($.fn.SearchBox) {
    $('.ms-SearchBox').SearchBox();
}
