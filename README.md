# Description

This is a project made for my Theory of Computation class to check
wheter two Deterministic Finite Autamata accepts the same language.
It has three parts: an implementation of the EQ_DFA algorithm
in Python, a GUI in Javascript that allows users to draw DFA
diagrams on a webpage and converts it into a JSON representation,
and a web server in Python that hosts the GUI and provides a
RESTful API that checks the correctness of the DFA in the GUI.

# Install

The algorithm and web server uses Python3. The web server uses the
lask library. To install Flask, run `# pip install flask flask-restful`.

# Usage

To run the algorithm by itself, run `python eqdfa.py`. Running it
without any additional parameters outputs the syntax for how to run
the program. To run the Javascript front end, run `python webserver.py`
and then open `http://localhost:5000/index.html` in a web browser.

# DFA JSON representation

It is basically the formal description of a DFA without the state names
and the alphabet. Specifically,

    {"delta":  {name_of_state: {letter: name_of_next_state}},
     "init":   name_of_init_state,
     "accept": [set_of_accept_states]}

# EQ_DFA algorithm test cases

Two test cases are stored in the `test_cases` directory. To run a test
case, use the syntax `python eqdfa.py -S test_cases/data.json`.

# RESTful API

The API takes data sent to `/checkanswerapi/level*`, parse it as a JSON
ecoding of a DFA, and compares it to the coresponding `level*.json` file
in the root directory. See the `submitDFA` function in `/static/script.js`
for usage.

# Front end

All front end files or stored in the `static` directory.
