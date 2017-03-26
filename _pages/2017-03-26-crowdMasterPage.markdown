---
permalink: "/cm/octree/"
layout: default
title:  "CrowdMasterPage"
date:   2017-03-01 15:33:33 +0000
categories: blender development
img: CM-logo.png
priority: 10
tagLine: "Crowd simulation tool page"
---

# Octrees

>NOTE: This was written in relation to InAIte which is now no longer active. The code from InAIte became the base of what is now CrowdMaster.

>NOTE: since writing this Blender now exposes it's implementation of a KD-tree. Although it has the same asymptotic run time as my octree it has been efficiently implemented in C++ which makes the runtimes much better in practice and reduces the .

While experimenting with my crowd simulation plugin (https://github.com/Peter-Noble/InAIte) I noticed that using what I call sound channels which allow agents to "hear" each other the speed of the simulation dropped dramatically. The time complexity of a large portion of the system is linear but if every agent uses sound then the system is definitely O(n^2) which results in unacceptable run times. To try and improve this I implemented an octree in python. This post is to summarize the results of the exercise.

I used the following scene which contains 8000 spheres to run the tests and in all the tests that have less that 8000 objects I simply ignore a portion of them. The tests were run on a quad core i7 laptop at 3.4Ghz and is single threaded.

![Lots of spheres](/images/CrowdMaster/Octree/InAIte_octreeBenchmarkSetup.png){:class="img-responsive"}

The octree was used to narrow down the possible matches when checking if a point was in any of the spheres and used to suggest pairs of spheres to check for a collision between. To compare I also made the same same check with a brute force search. The 4 times measured were:
    1) Construction time - The time it took to put together the data structure. This included computing the bounding sphere for the brute force test.
    2) Check 10000 points - The time it took to check which spheres each of 10000 randomly chosen points were in.
    3) Check N points - The time it took to check which spheres each of N randomly chosen points were in. This is representative of how the crowd sim uses these checks.
    4) Find all collisions - The time it took to create a list of all overlapping spheres.

The results were as follows:

![Results](/images/CrowdMaster/Octree/InAIte_octreeVsUnaccelerated.png){:class="img-responsive"}

Enlarged to a range of objects that is more realistic for a crowd sim:

![Enlarged results](/images/CrowdMaster/Octree/InAIte_octreeVsUnacceleratedZoomed.png){:class="img-responsive"}

Even for very small numbers of objects the octree is significantly fasters. The following is an enlarged view of times taken by just the octree:

![Benchmark](/images/CrowdMaster/Octree/InAIte_octreeBenchmark.png){:class="img-responsive"}

For a simulation run inside Blender it is currently unfeasible to run a simulation with 8000 objects and there are other aspects of the simulation which would cause the runtime to be too high by this point. However, it would be desireable to one day have the simulation run near real time even with a couple of hundred agents but this graph shows that the current construction time for the octree maybe a limiting factor for this.

The code for these tests and the octree can be found along with the rest of the code for the crowd simulator here:
<a href="https://github.com/Peter-Noble/InAIte/blob/master/iai_channels/libs/ins_octree.py">Github</a>
