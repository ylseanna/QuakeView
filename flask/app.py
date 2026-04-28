import json
import fastwsgi

# from obspy import UTCDateTime
from datetime import datetime
from itertools import islice
from logging.config import dictConfig
from mmap import mmap
from pathlib import Path

from pandas import read_csv, to_datetime
from numpy import concatenate, float64, int64, isnan

# from shapely import multipoints
# from werkzeug.exceptions import HTTPException

from flask import Flask, Response, request, send_file

dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
            }
        },
        "handlers": {
            "wsgi": {
                "class": "logging.StreamHandler",
                "stream": "ext://flask.logging.wsgi_errors_stream",
                "formatter": "default",
            }
        },
        "root": {"level": "INFO", "handlers": ["wsgi"]},
    }
)


def count(filename: Path):
    with filename.open(mode="r+") as f:
        buf = mmap(f.fileno(), 0)
        lines = 0
        readline = buf.readline
        while readline():
            lines += 1
        return lines


app = Flask(__name__)


class ArgumentError(Exception):
    """Error used when the user inputs invalid argument values"""

    status_code = 400

    def __init__(self, message, status_code=None):
        super(ArgumentError, self).__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def response(self):
        return {"message": self.message, "status": self.status_code}


@app.route("/api")
def hello():
    return """<p>This the api gateway</p>"""


@app.route("/api/testdata")
def testdata():
    df = read_csv("data/BB_2017-157_to_2017-257_prelim.csv")

    df = df.rename(columns={"EventID": "id"})

    return df.to_json(orient="records")


default_variable_mapping = {
    # ALWAYS COPY TO FRONTEND
    "id": ["EventID", "evid"],
    "dt": ["DT", "datetime", "Datetime"],
    "lon": ["X", "lon", "Longitude"],
    "lat": ["Y", "lat", "Latitude"],
    "dep": ["Z", "dep", "Depth"],
    "mag": ["ML", "mag", "Magnitude"],
}


