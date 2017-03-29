---
permalink: "/cm/pathFollowing/"
layout: default
---

# Path Following

<iframe src="https://player.vimeo.com/video/210671829" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<iframe src="https://player.vimeo.com/video/210672031" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

There are plenty of resources explaining how to implement path following available such as the link below. These are a good starting point but I felt it could be improved to make it quicker and easier to get good path following behaviour.

<a href="https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-path-following--gamedev-8769"> gamedev - Path following </a>

Firstly, agents don't aim for the next vertex on the path but at a point offset by the agents own offset from the closest point on the path.

![Example](/images/CrowdMaster/PathFollowing/pathOffset.png)

The path is marked in black, the black triangle is the agent with it's heading marked with an arrow. The red dotted line is the offset to the nearest point on the path. The blue dashed arrow starts at the point on the path closest to the agent and travels along the path in the direction the agent is heading by a constant factor of the velocity of the agent. The offset of the agent from the path is then added to the point reached and this is the target for the agent. The green arrow represents the stearing vector.

If this point is further from the path than the radius of the path the point is drawn in until it is within the radius. "Normal" path following can be mimicked by making the radius small and the agents rate of turning slower.

The advantage of this modification is that if many agents are following the same path then they will naturally remain separated and not clump together. It will also stop agent from bouncing from edge to edge along a path. In reality if you are walking along a path you are likely to follow the curve of the path unless some other factor or extreme change in angle of the path causes you to adjust and it will stop every agent with some free space heading for the dead centre of the path.

Secondly, paths can be bidirectional and split. The agents will always follow the path which requires the smallest change in angle to follow. This makes setting up networks of paths easy. If no other factors influence the agent they tend to all make the same turning at a given junction but as soon as other influences (or even just a very small amount of random motion) is added this repeatative behaviour all but disapprears.
