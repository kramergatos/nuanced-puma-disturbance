var graphs = function (x) {
  var g = {}
  g.data = x
  g.gDebug = true
  g.existinggraphTypes = []
  g.graphMargins = {
      top: 10,
      left: 45,
      right: 45,
      bottom: 30
  }
  g.now = new Date()
  g.lastDate = -1
  g.minutesSinceLastUpdate = null
  g.colors = ['#6200ea', '#ff6d00', '#B7295A', '#1565c0', '#64ffda', '#ffd600', '#18ffff', '#d50000', '#00acc1', '#444444']
  g.statusColors = ['#d50000', '#ff6d00', '#64ffda']
  g.svgWidth = 400
  g.svgHeight = (g.svgWidth * 0.6)
  g.getMinutesSinceLastUpdate = function () {
    // format date before processing
    g.lastDate = new Date(g.lastDate)
    var diffMs = (g.now - g.lastDate) // milliseconds between now & last date
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000) // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000) // minutes
    var diff = ''
    if (diffDays > 0) {
      diff += diffDays + ' days, '
    }
    if (diffHrs > 0) {
      diff += diffHrs + ' hours, '
    }
    diff += diffMins + ' minutes'
    if (g.gDebug) { console.log('g.getMinutesSinceLastUpdate @lastDate=' + g.lastDate + ' @now=' + g.now + ' @diff=' + diff) }
    return diff
  }
  g.setLastUpdatedDate = function (index) {
    if (g.data[index].results[0].timestamp != undefined && g.data[index].results[0].timestamp != null) {
      if (g.isLargerDate(g.data[index].results[g.data[index].results.length - 1].timestamp)) {
        g.lastDate = g.data[index].results[g.data[index].results.length - 1].timestamp
      }
    }
  }
  g.isLargerDate = function (d) {
    g.lastDate = new Date(g.lastDate)
    d = new Date(d)
    if (d > g.lastDate) {
      if (g.gDebug) { console.log('g.isLargerDate @result=T'); }
      return true
    } else {
      if (g.gDebug) { console.log('g.isLargerDate @result=F'); }
      return false
    }
  }
  g.get3xxCount = function (index) {
    var values = g.data[index].results.map(function (d) { return parseInt(d.StackedBar3Value) }),
      reducer = function (accumulator, currentValue) {
        return accumulator + currentValue
      },
      sum = values.reduce(reducer)
    if (g.gDebug) { console.log('g.get3xxCount @sum=' + sum) }
    return sum
  }
  g.createPieGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createPieGraph @graphID=' + index) }
    g.data[index].config.totalCount = 0
    g.data[index].config.html = '<div class="graph-title">'+g.data[index].graphTitle+'</div><svg class="graph"></svg><div class="graph-legend graph-legend-pie"></div>'
    g.data[index].config.radius = Math.min(g.svgWidth, g.svgHeight) / 2
    g.data[index].config.colors = d3.scaleOrdinal()
      .range(g.colors)
    g.data[index].config.arc = d3.arc()
      .outerRadius(g.data[index].config.radius)
      .innerRadius(g.data[index].config.radius * 0.4)
    g.data[index].config.pie = d3.pie()
      .sort(null)
      .startAngle(1.1 * Math.PI)
      .endAngle(3.1 * Math.PI)
      .value(function (d) { return d.Value; })
    // Add svg to page
    $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth)
    // Add pie graph to svg
    var graph = d3.select('.graph' + index + ' .graph')
      .attr('width', g.svgWidth)
      .attr('height', g.svgHeight)
    graph.append('g')
      .attr("transform", "translate(" + (g.svgWidth / 2) + "," + (g.svgHeight / 2) + ")")
      .selectAll(".arc")
      .data(g.data[index].config.pie(g.data[index].results))
      .enter()
      .append("path")
      .style("fill", function (d, i) { return g.data[index].config.colors(i) })
      // Animations
      .transition()
      .delay(function (d, i) {
        return i * 300
      }).duration(300)
      .attrTween('d', function (d) {
        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function (t) {
          d.endAngle = i(t)
          return g.data[index].config.arc(d)
        }
      })
    g.createLegend(index, resultIndex)
    return
  }
  g.generateFunnelCoords = function (index) {
    var coords = []
    // Original Corners of 1st bar
    //{ x: 0, y: 0 },{ x: 500, y: 0 },{ x: 475, y: 70 },{ x: 25, y: 70 }
    // Rounded Corners
    var coordsTopLeft = [{ x: 0, y: 10 }, { x: 0, y: 9 }, { x: 0, y: 8 }, { x: 1, y: 5 }, { x: 3, y: 3 }, { x: 4, y: 2 }, { x: 6, y: 1 }, { x: 10, y: 0 }]
    var coordsTopRight = [{ x: 490, y: 0 }, { x: 494, y: 1 }, { x: 496, y: 2 }, { x: 497, y: 3 }, { x: 499, y: 5 }, { x: 500, y: 8 }, { x: 500, y: 9 }, { x: 500, y: 10 }]
    var coordsBottomRight = [{ x: 485, y: 65 }, { x: 483, y: 70 }, { x: 480, y: 74 }, { x: 478, y: 76 }, { x: 476, y: 78 }, { x: 474, y: 79 }, { x: 471, y: 80 }, { x: 470, y: 80 }]
    var coordsBottomLeft = [{ x: 25, y: 80 }, { x: 23, y: 80 }, { x: 20, y: 79 }, { x: 18, y: 78 }, { x: 16, y: 76 }, { x: 14, y: 74 }, { x: 11, y: 70 }, { x: 10, y: 65 }]
    var origScale = 500
    var scale = g.svgWidth / origScale
    for (var i = 0; i < 6; i++) {
      var set = []
      coordsTopLeft.forEach(function (element) {
        //diff = x: +25, y: +120
        set.push({ x: ((element.x + (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) })
      })
      coordsTopRight.forEach(function (element) {
        //diff = x: -25, y: +120
        set.push({ x: ((element.x - (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) })
      })
      coordsBottomRight.forEach(function (element) {
        //diff = x: -25, y: +120
        set.push({ x: ((element.x - (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) })
      })
      coordsBottomLeft.forEach(function (element) {
        //diff = x: +25, y: +120
        set.push({ x: ((element.x + (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) })
      })
      coords.push(set)
    }
    if (g.gDebug) {
      console.log('g.generateFunnelCoords @graphID=' + index + ' @coords=');
      console.log(coords)
    }
    return coords
  }
  g.createFunnelGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createFunnelGraph @graphID=' + index) }
    // Trapezoid shape coordinates
    g.data[index].config.points = g.generateFunnelCoords(index)
    // More config
    g.data[index].config.html = '<div class="graph-title">'+g.data[index].graphTitle+'</div><svg class="graph"></svg>'
    g.data[index].config.line = d3.line()
      .x(function (d) { return d.x; })
      .y(function (d) { return d.y; })
    // Add svg to page
    var graph
    $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth)
    // Calculate svg height based on number of funnel bars * funnel bar height
    g.data[index].config.graphHeight = g.data[index].results.length * (g.data[index].config.points[1][6].y - g.data[index].config.points[0][6].y)
    if (g.gDebug) { console.log('@numBars=' + g.data[index].results.length + ' @2ndBarTop=' + g.data[index].config.points[1][21].y + ' @1stBarTop=' + g.data[index].config.points[0][6].y + ' @svgHeight=' + g.svgHeight) }
    // Add graph to svg
    graph = d3.select('.graph' + index + ' .graph')
      .attr('width', g.svgWidth)
      .attr('height', g.data[index].config.graphHeight)
      .append('g')
      .attr('transform', 'translate(0,0)')
    for (var i = 0; i < g.data[index].results.length; i++) {
      // Add trapezoid to graph
      graph.append('path')
        .style("fill", g.colors[i])
        .style("stroke", "none")
        .attr("d", g.data[index].config.line(g.data[index].config.points[i]) + 'Z')
      // Add title text
      graph.append('text')
        .attr("x", ((((g.data[index].config.points[i][8].x - g.data[index].config.points[i][0].x) - (g.data[index].results[i].Label.length * 5)) / 2)) + g.data[index].config.points[i][0].x)
        .attr("y", (g.data[index].config.points[i][0].y + 10))
        .attr("class", "funnel-title")
        .text(g.data[index].results[i].Label)
      // Add percentage text
      if (parseInt(g.data[index].results[i].Percent) !== -1) {
        if (g.data[index].results[i].Percent == null || g.data[index].results[i].Percent == '') {
          g.data[index].results[i].Percent = 0
        }
        graph.append('text')
          .attr("x", (g.data[index].config.points[i][0].x + 15))
          .attr("y", (g.data[index].config.points[i][0].y + 15))
          .attr("class", "funnel-perc")
          .text(g.data[index].results[i].Percent + '%')
      }
      // Add sub-percentage text
      if (parseInt(g.data[index].results[i].SubPercent) !== -1) {
        if (g.data[index].results[i].SubPercent == null || g.data[index].results[i].SubPercent == '') {
          g.data[index].results[i].SubPercent = 0
        }
        graph.append('text')
          .attr("x", (g.data[index].config.points[i][16].x - 40))
          .attr("y", (g.data[index].config.points[i][16].y + 30))
          .attr("class", "funnel-sub-perc")
          .text(g.data[index].results[i].SubPercent + '%')
      }
      // Add visitors text
      graph.append('text')
        .attr("x", ((((g.data[index].config.points[i][16].x - g.data[index].config.points[i][3].x) - ((g.data[index].results[i].Value.toString().length + 9) * 6)) / 2)) + g.data[index].config.points[i][24].x)
        .attr("y", (g.data[index].config.points[i][16].y))
        .attr("class", "funnel-count")
        .text(g.data[index].results[i].Value + ' visitors')
    }
    return
  }
  g.graphHoverInfo=function(index, graph) {
    if (g.gDebug) { console.log('g.graphHoverInfo @graphID=' + index) }
  }
  g.createLineGraph = function (index, resultIndex, graph = -1) {
    if (g.gDebug) { console.log('g.createLineGraph @graphID=' + index) }
    //setup
    if (graph == -1) {
      g.data[index].config.html = '<div class="graph-title">' + g.data[index].graphTitle + '</div>' +
        '<svg class="graph"></svg>' +
        '<div class="graph-legend"></div>'
      $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth)
      var graph = d3.select('.graph' + index + ' .graph')
        .attr('width', g.svgWidth)
        .attr('height', g.svgHeight)
        .append('g')
        .attr('transform', 'translate(' + g.graphMargins.left + ',' + g.graphMargins.top + ')')
      $('.graph' + index).width(g.svgWidth)
    }
    //calculate scales
    g.data[index].config.y1 = d3.scaleLinear()
      .range([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].results, function (d) { return parseInt(d.line1Value) })])
    g.data[index].config.xLine = d3.scaleTime()
      .rangeRound([0, g.data[index].config.graphWidth])
      .domain(d3.extent(g.data[index].results, function (d) {
        return d3.isoParse(d.timestamp)
      }))
    //Add legend and axis
    if (g.data[index].graphType == 3) {
      g.createLegend(index, resultIndex)
      g.createAxis(index, resultIndex, graph)
    }
    // LINE 1
    g.data[index].config.lines = 1;
    g.data[index].config.yLine = d3.scaleLinear()
      .rangeRound([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].results, function (d) {
        return parseInt(d.line1Value)
      })
    ])
    g.data[index].config.line = d3.line()
      .x(function (d) {
        return g.data[index].config.xLine(d3.isoParse(d.timestamp))
      })
      .y(function (d) {
        return g.data[index].config.yLine(parseInt(d.line1Value))
      })
      .curve(d3.curveMonotoneX)
    graph.append('path')
      .attr('class', 'line')
      .style("stroke", function () {
          return g.colors[0];
      })
      .style('overflow', 'visible')
      .attr('d', g.data[index].config.line(g.data[index].results))
    // LINE 2
    if (g.data[index].results[0].Line2Value != undefined && g.data[index].results[0].Line2Value != null) {
    g.data[index].config.lines++;
    g.data[index].config.yLine2 = d3.scaleLinear()
      .rangeRound([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].results, function (d) {
        return parseInt(d.Line2Value)
      })
    ])
    g.data[index].config.line2 = d3.line()
      .x(function (d) {
        return g.data[index].config.xLine(d3.isoParse(d.timestamp))
      })
      .y(function (d) {
        return g.data[index].config.yLine2(parseInt(d.Line2Value))
      })
      .curve(d3.curveMonotoneX)
    graph.append('path')
      //pre transition
      .attr('class', 'line')
      .style("stroke", function () {
        return g.colors[1]
      })
      .attr('d', g.data[index].config.line2(g.data[index].results))
    }
    // LINE 3
    if (g.data[index].results[0].Line3Value != undefined && g.data[index].results[0].Line3Value != null) {
      g.data[index].config.lines++
      g.data[index].config.yLine3 = d3.scaleLinear()
        .rangeRound([g.data[index].config.graphHeight, 0])
        .domain([0, d3.max(g.data[index].results, function (d) {
          return parseInt(d.Line3Value)
        })
      ])
      g.data[index].config.line3 = d3.line()
        .x(function (d) {
          return g.data[index].config.xLine(d3.isoParse(d.timestamp))
        })
        .y(function (d) {
          return g.data[index].config.yLine3(parseInt(d.Line3Value))
        })
        .curve(d3.curveMonotoneX)
      graph.append('path')
        //pre transition
        .attr('class', 'line')
        .style("stroke", function () {
            return g.colors[2];
        })
        .attr('d', g.data[index].config.line3(g.data[index].results))
      }
      // LINE 4
      if (g.data[index].results[0].Line4Value != undefined && g.data[index].results[0].Line4Value != null) {
        g.data[index].config.lines++
        g.data[index].config.yLine4 = d3.scaleLinear()
          .rangeRound([g.data[index].config.graphHeight, 0])
          .domain([0, d3.max(g.data[index].results, function (d) {
            return parseInt(d.Line4Value)
          })
        ])
        g.data[index].config.line4 = d3.line()
          .x(function (d) {
            return g.data[index].config.xLine(d3.isoParse(d.timestamp))
          })
          .y(function (d) {
            return g.data[index].config.yLine4(parseInt(d.Line4Value))
          })
          .curve(d3.curveMonotoneX)
        graph.append('path')
          //pre transition
          .attr('class', 'line')
          .style("stroke", function () {
              return g.colors[3];
          })
          .attr('d', g.data[index].config.line4(g.data[index].results))
      }
  //tooltip info
  if (parseInt(g.data[index].interactive) === 2 && g.data[index].graphType!==1) {
  	var mouseG = graph.append('g')
  		.attr('class', 'mouse-over-effects');
  		//black vertical line to follow mouse
  	mouseG.append('path')
  		.attr('class', 'mouse-line')
  		.style('stroke', 'black')
  		.style('stroke-width', '1px')
  		.style('opacity', '0');
  	g.data[index].config.lines = document.querySelectorAll('.graph'+index+' .line');
  	var mousePerLine = mouseG.selectAll('.graph'+index+' .mouse-per-line')
  		.data(g.data[index].results)
  		.enter()
  		.append('g')
  		.attr('class', 'mouse-per-line');
  	mousePerLine.append('circle')
  		.attr('r', 7)
  		.style('stroke', function(d) {
  			return g.colors[0]; //color(d.name);
  		})
  		.style('fill', 'none')
  		.style('stroke-width', '1px')
  		.style('opacity', '0');
  	mousePerLine.append('text')
  		.attr('transform', 'translate(10,3)');
  	var touchGraph=function() {
  		// on mouse in show line, circles and text
  		d3.select('.graph'+index+' .mouse-line')
  			.style('opacity', '1');
  		d3.selectAll('.graph'+index+' .mouse-per-line circle')
  			.style('opacity', '1');
  		d3.selectAll('.graph'+index+' .mouse-per-line text')
  			.style('opacity', '1')
  			.style('background', '#fff');
  	}
  	mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
  		.attr('width', g.data[index].config.graphWidth) // can't catch mouse events on a g element
  		.attr('height', g.data[index].config.graphHeight)
  		.attr('fill', 'none')
  		.attr('pointer-events', 'all')
  		.on('mouseout', function() { // on mouse out hide line, circles and text
  			d3.select('.graph'+index+' .mouse-line')
  				.style('opacity', '0');
  			d3.selectAll('.graph'+index+' .mouse-per-line circle')
  				.style('opacity', '0');
  			d3.selectAll('.graph'+index+' .mouse-per-line text')
  				.style('opacity', '0');
  		})
  		.on('mouseover', touchGraph)
  		.on('touchmove', touchGraph)
  		.on('mousemove', function() { // mouse moving over canvas
  			var mouse = d3.mouse(this);
  			d3.select('.graph'+index+' .mouse-line')
  				.attr('d', function() {
  					var d = 'M' + mouse[0] + ',' + g.data[index].config.graphHeight;
  					d += ' ' + mouse[0] + ',' + 0;
  					return d;
  				});
  			d3.selectAll('.graph'+index+' .mouse-per-line')
  				.attr('transform', function(d, i) {
  					if(i < g.data[index].config.lines) {
  						var xDate = g.data[index].config.xLine.invert(mouse[0]),
  							bisect = d3.bisector(function(d) { return d.timestamp; }).right,
  							idx = bisect(d.line1Value, xDate),
  							beginning = 0,
  							end = g.data[index].config.lines[i].getTotalLength(),
  							target = null;
  						while (true){
  							target = Math.floor((beginning + end) / 2);
  							pos = g.data[index].config.lines[i].getPointAtLength(target);
  							if ((target === end || target === beginning) && pos.x !== mouse[0]) {
  								break;
  							}
  							if (pos.x > mouse[0]){
  								end = target;
  							}else if (pos.x < mouse[0]) {
  								beginning = target;
  							}else{
  								break; //position found
  							}
  						}
  						d3.select(this).select('text')
  							.attr('class', 'graph_tooltip')
  							.text(g.data[index].config.yLine.invert(pos.y).toFixed(2));
  						return 'translate(' + mouse[0] + ',' + pos.y +')';
  					}
  				});
  		});
  }
    return
  }
  g.createMultiColorLineGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createMultiColorLineGraph @graphID=' + index + ' @graphType='+g.data[index].graphType) }
    //setup
    g.data[index].config.html = '<div class="graph-title">' + g.data[index].graphTitle + '</div>' +
      '<svg class="graph"></svg>'+
      '<div class="graph-details"></div>' +
      '<div class="graph-legend"></div>'
    $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth);
    var graph = d3.select('.graph' + index + ' .graph')
      .attr('width', g.svgWidth)
      .attr('height', g.svgHeight)
      .append('g')
      .attr('transform', 'translate(' + g.graphMargins.left + ',' + g.graphMargins.top + ')')
    //calculate scales
    g.data[index].config.min = (Math.round(d3.min(g.data[index].results, function (d) {
      return parseInt(d.Line1Percentage)
    }) / 10) * 10) - 10
    if (g.data[index].config.min < 0) {
      g.data[index].config.min = 0
    }
    g.data[index].config.xLine = d3.scaleTime()
      .rangeRound([0, g.data[index].config.graphWidth])
      .domain(d3.extent(g.data[index].results, function (d) {
        return d3.isoParse(d.timestamp)
      }))
    g.data[index].config.yLine = d3.scaleLinear()
      .rangeRound([g.data[index].config.graphHeight, 0])
      .domain([g.data[index].config.min, d3.max(g.data[index].results, function (d) {
        return parseInt(d.Line1Percentage)
      })])
    //Add legend and axis
    g.createLegend(index, resultIndex)
    g.createAxis(index, resultIndex, graph)
    //line
    g.data[index].config.line = d3.line()
      .x(function (d) {
        return g.data[index].config.xLine(d3.isoParse(d.timestamp))
      })
      .y(function (d) {
        return g.data[index].config.yLine(parseInt(d.Line1Percentage))
      })
      .curve(d3.curveMonotoneX)
    graph.append("linearGradient")
      .attr("id", ("line-gradient" + index))
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", g.data[index].config.yLine(0))
      .attr("x2", 0).attr("y2", g.data[index].config.yLine(100))
      .selectAll("stop")
      .data(g.data[index].graphColorRanges)
      .enter().append("stop")
      .attr("offset", function (d) {
        return d.Offset
      })
      .attr("stop-color", function (d) {
        return d.Color
      })
    graph.append('path')
      .attr('class', ('colorful-line' + index))
      .attr('fill', 'none')
      .attr('stroke', ('url(#line-gradient' + index + ')'))
      .attr('stroke-width', '2px')
      .attr('d', g.data[index].config.line(g.data[index].results))
    //detailed info expansion
    g.detailedInfo(index)
    return
  }
  g.createOverviewLineGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createMultiColorLineGraph @graphID=' + index) }
    //setup
    g.data[index].config.html = '<div class="graph-title-gt14">' + g.data[index].graphTitle + '</div>' +
      '<svg class="graph"></svg>' +
      '<div class="graph-number-gt14">' + g.data[index].graphNumber + '</div>'
    $('.graph' + index).addClass('gt14').html(g.data[index].config.html).width(g.svgWidth)
    g.data[index].config.graphHeight = 40
    g.data[index].config.graphWidth = (g.svgWidth - 90)
    var graph = d3.select('.graph' + index + ' .graph')
      .attr('width', g.data[index].config.graphWidth)
      .attr('height', g.data[index].config.graphHeight)
      .append('g')
      .attr('transform', 'translate(0,0)')
    //calculate scales
    g.data[index].config.min = (Math.round(d3.min(g.data[index].results, function (d) {
      return parseInt(d.line1Value)
    }) / 10) * 10) - 10
    if (g.data[index].config.min < 0) {
      g.data[index].config.min = 0
    }
    g.data[index].config.xLine = d3.scaleTime()
      .rangeRound([0, g.data[index].config.graphWidth])
      .domain(d3.extent(g.data[index].results, function (d) {
        return d3.isoParse(d.timestamp)
      }))
    g.data[index].config.yLine = d3.scaleLinear()
      .rangeRound([g.data[index].config.graphHeight, 0])
      .domain([g.data[index].config.min, d3.max(g.data[index].results, function (d) {
        return parseInt(d.line1Value)
      })])
    //line
    g.data[index].config.line = d3.line()
      .x(function (d) {
        return g.data[index].config.xLine(d3.isoParse(d.timestamp))
      })
      .y(function (d) {
        return g.data[index].config.yLine(parseInt(d.line1Value))
      })
      .curve(d3.curveMonotoneX);
    graph.append("linearGradient")
      .attr("id", ("line-gradient" + index))
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", g.data[index].config.yLine(0))
      .attr("x2", 0).attr("y2", g.data[index].config.yLine(100))
      .selectAll("stop")
      .data(g.data[index].graphColorRanges)
      .enter().append("stop")
      .attr("offset", function (d) {
        return d.Offset
      })
      .attr("stop-color", function (d) {
        return d.Color
      })
    graph.append('path')
      .attr('class', ('colorful-line' + index))
      .attr('fill', 'none')
      .attr('stroke', ('url(#line-gradient' + index + ')'))
      .attr('stroke-width', '2px')
      .attr('d', g.data[index].config.line(g.data[index].results))
    return
  }
  g.createGridlines = function (index, graph) {
    // Add X gridlines
    g.data[index].config.make_x_gridlines = function () {
      return d3.axisBottom(g.data[index].config.x).ticks(5)
    }
    graph.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + g.data[index].config.graphHeight + ')')
      .call(g.data[index].config.make_x_gridlines()
        .tickSize(-g.data[index].config.graphHeight)
        .tickFormat('')
      )
    // Add Y gridlines
    g.data[index].config.make_y_gridlines = function () {
      return d3.axisLeft(g.data[index].config.y1).ticks(5)
    }
    graph.append('g')
      .attr('class', 'grid')
      .call(g.data[index].config.make_y_gridlines()
        .tickSize(-g.data[index].config.graphWidth)
        .tickFormat('')
      )
  }
  g.createAxis = function (index, resultIndex, graph) {
    if (g.gDebug) { console.log('g.createAxis @graphID=' + index) }
    // Add X Axis
    g.data[index].config.x = d3.scaleTime()
      .range([0, g.data[index].config.graphWidth])
      .domain([g.data[index].config.startTime, g.data[index].config.endTime])
    graph.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + g.data[index].config.graphHeight + ')')
      .call(d3.axisBottom(g.data[index].config.x).ticks(5))
    // Add Y1 Axis
    if (g.data[index].graphType === 1 || g.data[index].graphType === 2 || g.data[index].graphType === 3) {
      graph.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(g.data[index].config.y1).ticks(4))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', (g.data[index].config.graphHeight * -1))
        .attr('y', -40)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text(g.data[index].GraphY1AxisLabel)
    } else if (g.data[index].graphType === 7) {
      graph.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(g.data[index].config.y1).ticks(4))
    } else if (g.data[index].graphType === 13) {
      g.data[index].config.y1 = d3.scaleLinear()
        .range([g.data[index].config.graphHeight, 0])
        .domain([g.data[index].config.min, d3.max(g.data[index].results, function (d) {
          return parseInt(d.line1Value)
        })])
    }
    // Add Y2 Axis
    g.data[index].config.y2 = d3.scaleLinear()
      .range([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].results, function (d) {
        return parseInt(d.line1Value)
      })])
    if (g.data[index].graphType === 1) {
      graph.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + g.data[index].config.graphWidth + ',0)')
        .call(d3.axisRight(g.data[index].config.y2).ticks(3))
        .append('text')
        .attr('transform', 'rotate(90)')
        .attr('x', (g.data[index].config.graphHeight + 15))
        .attr('y', -40)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text(g.data[index].GraphY2AxisLabel)
    }
    g.createGridlines(index, graph)
    return
  }
  g.createBarGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createBarGraph @graphID=' + index) }
    //setup
    g.data[index].config.html = '<div class="graph-title graph-title-short">' + g.data[index].graphTitle + '</div>' +
      '<div class="graph-status">' +
      '<div class="graph-status-value">' + g.data[index].graphNumber + '</div>' +
      '<div class="graph-status-label">Customers Impacted</div></div>' +
      '<svg class="graph"></svg>' +
      '<div class="graph-legend"></div>'
    $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth)
    var graph = d3.select('.graph' + index + ' .graph')
      .attr('width', g.svgWidth)
      .attr('height', g.svgHeight)
      .append('g')
      .attr('transform', 'translate(' + g.graphMargins.left + ',' + g.graphMargins.top + ')')
    $('.graph' + index).width(g.svgWidth)
    //calculate scales
    g.data[index].config.xScale = d3.scaleBand()
      .rangeRound([0, g.data[index].config.graphWidth])
      .padding(0.1)
      .domain(g.data[index].results.map(function (d) {
        return d3.isoParse(d.timestamp)
      }))
    g.data[index].config.yScale = d3.scaleLinear()
      .rangeRound([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].results, function (d) {
        return parseInt(d.barGraphValue)
      })])
    //Add legend and axis
    g.createLegend(index, resultIndex)
    g.createAxis(index, resultIndex, graph)
    // Add bar graph
    graph.selectAll('.bar')
      .data(g.data[index].results)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', g.data[index].config.xScale.bandwidth())
      .style('fill', '#64ffda')
      //pre transition
      .attr('x', function (d) {
        return g.data[index].config.xScale(d3.isoParse(d.timestamp))
      })
      .attr('y', g.data[index].config.graphHeight)
      .attr('height', 0)
      //post transition
      .transition()
      .delay(function (d, i) { return i * 50; })
      .attr('x', function (d) {
        return g.data[index].config.xScale(d3.isoParse(d.timestamp))
      })
      .attr('y', function (d) {
        return g.data[index].config.yScale(parseInt(d.barGraphValue))
      })
      .attr('height', function (d) {
        return g.data[index].config.graphHeight - g.data[index].config.yScale(parseInt(d.barGraphValue))
      })
    // Add listener for user clicking on graph as link to another page
    g.graphLinkOut(index)
    return
  }
  g.createBarLineGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createBarGraph @graphID=' + index); }
    g.data[index].config.html = '<div class="graph-title">' +
        '<div class="graph-title">' + g.data[index].graphTitle + '</div></div>' +
        '<svg class="graph"></svg>' +
        '<div class="graph-legend"></div>';
    $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth);
    graph = d3.select('.graph' + index + ' .graph')
        .attr('width', g.svgWidth)
        .attr('height', g.svgHeight)
        .append('g')
        .attr('transform', 'translate(' + g.graphMargins.left + ',' + g.graphMargins.top + ')');
    //calculate scales
    g.data[index].config.xScale = d3.scaleBand()
        .rangeRound([0, g.data[index].config.graphWidth])
        .padding(0.1)
        .domain(g.data[index].results.map(function (d) { return d3.isoParse(d.timestamp); }));
    g.data[index].config.yScale = d3.scaleLinear()
        .rangeRound([g.data[index].config.graphHeight, 0])
        .domain([0, d3.max(g.data[index].results, function (d) { return parseInt(d.barGraphValue); })]);
    g.data[index].config.xLine = d3.scaleTime()
        .rangeRound([0, g.data[index].config.graphWidth])
        .domain(d3.extent(g.data[index].results, function (d) { return d3.isoParse(d.timestamp); }));
    g.data[index].config.yLine = d3.scaleLinear()
        .rangeRound([g.data[index].config.graphHeight, 0])
        .domain([0, d3.max(g.data[index].results, function (d) { return parseInt(d.line1Value); })]);
    // Add X Axis
    g.data[index].config.x = d3.scaleTime()
        .range([0, g.data[index].config.graphWidth])
        .domain([g.data[index].config.startTime, g.data[index].config.endTime]);
    // Add Y1 axis
    g.data[index].config.y1 = d3.scaleLinear()
        .range([g.data[index].config.graphHeight, 0])
        .domain([0, d3.max(g.data[index].results, function (d) { return parseInt(d.barGraphValue); })]);
    // Add legend
    g.createAxis(index, resultIndex, graph);
    g.createLegend(index, resultIndex);
    // Add bar graph
    graph.selectAll('.bar')
      .data(g.data[index].results)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', g.data[index].config.xScale.bandwidth())
      .style('fill', '#64ffda')
      //pre transition
      .attr('x', function (d) {
        return g.data[index].config.xScale(d3.isoParse(d.timestamp))
      })
      .attr('y', g.data[index].config.graphHeight)
      .attr('height', 0)
      //post transition
      .transition()
      .delay(function (d, i) {
        return i * 50
      })
      .attr('x', function (d) {
        return g.data[index].config.xScale(d3.isoParse(d.timestamp))
      })
      .attr('y', function (d) {
        return g.data[index].config.yScale(parseInt(d.barGraphValue))
      })
      .attr('height', function (d) { return g.data[index].config.graphHeight - g.data[index].config.yScale(parseInt(d.barGraphValue)); });
    // Add line graph
    g.data[index].config.preline = d3.line()
      .x(function () {
        return g.data[index].config.xLine(g.data[index].config.startTime)
      })
      .y(function () {
        return g.data[index].config.yLine(0)
      })
    g.data[index].config.line = d3.line()
      .x(function (d) {
        return g.data[index].config.xLine(d3.isoParse(d.timestamp))
      })
      .y(function (d) {
        return g.data[index].config.yLine(parseInt(d.line1Value))
      })
      .curve(d3.curveMonotoneX)
    graph.append('path')
      //pre transition
      .attr('class', 'line')
      .attr('d', g.data[index].config.preline(g.data[index].results))
      //post transition
      .transition()
      .attr('d', g.data[index].config.line(g.data[index].results))
    // Add listener for user clicking on graph as link to another page
    g.graphLinkOut(index)
    return
  }
  g.createStackedBarGraph = function (index, resultIndex) {
    if (g.gDebug) { console.log('g.createStackedBarGraph @graphID=' + index + ' @svgwidth=' + g.svgWidth)}
    var graph
    //text for graph container
    g.data[index].config.date = new Date(g.data[index].results[0].timestamp).toDateString()
    g.data[index].config.html = '<div class="graph-title graph-title-short">' + g.data[index].graphTitle + '</div>' +
      '<div class="graph-status">' +
      '<div class="graph-status-value"></div>' +
      '<div class="graph-status-label"></div></div>' +
      '<svg class="graph"></svg>' +
      '<div class="graph-details"></div>' +
      '<div class="graph-legend"></div>'
    $('.graph' + index).html(g.data[index].config.html).width(g.svgWidth)
    $('.graph' + index + ' .graph-status-value').html(g.data[index].graphNumber)
    $('.graph' + index + ' .graph-status-label').html(g.data[index].graphNumberLabel)
    graph = d3.select('.graph' + index + ' .graph')
      .attr('width', g.svgWidth)
      .attr('height', g.svgHeight)
      .append('g')
      .attr('transform', 'translate(' + g.graphMargins.left + ',' + g.graphMargins.top + ')')
    //keys = headers of data that makes up stacked bars
    g.data[index].config.keys = ['StackedBar1Value', 'StackedBar2Value', 'StackedBar3Value', 'StackedBar4Value'];
    //calculate scales
    g.data[index].config.layers = d3.stack()
      .keys(g.data[index].config.keys)(g.data[index].results)
    g.data[index].config.xScale = d3.scaleBand()
      .rangeRound([0, g.data[index].config.graphWidth])
      .padding(0.1)
      .domain(g.data[index].results.map(function (d) {
        return d3.isoParse(d.timestamp)
      }))
    g.data[index].config.yScale = d3.scaleLinear()
      .rangeRound([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].config.layers[g.data[index].config.layers.length - 1], function (d) {
        return parseInt(d[0]) + parseInt(d[1])
      })]).nice()
    g.data[index].config.zScale = d3.scaleOrdinal()
      .range(['#d50000', '#ff6d00', '#1565c0', '#64ffda'])
      .domain(g.data[index].config.keys)
    g.data[index].config.y1 = d3.scaleLinear()
      .range([g.data[index].config.graphHeight, 0])
      .domain([0, d3.max(g.data[index].results, function (d) {
        return parseInt(d.StackedBarTotal)
      })])
    //Add legend and axis
    g.createLegend(index, resultIndex)
    g.createAxis(index, resultIndex, graph)
    //Add stacked bar graph
    var layer = graph.selectAll('layer')
      .data(g.data[index].config.layers)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .style('fill', function (d, i) {
        return g.data[index].config.zScale(i)
      })
    layer.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('width', g.data[index].config.xScale.bandwidth())
      //pre transition
      .attr('x', function (d) {
        return g.data[index].config.xScale(d3.isoParse(d.data.timestamp))
      })
      .attr('y', g.data[index].config.graphHeight)
      .attr('height', 0)
      //post transition
      .transition()
      .delay(function (d, i) { return i * 30; })
      .attr('x', function (d, i) {
        return g.data[index].config.xScale(d3.isoParse(d.data.timestamp))
      })
      .attr('y', function (d) {
        return g.data[index].config.yScale(parseInt(d[0]) + parseInt(d[1]))
      })
      .attr('height', function (d) {
        return g.data[index].config.yScale(parseInt(d[0])) - g.data[index].config.yScale(parseInt(d[1]) + parseInt(d[0]))
      })
    g.detailedInfo(index)
    // Add listener for user clicking on graph as link to another page
    //g.graphLinkOut(index);
    g.createLineGraph(index, resultIndex, graph)
    return
  }
  g.detailedInfo = function (index) {
    if (g.gDebug) { console.log('g.detailedInfo @SETUP @graphID=' + index+' @graphType='+g.data[index].graphType); }
    var html='',
    	htmlData='',
    	htmlContainer='<div class="graph-details-slider"></div>'+
    		'<div class="graph-details-result"></div>',
    	dataPoints=g.data[index].results.length;
    $('.graph'+index+' .button-graph-details-expand').click(function() {
    	if (g.gDebug) { console.log('g.detailedInfo @clickedInfoButton @graphID=' + index); }
    	$('.graph'+index+' .graph-details').html(htmlContainer);
    	$('.graph'+index+' .graph-details-slider').width(g.data[index].config.graphWidth).slider({
    		change:function(event, ui) {
    			if (g.gDebug) { console.log('g.detailedInfo @DEBUG @graphID=' + index+' @graphType='+g.data[index].graphType); }
    			var sliderPosition=$('.graph-details-slider').slider('option','value'),
    				fraction=dataPoints/100,
    				dataPointIndex=Math.floor(sliderPosition*fraction) - 1;
    			if(dataPointIndex<0) {dataPointIndex=0;}
    			htmlData='<div class="graph-details-result-date">'+g.data[index].results[dataPointIndex].timestamp+'</div>';
    			$('.graph'+index+' .graph-details-result').html(htmlData);
    			if (g.data[index].graphType === 13) {
    				if (g.gDebug) { console.log('g.detailedInfo @showData @graphID=' + index+' @graphType='+g.data[index].graphType); }
    				html='<div class="graph-legend-element"><div class="graph-legend-element-label">Value</div><div class="data-point-info">'+g.data[index].results[dataPointIndex].line1Value+'</div></div>';
    	            for (var i = 0; i < g.data[index].graphLegend.length; i++) {
    	                html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line" style="background:' +g.data[index].colors[i] + '"></div>' +
    	                    '<div class="graph-legend-element-label">' + g.data[index].graphLegend[i] + '</div></div>';
    	            }
    			} else if (g.data[index].graphType === 1) {
    				if (g.gDebug) { console.log('g.detailedInfo @showData @graphID=' + index+' @graphType='+g.data[index].graphType); }
    				html = '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line"></div><div class="graph-legend-element-label">perc 95</div><div class="data-point-info">'+g.data[index].results[dataPointIndex].line1Value+'</div></div>' +
    	                '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-5xx"></div><div class="graph-legend-element-label">5XX</div><div class="data-point-info">'+g.data[index].results[dataPointIndex].StackedBar1Value+'</div></div>' +
    	                '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-4xx"></div><div class="graph-legend-element-label">4XX</div><div class="data-point-info">'+g.data[index].results[dataPointIndex].StackedBar2Value+'</div></div>';
    	            if (g.get3xxCount(index) > 0) {
    	                html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-3xx"></div><div class="graph-legend-element-label">3XX</div><div class="data-point-info">'+g.data[index].results[dataPointIndex].StackedBar3Value+'</div></div>';
    	            }
    	            html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-2xx"></div><div class="graph-legend-element-label">2XX</div><div class="data-point-info">'+g.data[index].results[dataPointIndex].StackedBar4Value+'</div></div>';
    			}
    			$('.graph' + index + ' .graph-legend').html(html)
    		}
      })
      $('.graph'+index+' .graph-details-slider').slider('value', 0)
    })
  }
  g.createLegend = function (index, index2 = 0) {
    if (g.gDebug) { console.log('g.createLegend @graphID=' + index) }
    var html = ''
    if (g.data[index].graphType === 1) {
      if (parseInt(g.data[index].interactive) === 1) {
        html += '<div class="button-graph-details-expand"><i class="fa-solid fa-maximize"></i></div></div>'
      }
      html +='<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line"></div><div class="graph-legend-element-label">perc 95</div></div>' +
        '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-5xx"></div><div class="graph-legend-element-label">5XX</div></div>' +
        '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-4xx"></div><div class="graph-legend-element-label">4XX</div></div>'
      if (g.get3xxCount(index) > 0) {
        html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-3xx"></div><div class="graph-legend-element-label">3XX</div></div>'
      }
      html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-2xx"></div><div class="graph-legend-element-label">2XX</div></div>'
    } else if (g.data[index].graphType === 2) {
      html = '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-2xx"></div><div class="graph-legend-element-label">Errors</div></div>'
    } else if (g.data[index].graphType === 3) {
      for (var i = 0; i < g.data[index].graphLegend.length; i++) {
        html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line" style="background:' + g.colors[i] + '"></div>' +
          '<div class="graph-legend-element-label">' + g.data[index].graphLegend[i] + '</div></div>'
      }
    } else if (g.data[index].graphType === 4) {
      for (var i = 0; i < g.data[index].results.length; i++) {
        html += '<div class="graph-legend-element">' +
          '<div class="graph-legend-element-color" style="background:' + g.colors[i] + '"></div> ' +
          '<div class="graph-legend-element-label-count" style="color:' + g.colors[i] + '">' + g.data[index].results[i].Value + '</div> ' +
          '<div class="graph-legend-element-label">' + g.data[index].results[i].Label + '</div></div> '
      }
    } else if (g.data[index].graphType === 7) {
      html = '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line"></div><div class="graph-legend-element-label">Average</div></div>' +
        '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-2xx"></div><div class="graph-legend-element-label">Total</div></div>'
    } else if (g.data[index].graphType === 13) {
      if (parseInt(g.data[index].interactive) === 1) {
        html += '<img alt="binoculars expand graph details" class="button-graph-details-expand" src="./binoculars.svg" /></div>';
      }
      g.data[index].colors = [];
      for (var i = 0; i < g.data[index].graphColorRanges.length; i++) {
        if(i%2===0) {
          g.data[index].colors.push(g.data[index].graphColorRanges[i].Color)
        }
      }
      console.log('colors',g.data[index].colors);
      for (var i = 0; i < g.data[index].graphLegend.length; i++) {
        html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line" style="background:' + g.data[index].colors[i] + '"></div>' +
          '<div class="graph-legend-element-label">' + g.data[index].graphLegend[i] + '</div></div>'
      }
    }
    $('.graph' + index + ' .graph-legend').html(html)
    return
  }
  g.graphLinkOut = function (index) {
    if (g.data[index].GraphLink != undefined && g.data[index].GraphLink != null && g.data[index].GraphLink != '') {
      $('.graph' + index).off('click').click(function () {
        window.location = g.data[index].GraphLink
      })
    }
  }
  g.redrawGraph = function (index) {
    var resultIndex = 0
    switch (g.data[index].graphType) {
      case 1:
        g.createStackedBarGraph(index, resultIndex)
        break
      case 2:
        g.data[index].config.y1 = d3.scaleLinear()
          .range([g.data[index].config.graphHeight, 0])
          .domain([0, d3.max(g.data[index].results, function (d) {
            return parseInt(d.barGraphValue)
          })])
        g.createBarGraph(index, resultIndex)
        break
      case 3:
        g.createLineGraph(index, resultIndex)
        break
      case 4:
        g.createPieGraph(index, resultIndex)
        break
      case 5:
        g.createFunnelGraph(index, resultIndex)
        break
      case 6:
        g.createBarLineGraph(index, resultIndex)
        break
      case 7:
        g.createMultiColorLineGraph(index, resultIndex)
        break
      case 8:
        g.createOverviewLineGraph(index, resultIndex)
        break
    }
  }
  g.createGraph = function (index) {
    if (g.existinggraphTypes.indexOf(g.data[index].graphType) === -1) {
      g.existinggraphTypes.push(g.data[index].graphType)
    }
    g.data[index].config = {};
    g.data[index].config.graphWidth = g.svgWidth - g.graphMargins.left - g.graphMargins.right;
    g.data[index].config.graphHeight = g.svgHeight - g.graphMargins.top - g.graphMargins.bottom;
    if (g.data[index].results[0].timestamp != undefined || g.data[index].results[0].timestamp != null) {
      //start and end time for X axis scale
      g.data[index].config.startTime = d3.isoParse(g.data[index].results[0].timestamp);
      g.data[index].config.endTime = d3.isoParse(g.data[index].results[(g.data[index].results.length - 1)].timestamp);
    }
    // Draw for the first time to initialize.
    g.redrawGraph(index);
  }
  g.createGraphContainer = function (index) {
    var html = '<div class="card"><div class="graph' + index + '"></div></div>'
    $('.graphs').append(html)
  }
  g.init = function () {
    $('.graphs-container').html('').append('<div class="graphs"></div>')
    for (var index = 0; index < g.data.length; index++) {
      g.createGraphContainer(index)
      g.createGraph(index)
      g.setLastUpdatedDate(index)
    }
    if (g.gDebug) {
      console.log('g.init @dataset=')
      console.log(g.data)
    }
  }
  g.init()
}
