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
- **Rebuilds.** On every push and daily. A new release does not trigger a rebuild: the
  browser check above already shows it, and the daily build picks it up.

## The sample world

The download page offers the free sample world, Twann – Chasseral, as a file on this
repository's GitHub releases. The world is built in ORQWA/orqwa-worlds; the page links to a
fixed address (`SAMPLE_WORLD` in `src/lib/assets.ts`), so the tag and file name stay the same
for every version:
`https://github.com/ORQWA/orqwa.github.io/releases/download/sample-world/twann-chasseral.oqx`.

1. Seal the world with the maintainers' world key, never the development key (orqwa-worlds'
   README and its `docs/signing-worlds.md`).
2. Check it with a released `orqwa-cli`. It must name the world key as signer; a released ORQWA
   refuses a file sealed with the development key:

   ```sh
   "$ORQWA_CLI" world-check twann-chasseral.oqx
   ```

3. The first time, create the release with the file and the notes below (`release-notes.md`):

   ```sh
   gh release create sample-world -R ORQWA/orqwa.github.io \
     --title "Sample world: Twann – Chasseral" --notes-file release-notes.md \
     twann-chasseral.oqx
   ```

4. For a new version, replace the file and update the notes. The link stays the same; while
   the file uploads, it is briefly missing.

   ```sh
   gh release upload sample-world -R ORQWA/orqwa.github.io --clobber twann-chasseral.oqx
   gh release edit sample-world -R ORQWA/orqwa.github.io --notes-file release-notes.md
   ```

5. If the file's size changed, update `size` in `SAMPLE_WORLD`: the page shows it in MB.

The notes carry the world's credits. Canton Bern's terms bind whoever receives its data, so
they also say that the geodata stays under its providers' terms:

```markdown
Twann – Chasseral, version 0.1: the road from Twann on Lake Biel up to the Chasseral,
20.4 km and 1,190 m of climbing, as a detailed 3D world for ORQWA. Free to download and ride.

Credits
- Geodata © swisstopo (modified)
- Amtliche Vermessung © Amt für Geoinformation des Kantons Bern
- Bundesamt für Statistik; Eidg. Gebäude- und Wohnungsregister
- Surface detail: ambientCG (CC0)

The geodata in this world remains under its providers' terms of use.
```

## Translations

German text lives in `src/i18n/de.json` (plus `de-attr.json` and `de-extra.json`), keyed by the
English text. Components write the English text and call `t(lang, '…')`; the build warns about
any English text without a German entry.

## The intro video

`public/media/intro.mp4` plays once per browser session. Its last frame is the logo on the
stage background, at `--logo-h` of the video's height (`global.css`), so the static logo sits
exactly on top of it: when the video ends, the logo shows and the video fades out underneath.
