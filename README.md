# Mod Generator
A generator for NeoForge mods.

This project is designed to work both in browsers via an embeddable Vue.js app,
and as a CLI tool.

## Development
The core mod generator tool is contained in `src/generator`, and is consumed in two ways:
- via `src/cli/cli.ts`, the CLI entrypoint.
- via the Vue.js app, whose entrypoint is `src/main.ts`, and with most of the logic in `src/components`.

Some helpful commands during development: (see the scripts in `package.json`)
- `npm run dev`: Starts a server that serves the web app with hot-reloading, for development.
- `npm run test-generate-mdg`: Generates a mod project from the CLI interface.

> [!WARNING]
> Some files such as `index.html` and anything under `public/` are only used in development,
> and will not affect production deployment!

## Deployment (web)
Run `npm run build` to build the Vue.js app.
It will produce the `dist/mod-generator.js` and `dist/mod-generator.css` files,
which contain the app for usage in any web page.
Just include these files, and the tag with `id="mod-generator-app"` will contain the app.

Note that every commit to `main` will cause these two files to be deployed to GitHub pages,
for consumption from the [NeoForged website](https://github.com/neoforged/websites).

Once the app is built, you can run `npm run preview` to serve the files in `dist/`.
This can be useful to test the built files locally.

## Deployment (CLI)
Details are still to be determined.
A good starting point are the scripts in `package.json`.
