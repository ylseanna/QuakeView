# Manual

> _This manual is still being written - sorry for the inconvenience - images are provided to serve as an initial guide._

This guide assumes you have succesfully [installed](installation.md) the program on your operating system.

## Importing files

QuakeView is primarily an earthquake catalog visualisation program, hence the first step is almost always to load an earthquake catalog into the program. Catalogs are loaded as delimiter-seperated values text files, where currently supported delimiters are commas (CSV file format) and whitespaces.

/// details | **Usage tip:** Check your catalogs
    type: warning
Always inspect catalogs before loading them into QuakeView, sometimes - particularly when working cross-platform - file formats may get confused, special characters may invalidate entries, or missing values (e.g. `NaN`) can break internal consistency. All of these issues, and more, may break loading into QuakeView.

_If you encounter an issue that you believe should not invalidate your catalog, feel free to contact the developers or submit an issue on [Github](www.github.com/ylseanna/QuakeView/issues), so we can see if we can add support for a new feature._
///

To select a file, hit the "Choose file" button in the configuration tab (Figure )

![Configuration Tab](img/manual/Page 1.png)
/// figure-caption | #file-loading
File selection
///

### File overview

![Table view](img/manual/Page 2.png)

### Parsing configuration

![Table view](img/manual/Page 3.png)

## Table view

![Table view](img/manual/Page 4.png)

## Map view

![Table view](img/manual/Page 5.png)

### Timeline

#### Timeline bar

![Table view](img/manual/Page 6.png)

#### Timeline controls

![Table view](img/manual/Page 7.png)

### Sidebar

#### Layer tab

![Table view](img/manual/Page 8.png)

#### Formatting tab

![Table view](img/manual/Page 9.png)

![Table view](img/manual/Page 10.png)

#### Filtering tab

![Table view](img/manual/Page 11.png)

## 3D view

![Table view](img/manual/Page 12.png)

## Time vs. magnitude plot

![Table view](img/manual/Page 13.png)

## Magnitude vs. frequency plot

![Table view](img/manual/Page 14.png)
