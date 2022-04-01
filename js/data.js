var data = function () {
  var d = {}
  d.labels = ['Alpha', 'Beta', 'Delta', 'Omega', 'Omicron', 'Pi']
  d.now = now = new Date()
  d.collection = []
  d.getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
  d.addMinutes = function (date, minutes = 1) {
    return new Date(date.getTime() + minutes * 60000);
  }
  d.now = d.addMinutes(d.now, -45)
  d.stackedBarGraphData = function () {
    var g = {}
    g.graphType = 1;
    g.graphTitle = 'Stacked Bar Graph';
    g.graphTitleLabel = '';
    g.GraphY1AxisLabel = 'hits';
    g.GraphY2AxisLabel = 'ms';
    g.graphNumber = 50;
    g.graphNumberLabel = '90<sup>th</sup>% ms';
    g.GraphLink = 'http://google.com';
    g.interactive = 1
    g.results = []
    for (var i = 0; i < 30; i++) {
      now = d.addMinutes(now);
      g.results.push({
        timestamp: now.toString(),
        line1Value: d.getRandomInt(100, 2000),
        StackedBar1Value: d.getRandomInt(100, 5000),
        StackedBar2Value: d.getRandomInt(100, 5000),
        StackedBar3Value: d.getRandomInt(100, 5000),
        StackedBar4Value: d.getRandomInt(100, 5000)
      })
      g.results[i].StackedBarTotal = (g.results[i].StackedBar1Value + g.results[i].StackedBar2Value + g.results[i].StackedBar3Value + g.results[i].StackedBar4Value)
    }
    d.collection.push(g)
  }
  d.barGraphData = function () {
    var g = {}
    g.graphType = 2;
    g.GraphLink = 'http://google.com';
    g.graphTitle = 'Bar Graph';
    g.graphNumber = 27;
    g.GraphY1AxisLabel = 'errors';
    g.interactive = 0
    g.results = [];
    for (var i = 0; i < 24; i++) {
      now = d.addMinutes(now);
      g.results.push({
        timestamp: now.toString(),
        barGraphValue: d.getRandomInt(0, 100)
      });
    }
    d.collection.push(g)
  }
  d.lineGraphData = function () {
    var g = {}
    g.graphType = 3
    g.graphTitle = 'Line Graph'
    g.GraphY1AxisLabel = 'units'
    g.graphLegend = ['alpha', 'beta', 'delta', 'omega']
    g.interactive = 2
    g.results = [];
    for (var i = 0; i < 24; i++) {
      now = d.addMinutes(now);
      g.results.push({
        timestamp: now.toString(),
        line1Value: d.getRandomInt(0, 100),
        Line2Value: d.getRandomInt(0, 20),
        Line3Value: d.getRandomInt(40, 60),
        Line4Value: d.getRandomInt(60, 100)
      });
    }
    d.collection.push(g)
  }
  d.pieGraphData = function () {
    var g = {}
    g.graphType = 4
    g.graphTitle = 'Pie Graph'
    g.interactive = 0
    g.results = []
    for (var b = 0; b < d.labels.length; b++) {
      g.results.push({ Label: d.labels[b], Value: d.getRandomInt(0, 500) })
    }
    d.collection.push(g)
  }
  d.funnelGraphData = function () {
    var g = {}
    g.graphType = 5
    g.graphTitle = 'Funnel Graph'
    g.interactive = 0
    g.results = [
      {
        Label: 'Alpha',
        Value: 10000,
        Percent: -1,
        SubPercent: 50
      },
      {
        Label: 'Beta',
        Value: 5000,
        Percent: 50,
        SubPercent: 0
      },
      {
        Label: 'Omega',
        Value: 3000,
        Percent: 30,
        SubPercent: 66
      },
      {
        Label: 'Pi',
        Value: 2000,
        Percent: 20,
        SubPercent: 75
      },
      {
        Label: 'Omicron',
        Value: 1500,
        Percent: 15,
        SubPercent: -1
      },
      {
        Label: 'Foxtrot',
        Value: 800,
        Percent: 9,
        SubPercent: -1
      }
    ]
    d.collection.push(g)
  }
  d.barLineGraphData = function () {
    var g = {}
    g.graphType = 6
    g.graphTitle = "Bar Line Graph"
    g.interactive = 0
    g.results = [
      {
          timestamp: "2019-04-22T05:00:00Z",
          line1Value: "29.15",
          barGraphValue: "36"
      },
      {
          timestamp: "2019-04-22T06:00:00Z",
          line1Value: "19",
          barGraphValue: "43"
      },
      {
          timestamp: "2019-04-22T07:00:00Z",
          line1Value: "10",
          barGraphValue: "15"
      },
      {
          timestamp: "2019-04-22T08:00:00Z",
          line1Value: "11",
          barGraphValue: "16"
      },
      {
          timestamp: "2019-04-22T09:00:00Z",
          line1Value: "9",
          barGraphValue: "16"
      },
      {
          timestamp: "2019-04-22T10:00:00Z",
          line1Value: "11.5",
          barGraphValue: "15"
      },
      {
          timestamp: "2019-04-22T11:00:00Z",
          line1Value: "20",
          barGraphValue: "41"
      },
      {
          timestamp: "2019-04-22T12:00:00Z",
          line1Value: "38.5",
          barGraphValue: "85"
      },
      {
          timestamp: "2019-04-22T13:00:00Z",
          line1Value: "67",
          barGraphValue: "148"
      },
      {
          timestamp: "2019-04-22T14:00:00Z",
          line1Value: "96",
          barGraphValue: "253"
      },
      {
          timestamp: "2019-04-22T15:00:00Z",
          line1Value: "167",
          barGraphValue: "40"
      }
    ]
    d.collection.push(g)
  }
  d.multiColorLineGraphData = function () {
    var g = {}
    g.graphType = 7
    g.graphTitle = 'Multi Color Line Graph'
    g.graphLegend = ['<20', '20-50', '50-70', '70-100']
    g.interactive = 0
    g.graphColorRanges = [
      { Offset: "0%", Color: "#d500f9" },
      { Offset: "30%", Color: "#d500f9" },
      { Offset: "30%", Color: "#d50000" },
      { Offset: "50%", Color: "#d50000" },
      { Offset: "50%", Color: "#ff6d00" },
      { Offset: "80%", Color: "#ff6d00" },
      { Offset: "80%", Color: "#64ffda" },
      { Offset: "100%", Color: "#64ffda" }
    ]
    g.results = []
    for (var i = 0; i < 24; i++) {
      now = d.addMinutes(now);
      g.results.push({
        timestamp: now.toString(),
        line1Value: d.getRandomInt(0, 5000),
        Line1Percentage: d.getRandomInt(0, 100)
      })
    }
    g.interactive = 0
    g.results = []
    for (var i = 0; i < 24; i++) {
      now = d.addMinutes(now);
      g.results.push({
        timestamp: now.toString(),
        line1Value: d.getRandomInt(70, 100)
      })
    }
    d.collection.push(g)
  }
  d.overviewLineGraphData = function () {
    var g = {}
    g.graphType = 8
    g.graphTitle = 'Overview Line Graph'
    g.graphNumber = d.getRandomInt(0, 5000)
    g.graphColorRanges = [
        { Offset: "0%", Color: "#d50000" },
        { Offset: "80%", Color: "#d50000" },
        { Offset: "80%", Color: "#ff6d00" },
        { Offset: "90%", Color: "#ff6d00" },
        { Offset: "90%", Color: "#64ffda" },
        { Offset: "100%", Color: "#64ffda" }
    ]
    g.interactive = 0;
    g.results = [];
    for (var i = 0; i < 24; i++) {
        now = d.addMinutes(now);
        g.results.push({
            timestamp: now.toString(),
            line1Value: d.getRandomInt(70, 100)
        });
    }
    d.collection.push(g)
  }
  d.stackedBarGraphData()
  d.barGraphData()
  d.lineGraphData()
  d.pieGraphData()
  d.funnelGraphData()
  d.barLineGraphData()
  //d.multiColorLineGraphData()
  //d.overviewLineGraphData()
  return d.collection
}
