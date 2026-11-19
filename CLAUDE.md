# ORQWA website

## Running commands

Node and npm are not installed on the host. Run `npm`, `node`, `astro` and any other project tooling inside the devcontainer (`.devcontainer/devcontainer.json`), never on the host.

- If the devcontainer is running, use it:
  ```sh
  C=$(docker ps -q --filter label=devcontainer.local_folder="$PWD")
  docker exec -u node -w /workspaces/website "$C" npm run build
  ```
- If it isn't running, start a throwaway container from the same image and volumes:
  ```sh
  docker run --rm -u node -w /workspaces/website \
    -v "$PWD":/workspaces/website \
    -v "$PWD/../orqwa/docs":/workspaces/orqwa/docs:ro \
    -v orqwa-website-node-modules:/workspaces/website/node_modules \
    -v orqwa-website-npm-cache:/home/node/.npm \
    -e ASTRO_TELEMETRY_DISABLED=1 \
    mcr.microsoft.com/devcontainers/javascript-node:24 npm run build
  ```
- The scripts are `npm run dev`, `build`, `preview` and `check`. For a dev server reachable from the host, run `npm run dev -- --host` and publish port 4321 (`-p 4321:4321` with `docker run`).
- The dependency rules still apply inside the container: no `npm install` of new packages, updates or `npx` fetches without approval.

## Fonts

- Use the site's text font (`var(--f-sans)`, Instrument Sans) for all new text: labels, numbers, captions, boxes.
- Don't use the mono font (`var(--f-mono)`, JetBrains Mono) for new elements, and don't add any other font. The existing round step-number pills are the only mono on the site.
- Set text in the same size as the sentence around it unless the design calls for a different size. Don't shrink inline elements (such as boxed UI names) to set them apart.
