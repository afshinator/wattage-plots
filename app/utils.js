// utils.js



var kwh = (function ($, my) {

    // 
    // Wrap txt with a <span> for Bootstrap class that format the text nicely
    // see http://twitter.github.io/bootstrap/components.html#labels-badges
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

        function message(msg, bWarn, bIncrement) {
            var count = -1;

            if (typeof bIncrement === "undefined" || bIncrement === null ) {    // default is true
                bIncrement = true;
            }

            bWarn = bWarn || false;             // default is that this is not a warning message

            if ( bIncrement === true ) {
                count = ( count$.text() ) * 1;  // multiply casts it to number
                count += 1;
                count$.text(count);

                msg = '<strong>Data item ' + count + '</strong> : ' + msg;
            }

            if ( bWarn === true ) {
                msg = my.label("warning", msg);
            } else {
                /*
                if ( bIncrement === true ) {
                    msg = my.label("success", msg);
                }
                */
            }

            msg = '<p>' + msg + '</p>';

            txt$.append(msg);


        }

        return {
            msg : message
        };

    }();






    return my;
}(jQuery, kwh || {}));