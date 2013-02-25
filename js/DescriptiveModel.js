function DescriptiveModel() {
  this.numberOfWords = ko.observable(10);
  this.width = 960;
  this.height = 500;
  this.radius = Math.min(this.width, this.height) / 2;

  this.color = d3.scale.category20();

  this.pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value;});

  this.arc = d3.svg.arc()
    .innerRadius(this.radius - 100)
    .outerRadius(this.radius - 20);

  this.svg = d3.select("#topic_descriptive").append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

  this.numberOfWords.subscribe(this.recompute_, this);
  dataModel.words.subscribe(function() {
    this.recompute_(this.numberOfWords());
  }, this);

  ko.applyBindings(this, document.getElementById('topic_descriptive'));
}

DescriptiveModel.prototype.recompute_ = function(n) {
  var topics = dataModel.topic_values;
  var word_map = dataModel.words();
  var words = {};
  var color = this.color;
  var arc = this.arc;
  
  topics.forEach(function(list, index) {
    for(var i = 0; i < n; i++) {
      var word = list[i][0];
      if (!(word in words)) {
        words[word] = [];
      }
      words[word].push(index);
    }
  });

  var data = topics.map(function(val, i) { return {value: 0, index: i}; });
  for (var word in words) {
    if (words[word].length === 1) {
      data[words[word][0]].value += 1;
    }
  }

  var g = this.svg.selectAll(".arc")
    .data(this.pie(data));

  var new_g = g.enter().append("g").attr('class', 'arc');
  new_g.append('path');

  new_g.append('text')
    .attr("dy", ".35em")
    .style("text-anchor", "middle");

  g.select('path')
    .transition()
    .attr("d", arc)
    .attr("fill", function(d) { console.log(d);return color(d.data.index); });

  g.select('text')
    .transition()
    .text(function(d) { return 'Topic ' + (d.data.index+1) + ' (' + d.value + ')'; })
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });
};

var descriptiveModel = new DescriptiveModel();
