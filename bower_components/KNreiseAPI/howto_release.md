Release new versions
====================

This project lives as a [bower][bower] module, and in order to release a new version
the grunt plugin [grunt-bump-build-git][grunt-bump-build-git] is used.

In order to release a new version there are some steps to be taken:

1. Commit all your changes so that you have no uncommitted files 
2. run ```grunt release:{RELEASE_TYPE}``` where {RELEASE_TYPE} is either ```patch```, ```minor``` or ```major``` (see [semver][semver] spec for the difference)
3. Note the new version number reported (i.e. 1.1.1)
4. commit all the new files
5. tag the release: ```git tag 1.1.1```
6. push the tag to github: ```git push origin 1.1.1```

[bower]: http://bower.io
[grunt-bump-build-git]: https://github.com/blueimp/grunt-bump-build-git
[semver]: http://semver.org
