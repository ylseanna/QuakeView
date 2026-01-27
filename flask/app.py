from flask import Flask, request, Response, send_file
from pathlib import Path
from shapely import multipoints
import json
from numpy import concatenate, float64, int64, isnan


# from obspy import UTCDateTime
from datetime import datetime

import pandas as pd

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
    df = pd.read_csv("data/BB_2017-157_to_2017-257_prelim.csv")

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

        print("METADATA REQUEST", argument_dict)

        # PREPARE VAR MAPPING (if provided)
        variable_mapped_vars = {
            "id": None,
            "dt": None,
            "lon": None,
            "lat": None,
            "dep": None,
            "mag": None,
        }

        if "vars" in argument_dict:
            vars = json.loads(request.args.get("vars"))

            print(vars, type(vars))

            for variable in vars:
                if variable not in ("t",):
                    if variable in argument_dict:
                        mapped_vars = json.loads(request.args.get(variable))

                        variable_mapped_vars[variable] = mapped_vars

        # DEFINE REQUIRED PARAMS

        required_data_descr = {  # required parameters
            "id": {
                "variable": "id",
                "mapped_var": variable_mapped_vars["id"] or ["EventID", "evid"],
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
                "mapped_var": variable_mapped_vars["dt"]
                or ["DT", "datetime", "Datetime"],
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
                "unit": "",
                "data_type": "dt_timestamp",
                "bounds": None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            "lon": {
                "variable": "lon",
                "mapped_var": variable_mapped_vars["lon"] or ["X", "lon", "Longitude"],
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
                "mapped_var": variable_mapped_vars["lat"] or ["Y", "lat", "Latitude"],
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
                "mapped_var": variable_mapped_vars["dep"] or ["Z", "dep", "Depth"],
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
                "mapped_var": variable_mapped_vars["mag"] or ["ML", "mag", "Magnitude"],
                "alias": "Magnitude",
                "unit": "M",
                "data_type": "number",
                "bounds": None,
                "bins": None,
                "kde": None,
                "required": True,
            },
        }

        # LOAD FILE
        filepath = request.args.get("filepath")

        df = pd.read_csv(filepath)

        # CHECK IF ALL REQUIRED FIELDS ARE SELECTED

        varmap = {}

        for required_variable in required_data_descr.keys():
            if required_variable != "t":
                # initial setting
                varmap[required_variable] = None

                for mapped_var in required_data_descr[required_variable]["mapped_var"]:
                    if mapped_var in df.columns:
                        varmap[required_variable] = mapped_var
                        continue

        # DATETIME CONVERSION
        if varmap["dt"]:
            df["datetime"] = [datetime.fromisoformat(dt) for dt in df[varmap["dt"]]]

            df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

            df["dt"] = [dt.isoformat() for dt in df["datetime"]]

        # DEFINE BOUNDS
        for required_variable in required_data_descr.keys():
            if required_variable not in ("id", "dt", "t"):
                if varmap[required_variable]:
                    print(required_variable, varmap[required_variable])
                    required_data_descr[required_variable]["bounds"] = (
                        [
                            float(df[varmap[required_variable]].min()),
                            float(df[varmap[required_variable]].max()),
                        ]
                        if df.dtypes[varmap[required_variable]]
                        in (float, float64, int, int64)
                        and not (
                            isnan(float(df[varmap[required_variable]].min()))
                            or isnan(float(df[varmap[required_variable]].max()))
                        )
                        else None
                    )
            elif required_variable == "t":
                if "t" in df.columns:
                    required_data_descr[required_variable]["bounds"] = (
                        [
                            float(df[required_variable].min()),
                            float(df[required_variable].max()),
                        ]
                        if df.dtypes[required_variable] in (float, float64, int, int64)
                        and not (
                            isnan(float(df[required_variable].min()))
                            or isnan(float(df[required_variable].max()))
                        )
                        else None
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
                "data_type": variable_mapping(df.dtypes[column_name]),
                "unit": "",
                "bounds": (
                    [float(df[column_name].min()), float(df[column_name].max())]
                    if df.dtypes[column_name] in (float, float64, int, int64)
                    and not (
                        isnan(float(df[column_name].min()))
                        or isnan(float(df[column_name].max()))
                    )
                    else None
                ),
                "bins": None,
                "kde": None,
                "required": False,
            }
            for column_name in df.columns
            if column_name
            not in concatenate(
                [
                    varDescr["mapped_var"]
                    for varDescr in required_data_descr.values()
                    if varDescr["mapped_var"] is not None
                ]
            ).tolist()
        }

        # GET EXTENT
        centroid_calculatable = (
            varmap["lon"] is not None
            and varmap["lat"] is not None
            and varmap["dep"] is not None
        )

        if centroid_calculatable:
            MultiPoint = multipoints(
                [
                    (event[varmap["lon"]], event[varmap["lat"]], event[varmap["dep"]])
                    for _, event in df.iterrows()
                ]
            )

            centroid = MultiPoint.centroid

            centroid_processed = [centroid.x, centroid.y, df[varmap["dep"]].mean()]

        # DATA OUTLINES

        # for data_descr in required_data_descr + optional_data_descr:
        #     if data_descr["data_type"] == "number":
        #         bins, bin_edges = histogram()

        # OUTPUT

        meta_data_dict = {
            "num_events": len(df),
            "extent": {
                "automatic": True,
                "centroid": centroid_processed if centroid_calculatable else None,
                "bounds": MultiPoint.bounds if centroid_calculatable else None,
                "polygon": MultiPoint.envelope.wkt if centroid_calculatable else None,
            },
            "catalog_headers": [
                str(header) for header in df.columns if (header not in ("dt", "t"))
            ],
            "variables": {
                "by_id": optional_data_descr | required_data_descr,
                "required_vars": list(required_data_descr.keys()),
                "optional_vars": list(optional_data_descr.keys()),
                "added_vars": [],
            },
        }

        app.logger.info(meta_data_dict)

        return Response(json.dumps(meta_data_dict), mimetype="application/json")
    if mode == "unique_values":
        filename = request.args.get("filename")

        filename = "data/" + filename

        df = pd.read_csv(filename)

        variable = request.args.get("variable")

        unique_values = sorted(df[variable].unique())

        return Response(json.dumps(unique_values), mimetype="application/json")
    if mode == "data_query" or mode is None:
        argument_dict = request.args.to_dict()

        print("DATA REQUEST\n", argument_dict)

        return Response(
            json.dumps(generate_event_dict()),
            mimetype="application/json",
        )


