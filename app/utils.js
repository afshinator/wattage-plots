// utils.js - Afshin Mokhtari
//
// requires JQuery



var kwh = (function ($, my) {

    // 
    // Wrap txt with a <span> for Bootstrap class that format the text nicely
    // see http://getbootstrap.com/2.3.2/components.html#labels-badges
    // Assumes: logging system is up.
    my.label = function(label, txt) {
        var wrappedTxt = '<span class="label';
        label = label || "default";

        switch(label) {
            case "default":
                wrappedTxt += '">';                 break;
            case "success":
                wrappedTxt += ' label-success">';   break;
            case "warning":
                wrappedTxt += ' label-warning">';   break;
            case "important":
                wrappedTxt += ' label-important">'; break;
            case "error":
                wrappedTxt += ' label-important">'; break;
            case "info":
                wrappedTxt += ' label-info">';      break;
            case "inverse":
                wrappedTxt += ' label-inverse">';   break;

            default: // error case - just gonna return the text without wrapping
                return txt;
        }

        wrappedTxt += txt;
        wrappedTxt += '</span>';

        return wrappedTxt;
    };



    // my.log() --
    //
    my.log = function() {
        var accordion$  = $('#accordion2'); // The Log parent element
        var txt$        = accordion$.find("#logContent");
        var a$          = accordion$.find("a:first");
        var active$     = accordion$.find("#collapseOne");
        var count$      = accordion$.find(".log-stats:eq(0) span");

        function message(msg, bIncrement, wrapStr) {
            var count = -1;

            if (typeof bIncrement === "undefined" || bIncrement === null ) {    // default is true
                bIncrement = true;
            }


            if ( bIncrement === true ) {
                count = ( count$.text() ) * 1;  // multiply casts it to number
                count += 1;
                count$.text(count);
            }

            if ( wrapStr ) {
                msg = my.label(wrapStr, msg);
            }

            msg = '<p>' + msg + '</p>';

            txt$.append(msg);
        }

        return {
            msg : message
        };

    }();


    // http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
    // Create a new instance of the superclass and make the subclass prototype point to it.
    // Call in constructor method, after apply(this, args) call to superclass 
    my.inheritPrototype = function(childObj, parentObj) {
        // Crockford’s style to copy properties & methods from the parent onto the child
 
        // copyOfParent object gets everything the parentObject has 
        var copyOfParent = Object.create(parentObj.prototype);

        // Then we set the childObject prototype to copyOfParent, so that the childObject can in turn inherit everything from copyOfParent (from parentObject)
        childObj.prototype = copyOfParent;
    };



    // http://www.developerdrive.com/2013/07/using-jquery-to-add-a-dynamic-back-to-top-floating-button-with-smooth-scroll/
    // Adds a nicely animated To Top button to the page.
    // Requires JQuery
    my.init_ToTopButton = function() {
        var offset = 220;
        var duration = 500;

        $('body').append('<a href="#" class="back-to-top">Back to Top</a>');
        $(window).scroll(function() {
            if ($(this).scrollTop() > offset) {
                $('.back-to-top').fadeIn(duration);
            } else {
                $('.back-to-top').fadeOut(duration);
            }
        });
        
        $('.back-to-top').click(function(event) {
            event.preventDefault();
            $('html, body').animate({scrollTop: 0}, duration);
            return false;
        });
    };

    return my;
}(jQuery, kwh || {}));