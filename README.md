# Covid19 Spread Simulator

Covid19 Spread Simulator is a simple virus spread simulation to demonstrate quarantine effectiveness.

Whatch it in action here: http://fedemas.me/covid19

## Disclaimer

This experiment must be considered as such and not as absolute truth.
The data used are not necessarily the true representation of the current situation.

## How it works

It shows a simulation of 500 particles moving around and colliding with each other. 
At the start one particle is infected and every time it collides with another particle it infects it.

After some time of infection, particles are checked and their status is changed to recovered or deceased based on a certain probability set.
If the current total infected particles number exceeds the maximum National Sanitary System load level, the probability of death is increased.

There is a box with real-time statistics to show current state of particles and a box with two charts: one for the cumulative infections (total infected, recovered and deceased) and one for the current infected particles.

Clicking on the "Enable quarantine" button, 80% of the total particles will not move simultatin quarantined people.

## Data used

Percentages and values used were taken from the available sources (like newspapers).

Death probability: 10% (in Italy, at the moment I'm pushing the code)
Quarantined people: 80% (assuming 20% are people who work or does essential shopping)
Probability check: after 14 days

## Results

Enabling quarantine shows its effectiveness by ensuring that total cases never exceed the maximum load of the National Sanitary System.
