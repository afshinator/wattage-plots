// app-kwh.js
//
var kwh = (function ($, my) {

    var INPUTFILE = "./data/plotwatt.csv";


    // App-wide global vars
    my.app = {
        // TODO: find domainMax dynamically
        domainMin   : 0,
        domainMax   : 270,
        // File data dictates this year range
        beginYear   : 2009,
        endYear     : 2011,
        // associative array that will hold the processed Data from file

    };


    function parseDateField(str) {
        return str.slice(1, 5) + '-' + str.slice(6, 8) + '-' + str.slice(9,11);
    }

    var keyFx = function(d) {
            return parseDateField(d[" Datetime Midpoint"]);
        };

    my.log.msg('AlwaysOn -- Heating & A/C -- Refrigeration -- Dryer -- Cooking -- Other:', false);

    //
    // Read in file, build and feed data to charts running totals for each column (appliance type)
    // 
    d3.csv(INPUTFILE, function(error, csv) {           // callback gets called with parsed rows
        var checkBounds = function(that, total, d) {
            if ( total > that.highest) {
                that.highest = total;
                that.highestDay = parseDateField(d[0][" Datetime Midpoint"]);
            }
        };

        var runSimpleDailyTotalChart = function(id, title, el, minVal, MaxVal, column) {
            var that;
            id = my.CalendarChart(title, el, minVal, MaxVal);
            that = id;
            id.parseData( keyFx, function(d) {  // generic rollup fx that adds all samples for specified column on this day
                var total = 0; var j;

                for (j = 0; j < d.length; j += 1) {
                    total += d[j][column] * 1;
                }
                checkBounds(that, total, d);
                // my.log.msg('-----===> '+total, false);
                return total;
            }, csv);
            id.populateChart().outputResults();
        };

        var totalUsage = my.CalendarChart("Total of all energy used per day", "#totalUsage", 0, 270);
        var that = totalUsage;
        totalUsage.parseData( keyFx, function(d) {
            // Summarizes all the leaf nodes in the nest - 
            // Since the key divides up the data by date, the leaf nodes are the (usually) 4 rows of data per day
            // This function adds up all the kwh used; d[0]-d[3] correspond to different readings on same day
                var total = 0;
                var j;

                for (j = 0; j < d.length; j += 1) {       // loop through all the data we have per day
                    if ( j === 0 ) {
                        my.log.msg(parseDateField(d[j][" Datetime Midpoint"]), true, "inverse");
                    }
                    my.log.msg(d[j]["# Always On"]+' '+d[j][" Heating & A/C"]+' '+d[j][" Refrigeration"]+' '+d[j][" Dryer"]+' '+d[j][" Cooking"]+' '+d[j][" Other"], false);
                    total += d[j]["# Always On"] *1         // multiply by 1 turns string into a number 
                            + d[j][" Heating & A/C"] *1
                            + d[j][" Refrigeration"] *1
                            + d[j][" Dryer"] *1
                            + d[j][" Cooking"] *1
                            + d[j][" Other"]*1;
                }

                // my.log.msg(d[0][" Datetime Midpoint"] + ' length of d ' + d.length + ' day total:'+total);
                checkBounds(that, total, d);
                return total;
        }, csv);

        totalUsage.populateChart().outputResults();

        // 
        // Now run the charts for totals of the different 'columns'
        var totalAlwaysOn;
        runSimpleDailyTotalChart(totalAlwaysOn, "Total of all samples per day of Always-On", '#totalAlwaysOn', 4.7, 15.95, "# Always On");

        var totalTempCtrl;
        runSimpleDailyTotalChart(totalTempCtrl, "Total of all samples per day for Heating & A/C", '#totalTemp', 0, 201, " Heating & A/C");

        var totalRefrig;
        runSimpleDailyTotalChart(totalRefrig, "Total of all samples per day for Refrigeration", '#totalFridge', 0, 11, " Refrigeration");

        var totalDryer;
        runSimpleDailyTotalChart(totalDryer, "Total of all samples per day for the Dryer", '#totalDryer', 0, 40, " Dryer");

        var totalCooking;
        runSimpleDailyTotalChart(totalCooking, "Total of all samples per day for Cooking", '#totalCook', 0, 26, " Cooking");

        var totalOther;
        runSimpleDailyTotalChart(totalOther, "Total of all samples per day for other electrical usage...", '#totalOther', 0, 13, " Other");

    });

// --------------------


    return my;
}(jQuery, kwh || {}));