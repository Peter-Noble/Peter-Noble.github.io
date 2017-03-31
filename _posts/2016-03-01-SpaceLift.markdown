---
layout: post
title:  "Space Lift"
date:   2017-03-01 17:34:33 +0000
categories: film
tagLine: "Award winning short film"
img: spaceLift/thumbnail.png
priority: 5
---

I ran a film workshop to produce a film that won a competition to be screened on the International Space Station!

<iframe src="https://player.vimeo.com/video/153402713" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<iframe src="https://www.youtube.com/embed/BY-ITmr0pTs" class="embed-content"></iframe>

In January of this year I worked with INTO FILM and a fantastic bunch of students at Sawston Village College to help them make a film on the theme of "Space exploration". The film won for its age category, which was announced by a video from the astronaut Tim Peake from the International Space Station (ISS) where he also viewed the winning films.

We had just a few hours to devise the piece and then only had about five hours to shoot the film the next day. My role was to guide them through the process and help them to do as much as possible on their own. They all worked very hard on their story and picked up the technical skills incredibly quickly. I then had to return to Durham University for the beginning of term and complete the editing and VFX while away. While I was doing that the kids were hard at work writing and recording the poem for the voice over. Adobe Premiere Pro was used to edit, BMD Fusion 8 for compositing, Blender 3D to model the space classrooms and mocha Pro for some tracking.

Due to the very tight deadline I decided to try Fusion's 3D features which turned out being a great decision because it was so easy to make changes and the render times are orders of magnitude better than a GI raytracer.

![alt text]({{site.baseurl}}/images/spaceLift/1.png)

![alt text]({{site.baseurl}}/images/spaceLift/2.png)

![alt text]({{site.baseurl}}/images/spaceLift/3.png)

The second example cheats a little bit because it renders the 3D scene with a static camera and the result is then 2D tracked onto the wall. Having the 3D still helped because it allowed the 3D to be repositioned interactively to very quickly get the right perspective.

Overall lots of fun and the whole VFX process went fairly smoothly. The only part which was really frustrating was exporting from Premiere to Fusion. I ended up creating a linked AE comp, rendering as exr and then importing those into Fusion. A potential alternative which is now possible would be to do the first edit in Premiere then move to Davinci Resolve which now links nicely to Fusion.
