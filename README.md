# ORQWA website

The static website of [ORQWA](https://github.com/ORQWA/ORQWA): the start page, how ORQWA works
and the download page, in English and German. Built with [Astro](https://astro.build) and
published on GitHub Pages.

## Develop

Everything runs in the VS Code dev container (`.devcontainer/`); nothing is installed on the
host. It needs Docker and a checkout of ORQWA next to this folder (`../orqwa`): the screenshots
come from its `docs/images`, through the `orqwa-docs` link.

1. Open the folder in VS Code and choose **Reopen in Container**. The first start installs the
   dependencies.
2. In the container's terminal:

   ```sh
   npm run dev                      # http://localhost:4321, reloads on changes
   npm run build && npm run preview # the built site
   npm run check                    # type check
   ```

## How content stays current

- **Releases.** The build fetches the latest release from the GitHub API
  (`src/lib/release.ts`); `src/lib/release-fallback.json` is used when GitHub cannot be
  reached. In the browser, `src/scripts/release.ts` asks GitHub again (at most once an hour per
  visitor) and swaps in a newer release, so the page is right even before the next build.
  Release files are matched by name in `src/lib/assets.ts`; update the patterns there if the
  file names change.
- **Screenshots.** Listed in `src/lib/shots.ts`, read from ORQWA's `docs/images` at build time.
- **Rebuilds.** On every push, daily, and when ORQWA's CI sends an `orqwa-release` dispatch
  after publishing a release:

  ```yaml
  - name: Rebuild the website
    env:
      GH_TOKEN: ${{ secrets.WEBSITE_DISPATCH_TOKEN }}  # fine-grained token: Contents read/write on the website repo
    run: gh api repos/ORQWA/<website-repo>/dispatches -f event_type=orqwa-release
  ```

## Translations

German text lives in `src/i18n/de.json` (plus `de-attr.json` and `de-extra.json`), keyed by the
English text. Components write the English text and call `t(lang, '…')`; the build warns about
any English text without a German entry.

## The intro video

`public/media/intro.mp4` plays once per browser session. Its last frame is the logo on the
stage background, at `--logo-h` of the video's height (`global.css`), so the static logo sits
exactly on top of it: when the video ends, the logo shows and the video fades out underneath.
