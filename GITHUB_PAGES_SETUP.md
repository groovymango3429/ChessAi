# GitHub Pages Setup Guide

Follow these simple steps to deploy your Chess AI on GitHub Pages:

## Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/groovymango3429/ChessAi`
2. Click on **Settings** (gear icon) in the top menu
3. Scroll down to the **Pages** section in the left sidebar
4. Click on **Pages**

## Step 2: Configure Source

1. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select "main" (or your default branch)
   - **Folder**: Select "/ (root)"
2. Click **Save**

## Step 3: Wait for Deployment

1. GitHub will automatically build and deploy your site
2. This usually takes 1-3 minutes
3. You'll see a message: "Your site is live at https://groovymango3429.github.io/ChessAi/"

## Step 4: Access Your Game

Once deployed, you can access your Chess AI at:
```
https://groovymango3429.github.io/ChessAi/
```

Share this URL with friends to play against your chess AI!

## Troubleshooting

### Site not loading?
- Wait a few more minutes - deployment can take up to 5 minutes
- Check that the branch name is correct (usually "main")
- Ensure index.html is in the root directory (not in a subfolder)

### Updates not showing?
- Changes may take a few minutes to propagate
- Try hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache if needed

### Chess board not displaying?
- Check browser console (F12) for errors
- Ensure chess.js is in the same directory as index.html
- Verify that both files are committed to the repository

## Custom Domain (Optional)

If you have a custom domain:
1. In the Pages settings, add your custom domain
2. Update your domain's DNS settings (see GitHub's guide)
3. Wait for DNS propagation (can take up to 48 hours)

## Updating Your Chess AI

To update the game after making changes:
1. Commit your changes locally
2. Push to the main branch
3. GitHub Pages will automatically rebuild and deploy
4. Changes will be live in 1-3 minutes

## Features to Enable

Your Chess AI already includes:
- ✅ Responsive design (works on mobile)
- ✅ Multiple difficulty levels
- ✅ Undo move functionality
- ✅ Position evaluation display
- ✅ Move highlighting
- ✅ Modern UI design

Enjoy your chess game! 🎮♟️
