// Graphics
const CANVAS_W = 1100;
const CANVAS_H = 1000;

const particle_box_x = 250;
const particle_box_y = 0;
const particle_box_w = 850;
const particle_box_h = 800;

const control_box_x = 0;
const control_box_y = 0;
const control_box_w = 250;
const control_box_h = 200;

const stat_box_x = 0;
const stat_box_y = control_box_h;
const stat_box_w = 250;
const stat_box_h = particle_box_h - control_box_h;

const chart_box_x = 0;
const chart_box_y = 0;
const chart_box_w = 200;
const chart_box_h = 200;

const fps = 60;

// Particles settings
const particle_count = 500;
const particle_size = 5;
const particle_max_speed = 2.0;
// Probabilities
const infection_probability_contact = 0.5;

const status_probability_death = 0.001;
const status_probability_recovery = 0.001;

const infection_inbation_days = 14;

const color_normal = '#e4fcf9';
const color_recovered = '#389168';
const color_infected = '#cb3b3b';
const color_deceased = '#00000050';

// Simulation
const home_percentage = 0.00;

var TICKS = 0;

var _particles = [];

var _infected = 0;
var _recovered = 0;
var _dead = 0;
var _active = 0;
var _maxActive = 0;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  frameRate(fps);
  init();
}

function init() {
  // Init particles
  for (var i = 0; i < particle_count; i++) {
    let x = particle_box_x + Math.random() * particle_box_w;
    let y = particle_box_y + Math.random() * particle_box_h;
    let dx = particle_max_speed - (Math.random() * particle_max_speed * 2);
    let dy = particle_max_speed - (Math.random() * particle_max_speed * 2);
    _particles[i] = new Particle(x, y, dx, dy);
  }

  _particles[0].infect();

  for (var i = 1; i < particle_count * home_percentage; i++) {
    _particles[i].staysAtHome = true;
  }

  TICKS = 0;
  _infected = 0;
  _recovered = 0;
  _dead = 0;
  _active = 0;
  _maxActive = 0;

}

var last_fps_sec = 0;
var last_fps_ticks = 0;
var actual_fps = 0;

function draw() {
  TICKS++;

  _infected = 0;
  _recovered = 0;
  _dead = 0;
  _active = 0;

  background(0);

  drawControls();
  drawParticles();
  drawChart();
  drawStatistics();

  if (second() != last_fps_sec) {
    actual_fps = TICKS - last_fps_ticks;
    last_fps_sec = second();
    last_fps_ticks = TICKS;
  }
  textSize(14);
  fill('#ffd717')
  text(actual_fps, particle_box_x + 10, particle_box_y + 20);

}

function drawParticles() {

  fill('#333644')
  rect(particle_box_x, 0, particle_box_w, particle_box_h);

  for (var i = 0; i < particle_count; i++) {
    _particles[i].checkState();
    _particles[i].move();
    _particles[i].show();

    for (var j = 0; j < particle_count; j++) {
      if (j == i) continue;
      _particles[i].collideWith(_particles[j]);
    }

    _infected += _particles[i].wasInfected;
    _active += _particles[i].state == HealthState.INFECTED;
    _recovered += _particles[i].state == HealthState.RECOVERED;
    _dead += _particles[i].state == HealthState.DECEASED;
  }

  if (_active > _maxActive) {
    _maxActive = _active;
  }
}

var playing = false;

function drawControls() {

  fill('#f3e9d2')
  rect(control_box_x, control_box_y, control_box_w, control_box_h);

  var start_button = createButton('Play');
  start_button.position(control_box_x + 30, 10);
  start_button.mousePressed(() => {
    playing = true;
  });

  var stop_button = createButton('Stop');
  stop_button.position(control_box_x + 80, 10);
  stop_button.mousePressed(() => {
    playing = false;
  });

  var restart_button = createButton('Restart');
  restart_button.position(control_box_x + 130, 10);
  restart_button.mousePressed(() => {
    init();
    playing = true;
  });

  fill('#3e4a61')
  text('Item count', control_box_x + 10, control_box_y + 50);
  var particle_count_slider = createSlider(0, 1000, 500);
  particle_count_slider.position(control_box_x + 30, 50);
  particle_count_slider.style('width', (control_box_w - 60) + 'px');

  if (playing) {
    start_button.attribute('disabled', '');
  } else {
    stop_button.attribute('disabled', '');
  }

}

