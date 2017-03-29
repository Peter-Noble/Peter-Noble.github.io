---
permalink: "/cm/agentGeneration/"
layout: default
---

# Agent Generation

This is an aspect of CrowdMaster that I think is fairly unique and has the potential to be a really powerfull tool. Instead of placing agents by hand or using a premade layout tool this method instead allows artists to define how agents are generated.

![Example](/images/CrowdMaster/AgentGen/exampleAgentGenNodeTree.png)

This produces the following result:

![Example](/images/CrowdMaster/AgentGen/result.png)

Due to the random number generation in some nodes an artist can keep regenerating until they find a result that's exactly right.

This system is based on the builder pattern. Each node exposes a common interface to the next node, which means users can string together nodes in any order they like and build complex setups with just a few simple building blocks. When the user hit the "Generate Agents" button the build methods of any attached nodes are called. These in turn may call the build methods (possibly more than once) of their inputs and so the build request propagates through the graph.

This system can also be used to randomise props, materials and agent type in the same fashion.
