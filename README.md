# Trailhead Stats GitHub Action
[![GitHub Super-Linter](https://github.com/nabondance/Trailhead-Stats/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/nabondance/Trailhead-Stats/actions/workflows/ci.yml/badge.svg)

## Description

**Trailhead Stats** is a GitHub Action created to dynamically display Trailhead
statistics based on a specified Trailhead username. This action can be used to
showcase your Trailhead achievements, such as badges, points, ranks, and
certifications, directly in your GitHub repository's README or other markdown
files.

## Inputs

### `trailhead-username`

**Required** The username on Trailhead. **Default:** `username`

### `display-type`

The type of display output. Options: `text`, `card`, `output`. **Default:**
`text`

### `display-file`

The file to update for displaying the Trailhead stats. **Default:** `README.md`

### `output-only`

Set to true to only output the stats without modifying the file. **Default:**
`false`

## Outputs

### `stats`

The fetched Trailhead stats.

## Usage

To use this action in your workflow, add the following step:

```yaml
- uses: nabondance/trailhead-stats@main
  permissions:
    contents: write
  with:
    trailhead-username: 'your_trailhead_username'
    display-type: 'text' # Optional
    display-file: 'README.md' # Optional
    output-only: false # Optional
```

This will fetch your Trailhead stats and display them in the specified format.

## Special Tags in Display File

To insert the Trailhead stats into your display-file (like README.md), you need
to place special comment tags in your file. These tags define where the
Trailhead stats will be inserted or updated.

Insert the following tags in your file:

```markdown
<!--TH_Stats:start-->
<!--TH_Stats:end-->
```

The action will automatically update the content between these tags with the
latest Trailhead stats. Ensure these tags are in place for the action to work
correctly.

## Example Workflow

Here's an example of a complete workflow using the Trailhead Stats action:

```yaml
name: Update Trailhead Stats

on:
  schedule:
    - cron: '0 0 * * *' # Runs daily

jobs:
  update-stats:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: nabondance/trailhead-stats@main
        with:
          trailhead-username: 'your_trailhead_username'
```

This workflow will update your Trailhead stats in your repository's README.md
daily.

## Troubleshooting

Having issues with the Trailhead Stats GitHub Action? Here are some common
problems and their solutions:

### Common Issues

#### 1. **Stats Not Updating**

**Problem:** The Trailhead stats in the README file are not updating.
**Solution:** Ensure that the `<!--TH_Stats:start-->` and `<!--TH_Stats:end-->`
tags are correctly placed in your `display-file`. The action updates the content
between these tags.

---

#### 2. **Git Command Fails**

**Problem:** The Git commands fails during execution. **Solution:** Check that
you granted the content:write permission for the job in your workflow.

---

#### 3. **GitHub Action Fails**

**Problem:** The GitHub Action fails during execution. **Solution:** Check the
action logs in your repository's "Actions" tab for specific error messages.
Common issues include incorrect input parameters or network issues.

---

#### 4. **Incorrect Trailhead Username**

**Problem:** The stats displayed do not match your Trailhead profile.
**Solution:** Verify that the `trailhead-username` input is correctly set to
your Trailhead username. The username should match exactly with your Trailhead
profile.

---

### Advanced Troubleshooting

If you're experiencing other issues, try the following steps:

- **Check GitHub Action Version:** Ensure you are using the latest version of
  the Trailhead Stats GitHub Action.
- **Review Workflow File:** Double-check your workflow file for syntax errors or
  misconfigurations.
- **Manual Trigger:** Try running the workflow manually from the "Actions" tab
  to see if the issue persists.

Still need help? Feel free to open an issue on the
[GitHub repository](https://github.com/nabondance/Trailhead-Stats/issues) with a
detailed description of your problem.

## Customization

You can customize the action by changing the input parameters as per your
requirement.

## Contribution

Contributions to the Trailhead Stats GitHub Action are welcome. Please feel free
to fork the repository, make changes, and create a pull request.

## Future features

Ideas I have in mind, in no particular order:

- select the language
- more styling (html and card)
- more data
- add more options to select what to display
- display rank icon
- better versioning and releases
- find a way to remove the required permission
