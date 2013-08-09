// app-kwh.js

var kwh = (function ($, my) {

    var width     = 960,
        height    = 136; // 68; // 136,
        cellSize  = 17; // 8; // 17; // cell size


    var day     = d3.time.format("%w"),
        week    = d3.time.format("%U"),
        format  = d3.time.format("%Y-%m-%d");


    // Create a scale with a discrete (rather than continuous) range so we can map input to
    // a relatively small number of color options.
    var color = d3.scale.quantize()
        .domain([0, 290])                                 // TODO: domain hardcoded
        .range(d3.range(11).map(function(d) {             // map domain to one of 11 possible css color values
            my.log.msg('{color} d = ' + d + '::', false, false);       // output ranges to html here?
            return "q" + d + "-11";
        }));



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

    var alwaysOn = d3.select("#alwaysOn")
        .selectAll("svg")
        .data(d3.range(2009, 2011))                 // TODO: date range hardcoded
      .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
      .append("g")                      // g element is a container used to group objects in svg
  //      .attr("transform", "translate(" + (59 / 2) + "," + 16 + ")");
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");


    // Put year text on the left side of calendar
    alwaysOn.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

    var rect2 = alwaysOn.selectAll(".day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return week(d) * cellSize; })
        .attr("y", function(d) { return day(d) * cellSize; })
        .datum(format);


    // Append the mouse-over title for each little box which represents a day
    rect2.append("title")
        .text(function(d) { return d; });


    // Add the month outlines
    alwaysOn.selectAll(".month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);



    var totalUsage = d3.select("#totalUsage")
        .selectAll("svg")
        .data(d3.range(2009, 2011))                 // TODO: date range hardcoded
      .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
      .append("g")                      // g element is a container used to group objects in svg
  //      .attr("transform", "translate(" + (59 / 2) + "," + 16 + ")");
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");


    // Put year text on the left side of calendar
    totalUsage.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });


    var rect = totalUsage.selectAll(".day")
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
    totalUsage.selectAll(".month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);


    d3.csv("plotwatt.csv", function(error, csv) {           // callback gets called with parsed rows
      var data = d3.nest()
        .key(function(d) {
        // the key is what is used to index the associate array that is going to be created
            var original = d[" Datetime Midpoint"];
            var parsedDate = original.slice(1, 5) + '-' + original.slice(6, 8) + '-' + original.slice(9,11);
         //   console.log(original + '---' + parsedDate);
            return parsedDate;
        })
        .rollup( function(d) {
        // Summarizes all the leaf nodes in the nest - 
        // Since the key divides up the data by date, the leaf nodes are the (usually) 4 rows of data per day
        // This functiono adds up all the kwh used; d[0]-d[3] correspond to different readings on same day
          var total = 0;
          var j;

          for (j = 0; j < d.length; j += 1) {       // loop through all the data we have per day
            total += d[j]["# Always On"] *1         // multiply by 1 turns string into a number 
                    + d[j][" Heating & A/C"] *1
                    + d[j][" Refrigeration"] *1
                    + d[j][" Dryer"] *1
                    + d[j][" Cooking"] *1
                    + d[j][" Other"]*1;
          }

          // my.log.msg(d[0][" Datetime Midpoint"] + ' length of d ' + d.length + ' day total:'+total);

          return total;
        })
        .map(csv);    // we now have an associative array indexed by date, referencing the total kwh on that day

        d3.select("body").append("p").text('add something here');

        //my.log.msg(d3.max(data.filter(function(d) { return d in data; })), true, false);
        var allofem = [];
        var aday;
        j = 0;
        for (aday in data) {
           if ( data.hasOwnProperty(aday) ) {
              allofem[j] = data[aday];
              j += 1;
            }
        }

        my.log.msg( 'Max total usage : ' + d3.max(allofem), true, false );

        rect.filter(function(d) { return d in data; })
          .attr("class", function(d) {      // set the class on the box based on value of rollup function above
              // d is a date, data[d] is a value somewhere between 0 and 300ish
              my.log.msg( d + ' : ' + d3.round(data[d]) + ' --> ' + color(data[d]) );
              return "day " + color(d3.round(data[d]));
              })
          .select("title")
          .text(function(d) { return d + ": " + d3.round(data[d]); });   // set the svg title tag which becomes the mouseover text
    });


    return my;
}(jQuery, kwh || {}));