@app.route("/api/map_data")
# @cache.cached(timeout=50)
def map_data():
    mode = request.args.get("mode")

    # argument_dict = request.args.to_dict()

    if mode == "get_availability":
        return Response(
            json.dumps([path.name for path in sorted(Path("/backend/data").glob("*"))]),
            mimetype="application/json",
        )

    if mode == "metadata_query":
        argument_dict = request.args.to_dict()

        app.logger.info("--- Metadata request ---")

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

        seperator = request.args.get("sep") if not initial_request else ","
        index = request.args.get("index") if not initial_request else "from_file"

        preview_df = read_csv(filepath, sep=seperator, nrows=10)

        # if not initial_request:
        #     varmap = get_varmap(vars, varmaps, preview_df.columns)

        # variable_mapped_vars = {
        #     "id": [],
        #     "dt": [],
        #     "lon": [],
        #     "lat": [],
        #     "dep": [],
        #     "mag": [],
        #     "year": [],
        #     "month": [],
        #     "day": [],
        #     "doy": [],
        #     "hour": [],
        #     "minute": [],
        #     "second": [],
        # }

        # if "vars" in argument_dict:
        #     vars = json.loads(request.args.get("vars"))

        #     for variable in vars:
        #         if variable not in ("t",):
        #             if variable in argument_dict:
        #                 mapped_vars = json.loads(request.args.get(variable))

        #                 variable_mapped_vars[variable] = mapped_vars

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
                    varmaps["dt"]
                    if not initial_request
                    else ["DT", "datetime", "Datetime"]
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
                    varmaps["mag"]
                    if not initial_request
                    else ["ML", "mag", "Magnitude"]
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
        for variable, alias, unit in zip(
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
        ):
            datetime_variable_descr[variable] = {
                "variable": variable,
                "mapped_var": (varmaps[variable] if not initial_request else []),
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

        # # DATETIME CONVERSION
        # if not initial_request:
        #     df["datetime"] = [datetime.fromisoformat(dt) for dt in df[varmap["dt"]]]

        #     df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

        #     df["dt"] = [dt.isoformat() for dt in df["datetime"]]

        # # DEFINE BOUNDS
        # for required_variable in required_data_descr.keys():
        #     if required_variable not in ("id", "dt", "t"):
        #         if varmap[required_variable]:
        #             required_data_descr[required_variable]["bounds"] = (
        #                 [
        #                     float(df[varmap[required_variable]].min()),
        #                     float(df[varmap[required_variable]].max()),
        #                 ]
        #                 if df.dtypes[varmap[required_variable]]
        #                 in (float, float64, int, int64)
        #                 and not (
        #                     isnan(float(df[varmap[required_variable]].min()))
        #                     or isnan(float(df[varmap[required_variable]].max()))
        #                 )
        #                 else None
        #             )
        #     elif required_variable == "t":
        #         if "t" in df.columns:
        #             required_data_descr[required_variable]["bounds"] = (
        #                 [
        #                     float(df[required_variable].min()),
        #                     float(df[required_variable].max()),
        #                 ]
        #                 if df.dtypes[required_variable] in (float, float64, int, int64)
        #                 and not (
        #                     isnan(float(df[required_variable].min()))
        #                     or isnan(float(df[required_variable].max()))
        #                 )
        #                 else None
        #             )

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
                # "bounds": (
                #     [float(df[column_name].min()), float(df[column_name].max())]
                #     if df.dtypes[column_name] in (float, float64, int, int64)
                #     and not (
                #         isnan(float(df[column_name].min()))
                #         or isnan(float(df[column_name].max()))
                #     )
                #     else None
                # ),
                # "bins": None,
                # "kde": None,
                # "required": False,
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

        # DATA OUTLINES

        # for data_descr in required_data_descr + optional_data_descr:
        #     if data_descr["data_type"] == "number":
        #         bins, bin_edges = histogram()

        # OUTPUT

        meta_data_dict = {
            "num_events": count(filepath) - 1,
            "sep": seperator,
            "index": index,
            "datetime_format": datetime_format,
            "preview": {
                "parsed": [
                    {"id": index} | record
                    for index, record in enumerate(
                        json.loads(
                            preview_df.to_json(orient="records", date_format="iso")
                        )
                    )
                ],
                "raw": raw_file_preview,
            },
            "catalog_headers": [
                str(header)
                for header in preview_df.columns
                if (header not in ("dt", "t"))
            ],
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

        return Response(json.dumps(meta_data_dict), mimetype="application/json")
    if mode == "unique_values":
        filename = request.args.get("filename")

        filename = "data/" + filename

        df = read_csv(filename)

        variable = request.args.get("variable")

        unique_values = sorted(df[variable].unique())

        return Response(json.dumps(unique_values), mimetype="application/json")
    if mode == "data_query" or mode is None:
        argument_dict = request.args.to_dict()

        app.logger.info("--- Data request ---")

        return Response(
            json.dumps(generate_event_dict()),
            mimetype="application/json",
        )


# @app.route("/api/plot_data")
# # @cache.cached(timeout=50)
# def plot_data():
#     mode = request.args.get("mode")

#     argument_dict = request.args.to_dict()

#     print("PLOT DATA REQUEST", argument_dict)

#     if mode == "timeline_plot" or mode is None:
#         event_dict = generate_event_dict()

#         return Response(
#             json.dumps(event_dict),
#             mimetype="application/json",
#         )


# @cache.memoize()
def generate_event_dict(nlines=None):
    # LOAD DATAFRAME
    app.logger.info("loading...")
    filepath = request.args.get("filepath")

    seperator = request.args.get("sep")
    index = request.args.get("index")

    df = read_csv(filepath, sep=seperator)

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
    elif datetime_format == "date_string-time_string":
        df["datetime"] = to_datetime(
            df[varmap["date"]].values + "T" + df[varmap["time"]].values
        )

        df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

        df["dt"] = [dt.isoformat() for dt in df["datetime"]]

        varmap["dt"] = "dt"
        varmap["year"] = "year"
        varmap["month"] = "month"
        varmap["day"] = "day"
        varmap["doy"] = "doy"
        varmap["hour"] = "hour"
        varmap["minute"] = "minute"
        varmap["second"] = "second"

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
        varmap["doy"] = "doy"

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
        if varmap[var]
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
            if varmap[var]
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
            f"Row {i}{f' (event id: {varmap[event_id_var]})' if index != 'numerical' else ''}, row not loaded; missing values in column(s): {', '.join(row[row.isna()].index.values)}"
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


@app.route("/api/tiles/<z>/<x>/<y>.png")
def get_tile(z, x, y):
    base_path = Path("/home/yadevries/Data/DEM/tiles")

    tile_path = base_path / str(z) / str(x) / (str(y) + ".png")

    # return str(tile_path)

    return send_file(tile_path, mimetype="image/png")


# # @cache.memoize()
# def load_to_df(filepath):
#     # LOAD FILE
#     df = pd.read_csv(filepath)

#     # DATETIME

#     df["datetime"] = [datetime.fromisoformat(dt) for dt in df["DT"]]

#     df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

#     df["dt"] = [dt.isoformat() for dt in df["datetime"]]

#     return df


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


@app.errorhandler(ArgumentError)
def handle_errors(e):
    return e.response(), e.status_code


if __name__ == "__main__":
    fastwsgi.run(wsgi_app=app, host="0.0.0.0", port=8100, workers=4)
