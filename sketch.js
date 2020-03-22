// Graphics
const CANVAS_W = 1280;
const CANVAS_H = 1400;

const box_w = CANVAS_W;
const box_h = 1000;

const fps = 60;

// Particles settings
const particle_count = 500;
const particle_size = 5;
const particle_infection_area = particle_size * 4;
const particle_max_speed = 2.0;
// Probabilities
const infection_probability_contact = 0.95;
const infection_probability_area = 0.01;

const status_probability_death = 0.001;
const status_probability_recovery = 0.001;

// Simulation
const home_percentage = 0.0;

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

  // Init particles
  for (var i = 0; i < particle_count; i++) {
    let x = Math.random() * box_w;
    let y = Math.random() * box_h;
    let dx = particle_max_speed - (Math.random() * particle_max_speed * 2);
    let dy = particle_max_speed - (Math.random() * particle_max_speed * 2);
    _particles[i] = new Particle(x, y, dx, dy);
  }

  _particles[0].infect();

  for (var i = 1; i < particle_count * home_percentage; i++) {
    _particles[i].staysAtHome = true;
  }

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

  background('#333644');

  drawParticles();
  drawStatistics();
  drawChart();

  if (second() != last_fps_sec) {
    actual_fps = TICKS - last_fps_ticks;
    last_fps_sec = second();
    last_fps_ticks = TICKS;
  }
  textSize(21);
  fill('#ffd717')
  text(actual_fps, 10, 25);

}

function drawParticles() {

  fill('#333644')
  rect(0, 0, box_w, box_h - box_h);

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

  let stat_box_x = 0;
  let stat_box_y = box_h

  fill('#f3e9d2')
  rect(stat_box_x, stat_box_y, CANVAS_W, CANVAS_H - box_h);

  textSize(18);
  fill('#3e4a61')
  text('Day:', stat_box_x + 10, stat_box_y + 30);
  text(ticksToSeconds(TICKS), stat_box_x + 120, stat_box_y + 30);
  text('Total items:', stat_box_x + 10, stat_box_y + 55);
  text(particle_count, stat_box_x + 120, stat_box_y + 55);
  text('Static items:', stat_box_x + 10, stat_box_y + 80);
  text(particle_count * home_percentage, stat_box_x + 120, stat_box_y + 80);
  text('(' + ofTotalParticles(particle_count * home_percentage) + '%)', stat_box_x + 170, stat_box_y + 80);
  fill('#cb3b3b')
  text('Infected:', stat_box_x + 10, stat_box_y + 105);
  text(_infected, stat_box_x + 120, stat_box_y + 105);
  text('(' + ofTotalParticles(_infected) + '%)', stat_box_x + 170, stat_box_y + 105);
  fill('#ff6d24')
  text('Active:', stat_box_x + 10, stat_box_y + 130);
  text(_active, stat_box_x + 120, stat_box_y + 130);
  text('(' + ofTotalParticles(_active) + '%)', stat_box_x + 170, stat_box_y + 130);
  text('Max Active:', stat_box_x + 10, stat_box_y + 155);
  text(_maxActive, stat_box_x + 120, stat_box_y + 155);
  text('(' + ofTotalParticles(_maxActive) + '%)', stat_box_x + 170, stat_box_y + 155);
  fill('#389168')
  text('Recovered:', stat_box_x + 10, stat_box_y + 180);
  text(_recovered, stat_box_x + 120, stat_box_y + 180);
  text('(' + ofTotalParticles(_recovered) + '%)', stat_box_x + 170, stat_box_y + 180);
  fill('#000000')
  text('Deceased:', stat_box_x + 10, stat_box_y + 205);
  text(_dead, stat_box_x + 120, stat_box_y + 205);
  text('(' + ofTotalParticles(_dead) + '%)', stat_box_x + 170, stat_box_y + 205);
}

var chart = [];

function drawChart() {
  let cumul_chart_x = 270;
  let cumul_chart_y = box_h;
  let cumul_chart_h = (CANVAS_H - box_h) / 2;
  let cumul_chart_w = CANVAS_W - cumul_chart_x;

  let active_chart_x = 270;
  let active_chart_y = box_h + cumul_chart_h;
  let active_chart_h = (CANVAS_H - box_h) / 2;
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
    this.infectionDay = 0;

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

    this.dx += ((particle_max_speed / 4) - Math.random() * (particle_max_speed / 2));
    this.dy += ((particle_max_speed / 4) - Math.random() * (particle_max_speed / 2));

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
      this.x = this.x + this.dx / 2;
      this.y = this.y + this.dy / 2;
    } else {
      this.x = this.x + this.dx;
      this.y = this.y + this.dy;
    }


    // Canvas bounds
    if (this.x + particle_size >= box_w || this.x < 0) {
      this.dx = -this.dx;
    }
    if (this.y + particle_size >= box_h || this.y < 0) {
      this.dy = -this.dy;
    }

    if (this.x + particle_size >= box_w) {
      this.x = box_w - particle_size;
    }

    if (this.x < 0) {
      this.x = 0;
    }

    if (this.y + particle_size >= box_h) {
      this.y = box_h - particle_size;
    }

    if (this.y < 0) {
      this.y = 0;
    }

  }

  show() {
    noStroke();

    switch (this.state) {
      case HealthState.NORMAL:
        fill('#ace6f6');
        ellipse(this.x, this.y, particle_size);
        break;
      case HealthState.INFECTED:
        fill('#f0f69610')
        ellipse(this.x, this.y, particle_infection_area)
        fill('#cb3b3b');
        ellipse(this.x, this.y, particle_size);
        break;
      case HealthState.DECEASED:
        fill('#00000050');
        ellipse(this.x, this.y, particle_size);
        break;
      case HealthState.RECOVERED:
        fill('#389168');
        ellipse(this.x, this.y, particle_size);
        break;
      default:
        fill('#ace6f6');
        ellipse(this.x, this.y, particle_size);
        break;
    }
  }

  checkState() {

    let days_infected = floor(ticksToSeconds(TICKS)) - this.infectionDay;
    let probability_factor = days_infected / 28;

    switch (this.state) {
      case HealthState.NORMAL:
        // Nothing
        break;
      case HealthState.INFECTED:
        if (probability(status_probability_death * probability_factor)) {
          this.state = HealthState.DECEASED;
        } else if (probability(status_probability_recovery * probability_factor)) {
          this.state = HealthState.RECOVERED;
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

    if (p.state == HealthState.DECEASED) {
      return;
    }

    let d = dist(this.x, this.y, p.x, p.y);

    if (d < particle_size) {

      if (probability(infection_probability_contact)
        && this.state == HealthState.INFECTED
        && p.state == HealthState.NORMAL) {
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

    } else if (d < (particle_infection_area / 2)) {

      if (probability(infection_probability_area)
        && this.state == HealthState.INFECTED
        && p.state == HealthState.NORMAL) {
        p.infect();
      }

    }

  }

  infect() {
    this.state = HealthState.INFECTED;
    this.infectionDay = floor(ticksToSeconds(TICKS));
    this.wasInfected = true;
  }
}