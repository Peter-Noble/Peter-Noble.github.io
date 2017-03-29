---
permalink: "/cm/actionSync/"
layout: default
---

# Action Synchronisation

<iframe src="https://player.vimeo.com/video/210320911" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

The following describes the inner workings of the action synchronisation system but the interface presented to the user almost all of this detail. The user simply has to to define how agents score each other, which is almost identical to how they'd detect obstacles to avoid.

Action synchronisation is one of the few components of the simulation where decisions aren't actually made by individual agents (along with formations). There is a central object (called the Sync Manager) that receives requests and then makes a global decision on how to pair up agents. The results are fed back to the agents in the next frame and they behave as if the decision had been made locally.

The user might provide this list of possible action pairs:

Attack1 - Defend1

Attack1 - Death1

On a given frame each agent can submit any number of requests to the Sync Manager telling it which actions it can perform with which other agents and gives each request a score. Higher scores represent more fitting actions. eg. Agent One might submit the following requests:

1.1) Attack1, Agent Two, 0.2

1.2) Defend1, Agent Three, 0.7

Lets also imaging that Agent Two has submitted just one request:

2.1) Attack1, Agent One, 0.4

2.2) Attack1, Agent Three, 0.9

And Agent Three has sumbitted:

3.1) Attack1, Agent One, 1.0

3.2) Attack1, Agent One, 0.6

3.3) Defend1, Agent Two, 0.7

![Example](/images/CrowdMaster/ActionSync/requestsExample.png)

Note that the same action can appear in more than one request. This is valid since these actions might be associated to different states in the agents state machine so picking one over the other may have an impact on the agents state in the future.

The valid pairings of requests are (the score of each pair is the product of the values of each request):

a) 1.2 & 3.1) 0.7 * 1.0 = 0.7

b) 1.2 & 3.2) 0.7 * 0.6 = 0.42

c) 2.2 & 3.3) 0.9 * 0.7 = 0.63

No candidate pairings exist between 1 and 2 because Attack1-Attack1 is no a valid pair listed by the user.

![Example](/images/CrowdMaster/ActionSync/pairingsExample.png)

The Sync Manager then selects pairs in a greedy fashion but only selects pairs including agents that haven't already been selected. This means that even though there is a pair between 2 and 3 with a good score they won't be selected since 3 has a pairing with 1 that has a higher score.

### Optimality of solution

The solution is not optimal. However, there are a few properties that make this method a good one.

* The solution is always within a factor of 2 of the optimal.
* It's extremely fast to compute.
* It makes sense intuitively. Agents should always try and pick the best available option and don't have a global awareness so in reality the solution wouldn't be optimal.
