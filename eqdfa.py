#!/usr/bin/env python3
"""Given two DFAs, return whether or not they accept the same language.

Syntax
-s   The following parameter is a json string of a DFA
-S   The following parameter is a json string of an array of DFAs
-f   The following parameter is a file path to a json of a DFA
-F   The following parameter is a file path to a json of a DFA array
-d   Instead of outputing whether the two DFAs accept the same language,
     it outputs the shortest string that differentiates between the two
     DFAs' language if they're different, or null if they are the same.

DFA JSON encoding
It is basically the formal description of a DFA without the state names
and the alphabet. Specifically,
    {"delta":  {name_of_state: {letter: name_of_next_state}}
     "init":   name_of_init_state
     "accept": [set_of_accept_states]}"""

import json
import sys
# import pdb

def main():
    """parse input parameters and feed the json encoding of
    the DFAs into the algorithm"""

    if len(sys.argv) == 1:
        print(__doc__)
        return

    #parse input parameters
    dfas = list()
    flag = None
    flags = {"-s", "-S", "-f", "-F"}
    diff = False
    for arg in sys.argv:
        if arg == "-d":
            diff = True
        elif flag == "-s":
            dfas.append(json.loads(arg))
            flag = None
        elif flag == "-S":
            dfas.extend(json.loads(arg))
            flag = None
        elif flag == "-f":
            with open(arg, "r") as file:
                dfas.append(json.loads(file.read()))
            flag = None
        elif flag == "-F":
            with open(arg, "r") as file:
                dfas.extend(json.loads(file.read()))
            flag = None
        elif arg in flags:
            flag = arg

    if len(dfas) != 2:
        print("Error: please provide two DFAs")
        return

    #convert from json to python object
    dfas = list(map(Dfa, dfas))

    #compute EQ_DFA
    result = equal(dfas[0], dfas[1])
    #print output
    if diff:
        print(json.dumps(result))
    else:
        print(result is None)

class Dfa:
    """data representation of a deterministic finite
    autamata"""
    def __init__(self, json_obj=None):
        """constructor, if a json object is passed in,
        if will be used to generate the dfa"""
        if json_obj is not None:
            self.delta = json_obj['delta']
            self.init = json_obj['init']
            self.accept = set(json_obj['accept'])

    def complement(self):
        """creates and returns a new dfa that accepts
        the complement language"""
        new_dfa = Dfa()
        new_dfa.delta = self.delta
        new_dfa.init = self.init
        all_states = set(self.delta.keys())
        new_dfa.accept = all_states.difference(self.accept)
        return new_dfa

    def language_accepted(self):
        """returns None if the dfa's language is empty.
        returns the smallest accepted string otherwise.
        calculated by graph traversal from init state
        to accept states"""
        #pdb.set_trace()
        #a map of state -> shortest input to that state
        shortest_input = {self.init: ''}
        #set of states newly found to be reachable
        new_states = {self.init: ''}
        #while new states are found
        while new_states:
            #if a new state is in accepted states, return true
            accept_states = {
                state
                for state in new_states
                if state in self.accept
            }
            if accept_states:
                return shortest_input[accept_states.pop()]
            #get all states reachable from new_states
            new_states = {
                state: (str + input)
                for state, str in new_states.items()
                for input, state in self.delta[state].items()
                if state not in shortest_input
            }
            #add new_states into reachables
            shortest_input.update(new_states)
        #if no accepted state is found in graph search, reject
        return None


    def to_string(self):
        """convert the dfa into a string format (in json)"""
        return json.dumps(self)

def equal(dfa_a, dfa_b):
    """return true if two dfas have the same language"""
    a_inter_bnot = intersect(dfa_a, dfa_b.complement())
    b_inter_anot = intersect(dfa_b, dfa_a.complement())
    a_b_diff = union(a_inter_bnot, b_inter_anot)
    return a_b_diff.language_accepted()

def union(dfa1, dfa2):
    """given 2 dfas, return their union"""
    #compute delta and init
    new_dfa = combine(dfa1, dfa2)
    #add accept states
    new_dfa.accept = {
        state1 + ',' + state2
        for state1 in dfa1.delta.keys()
        for state2 in dfa2.delta.keys()
        if state1 in dfa1.accept
        or state2 in dfa2.accept
    }
    return new_dfa

def intersect(dfa1, dfa2):
    """given 2 dfas, return their intersection"""
    #compute delta and init
    new_dfa = combine(dfa1, dfa2)
    #add accept states
    new_dfa.accept = {
        a1 + ',' + a2
        for a1 in dfa1.accept
        for a2 in dfa2.accept
    }
    return new_dfa


def combine(dfa1, dfa2):
    """generate a new dfa with each state being the
    cartesian product of the two dfas, with ','
    separating the state names"""
    alphabet1 = set(dfa1.delta[dfa1.init].keys())
    alphabet2 = set(dfa2.delta[dfa2.init].keys())
    alphabet = alphabet1.intersection(alphabet2)

    new_dfa = Dfa()
    new_dfa.delta = {
        (state1 + "," + state2): {
            letter :
            (trans1[letter] + "," + trans2[letter])
            for letter in alphabet
        }
        for state1, trans1 in dfa1.delta.items()
        for state2, trans2 in dfa2.delta.items()
    }
    new_dfa.init = dfa1.init + ',' + dfa2.init
    return new_dfa

if __name__ == "__main__":
    main()
