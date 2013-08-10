// app-kwh.js
//
var kwh = (function ($, my) {

    // App-wide global vars
    my.app = {
        // TODO: find domainMax dynamically
        domainMin   : 0,
        domainMax   : 290,
        // File data dictates this year range
        beginYear   : 2009,
        endYear     : 2011,
        // associative array that will hold the processed Data from file

    };

    // This module/file global vars
    var INPUTFILE = "plotwatt.csv";

    var width     = 960,
        height    = 136; // 68; // 136,
        cellSize  = 17; // 8; // 17; // cell size


    var day     = d3.time.format("%w"),
        week    = d3.time.format("%U"),
        format  = d3.time.format("%Y-%m-%d");



    my.Chart = function(title, el, domainMin, domainMax) {
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
        var min = domainMain;
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


        function parseData( keyFx, rollupFx, csv ) {
            data = d3.nest()
                .key( keyFx(d) )
                .rollup( rollupFx(d) )
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
            color   : color,
            desc    : desc,
            dmin    : domainMin,
            dmax    : domainMax,
            data    : data,
            svg     : svg,
            rect    : rect,
            parseData : parseData,
            populateChart : populateChart
        };

    };


    my.data = {
        dailyTotals : {},   // holds associative array indexed by date
        dailyAlwaysOn   : {}
    };




    // Create a scale with a discrete (rather than continuous) range so we can map input to
    // a relatively small number of color options.  The range is one of 11 possible color values.
    var color = d3.scale.quantize()
        .domain([my.app.domainMin, my.app.domainMax])                                 // TODO: domain hardcoded
        .range(d3.range(11).map(function(d) {             // map domain to one of 11 possible css color values
           //  my.log.msg('{color} d = ' + d + '::');       // output ranges to html here?
            return "q" + d + "-11";
        }));



    var totalUsage =  initChart("#totalUsage", width, height);
    var rect1 = drawChart(totalUsage);

    var totalAlwaysOn =  initChart("#alwaysOn", width, height);
    var rect2 = drawChart(totalAlwaysOn);

    dataFromFile();


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




    // Draw the initial grid of the calendar chart
    function initChart(el, width, height) {
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

        return svg;
    }


    // Set it up to draw individual days and outline the months
    function drawChart(svg) {
        // the grid outline of month & days
        var rect = svg.selectAll(".day")
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

        return rect;
    }



    // called in callback from file read in
    function populateChart(rect, data) {
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



    function parseDateField(str) {
        return str.slice(1, 5) + '-' + str.slice(6, 8) + '-' + str.slice(9,11);
    }



    function dataFromFile() {
        d3.csv(INPUTFILE, function(error, csv) {           // callback gets called with parsed rows
            var highest = 0;
            var highestDay;         // string; will be what day had the highest total usage

          my.data.dailyTotals = d3.nest()
            .key(function(d) {
            // the key is what is used to index the associate array that is going to be created
              //  var original = d[" Datetime Midpoint"];
             //   var parsedDate = original.slice(1, 5) + '-' + original.slice(6, 8) + '-' + original.slice(9,11);
             //   console.log(original + '---' + parsedDate);
                return parseDateField(d[" Datetime Midpoint"]);
            })
            .rollup( function(d) {
            // Summarizes all the leaf nodes in the nest - 
            // Since the key divides up the data by date, the leaf nodes are the (usually) 4 rows of data per day
            // This function adds up all the kwh used; d[0]-d[3] correspond to different readings on same day
                var total = 0;
                var j;

                for (j = 0; j < d.length; j += 1) {       // loop through all the data we have per day
                    if ( j === 0 ) {
                        my.log.msg(parseDateField(d[j][" Datetime Midpoint"]), true, "inverse");
                    }
                    my.log.msg(d[j]["# Always On"]+d[j][" Heating & A/C"]+d[j][" Refrigeration"]+d[j][" Dryer"]+d[j][" Cooking"]+d[j][" Other"], false);
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
            })
            .map(csv);    // we now have an associative array indexed by date, referencing the total kwh on that day

            d3.select("body").append("p").text('add something here');
            my.log.msg( '------ Max total usage : ' + highest + ' on ' + highestDay, false, "info" );


            // extract the total values out of associative array into plain array to be able
            // to use functions like d3.max, ...
            var allofem = [];
            var aday;
            j = 0;
            for (aday in my.data.dailyTotals) {
               if ( my.data.dailyTotals.hasOwnProperty(aday) ) {
                  allofem[j] = my.data.dailyTotals[aday];
                  j += 1;
                }
            }

            // my.log.msg( '------ Max total usage : ' + d3.max(allofem) );
            populateChart(rect1, my.data.dailyTotals);



            highest = 0;
            my.data.dailyAlwaysOn = d3.nest()
                .key(function(d) {
                    return parseDateField(d[" Datetime Midpoint"]);     // as above
                })
                .rollup( function(d) {
                    var total = 0;
                    var j;

                    for (j = 0; j < d.length; j += 1) {
                        total += d[j]["# Always On"] * 1;
                    }

                    if ( total > highest ) {                 // to note highest usage day
                        highest = total;
                        highestDay = parseDateField(d[0][" Datetime Midpoint"]);
                    }

                    return total;
                })
                .map(csv);

            my.log.msg( '------ Max usage for "Always On" : ' + highest + ' on ' + highestDay, false, "warning" );
            populateChart(rect2, my.data.dailyAlwaysOn);

        });
    }





    return my;
}(jQuery, kwh || {}));