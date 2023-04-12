#!/usr/bin/env python3
import collections
import csv
import math
import random
from pprint import pprint

names = collections.defaultdict(list)
velocities = {}
systems = dict()


def to_coordinates(ra: float, dec: float, d: float) -> (float, float, float):
    x = math.cos(dec) * math.cos(ra) * d
    y = math.cos(dec) * math.sin(ra) * d
    z = math.sin(dec) * d
    return (x, y, z)


with open("isdb/ProperNames.csv") as f:
    it = csv.reader(f)
    next(it)
    for line in it:
        name = line[1]
        if name.replace(" ", "").isalpha():
            names[line[0]].append(line[1])

with open("isdb/Velocities.csv") as f:
    it = csv.reader(f)
    next(it)
    for line in it:
        id = line[0]
        if line[1]:
            velocities[id] = float(line[1])

with open("isdb/Positions.csv") as f:
    it = csv.reader(f)
    next(it)
    for line in it:
        id = line[0]
        if id in names and id in velocities:
            name = names[id][0]
            velocity = velocities[id]
            if line[7]:
                d = float(line[7])
                ra_h, ra_m, ra_s = map(float, line[1:4])
                dec_h, dec_m, dec_s = map(float, line[4:7])
                ra = 2 * math.pi * (ra_h / 24 + ra_m / 60 + ra_s / 3600)
                dec = math.radians(dec_h + dec_m / 60 + dec_s / 3600)
                x, y, z = to_coordinates(ra, dec, d)
                if line[7] and float(line[7]):
                    systems[name] = (x, y, z, velocity)

map = random.choices(list(systems.items()), k=15)

with open("../public/test-flight/map.txt", "w") as f:
    for name, position in map:
        print(f"{name} {position}", file=f)
