# elections
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/frcroth/elections.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/frcroth/elections/context:javascript)  
This tool allows you to simulate elections. Place candidates and voters on a political coordinate system, and compare different voting systems to get different results.

![](doc/Screenshot_20210126.png)

[Try it](https://frcroth.github.io/elections/)

### Mechanisms

Currently implemented voting mechanisms for a single seat:
- [First past the post](https://en.wikipedia.org/wiki/First-past-the-post_voting)
- [Instant runoff](https://en.wikipedia.org/wiki/Instant-runoff_voting)
- [Borda count](https://en.wikipedia.org/wiki/Borda_count)
- [Bucklin voting](https://en.wikipedia.org/wiki/Bucklin_voting#Voting_process)
- [Condorcet method](https://en.wikipedia.org/wiki/Condorcet_method)
- [Approval voting](https://en.wikipedia.org/wiki/Approval_voting)  

For multiple seats:
- [Sainte-Laguë method](https://en.wikipedia.org/wiki/Webster/Sainte-Lagu%C3%AB_method) 
- [Largest Remainder method](https://en.wikipedia.org/wiki/Largest_remainder_method) with different quotas
- [D'Hondt method](https://en.wikipedia.org/wiki/D%27Hondt_method)
- [Huntington-Hill method](https://en.wikipedia.org/wiki/Huntington%E2%80%93Hill_method)
- Individual candidates
### Usage

Add voters by clicking into the coordinate system. Add candidates by clicking into the coordinate system and setting the appropriate draw mode.  
Party names are just for flavor and do not have any real political meaning or valuation.  
Select a Voting mechanism and look at the results.

### Deployment

Install dependencies with `npm i`.

Start the webpack dev server with `npm start`.

Run `npm run deploy` to deploy to gh-pages.
