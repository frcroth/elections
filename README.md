# elections
This tool allows you to simulate elections. Place candidates and voters on a political coordinate system, and compare different voting systems to get different results.

![](doc/Screenshot_20201121.png)

[Try it](https://frcroth.de/elections/)

### Mechanisms

Currently implemented voting mechanisms:
- [First past the post](https://en.wikipedia.org/wiki/First-past-the-post_voting)
- [Instant runoff](https://en.wikipedia.org/wiki/Instant-runoff_voting)
- [Borda count](https://en.wikipedia.org/wiki/Borda_count)
- [Bucklin voting](https://en.wikipedia.org/wiki/Bucklin_voting#Voting_process)
- [Condorcet method](https://en.wikipedia.org/wiki/Condorcet_method)
### Usage

Add voters by clicking into the coordinate system. Add candidates by clicking into the coordinate system and setting the appropriate draw mode.  
Party names are just for flavor and do not have any real political meaning or valuation.  
Select a Voting mechanism and look at the results.

### Deployment

All Javascript is client side so no special server is required. Just clone the repository and open index.html in a browser. Tested in Mozilla Firefox 84.
