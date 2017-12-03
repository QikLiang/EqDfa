import subprocess
from flask import Flask, request, abort
from flask_restful import Resource, Api

app = Flask(__name__, static_url_path="")
api = Api(app)

class CheckAnswer(Resource):
    def post(self, level):
        print("get request received")
        answer = level + ".json"
        print("level = " + level)
        guess = request.get_data(as_text=True)
        print("guess = " + guess)
        if not guess:
            abort(510)
        result = str(subprocess.check_output(["./eqdfa.py",
                                       "-d",
                                       "-s",
                                       guess,
                                       "-f",
                                       answer]), "ascii")
        print(result)
        return result

api.add_resource(CheckAnswer,
                 "/checkanswerapi/<string:level>")

if __name__ == "__main__":
    app.run(debug=True)
