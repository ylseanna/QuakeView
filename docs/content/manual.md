# Manual

> _This manual is still being written - sorry for the inconvenience - images are provided to serve as an initial guide._

This guide assumes you have succesfully [installed](installation.md) the program on your operating system.

## Importing earthquake catalog files

QuakeView is primarily an earthquake catalog visualisation program, hence the first step is almost always to load an earthquake catalog into the program. Catalogs are loaded as delimiter-seperated values text files, where currently supported delimiters are commas (CSV file format) and whitespaces.

/// details | **Usage tip:** Catalog integrity
    type: warning

Always inspect catalogs before loading them into QuakeView. Sometimes - particularly when working cross-platform - file formats may get confused, special characters may invalidate entries, or missing values (e.g. `NaN`) can break internal consistency. All of these issues, and more, may break loading into QuakeView.

_If you encounter an issue that you believe should not invalidate your catalog, feel free to contact the developers or submit an issue on [Github](https://www.github.com/ylseanna/QuakeView/issues), so we can see if we can add support for a new feature._
///

To select a file, hit the "Choose file" button in the configuration tab (Figure 1), a native file selection window will open allowing you to select the file. The file will then get listed on the same page.

If your selected file shows up in the list with a yellow warning icons, it means that your file parsing parameters are not yet [set correctly](#parsing-configuration).

![Configuration Tab](img/manual/Page 1.png)
/// figure-caption | #file-loading
Screenshot of QuakeView of the "configure tab" annotated to show relevant buttons and other elements of the view for initial file loading.
///

### File configuration

You can configre relevant parameters for any loaded catalogue by expanding the catalog tab (Figure 1, "open file configuration"), the menus that open are explained in the following sections.

#### File overview

The top-most pane in the earthquake catalog configuration tab is an overview of the base parameters for the earthquake catalog (name, file location, number of events/rows in the file). The visible name in the program can be configured by clicking on it.

![Table view](img/manual/Page 2.png)
/// figure-caption | #file-overview
Screenshot of QuakeView of the "configure tab" annotated to show relevant buttons and other elements of the view for initial file loading.
///

To help with file parsing configuration a preview of the first ten rows of the catalog is shown below the initial pane. You can toggle between a parsed (i.e. with the currently set parsing parameters) and "raw" plain-text preview.

#### Parsing configuration

The next pane is a menu for configuring the parsing of the file. The top-most elements set the most basic parsing parameters:

- whether a listed id is used to uniquely identify the earthquakes or whether an programatically assigned increasing integer id is used.
- the delimiter (comma or whitespace)
- how the dates are listed in the catalogue, varying between as a single datetime string, seperate date and time strings or individual columns for year, month, day, hour, minute and second values.

Below these options is a table for setting the individual per earthquake parameter parsing parameters. Initially only the minimum required parameters are listed (id, date, longitude, latitude, depth, magnitude).

![Table view](img/manual/Page 3.png)
/// figure-caption | #file-parsing
Screenshot of QuakeView of the "configure tab" annotated to show relevant buttons and other elements of the view for initial file loading.
///

The columns of the table are:

- **Variable:** A simple name of the variable as it is interpreted by QuakeView.
- **Display name:** The name that will be shown in graphs or the information tool when selecting a single earthquake.
- **Unit:** A human-readable name of the unit for the parameter.
- **Mapped column names** A list of the column names that are looked for in the catalogue file (favoring those earlier in the list) to use as the column for the respective parameter. Some parameters are given initially as defaults, but they can be removed.

While they may not be immediately visible in the software, it is possible to add further columns to include in the loading into QuakeView (by default all other columns are ignored), and these can then be queried using the information tool and used for [color mapping](#formatting-tab).

To add an additional variable you select the relevant column name from the drop-down that will pop-up when the "add" element is clicked in the "variable" column. The added variable will then be added to the table.

## Table view

The second page of QuakeView (Figure 3) is a table view of the loaded earthquake catalogs, it will show only the loaded parameters for each catalog, and has some utilities such as sorting by value and downloading the reduced catalog.

![Table view](img/manual/Page 4.png)

## Map views

The map views are the primary visualisation elements in QuakeView, many of their features are shared between them, and the plotting views. QuakeView has a [common configuration tabs](#visualisation-customization) for these visualisation views, treated in their own sections, the following sections will just go over the primary controls for these views.

### Map view (2D)

When the map view is opened you will see a map whose extent is set to the extents of the catalogs selected with the earthquakes .

/// warning | Spatial extent
If your catalogs span a large area, the individual point size may be too small and nothing may be visible. You can try [setting](#formatting-tab) a larger point size.
///

![Table view](img/manual/Page 5.png)

### 3D view

![Table view](img/manual/Page 12.png)

## Plotting views

### Time vs. magnitude plot

![Table view](img/manual/Page 13.png)

### Magnitude vs. frequency plot

![Table view](img/manual/Page 14.png)

## Visualisation customization

### Timeline bar

![Table view](img/manual/Page 6.png)

#### Controls

![Table view](img/manual/Page 7.png)

### Sidebars

#### Layer tab

![Table view](img/manual/Page 8.png)

#### Formatting tab

![Table view](img/manual/Page 9.png)

![Table view](img/manual/Page 10.png)

#### Filtering tab

![Table view](img/manual/Page 11.png)