function drawStatistics() {

  fill('#f3e9d2')
  rect(stat_box_x, stat_box_y, stat_box_w, stat_box_h);

  textSize(16);
  fill('#3e4a61')
  text('Day:', stat_box_x + 10, stat_box_y + 25);
  text(ticksToSeconds(TICKS), stat_box_x + 120, stat_box_y + 25);
  text('Items:', stat_box_x + 10, stat_box_y + 50);
  text(particle_count, stat_box_x + 120, stat_box_y + 50);
  text('Moving items:', stat_box_x + 10, stat_box_y + 75);
  text(particle_count * (1.0 - home_percentage), stat_box_x + 120, stat_box_y + 75);
  text('(' + ofTotalParticles(particle_count * (1.0 - home_percentage)) + '%)', stat_box_x + 170, stat_box_y + 75);
  fill('#cb3b3b')
  text('Infected:', stat_box_x + 10, stat_box_y + 100);
  text(_infected, stat_box_x + 120, stat_box_y + 100);
  text('(' + ofTotalParticles(_infected) + '%)', stat_box_x + 170, stat_box_y + 100);
  fill('#ff6d24')
  text('Active:', stat_box_x + 10, stat_box_y + 125);
  text(_active, stat_box_x + 120, stat_box_y + 125);
  text('(' + ofTotalParticles(_active) + '%)', stat_box_x + 170, stat_box_y + 125);
  text('Max Active:', stat_box_x + 10, stat_box_y + 150);
  text(_maxActive, stat_box_x + 120, stat_box_y + 150);
  text('(' + ofTotalParticles(_maxActive) + '%)', stat_box_x + 170, stat_box_y + 150);
  fill('#389168')
  text('Recovered:', stat_box_x + 10, stat_box_y + 175);
  text(_recovered, stat_box_x + 120, stat_box_y + 175);
  text('(' + ofTotalParticles(_recovered) + '%)', stat_box_x + 170, stat_box_y + 175);
  fill('#000000')
  text('Deceased:', stat_box_x + 10, stat_box_y + 200);
  text(_dead, stat_box_x + 120, stat_box_y + 200);
  text('(' + ofTotalParticles(_dead) + '%)', stat_box_x + 170, stat_box_y + 200);
}

var chart = [];

function drawChart() {
  let cumul_chart_x = chart_box_x;
  let cumul_chart_y = particle_box_h;
  let cumul_chart_h = (CANVAS_H - particle_box_h) / 2;
  let cumul_chart_w = CANVAS_W - cumul_chart_x;

  let active_chart_x = chart_box_x;
  let active_chart_y = particle_box_h + cumul_chart_h;
  let active_chart_h = (CANVAS_H - particle_box_h) / 2;
  let active_chart_w = CANVAS_W - cumul_chart_x;

  let cumul_ppp = cumul_chart_h / particle_count;
  let active_ppp = active_chart_h / particle_count;

  const bar_width = 2;

  fill('#e2ded3')
  rect(cumul_chart_x, cumul_chart_y, cumul_chart_w, cumul_chart_h);
  rect(active_chart_x, active_chart_y, active_chart_w, active_chart_h);

  updateChart();
  var x = 0;
  chart.forEach((d) => {
    fill('#cb3b3b')
    rect(cumul_chart_x + (x * bar_width), cumul_chart_y + cumul_chart_h, bar_width, -d['infected'] * cumul_ppp);
    fill('#389168')
    rect(cumul_chart_x + (x * bar_width), cumul_chart_y + cumul_chart_h, bar_width, (-d['dead'] - d['recovered']) * cumul_ppp);
    fill('#000000')
    rect(cumul_chart_x + (x * bar_width), cumul_chart_y + cumul_chart_h, bar_width, -d['dead'] * cumul_ppp);
    fill('#ff6d24')
    rect(active_chart_x + (x * bar_width), active_chart_y + active_chart_h, bar_width, -d['active'] * active_ppp);
    x++;
  })

  textSize(14);
  fill('#000000a0')
  text('Cumulative cases chart', cumul_chart_x + 10, cumul_chart_y + 20);
  text('Active cases chart', active_chart_x + 10, active_chart_y + 20);
}

function updateChart() {
  let day = floor(ticksToSeconds(TICKS));
  chart[day] = { day: day, active: _active, infected: _infected, recovered: _recovered, dead: _dead };
}

var ofTotalParticles = function (n) {
  return ((n / particle_count) * 100).toFixed(2);
}

