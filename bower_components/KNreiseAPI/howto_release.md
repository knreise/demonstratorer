Release new versions
====================

This project lives as a [bower][bower] module, and in order to release a new version
the grunt plugin [grunt-bump-build-git][grunt-bump-build-git] is used.

In order to release a new version there are some steps to be taken:

1. Commit all your changes so that you have no uncommitted files 
2. run ```grunt build:{RELEASE_TYPE}``` where {RELEASE_TYPE} is either ```patch```, ```minor``` or ```major``` (see [semver][semver] spec for the difference)
3. Note the new version number reported (i.e. 1.1.1)
4. commit all the new files
5. tag the release: ```git tag 1.1.1```
6. push the tag to github: ```git push origin 1.1.1```

[bower]: http://bower.io
[grunt-bump-build-git]: https://github.com/blueimp/grunt-bump-build-git
[semver]: http://semver.org


Sample release output
---------------------

    ✔ ~/code/KNreiseAPI [master ↑·1|✚ 3⚑ 1] 
    10:31 $ git add .
    
    ✔ ~/code/KNreiseAPI [master ↑·1|●3⚑ 1] 
    10:31 $ git commit -m "add thumbnails for (some?) norvegiana images"
    [master 3679345] add thumbnails for (some?) norvegiana images
     3 files changed, 40 insertions(+), 4 deletions(-)
     rewrite dist/KNreiseAPI.min.js (71%)
    
    ✔ ~/code/KNreiseAPI [master ↑·2|⚑ 1] 
    10:31 $ git status
    On branch master
    Your branch is ahead of 'origin/master' by 2 commits.
      (use "git push" to publish your local commits)

    nothing to commit, working directory clean
    
    ✔ ~/code/KNreiseAPI [master ↑·2|⚑ 1] 
    10:31 $ grunt build:patch
    Running "build:patch" (build) task

    Running "bump:patch" (bump) task
    Updated bower.json version to 1.4.17
    Updated package.json version to 1.4.17

    Running "concat:dist" (concat) task
    File dist/KNreiseAPI.js created.

    Running "uglify:build" (uglify) task
    >> 1 file created.

    Done, without errors.
    
    ✔ ~/code/KNreiseAPI [master ↑·2|✚ 3⚑ 1] 
    10:32 $ git status
    On branch master
    Your branch is ahead of 'origin/master' by 2 commits.
      (use "git push" to publish your local commits)

    Changes not staged for commit:
      (use "git add <file>..." to update what will be committed)
      (use "git checkout -- <file>..." to discard changes in working directory)

            modified:   bower.json
            modified:   dist/KNreiseAPI.min.js
            modified:   package.json

    no changes added to commit (use "git add" and/or "git commit -a")
    
    ✔ ~/code/KNreiseAPI [master ↑·2|✚ 3⚑ 1] 
    10:32 $ git add .
    
    ✔ ~/code/KNreiseAPI [master ↑·2|●3⚑ 1] 
    10:32 $ git commit -m "release 1.4.17"
    [master afb6e6f] release 1.4.17
     3 files changed, 3 insertions(+), 3 deletions(-)
    
    ✔ ~/code/KNreiseAPI [master ↑·3|⚑ 1] 
    10:32 $ git tag 1.4.17
    
    ✔ ~/code/KNreiseAPI [master ↑·3|⚑ 1] 
    10:32 $ git push origin 1.4.17
    Counting objects: 93, done.
    Compressing objects: 100% (21/21), done.
    Writing objects: 100% (21/21), 3.31 KiB | 0 bytes/s, done.
    Total 21 (delta 14), reused 0 (delta 0)
    To git@github.com:knreise/KNReiseAPI.git
     * [new tag]         1.4.17 -> 1.4.17
    
    ✔ ~/code/KNreiseAPI [master ↑·3|⚑ 1] 
    10:32 $ git push origin 
    Total 0 (delta 0), reused 0 (delta 0)
    To git@github.com:knreise/KNReiseAPI.git
       6c13571..afb6e6f  master -> gh-pages
       6c13571..afb6e6f  master -> master
