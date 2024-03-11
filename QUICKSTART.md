# Trailhead Stats GitHub Action Quickstart

Welcome to the Trailhead Stats GitHub Action! This action allows you to
automatically update your Trailhead badges and points on your GitHub profile
README. We consider that you don't have a GitHub profile readme yet, otherwise,
follow the [README.md](./README.md).

## Prerequisites

- A GitHub account
- A Salesforce Trailhead account
- 2 minutes of your time

## Step 1: Setup Your Profile README

1. Log in your GitHub account
1. Go to
   [Trailhead-Stats-template](https://github.com/nabondance/Trailhead-Stats-template)
1. Click on the green button **Use this template**
1. Select **Create a new repository**
1. Select your personal GitHub account as **Owner**
1. Type your exact username as **Repository name**
1. Select **Public**
1. Click **Create repository**

## Step 2: Specify your trailhead username

1. Go to your newly created profile repository
1. Go to `.github/workflows/Trailhead-Stats.yml`
1. Put your Trailhead username instead of `your_trailhead_username`
1. Save and commit
1. And voilà ! The GitHub action will run once a day and update your profile
   readme with your Trailhead stats

## Step 3: Check the Action

1. Go to the **Actions** tab
1. Click on **Update Trailhead Stats**
1. Click on the grey **Run workflow**
1. Click on the green **Run workflow**
1. Watch the workflow running
1. Check that it is all green

## Step 4: To go Further

### More configuration

You can adjust the cron schedule in the workflow file to update your stats more
or less frequently. Customize the action further if needed, based on the
action's [documentation](https://github.com/nabondance/Trailhead-Stats).

### Enhanced GitHub profile readme

You can edit your README.md to add more information about yourself, see more
explanation
[here](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
Don't remove the specific tag needed by the action, you can write things before
or after but not in between the tags.

## Thank you

Thank you for using Trailhead Stats GitHub Action! Happy learning and sharing
your Salesforce journey! Do not hesitate to contribute and read more on the
[Trailhead Stats](https://github.com/nabondance/Trailhead-Stats) repository.
