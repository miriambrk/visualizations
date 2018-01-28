var svgWidth = 800;
var svgHeight = 700;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var xMin;
var xMax;
var yMax;
var yMin;

//this is how the axes match up;
var axisMatches =  {"poverty" : "alcohol", "citizen1" : "tobacco" , "citizen2" : "seatbelt" };


// Create an SVG wrapper, append an SVG group that will hold the chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = svg.append("g");

// Append a div to the body to create tooltips, assign it a class
d3.select(".chart")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.csv("data.csv", function(err, healthData) {
  if (err) throw err;

  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.alcohol = +data.alcohol;
    data.citizen1 = +data.citizen;
    data.citizen2 = +data.citizen;
    data.tobacco = +data.tobacco;
    data.seatbelt = +data.seatbelt;
    data.State = data.State;
    data.StateName = data.StateName;
  });


    // This function identifies the minimum and maximum values in a column in healthData.csv
    // and assign them to xMin and xMax variables, which will define the axis domain
    function findMinAndMax(dataColumnX, dataColumnY) {
      xMin = d3.min(healthData, function(data) {
        return +data[dataColumnX] * 0.8;
      });
      xMax = d3.max(healthData, function(data) {
        return +data[dataColumnX] * 1.1;
      });
      yMin = d3.min(healthData, function(data) {
        return +data[dataColumnY] * 0.8;
      });
      yMax = d3.max(healthData, function(data) {
        return +data[dataColumnY] * 1.1;
      });
    }

  // The default x and y-axis are 'poverty' and 'alcohol'
  // Another axis can be assigned to the variable during an onclick event.
  // This variable is key to the ability to change axis/data column
  var currentAxisLabelX = "poverty";
  var currentAxisLabelY = "alcohol";

  // Call findMinAndMax() with defaults
  findMinAndMax(currentAxisLabelX, currentAxisLabelY);

  // Create scale functions
  var yLinearScale = d3.scaleLinear()
    .range([height, 0]);

  var xLinearScale = d3.scaleLinear()
    .range([0, width]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Scale the domain
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([yMin, yMax]);

  //add the tool tip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    //.offset([80, -60])
    .offset([0,0])

    .html(function(data) {
      var stateName = data.StateName;
      console.log(stateName);
      //var stateInfo = data[currentAxisLabelX];
      if (currentAxisLabelX === "poverty") {
        var xString = "Poverty: " + +data.poverty;
        var yString = "Alcohol: " + +data.alcohol;
      }
      else if (currentAxisLabelX === "citizen1") {
          var yString = "Tobacco: " + +data.tobacco;
          var xString = "Citizen: " + +data.citizen1;
        }
        else {
          var yString = "Seatbelt: " + +data.seatbelt;
          var xString = "Citizen: " + +data.citizen2;
        }

      console.log("xString: " + xString + " YString: " + yString);
      return (stateName + "<br>" + xString + "<br>" + yString);
    });

  chart.call(toolTip);

  // create the circles
  chart.selectAll("circle")
    .data(healthData)
    .enter()
      .append("circle")
      .attr("cx", function(data, index) {
        return xLinearScale(+data[currentAxisLabelX]);
      })
      .attr("cy", function(data, index) {
        return yLinearScale(+data[currentAxisLabelY]);
      })
      .attr("r", "15")
      .attr("stroke","black")
      .attr("fill", "orchid")

      //on hover, show the tooltip
      .on("mouseover", function(data) {
        toolTip.show(data);
      })
      // onmouseout event hide the tooltip
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

  //add the state abbreviation into the circle text
  chart.selectAll("circle-text")
      .data(healthData)
      .enter()
      .append("text")
      .attr("class", "circle-text")
      .attr("x", function(data, index) { return xLinearScale(+data[currentAxisLabelX])})
      .attr("y", function(data, index) { return yLinearScale(+data[currentAxisLabelY]) +5 ; })
      .attr("dx", function(data){return -10})
      .text(function(data)  { return data.State})




  //append x axis
  chart.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class","x-axis") //used for transition
    .call(bottomAxis);

  //append y axis
  chart.append("g")
    .attr("class","y-axis")
    .call(leftAxis);

  //y-axis label; all y-axis labels will always be inactive. the only way to select an axis is through the x-axis
  // first y-axis is considered selected and bolded
  chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 1.5))  // make 1.5 smaller to get the axis title to move down a bit
      .attr("dy", "1em")
      .attr("class", "y-axis-text y-selected")
      //default
      .attr("data-axis-name", "alcohol")
      .text("Percent who Had an Alcholic Drink in the past 30 days")

  //append the unselected Y labels
  chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 1.7))  // make 1.5 smaller to get the axis title to move down a bit
      .attr("dy", "1em")
      .attr("class", "y-axis-text y-unselected")
      .attr("data-axis-name", "tobacco")
      .text("Percent Who Use Tobacco")
  chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 1.7))  // make 1.5 smaller to get the axis title to move down a bit
      .attr("dy", "1em")
      .attr("class", "y-axis-text y-unselected")
      .attr("data-axis-name", "seatbelt")
      .text("Percent Who Wear Seatbelts")


  // Append x-axis labels
  chart.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")") //make 2.5 larger to get title to move left
    .attr("class", "axis-text active")
    //default
    .attr("data-axis-name", "poverty")
    .text("Percent in Poverty")

    //append the inactive X labels
    chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
    )
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "citizen1")
    .text("Percent Who are US Citizens (vs tobacco use)")

    chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 60) + ")"
    )
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "citizen2")
    .text("Percent Who are US Citizens (vs seatbelt use)")

    // Change an x-axis's status from inactive to active when clicked (if it was inactive)
    // Change the status of all active axes to inactive otherwise
    // Y-axes are all inactive, but need to bold (select) the one that corresponds to the selected X axis
    function labelChange(clickedAxis, clickedY) {
      console.log("clickedAxis: " + clickedAxis.attr("data-axis-name"));
      console.log("clickedY: " + clickedY.attr("data-axis-name"));
      var corresponding_y = axisMatches[clickedAxis.attr("data-axis-name")];
      console.log("corresponding Y axis: " + corresponding_y);
      d3
        .selectAll(".axis-text")
        .filter(".active")
        // An alternative to .attr("class", <className>) method. Used to toggle classes.
        .classed("active", false)
        .classed("inactive", true);
      clickedAxis.classed("inactive", false).classed("active", true);

      // bold (select) the Y-axis that corresponds to the selected X axis
      d3
        .selectAll(".y-axis-text")
        .filter(".y-selected")
        .classed("y-selected", false)
        .classed("y-unselected", true);
      clickedY.classed("y-unselected", false).classed("y-selected", true);

    }

    //CLICKED X AXIS!!!
    d3.selectAll(".axis-text").on("click", function() {
    // Assign a variable to current axis
      var clickedSelection = d3.select(this);
      console.log("clickedSel: " + clickedSelection);

      // "true" or "false" based on whether the axis is currently selected
      var isClickedSelectionInactive = clickedSelection.classed("inactive");
      // console.log("this axis is inactive", isClickedSelectionInactive)
      // Grab the data-attribute of the axis and assign it to a variable
      // e.g. if data-axis-name is "poverty," var clickedAxis = "poverty"
      var clickedAxis = clickedSelection.attr("data-axis-name");
      console.log("current x axis: ", clickedAxis);

      // The onclick events below take place only if the x-axis is inactive
      // Clicking on an already active axis will therefore do nothing
      if (isClickedSelectionInactive) {
        // Assign the clicked axis to the variable currentAxisLabelX
        currentAxisLabelX = clickedAxis;
        currentAxisLabelY = axisMatches[currentAxisLabelX];

        console.log("currentAxisLabelY: " + currentAxisLabelY);

        //find min and max domain values
        findMinAndMax(currentAxisLabelX, currentAxisLabelY);

        // Set the domain for the x-axis
        xLinearScale.domain([xMin, xMax]);
        // Set the domain for the y-axis
        yLinearScale.domain([yMin, yMax]);

        // Create a transition effect for the x-axis and y-axis
        svg
          .select(".x-axis")
          .transition()
          .duration(1000)
          .call(bottomAxis);

        svg
          .select(".y-axis")
          .transition()
          .duration(1000)
          .call(leftAxis);

          //get the corresponding Y axis
          var selectedY = d3.select(  'text[data-axis-name="'+currentAxisLabelY+'"]'  );
          console.log("selY: "+selectedY);


        // Select all circles to create a transition effect, then relocate the horizontal and vertical location
        // based on the new axis that was selected/clicked
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()

            .attr("cx", function(data, index) {
              // console.log("currentAxisLabelX: " + currentAxisLabelX);
              // console.log("data[currentAxisLabelX] " + +data[currentAxisLabelX]);
              return xLinearScale(+data[currentAxisLabelX]);
            })

            .attr("cy", function(data, index) {
              return yLinearScale(+data[currentAxisLabelY]);
            })
            .duration(500);

        });


        //remove the old circle text data
        d3.selectAll(".circle-text").remove()

        //add circle text - state abbreviations
        chart.selectAll("circletext")
              .data(healthData)
              .enter()
              .append("text")
              .attr("class", "circle-text")
              .attr("x", function(data, index) { return xLinearScale(+data[currentAxisLabelX])})
              .attr("y", function(data, index) { return yLinearScale(+data[currentAxisLabelY]) +5 ; })
              .attr("dx", function(data){return -10})
              .text(function(data)  { return data.State})


        // Change the status of the axes. See above for more info on this function.
        labelChange(clickedSelection, selectedY);

      }
    });

});
