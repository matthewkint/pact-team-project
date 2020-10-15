# CIS 425 - Pact

## How to start it?
1. Run a command to install npm dependencies inside the project directory where the package.json file is
```
npm install
```
2. Run server in node
```
node server.js // Or you can also use 'npm start'
```

## Workflow

### Your workflow
Note: Never commit or push changes to master, always do your work in branches
1. Pull master branch that you are working on in case there are new changes
2. If you want to start working on your own feature, create a new brach (i.e., you want to add a new div element to index.html, create a new branch called 'pretty-cool-div', move to the new branch).
3. Do your work
4. Once you are done with your feature, push the branch you have worked on _Note: "git push origin branch_name"_
5. Log in into github and create new pull request with comments. Once your changes are approved, the branch will be merged with master



## Git Reference 
Video Reference: https://www.youtube.com/watch?v=MnUd31TvBoU
### General commands
---
**KEEPING LOCAL REPO ON TRACK** Each time you are about to start working, make sure your main branch is up to date
```
git pull origin master    Note: "git pull origin branch_name"
```
**ADD TO BE COMMITTED FILES** This will add the files you choose to be ready to be committed
```
git add file_name        Note: You can use: "git add ." to add all changes
```
**COMMIT CHANGES/FILES** Commit edits/new files that you added in the previous step
```
git commit -m "Your message describing what you did"
```
**PUSH CHANGES** See Branches section

### Branches
---
**CREATE A BRANCH**: Before working on something, we have to create a new branch. Let's say you want to work on a new feature at this
point. You would create a branch named 'branch_name' like this: 

_Note: If a branch already exists, no need to create a new one. Branching will help us separate different tasks. You can also make a branch from a branch_
```
git branch branch_name
```
We have created a new local branch.

**SEE ALL BRANCHES**: If you want to see all the branches available to you, use:

```
git branch -a
```

**MOVE TO A BRANCH**: To move to a branch, use:

```
git checkout branch_name
```
You should be able to see your current branch next to the directory displayed in the console. Now you can do your work, edit, create, delete files, branch out more.

**PUSH BRANCH CHANGES TO GITHUB** When you are done with your work, you should push changes in your branch for a review to be merged with master branch. 
```
git push origin branch_name
```
**FINALLY** After pushing the branch with changes, go to the repository website and create a pull request with your comments. Ideally, someone should review the changes you made and confirm/comment on them. Make sure you have selected your branch on github before creating new pull request. (It will automatically detect your push and commit comments)

---

Project developed by: 
- Allie
- MaTtHEW
- Wendell
- Andrei
