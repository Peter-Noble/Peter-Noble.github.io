---
permalink: "/cm/collisionPrediction/"
layout: default
---

# Collision prediction and avoidance

<iframe src="https://player.vimeo.com/video/210173152" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

From an early stage basic collision avoidance was supported by simply emitting a sound and then other agents would turn away from any sound they could hear. However, this didn't produce a result that looked like the agents were intelligent and as the whole goal of crowd simulation is to simulate real crowds where each member is actually intelligent. One way to improve the avoidance is to turn towards where there is a gap rather than turn away from nearby agents. This still doesn't make much of a difference to any case where agents are moving at any reasonable speed since they don't have the ability to predict where other agents will be in the future.

The sort of method described above is demonstrated on this website:
<a href="https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-collision-avoidance--gamedev-7777"> gamedev - Collision avoidance</a>

This technique works well for static obstacles but not other agents. Some work arounds can be made in the agents brain but these very quickly become complex and make the simulator very difficult of non-programmers to use.

The first solution I tried was to assume all agents travel at a constant velocity, cast a straight line out from each agent in that direction and then for every other agent say "Where will they be at the time I pass closest to their line?". This produced good results (see below) but it was difficult to deal with agents with a significant size compared to their velocity.

<iframe src="https://www.youtube.com/embed/mO_XvHIlfr0" class="embed-content" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen"></iframe>

The second (and better) solution was to predict the distance between agents assuming they are travelling at a constant velocity. This produces a quadratic equation which can very easily be adjusted to include the size of the agents by simply subtracting the radius of each agent from the constant term. There will be a collision between the agents if the quadratic equation has any roots. The two solutions are then used to determine the priority of the potential collision and how to steer to avoid it.

Both of these methods can still use the KD-tree to accellerate them to keep the runtime below O(n^2) (although it still takes longer to execute than non predicitive collision avoidance). 
