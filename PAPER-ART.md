# Paper in Bloom on kixizz.com

The first homepage flower opens `/cool-things`. That page links to the studio at `/paper-art`.
The studio is embedded from `/paper-art-studio/index.html` and ships with the existing portfolio deployment. No additional Vercel project or Git branch is required.

The editable source remains in https://github.com/kweeyo09/paper-art. The portfolio contains a static copy so production builds do not depend on fetching another repository. `client/public/paper-art-studio/SOURCE.json` records the copied commit.

After updating and committing the paper-art source, run these commands from this portfolio directory:

```powershell
node scripts/sync-paper-art.mjs
npm.cmd run check
.\node_modules\.bin\vite.cmd build
```

The sync script expects the source at `../../paper flower web/dist`. Supply a different dist path as its first argument if needed. Review, commit and push the updated portfolio files to main; the existing Vercel deployment publishes them on kixizz.com.

The window model, garden images and animation code are served with the site. There is no video streaming service or additional server required.
