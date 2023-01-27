#!/usr/bin/env python3
import random


def roll(value: float):
    """Transform a float value roughly between 0 and 1 into a number between 0 and 10"""
    return round(max(0, min(10, value * 10)))


def lognormal(adjust: float):
    return roll(random.lognormvariate(0, 1 + adjust) / 2.5)


def normal(adjust: float):
    return roll(random.normalvariate(0.5, 0.3 + adjust))


def uniform(_adjust: float):
    return round(random.uniform(0, 10))


def triangular(adjust: float):
    return round(random.triangular(0, 10, 5 + adjust * 2))


def beta(adjust: float):
    return roll(random.betavariate(2.5 + adjust, 2))


def expo(adjust: float):
    return roll(random.expovariate(3 + adjust))


def weibull(adjust: float):
    return roll(random.weibullvariate(0.5, 1.5 + adjust / 2))

def powerroll(adjust: float):
    hit = random.choice((True, False, False, False, False))
    x = random.expovariate(1 + adjust / 5)
    if hit:
        x = 10 - x
    return round(max(0, min(10, x)))


frames = round(random.uniform(120, 150))
distributions = [lognormal, normal, uniform, triangular, beta, expo, weibull]
participants = [
    "Asa Datafraz",  # Safra Ada Catz
    "Ella Snyrriol",  # Larry Ellison
    "Eve Stermball",  # Steve Ballmer
    "Eve Stojbs",  # Steve Jobs
    "Flo Cary Irina",  # Carly Fiorina
    "Furrow Bent Ban",  # Warren Buffet
    "Kicko Swan Sju",  # Susan Wojcicki
    "Kim Octo",  # Tim Cook
    "Lua Sis",  # Lisa Su
    "Maj Cak",  # Jack Ma
    "Missy Miljonn",  # Jimmy Nilsson
    "Mule Skon",  # Elon Musk
    "Page Lyrar",  # Larry Page
    "Ray Jeckdos",  # Jack Dorsey
    "Ray Rambar",  # Mary Barra
    "Scharon Slog",  # Carlos Ghosn
    "Scuid Piranha",  # Sundar Pichai
    "Yatas Del Lana",  # Satya Nadella
    "Yoni Inroad",  # Indra Nooyi
    "Zerkk MacBurger",  # Mark Zuckerberg
    "Zoe Bjeffs",  # Jeff Bezos
]
scorecard = []
for p in participants:
    distribution = hash(p) % len(distributions)
    distribution = distributions[distribution]
    adjustment = random.uniform(0, 1)
    series = []
    for _ in range(frames):
        if p == "Mule Skon":
            first_score = powerroll(adjustment)
            remaining = 10 - first_score
            second_score = round(powerroll(adjustment) * remaining / 10)
            series.append(first_score)
            if first_score < 10:
                series.append(second_score)
        else:
            frame_score = distribution(adjustment)
            first_score = min(frame_score, distribution(adjustment))
            second_score = frame_score - first_score
            series.append(first_score)
            if first_score < 10:
                series.append(second_score)
    scorecard.append((p, series))

for name, series in scorecard:
    print(f"{name} {' '.join(map(str, series))}")
