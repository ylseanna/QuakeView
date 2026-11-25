import json
from datetime import datetime
from itertools import islice
from mmap import mmap
from pathlib import Path

from numpy import concatenate, float64, int64, isnan, array_equiv
from pandas import read_csv, to_datetime

from flask import Flask, request

app = Flask(__name__)


def count(filename: Path):
    with filename.open(mode="r+") as f:
        buf = mmap(f.fileno(), 0)
        lines = 0
        readline = buf.readline
        while readline():
            lines += 1
        return lines


def metadata_dict():
    argument_dict = request.args.to_dict()

    # IS INITIAL REQUEST?
    if "vars" in argument_dict:
        vars = json.loads(request.args.get("vars"))
        varmaps = json.loads(request.args.get("var_maps"))
        initial_request = False
    else:
        initial_request = True

    # LOAD FILE
    filepath = Path(request.args.get("filepath"))

    with filepath.open() as input_file:
        raw_file_preview = list(islice(input_file, 10))

    # file loading parameters
    seperator = request.args.get("sep") if not initial_request else ","
    index = request.args.get("index") if not initial_request else "from_file"
    header = request.args.get("header") if not initial_request else "from_file"

    # load header (best to do seperate and have it be explicit)
    if seperator == r"\s+":
        file_column_names = open(filepath).readline().rstrip().strip().split()
    else:
        file_column_names = [
            column_name.strip()
            for column_name in open(filepath).readline().rstrip().split(seperator)
        ]

    app.logger.info(file_column_names)

    # load initially (also serves as preview dws)
    preview_df = read_csv(
        filepath,
        header=None if header == "add_header" else "infer",
        sep=seperator,
        nrows=10,
    )

    # file_column_names = preview_df.columns.to_list()

    if header == "from_file":
        column_names = file_column_names
    if header == "add_header":
        column_names = json.loads(request.args.get("column_names"))
        if array_equiv(column_names, file_column_names):
            column_names = [str(index + 1) for index in range(len(file_column_names))]
    if header == "override_header":
        column_names = json.loads(request.args.get("column_names"))
        if array_equiv(column_names, file_column_names) or array_equiv(
            column_names, [str(index + 1) for index in range(len(file_column_names))]
        ):
            column_names = file_column_names

    # preview_df.columns = column_names

    print(preview_df)

    # DEFINE REQUIRED PARAMS

    required_data_descr = {  # required parameters
        "id": {
            "variable": "id",
            "mapped_var": (
                varmaps["id"] if not initial_request else ["EventID", "evid"]
            ),
            "alias": "Event ID",
            "unit": "",
            "data_type": "id_string",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
        "dt": {
            "variable": "dt",
            "mapped_var": (
                varmaps["dt"] if not initial_request else ["DT", "datetime", "Datetime"]
            ),
            "alias": "Time",
            "unit": "",
            "data_type": "dt_string",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
        "t": {
            "variable": "t",
            "mapped_var": None,
            "alias": "Time",
            "unit": "ISO",
            "data_type": "dt_timestamp",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
        "lon": {
            "variable": "lon",
            "mapped_var": (
                varmaps["lon"] if not initial_request else ["X", "lon", "Longitude"]
            ),
            "alias": "Longitude",
            "unit": "degrees",
            "data_type": "number",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
        "lat": {
            "variable": "lat",
            "mapped_var": (
                varmaps["lat"] if not initial_request else ["Y", "lat", "Latitude"]
            ),
            "alias": "Latitude",
            "unit": "degrees",
            "data_type": "number",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
        "dep": {
            "variable": "dep",
            "mapped_var": (
                varmaps["dep"] if not initial_request else ["Z", "dep", "Depth"]
            ),
            "alias": "Depth",
            "unit": "km",
            "data_type": "number",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
        "mag": {
            "variable": "mag",
            "mapped_var": (
                varmaps["mag"] if not initial_request else ["ML", "mag", "Magnitude"]
            ),
            "alias": "Magnitude",
            "unit": "M",
            "data_type": "number",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        },
    }

    ### DEFINE DATETIME VARIABLES (not datetime string)
    datetime_variable_descr = {}
    for variable, alias, unit, default_map in zip(
        ["date", "time", "year", "month", "day", "doy", "hour", "minute", "second"],
        [
            "Date",
            "Time",
            "Year",
            "Month",
            "Day",
            "Day-of-year",
            "Hour",
            "Minute",
            "Second",
        ],
        [
            "YYYY-MM-DD",
            "HH:MM:SS[,SSSS]",
            "years",
            "months",
            "days",
            "days",
            "hours",
            "minutes",
            "seconds",
        ],
        [
            ["Date", "date"],
            ["Time", "time"],
            ["Year", "year", "yr"],
            ["Month", "month", "m"],
            ["Day", "day", "d"],
            ["DOY, julday"],
            ["Hour", "hour", "hr"],
            ["Minute", "minute", "min"],
            ["Second", "second", "s"],
        ],
    ):
        datetime_variable_descr[variable] = {
            "variable": variable,
            "mapped_var": (varmaps[variable] if not initial_request else default_map),
            "alias": alias,
            "unit": unit,
            "data_type": "number",
            "bounds": None,
            "bins": None,
            "kde": None,
            "required": True,
        }

    ## DATETIME

    datetime_format = (
        request.args.get("datetimeformat")
        if not initial_request
        else "parseable_datetime_string"
    )

    # DEFINE OPTIONAL PARAMS

    def variable_mapping(dtype):
        if dtype in (float, float64, int, int64):
            return "number"
        else:
            return "string"

    optional_data_descr = {
        column_name: {
            "variable": column_name,
            "alias": "",
            "data_type": variable_mapping(preview_df.dtypes[column_name]),
            "unit": "",
        }
        for column_name in preview_df.columns
        if column_name
        not in concatenate(
            [
                varDescr["mapped_var"]
                for varDescr in required_data_descr.values()
                if varDescr["mapped_var"] is not None
            ]
        ).tolist()
    }

    # OUTPUT

    meta_data_dict = {
        "num_events": (
            count(filepath) - 1 if header != "add_header" else count(filepath)
        ),
        "sep": seperator,
        "index": index,
        "datetime_format": datetime_format,
        "preview": {
            "parsed": [
                {"id": index} | record
                for index, record in enumerate(
                    json.loads(preview_df.to_json(orient="records", date_format="iso"))
                )
            ],
            "raw": raw_file_preview,
        },
        "header": header,
        "file_column_names": (
            [str(num + 1) for num in range(len(file_column_names))]
            if header == "add_header"
            else file_column_names
        ),
        "column_names": column_names,
        "variables": {
            "by_id": optional_data_descr
            | datetime_variable_descr
            | required_data_descr,
            "required_vars": list(required_data_descr.keys()),
            "datetime_vars": list(datetime_variable_descr.keys()),
            "optional_vars": list(optional_data_descr.keys()),
            "added_vars": (
                [
                    var
                    for var in vars
                    if var
                    not in list(required_data_descr.keys())
                    + list(datetime_variable_descr.keys())
                ]
                if not initial_request
                else []
            ),
        },
    }

    app.logger.info(meta_data_dict)

    return meta_data_dict


def data_dict(nlines=None):
    # LOAD DATAFRAME
    app.logger.info("loading...")
    filepath = request.args.get("filepath")

    seperator = request.args.get("sep")
    index = request.args.get("index")
    header = request.args.get("header")

    df = read_csv(
        filepath,
        sep=seperator,
        header=None if header == "add_header" else "infer",
    )

    column_names = json.loads(request.args.get("column_names"))

    df.columns = column_names

    df.columns = df.columns.str.strip()

    app.logger.debug(f"\n{df[:10]}")

    # SLICE

    slice_text = request.args.get("slice")

    if slice_text != "unset":
        app.logger.info(f"Slice provided, slicing...\n{slice_text}")

        slice = json.loads(slice_text)

        df = df[slice[0] : slice[1]]

    # PREPARE VAR MAPPING
    app.logger.info("getting varmaps...")
    vars = json.loads(request.args.get("vars"))
    varmaps = json.loads(request.args.get("var_maps"))

    varmap = get_varmap(vars, varmaps, df.columns)

    required_vars = [
        var for var in vars if var in list(varmaps.keys()) if varmaps[var]
    ] + ["t"]
    optional_vars = [var for var in vars if var not in list(varmaps.keys())]

    # INDEX MANAGING
    if index == "numerical":
        app.logger.info("Numerical index selected, ignoring id field")
        required_vars = [var for var in required_vars if var != "id"]

    app.logger.debug(
        f"\n{varmap}\nRequired: {required_vars}\nOptional: {optional_vars}"
    )

    # DATETIME CONVERSION
    app.logger.info("converting datetime...")
    datetime_format = request.args.get("datetimeformat")

    app.logger.info(f"format: {datetime_format}")

    if datetime_format == "parseable_datetime_string":
        df["datetime"] = [datetime.fromisoformat(dt) for dt in df[varmap["dt"]]]

        df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

        df["dt"] = [dt.isoformat() for dt in df["datetime"]]

        for variable in [
            "date",
            "time",
            "year",
            "month",
            "day",
            "doy",
            "hour",
            "minute",
            "second",
        ]:
            if variable in varmap:
                del varmap[variable]
    elif datetime_format == "date_string-time_string":
        df["datetime"] = to_datetime(
            df[varmap["date"]].values + "T" + df[varmap["time"]].values
        )

        df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

        df["dt"] = [dt.isoformat() for dt in df["datetime"]]

        varmap["dt"] = "dt"
        for variable in ["year", "month", "day", "doy", "hour", "minute", "second"]:
            if variable in varmap:
                del varmap[variable]

        app.logger.debug(df["datetime"][:10])
    elif datetime_format == "year-month-day-hour-minute-second":
        app.logger.debug(
            df[
                [
                    varmap["year"],
                    varmap["month"],
                    varmap["day"],
                    varmap["hour"],
                    varmap["minute"],
                    varmap["second"],
                ]
            ].rename(
                columns={
                    "year": varmap["year"],
                    "month": varmap["month"],
                    "day": varmap["day"],
                    "hour": varmap["hour"],
                    "minute": varmap["minute"],
                    "second": varmap["second"],
                },
            )
        )
        df_dt = df[
            [
                varmap["year"],
                varmap["month"],
                varmap["day"],
                varmap["hour"],
                varmap["minute"],
                varmap["second"],
            ]
        ]

        df_dt.columns = ["year", "month", "day", "hour", "minute", "second"]

        app.logger.debug(f"\n{df_dt[0:10]}")

        df["datetime"] = to_datetime(
            df_dt,
            yearfirst=True,
        )

        df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

        df["dt"] = [dt.isoformat() for dt in df["datetime"]]

        varmap["dt"] = "dt"
        for variable in ["date", "time", "doy"]:
            if variable in varmap:
                del varmap[variable]

        app.logger.debug(f"\n{df[:10]}")

    # GENERATE BOUNDS
    app.logger.info("getting bounds...")
    app.logger.debug(varmap)
    bounds = {
        var: (
            [float(df[varmap[var]].min()), float(df[varmap[var]].max())]
            if df.dtypes[varmap[var]] in (float, float64, int, int64)
            and not (
                isnan(float(df[varmap[var]].min()))
                or isnan(float(df[varmap[var]].max()))
            )
            else None
        )
        for var in required_vars + optional_vars
        if var in varmap
    }
    app.logger.debug(bounds)

    # INDEX MANAGING
    app.logger.info(f"index: {index}")
    if index == "numerical":
        app.logger.info("Numerical index selected, ignoring id field")
        varmap["id"] = "id"

    # OPTIONAL FILTERING

    filtering = json.loads(request.args.get("filtering"))

    if len(list(filtering.keys())) > 0:
        app.logger.info("applying filters...")
        for variable in filtering.keys():
            app.logger.info(
                f"{filtering[variable][0]} <= {variable} <= {filtering[variable][1]}"
            )
            df = df[
                (df[varmap[variable]] >= filtering[variable][0])
                & (df[varmap[variable]] <= filtering[variable][1])
            ]

        # GENERATE FILTERED BOUNDS
        app.logger.info("getting filtered bounds (storing unfiltered bounds)...")
        app.logger.debug(varmap)
        unfiltered_bounds = bounds

        app.logger.debug(f"Unfiltered bounds:\n{unfiltered_bounds}")

        app.logger.debug(df)

        bounds = {
            var: (
                [float(df[varmap[var]].min()), float(df[varmap[var]].max())]
                if df.dtypes[varmap[var]] in (float, float64, int, int64)
                and not (
                    isnan(float(df[varmap[var]].min()))
                    or isnan(float(df[varmap[var]].max()))
                )
                else None
            )
            for var in required_vars + optional_vars
            if var in varmap
        }

        app.logger.debug(f"Filtered bounds:\n{bounds}")
    else:
        app.logger.info("skipping filters...")
        unfiltered_bounds = bounds

    # GET EXTENT
    app.logger.info("pre-calculating extent...")
    coords_calculatable = (
        varmap["lon"] is not None
        and varmap["lat"] is not None
        and varmap["dep"] is not None
    )

    if coords_calculatable:
        # calculate bounds (min x, min y, max x, max y)
        extent = [
            df[varmap["lon"]].min(),
            df[varmap["lat"]].min(),
            df[varmap["lon"]].max(),
            df[varmap["lat"]].max(),
        ]

        # calculate centroid (average coords)
        centroid = [
            df[varmap["lon"]].mean(),
            df[varmap["lat"]].mean(),
            df[varmap["dep"]].mean(),
        ]

    ### ADDING NUMERICAL INDICES IF SET

    if index == "numerical":
        app.logger.info("Setting numerical index...")

        varmap["id"] = "id"

        df["id"] = list(range(len(df)))

    ### REDUCING THE DATEFRAME
    app.logger.info("Reducing the dataframe to its output shape...")
    reduced_df = df[
        [
            varmap["id"],
            "t",
            "dt",
            varmap["mag"],
            varmap["dep"],
            varmap["lon"],
            varmap["lat"],
        ]
        + optional_vars
    ]

    ### find missing values
    warnings = {}
    if df.isnull().any().any():
        app.logger.warning("NaN values found")

        na_df = reduced_df[reduced_df.isna().any(axis="columns")]

        app.logger.debug(f"\n{na_df}")

        reduced_df = reduced_df.dropna()

        event_id_var = varmap["id"]

        warnings["Missing values"] = [
            f"Row {i}{f' (event id: {row[event_id_var]})' if index != 'numerical' else ''}, row not loaded; missing values in column(s): {', '.join(row[row.isna()].index.values)}"
            for i, row in na_df.iterrows()
        ]

        del event_id_var

        app.logger.debug(warnings["Missing values"])

    ### mapping parameters

    reduced_df.columns = ["id", "t", "dt", "mag", "dep", "lon", "lat"] + optional_vars

    app.logger.info(f"columns: {reduced_df.columns}")

    app.logger.debug(f"reduced_df: \n{reduced_df[:10]}")

    ### RETURNING

    app.logger.info("returning data object...")
    df_dict = reduced_df.to_dict(orient="records")
    return {
        "data": df_dict,
        "bounds": bounds,
        "unfiltered_bounds": unfiltered_bounds,
        "extent": {
            "centroid": centroid if coords_calculatable else None,
            "bounds": extent if coords_calculatable else None,
        },
        "warnings": warnings,
    }


def get_varmap(vars, varmaps, columns):
    varmap = {}
    for var in vars:
        if var in varmaps:
            if varmaps[var] is not None:
                for mapped_var in varmaps[var]:
                    if mapped_var in columns:
                        varmap[var] = mapped_var
                        continue

                    # varmap[var] = None
        else:
            varmap[var] = var

    varmap["t"] = "t"

    return varmap
