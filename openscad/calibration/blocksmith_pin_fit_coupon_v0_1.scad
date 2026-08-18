/*
Blocksmith horizontal pin-fit coupon v0.1
11 holes: 3.00 mm through 3.50 mm in 0.05 mm steps.
Print flat in the displayed orientation with no supports.
This source requires an OpenSCAD render before STL export.
*/
$fn = 48;
hole_sizes = [3.00, 3.05, 3.10, 3.15, 3.20, 3.25, 3.30, 3.35, 3.40, 3.45, 3.50];
coupon_length = 132;
coupon_depth = 14;
coupon_height = 14;

difference() {
  cube([coupon_length, coupon_depth, coupon_height]);
  for (i = [0 : len(hole_sizes) - 1]) {
    translate([8 + i * 11.6, -1, coupon_height / 2])
      rotate([-90, 0, 0])
        cylinder(h = coupon_depth + 2, d = hole_sizes[i]);
  }
}

