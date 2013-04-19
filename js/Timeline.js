function Timeline() {
  Widget.call(this, document.getElementById('timeline'));
  this.color = d3.scale.category10();
  this.data_ = ko.observableArray();
  this.legend = ko.observableArray();
  this.selectedTopics = ko.observableArray();

  this.svg = d3.select("#timeline > .content").append("svg");
  this.c = this.svg.append("g");

  this.xaxis = this.c.append("g")
    .attr("class", "x axis");

  this.c.append("g")
    .attr("class", "y axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");


  this.initDropHandler();


  ko.applyBindings(this, this.container_);
  dataModel.wordMap.subscribe(function() {
    this.data_([]);
  }, this);

  this.data_.subscribe(function(val) {
    var legend = [];
    if (val.length > 0) {
      for (var i = 0, l = val[0].length; i < l; i++) {
        legend.push('Topic ' + (i + 1));
      }
    }
    this.legend(legend);
    this.selectedTopics(legend);
  }, this);
  this.selectedTopics.subscribe(this.draw.bind(this));
  this.container_.className += ' target';
  this.enableFullscreen();
}

Widget.inherits(Timeline);

Timeline.prototype.initDropHandler = function() {
  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this.setFile(evt.dataTransfer.files[0]);
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  // Setup the dnd listeners.
  this.container_.addEventListener('dragover', handleDragOver.bind(this), false);
  this.container_.addEventListener('drop', handleFileSelect.bind(this), false);
};

Timeline.prototype.setFile = function(file) {
  // read the file and parse the data
  function parseData(data) {
    var lines = data.split('\n');
    var d = [];
    for (var i = 0, l = lines.length; i < l; i++) {
      if (lines[i]) {
        d.push(lines[i].split(' '));
      }
    }
    this.data_(d);
  }

  var reader = new FileReader();
  reader.onprogress = function(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
      //var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      //this.progress(percentLoaded);
    }
  }.bind(this);
  reader.onload = function(evt) {
    //this.processing(false);
    parseData.call(this, evt.currentTarget.result);
  }.bind(this);
  //this.processing('Reading file');
  reader.readAsText(file);
};

Timeline.prototype.draw = function() {
  var margin = this.margin =  {top: 20, right: 20, bottom: 100, left: 60};
  this.width = this.getWidth() - margin.left - margin.right;
  this.height = this.getHeight() - margin.top - margin.bottom;


  this.x = d3.scale.linear().range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

   this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient("left");

  this.svg
    .attr("width", this.width + margin.left + margin.right)
    .attr("height", this.height + margin.top + margin.bottom);

  this.c
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  this.xaxis
    .attr("transform", "translate(0," + this.height + ")");

  this.updateChart(this.data_());
};

Timeline.prototype.updateChart = function(series) {
  if (!series || series.length === 0) {
    this.c.selectAll('.topic').remove();
    return;
  }
  this.x.domain([0, series.length]);
  this.y.domain([0, d3.max(series, function(d) {
    return d3.max(d.map(parseFloat));
  })]);

  var x = this.x;
  var y = this.y;
  var height = this.height;

  this.c.select('.axis.x')
    .call(this.xAxis);
  this.c.select('.axis.y').call(this.yAxis);

  var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });

  var data = d3.transpose(series).map(function(series, i) {
    return {name: 'Topic ' + (i+1), values: series};
  }).filter(function(d) {
    return this.selectedTopics().indexOf(d.name) > -1;
  }, this);

  var color = this.color; 

  var lines = this.c.selectAll('.topic')
    .data(data, function(d) { return d.name; });
  lines.enter().append('g')
    .attr('class', 'topic')
    .append('path')
    .attr('class', 'line');

  lines.selectAll('.line')
    .attr('d', function (d) { return line(d.values); })
    .style("stroke", function(d) { return color(d.name); })
    .style('fill', 'transparent');

  lines.exit().remove();
};

var timelineModel = new Timeline();
