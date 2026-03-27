<p align="center">
  <img src="https://github.com/ylseanna/QuakeView/blob/main/resources/icons/128x128.png" alt="QuakeView Icon"/>
</p>
<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" />
  </a>
</p>


# QuakeView

QuakeView is an interactive visualisation program for earthquake catalogues, developed at the University of Iceland. It aims to allow for rapid importing and analysis of large earthquake catalogs.

QuakeView is an open-source program written in react/next.js, with a python back-end and runs in an electron wrapper.

Binaries and how-to-guides can be found in the Github releases on this page or in the [documentation](https://quakeview.readthedocs.io/).

## Features

- Importing of arbitrary `.csv` catalogs, with in-program import and filtering controls
- GPU powered 2D and 3D maps of the imported events (tested up to 1.8 million events)
- Dynamic formatting of events, e.g. opacity, color(maps)
- Select graph-based views
- Dynamic GPU-based time filtering of events, which can be animated to show temporal evolution of the data

## Contact

<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#121;&#97;&#100;&#50;&#64;&#104;&#105;&#46;&#105;&#115;">&#89;&#108;&#115;&#101;&#32;&#65;&#110;&#110;&#97;&#32;&#100;&#101;&#32;&#86;&#114;&#105;&#101;&#115;</a> (<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#121;&#97;&#100;&#50;&#64;&#104;&#105;&#46;&#105;&#115;">&#121;&#97;&#100;&#50;&#64;&#104;&#105;&#46;&#105;&#115;</a>)

## Building from source

Create and activate a python environment (e.g. in conda) for running the flask python backend, by installing all the requirements in flask/requirement.txt:

```
pip install -r flask/requirements.txt
```

To set up the node requirements run:

```
npm install
```

### Development

For the development version, which will run an electron instance with live updates for the code, we run:
```
npm run dev
```

### Production

Before the program can be packaged, flask, next.js and electron have to be built individually:
```
npm run build
```
Then the packaged distributables (output in /release) are created by running:
```
npm run dist:<deb|msi|mac>
```
for linux, windows and mac respectively.

## Declarations

### Funding

The software was developed as part of a PhD project funded by grant nr. 2410397-051 from the Icelandic Centre for Research (RANNÍS). 