var probability = function (n) {
  return !!n && Math.random() <= n;
};

function ticksToMilliseconds(t) {
  return Math.floor(t / (fps / 1000));
}

function ticksToSeconds(t) {
  return Math.floor(t / fps);
}

var HealthState = {
  NORMAL: 1,
  INFECTED: 2,
  DECEASED: 3,
  RECOVERED: 4
};

class Particle {



  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;

    this.dx = dx;
    this.dy = dy;

    this.wasInfected = false;
    this.state = HealthState.NORMAL;
    this.infectionDay = -1;

    this.staysAtHome = false;
  }

  move() {

    if (this.state == HealthState.DECEASED) {
      // Dead people do not move... you know
      return;
    }

    if (this.staysAtHome) {
      // This particle do not move
      return;
    }

    // this.dx += ((particle_max_speed / 4) - Math.random() * (particle_max_speed / 2));
    // this.dy += ((particle_max_speed / 4) - Math.random() * (particle_max_speed / 2));

    if (this.dx > particle_max_speed) {
      this.dx = particle_max_speed
    }
    if (this.dx < -particle_max_speed) {
      this.dx = -particle_max_speed
    }
    if (this.dy > particle_max_speed) {
      this.dy = particle_max_speed
    }
    if (this.dy < -particle_max_speed) {
      this.dy = -particle_max_speed
    }

    // Movement
    if (this.state == HealthState.INFECTED) {
      // If infected movement is slowed
      // This helps to create clusters of infected particles
      this.x = this.x + this.dx / 1;
      this.y = this.y + this.dy / 1;
    } else {
      this.x = this.x + this.dx;
      this.y = this.y + this.dy;
    }


    // Canvas bounds
    if (((this.x + particle_size) >= (particle_box_x + particle_box_w)) || this.x < particle_box_x) {
      this.dx = -this.dx;
    }
    if (((this.y + particle_size) >= (particle_box_y + particle_box_h)) || this.y < particle_box_y) {
      this.dy = -this.dy;
    }

  }

  show() {
    noStroke();

    switch (this.state) {
      case HealthState.NORMAL:
        fill(color_normal);
        ellipse(this.x, this.y, particle_size);
        break;
      case HealthState.INFECTED:
        fill(color_infected);
        ellipse(this.x, this.y, particle_size);
        break;
      case HealthState.DECEASED:
        fill(color_deceased);
        ellipse(this.x, this.y, particle_size);
        break;
      case HealthState.RECOVERED:
        fill(color_recovered);
        ellipse(this.x, this.y, particle_size);
        break;
      default:
        fill(color_normal);
        ellipse(this.x, this.y, particle_size);
        break;
    }
  }

  checkState() {

    let days_infected = floor(ticksToSeconds(TICKS)) - this.infectionDay;

    switch (this.state) {
      case HealthState.NORMAL:
        // Nothing
        break;
      case HealthState.INFECTED:
        if (days_infected >= infection_inbation_days) {
          if (probability(status_probability_death)) {
            this.state = HealthState.DECEASED;
          } else if (probability(status_probability_recovery)) {
            this.state = HealthState.RECOVERED;
          }
        }
        break;
      case HealthState.DECEASED:
        // Nothing
        break;
      case HealthState.RECOVERED:
        // Nothing
        break;
      default:
        // Nothing
        break;
    }


  }


  collideWith(p) {

    if (p.state == HealthState.DECEASED || this.state == HealthState.DECEASED) {
      return;
    }

    let d = dist(this.x, this.y, p.x, p.y);

    if (d < particle_size) {

      if (probability(infection_probability_contact)
        && this.canInfect()
        && p.canBeInfected()) {
        p.infect();
      }

      let angle = atan2(p.y - this.y, p.x - this.x);
      let targetX = this.x + cos(angle) * particle_size;
      let targetY = this.y + sin(angle) * particle_size;
      let ax = (targetX - p.x) * 0.05;
      let ay = (targetY - p.y) * 0.05;
      this.dx -= ax;
      this.dy -= ay;
      p.dx += ax;
      p.dy += ay;

    }


  }

  canBeInfected() {
    return this.state == HealthState.NORMAL;
  }

  canInfect() {
    return this.state == HealthState.INFECTED;
  }

  infect() {
    this.state = HealthState.INFECTED;
    this.infectionDay = floor(ticksToSeconds(TICKS));
    this.wasInfected = true;
  }
}