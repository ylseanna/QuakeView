<p align="center">
  <img src="https://github.com/ylseanna/QuakeView/blob/main/resources/icons/128x128.png" alt="QuakeView Icon"/>
</p>
<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" />
  </a>
  <a href="https://doi.org/10.5281/zenodo.19372719">
    <img src="https://zenodo.org/badge/1000148409.svg" alt="DOI">
  </a>
</p>

# QuakeView

QuakeView is an interactive visualisation program for earthquake catalogues, developed at the University of Iceland. It aims to allow for rapid importing and analysis of large earthquake catalogs. It is still in active development.

QuakeView is an open-source program written in React/Next.js, with a Python back-end and runs in an Electron wrapper.

Binaries and how-to-guides are available in the [documentation](https://quakeview.readthedocs.io/), or, for just the binaries, in the releases on this page.

## Features

- Importing of arbitrary `.csv` catalogs, with in-program import and filtering controls
- GPU powered 2D and 3D maps of the imported events (tested up to 1.8 million events)
- Dynamic formatting of events, e.g. opacity, color(maps)
- Select graph-based views
- Dynamic GPU-based time filtering of events, which can be animated to show temporal evolution of the data

## Contact

The developer can be contacted at:

<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#121;&#97;&#100;&#50;&#64;&#104;&#105;&#46;&#105;&#115;">&#89;&#108;&#115;&#101;&#32;&#65;&#110;&#110;&#97;&#32;&#100;&#101;&#32;&#86;&#114;&#105;&#101;&#115;</a> (<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#121;&#97;&#100;&#50;&#64;&#104;&#105;&#46;&#105;&#115;">&#121;&#97;&#100;&#50;&#64;&#104;&#105;&#46;&#105;&#115;</a>)

If you find a bug or wish to request a feature, you can go to the [issues](https://github.com/ylseanna/QuakeView/issues).

## Building from source

Create and activate a python environment (e.g. in conda) for running the flask python backend, by installing all the requirements in flask/requirement.txt:

```bash
pip install -r flask/requirements.txt
```

To set up the node requirements run:

```bash
npm install
```

### Development

For the development version, which will run an electron instance with live updates for the code, we run:

```bash
npm run dev
```

> **_NOTE:_** The branch "develop" is used for new features of QuakeView, it is semi-stable and is frequently rebased, so if you end up developing for QuakeView it may be of interest to start here. 

### Production

Before the program can be packaged, flask, next.js and electron have to be built individually:

```bash
npm run build
```

Then the packaged distributables (output in /release) are created by running:

```bash
npm run dist:<deb|msi|mac>
```

for linux, windows and mac respectively.

## Declarations

### Funding

The software was developed as part of a PhD project funded by grant nr. 2410397-051 from the Icelandic Centre for Research (RANNÍS).
