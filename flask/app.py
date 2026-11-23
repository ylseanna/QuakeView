import json
from logging.config import dictConfig
from platform import system

import fastpysgi
from datasources.earthquake_catalog import data_dict, metadata_dict

from flask import Flask, Response, request

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


default_variable_mapping = {
    # ALWAYS COPY TO FRONTEND
    "id": ["EventID", "evid"],
    "dt": ["DT", "datetime", "Datetime"],
    "lon": ["X", "lon", "Longitude"],
    "lat": ["Y", "lat", "Latitude"],
    "dep": ["Z", "dep", "Depth"],
    "mag": ["ML", "mag", "Magnitude"],
}


@app.route("/api/earthquake_catalog")
# @cache.cached(timeout=50)
def earthquake_catalog():
    mode = request.args.get("mode")

    if mode == "metadata":
        app.logger.info("--- Metadata request ---")

        return Response(
            json.dumps(metadata_dict()), mimetype="application/json"
        )
    if mode == "data" or mode is None:
        app.logger.info("--- Data request ---")

        return Response(
            json.dumps(data_dict()),
            mimetype="application/json",
        )


# @app.route("/api/tiles/<z>/<x>/<y>.png")
# def get_tile(z, x, y):
#     base_path = Path("/home/yadevries/Data/DEM/tiles")

#     tile_path = base_path / str(z) / str(x) / (str(y) + ".png")

#     # return str(tile_path)

#     return send_file(tile_path, mimetype="image/png")


@app.errorhandler(ArgumentError)
def handle_errors(e):
    return e.response(), e.status_code


if __name__ == "__main__":
    # fastpysgi uses fork() to spawn subprocesses which doesn´t exist in windows
    platform = system()

    if platform != "Windows":
        fastpysgi.run(wsgi_app=app, host="0.0.0.0", port=8100, workers=4)
    else:
        fastpysgi.run(wsgi_app=app, host="0.0.0.0", port=8100)
