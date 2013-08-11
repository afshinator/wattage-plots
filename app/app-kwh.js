// app-kwh.js
//
var kwh = (function ($, my) {

    var INPUTFILE = "plotwatt.csv";


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


    // This module/file global vars
    var width     = 960,
        height    = 136; // 68; // 136,
        cellSize  = 17; // 8; // 17; // cell size

    var day     = d3.time.format("%w"),
        week    = d3.time.format("%U"),
        format  = d3.time.format("%Y-%m-%d");


    // Used to draw svg path
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
    }


    // The Main chart object - 
    // Each new instance will have its own domain, range, color fx, ...
    //
    my.chart = function(title, el, domainMin, domainMax) {
        var desc = title;
        var data = {};
        // Create a scale with a discrete (rather than continuous) range so we can map input to
        // a relatively small number of color options.  The range is one of 11 possible color values.
        var color = d3.scale.quantize()
            .domain([domainMin, domainMax])
            .range(d3.range(11).map(function(d) {             // map domain to one of 11 possible css color values
               //  my.log.msg('{color} d = ' + d + '::');       // output ranges to html here?
                return "q" + d + "-11";
            }));

        var rect;
        var min = domainMin;
        var max = domainMax;

        var svg = d3.select(el)
            .selectAll("svg")
            .data(d3.range(my.app.beginYear, my.app.endYear))
            .enter()
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "RdYlGn")
            .append("g")
                .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
        
        // Put year label to the left side of calendar, rotated 90 degress counter-clockwise
        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        // the grid outline of month & days
        rect = svg.selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return week(d) * cellSize; })
            .attr("y", function(d) { return day(d) * cellSize; })
            .datum(format);

        // Append the mouse-over title for each little box which represents a day
        rect.append("title")
            .text(function(d) { return d; });

        // Add the month outlines
        svg.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("path")
            .attr("class", "month")
            .attr("d", monthPath);


        // called by the callback function that is triggered after reading the file
        function parseData( keyFx, rollupFx, csv ) {
            data = d3.nest()
                .key( keyFx )        // key is what is used ex the associative array that is going to be created
                .rollup( rollupFx )  // Summarizes all the leaf nodes in the nest
                .map( csv );
        }


        // call from callback fx after file read is read in & parsed
        function populateChart() {
            rect.filter(function(d) { return d in data; })
                // set the class on the box based on value of rollup function above        
                .attr("class", function(d) {
                  // d is a date, data[d] is a value somewhere between 0 and 300ish
                  //my.log.msg( d + ' : ' + d3.round(data[d]) + ' --> ' + color(data[d]));
                  return "day " + color(d3.round(data[d]));
                  })
              .select("title")
              .text(function(d) { return d + ": " + d3.round(data[d]); });   // set the svg title tag which becomes the mouseover text
        }


        return {
            color   : color,            // fx that will return one of 11 classes to be applied to each day box
            desc    : desc,
            dmin    : domainMin,        // used to instantiate each chart, needed for color fx
            dmax    : domainMax,        // same as above
            data    : data,             // will hold the associative array that represents data read in
            svg     : svg,              // for D3
            rect    : rect,             // for D3
            parseData : parseData,
            populateChart : populateChart
        };

    };


    /*
     * Main Program Execution
     *
     */

    function parseDateField(str) {
        return str.slice(1, 5) + '-' + str.slice(6, 8) + '-' + str.slice(9,11);
    }

    var keyFx = function(d) {
            return parseDateField(d[" Datetime Midpoint"]);
        };

    d3.csv(INPUTFILE, function(error, csv) {           // callback gets called with parsed rows
        var highest = 0;
        var highestDay;         // string; will be what day had the highest total usage

        var totalUsage = my.chart("Total of all energy used per day", "#totalUsage", 0, 270);

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

                if ( total > highest) {
                    highest = total;
                    highestDay = parseDateField(d[0][" Datetime Midpoint"]);
                }

                return total;
        }, csv);

        d3.select("#totalUsage").append("p").text('------ Max total usage : ' + highest + ' on ' + highestDay);

        my.log.msg( '------ Max total usage : ' + highest + ' on ' + highestDay, false, "info" );
        totalUsage.populateChart();
    });

// --------------------


    return my;
}(jQuery, kwh || {}));