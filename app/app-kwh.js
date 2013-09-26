// app-kwh.js - Visualize the PlotWatt sample data file
//      by Afshin Mokhtari
//
// Data in PlotWatt sample file is read in & visualized in a variety of ways.
//
// Looking at the data I saw that it varied quite a bit based on time of year, so
// I chose to sum up the bulk of what I thought there is to be learned by displaying
// a calendar heat chart that shows total usage per day, over the range of the sample.
// 
// There are also calendar heat charts for totals per day broken down by appliance type.
// What is so nice about the breakdown by appliance type is that you can see stuff
// like the fact that they only cook on weekends! 
// 
// I also wanted to present which appliance type varied the most.  The stacked bar chart
// chart does a good job of that, as well as showing how temperature control in general
// dominates the variance in use.
//
// Last I wanted to show the relative variance in use of all appliances totals split up
// into the 4 sectors of the day from which we have data... but alas the normalized
// bar chart I made looked very ugly and wasn't actually too informative - so I axed it.
//


var kwh = (function ($, my) {                       // JQuery for Bootstraps Accordion widget, 'my' is appwide global var.

    // Module-wide global vars
    var INPUTFILE = "./data/plotwatt.csv";            // PlotWatt input file

    var inputfileData;                              // will point to file data once read in
    var parse = d3.time.format( "%Y-%m-%d" ).parse;

    // App-wide global vars (my variable spans modules) 
    // my.app = { };  // None at this point...


    // Main object that holds plotwatt specific info... and runs the charts.
    var runCharts = (function() {
        var init = function() {
            // Nothing at this time
            return this;
        };

        // doPlotWattTest1() - Show just one Cal Heat Chart, for quick checks...
        var doPlotWattTest1 = function() {
            var totalUsage = new my.CalHeatChart( "body", 960, 68 , 8, "Totals of all usage, per day" );    // different size than rest
            var totalUsageData = prepareCHCData( keyFxDate, inputfileData );   // no third parameter to prepareCHCData() means totals all cols
            totalUsage.setData( totalUsageData ).renderChart();
        };


        // doPlotWatt()
        // Do all the things we want to do that are specific to PlotWatt sample file 
        // Called after reading in the file, make a bunch of charts to visualize the data
        var doPlotWatt = function() {
            var width     = 960,    // Try these other sizes:
                height    = 91; //  68; // 136;     // height & cellSize for Calendar heat charts
                cellSize  = 11; // 8; // 17; 

            var sbChart;        // Stacked Bar Chart, built after Cal Heat Chart
            var cols;           // data for Stacked Bar Chart


            // Wrapper fx with some defaults for a 'standard' Cal Heat Chart
            function standardCHChart( title ) {
                return new my.CalHeatChart( "body", width, height, cellSize, title );
            }


            // Process data & get it ready for a Stacked Bar Chart,
            // relies on CHChart data already being processed
            function prepareSBCData() {
                var allTotals = [];

                // For each day, pluck the totals for each appliance type (column), put in array
                for (var day in aoUsageData) {      // assert: length of all UsageData variables should be the same
                    if ( aoUsageData.hasOwnProperty(day) ) {
                        allTotals.push( {
                            date: day,
                            alwaysOn : aoUsageData[day],
                            tempCtrl: tUsageData[day],
                            fridge: fridgUsageData[day],
                            dryer: dUsageData[day],
                            cooking: cUsageData[day],
                            other: otherUsageData[day]
                        });
                    }
                }

                // Transpose the data into layers by columns
                cols = d3.layout.stack()(["alwaysOn", "cooking", "dryer", "fridge", "other", "tempCtrl"].map( function( col ) {
                    return allTotals.map( function(d) {
                        return { x: parse( d.date ), y: +d[col] };
                    });
                }));
            }


            // Do 'Total of all Appliances' Chart a little different than the rest, make it bigger
            var totalUsage = new my.CalHeatChart( "#dailyTotals", width, 136 , 17, "Totals of all usage, per day" );    // different size than rest
            var totalUsageData = prepareCHCData( keyFxDate, inputfileData );   // no third parameter to prepareCHCData() means totals all cols
            totalUsage.setData( totalUsageData ).renderChart();

            $("body")
                .append("<hr><p>Below are daily totals by each appliance type (column from file):</p>");

            // Daily Total of Appliances Always On
            var totalAlwaysOn = standardCHChart( 'Things "Always On"' );
            var aoUsageData = prepareCHCData( keyFxDate, inputfileData, "# Always On" );
            totalAlwaysOn.setData( aoUsageData ).renderChart();

            // Daily Total of Heating & A/C
            var totalTempCtrl = standardCHChart( "Heating and Air Conditioning" );
            var tUsageData = prepareCHCData( keyFxDate, inputfileData, " Heating & A/C" );
            totalTempCtrl.setData( tUsageData ).renderChart();

            // Daily Total of Refridge..
            var totalFridge = standardCHChart( "Refrigeration" );
            var fridgUsageData = prepareCHCData( keyFxDate, inputfileData, " Refrigeration" );
            totalFridge.setData( fridgUsageData ).renderChart();

            // Daily Total of Dryer
            var totalD = standardCHChart( "Dryer" );
            var dUsageData = prepareCHCData( keyFxDate, inputfileData, " Dryer" );
            totalD.setData( dUsageData ).renderChart();

            // Daily Total of Cooking
            var totalC = standardCHChart( "Cooking" );
            var cUsageData = prepareCHCData( keyFxDate, inputfileData, " Cooking" );
            totalC.setData( cUsageData ).renderChart();

            // Daily Total of Other
            var totalO = standardCHChart( "Other" );
            var otherUsageData = prepareCHCData( keyFxDate, inputfileData, " Other" );
            totalO.setData( otherUsageData ).renderChart();

            // Now totals for all columns have been computed & stored, we can easily build
            // a data structure that is easy for the Stacked Bar Chart to chew on.
            prepareSBCData();

            var sbChartOptions = {
                    colScheme : ["#ffffcc", "#29020c", "#fed976", "#800026", "#e31a1c", "#fd8d3c" ],
                    categories: ["Always On", "Cooking", "Dryer", "Fridge", "Other", "Heater, A/C"]
                };

            sbChart = new my.StackedBarChart( "#stackedBarChart", width, 593, "Stacked Bar", sbChartOptions );
            sbChart.setData( cols );
            sbChart.renderData();
        };

        return {
            init : init,
            test1 : doPlotWattTest1,
            plotWatt : doPlotWatt
        };
    })();



    // 'rollup' & 'key' functions are used for D3's nest methods, which are used in processing the data
    // These are dependant on the datafile, so they're all kept in this module.

    // keyFxDate() - Returns the date part of the " Datetime Midpoint" column data
    //          Used to create the key value in nest data struct 
    var keyFxDate = function(d) { return ( d[" Datetime Midpoint"] ).slice(1,11); };


    // Process raw csv data.  Returns an associative array keyed off keyFx parameter (date column in PlotWatt sample file case)
    // Last arg tells it what column to add up, if arg is not specified it adds all of them!
    function prepareCHCData( keyFx, rawData, column ) {

        // 'rollup' fx - dailyTotals() - Returns kwh usage of one days readings total
        var dailyTotals = function(d) {
            // Summarizes all the leaf nodes in the D3 nest - each leaf is 1 reading in a day, usually 4 of them in a day
            var total = 0;
            
            // d[0]-d[3] correspond to different readings on same day; iterate over them adding up 
            for (var j = 0, len = d.length; j < len; j += 1) {
                if ( column ) {
                    total += d[j][column] * 1;      // multiply by 1 turns string into a number 
                }
                else {     // there was no column arg specified, assume all
                    for ( var col in d[j] ) {
                        if ( col !== " Datetime Midpoint" ) {
                            total +=  ( d[j][col] * 1 );
                        }
                    }
                }
            }

            if ( ! column ) {   // Output daily totals to log only when processing all columns
                if ( len < 4 ) {
                    my.log.msg( 'Warning - incomplete or inconsistent data on following day:', false, "warning" );
                }
                my.log.msg( (d[0][" Datetime Midpoint"]).slice(1,11) + ' --  total kwh usage :  ' + d3.round( total, 2 ) , true);
            }
            return total;
        };

        return d3.nest()
                .key( keyFx )        // Defines the key for key-val pairs in new data structure
                .rollup( dailyTotals )  // Defines the values for key-val pairs in new data structure
                .map( rawData );     // rawData should be the unprocessed data from csv file.
    }


    my.log.msg('Scroll all the way down to see if there were any errors or warnings...', false, "inverse");

    // Read in file, 
    d3.csv( INPUTFILE, function(error, csv) {
        if ( error === null ) {
            // inside this context, csv is finished reading in, we're ready to chart

            my.log.msg('File ' + INPUTFILE + ' was successfully read in.', false, "info");

            // my.inputfileData = csv;    // app-wide access to data
            inputfileData = csv;        // Store, give module-wide access to file data

            runCharts.init()            // .test1();
                    .plotWatt();        // Run whole sequence of charts we want to display


            my.init_ToTopButton();

        }
        else {
            $('#collapseOne').collapse('show');     // Pop open the Daily Total/Error Reports collapsible panel

            my.log.msg('Error ' + error + ', reading in : ' + INPUTFILE, false, "warning");
            my.log.msg('If you are using Chrome or IE,' , false, "info");
            my.log.msg('this little web app is best run when the pages are served from a web server,' , false, "info");
            my.log.msg('rather than index.hmtl straight from the directory on your computer into the browser.' , false, "info");
            my.log.msg('Firefox will allow it, but its a violation of the "cross origin policy".' , false, "info");
        }
    });


    return my;
}(jQuery, kwh || {}));