@app.route("/api/plot_data")
# @cache.cached(timeout=50)
def plot_data():
    mode = request.args.get("mode")

    argument_dict = request.args.to_dict()

    print("PLOT DATA REQUEST", argument_dict)

    if mode == "timeline_plot" or mode is None:
        event_dict = generate_event_dict()

        return Response(
            json.dumps(event_dict),
            mimetype="application/json",
        )


# @cache.memoize()
def generate_event_dict():
    # LOAD DATAFRAME
    filepath = request.args.get("filepath")

    df = pd.read_csv(filepath)

    # PREPARE VAR MAPPING
    vars = json.loads(request.args.get("vars"))

    print(vars, type(vars))

    varmap = {}

    for variable in vars:
        if variable in ("id", "dt", "mag", "dep", "lon", "lat"):
            # initial setting
            varmap[variable] = None

            mapped_vars = json.loads(request.args.get(variable))

            for mapped_var in mapped_vars:
                if mapped_var in df.columns:
                    varmap[variable] = mapped_var
                    continue

    # DATETIME CONVERSION
    if varmap["dt"]:
        df["datetime"] = [datetime.fromisoformat(dt) for dt in df[varmap["dt"]]]

        df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

        df["dt"] = [dt.isoformat() for dt in df["datetime"]]

    # OPTIONAL FILTERING

    if "filtering" in request.args.to_dict():
        print("FILTERING:")
        filtering = json.loads(request.args.get("filtering"))

        for variable in filtering.keys():
            print(f"{filtering[variable][0]} < {variable} < {filtering[variable][1]}")
            df = df[
                (df[varmap[variable]] > filtering[variable][0])
                & (df[varmap[variable]] < filtering[variable][1])
            ]

    # CONVERT TO JSON
    event_dict = []
    for index, row in df.iterrows():
        event_row = {
            "id": row[varmap["id"]],
            "t": row["t"],
            "dt": row["dt"],
            "mag": row[varmap["mag"]],
            "dep": row[varmap["dep"]],
            "lon": row[varmap["lon"]],
            "lat": row[varmap["lat"]],
        }

        for var in vars:
            if var not in ("id", "t", "dt", "mag", "dep", "lon", "lat"):
                event_row[var] = row[var]

        event_dict.append(event_row)

    return event_dict


@app.route("/api/tiles/<z>/<x>/<y>.png")
def get_tile(z, x, y):
    base_path = Path("/home/yadevries/Data/DEM/tiles")

    tile_path = base_path / str(z) / str(x) / (str(y) + ".png")

    # return str(tile_path)

    return send_file(tile_path, mimetype="image/png")


# @cache.memoize()
def load_to_df(filepath):
    # LOAD FILE
    df = pd.read_csv(filepath)

    # DATETIME

    df["datetime"] = [datetime.fromisoformat(dt) for dt in df["DT"]]

    df["t"] = [dt.timestamp() * 1000 for dt in df["datetime"]]

    df["dt"] = [dt.isoformat() for dt in df["datetime"]]

    return df


@app.errorhandler(ArgumentError)
def handle_errors(e):
    return e.response(), e.status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8100")
