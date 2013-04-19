function DescriptiveModel() {
  Widget.call(this, document.getElementById('topic_descriptive'));
  this.numberOfWords = ko.observable(10);
  this.color = d3.scale.category20c();

  this.pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value;});


  this.svg = d3.select("#topic_descriptive > .content").append("svg");
  this.c = this.svg.append("g");

  ko.applyBindings(this, this.container_);
  this.numberOfWords.subscribe(this.draw, this);
  dataModel.wordMap.subscribe(this.draw, this);
  dataModel.filteredData.subscribe(this.draw, this);

  this.enableFullscreen();
}

Widget.inherits(DescriptiveModel);

DescriptiveModel.prototype.draw = function() {
  this.width = this.getWidth();
  this.height = this.getHeight();
  this.radius = Math.min(this.width, this.height) / 2;

  this.arc = d3.svg.arc()
    .innerRadius(this.radius - (this.radius * 0.6))
    .outerRadius(this.radius - 20);

 this.c
    .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

  this.recompute_(this.numberOfWords());
};

DescriptiveModel.prototype.recompute_ = function(n) {
  var topics = dataModel.topics();
  var words = {};
  var color = this.color;
  var arc = this.arc;
  var wm = dataModel.wordMap();

  topics.forEach(function(list, index) {
    var found_words = 0;
    for(var i = 0, l = list.length; found_words < n && i < l; i++) {
      var word = list[i];
      if (dataModel.include(wm[word])) {
        found_words += 1;
        if (!(word in words)) {
          words[word] = [];
        }
        words[word].push(index);
      }
    }
  });

  var data = topics.map(function(val, i) { return {value: 0, index: i}; });
  for (var word in words) {
    if (words[word].length === 1) {
      data[words[word][0]].value += 1;
    }
  }
  data = data.filter(function(obj) { return obj.value > 0; });

  var g = this.c.selectAll(".arc")
    .data(this.pie(data));

  g.exit().remove();

  var new_g = g.enter().append("g").attr('class', 'arc');
  new_g.append('path');

  new_g.append('text')
    .attr("dy", ".35em")
    .style("text-anchor", "middle");

  g.select('path')
    .transition()
    .attr("d", arc)
    .attr("fill", function(d) { return color(d.data.index); });

  g.select('text')
    .transition()
    .text(function(d) { return 'Topic ' + (d.data.index+1) + ' (' + d.value + ')'; })
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });
};

var descriptiveModel = new DescriptiveModel();
