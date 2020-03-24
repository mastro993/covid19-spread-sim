p5.disableFriendlyErrors = true; // disables FES

// Graphics
const CANVAS_W = 1280;
const CANVAS_H = 1100;

const stat_box_x = 0;
const stat_box_y = CANVAS_H - 300;
const stat_box_w = 250;
const stat_box_h = 300;

const particle_box_x = 0;
const particle_box_y = 0;
const particle_box_w = CANVAS_W;
const particle_box_h = CANVAS_H - stat_box_h;

const chart_box_x = stat_box_w;
const chart_box_y = particle_box_h;
const chart_box_w = CANVAS_W - stat_box_w;
const chart_box_h = stat_box_h;

const control_box_x = stat_box_x;
const control_box_y = stat_box_y + 180;
const control_box_w = 250;
const control_box_h = stat_box_h - 160;

const fps = 60;

const color_normal = '#e4fcf9';
const color_recovered = '#389168';
const color_infected = '#cb3b3b';
const color_deceased = '#00000050';

// Particles settings
const particle_count = 500;
const particle_size = 8;
const particle_max_speed = 2.0;

// Probabilities
const infection_probability_contact = 0.9;
const status_probability_death = 0.1;

// Infection data
const infection_days = 14;
const sanitary_system_limit = 0.5;

// Simulation
const qurantine_percentage = 0.85;
let _quarantine = false;

var _ticks = 0;

var _particles = [];

// Statistics
var _infected = 0;
var _recovered = 0;
var _dead = 0;
var _active = 0;
var _maxActive = 0;

var chart = [];

var canvas;

let quarantine_btn;

function setup() {
  // createCanvas(CANVAS_W, CANVAS_H);
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  canvas.parent('sim-sketch');
  frameRate(fps);
  init();
  initControls();
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

  if (_quarantine) {
    for (var i = 1; i < particle_count * qurantine_percentage; i++) {
      _particles[i].staysAtHome = true;
    }
  }

  _ticks = 0;
  _infected = 0;
  _recovered = 0;
  _dead = 0;
  _active = 0;
  _maxActive = 0;

  chart.clear();

}

function initControls() {
  quarantine_btn = createButton('Toggle quarantine');
  quarantine_btn.parent('sim-sketch');
  quarantine_btn.position(control_box_x + 10, control_box_y + 10);
  quarantine_btn.size(230, 20);
  quarantine_btn.mousePressed(() => {
    _quarantine = !_quarantine;
    quarantine_btn.value("")
    init();
  });
}

function draw() {
  _ticks++;

  _infected = 0;
  _recovered = 0;
  _dead = 0;
  _active = 0;

  background(0);

  drawParticles();
  drawChart();
  drawStatistics();
  drawFps();
}

