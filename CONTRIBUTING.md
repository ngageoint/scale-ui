# Code
The Scale UI code lives under the [National Geospatial-Intelligence Agency Scale UI](https://github.com/ngageoint/scale-ui) repo. Due to the permissions set on the repo, new members of the team must be added to the `ngageoint` organization in order to merge code into master.
 
### Code Changes 
All development should be done on a feature branch. Branch names should follow the naming convention issue-<issue_number>. Example: branch issue-123 addresses the Scale UI GitHub issue number 123.

When development is complete, create a pull request to merge your branch into master. Include a short description of what the pull request addresses. If the pull request addresses a specific issue, put that issue number in the title naming it `Issue <issue_number> - Title of the issue`. Example pull request for GitHub issue 123 that fixes a job type table typo would look like: `Issue 123 - Job Type Table Typo`.

All commits on the master branch must follow the [Conventional Commits](https://www.conventionalcommits.org) format. When pull requests are merged, all commits must be squashed into one, and the commit message must use the imperative, present tense, e.g. "change", not "changed" nor "changes". Any commits done directly to master without first going through a pull request should be of type "chore".

### New Releases
To cut a new release, execute the command `npm run release`. This will update the project version and changelog according to all the commits made to master since the last release. Then those changes must be pushed to master by executing `git push --follow-tags origin master`.

# Issue Tracking
Scale 7.0+ Development issues are tracked using the the GitHub issue tracker on the [scale-ui repo](https://github.com/ngageoint/scale-ui/issues). Include a short, descriptive title and enough relevant information in the issue that any other team member would be able to work the issue without needing additional information.

# Testing
The Scale UI utilizes the angular CLI for building and testing. Instructions for building and testing are located in the Scale UI GitHub readme.

# External Dependencies
* [Docker](https://docs.docker.com)
* [Git](https://git-scm.com)
* [Node](https://nodejs.org) (If possible, install Node using Node Version Manager)
* [Node Package Manager](https://docs.npmjs.com/cli/install)

# Useful Tools
* [GitHub desktop](https://desktop.github.com/)
* [WebStorm](https://www.jetbrains.com/webstorm)
* [VSCode](https://code.visualstudio.com/download), Required Extension: EditorConfig, Recommended Extensions: TSLint, Bracket Pair Colorizer
* [Node Version Manager](https://github.com/nvm-sh/nvm#verify-installation)
