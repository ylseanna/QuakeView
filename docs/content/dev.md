# Development

QuakeView is a node program using Electron and Next.js written in Typescript, hence Node.js is required to run the app (for installation see e.g. [npm website](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)). Most installation steps are handled by pre-configured scripts in the `package.json` file.

The Python installation can be handled by any python environment manager.

## Building from source

Git clone the repository into a directory.

Create and activate a Python environment (e.g. in conda) for running the Flask Python backend, by installing all the requirements in flask/requirement.txt:

```bash
pip install -r flask/requirements.txt
```

To set up the node requirements run:

```bash
npm install
```

### Development build

For the development version, which will run an Electron instance with live updates for the code, we run:

```bash
npm run dev
```

### Production build

Before the program can be packaged, Flask, Next.js and Electron have to be built individually:

```bash
npm run build
```

Then the packaged distributables (output in /release) are created by running:

```bash
npm run dist:<deb|msi|mac>
```

for Linux, Windows and Mac respectively.

<!-- ## Program description

### Dependencies -->