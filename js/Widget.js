function Widget(element) {
  this.container_ = element;
  d3.select(element).classed('widget', true);

  $(window).on('resize', function() {
    this.draw();
  }.bind(this));
}

Widget.inherits = function(Constr) {
  Constr.prototype = Object.create(Widget.prototype);
  Constr.prototype.constructor = Constr;
};

Widget.prototype.getWidth = function() {
  if (this.fullscreen_) {
    return parseInt(d3.select('#fullscreen > .content').style('width'), 10);
  }
  else {
    return parseInt(d3.select(this.container_).style('width'), 10);
  }
};

Widget.prototype.getHeight = function() {
  if (this.fullscreen_) {
    return parseInt(d3.select('#fullscreen > .content').style('height'), 10);
  }
  else {
    return 400;
  }
};


Widget.prototype.enableFullscreen = function() {
  this.fullscreenButton_ = document.createElement('div');
  this.fullscreenButton_.className = 'fullscreen_button';
  this.fullscreenButton_.innerHTML = '<i class="icon-zoom-in"></i>';
  d3.select(this.fullscreenButton_).on('click', this.enterFullscreen.bind(this));
  d3.select(this.container_).on('mouseover', function() {
    d3.select(this.fullscreenButton_).style('display', 'inline');
  }.bind(this)).on('mouseout', function() {
    d3.select(this.fullscreenButton_).style('display', 'none');
  }.bind(this));

  var title = this.container_.querySelector('h2');
  title.appendChild(this.fullscreenButton_);
};


Widget.prototype.enterFullscreen = function() {
  // move all elements to fullscreen content
  this.fullscreen_ = true;
  d3.select(document.body).classed('fullscreen', true);
  var self = this;
  var children = [].slice.call(this.container_.childNodes);
  var content = document.querySelector('#fullscreen .content');
  d3.select(content.parentNode).style('display', 'block');
  for (var i = 0, l = children.length; i < l; i++) {
    if (children[i] !== this.fullscreenButton_) {
      content.appendChild(children[i]);
    }
  }

 d3.select('#fullscreen > .close').on('click', function handler() {
   d3.select(this).on('click', null);
   self.leaveFullscreen();
 });

  this.draw();
};


Widget.prototype.leaveFullscreen = function() {
  this.fullscreen_ = false;
  d3.select(document.body).classed('fullscreen', false);
  var content = document.querySelector('#fullscreen > .content');
  var children = [].slice.call(content.childNodes);
  d3.select(content.parentNode).style('display', 'none');
  for (var i = 0, l = children.length; i < l; i++) {
    this.container_.appendChild(children[i]);
  }
  this.draw();
};