function drawFps() {
  textSize(14);
  fill('#ffd717')
  text(floor(frameRate()), particle_box_x + 10, particle_box_y + 20);
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

function drawStatistics() {

  fill('#f3e9d2')
  stroke('#00000050');
  rect(stat_box_x, stat_box_y, stat_box_w, stat_box_h);
  noStroke();

  let col_1 = stat_box_x + 10;
  let col_2 = stat_box_x + 110;
  let col_3 = stat_box_x + 150;

  let text_size = 14;
  let row_size = text_size + 5;

  var i = 0;

  textSize(text_size);

  i++;
  fill('#3e4a61')
  text('Day:', col_1, stat_box_y + row_size * i);
  text(ticksToSeconds(_ticks), col_2, stat_box_y + row_size * i);

  i++;
  fill('#3e4a61')
  text('Quarantine:', col_1, stat_box_y + row_size * i);
  fill(_quarantine ? '#389168' : '#cb3b3b')
  text(_quarantine ? 'Enabled' : 'Disabled', col_2, stat_box_y + row_size * i);

  i++;
  fill('#3e4a61')
  text('Total items:', col_1, stat_box_y + row_size * i);
  text(particle_count, col_2, stat_box_y + row_size * i);

  i++;
  fill('#3e4a61')
  let moving_particles = _quarantine ? floor(particle_count * (1.0 - qurantine_percentage)) : particle_count;
  text('Moving items:', col_1, stat_box_y + row_size * i);
  text(moving_particles, col_2, stat_box_y + row_size * i);
  text('(' + ofTotalParticles(moving_particles) + '%)', col_3, stat_box_y + row_size * i);

  i++;
  fill('#cb3b3b')
  text('Infected:', col_1, stat_box_y + row_size * i);
  text(_infected, col_2, stat_box_y + row_size * i);
  text('(' + ofTotalParticles(_infected) + '%)', col_3, stat_box_y + row_size * i);

  i++;
  fill('#ff6d24')
  text('Active:', col_1, stat_box_y + row_size * i);
  text(_active, col_2, stat_box_y + row_size * i);
  text('(' + ofTotalParticles(_active) + '%)', col_3, stat_box_y + row_size * i);

  i++;
  text('Max Active:', col_1, stat_box_y + row_size * i);
  text(_maxActive, col_2, stat_box_y + row_size * i);
  text('(' + ofTotalParticles(_maxActive) + '%)', col_3, stat_box_y + row_size * i);
  fill('#389168')

  i++;
  text('Recovered:', col_1, stat_box_y + row_size * i);
  text(_recovered, col_2, stat_box_y + row_size * i);
  text('(' + ofTotalParticles(_recovered) + '%)', col_3, stat_box_y + row_size * i);

  i++;
  fill('#000000')
  text('Deceased:', col_1, stat_box_y + row_size * i);
  text(_dead, col_2, stat_box_y + row_size * i);
  text('(' + ofTotalParticles(_dead) + '%)', col_3, stat_box_y + row_size * i);

}

function drawChart() {


  let active_chart_x = chart_box_x;
  let active_chart_y = particle_box_h;
  let active_chart_h = ((CANVAS_H - particle_box_h) / 3) * 2;

  let cumul_chart_x = chart_box_x;
  let cumul_chart_y = particle_box_h + active_chart_h;
  let cumul_chart_h = (CANVAS_H - particle_box_h) / 3;

  let cumul_ppp = cumul_chart_h / particle_count;
  let active_ppp = active_chart_h / particle_count;

  const bar_width = 5;

  fill('#e2ded3')

  stroke('#00000050');
  rect(chart_box_x, chart_box_y, chart_box_w, chart_box_h);
  line(cumul_chart_x, cumul_chart_y, CANVAS_W, cumul_chart_y);
  noStroke();

  updateChart();
  var x = 0;
  chart.forEach((d) => {
    fill('#cb3b3b')
    rect(cumul_chart_x + (x * bar_width) + 5, cumul_chart_y + cumul_chart_h, bar_width, -d['infected'] * cumul_ppp);
    fill('#389168')
    rect(cumul_chart_x + (x * bar_width) + 5, cumul_chart_y + cumul_chart_h, bar_width, (-d['dead'] - d['recovered']) * cumul_ppp);
    fill('#000000')
    rect(cumul_chart_x + (x * bar_width) + 5, cumul_chart_y + cumul_chart_h, bar_width, -d['dead'] * cumul_ppp);
    fill('#ff6d24')
    rect(active_chart_x + (x * bar_width) + 5, active_chart_y + active_chart_h, bar_width, -d['active'] * active_ppp);
    x++;
  })

  textSize(14);
  fill('#000000a0')
  text('Cumulative cases chart', cumul_chart_x + 10, cumul_chart_y + 20);
  text('Active cases chart', active_chart_x + 10, active_chart_y + 20);

  let ss_limit_y = active_chart_y + (active_chart_h * sanitary_system_limit);

  stroke('#00000050');
  drawingContext.setLineDash([10, 15]);
  line(chart_box_x, ss_limit_y, CANVAS_W, ss_limit_y);
  drawingContext.setLineDash([]);

  noStroke();
  fill('#000000a0')
  text('Sanitary System max load', CANVAS_W - 200, ss_limit_y - 10);
  noFill();

}

function updateChart() {
  let day = floor(ticksToSeconds(_ticks));
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

    let direction_change_speed = particle_max_speed / 8

    this.dx += direction_change_speed - Math.random() * direction_change_speed * 2;
    this.dy += direction_change_speed - Math.random() * direction_change_speed * 2;

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

    let days_infected = floor(ticksToSeconds(_ticks)) - this.infectionDay;

    let current_death_probability = (ofTotalParticles(_active) > sanitary_system_limit) ? status_probability_death * 5 : status_probability_death;

    switch (this.state) {
      case HealthState.NORMAL:
        // Nothing
        break;
      case HealthState.INFECTED:
        if (days_infected >= infection_days) {

          if (probability(current_death_probability)) {
            this.state = HealthState.DECEASED;
            // } else if (probability(status_probability_recovery)) {
            //   this.state = HealthState.RECOVERED;
            // }
          } else {
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
    this.infectionDay = floor(ticksToSeconds(_ticks));
    this.wasInfected = true;
  }
}

Array.prototype.clear = function () {
  this.splice(0, this.length);
};