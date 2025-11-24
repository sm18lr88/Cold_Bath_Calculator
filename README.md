# Cold Bath Calculator

Advanced tool for estimating ice or chiller requirements for your cold bath.

<img width="436" height="740" alt="image" src="https://github.com/user-attachments/assets/9a8f5402-f7e3-4689-b179-42a63aa7ce78" />

<img width="447" height="737" alt="image" src="https://github.com/user-attachments/assets/6c152cb0-02c6-4e92-8212-ed4b4ccb1648" />

## Quick start

- Open `cold_bath_calculator.html` in any modern browser.
- Pick Ice or Chiller mode, enter your data, and click Calculate Requirements.
- Optional: enable "Expert mode" under the form to view detailed physics outputs.
- Enter Ambient Temperature to check "Duty Cycle" (can the chiller hold the temperature?).
- Toggle IMP/MET to switch between imperial and metric units.

## Features

- Ice mass estimate (bags or weight), including added ice volume and overflow check.
- Chiller cooldown time (best-case) and electrical load.
- Maintenance Load Analysis: estimates passive heat gain (Watts) vs. chiller power to warn if a setup will run 24/7 or fail to hold temperature.
- Body displacement and overflow warnings based on weight, composition, and immersion.
- Safety context text for common cold-immersion temperature ranges.
- Expert panel that displays heat removal, mass/volume used, duty cycle estimates, and chiller COP-style details.

## Testing the physics model

- Requires Node.js (no dependencies).
- Run: `node physics-tests.js`
- The suite covers:
  - Unit conversions.
  - Ice scenarios: typical, large delta, and mild delta (energy, mass, volume).
  - Chiller scenarios: baseline cooling and passive heat gain (maintenance load) checks.
  - Body displacement calculation.

## Notes and assumptions

- Fresh water only; salt or additives change properties.
- No support for saltwater (which changes freezing point, density, and heat capacity).
- Assumes well-mixed water and ignores tub and body heat capacity.
- Chiller cooldown times are "zero-loss" best-case using rated BTU/hr. Real cooldowns will be slower due to ambient heat gain.
- "Maintenance Load" assumes approximate surface areas and U-values (heat transfer coefficients) to estimate how hard the chiller works to fight the air temperature.
- Ice math assumes bagged/store ice near 0 °C; home-freezer ice (~-18 °C) would add several percent more cooling.

## Limitations

- Surface area for heat gain is approximated from presets or estimated volume; custom dimensions would improve accuracy.
- No cost modeling for ice purchases.
- Safety info is general; consult medical sources for personal use.
- Tested on modern browsers; no Internet Explorer support.

## To-do

- [ ] Integrate cooldown timing with ambient heat gain (temperature-dependent cooling curve instead of constant-power, zero-loss estimate).

## LICENSE

UNIVERSAL PERMISSIVE LICENSE
