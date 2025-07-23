from flask import Flask, request, Response, send_file
from pathlib import Path
from shapely import multipoints
import json
from numpy import histogram, float64, int64


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

        # GET DATA
        filepath = request.args.get("filepath")
        variable_mapping = json.loads(request.args.get("var_mapping"))

        df = load_to_df(filepath, variable_mapping=variable_mapping)

        # GET EXTENT

        MultiPoint = multipoints(
            [(event["lon"], event["lat"], event["dep"]) for _, event in df.iterrows()]
        )

        centroid = MultiPoint.centroid

        # print(MultiPoint.centroid)
        # print(MultiPoint.bounds)

        # DEFINE REQUIRED PARAMS

        required_data_descr = [  # required parameters
            {
                "variable": "id",
                "mapped_var": ["EventID", "evid"],
                "mapping_valid": True if column_mapping["id"] is not None else False,
                "alias": "Event ID",
                "unit": "",
                "data_type": "id_string",
                "bounds": None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            {
                "variable": "dt",
                "mapped_var": ["DT", "datetime", "Datetime"],
                "mapping_valid": True if column_mapping["dt"] is not None else False,
                "alias": "Time",
                "unit": "",
                "data_type": "dt_string",
                "bounds": None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            {
                "variable": "t",
                "mapped_var": None,
                "mapping_valid": True if column_mapping["dt"] is not None else False,
                "alias": "Time",
                "unit": "",
                "data_type": "dt_timestamp",
                "bounds": [df["t"].min(), df["t"].max()]
                if column_mapping["dt"] is not None
                else None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            {
                "variable": "lon",
                "mapped_var": ["X", "lon", "Longitude"],
                "mapping_valid": True if column_mapping["lon"] is not None else False,
                "alias": "Longitude",
                "unit": "degrees",
                "data_type": "number",
                "bounds": [df["lon"].min(), df["lon"].max()]
                if column_mapping["lon"] is not None
                else None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            {
                "variable": "lat",
                "mapped_var": ["Y", "lat", "Latitude"],
                "mapping_valid": True if column_mapping["lat"] is not None else False,
                "alias": "Latitude",
                "unit": "degrees",
                "data_type": "number",
                "bounds": [df["lat"].min(), df["lat"].max()]
                if column_mapping["lat"] is not None
                else None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            {
                "variable": "dep",
                "mapped_var": ["Z", "dep", "Depth"],
                "mapping_valid": True if column_mapping["dep"] is not None else False,
                "alias": "Depth",
                "unit": "km",
                "data_type": "number",
                "bounds": [df["dep"].min(), df["dep"].max()]
                if column_mapping["dep"] is not None
                else None,
                "bins": None,
                "kde": None,
                "required": True,
            },
            {
                "variable": "mag",
                "mapped_var": ["ML", "mag", "Magnitude"],
                "mapping_valid": True if column_mapping["mag"] is not None else False,
                "alias": "Magnitude",
                "unit": "M",
                "data_type": "number",
                "bounds": [df["mag"].min(), df["mag"].max()]
                if column_mapping["mag"] is not None
                else None,
                "bins": None,
                "kde": None,
                "required": True,
            },
        ]

        # DEFINE OPTIONAL PARAMS

        def variable_mapping(dtype):
            if dtype in (float, float64, int, int64):
                return "number"
            else:
                return "string"

        optional_data_descr = [
            {
                "variable": column_name,
                "mapping_valid": True,
                "alias": "",
                "data_type": variable_mapping(df.dtypes[column_name]),
                "unit": "",
                "bounds": [float(df[column_name].min()), float(df[column_name].max())]
                if df.dtypes[column_name] in (float, float64, int, int64)
                else None,
                "bins": None,
                "kde": None,
                "required": False,
            }
            for column_name in df.columns
            if column_name not in [el["mapped_var"] for el in required_data_descr]
        ]

        # DATA OUTLINES

        # for data_descr in required_data_descr + optional_data_descr:
        #     if data_descr["data_type"] == "number":
        #         bins, bin_edges = histogram()

        # OUTPUT

        meta_data_dict = {
            "num_events": len(df),
            "data_headers": [
                str(header) for header in df.columns if (header not in ("dt", "t"))
            ],
            "data_descr": required_data_descr + optional_data_descr,
            "extent": {
                "automatic": True,
                "centroid": [centroid.x, centroid.y, df["Z"].mean()],
                "bounds": MultiPoint.bounds,
                "polygon": MultiPoint.envelope.wkt,
            },
        }

        # app.logger.info(meta_data_dict)

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

        print("MAP DATA REQUEST", argument_dict)

        # LOAD FILE
        filename = request.args.get("filepath")

        added_vars = request.args.get("added_vars")

        df = load_to_df(filename)

        return Response(
            json.dumps(generate_event_dict(df=df, added_vars=added_vars)),
            mimetype="application/json",
        )


@app.route("/api/plot_data")
# @cache.cached(timeout=50)
def plot_data():
    mode = request.args.get("mode")

    argument_dict = request.args.to_dict()

    print("PLOT DATA REQUEST", argument_dict)

    if mode == "timeline_plot" or mode is None:
        # LOAD FILE
        filename = request.args.get("filename")

        df = load_to_df(filename)

        # FILTER

        # df = df[df["ML"] > 0]

        # LOAD VARS

        event_dict = generate_event_dict(df)

        return Response(
            json.dumps(event_dict),
            mimetype="application/json",
        )


# @cache.memoize()
def generate_event_dict(df, added_vars=None):
    # LOAD VARS

    event_dict = []

    if request.args.get("added_vars"):
        added_vars = json.loads(request.args.get("added_vars"))

    for index, row in df.iterrows():
        event_row = {
            "id": row["EventID"],
            "t": row["t"],
            "dt": row["dt"],
            "mag": row["ML"],
            "dep": row["Z"],
            "lon": row["X"],
            "lat": row["Y"],
        }

        if added_vars:
            for added_var in added_vars:
                if added_var:
                    event_row[added_var] = row[added_var]

        event_dict.append(event_row)

    return event_dict


@app.route("/api/tiles/<z>/<x>/<y>.png")
def get_tile(z, x, y):
    base_path = Path("/home/yadevries/Data/DEM/tiles")

    tile_path = base_path / str(z) / str(x) / (str(y) + ".png")

    # return str(tile_path)

    return send_file(tile_path, mimetype="image/png")


# @cache.memoize()
def load_to_df(filepath, variable_mapping):
    # LOAD FILE
    df = pd.read_csv(filepath)

    # GET VAR MAPPINGS

    column_mapping = {}

    for variable, mapping in variable_mapping.items():
        for column_name in mapping:
            print(variable, column_name)
            if column_name in df.columns.values:
                column_mapping[variable] = column_name

            # else
            if not column_mapping[variable]:
                column_mapping[variable] = None

    # APPLY VAR MAPPINGS

    print(column_mapping)

    print(df.columns)

    print({v: k for k, v in column_mapping.items() if v is not None or v != "dt"})

    df.rename(
        columns={v: k for k, v in column_mapping.items() if v is not None or v != "dt"}
    )  # invert and filter mapping

    print(df.columns)

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
